# Implementation Plan - Public Pages Theme Unification (Blue & Red Theme via app.css Tokens)

Eliminate all lingering legacy green colors (`#079C4E`, `#10816F`, `#068A42`, etc.) and standardize all public directory pages (Journals, Articles, Universities, News, Events, and Public Layout) under the refined Blue & Red brand language (Muhammadiyah Navy `--primary`, Crimson Maroon `--secondary`, Warm Gold `--accent`).

**STRICT RULE:** All colors must NOT be hardcoded in markup or styles. They MUST consume design tokens from `resources/css/app.css` (`bg-hero-gradient`, `bg-primary`, `bg-secondary`, `bg-accent`, `selection:bg-primary`, etc.).

## User Review Required

> [!IMPORTANT]
> - `resources/css/app.css` has been enhanced with `--background-image-hero-gradient: var(--hero-gradient)` along with `--hero-start`, `--hero-mid`, and `--hero-end` tokens supporting both light and dark modes.
> - All public headers will use `bg-hero-gradient text-white` without inline hardcoded hex values.
> - All interactive buttons, chips, links, and pagination will consume standard Tailwind semantic tokens (`primary`, `secondary`, `accent`).

---

## Proposed Changes

### 1. Global Public Layout & Shared Components
- [MODIFY] `resources/js/layouts/public-layout.tsx`: Replace `selection:bg-[#079C4E]` with `selection:bg-primary selection:text-primary-foreground`.
- [MODIFY] `resources/js/components/event-card.tsx`: Replace emerald countdown/price tag classes with `text-accent` and `text-primary`.

### 2. Journals Directory & Detail
- [MODIFY] `resources/js/pages/Journals/Index.tsx`:
  - Update page header gradient to `bg-hero-gradient text-white`.
  - Update SINTA count chips from emerald to `bg-primary/10 text-primary ring-1 ring-primary/20`.
  - Update search, filter buttons, and active pagination to `bg-primary` / `bg-secondary`.

### 3. Articles Browse
- [MODIFY] `resources/js/pages/Browse/Articles.tsx`:
  - Update header banner to `bg-hero-gradient text-white`.
  - Update filter trigger, search button, author pills, and PDF action buttons to primary/secondary tokens.
  - Update active pagination styles to `bg-primary text-white`.

### 4. Universities Directory & Profile
- [MODIFY] `resources/js/pages/Browse/Universities.tsx`:
  - Update header banner to `bg-hero-gradient text-white`.
  - Update avatar initials fallback to `bg-gradient-to-br from-primary to-secondary text-white`.
  - Update journal counter pill to `bg-secondary/10 text-secondary`.
  - Update search button and pagination to `bg-primary`.
- [MODIFY] `resources/js/pages/Browse/UniversityProfile.tsx`:
  - Update profile banner to `bg-hero-gradient text-white`.
  - Update 4 metric boxes from emerald to `bg-primary/10 text-primary` and `bg-secondary/10 text-secondary`.
  - Update ApexChart palette to consume theme variables `['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--chart-4)', 'var(--chart-5)']`.
  - Update links, action buttons, and pagination.

### 5. News & Events Pages
- [MODIFY] `resources/js/pages/Public/News/Index.tsx` & `Public/News/Show.tsx`:
  - Update header banner to `bg-hero-gradient text-white`.
  - Update category badges, headline hover transitions, and read-more buttons to `secondary` and `primary`.
- [MODIFY] `resources/js/pages/Public/Events/Index.tsx` & `Public/Events/Show.tsx`:
  - Update header banner to `bg-hero-gradient text-white`.
  - Update search submit buttons, filter pills, and event card triggers to `secondary` and `primary`.

---

## Verification Plan

### Automated Tests
- Run Vitest suite on all public test files:
  ```bash
  npx vitest run resources/js/pages/__tests__/welcome.test.tsx resources/js/components/__tests__/JournalCard.test.tsx resources/js/pages/Public/News/__tests__/NewsPages.test.tsx resources/js/pages/Public/Events/__tests__/Show.test.tsx
  ```
- Automated Grep check to ensure 0 hardcoded legacy green occurrences in `resources/js/`:
  ```bash
  git grep -i "079c4e" resources/js/
  ```
- Full Type Check & Production Build:
  ```bash
  npm run types && npm run build
  ```
