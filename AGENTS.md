# AGENTS.md — Instructions for Autonomous AI Coding Agents
**Project:** AFTERMATH (AI-Powered Commitment & Consequence Simulator)  
**Authority:** Mandatory Architectural Directives  

---

## Welcome, Agent. Read This First.

You are pair programming on **AFTERMATH**, a mission-critical open-source commitment and consequence exploration system. The code you write directly impacts how human beings evaluate life-altering decisions: employment contracts, residential leases, debt agreements, and intellectual property transfers.

Any casual sloppy coding, hallucinated metrics, generic UI templates, or ungrounded inferences violate the core mission of this project.

You are bound by the following **Eleven Immutable Directives**.

---

## 1. Read Architecture Before Coding
* **Rule:** Before creating or modifying code in any module, you **MUST** read the relevant specification document in `docs/`:
  * System Architecture: [`docs/architecture.md`](file:///c:/Users/taher/.gemini/antigravity/scratch/Aftermath-ai/docs/architecture.md)
  * Domain Model: [`docs/domain-model.md`](file:///c:/Users/taher/.gemini/antigravity/scratch/Aftermath-ai/docs/domain-model.md)
  * Database Schema: [`docs/data-model.md`](file:///c:/Users/taher/.gemini/antigravity/scratch/Aftermath-ai/docs/data-model.md)
  * AI & Extraction Pipeline: [`docs/ai-architecture.md`](file:///c:/Users/taher/.gemini/antigravity/scratch/Aftermath-ai/docs/ai-architecture.md)
  * Simulation Engine: [`docs/simulation-model.md`](file:///c:/Users/taher/.gemini/antigravity/scratch/Aftermath-ai/docs/simulation-model.md)
  * Security & Threat Model: [`docs/security-model.md`](file:///c:/Users/taher/.gemini/antigravity/scratch/Aftermath-ai/docs/security-model.md)
  * UX & Visual System: [`docs/ux-system.md`](file:///c:/Users/taher/.gemini/antigravity/scratch/Aftermath-ai/docs/ux-system.md)
  * Evaluation & Benchmarks: [`docs/evaluation.md`](file:///c:/Users/taher/.gemini/antigravity/scratch/Aftermath-ai/docs/evaluation.md)
  * Master Roadmap: [`docs/roadmap.md`](file:///c:/Users/taher/.gemini/antigravity/scratch/Aftermath-ai/docs/roadmap.md)
* **Never assume or guess architectural patterns.** Adhere strictly to the established modular monolith boundaries.

---

## 2. Inspect Existing Code Before Edits
* **Rule:** Always inspect the target file, its tests, and its importing modules before proposing or executing changes.
* **Preserve Context:** Preserve all existing docstrings, typing annotations, and comments that are unrelated to your immediate edit.
* **Check Linters & Types:** Verify how types are exported and imported across boundaries.

---

## 3. Preserve the Handcrafted Design System
* **Rule:** The visual identity is **"serious product studio + sophisticated information visualization"**.
* **Strictly Prohibited:**
  * No generic centered SaaS hero layouts.
  * No neon glowing borders (purple/pink/cyan).
  * No excessive glassmorphism or blurry floating gradient blobs.
  * No oversized decorative typography (cap headers at 32px; use medium/semibold weights).
  * No arbitrary Tailwind spacing classes. Adhere strictly to the 8px scale: `space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-6` (24px), `space-8` (32px), `space-12` (48px).
  * No rounded cards with `rounded-3xl` or `rounded-full` cards. Border radii are strictly 4px to 6px (max 8px).
* Every interactive component must have deliberate `hover`, `focus` (keyboard accessible), `loading`, `disabled`, and `error` states.

---

## 4. Avoid Generic "AI-Generated" UI & Vibe Coding
* **Rule:** Do not create card spam grids where every feature is an identical rounded card. Use dense data tables, tree hierarchies, split inspection panes, and precise tabular figure alignment (`font-variant-numeric: tabular-nums`).
* 3D (Three.js/R3F) is an information visualization canvas, not a video game. It must degrade gracefully to 2D SVG/canvas and respect `prefers-reduced-motion`.

---

## 5. Avoid Unnecessary Dependencies
* **Rule:** Do not install npm or Python packages on a whim.
* Before adding any third-party dependency, verify:
  1. Can this be implemented cleanly in $\le 50$ lines of vanilla TypeScript or Python?
  2. Does it introduce massive transitive dependencies or security vulnerabilities?
  3. Does it duplicate functionality already provided by Next.js, React, Tailwind, FastAPI, Pydantic, or SQLAlchemy?
* Explicitly prohibited: heavy UI component kits with built-in styling, unvetted PDF scrapers, or proprietary cloud SDKs when an open interface exists.

---

## 6. Test Thoroughly Before Claiming Completion
* **Rule:** Never say *"I have completed the task"* without running the relevant automated test suites and linters:
  * Backend: `pytest`, `ruff check`, `mypy --strict`.
  * Frontend: `npm run lint`, `npm run test`, `npx tsc --noEmit`.
* If you create a new feature, you **MUST** create the corresponding unit and integration tests. No untested code enters the repository.

---

## 7. Never Fabricate Metrics or Arbitrary Risk Scores
* **Rule:** Fabricated metrics (e.g., *"Contract Safety: 84%"*, *"Risk Level: Moderate"*, or synthetic confidence numbers) are strictly banned.
* Metrics must be mathematically defined, reproducible, and evaluated against ground truth data (Precision, Recall, Exact Match, Hallucination Rate).
* Risk in AFTERMATH is represented by **specific, factual breach conditions**, not arbitrary composite scores.

---

## 8. Preserve Unbroken Evidence Traceability
* **Rule:** Every assertion, extracted fact, obligation, or calculated penalty must trace back to a verifiable `SourceSpan` (document, page, character start/end, verbatim text) or an explicit user scenario assumption.
* Never allow an LLM response to become unexplained, ungrounded truth. If a model output cannot be verified against the source text, it must be quarantined.

---

## 9. Preserve Human Agency
* **Rule:** The product informs; it never decides.
* Under no circumstances should the system output prescriptive directives like: *"You should terminate this lease"* or *"Sign this employment contract."*
* The system explains facts, obligations, deadlines, mathematical consequences, and epistemic uncertainty. The human user retains 100% agency over all decisions.

---

## 10. Never Expose Secrets or Commit Sensitive Data
* **Rule:** Never commit `.env` files, API keys, private certificates, or real user legal documents into git.
* Use environment variable templates (`.env.example`).
* All document test fixtures must use synthetic, scrubbed, or explicitly public domain sample agreements.

---

## 11. Update Documentation When Architecture Evolves
* **Rule:** If you modify an API schema, add a domain entity, adjust database tables, or update configuration flags, you **MUST** simultaneously update the relevant documentation in `docs/`.
* Code and documentation must never drift apart.
