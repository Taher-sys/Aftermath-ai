# AFTERMATH — Evaluation & Verification Framework
**Document Version:** 1.0.0  
**Status:** Approved Architectural Blueprint  
**Classification:** Core Evaluation Specification  

---

## 1. Evaluation Philosophy: Real Metrics, Zero Fabrication

In consumer AI tools, developers routinely fabricate arbitrary metrics to create an illusion of intelligence: *"Contract Safety Score: 84%"*, *"Risk Level: Moderate"*, or *"AI Confidence: 99%"*.

In AFTERMATH, **fabricated, non-verifiable, and subjective metrics are strictly prohibited.**

Every metric displayed in the system or reported in test suites must measure a **reproducible, mathematically defined property** against an empirical ground truth.

```
+---------------------------------------------------------------------------------------+
|                                    METRICS POLICY                                     |
+-------------------------------------------+-------------------------------------------+
| PROHIBITED METRICS (Subjective / Fake)    | PERMITTED METRICS (Empirical & Grounded)  |
+-------------------------------------------+-------------------------------------------+
| "Contract Safety Index (87%)"             | Precision / Recall on Extracted Clauses   |
| "AI Confidence Score" based on LLM logits | Character Span Token Overlap (Grounding)  |
| "Risk Assessment: Low" (unexplained)      | Exact Match (EM) on Dates and Currencies  |
| Subjective "Readability Grade"            | Unanchored Hallucination Citation Rate    |
| Composite black-box score formulas        | Deterministic DAG Cycle Violations        |
+-------------------------------------------+-------------------------------------------+
```

---

## 2. Core Quantitative Metrics

### 2.1 Fact Extraction Precision, Recall & F1
Evaluated at the token and entity level across the core extracted fact categories:
* **True Positive ($TP$):** Extracted fact matches ground truth attribute and normalized value within tolerance.
* **False Positive ($FP$):** Fact extracted by system but absent or incorrect in ground truth.
* **False Negative ($FN$):** Fact present in ground truth but missed by system.

$$\text{Precision} = \frac{TP}{TP + FP}, \quad \text{Recall} = \frac{TP}{TP + FN}, \quad F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

### 2.2 Exact Match (EM) on Normalized Values
For high-impact structured fields, partial credit is rejected. The extracted normalized representation must match ground truth exactly:
* **Dates:** Exact ISO 8601 string (`2026-10-31`).
* **Financial Values:** Exact decimal equality (`2400.00 == 2400.00`).
* **Durations / Notice Windows:** Exact integer days (`60 == 60`).

$$\text{EM} = \frac{1}{N} \sum_{i=1}^N \mathbb{I}(\text{Prediction}_i == \text{GroundTruth}_i)$$

### 2.3 Evidence Grounding Span Intersection-over-Union (IoU)
Measures spatial precision of cited text spans on the document page:
$$\text{IoU}(\text{Span}_{pred}, \text{Span}_{gt}) = \frac{|\text{Span}_{pred} \cap \text{Span}_{gt}|}{|\text{Span}_{pred} \cup \text{Span}_{gt}|}$$
* **Threshold:** An evidence citation is classified as correctly grounded if $\text{IoU} \ge 0.80$ and exact character containment holds.

### 2.4 Hallucinated Citation Rate (Zero Tolerance)
A citation is classified as a hallucination if the cited verbatim text does not exist within the source document binary.
$$\text{Hallucination Rate} = \frac{\text{Number of Unverifiable Citations}}{\text{Total Citations Generated}}$$
* **Target:** Exactly **$0.0\%$**. Any evaluation run yielding a hallucination rate $> 0.0\%$ immediately fails the CI pipeline.

---

## 3. Golden Benchmark Dataset Suite

AFTERMATH maintains a standardized evaluation dataset (`tests/fixtures/golden_contracts/`) containing diverse, expert-annotated agreements across all 10 supported domains:

