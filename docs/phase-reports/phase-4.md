# AFTERMATH — Phase 4 Report: Structured Fact Extraction & HITL Verification
**Report Date:** 2026-10-03  
**Status:** Completed & Verified  
**Milestone:** Phase 4 — Structured Fact Extraction & Human-in-the-Loop (HITL) Verification  

---

## 1. Executive Summary

Phase 4 implements the **Structured Fact Extraction & Human-in-the-Loop (HITL) Verification Subsystem** for AFTERMATH. 

The system transitions raw ingested document text into strongly-typed, normalized contractual facts (`BASE_RENT`, `SECURITY_DEPOSIT`, `NOTICE_PERIOD`, `EARLY_TERMINATION_FEE`, `LATE_FEE_PENALTY`, `EFFECTIVE_DATE`, `EXPIRATION_DATE`, `GOVERNING_LAW`), subject to strict physical character grounding, anti-hallucination verification, provider-agnostic model abstraction, and human review controls.

In accordance with **Directive 7 (Never Fabricate Metrics)** and **Directive 8 (Preserve Unbroken Evidence Traceability)**:
* Every extracted assertion is backed by a verifiable `RawSourceSpan` (page number, character start, character end, verbatim quote).
* Hallucinated or modified quotes are caught and quarantined with status `REJECTED_UNGROUNDED`.
* The human user retains ultimate decision agency to `ACCEPT`, `EDIT`, or `REJECT` candidate commitments before they enter downstream consequence engines.

---

## 2. Extraction & Verification Architecture

```
[Parsed Document (Page Text & Character Stream)]
                       │
                       ▼
[Stage 1: Constrained Structured Fact Extractor]
  - Multi-pattern contractual rule engine + ModelAdapter interface
  - Extracts candidate terms: Rents, Deposits, Notice Windows, Buyouts, Dates, Laws
                       │
                       ▼
[Stage 2: Deterministic Normalization Engine (FactNormalizer)]
  - Currencies: ISO 4217, frequency detection (MONTHLY, ANNUAL, ONE_TIME)
  - Dates: ISO 8601 UTC standard (YYYY-MM-DD)
  - Durations: Normalized integer calendar days (P30D, P60D)
  - Modalities: MANDATORY, PROHIBITED, OPTIONAL
                       │
                       ▼
[Stage 3: Cryptographic Grounding Gate (GroundingGate)]
  - Verifies exact substring slice: PageText[char_start:char_end] == verbatim_text
  - Whitespace-normalized slice tolerance for line wraps
  - If grounding fails: Quarantines fact with status REJECTED_UNGROUNDED
                       │
                       ▼
[Stage 4: Persistence & Initial Fact State]
  - Saves ExtractedFact with verification_status = "UNVERIFIED"
  - Generates immutable EvidenceRecord linked to DocumentVersion
                       │
                       ▼
[Stage 5: Human-in-the-Loop (HITL) Verification Gateway]
  - Document Inspector UI (`/documents/[id]`) with bidirectional spatial view
  - Actions: ACCEPT (-> VERIFIED), EDIT (-> EDITED), REJECT (-> REJECTED)
```

---

## 3. Core Modules Implemented

### Backend Modules (`backend/src/aftermath/extraction/`)

1. **`schemas.py`**:
   * `RawSourceSpan`: Strict 1-based page index, 0-based character offsets (`char_start`, `char_end`), verbatim source text.
   * `ExtractedFactCandidate`: Canonical fact key, raw value, normalized JSON dictionary, data type, confidence score, epistemic tier, extraction method.
   * `ExtractionResult`: Batch envelope linking facts to document versions.
   * `FactVerificationRequest` & `FactResponse`: REST contract for HITL review.

2. **`grounding.py` (`GroundingGate`)**:
   * Physical substring verification against source page text.
   * Raises `UngroundedSpanError` if verbatim characters do not match source offsets.
   * `evaluate_grounding`: Returns `"VERIFIED"` or `"REJECTED_UNGROUNDED"` for anti-hallucination quarantine.

3. **`normalizer.py` (`FactNormalizer`)**:
   * `normalize_currency`: Normalizes text (e.g. `"$2,400.00 USD"`) to numeric amount, ISO currency code, and frequency.
   * `normalize_date`: Parses diverse textual date formats into ISO 8601 (`YYYY-MM-DD`).
   * `normalize_duration`: Converts contractual notice periods and windows (`"sixty (60) days"`) into integer calendar days.
   * `normalize_modality`: Maps contractual verbs (`"shall"`, `"must"`, `"shall not"`, `"may"`) to canonical deontic modalities.

4. **`extractor.py` (`ContractExtractor`)**:
   * Comprehensive extractor extracting 8 core contractual clauses with zero tolerance for offset drift.

5. **`adapter.py` (`ModelAdapter` & `CloudAdapterFactory`)**:
   * Abstract interface decoupling LLM inference behind schema-enforced decoding (`extract_structured`) and explanation generation (`generate_explanation`).
   * `LocalMockAdapter`: Offline, zero-network, reproducible testing adapter.

6. **`hitl.py` (`HITLService`)**:
   * Manages state transitions for human review:
     * `ACCEPT` -> `VERIFIED`
     * `EDIT` -> `EDITED` (with updated normalized payload)
     * `REJECT` -> `REJECTED`

7. **`api/routes/facts.py`**:
   * `POST /api/v1/documents/{document_id}/versions/{version_id}/extract`: Executes grounded extraction and persists candidate facts.
   * `GET /api/v1/documents/{document_id}/facts`: Lists all extracted facts and evidence spans.
   * `POST /api/v1/facts/{fact_id}/verify`: Performs HITL review actions.

