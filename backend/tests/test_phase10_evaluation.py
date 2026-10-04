import pytest
from httpx import AsyncClient

from aftermath.evaluation.benchmark_engine import (
    EvaluationBenchmarkEngine,
    ModelArchitecture,
    TaskType,
)


def test_metrics_calculation_math_soundness():
    """Verifies that precision, recall, F1, and confusion matrix arithmetic is mathematically sound."""
    labels = ["A", "B"]
    y_true = ["A", "A", "B", "B"]
    y_pred = ["A", "B", "B", "B"]  # 1 false negative for A, 1 false positive for B

    metrics = EvaluationBenchmarkEngine.compute_metrics(
        y_true=y_true,
        y_pred=y_pred,
        labels=labels,
        probabilities=[0.9, 0.4, 0.8, 0.85],
    )

    # Class A: TP=1, FP=0, FN=1 -> Prec=1.0, Rec=0.5
    # Class B: TP=2, FP=1, FN=0 -> Prec=2/3=0.6667, Rec=1.0
    # Macro Prec = (1.0 + 0.6667)/2 = 0.8333
    # Macro Rec = (0.5 + 1.0)/2 = 0.7500
    assert metrics.precision == pytest.approx(0.8333, abs=1e-3)
    assert metrics.recall == pytest.approx(0.7500, abs=1e-3)
    assert metrics.exact_match == 0.75  # 3 of 4 match
    assert metrics.hallucination_rate == 0.0
    assert metrics.confusion_matrix.matrix == [[1, 1], [0, 2]]


def test_multi_model_comparative_benchmark_execution():
    """Verifies that the multi-model evaluation pipeline produces complete comparative metrics across 4 baselines."""
    record = EvaluationBenchmarkEngine.run_multi_model_benchmark(random_seed=42)

    assert record.random_seed == 42
    assert record.task == TaskType.OBLIGATION_CLASSIFICATION
    assert len(record.metrics_by_model) == 4

    # Rule baseline checks
    rule_m = record.metrics_by_model[ModelArchitecture.RULE_BASELINE]
    assert rule_m.f1_score >= 0.88
    assert rule_m.inference_latency_ms < 5.0  # Ultra fast

    # Classical ML baseline
    ml_m = record.metrics_by_model[ModelArchitecture.CLASSICAL_ML_BASELINE]
    assert ml_m.f1_score >= 0.90

    # Deep Sequence Model
    deep_m = record.metrics_by_model[ModelArchitecture.DEEP_SEQUENCE_MODEL]
    assert deep_m.f1_score >= 0.95

    # LLM baseline
    llm_m = record.metrics_by_model[ModelArchitecture.LLM_FEWSHOT_PROMPT]
    assert llm_m.f1_score >= 0.90
    assert llm_m.inference_latency_ms > 100.0  # Higher latency

    # Sample failures
    assert len(record.sample_failures) >= 3
    for s in record.sample_failures:
        assert s.clause_text
        assert s.error_category
        assert s.mitigation_strategy


@pytest.mark.asyncio
async def test_evaluation_api_endpoints(client: AsyncClient):
    """Verifies that evaluation experiments, comparison matrix, and error analysis are exposed over REST API."""
    # 1. List experiments
    exp_res = await client.get("/api/v1/evaluation/experiments")
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    assert "experiments" in exp_data
    assert len(exp_data["experiments"]) >= 1

    # 2. Get 4-way comparison matrix
    comp_res = await client.get("/api/v1/evaluation/comparison")
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert len(comp_data["models_compared"]) == 4
    models = {m["model_architecture"] for m in comp_data["models_compared"]}
    assert "RULE_BASELINE" in models
    assert "DEEP_SEQUENCE_MODEL" in models

    # 3. Get error analysis
    err_res = await client.get("/api/v1/evaluation/error-analysis")
    assert err_res.status_code == 200
    err_data = err_res.json()
    assert err_data["total_failures"] >= 3
    assert len(err_data["failure_samples"]) >= 3

    # 4. Trigger evaluation suite run
    run_res = await client.post("/api/v1/evaluation/run-suite?seed=99")
    assert run_res.status_code == 200
    run_data = run_res.json()
    assert run_data["status"] == "COMPLETED"
    assert run_data["seed"] == 99
