# AFTERMATH — Phase 5 Report: Commitment Map & Unified Timeline
**Report Date:** 2026-10-03  
**Status:** Completed & Verified  
**Milestone:** Phase 5 — Commitment Map + Timeline  

---

## 1. Executive Summary

Phase 5 converts verified extracted facts into a structured **Human Commitment Model** and visualizes them through the **Commitment Map** and **Unified Chronological Timeline**.

This subsystem models human covenants rather than software architectural components:
* Entities: `Commitment`, `Obligation`, `Condition`, `Deadline`, `FinancialTerm`, `Dependency`.
* Deontic modalities: `MANDATORY`, `PROHIBITED`, `OPTIONAL`.
* Human relationships: `creates`, `requires`, `depends_on`, `expires_on`, `renews_on`, `conflicts_with`.
* Chronological horizon: 30-60-90 day normalized multi-track projection with recurring payment generation and overlapping liability corridor detection.
* Visual presentation: Strict precision engineering schematic console in warm blueprint cream (`#F5F2EB`) with deep-radiused physical cards (`rounded-2xl` / `rounded-3xl`), crisp 1px borders (`#DCD5C9`), and selective 3D spatial navigation.

---

## 2. Commitment Engine Architecture

```
[Verified Facts & Evidence Spans]
                │
                ▼
[CommitmentEngine.synthesize_from_facts]
  - Assembles Commitment root (effective & expiration dates, counterparty, law)
  - Synthesizes Obligations (duty bearer, deontic modality, remedy on breach)
  - Constructs Deadlines (recurring rent payment dates, expiration cliff, notice windows)
  - Creates FinancialTerms (amounts, currencies, frequencies: MONTHLY, ONE_TIME)
  - Generates Conditions & Dependency directed edges (creates, requires, depends_on)
                │
         ┌──────┴──────┐
         ▼             ▼
[CommitmentMapBuilder]  [TimelineBuilder]
  - Human Graph Nodes    - Chronological Event Horizon (ISO 8601 UTC)
  - Typed Directed Edges - Recurrence Generator (e.g. 1st of month payments)
  - Downstream Paths     - Overlapping Commitment Corridor Detection
```

---

## 3. Implemented API Endpoints & Components

* **`GET /api/v1/commitments/map?workspace_id={id}`**:
  * Returns graph of commitment nodes (`COMMITMENT`, `OBLIGATION`, `FINANCIAL_TERM`, `CONDITION`, `DEADLINE`) and typed directed edges (`creates`, `requires`, `depends_on`, `expires_on`, `renews_on`, `conflicts_with`).
* **`GET /api/v1/commitments/timeline?workspace_id={id}`**:
  * Computes strictly ordered chronological timeline events, recurring payment series, and identifies concurrent overlapping commitments.
* **`POST /api/v1/commitments/synthesize/{document_id}`**:
  * Bridges verified document facts directly into active human commitment records.

---

## 4. Frontend Blueprint UI Pages

1. **Commitment Ledger & Map (`/commitments`):**
   * Module 03.00: Precision schematic console with KPI metric blocks (`Active Commitments`, `Total Obligations`, `Monthly Cash Liability`, `Detected Conflicts`).
   * Dual view modes:
     * **Table Ledger:** High-impact commitment cards with commencement/expiration calipers, deontic covenants, breach remedies, and conditional exit gates.
     * **Commitment Map:** Directed relationship graph illustrating human commitment chains.
2. **Unified Timeline (`/timeline`):**
   * Module 04.00: Multi-track chronological horizon (Housing, Financial, Notice, Expiration).
   * Interactive zoom controls (`MONTH`, `QUARTER`, `YEAR`).
   * Overlapping commitment corridor alert banner (e.g. Springfield Lease + Chicago Studio concurrent liability: $3,250.00/mo).
   * Verbatim source evidence drawer with direct link to the Document Inspector.
   * Selective 3D spatial depth layer over light blueprint surface with standard 2D DOM fallback and reduced motion compliance.

---

## 5. Verification & Automated Test Results

* **Backend Tests (`backend/tests/test_phase5_commitments.py`):**
  * `test_commitment_engine_date_normalization`: **PASSED** (verifies strict ISO 8601 date parsing)
  * `test_phase5_commitment_synthesis_and_timeline_workflow`: **PASSED** (validates end-to-end commitment creation, graph map generation, strict timeline ordering, and temporal overlap detection)
* **Frontend Quality:**
  * `eslint src`: **0 errors, 0 warnings**
  * `tsc --noEmit`: **0 errors**
  * `vitest run`: **4/4 passed**
