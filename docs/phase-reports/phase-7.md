# AFTERMATH — Phase 7 Report: What-If Scenario Engine & Decision Space
**Report Date:** 2026-10-03  
**Status:** Completed & Verified  
**Milestone:** Phase 7 — What-If Scenario Engine  

---

## 1. Executive Summary

Phase 7 implements the **What-If Scenario Engine** and the **Decision Space UI** for AFTERMATH.

As a core product differentiator, the scenario subsystem enables users to ask: *"What happens if...?"*
* *"What happens if I leave early?"*
* *"What happens if I miss the notice deadline?"*
* *"What happens if my payment schedule slips?"*

To prevent speculative AI hallucinations or false certainty, the engine operates on **deterministic discrete-event simulation** first. Every financial delta, notice window penalty, and covenant trigger is mathematically recomputed and explicitly traced back to the underlying contract clauses.

---

## 2. Counterfactual Simulation Architecture

```
[Baseline Contractual State]
             │
             ▼
[User Injects Hypothetical State Perturbation]
  - e.g. move_termination_date = 2027-03-31
  - e.g. notice_days_provided = 30 vs 60
             │
             ▼
[Deterministic Simulation Engine (SimulationEngine)]
  ├─ 1. Recomputes Chronological Timeline & Deadlines
  ├─ 2. Evaluates Financial Consequence Cascades:
  │     ├─ Saved future rent liabilities (+ $16,800.00)
  │     ├─ Mandatory early buyout fees (- $2,400.00)
  │     └─ Notice window deficit penalties (- $2,400.00 deposit forfeit)
  └─ 3. Generates Bitwise Reproducible Cryptographic Run Hash
             │
             ▼
[Rigorous Epistemic Partitioning]
  ├─ KNOWN FACTS: Baseline contract parameters (dates, rent rates)
  ├─ CHANGED ASSUMPTIONS: Specific variables altered by user
  ├─ DERIVED CONSEQUENCES: Deterministic mathematical outcomes
  └─ UNCERTAIN CONSEQUENCES: Extrinsic legal factors (e.g. statutory mitigation)
             │
             ▼
[Decision Space UI (`/scenarios`)]
  - Visual Scenario Forking Tree: CURRENT → WHAT IF? → Branch A / Branch B
  - Before / After Financial Diff View
```

---

## 3. Implemented API Endpoints & Components

* **`POST /api/v1/scenarios`**:
  * Creates a scenario with custom hypothetical variables.
* **`POST /api/v1/scenarios/{id}/run`**:
  * Executes deterministic counterfactual simulation and stores an immutable `SimulationRun` audit record.
* **`GET /api/v1/scenarios/{id}/compare`**:
  * Returns side-by-side comparison of baseline status quo against counterfactual consequences.

---

## 4. Frontend Decision Space (`/scenarios`)

* **Visual Blueprint Styling:**
  * Module 06.00: Precision schematic console with blueprint paneling, fine 1px charcoal and taupe borders (`#DCD5C9`), and deep-radiused physical cards (`rounded-2xl` / `rounded-3xl`).
* **Visual Scenario Forking Canvas:**
  * Displays tree topology branching from `CURRENT BASELINE` to `WHAT IF?` down to parallel alternatives (`Branch A: Compliant Early Exit` vs `Branch B: Abrupt Exit with Notice Deficit`).
  * Instant visual feedback on Net Financial Impact (`+$14,400.00` vs `+$4,800.00`).
* **Epistemic Trace of Consequences:**
  * Every outcome card specifies its impact amount and exact verbatim contract clause (e.g. `Clause 5(b): pays an early termination buyout fee equal to $2,400.00 USD`).
  * Flagged section for `UNCERTAIN CONSEQUENCES` requiring extrinsic legal confirmation.

---

## 5. Automated Verification & Benchmarks

* **Backend Test Suite (`backend/tests/test_phase7_scenarios.py`):**
  * `test_simulation_engine_reproducibility_and_counterfactuals`: **PASSED** (verifies identical outputs on identical inputs, correct penalty triggers on notice deficits, and isolation from unrelated variables)
  * `test_simulation_api_scenario_run_and_compare`: **PASSED** (verifies full API lifecycle: create -> run -> compare)
* **Code & Type Integrity:**
  * `pytest -v tests/test_phase7_scenarios.py`: **2/2 passed** in 0.17s
  * `npx eslint src`: **0 errors, 0 warnings**
  * `npx tsc --noEmit`: **0 errors**
