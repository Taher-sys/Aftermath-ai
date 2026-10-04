# AFTERMATH — Product Specification
**Document Version:** 1.0.0  
**Status:** Approved Architectural Blueprint  
**Classification:** Core System Specification  

---

## 1. Executive Summary & Vision

**AFTERMATH** is an open-source, AI-powered commitment and consequence exploration system. It exists to solve a fundamental asymmetric information crisis in everyday human decision-making: **people routinely enter binding legal, financial, and life commitments without understanding what they are actually agreeing to or what will happen if circumstances change.**

When a person receives a job offer, signs a lease, agrees to university enrollment terms, takes on freelance commitments, signs a SaaS contract, or purchases an insurance policy, they are presented with dense, fragmented, and conditional text designed by institutional lawyers. Traditional tools offer only two extremes:
1. **Unassisted manual reading**, which fails due to human fatigue, complex cross-referencing, and hidden conditional logic.
2. **Generic LLM summarization**, which hallucinates, provides false reassurance, elides critical deadlines and penalty clauses, and outputs hand-wavy "risk scores" with zero epistemic backing.

AFTERMATH introduces an entirely new category: **an evidence-backed consequence exploration system**. It ingests semi-structured and structured commitments, extracts deterministic facts with character-level source grounding, builds an explicit dependency and commitment graph, and allows the user to simulate real-world "what-if" counterfactual scenarios (e.g., *"What happens if I break my lease 4 months early?", "What happens if my employer changes my remote status?", "What happens if a client payment is delayed by 45 days?"*).

---

## 2. Product Positioning: The Demarcation Line

To preserve safety, legal compliance, and technical integrity, AFTERMATH is strictly bounded by what it **is** and what it **is not**.

```
+-----------------------------------------------------------------------------------+
|                                  AFTERMATH                                        |
+-----------------------------------------+-----------------------------------------+
|                WHAT IT IS               |              WHAT IT IS NOT             |
+-----------------------------------------+-----------------------------------------+
| An evidence-backed consequence engine   | A generic chatbot or conversational bot |
| A deterministic commitment graph builder| A generic PDF / document summarizer     |
| A multi-scenario simulation laboratory  | A legal advice system or virtual lawyer |
| An epistemic uncertainty visualizer     | A financial advice or investment engine |
| A verifiable source-to-finding audit map| A naive RAG vector-search demo          |
| A human agency amplifier                | An automated decision maker             |
| An explicit dependency & conflict solver| An arbitrary 1-100 "Contract Risk Score"|
+-----------------------------------------+-----------------------------------------+
```

### 2.1 The Anti-Advice Principle & Human Agency
AFTERMATH does not tell the user: *"You should sign this lease"* or *"Reject this job offer."* Such prescriptive outputs usurp human autonomy and violate legal boundary conditions. 

Instead, AFTERMATH provides:
* **The Facts:** What does the document explicitly state?
* **The Obligations:** What actions are legally or contractually mandated?
* **The Deadlines:** What are the temporal milestones and triggers?
* **The Conditions & Penalties:** What happens if condition $X$ fails or obligation $Y$ is breached?
* **The Conflicts:** Does commitment $A$ collide with pre-existing commitment $B$?
* **The Counterfactuals:** If you execute scenario $S$, what is the deterministic sequence of downstream events, and where does legal or commercial uncertainty remain?

The user retains complete, uncompromised agency.

---

## 3. Epistemic Status & Grounding Framework

In high-stakes domains (employment, housing, debt, education, intellectual property), confusing a machine guess with a verified fact can lead to catastrophic life outcomes. 

AFTERMATH enforces an immutable **6-Tier Epistemic Taxonomy** across all data, calculations, and UI displays:

```
[Tier 1: Source Fact]
       │  (Character span verbatim from document)
       ▼
[Tier 2: Extracted Fact]
       │  (Normalized entity: e.g., "$2,500/month", "30-day notice", "Non-compete 12mo")
       ▼
[Tier 3: Deterministic Inference]
       │  (Mathematical / logical rule: e.g., Total 12-mo rent = $30,000; Notice deadline = LeaseEnd - 60d)
       ▼
[Tier 4: Scenario Assumption]
       │  (User-introduced hypothesis: e.g., "I resign on Day 120", "Client pays on Net-60 instead of Net-30")
       ▼
[Tier 5: AI Interpretation / Hypothesis]
       │  (Probabilistic parsing of ambiguous clauses: e.g., "Clause 14.2 likely implies IP assignment of side projects")
       ▼
[Tier 6: Epistemic Uncertainty]
          (Flagged ambiguity: Unclear jurisdiction, contradictory terms, missing definitions)
```