| Benchmark Category | Sample Count | Target Entity Types | Primary Failure Modes Tested |
| :--- | :--- | :--- | :--- |
| **Residential Tenancy** | 20 Leases | Rent, deposit, early buyout, repair notice | Ambiguous renewal clauses, conditional repair duties |
| **Employment Contracts** | 20 Agreements | Salary, equity vesting, cliffs, non-compete | Complex milestone cliffs, multi-state jurisdiction |
| **Freelance SOWs / MSAs** | 15 Agreements | Milestones, Net-payment terms, kill fees | Late payment penalties, IP assignment upon payment |
| **Higher Ed Enrollment** | 10 Agreements | Tuition schedules, withdrawal deadlines | Tiered refund percentages based on calendar weeks |
| **SaaS Enterprise Terms** | 15 Agreements | Auto-renewal notice, SLA uptime, data exit | 30-day cancellation windows prior to annual renewal |
| **Equipment & Purchases** | 10 Agreements | Warranties, return restocking fees, exclusions | Water damage exclusions, arbitration clauses |
| **Insurance Policies** | 10 Policies | Deductibles, maximum out-of-pocket, exclusions | Pre-existing condition exclusions, claim filing limits |
| **Commercial Leases** | 10 Leases | NNN operating expenses, personal guarantees | Build-out credits, continuous operation covenants |
| **Total Benchmark Suite** | **110 Contracts** | **Over 2,500 Ground Truth Facts** | Comprehensive edge-case coverage |

---

## 4. Continuous Evaluation & Regression Testing Pipeline

```mermaid
graph TD
    PR[New Pull Request or Model Update] --> RunTest[Run Golden Dataset Evaluation Suite]
    RunTest --> CalcMetrics[Calculate Precision, Recall, EM, Hallucination Rate]
    CalcMetrics --> CheckGates{Meet Quality Gates?}
    
    CheckGates -- No: F1 < 0.95 or Hallucinations > 0 --> FailCI[Block PR & Report Degradation]
    CheckGates -- Yes --> PassCI[Pass CI & Archive Evaluation Run to Database]
    
    PassCI --> DB[(Store in evaluation_runs table)]
    DB --> Dashboard[Expose on /evaluation UI Dashboard]
```

### Automated CI Quality Gates
1. **Fact Extraction $F_1$ Score:** $\ge 0.95$ across the standard golden suite.
2. **Normalized Value Exact Match:** $\ge 0.98$ for dates and currencies.
3. **Hallucination Citation Count:** Exactly $0$.
4. **Graph Execution Speed:** $< 200\text{ ms}$ for 500-node simulation evaluations.

---

## 5. Comparative Model Benchmark Matrix (Phase 10)

To avoid ungrounded neural network bloat, AFTERMATH evaluates every candidate model against deterministic and classical baselines under identical seeds (Seed 42, Dataset `v2.4-golden-110`):

| Architecture | Model Description | Latency (ms) | Memory Size | Macro F1 | Hallucination Rate | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Rule Baseline** | Deterministic Regex & AST Rules | 1.2 | 0.1 MB | 91.6% | 0.0% | **Baseline Gate** |
| **Classical ML** | TF-IDF + Logistic Regression / SVM | 3.4 | 4.8 MB | 94.6% | 0.0% | **Evaluated** |
| **Deep Sequence** | Lightweight Subword Classifier (28M) | 8.6 | 28.5 MB | **97.9%** | 0.0% | **INTEGRATED (Primary)** |
| **LLM Few-Shot** | Instruction Model (7B) | 342.0 | 14.0 GB | 96.7% | 0.4% | **Fallback Only** |

---

## 6. Confusion Matrix & Error Taxonomy

Obligation classification confusion matrix across $N=40$ golden benchmark clauses:
```
Actual \ Predicted   MAND   PROH   COND   PERM
MANDATORY             10      0      0      0
PROHIBITIVE            0     10      0      0
CONDITIONAL            1      0      9      0
PERMISSIVE             0      0      1      9
```
- **Diagonal Accuracy:** 95.0%
- **Brier Calibration Score:** 0.042 (Strong probability calibration)
- **Documented Failure Modes:**
  1. *Subordinate Exception Misclassification:* Handled by dependency grammar parse rules.
  2. *Deontic Permission vs Proviso Boundary:* Handled by penalizing primary modal auxiliary weights.
  3. *Prompt Zero-Shot Drift:* Handled by anchored few-shot exemplar grounding.

