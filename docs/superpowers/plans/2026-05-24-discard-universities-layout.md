# Discard Universities layout and Redirect Card Click Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the 434-line premium list layout for Browse/Universities.tsx and redirect card click to the university profile page.

**Architecture:** Change `handleUniversityCardClick` inside `Browse/Universities.tsx` to navigate to the profile route `browse.universities.show` using Inertia `router.visit()`.

**Tech Stack:** React, TypeScript, Laravel, Inertia.js

---

### Task 1: Revert Universities.tsx to in-place selection layout

**Files:**
- Modify: `resources/js/pages/Browse/Universities.tsx`

- [x] **Step 1: Checkout ab9dc8e version of Universities.tsx** (Done)

- [ ] **Step 2: Modify handleUniversityCardClick to redirect**

In `resources/js/pages/Browse/Universities.tsx:107-110`, replace:
```typescript
    const handleUniversityCardClick = (universityId: number) => {
        setUniversityFilter(universityId.toString());
        router.get(route('browse.universities'), { university_id: universityId }, { preserveState: true });
    };
```
with:
```typescript
    const handleUniversityCardClick = (universityId: number) => {
        router.visit(route('browse.universities.show', universityId));
    };
```

- [ ] **Step 3: Run Vite build to verify compilation**

Run:
```bash
npm run build
```
Expected: Exit code 0, build passes.

- [ ] **Step 4: Run PublicUniversityTest to verify behavior**

Run:
```bash
docker exec -i jurnal-mu-app php artisan test --filter=PublicUniversityTest
```
Expected: Tests pass.

- [ ] **Step 5: Commit changes**

Run:
```bash
git add resources/js/pages/Browse/Universities.tsx
git commit -m "feat: redirect university card click to profile page in premium layout"
```
