You are the Lead Systems Architect and Principal Frontend Engineer for AFTERMATH (Commitment & Consequence Simulator). 

Read and strictly execute all development under the following project governance, engineering guidelines, architectural design rules, and 3D simulation standards. Do not deviate from these rules. First, create or update `CLAUDE.md` in the project root with the exact specification below, install all required frontend and 3D dependencies, and build the system adhering strictly to these requirements.

---

# CLAUDE.md — Coding Standards & Review Guidelines
**Project:** AFTERMATH (Commitment & Consequence Simulator)  
**Scope:** Engineering Standards, Testing Commands, and Code Review Protocol  

---

## 1. Engineering Philosophy & Core Commands

AFTERMATH maintains a high-craft, type-safe, and verifiable codebase. Every contribution is subject to strict automated verification and peer review.

### Common Development Commands

#### Backend (Python 3.12+ / FastAPI / SQLAlchemy)
```bash
# Run backend development server
uvicorn aftermath.api.main:app --host 0.0.0.0 --port 8000 --reload

# Run linter and formatting checks
ruff check .
ruff format --check .

# Automatically apply Ruff fixes
ruff check --fix .
ruff format .

# Strict typechecking with MyPy
mypy --strict src/aftermath tests

# Run all backend tests with coverage
pytest --cov=aftermath --cov-report=term-missing tests/

# Database migration commands (Alembic)
alembic revision --autogenerate -m "describe_migration"
alembic upgrade head
alembic downgrade -1
Frontend (Next.js 15+ / React 19 / TypeScript / Tailwind CSS / Three.js)
Bash
# Install core frontend packages and 3D graphics dependencies
npm install three @types/three @react-three/fiber @react-three/drei lucide-react clsx tailwind-merge

# Optional: Animation primitives for Three.js / UI interpolation
npm install maath gsap

# Run frontend development server
npm run dev

# Run TypeScript compiler typecheck
npx tsc --noEmit

# Run ESLint checks
npm run lint

# Run frontend unit & component tests
npm run test

# Build production bundle
npm run build
Full Stack / Docker Compose
Bash
# Start full local environment (Web, API, PostgreSQL, Redis)
docker compose up -d

# View container logs
docker compose logs -f api

# Stop all containers and clean volumes
docker compose down -v
2. Python Backend Coding Standards
Strict Type Annotations:

All function signatures (arguments and return types) must be explicitly typed.

Any is strictly discouraged. Use Union, Optional, Generics (TypeVar), or Pydantic models.

Enforce runtime validation via Pydantic v2 schemas for all network payloads and parser outputs.

SQLAlchemy 2.0 Async Style:

Use modern select() syntax and AsyncSession. Legacy session.query() is prohibited.

Always scope database queries with workspace tenancy:

Python
stmt = select(Commitment).where(
    Commitment.workspace_id == workspace_id,
    Commitment.id == commitment_id
)
All mutations must execute inside an explicit atomic transaction context.

Module Independence:

Ingestion parsers must never import from the API router layer.

The Simulation Engine (aftermath.simulation) must remain purely deterministic: it must never invoke external AI APIs or network endpoints.

Error Handling & Epistemic Boundaries:

Use custom, strongly typed domain exceptions (e.g., UngroundedFactError, CycleDetectedError, DocumentParseError).

Never catch generic Exception silently without structured logging and traceback capture.

3. TypeScript & Frontend Standards
Strict TypeScript:

noImplicitAny: true, strictNullChecks: true enforced in tsconfig.json.

Never use as any or @ts-ignore to silence the compiler.

Component Architecture:

Distinguish React Server Components (RSC for read-only data layout) from Client Components ('use client' for interactive controls, 3D canvases, and forms).

Keep client state minimal. Prefer URL search parameters (useSearchParams) for filters, active drawer IDs, and selected nodes.

Styling, Palette & Visual Hierarchy (Strict Anti-"Vibe-Coded" Light Theme):

Light-First Canvas: Base background must strictly use architectural light tones (bg-[#F9FBFB], bg-[#F4F6F8], or bg-[#FFFFFF]). Dark backgrounds, neon glows, and gradient hero text are forbidden.

No Glassmorphism & No Outdated Tropes: Eliminate frosted glass (backdrop-blur), heavy blur drop-shadows, floating ambient gradient blobs, and faux-cyberpunk glows. Use crisp, physical card geometry with clean, subtle neutral borders (border-slate-200 or border-zinc-300).

Disciplined Spacing & Radii: Use Tailwind CSS classes mapped strictly to the AFTERMATH design tokens (docs/ux-system.md). No arbitrary pixel values in classes (e.g., avoid p-[17px], w-[324px]). Use the disciplined 8px spacing scale (p-4, p-6, p-8). Adhere strictly to border radii constraints: rounded-sm (2px), rounded (4px), or rounded-md (6px). Never use rounded-3xl or rounded-full for cards.

Typography: Clean, editorial, and functional typography (e.g., Inter, Geist Sans, IBM Plex Mono for data/metrics). Avoid whimsical or generic vibe-coded display fonts. Headings must stay restrained in size (≤ 32px) and weight.

Interactive 3D Engine & Animation Architecture (Three.js / React Three Fiber):

Domain-Grounded 3D Visuals: Use 3D space strictly to model structural complexity (e.g., causal dependency graphs, multi-branch consequence trees, commitment balance volumes, topology nodes). 3D elements must be purposeful simulation surfaces, never decorative eye-candy.

Aesthetic 3D Integration on Light Mode: 3D canvases must render seamlessly on light backgrounds using clear ambient light, subtle directional shadows, un-blown diffuse materials (MeshStandardMaterial or MeshPhysicalMaterial with matte/clay/frosted-slate finishes), and subdued status accents (e.g., subtle indigo, warm zinc, muted amber, steel blue).

Lifecycle, Memory & Garbage Collection: Every geometry, material, and texture instantiated in Three.js must be explicitly disposed of on component unmount (geometry.dispose(), material.dispose(), texture.dispose()).

Animation Performance: Keep animations driven by requestAnimationFrame (useFrame in @react-three/fiber) performant. Never trigger React state updates inside a useFrame loop; mutate ref properties directly.

Dynamic Loading: Wrap 3D canvas components in dynamic imports with SSR disabled (dynamic(() => import(...), { ssr: false })) to eliminate hydration mismatches.

Accessibility (a11y) & Degradation:

All interactive elements must have clear keyboard focus states (focus-visible:ring-2 focus-visible:ring-indigo-500).

Provide descriptive aria-label attributes on icon-only buttons and 3D canvas control overlays.

Ensure contrast ratio ≥ 4.5:1 for all standard text against its background surface.

Fallback: When WebGL is unavailable or prefers-reduced-motion is active, provide a crisp 2D SVG/HTML graph alternative without breaking the layout.

4. Code Review Checklist (The Reviewer's Gate)
Before approving or merging any PR, verify every item on this checklist:

Correctness & Logic
[ ] Does the code solve the root problem without introducing side effects?

[ ] Are boundary conditions, empty states, and null values handled gracefully?

[ ] In simulation or financial calculations, is NUMERIC / Decimal used instead of floating point math?

Epistemic & Agency Integrity
[ ] Does the code preserve the distinction between facts, deterministic inferences, and AI interpretations?

[ ] Does every newly extracted fact link to a verified SourceSpan?

[ ] Does the interface avoid telling the user what decision they "should" make?

[ ] Are all displayed metrics mathematically defined and grounded in real evaluation data?

Design System & 3D Compliance
[ ] Does the UI adhere strictly to the light palette (crisp whites, soft slates, no dark mode by default)?

[ ] Is the design completely free of glassmorphism (backdrop-blur), floating gradient blobs, neon glows, and vibe-coded tropes?

[ ] Are typography and headings restrained (≤ 32px) and using disciplined neutral/editorial hierarchy?

[ ] Do Three.js scenes cleanly clean up all materials, textures, and geometries upon unmount?

[ ] Does the 3D canvas degrade gracefully when WebGL is unavailable or reduced-motion is requested?

Security & Privacy
[ ] Are all database queries properly scoped to workspace_id?

[ ] Are uploaded documents validated for MIME magic bytes and sanitized of active scripts?

[ ] Is PII scrubbed or quarantined prior to external cloud API dispatch?

[ ] Are secrets, private keys, and user documents strictly excluded from git tracking?

Quality & Tests
[ ] Do backend unit and integration tests achieve ≥ 85% coverage on new code?

[ ] Does ruff check, mypy --strict, and npm run lint pass with zero warnings?

[ ] Are database schema changes accompanied by reversible Alembic migration scripts?

[ ] Is documentation in docs/ updated if domain models or API endpoints were altered?