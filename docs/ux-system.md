# AFTERMATH — UX System & Visual Design Specification
**Document Version:** 1.0.0  
**Status:** Approved Architectural Blueprint  
**Classification:** Core UX & Design System Specification  

---

## 1. Visual Philosophy: The Serious Information Studio

AFTERMATH is an evidence-backed commitment and consequence engine for high-stakes human decisions. Its interface must project **clarity, precision, intellectual seriousness, and calm authority**.

It must **never** look like an AI-generated SaaS landing page, a crypto dashboard, or a "vibe-coded" template.

```
+---------------------------------------------------------------------------------------+
|                                    AESTHETIC DEMARCATION                              |
+-------------------------------------------+-------------------------------------------+
| PROHIBITED PATTERNS (Vibe-Coded / AI SaaS)| MANDATED PATTERNS (Serious Product Studio)|
+-------------------------------------------+-------------------------------------------+
| Neon purple/pink glowing gradients        | Subdued, monochromatic tonal surfaces     |
| Floating blurry gradient blobs            | Crisp 1px geometric borders (#E2E8F0/2D3748)  |
| Giant centered hero with gradient text    | Asymmetric, editorial typography & data   |
| Excessive glassmorphism (heavy backdrop)  | Solid, high-contrast, opaque card planes  |
| Pill-shaped badges on every element       | Rectangular or 4px-radius metadata chips  |
| Huge 48px bold Inter text everywhere      | Restrained 24-32px headings in Medium/Semi |
| Giant rounded cards (rounded-3xl)         | Strict 4px to 6px border radii (max 8px)  |
| Card spam grids repeating the same layout | Dense data tables, split panes, trees     |
| Constant decorative pulsing animations    | Purposeful micro-transitions (< 150ms)    |
| Faux 3D avatars and floating isometric cubes| Precise 3D vector coordinate projections  |
+-------------------------------------------+-------------------------------------------+
```

---

## 2. Spacing System: The Strict 8px Metric

All layout margins, paddings, gap dimensions, and heights are strictly governed by an **8px base grid** with a disciplined 7-step scale:

| Token | Dimension | Strict Application |
| :--- | :--- | :--- |
| `space-1` | **4px** | Micro-gaps between icons and labels; inline tag padding. |
| `space-2` | **8px** | Dense list item spacing; compact table cell vertical padding. |
| `space-3` | **12px** | Standard component internal padding; button vertical padding. |
| `space-4` | **16px** | Standard grid gutter; card internal padding; input padding. |
| `space-6` | **24px** | Section margins; drawer padding; header spacing. |
| `space-8` | **32px** | Major page section dividers; split pane gutters. |
| `space-12` | **48px** | Page container vertical padding; top-level layout bounds. |

*Rule:* Arbitrary values (e.g., `margin: 17px`, `padding: 23px`) are strictly rejected in code review.

---

## 3. Typographic Hierarchy & Data Typography

The typographic system utilizes **Geist** (or **IBM Plex Sans**) for UI copy and **Geist Mono** (or **IBM Plex Mono**) for tabular data, dates, currencies, and technical IDs.

```
[Display Title]   32px / 1.25 Line-Height / Medium Weight (500)
    │
[Page Heading]    24px / 1.30 Line-Height / Medium Weight (500)
    │
[Section Title]   18px / 1.35 Line-Height / Semibold Weight (600)
    │
[Body Text]       14px / 1.50 Line-Height / Regular Weight (400) - Max line width: 68ch
    │
[Metadata/Label]  12px / 1.40 Line-Height / Medium Weight (500) - Deliberate uppercase tracking
    │
[Tabular / Mono]  13px / 1.40 Line-Height / Regular Weight (400) - Tabular lining figures
```

### Typographic Invariants
1. **No Oversized Headings:** The largest heading in the application shell is capped at `32px`. Big text does not compensate for weak information architecture.
2. **Tabular Numerics:** All financial sums, dates, durations, and percentages must render with `font-variant-numeric: tabular-nums` to guarantee vertical column alignment.
3. **Restrained Heading Weights:** Use `font-medium` (500) or `font-semibold` (600). Do not use `font-black` (900) or ultra-heavy display weights.