### Epistemic Display Rules
1. **Never conflate Tier 5/6 with Tier 1/2.** In the UI, any AI interpretation must carry a distinct visual badge, an explicit explanation of why it is an interpretation, and the exact textual basis.
2. **Every fact must link to a Source Anchor.** A click on any obligation, deadline, or financial figure in the UI must immediately highlight the exact document, page number, and bounding box or character range.
3. **No Unanchored Findings.** If a finding cannot be traced to a Tier 1 source fact or an explicit Tier 4 user assumption, it is discarded.

---

## 4. Supported Commitment Domains & Document Types

AFTERMATH is engineered to ingest, cross-reference, and simulate documents across ten foundational domains:

| Domain | Exemplar Documents | Primary Extracted Dynamics | Common Simulation Queries |
| :--- | :--- | :--- | :--- |
| **Residential Tenancy** | Leases, sublease agreements, guarantor riders, HOA bylaws | Rent schedule, security deposit refund terms, early termination penalty, maintenance duties, subletting rules | *"What if I break my lease at Month 7?", "What if the landlord fails to repair water damage within 14 days?"* |
| **Employment** | Offer letters, employment agreements, equity grants, non-competes, IP assignments | Base salary, bonus vesting conditions, cliff dates, restrictive covenants, notice periods, termination for cause | *"What if I launch an open-source tool on weekends?", "What if I resign before my 1-year cliff?"* |
| **Freelance & Services** | Master Services Agreements (MSA), Statements of Work (SOW), NDAs | Payment terms (Net-30/60), kill fees, revision limits, deliverable milestones, IP transfer upon payment | *"What if the client delays feedback by 3 weeks?", "Can I reuse this codebase for another client?"* |
| **Higher Education** | Enrollment agreements, tuition payment plans, scholarship stipulations | Minimum GPA maintenance, withdrawal refund schedule, credit transferability, residency requirements | *"What if I withdraw in Week 4?", "What if my GPA drops to 2.9?"* |
| **Software & Subscriptions** | SaaS enterprise agreements, annual auto-renewing terms of service | Price escalator clauses, cancellation notification windows, data retention post-termination, SLA credits | *"What is the exact window to cancel before auto-renewal?", "What are our remedies if downtime exceeds 4 hours?"* |
| **Financial & Debt** | Personal loan agreements, promissory notes, car financing, installment terms | APR, compounding frequency, grace periods, default acceleration triggers, late fee schedules | *"What if I pay an extra $200 principal monthly?", "What happens on Day 31 of a missed payment?"* |
| **Equipment & Purchase** | Purchase contracts, warranty policies, vehicle purchase agreements | Return windows, restocking fees, lemon-law dispute arbitration, coverage exclusions | *"Does water damage void the complete warranty or only the logic board?"* |
| **Insurance Policies** | Health, property, renter's, professional liability policies | Deductibles, co-pays, exclusions, prior authorization mandates, claim submission deadlines | *"What is my out-of-pocket exposure if a pipe bursts?", "How long do I have to file a claim after incident?"* |
| **Commercial Leasing** | Office/retail leases, triple net (NNN) leases, personal guarantees | Operating expense reconciliations, build-out allowances, personal liability ceilings, restoration obligations | *"What are my ongoing liabilities if the business dissolves in Year 2?"* |
| **Partnership & Small Business** | Operating agreements, vesting schedules, buy-sell agreements | Voting thresholds, deadlocks, drag-along / tag-along rights, capital call obligations | *"What happens if my co-founder stops contributing full-time?"* |

---

## 5. The 11 Core Output Transformations

The engine transforms unstructured inputs into 11 interconnected, queryable structures:

