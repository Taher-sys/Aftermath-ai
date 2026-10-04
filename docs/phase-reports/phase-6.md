# AFTERMATH — Phase 6 Report: Constraint & Conflict Engine
**Report Date:** 2026-10-03  
**Status:** Completed & Verified  
**Milestone:** Phase 6 — Constraint + Conflict Engine  

---

## 1. Executive Summary

Phase 6 implements the **Constraint & Conflict Engine** and the **Conflict Explorer UI** for AFTERMATH.

The engine detects logical, temporal, financial, and legal interactions between concurrent human commitments:
* **Zero Arbitrary Composite Risk Scores:** In accordance with **Directive 7**, the system produces factual, mathematical explanations for every detected conflict, rather than synthetic percentages.
* **Rigorous Epistemic Separation:** Every conflict result is broken down into four distinct epistemic tiers:
  1. **FACT:** Verbatim ground truth from source documents.
  2. **RULE:** The exact deterministic rule evaluated.
  3. **INFERENCE:** The derived legal or financial consequence on the human user.
  4. **ASSUMPTION:** The baseline or scenario assumption underpinning the evaluation.
* **Blueprint Aesthetics:** The frontend Conflict Explorer is presented in the warm precision engineering console aesthetic (`#F5F2EB`) with deep-radiused physical cards and terracotta/salmon error highlights (`#FEE2E2` / `#DC2626`).

---

## 2. Deterministic Rule Engine Architecture

```
[Active Commitments & Deontic Obligations]
                    │
                    ▼
[ConflictRuleEngine.evaluate_commitments]
  ├─ Suite 1: Temporal Sequence & Concurrency Checks
  │   ├─ Expiration preceding commencement (INVALID_SEQUENCE)
  │   └─ Concurrently active physical agreements (TEMPORAL_OVERLAP)
  ├─ Suite 2: Financial Consistency & Liquidity Checks
  │   ├─ Concurrent monthly cash drainage (RECURRING_PAYMENT_COLLISION)
  │   └─ Notice delivered without defined buyout fee (CANCELLATION_BEFORE_LOCKIN)
  └─ Suite 3: Dependency & Prerequisite Checks
      ├─ Missing prior conditions or required approvals (MISSING_PREREQUISITE)
      └─ Advance notice window deficits on early exit (INSUFFICIENT_NOTICE)
                    │
                    ▼
[Epistemic Assertion Factory (FACT, RULE, INFERENCE, ASSUMPTION)]
                    │
                    ▼
[Conflict Explorer UI (`/consequences`)]
```

---

## 3. Implemented API Endpoints & Components

* **`POST /api/v1/conflicts/evaluate?workspace_id={id}`**:
  * Evaluates all deterministic rules across active commitments, saves detected conflicts, and returns an `EvaluationResult` summary.
* **`GET /api/v1/conflicts?workspace_id={id}`**:
  * Lists all conflicts detected for the active workspace.
* **`POST /api/v1/conflicts/{id}/resolve`**:
  * Marks a conflict as `RESOLVED` or `ACKNOWLEDGED` by the user.

---

## 4. Frontend Conflict Explorer (`/consequences`)

* **Visual Blueprint Styling:**
  * Module 05.00: Precision schematic console with KPI metric blocks (`Total Conflicts Evaluated`, `Critical Conflicts`, `Resolved/Acknowledged`).
  * Severity filters: `ALL`, `CRITICAL`, `WARNING`.
  * Physical card containers with 1px borders and terracotta/salmon highlights for critical breach risks.
* **Grounded Conflict Logic Inspector:**
  * Selecting any conflict displays its step-by-step epistemic breakdown:
    * **1. GROUNDED FACT:** Exact dates, amounts, and clauses from the contract.
    * **2. DETERMINISTIC RULE:** Code block showing the logical rule evaluated (e.g. `RULE_TEMPORAL_CONCURRENCY`).
    * **3. FACTUAL INFERENCE:** Concrete liability impact on the user.
    * **4. USER ASSUMPTION:** Scenario assumptions flagged with epistemic uncertainty badges.
  * Verbatim source document quote snippet with direct citation link.

---

## 5. Automated Verification & Benchmarks

* **Backend Test Suite (`backend/tests/test_phase6_conflicts.py`):**
  * `test_conflict_engine_deterministic_rules`: **PASSED** (verifies invalid sequence, overlapping commitments, recurring cash collision, and cancellation before lock-in rules)
  * `test_conflicts_api_workflow`: **PASSED** (verifies evaluate -> list -> resolve workflow)
* **Code & Type Integrity:**
  * `pytest -v tests/test_phase6_conflicts.py`: **2/2 passed**
  * `npx eslint src`: **0 errors, 0 warnings**
  * `npx tsc --noEmit`: **0 errors**
