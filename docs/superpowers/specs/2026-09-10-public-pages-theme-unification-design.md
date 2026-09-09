# Design Specification: Public Pages Theme Unification (Blue & Red Editorial Luxury)

## 1. Context & Design Read

> **Design Read:**
> Reading this as: Public academic directory & scholarly repository portal (Journals, Articles, Universities, News, Events) for researchers, university leaders, and scholarly audiences, with an **Editorial Luxury / Soft Structuralism** design language, unified in **Muhammadiyah Navy (`--primary`)** and **Crimson Maroon (`--secondary`)** with **Warm Gold accents (`--accent`)**, completely eliminating all legacy green theme remnants (`#079C4E`, `#10816F`, `#068A42`, etc.) and strictly using design tokens from `resources/css/app.css` without hardcoding hex values in markup.

### Dials Configuration
- **`DESIGN_VARIANCE: 7`** (Clean editorial hierarchy, structured cards with bespoke accents)
- **`MOTION_INTENSITY: 5`** (Restrained, fluid CSS transitions `cubic-bezier(0.32, 0.72, 0, 1)`)
- **`VISUAL_DENSITY: 4`** (Balanced academic breathing room with high data legibility)

---

## 2. Core Color Architecture & Token Mapping from `resources/css/app.css`

| Token / Element | Legacy Value (To Eliminate) | Design Token in `app.css` | Utility Class / Usage |
|---|---|---|---|
| **Canvas Selection** | `selection:bg-[#079C4E]` | `--primary` | `selection:bg-primary selection:text-primary-foreground` |
| **Page Header Canvas** | `from-[#079C4E] to-[#10816F]` | `--hero-gradient` | `bg-hero-gradient text-white` |
| **Header Glow Orbs** | Hardcoded green orbs | `--primary` & `--secondary` | `bg-primary/25 blur-[140px]` & `bg-secondary/30 blur-[130px]` |
| **Header Accent Text** | `text-[#FCEE1F]` / `text-emerald-50` | `--accent` | `text-accent` or rose-accent gradient text |
| **Primary Action Buttons** | `bg-[#079C4E] hover:bg-[#068A42]` | `--secondary` or `--primary` | `bg-secondary hover:bg-secondary/90 text-white` / `bg-primary hover:bg-primary/90 text-white` |
| **Stat / Filter Chips** | `bg-emerald-50 text-[#079C4E]` | `--primary` soft token | `bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:bg-primary group-hover:text-white` |
| **Hover / Interactive Links** | `hover:text-[#079C4E]` | `--primary` to `--secondary` | `text-primary hover:text-secondary hover:underline` |
| **Pagination Active** | `bg-[#079C4E] text-white` | `--primary` | `bg-primary text-white hover:bg-primary/90` |
| **University Initials** | `from-[#079C4E] to-[#10816F]` | `--primary` to `--secondary` | `bg-gradient-to-br from-primary to-secondary text-white` |
| **Chart Palette** | `['#079C4E', '#3b82f6', ...]` | Theme variables | CSS variable references: `['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--chart-4)', 'var(--chart-5)']` |

---

## 3. Detailed Page Redesign Specifications

### A. Layout Component: `public-layout.tsx`
- Replace `selection:bg-[#079C4E]` with `selection:bg-primary selection:text-primary-foreground`.

### B. Journals Directory: `Journals/Index.tsx`
- **Header**: Replace green banner with `bg-hero-gradient` banner with dot grid and ambient orbs.
- **SINTA & Indexation Cards**:
  - Replace `bg-emerald-50 text-[#079C4E]` count badges with `bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:bg-primary group-hover:text-white`.
- **Search & Filters**:
  - Search submit button: `bg-secondary hover:bg-secondary/90 text-white`.
  - Filter pills & active sinta filters: `bg-primary text-white` when active.
- **Pagination**:
  - Active button: `bg-primary text-white hover:bg-primary/90`.

### C. Articles Browse: `Browse/Articles.tsx`
- **Header**: `bg-hero-gradient text-white` banner with headline *"Browse Research Articles"*.
- **Search & Filter Controls**:
  - Filter trigger icon: `text-primary`.
  - Search submit button: `bg-secondary hover:bg-secondary/90 text-white`.
  - Filter chips / active indicators: `bg-primary/10 text-primary`.
- **Article Card Actions & Links**:
  - Title hover: `hover:text-primary dark:hover:text-indigo-400`.
  - Author links & journal badges: `text-primary` and `bg-primary/10 text-primary`.
  - "Read Full PDF" / "View Article" buttons: `bg-primary hover:bg-primary/90` and `border-primary/20 text-primary hover:bg-primary/10`.
- **Pagination**: Active link `bg-primary text-white`.

### D. Universities Directory: `Browse/Universities.tsx`
- **Header**: `bg-hero-gradient text-white` banner with headline *"Browse Universities"*.
- **University Cards**:
  - Avatar placeholder: `bg-gradient-to-br from-primary to-secondary text-white`.
  - Title hover: `group-hover:text-primary`.
  - Journal count chip: `bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white`.
- **Search & Pagination**: `bg-primary text-white`.

### E. University Profile: `Browse/UniversityProfile.tsx`
- **Header Banner**: `bg-hero-gradient text-white` header.
- **Key Metrics Islands**: 4 stat boxes styled with `bg-primary/10 text-primary` and `bg-secondary/10 text-secondary`.
- **Analytics Charts**: ApexChart color series updated to theme variables `['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--chart-4)', 'var(--chart-5)']`.
- **Journal & Article Listing**:
  - SINTA badges: use standardized `<SintaBadge rank={...} />`.
  - Hover links: `hover:text-primary`.
  - Action buttons: `bg-primary hover:bg-primary/90 text-white`.
  - Active pagination: `bg-primary text-white`.

### F. News Pages: `Public/News/Index.tsx` & `Public/News/Show.tsx`
- **Header**: `bg-hero-gradient text-white` banner with headline *"Latest News & Updates"*.
- **Featured News Card**:
  - Category badge: `bg-secondary text-white shadow-md`.
  - Headline hover: `hover:text-primary`.
  - "Read Full Story" link: `text-primary hover:text-secondary font-bold`.
- **News Grid Cards**:
  - Hover states: `hover:text-primary`.
  - "Read More" button: `rounded-full bg-secondary hover:bg-secondary/90 text-white`.
- **News Detail (Show.tsx)**:
  - Back link: `text-primary hover:text-secondary`.
  - Category tags: `hover:bg-primary hover:text-white`.

### G. Events Pages: `Public/Events/Index.tsx` & `Public/Events/Show.tsx` + `event-card.tsx`
- **Header**: `bg-hero-gradient text-white` banner with headline *"Upcoming Academic Events"*.
- **Search & Filters**: `bg-secondary hover:bg-secondary/90 text-white`.
- **Event Card (`event-card.tsx`)**:
  - Countdown clock text: `text-accent`.
  - "Free Event" indicator: `text-primary font-bold dark:text-indigo-300`.
  - Detail button: `bg-primary hover:bg-primary/90 text-white`.

---

## 4. Verification & Testing Strategy
1. **Automated Grep Audits:**
   - Verify 0 occurrences of `#079C4E`, `#10816F`, `#068A42`, `#068A44`, `#056f37` across all `resources/js/pages/` and `resources/js/components/`.
2. **Unit & Integration Tests:**
   - Run Vitest tests (`welcome.test.tsx`, `JournalCard.test.tsx`, `NewsPages.test.tsx`, `Show.test.tsx`).
3. **Build Integrity:**
   - Execute `npm run types && npm run build` to confirm 0 TypeScript and build errors.
