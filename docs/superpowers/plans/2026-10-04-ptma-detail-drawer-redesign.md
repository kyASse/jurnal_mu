# SINTA PTMA Detail Drawer Redesign & Radar Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `PtmaDetailDrawer.tsx` from its current flat, repetitive 2-column grid into a high-end, tactile scorecard with Doppelrand hero cards, thematic metric bento grouping, and an interactive 6-axis "Research Fingerprint" Radar Chart.

**Architecture:** 
1. Upgrades the slide-over drawer surface with layered elevation, subtle Muhammadiyah gradient accents, and sticky header/footer with glassmorphism blur.
2. Incorporates a standalone Recharts Radar Chart (`ChartContainer`, `RadarChart`, `PolarGrid`, `PolarAngleAxis`, `Radar`, `ChartTooltip`) displaying a 6-axis research profile (Scopus, Garuda, WoS, HKI, Riset, Pengabdian) normalized to reveal the campus's unique research footprint.
3. Groups the 14 raw metric indicators into 3 structured thematic bento modules (Global Publications & Citations, National Publications & IPR, Research Resources & Academic Faculty) with tabular numbers and distinct visual hierarchy.

**Tech Stack:** React 18, Tailwind CSS v4 design tokens (`resources/css/app.css`), Recharts via shadcn `@/components/ui/chart`, Lucide Icons, Vitest, Inertia.js.

**Spec:** Redesign audit from `redesign-existing-projects` and User Selection (Option B: Standalone Radar Chart Research Fingerprint).

## Global Constraints
- Strictly adhere to `resources/css/app.css` design tokens: `var(--chart-1)` (Muhammadiyah Navy), `var(--chart-2)` (Maroon), `var(--chart-3)` (Gold/Accent), `bg-card`, `text-card-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`.
- No hardcoded arbitrary emerald or zinc hex colors.
- Maintain existing drawer behavior: ESC key listener, outside backdrop click close, body scroll locking, and query-param deep link copying (`campus={code}`).
- Responsive and accessible: `aria-modal="true"`, `role="dialog"`, `aria-labelledby`, proper focus rings.
- Zero broken TypeScript types (`npm run types` passes).
- All Vitest and PHPUnit tests must pass 100%.

---

### Task 1: Implement Redesigned `PtmaDetailDrawer.tsx` with Research Fingerprint Radar Chart

**Files:**
- Modify: `resources/js/pages/Public/PtmaRanking/components/PtmaDetailDrawer.tsx`

**Interfaces:**
- Consumes:
  ```tsx
  export interface PtmaDetailDrawerProps {
      metric: PtmaMetric | null;
      onClose: () => void;
  }
  ```
- Produces: Redesigned `PtmaDetailDrawer` component with:
  1. Header with Doppelrand avatar, BAN-PT accreditation pill, national rank badge, and copy deep-link.
  2. Hero Dual-Scorecard: Prominent SINTA Overall & 3-Year scores with rank badge.
  3. Interactive 6-Axis "Research Fingerprint" Radar Chart using shadcn `ChartContainer`.
  4. 3 Thematic Bento Cards:
     - Global Publications & Citations (Scopus & WoS with citations ratio).
     - National Publications & IPR (Garuda & HKI with book count).
     - Faculty & Research Endeavors (Dosen Authors, Jurnal Kampus, Riset, and PkM).

- [ ] **Step 1: Write component implementation in `PtmaDetailDrawer.tsx`**
Replace flat uniform boxes with:
- Top Hero banner with subtle Muhammadiyah glow (`from-primary/10 via-primary/5 to-transparent`).
- SINTA Scorecard spotlight card with `ring-1 ring-border shadow-xs`.
- Dedicated "Sidik Jari Riset & Publikasi" card containing Recharts `RadarChart` inside `ChartContainer`.
- 6 Axes: `Scopus`, `Garuda`, `WoS`, `HKI`, `Riset`, `Pengabdian`.
- Thematic groupings with distinct icon color badges and tabular numeric styling (`font-mono tabular-nums`).

- [ ] **Step 2: Verify TypeScript types**
```bash
npm run types
```
Expected: PASS with 0 errors.

- [ ] **Step 3: Commit Task 1**
```bash
git add resources/js/pages/Public/PtmaRanking/components/PtmaDetailDrawer.tsx
git commit -m "feat(sinta): redesign PtmaDetailDrawer with research fingerprint radar chart and thematic bento cards"
```

---

### Task 2: Dedicated Drawer Unit Tests & Full Suite Verification

**Files:**
- Create: `resources/js/pages/Public/PtmaRanking/__tests__/PtmaDetailDrawer.test.tsx`
- Modify: `resources/js/pages/Public/PtmaRanking/__tests__/PtmaRankingLeaderboard.test.tsx` (if any selectors changed)

**Interfaces:**
- Consumes: `<PtmaDetailDrawer metric={mockMetric} onClose={onClose} />`
- Produces: Comprehensive test coverage for drawer mounting, radar chart presence, copy link action, keyboard ESC dismissal, and empty state safety.

- [ ] **Step 1: Create `PtmaDetailDrawer.test.tsx`**
Add comprehensive tests:
1. Renders university header, national rank, accreditation status, and SINTA overall score.
2. Renders 6-axis Research Fingerprint Radar Chart and thematic bento sections.
3. Copies campus link to clipboard with `campus=...` query parameter.
4. Closes on ESC key press and close button click.
5. Returns `null` when `metric` is null.

- [ ] **Step 2: Run Vitest test suite**
```bash
npx vitest run resources/js/pages/Public/PtmaRanking/
```
Expected: All tests PASS.

- [ ] **Step 3: Run full verification suite**
```bash
npm run types
docker exec -i jurnal-mu-app php artisan test tests/Feature/Sinta tests/Unit/Sinta
npm run build
```
Expected: 0 type errors, all PHPUnit tests pass, Vite production build succeeds.

- [ ] **Step 4: Commit Task 2**
```bash
git add resources/js/pages/Public/PtmaRanking/__tests__/PtmaDetailDrawer.test.tsx resources/js/pages/Public/PtmaRanking/__tests__/PtmaRankingLeaderboard.test.tsx
git commit -m "test(sinta): add dedicated PtmaDetailDrawer tests and verify full test suites"
```

---

### Task 3: Final Whole-Branch Code Review

**Files:**
- Review all changed files against spec and requirements.

- [ ] **Step 1: Run whole-branch review**
Verify visual aesthetics, accessibility, edge cases, responsive layout on mobile, and bundle footprint.

- [ ] **Step 2: Commit any final review polish and document in SDD ledger**