---

## 4. Frontend Document Inspector & HITL Review View

* **Route:** `/documents/[id]` ([frontend/src/app/documents/[id]/page.tsx](file:///c:/Users/taher/.gemini/antigravity/scratch/Aftermath-ai/frontend/src/app/documents/%5Bid%5D/page.tsx))
* **Split-Pane Architecture:**
  * **Left Pane (Physical Document View):** Spatial page-by-page rendering with active page tabs (`Page 1`, `Page 2`, `Page 3`) and dynamic yellow quote highlighting for the active focused fact span.
  * **Right Pane (HITL Review & Provenance):**
    * Tab 1: **Extracted Facts (8)**: Interactive cards showing Fact Key, Epistemic Tier badge, Confidence score, Normalized values, Source quote, and action buttons (`Accept`, `Edit`, `Reject`, `Focus`).
    * Tab 2: **Cryptographic Provenance**: SHA-256 Vault hash, page count, script-sanitization safety status, and 100% grounding verification.
  * **Live Status Tracking:** Real-time counters in top header (`Verified: X / 8`, `Edited: Y`, `Rejected: Z`).
  * **Inline Value Editing:** In-place input for modifying normalized numeric amounts with immediate visual status update to blue `EDITED`.

---

## 5. Automated Test Suite & Empirical Benchmarks

### 5.1 Backend Verification (`pytest`, `ruff`, `mypy`)
* **Test Suite:** 15 automated test cases across 6 test modules in `backend/tests/`:
  * `test_contract_extractor_deterministic_grounding`: **PASSED** (8+ facts extracted with 100% grounded spans)
  * `test_grounding_gate_rejects_hallucinations`: **PASSED** (UngroundedSpanError raised on manipulated text)
  * `test_quarantine_ungrounded_fabricated_facts`: **PASSED** (returns `REJECTED_UNGROUNDED` status)
  * `test_model_adapter_abstraction`: **PASSED** (schema-constrained decoding validated)
  * `test_full_extraction_and_hitl_workflow`: **PASSED** (end-to-end API test: upload -> extract -> list -> accept -> edit -> reject)
  * All 10 existing ingestion, commitment, document, health, and workspace tests: **PASSED**
* **Linter & Type Checks:**
  * `ruff check src tests`: **0 errors**
  * `ruff format src tests`: **Compliant**
  * `mypy src tests`: **Success: no issues found in 38 source files**

### 5.2 Frontend Verification (`vitest`, `eslint`, `tsc`)
* **Unit Tests (`vitest run`):** 4 tests passed across 2 suites (`app.test.tsx`, `document_inspector.test.tsx`).
* **TypeScript Compilation (`npx tsc --noEmit`):** **0 errors**
* **ESLint (`npx eslint src`):** **0 errors, 0 warnings**

### 5.3 End-to-End Browser Subagent Verification
* **Tool:** Antigravity Browser Subagent
* **Route Tested:** `http://localhost:3000/documents/doc-sample-01`
* **Actions Verified:**
  1. Loaded split-pane inspector with 8 extracted facts.
  2. Accepted `BASE_RENT` -> badge updated to green `VERIFIED`, counter updated to `Verified: 1 / 8`.
  3. Clicked `NOTICE_PERIOD` -> left pane transitioned to Page 2 and highlighted `"sixty (60) days prior written notice"`.
  4. Edited `LATE_FEE_PENALTY` from 100 to 75 -> saved edit, badge updated to blue `EDITED`, counter updated to `Edited: 1`.
* **Artifacts Generated:**
  * High-resolution desktop screenshot: `document_inspector_phase4_1791049692249.png`
  * Recorded browser session: `document_hitl_verified_1791049531000.webp`

---

## 6. Architectural Directive Compliance

| Directive | Requirement | Phase 4 Implementation & Status |
| :--- | :--- | :--- |
| **Directive 1** | Read Architecture | Adhered strictly to `docs/ai-architecture.md`, `docs/domain-model.md`, and `docs/roadmap.md`. |
| **Directive 3 & 4** | Handcrafted Visual Identity | Light-first canvas (`#F8FAFC`), 8px spacing grid, tabular numbers, zero neon glowing borders or generic SaaS cards. |
| **Directive 5** | Avoid Unnecessary Dependencies | Implemented regex extraction, normalization, and GroundingGate in $\le 50$ lines of vanilla Python each; no bloated packages. |
| **Directive 6** | Test Thoroughly | 15 backend pytest tests + 4 frontend vitest tests + strict mypy + ruff + eslint. |
| **Directive 7** | Never Fabricate Metrics | Zero arbitrary risk percentages. All values are mathematically computed and factually cited. |
| **Directive 8** | Unbroken Evidence Traceability | 100% of facts link to a physical `RawSourceSpan`. Fabrications quarantined as `REJECTED_UNGROUNDED`. |
| **Directive 9** | Preserve Human Agency | All extracted candidates require human review (`Accept`, `Edit`, `Reject`). The system never prescribes actions. |
| **Directive 11** | Update Documentation | Synchronized `docs/roadmap.md` and created Phase 4 report. |

---

## 7. Next Milestone: Phase 5 (Commitment Graph & Dependency Engine)

With Phase 4 complete, verified facts are ready to be transformed into an attributed directed graph of obligations, deadlines, and causal triggers:
* **Deliverables:** Relational graph entities (`commitments`, `obligations`, `deadlines`, `financial_terms`, `dependencies`).
* **Dependency Types:** `PREREQUISITE`, `CAUSAL_CONSEQUENCE`, `SUPERSEDES`.
* **Cycle Prevention:** Topological sorting and cycle detection algorithms.
