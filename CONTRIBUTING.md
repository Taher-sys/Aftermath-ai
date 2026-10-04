# Contributing to AFTERMATH

Thank you for your interest in contributing to **AFTERMATH** — the open-source Commitment & Consequence Exploration System.

AFTERMATH is a mission-critical tool used to analyze employment contracts, residential leases, debt agreements, and intellectual property transfers. We maintain high standards of code correctness, physical grounding, mathematical reproducibility, and visual excellence.

---

## 1. The Eleven Immutable Directives

All contributors must read and abide by the directives outlined in [`AGENTS.md`](./AGENTS.md):
1. **Read Architecture Before Coding:** Familiarize yourself with specifications in `docs/`.
2. **Inspect Existing Code Before Edits:** Preserve existing typing, docstrings, and context.
3. **Preserve the Handcrafted Design System:** Warm blueprint aesthetic (`#F5F2EB`, ivory cards, 1px crisp borders, deep rounded containers). No generic dark modes, glowing neon, or oversized headers.
4. **Avoid Generic AI UI & Vibe Coding:** Use dense tabular figures, split inspectors, and monospace coordinates.
5. **Avoid Unnecessary Dependencies:** Keep additions lean ($\le 50$ lines of vanilla TS/Python where possible).
6. **Test Thoroughly Before Proposing Changes:** All PRs must pass `pytest`, `ruff check`, `mypy --strict`, `npm run lint`, and `npx tsc --noEmit`.
7. **Never Fabricate Metrics or Arbitrary Risk Scores:** Subjective risk percentages are banned.
8. **Preserve Unbroken Evidence Traceability:** Every conclusion must trace back to a verifiable `SourceSpan`.
9. **Preserve Human Agency:** The system informs; it never decides or issues prescriptive life advice.
10. **Never Expose Secrets or Commit Sensitive Data:** Use scrubbed or synthetic fixtures.
11. **Update Documentation When Architecture Evolves:** Never let code and `docs/` drift.

---

## 2. Local Development Setup

### Backend Setup (Python 3.12+)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run linters and tests
ruff check src tests
ruff format --check src tests
mypy src tests
pytest -v tests
```

### Frontend Setup (Node 20+)
```bash
cd frontend
npm install
npm run lint
npx tsc --noEmit
npm run test
npm run dev
```

---

## 3. Pull Request Guidelines

1. **Create a topic branch** from `main`: `git checkout -b feature/your-feature`.
2. **Include comprehensive tests:** Unit and integration tests covering positive paths and edge cases.
3. **Run CI checks locally:** Ensure zero linter warnings and zero type errors.
4. **Update Documentation:** If you add an endpoint or domain entity, update `docs/` and `CHANGELOG.md`.
5. **Submit PR:** Clearly state the problem, proposed solution, and test evidence.
