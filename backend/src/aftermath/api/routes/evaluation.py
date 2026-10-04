from typing import Any, Dict, List

from fastapi import APIRouter, Query
from pydantic import BaseModel

from aftermath.evaluation.benchmark_engine import (
    EvaluationBenchmarkEngine,
    ExperimentRecord,
    ModelArchitecture,
)

router = APIRouter(prefix="/evaluation", tags=["Evaluation & Benchmarks"])

# In-memory evaluation cache
_CURRENT_EXPERIMENT: ExperimentRecord = EvaluationBenchmarkEngine.run_multi_model_benchmark(
    random_seed=42
)


class MetricComparisonItem(BaseModel):
    model_architecture: str
    precision: float
    recall: float
    f1_score: float
    exact_match: float
    brier_score: float
    hallucination_rate: float
    latency_ms: float
    model_size_mb: float


class EvaluationComparisonResponse(BaseModel):
    experiment_id: str
    dataset_version: str
    random_seed: int
    task: str
    models_compared: List[MetricComparisonItem]


class FailureSampleItem(BaseModel):
    sample_id: str
    clause_text: str
    true_label: str
    predicted_label: str
    confidence: float
    model: str
    error_category: str
    mitigation: str


class ErrorAnalysisResponse(BaseModel):
    experiment_id: str
    total_failures: int
    failure_samples: List[FailureSampleItem]


@router.get("/experiments", response_model=Dict[str, Any])
async def list_experiments() -> Dict[str, Any]:
    """Returns metadata for all logged evaluation runs."""
    return {
        "experiments": [
            {
                "experiment_id": _CURRENT_EXPERIMENT.experiment_id,
                "dataset_version": _CURRENT_EXPERIMENT.dataset_version,
                "generation_config": _CURRENT_EXPERIMENT.generation_config,
                "random_seed": _CURRENT_EXPERIMENT.random_seed,
                "feature_version": _CURRENT_EXPERIMENT.feature_version,
                "model_version": _CURRENT_EXPERIMENT.model_version,
                "task": _CURRENT_EXPERIMENT.task.value,
                "created_at": _CURRENT_EXPERIMENT.created_at,
            }
        ]
    }


@router.post("/run-suite", response_model=Dict[str, Any])
async def run_evaluation_suite(
    seed: int = Query(default=42, description="Random seed for reproducibility"),
) -> Dict[str, Any]:
    """Executes the golden benchmark suite across Rule, ML, Deep, and LLM baselines."""
    global _CURRENT_EXPERIMENT
    _CURRENT_EXPERIMENT = EvaluationBenchmarkEngine.run_multi_model_benchmark(random_seed=seed)
    return {
        "status": "COMPLETED",
        "experiment_id": _CURRENT_EXPERIMENT.experiment_id,
        "seed": seed,
        "metrics_summary": {
            model.value: {
                "f1": m.f1_score,
                "precision": m.precision,
                "recall": m.recall,
                "latency_ms": m.inference_latency_ms,
            }
            for model, m in _CURRENT_EXPERIMENT.metrics_by_model.items()
        },
    }


@router.get("/comparison", response_model=EvaluationComparisonResponse)
async def get_model_comparison() -> EvaluationComparisonResponse:
    """Returns comparative metrics across Rule, Classical ML, Deep Learning, and LLM baselines."""
    size_map = {
        ModelArchitecture.RULE_BASELINE: 0.1,
        ModelArchitecture.CLASSICAL_ML_BASELINE: 4.8,
        ModelArchitecture.DEEP_SEQUENCE_MODEL: 28.5,
        ModelArchitecture.LLM_FEWSHOT_PROMPT: 14000.0,
    }

    items: List[MetricComparisonItem] = []
    for arch, m in _CURRENT_EXPERIMENT.metrics_by_model.items():
        items.append(
            MetricComparisonItem(
                model_architecture=arch.value,
                precision=m.precision,
                recall=m.recall,
                f1_score=m.f1_score,
                exact_match=m.exact_match,
                brier_score=m.brier_score_calibration,
                hallucination_rate=m.hallucination_rate,
                latency_ms=m.inference_latency_ms,
                model_size_mb=size_map.get(arch, 10.0),
            )
        )

    return EvaluationComparisonResponse(
        experiment_id=_CURRENT_EXPERIMENT.experiment_id,
        dataset_version=_CURRENT_EXPERIMENT.dataset_version,
        random_seed=_CURRENT_EXPERIMENT.random_seed,
        task=_CURRENT_EXPERIMENT.task.value,
        models_compared=items,
    )


@router.get("/error-analysis", response_model=ErrorAnalysisResponse)
async def get_error_analysis() -> ErrorAnalysisResponse:
    """Returns detailed error categorization and verbatim clause failure samples."""
    samples = [
        FailureSampleItem(
            sample_id=s.sample_id,
            clause_text=s.clause_text,
            true_label=s.true_label,
            predicted_label=s.predicted_label,
            confidence=s.confidence,
            model=s.model_architecture.value,
            error_category=s.error_category,
            mitigation=s.mitigation_strategy,
        )
        for s in _CURRENT_EXPERIMENT.sample_failures
    ]
    return ErrorAnalysisResponse(
        experiment_id=_CURRENT_EXPERIMENT.experiment_id,
        total_failures=len(samples),
        failure_samples=samples,
    )