1. **Structured Facts:** Atomic, verified propositions extracted from the text (e.g., `MonthlyRent = 2400 USD`, `NoticePeriod = 60 days`).
2. **Obligations:** Modal duties assigned to an identified party (e.g., `Party: Tenant`, `Duty: Must maintain renter's insurance with $100k liability`, `Modality: MANDATORY`).
3. **Dates & Temporal Bounds:** Hard dates, relative triggers, recurring frequencies, and expiration windows.
4. **Financial Commitments:** Fixed liabilities, variable liabilities, deposits, escrow, penalties, interest, and indemnification caps.
5. **Dependencies:** Causal and procedural prerequisites (e.g., *Deposit refund depends on key return AND condition report submission within 72 hours*).
6. **Conditions:** Boolean and threshold gates that activate or terminate obligations (e.g., *If tenant defaults on rent > 10 days, Landlord may accelerate full balance*).
7. **Exit Constraints:** Financial, temporal, and procedural costs required to terminate the agreement legally.
8. **Timelines:** A synthesized, chronologically ordered sequence of obligations, renewal windows, cliffs, and review points.
9. **Potential Conflicts:** Multi-document contradictions, overlapping time commitments, non-compete vs moonlighting overlaps, or budget shortfalls.
10. **What-If Scenarios:** Branching counterfactual simulations evaluating alternative futures, altered variables, and breach conditions.
11. **Evidence-Backed Explanations:** Step-by-step causal explanations where every assertion cites the exact underlying contract clause and logical inference rule.

---

## 6. Functional Page-by-Page Specifications

AFTERMATH is composed of 12 distinct functional surfaces:

### 6.1 Landing Page (`/`)
* **Purpose:** High-impact editorial introduction to the system's thesis and visual language.
* **Key Components:**
  * Interactive 3D Decision-Space background (subtle geometric coordinate space reflecting decision branches; degrades gracefully to WebGL/Canvas 2D or SVG).
  * Direct commitment-testing playground (sample pre-loaded agreements: e.g., "Tech Job Offer vs. Moonlighting Lease").
  * Clear positioning statement ("Not legal advice. Evidence-backed consequence exploration.").
  * Zero marketing fluff or generic SaaS card grids.

### 6.2 Workspace Overview (`/dashboard` or `/workspace`)
* **Purpose:** Command center summarizing active commitments, upcoming critical dates, cross-document conflicts, and recent simulation runs.
* **Key Components:**
  * Active Commitment Matrix (sorted by urgency and domain).
  * 30-60-90 Day Critical Horizon (deadlines with financial/legal exposure).
  * Cross-Document Conflict Alerts (e.g., "Lease Notice Deadline coincides with Job Start Relocation Date").
  * Quick Actions: Ingest Document, Run Counterfactual Scenario, Export Evidence Dossier.

### 6.3 Documents Vault (`/documents`)
* **Purpose:** Ingestion, storage, versioning, and status monitoring of source files.
* **Key Components:**
  * Secure Drag-and-Drop Ingestion (PDF, DOCX, TXT, PNG/TIFF images).
  * Document Metadata Grid: SHA-256 hash, upload timestamp, page count, parser status (`Uploaded`, `Processing`, `Processed`, `Failed`).
  * Version History Tree (tracking amendments, addenda, and revised offer letters).
  * Document Privacy Mode selector (Standard Cloud vs. Local-Only / Ephemeral).

### 6.4 Document Intelligence & Inspector (`/documents/[id]`)
* **Purpose:** Deep clause inspection and text-to-fact alignment viewer.
* **Key Components:**
  * Split-pane interface: High-fidelity document viewer (left) and Extracted Clause Tree (right).
  * Synchronized Bounding-Box Highlighting: Clicking any extracted clause scrolls the document directly to the exact page and paragraph.
  * Epistemic Confidence Badges (green: deterministic regex/parser; amber: LLM extraction requiring review; red: ambiguous / disputed term).
  * In-line Human Verification flow: `Accept`, `Edit Value`, `Reject Fact`.

### 6.5 Commitments Ledger (`/commitments`)
* **Purpose:** A structured, filterable database of all active obligations across all documents.
* **Key Components:**
  * Filter by: Party (Self vs. Counterparty), Modality (Mandatory, Conditional, Prohibited), Financial Impact, Domain.
  * Deep details drawer displaying: Governing Clause, Penalty for Breach, Associated Deadlines, Linked Dependencies.
  * Manual Commitment Entry (for agreements where source documents are confidential or verbal).

