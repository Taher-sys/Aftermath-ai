# Changelog — AFTERMATH

All notable changes to the **AFTERMATH** project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0-rc1] - 2026-10-04 (Master Release Candidate)

### Added
- **Phase 1 (Foundation & Ingestion):**
  - Document Vault with SHA-256 binary storage and immutable version tracking.
  - Multi-format ingestion parser for PDF, DOCX, and TXT files.
  - Ingestion validator blocking active PDF JavaScript and files $> 20$ MB.
- **Phase 2 (Data Architecture & Domain Model):**
  - Modular monolith domain model (`workspaces`, `documents`, `extracted_facts`, `commitments`, `conflicts`, `scenarios`).
  - Strict typing with Pydantic v2 and SQLAlchemy 2.0 Async ORM.
- **Phase 3 (Grounding Gate & HITL Confirmation):**
  - Cryptographic Grounding Gate enforcing exact substring verification against document text.
  - Human-in-the-Loop (HITL) verification API (`ACCEPT`, `EDIT`, `REJECT`).
  - Quarantine mechanism eliminating ungrounded hallucinations.
- **Phase 4 (Frontend UI Shell & Document Inspector):**
  - Handcrafted architectural schematic console design system (`#F5F2EB` warm cream, ivory cards, 1px crisp borders).
  - Split Document Inspector with synchronized character offset highlights.
- **Phase 5 (Commitment Map & Unified Timeline):**
  - Normalized relational commitment ledger (`creates`, `requires`, `depends_on`, `conflicts_with`).
  - Multi-resolution chronological timeline (`DAY` to `YEAR`) with overlapping concurrency corridors and selective 3D spatial layer.
- **Phase 6 (Constraint & Conflict Engine):**
  - Deterministic rule engine finding temporal clashes, notice deficits, and sequence invalidities.
  - 4-tier epistemic segregation: `FACT`, `RULE`, `INFERENCE`, `ASSUMPTION`.
  - Zero arbitrary composite risk scores.
- **Phase 7 (What-If Scenario Simulation):**
  - Counterfactual simulation engine with reproducible discrete-event perturbation.
  - Decision space UI with visual scenario forking tree and before/after financial diff matrix.
- **Phase 8 (Evidence & Provenance Traceability):**
  - 6-tier provenance resolution chain: `Conclusion` $\to$ `Why?` $\to$ `Evidence` $\to$ `Source` $\to$ `Fact` $\to$ `Rule`.
  - Cryptographic audit API detecting broken references and offset drift.
- **Phase 9 (Multimodal AI & Layout Understanding):**
  - 2D table matrix extraction, form key-value descriptors, OCR scan layout blocks, and safe web content parser.
  - Bounding box normalization and SSRF/loopback attack defenses.
- **Phase 10 (ML / Deep Learning & Evaluation):**
  - 4-way comparative evaluation engine (Rule Baseline, Classical ML, Deep Sequence Model, LLM Few-Shot).
  - $4 \times 4$ obligation classification confusion matrix and failure sample taxonomy.
- **Phase 11 (Privacy, Security & Local Processing):**
  - Air-gapped local processing mode toggle (0 bytes network egress).
  - Pre-extraction PII redactor covering SSNs, IBANs, Credit Cards, Phones, and Addresses.
  - Threat defense gate blocking executables (PE, ELF, Mach-O), prompt injection vectors, and log leakage.
  - Cryptographic data purge with SHA-256 erasure receipts.
- **Phase 12 (Master Release & DevOps):**
  - Automated GitHub Actions CI workflow with matrix test suites.
  - Docker multi-stage containerization with docker-compose.
  - Comprehensive documentation suite.
