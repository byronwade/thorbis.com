# Thorbis UI & Design System — Dark‑First (Polaris‑inspired × Vercel‑minimal) — **NextFaster** Edition

**Intent:** Redo of the Thorbis design guide to codify a **dark‑mode‑first**, VIP black‑and‑white aesthetic with subtle **Thorbis Electric Blue** accents and neutral grays—
**optimized for speed via *NextFaster* baseline**: instant page transitions, aggressive prefetching, edge caching, and zero perceived loading on route changes.

> **Hard rules added:**
>
> * **No dialogs. No popovers.** Use inline patterns, pages, and tooltips instead.
> * **No loading states** for full pages or route changes. The only spinners allowed are for truly **stateful micro‑actions** (e.g., buttons committing writes, inline dropdown fetch, tiny badge refresh).
> * **Adopt shadcn/ui** components as the base kit, with Thorbis tokens and styling, and our layout/pattern rules.
> * **Polaris information architecture** + **Vercel minimalism** remain core influences.

---

## 1) Performance Doctrine — *NextFaster* Baseline

1. **Instant Navigation**

   * Use Next.js App Router with **Server Components** and **full prefetch** on all above‑the‑fold links (hover & viewport).
   * Prefer **static or ISR** pages; avoid route loaders; stream only when essential. No `loading.js` spinners for pages.
   * Cache strategy: edge + SWR for reads; invalidate precisely on writes.
2. **Zero‑Wait Pages**

   * All page shells render synchronously from cached data. If data must refresh, show the **stale value** and quietly revalidate.
   * No skeletons for full pages. Skeletons are permitted only inside **stateful widgets** (tables with infinite scroll, heavy analytics cards) and should resolve in <150ms.
3. **Hydration Budget**

   * JS per route ≤ **170KB gz** (non‑marketing). Defer/strip client JS; server‑render everything possible.
   * Avoid client effects for layout. Use CSS for animation and state where feasible.
4. **Prefetch & Priority**

   * `Link` prefetch `auto` + intersection‑based prefetching. Priority hints for critical CSS and fonts.
   * Image policies: AVIF/WebP, exact sizes, `priority` for above‑the‑fold only.

---

## 2) Design Principles

1. **Dark‑first VIP minimalism**: black/white core with neutral grays; max contrast for clarity.
2. **Electric restraint**: Thorbis Blue only for focus, primary CTA, key highlights.
3. **No overlays**: replace dialogs/popovers with **inline panels**, **dedicated pages**, or **section reveals**.
4. **Tooltips > overlays**: tooltips are the only overlay pattern—short, helpful, and accessible.
5. **Density on demand**: comfortable by default, compact for ops with one toggle.
6. **Polaris IA × Vercel calm**: structured page/frame/card layouts; quiet visuals.

---

## 3) Brand & Color System

**Thorbis Electric Blue**

* 50 `#EBF3FF`, 100 `#D6E9FF`, 200 `#ADD3FF`, 300 `#7FB8FF`, 400 `#4FA2FF`, **500 `#1C8BFF` (Primary)**, 600 `#0B84FF`, 700 `#0A6BDB`, 800 `#0A57B1`, 900 `#0A478F`

**Neutrals (dark‑friendly)**

* `gray/0 #000`, 25 `#0A0B0D`, 50 `#0D0F13`, 100 `#111318`, 200 `#171A21`, 300 `#1D212B`, 400 `#2A2F3A`, 500 `#3A4150`, 600 `#545D6E`, 700 `#7A8598`, 800 `#A9B2C1`, 900 `#E6EAF0`, white `#FFFFFF`

**Status**: Success `#18B26B`, Warning `#E5A400`, Danger `#E5484D`, Info `#4FA2FF` with dark‑safe bg/border tokens as prior spec.

**Semantic (dark‑first)**

* Backgrounds: base `gray/25`, surface `gray/50`, elevated `gray/200`
* Borders: subtle `gray/400`, strong `gray/500`, focus `blue/500`
* Text: primary `gray/900`, secondary `gray/700`, muted `gray/600`, inverse `white`
* Brand: primary `blue/600`, hover `blue/500`, active `blue/700`

**Light mapping**: base `#FFF`, surface `#F7F8FA`, elevated `#FFF`; borders lighten one step; text flips to dark palette.

**Usage rules**: Blue only for interactive states/focus/links; avoid large blue fills; prefer hairline separators.

---

## 4) Typography

* **Inter** (UI), **Geist Mono** (code/figures). Scale: Display 32/38, H1 24/30, H2 20/28, H3 18/26, Body 14/20, Small 12/18; Weights: 400/500/600.
* Truncate with tooltips (on focus/hover) for overflowing labels and table cells.

---

## 5) Layout & Spacing

* Spacing: 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64.
* Grid: 12‑col desktop (80–1040 content), 6‑col tablet, 4‑col mobile. Containers: page (1280 max), narrow (880), fluid (100%).
* Stacks: Polaris‑style Stack/Inline with consistent gaps; avoid nested cards.

---

## 6) Elevation & Motion (Overlay‑free)

* **No dialogs, no popovers.**
* Elevation: Cards are flat with subtle borders. Inline reveals use expand/collapse with caret.
* Motion: 120–240ms; out‑quad in, in‑quad out; honor reduced motion.

