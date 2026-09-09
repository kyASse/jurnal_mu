# Design Document: JurnalMu Landing Page — Hero & Featured Journal Showcase Redesign

- **Date:** 2026-08-23
- **Topic:** Hero & Featured Journal Showcase Redesign
- **Aesthetic Direction:** Soft Structuralism with Editorial Luxury accents (Awwwards-Tier Design Language)
- **Stack:** React 19 + Inertia.js + Tailwind CSS v4 + TypeScript

---

## 1. Overview & Objectives

Redesign the top half of the JurnalMu public landing page (`resources/js/pages/welcome.tsx`) and its key showcase components:
1. **Hero Section:** Elevate from a generic gradient hero to an editorial, serene, high-contrast academic experience with a floating capsule search bar and integrated 3-island metrics counter.
2. **Featured Journal Showcase:** Transform the standard 4-column card grid into an Asymmetrical 12-Column Bento Grid highlighting SINTA 1 & 2 journals, featuring a Master Showcase Card with nested "Telusuri Publikasi" button-in-button CTA, accompanied by 3 satellite cards.
3. **Micro-Interactions & Motion:** Implement hardware-inspired Double-Bezel (Doppelrand) architecture, custom cubic-bezier hover dynamics, and fluid IntersectionObserver-driven scroll entry animations.

---

## 2. Visual & Structural Specifications

### 2.1 Color & Atmosphere
- **Light Theme Base:** Ambient slate `#f8fafc` / warm cream `#fdfbf7` with subtle primary navy (`#2C368A`) and secondary maroon (`#E8242A`) ambient radial glow.
- **Dark Theme Base:** Deep OLED `#020617` / `#0f172a` with soft Indigo-500 glow.
- **Micro-Shadows:** Diffuse ambient shadows (`shadow-[0_20px_50px_rgba(0,0,0,0.04)]`) replacing heavy drop shadows.

### 2.2 Typography
- **Display Serif:** `El Messiri` for major titles (`font-heading`, `text-4xl sm:text-6xl` in Hero, `text-2xl sm:text-3xl` in Bento).
- **Body & Controls:** `Plus Jakarta Sans` for clean, readable body copy and UI controls.
- **Eyebrow Micro-Badges:** `rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] bg-primary/5 text-primary border border-primary/10`.

---

## 3. Component Architecture

### 3.1 Hero Section
- **Micro-Eyebrow Badge:** *"PORTAL REPOSITORI ILMIAH RESMI"*
- **Display Headline:** *"Eksplorasi Keunggulan Publikasi Ilmiah Muhammadiyah"*
- **Floating Capsule Search Bar:**
  - Double-bezel rounded-full outer shell (`p-1.5 ring-1 ring-black/[0.08] shadow-2xl backdrop-blur-md`).
  - Search input with ultra-light iconography and query switcher.
  - Category selector dropdown (Journals / Articles / Universities) separated by hairline divider.
  - Primary button: Rounded pill with active spring scale (`active:scale-95`).
- **Integrated Metrics Counter:**
  - 3 floating island cards (Total Journals, Total Articles, Total Universities).
  - Double-bezel concentric frame (`p-1 ring-1 ring-black/[0.06] rounded-2xl` -> inner `p-5 bg-white dark:bg-zinc-900 rounded-xl`).
  - Tabular numerics with high visual contrast and tracking-wide labels.

### 3.2 Featured Journal Showcase (Asymmetrical Bento Grid)
- **Header:** Micro-eyebrow *"KURASI TERBAIK"*, H2 *"Jurnal Terakreditasi Unggulan"*, brief description, and *"Lihat Semua Jurnal"* link.
- **Grid Layout (`lg:grid-cols-12 gap-6`):**
  - **Master Showcase Card (`lg:col-span-7`):**
    - Outer shell: `p-2.5 rounded-[2rem] bg-gradient-to-b from-black/[0.04] to-black/[0.02] ring-1 ring-black/[0.06] shadow-xl`.
    - Inner core: `rounded-[calc(2rem-0.625rem)] bg-white dark:bg-zinc-900 p-6 md:p-8 flex flex-col justify-between`.
    - Badges: Luxury SINTA 1 badge + Indexation tags (Scopus / WoS / DOAJ).
    - Metadata: Publisher university, monospaced P-ISSN & E-ISSN tags.
    - Nested CTA Button *"Telusuri Publikasi"*:
      - Outer pill: `rounded-full px-6 py-3.5 bg-primary text-white font-medium shadow-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-primary/90 active:scale-[0.98] group flex items-center justify-between gap-4`.
      - Nested trailing icon: `w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0` with `↗` arrow moving `group-hover:translate-x-1.5 group-hover:-translate-y-1`.
  - **Satellite Cards (`lg:col-span-5`):**
    - 3 cards arranged vertically or in a sub-bento structure for SINTA 1 & 2 journals.
    - Double-bezel concentric architecture (`rounded-[1.5rem]` outer, `rounded-[calc(1.5rem-0.375rem)]` inner).
    - Compact metadata, accreditation badges, and interactive quick-link actions.
- **Mobile Responsiveness:** Clean collapse below `768px` into single-column stack (`w-full`, `gap-5`, `px-4`).

---

## 4. Motion Choreography & Performance Guardrails

- **Custom Easing:** `cubic-bezier(0.32, 0.72, 0, 1)` applied to all kinetic and interactive transitions.
- **Scroll Entry Animation:** Native `IntersectionObserver` hook triggering staggered `opacity` and `translate-y` transforms (0ms, 150ms, 300ms delays).
- **GPU Acceleration:** Only `transform` and `opacity` properties animated; zero CPU layout thrashing.
- **Accessibility:** Full support for `prefers-reduced-motion`.

---

## 5. Verification Plan

1. **Unit & Integration Tests:** Run `npm test -- resources/js/pages/__tests__/welcome.test.tsx` to ensure all existing search behaviors, accessibility attributes, and assertions remain passing.
2. **Build Verification:** Run `npm run build` to verify clean TypeScript compilation and Tailwind v4 CSS bundling without errors.
3. **Visual Inspection:** Verify responsiveness on desktop (`1280px+`), tablet (`768px - 1024px`), and mobile (`< 768px`).
