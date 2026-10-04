# AFTERMATH — Comprehensive Engineering Roadmap (Phases 0–12)
**Document Version:** 1.0.0  
**Status:** Approved Architectural Blueprint  
**Classification:** Strategic Engineering Plan  

---

## 1. Roadmap Overview & Phasing Principles

The engineering roadmap for AFTERMATH is structured into 13 deliberate, sequential phases (Phase 0 through Phase 12). 

Each phase represents an **independently verifiable milestone**. Phase boundaries are strictly gated: **no phase begins until the preceding phase satisfies its automated test suites, typecheck, lint, and architectural review.**

```
+----------------------------------------------------------------------------------------------------+
|                                    13-PHASE MASTER ROADMAP                                         |
+-----------------------------------+-----------------------------------+----------------------------+
| FOUNDATION PHASES                 | INTELLIGENCE & GRAPH PHASES       | SIMULATION & AUDIT PHASES  |
|  - Phase 0: Master Blueprint      |  - Phase 3: Document Ingestion    |  - Phase 6: Consequence Map|
|  - Phase 1: Core Skeleton & Infra |  - Phase 4: Fact Extraction (HITL)|  - Phase 7: Unified Timeln |
|  - Phase 2: UX & Visual 3D Engine |  - Phase 5: Commitment Graph Engine| - Phase 8: What-If Simulat|
+-----------------------------------+-----------------------------------+----------------------------+
| HARDENING & PRODUCTION PHASES                                                                      |
|  - Phase 9: Evidence & Audit Vault                                                                 |
|  - Phase 10: Evaluation & Benchmarking                                                             |
|  - Phase 11: Privacy & Local-Only Mode                                                             |
|  - Phase 12: Security Audit & Open-Source Release                                                  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Phase-by-Phase Deliverables & Verification Criteria

### Phase 0: Master Product + Architecture Blueprint (Current)
* **Objective:** Establish the unshakeable theoretical, architectural, epistemic, and visual foundation.
* **Deliverables:** Complete set of 10 architecture and domain specifications, `AGENTS.md`, `CLAUDE.md`, and master `README.md`.
* **Exit Gate:** Architectural sign-off with zero ungrounded design ambiguities.

### Phase 1: Foundation & Application Skeleton
* **Objective:** Scaffold the modular monolith backend and typed frontend application shell.
* **Deliverables:**
  * Next.js 15+ App Router frontend with responsive sidebar, top nav, workspace selector, and honest empty states for all 12 core routes.
  * FastAPI Python 3.12+ backend with async SQLAlchemy 2.0 and Alembic database migrations.
  * PostgreSQL 16+ dockerized service with initial schema.
  * Docker Compose development environment and GitHub Actions CI pipeline.
* **Verification:** `tsc --noEmit`, ESLint, Ruff, MyPy strict, Pytest baseline, and Alembic migration test passing in CI.

### Phase 2: Frontend & Visual Design System
* **Objective:** Implement the physical design tokens, typography, 8px spacing, and 3D information canvas.
* **Deliverables:**
  * Design tokens locked into CSS/Tailwind (surfaces, borders, typography, epistemic tier colors).
  * Accessible UI primitives: Button, Card, Table, Drawer, Modal, Input, Badge, Skeleton loader.
  * Three.js / React Three Fiber interactive background system with graceful canvas/SVG degradation and reduced-motion support.
  * Global Command Palette (`Cmd+K`).
* **Verification:** Visual inspection via Antigravity browser at 375px and 1440px widths; zero layout shift; WCAG 2.1 AA focus ring checks.

### Phase 3: Document Ingestion & Storage Vault
* **Objective:** Implement secure multi-format document ingestion, storage, and layout extraction.
* **Deliverables:**
  * Multi-format upload API supporting PDF, DOCX, TXT, and scanned images.
  * SHA-256 cryptographic hashing and deduplication check.
  * Sandboxed parsing worker with CPU/memory limits.
  * Document Inspector UI with split-pane PDF/text viewer and Server-Sent Events (SSE) status streaming.
* **Verification:** Automated tests handling valid files, corrupt files, oversized files (>50MB), and polyglot files without crashes.

### Phase 4: Structured Fact Extraction & HITL Verification
* **Objective:** Build constrained schema extraction with exact character-level grounding.
* **Deliverables:**
  * Pydantic extraction models for contractual terms, obligations, dates, and amounts.
  * Model provider abstraction layer supporting local and cloud models.
  * Cryptographic Grounding Gate verifying that verbatim quotes exist in source text.
  * Interactive Human-in-the-Loop review flow in Document Inspector (`Accept`, `Edit`, `Reject`).
* **Verification:** Unit tests confirming that fabricated or modified quotes are caught and quarantined with status `REJECTED_UNGROUNDED`.

### Phase 5: Commitment Graph & Dependency Engine
* **Objective:** Transform verified facts into an attributed directed graph of obligations, deadlines, and conditions.
* **Deliverables:**
  * Relational graph entities: `commitments`, `obligations`, `deadlines`, `conditions`, `financial_terms`, `dependencies`.
  * Graph builder engine assembling directed edges (`PREREQUISITE`, `CAUSAL_CONSEQUENCE`, `SUPERSEDES`).
  * Topological sorting and cycle detection via PostgreSQL recursive CTEs and Python graph algorithms.
* **Verification:** Cycle detection tests preventing infinite causal loops in contractual dependency chains.

### Phase 6: Interactive Consequence Map & 3D Visualization
* **Objective:** Visualize complex commitment dependencies and consequence chains in an intuitive graphical canvas.
* **Deliverables:**
  * Interactive node-link consequence map with zoom, pan, and filter capabilities.
  * Visual encoding of node types (Commitments, Deadlines, Penalties) and edge types (Prerequisites, Triggers).
  * Downstream path tracing: Selecting any breach event illuminates the full causal cascade.
* **Verification:** 60 FPS graph rendering performance with 500+ nodes; seamless keyboard and touch navigation.

### Phase 7: Unified Timeline & Conflict Detection Engine
* **Objective:** Synchronize all obligations onto a unified chronological horizon and run automated conflict detection.
* **Deliverables:**
  * Multi-track timeline view (Personal, Financial, Professional, Housing) with 30-60-90 day horizon markers.
  * Four automated conflict detection engines:
    1. Temporal Overlap & Exclusivity Collision
    2. Notice Period Deficit Calculation
    3. Financial Solvency Deficit
    4. Non-Compete / Restrictive Covenant Collision
  * Conflict alert drawers with direct clause citations.
* **Verification:** Synthetic multi-contract test suites accurately identifying 100% of injected temporal and restrictive covenant collisions.

### Phase 8: What-If Scenario Simulation Engine
* **Objective:** Build the core discrete-event counterfactual simulation laboratory.
* **Deliverables:**
  * Scenario configuration surface for injecting hypothetical state changes (e.g., "Resign on Day 90", "Break lease early").
  * Discrete Event Simulation (DES) engine evaluating mathematical liabilities and conditional triggers.
  * Side-by-side outcome comparison: Baseline vs. Counterfactual.
  * Step-by-step causal explanation generator linking every dollar of penalty to an exact contract clause.
* **Verification:** Mathematical unit tests verifying exact financial penalty calculations across all 8 canonical scenario archetypes.

### Phase 9: Evidence & Audit Vault
* **Objective:** Provide tamper-proof evidentiary provenance for all system assertions.
* **Deliverables:**
  * Comprehensive Evidence Dossier view linking every commitment and calculation to character offsets.
  * Exportable Markdown and PDF Audit Reports for sharing with legal counsel.
  * Cryptographic verification checks ensuring that underlying document blobs have not drifted since extraction.
* **Verification:** End-to-end audit trace test verifying that every item in an exported dossier resolves to a valid source span.

### Phase 10: Evaluation & Benchmarking Suite
* **Objective:** Implement empirical accuracy, precision, and hallucination monitoring.
* **Deliverables:**
  * 110-contract golden benchmark dataset across 10 legal and financial categories.
  * Automated benchmarking pipeline measuring Precision, Recall, Normalized Value Exact Match, and Hallucination Rate.
  * `/evaluation` UI dashboard presenting real historical model performance metrics.
* **Verification:** Golden test suite passing with $F_1 \ge 0.95$, Exact Match $\ge 0.98$, and $0$ hallucinated citations.

### Phase 11: Privacy Hardening, PII Redaction & Local-Only Mode
* **Objective:** Ensure total user data sovereignty and offline operational capability.
* **Deliverables:**
  * Automated PII redaction worker (masking SSNs, bank accounts, and names prior to cloud LLM calls).
  * Reversible local token vault.
  * 100% offline local model adapter using Ollama / local ONNX runtime.
  * One-click cryptographic workspace purge.
* **Verification:** Zero network egress verification test during local-only mode execution.

### Phase 12: Production Readiness, Security Audit & Open-Source Release
* **Objective:** Prepare the project for public open-source release and enterprise-grade deployment.
* **Deliverables:**
  * External security penetration testing and fuzzing of file parsers.
  * WCAG 2.1 AA accessibility audit.
  * Comprehensive developer documentation, setup guides, and contribution guidelines (`CONTRIBUTING.md`).
  * One-click self-hosting Docker Compose bundle and Helm chart.
* **Verification:** Clean security audit report, zero high-severity vulnerabilities, and 100% automated test coverage across core engines.