### 6.6 Consequence Map (`/consequences`)
* **Purpose:** Interactive graphical visualization of causal relationships between commitments, obligations, and penalties.
* **Key Components:**
  * Node-link dependency graph (built on WebGL / Canvas / SVG).
  * Visual encoding:
    * Nodes: Events, Obligations, Milestones, Penalties.
    * Edges: Causal dependencies (`depends_on`), Triggers (`activates_if`), Conflicts (`conflicts_with`).
  * Filter paths by impact (Financial, Temporal, Operational, Legal).
  * Path tracing: Select an event (e.g., "Miss Rent Payment") to illuminate the entire downstream consequence chain.

### 6.7 Unified Timeline (`/timeline`)
* **Purpose:** Chronological projection of all milestones, notice windows, cliffs, and recurring cycles across all workspace commitments.
* **Key Components:**
  * Multi-track timeline (Personal, Professional, Financial, Housing).
  * Dynamic zoom: 1-month, 1-year, multi-year overview.
  * Critical Window Highlighting: Inactive cancellation periods where failure to act triggers automatic renewal.
  * Calendar integration export (`.ics` / WebCal standard).

### 6.8 What-If Scenarios & Simulator (`/scenarios`)
* **Purpose:** The core simulation engine surface for testing counterfactual assumptions.
* **Key Components:**
  * Scenario Builder: Choose baseline commitments, inject state changes (e.g., change income, terminate contract early, miss milestone).
  * Side-by-Side Comparator: Baseline Outcome vs. Counterfactual Outcome.
  * Consequence Breakdown: Financial delta, penalty incurred, notice days required, residual liabilities, disputed clauses.
  * Causal Trace: Step-by-step logic detailing why an outcome occurred based on contract clauses.

### 6.9 Evidence & Audit Vault (`/evidence`)
* **Purpose:** Complete evidentiary provenance inspection for all system assertions.
* **Key Components:**
  * Comprehensive Evidence Table: Assertion $\rightarrow$ Source Document $\rightarrow$ Exact Character Span $\rightarrow$ Parser Version $\rightarrow$ Human Verification Log.
  * Exportable PDF/Markdown "Evidence Dossier" for sharing with attorneys, advisors, or counterparties.
  * Cryptographic integrity checks verifying that underlying documents have not been modified post-extraction.

### 6.10 Evaluation & Benchmarking (`/evaluation`)
* **Purpose:** Empirical accuracy, precision, and hallucination monitoring for the AI extraction pipeline.
* **Key Components:**
  * Golden Dataset Benchmark dashboard (standard test contracts with human ground truth).
  * Performance metrics: Precision, Recall, F1 for fact extraction; Exact Match on financial/date normalization; Zero-Tolerance Hallucination Rate.
  * Model drift and prompt revision comparison charts.
  * No arbitrary "AI Safety" percentages—only real, measurable extraction metrics.

### 6.11 Privacy & Redaction Center (`/privacy`)
* **Purpose:** Fine-grained data protection, PII masking, and local processing controls.
* **Key Components:**
  * PII Detection & Anonymization rules (Names, SSNs/Tax IDs, Bank Accounts, Phone Numbers, Addresses).
  * Processing Mode Switcher: Local-Only (via ONNX/Ollama) vs. Cloud LLM with sanitized tokens.
  * Workspace Data Purge: One-click cryptographic erasure of documents, embeddings, and extracted graphs.
  * Zero-Persistence toggle for ephemeral simulation sessions.

### 6.12 Workspace Settings & Integrations (`/settings`)
* **Purpose:** Workspace configuration, team/family member access, API keys, and notification preferences.
* **Key Components:**
  * Model Provider Configuration (Custom API keys for Gemini, Anthropic, OpenAI, or local endpoints).
  * Currency and Locale preferences (default currencies, date formats: ISO 8601 enforced).
  * Role-based workspace sharing (Viewer, Editor, Owner).
  * Webhook and notification endpoints for deadline alerts.

---

## 7. Success Criteria & Non-Functional Requirements

1. **Extraction Precision:** $\ge 98\%$ on structured fields (dates, currencies, durations) against ground truth test sets.
2. **Zero Unanchored Assertions:** $100\%$ of facts and consequence links must point to a specific document span or explicit user assumption.
3. **Low-Latency Simulation:** Counterfactual consequence calculations must resolve in $< 200\text{ ms}$ for graphs with $< 500$ nodes.
4. **Security & Sandboxing:** Zero execution of untrusted files; strict PII isolation; zero training on user documents.
5. **Accessibility & Design:** WCAG 2.1 AA compliance, full keyboard navigability, zero reliance on decorative animations for core utility.
