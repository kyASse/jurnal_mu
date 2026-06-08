# Public Journal Show Layout Refactor Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `resources/js/pages/Journals/Show.tsx` to use `PublicNavbar` and `PublicFooter`, remove local Google Font stylesheet loading, and restructure the sidebar links.

**Architecture:** Replace hardcoded nav and footer sections with shared component references, drop redundant `<Head>` tags, and reorganize list items in the sidebar.

**Tech Stack:** React, InertiaJS, TypeScript, Tailwind CSS, Lucide React icons.

---

### Task 1: Refactor Page Layout and Clean Up Fonts

**Files:**
- Modify: `resources/js/pages/Journals/Show.tsx`

- [ ] **Step 1: Edit imports**
  Import `PublicNavbar` and `PublicFooter`. Remove unused `logoUrl` import.

- [ ] **Step 2: Clean up `<Head>` block**
  Remove the preconnect and stylesheet link tags for Google Fonts since they are loaded globally.

- [ ] **Step 3: Replace navbar and footer**
  Replace the `<nav>` container (lines 147-186) with `<PublicNavbar />`.
  Replace the `<footer>` container (lines 817-835) with `<PublicFooter />`.

- [ ] **Step 4: Verify syntax and format**
  Run code style checks and verify that the page mounts without syntax errors.

---

### Task 2: Reorganize Sidebar Links

**Files:**
- Modify: `resources/js/pages/Journals/Show.tsx`

- [ ] **Step 1: Update sidebar links block**
  Add a new link for "Journal URL" using `journal.url`. Re-arrange the "Editorial Team" link (which currently also references `journal.url`) directly below the new "Journal URL" link.

- [ ] **Step 2: Commit changes**
  Commit all changes to the active branch.

---

### Task 3: Build and Lint Verification

- [ ] **Step 1: Verify TypeScript compilation**
  Run: `npm run types`
  Expected: PASS (no type check issues)

- [ ] **Step 2: Verify linting**
  Run: `npm run lint`
  Expected: PASS

- [ ] **Step 3: Run production build**
  Run: `npm run build`
  Expected: SUCCESS (build completes without error)