---

## 4. Color Palette & Semantic Surfaces

The color architecture is built around deep, slate-grounded neutrals with high-contrast, muted semantic accents:

### 4.1 Neutral Scales (Dark & Light)
* **Light Canvas:** Background `#F8FAFC`, Surface `#FFFFFF`, Border `#E2E8F0`, Text Primary `#0F172A`, Text Muted `#64748B`.
* **Dark Canvas:** Background `#090D16`, Surface `#111625`, Border `#1E293B`, Text Primary `#F1F5F9`, Text Muted `#94A3B8`.

### 4.2 Semantic Accents (Strict Epistemic Coding)
* **Tier 1 / Grounded Fact:** Muted Sage Green (`#10B981` / Dark `#059669`). Used exclusively when an assertion has character-level source verification.
* **Tier 2 / Extracted Fact:** Steel Blue (`#3B82F6` / Dark `#2563EB`). Used for structured facts awaiting user confirmation.
* **Tier 3 / Deterministic Rule:** Muted Indigo (`#6366F1`). Used for mathematical consequences and calendar calculations.
* **Tier 4 / User Scenario Assumption:** Violet Slate (`#8B5CF6`). Indicates a hypothetical state perturbation.
* **Tier 5 / AI Interpretation:** Warm Ochre (`#F59E0B`). Explicitly flags probabilistic clause parsing.
* **Tier 6 / Conflict & Breach Warning:** Crimson Terracotta (`#EF4444` / Dark `#DC2626`). Indicates a temporal collision, notice deficit, or financial breach. *Never use bright neon magenta or neon red.*

---

## 5. Three.js / R3F Subsystem: 3D as Information Geometry

In AFTERMATH, 3D graphics are **not a decorative gimmick** or a virtual reality room. 3D is a **visual language for high-dimensional information geometry**.

```
           [3D Information Canvas]
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
[Decision Space]            [Branching Paths]
  Subtle coordinate space     Interactive consequence
  visualizing multi-factor    trajectories flowing through
  trade-offs (Time vs Cost    time milestones
  vs Risk)
```

### 5.1 Three.js Operating Guidelines
1. **Subtle & Backgrounded:** The 3D canvas sits behind data layers or in dedicated visualization drawers. It never obscures readable text or tabular figures.
2. **Performance Budget:** 
   * Maximum 5,000 vertices on screen.
   * Frame rate locked to 60 FPS on desktop, 30 FPS on mobile.
   * Automatic render loop throttling: When the user is not actively interacting or when the browser tab is blurred, the Three.js RAF (`requestAnimationFrame`) loop drops to 0 FPS (static render).
3. **Graceful Fallback:** If WebGL is unavailable or if the user enables `prefers-reduced-motion: reduce`, the 3D canvas is replaced with an elegant, deterministic SVG or canvas 2D vector coordinate graph.
4. **Camera Motion:** Slow, damped orbital or panning transitions. Zero sudden rotations or dizzying zoom effects.

---

## 6. Component Quality Standards & Keyboard Navigation

Every interactive component in AFTERMATH must satisfy seven mandatory criteria:
1. **Default State:** Clean, solid surface with subtle 1px border.
2. **Hover State:** Crisp border illumination (`border-slate-400` / `border-slate-600`), zero layout shifts.
3. **Focus State:** 2px high-contrast focus ring (`ring-2 ring-indigo-500 ring-offset-2`). Full keyboard access via `Tab`, `Shift+Tab`, `Enter`, `Space`.
4. **Active/Pressed State:** 1px subtle inward translation or darker background tint.
5. **Loading State:** Monochromatic skeleton loader matching exact dimensions; no jumping spinners.
6. **Disabled State:** Opacity 40%, `cursor-not-allowed`, zero hover triggers.
7. **Error State:** Crisp terracotta border with unambiguous text error message below the component.

### Global Command Palette (`Cmd+K` / `Ctrl+K`)
* The system provides a ubiquitous command palette allowing users to jump directly to any document, run a scenario, search commitments by keyword, or toggle privacy settings without touching the mouse.