---

## 7) Iconography & Illustrations

* **Lucide** icons (1.5px stroke). Monochrome; active states in Thorbis Blue.
* Illustrations: line‑based, monochrome; blue highlights only.

---

## 8) Components — shadcn/ui as Base (Thorbis‑styled)

> Use shadcn components with Thorbis tokens and strict behavior. If a component is dialog/popover‑based, **replace with inline/page variant**.

| Category   | Component (shadcn base)                               | Thorbis Usage                                                        |
| ---------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| Structure  | Shell (Header + Sidenav + Workarea)                   | Dark base, razor separators, instant route nav                       |
| Navigation | Breadcrumbs, Tabs                                     | Tabs use 2px underline `blue/600`; prefetch all links                |
| Inputs     | Button, Input, Textarea, Checkbox, Radio, Switch      | Focus ring `blue/600`; loading only on Buttons when committing       |
| Selectors  | **Inline Select**, **Inline Combobox**, **Accordion** | **No popover**: dropdowns expand inline and push content             |
| Tables     | Table, DataList                                       | Sticky header; row hover `gray/100`; selected left rule `blue/600`   |
| Filter     | Chips, FilterBar (inline sheet)                       | Chips toggle inline; heavy filters reveal a section, not a modal     |
| Feedback   | Banner, Inline Alert, Toast (corner)                  | No dialog banners; toasts 4s and actionable                          |
| Tooltips   | Tooltip                                               | Primary help surface—short, high contrast, keyboard‑reachable        |
| Empty      | EmptyState                                            | Icon + H3 + 1 CTA; sample data injection allowed                     |
| Command    | **Command Page**                                      | Global Command‑K opens a **full page** (`/app/command`), not a modal |
| Upload     | Dropzone                                              | Inline drop area; progress shown in‑row                              |
| Date       | **Inline Calendar**                                   | Occupies section of the page; no popover datepicker                  |

**Density Modes**: Comfortable (default): row 44px; Compact: row 36px.

---

## 9) Patterns (Overlay‑free UX)

* **Confirmations**: Inline **Confirm Bar** anchored to the page header/footer with Before→After summary; no modal.
* **Reviews/Previews**: Inline **Preview Panel** section that renders SSR output (e.g., invoice HTML) within the page.
* **Search/Command**: dedicated route `/app/command` with keyboard shortcut; results update instantly; pressing Enter navigates.
* **Inline Dropdowns**: sections expand beneath their triggers; arrows indicate state; page scrolls, not floats.
* **Help**: pervasive tooltips with max 2 short sentences; accessible via keyboard focus.

---

## 10) Accessibility & Contrast

* All text AA minimum; AAA for small table text preferred. Focus rings 2px Thorbis Blue with 2px offset. Keyboard order mirrors visual.

---

## 11) Data Viz

* Neutral series with blue highlight for primary. Subtle grids, clear tooltips. Sparklines light with concise labels.

---

## 12) Page Archetypes (no dialogs)

* **/app (Dashboard)**: KPIs + work queue + quick actions (all inline).
* **/app/dispatch (Schedule)**: lanes, drag‑drop, side info as inline panels—never modal.
* **/app/invoices & /app/estimates**: list + detail split; actions (Send/Collect) surface inline confirm bars; preview rendered inline.
* **/app/pos & /app/pos/kds**: large targets, offline indicator; no modal order flows.
* **/app/templates**: gallery grid; compare in **two inline panes** (A/B) instead of a dialog.
* **/app/ai**: docked console; tool calls + `commands[]` preview in a fixed inline panel.

---

## 13) Tooltips — First‑Class Pattern

* Trigger on **hover and focus**; 150–250ms delay; dismiss on blur/escape.
* Dark bg `gray/200`, border `gray/500`, text `gray/900`.
* Placement smart but never covers the trigger entirely; on mobile, show as **inline help row** beneath the control.

---

## 14) Theming & Tokens

* Keep prior token categories; dark is the source of truth; light is a mapping.
* Tenant overrides limited to brand accents and certain surfaces.
* Publish token JSON for AI/component generators.

---

## 15) QA & Acceptance (UI)

* **No overlay regression**: there are **zero** dialogs/popovers in the app. Lint rule or static check required.
* **Instant nav**: all top‑level route changes TTI < 300ms on mid‑tier hardware; no page spinner.
* **Focus**: every interactive control has visible focus; tooltips appear on focus.
* **Tables**: sticky headers, compact mode ok, virtualization after 100 rows.
* **Accessibility**: keyboard‑complete; tooltip content not the only source of critical info.

---

## 16) Deliverables for Implementers

1. **Token registry JSON** (dark + light mapping).
2. **shadcn theme layer**: className conventions and Tailwind variables bound to Thorbis tokens.
3. **Inline components** replacing dialog/popover UX (Inline Select/Combobox/Calendar/Preview Panel/Confirm Bar).
4. **NextFaster playbook**: prefetch rules, cache headers, ISR windows, SSR budget, hydration targets.
5. **UI tests**: overlay‑ban rule, navigation TTI checks, tooltip accessibility tests, density toggle snapshots.

---

**End — Thorbis *NextFaster* Design Guide (dark‑first, overlay‑free, shadcn‑based).**
