# Discard Universities layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revert Browse/Universities.tsx to the in-place selection view from commit `ab9dc8e`.

**Architecture:** Discard card redirect navigation changes in Browse/Universities.tsx using git checkout from the previous working commit `ab9dc8e` where in-place selection is fully functional.

**Tech Stack:** Git, React, TypeScript

---

### Task 1: Revert Browse/Universities.tsx layout

**Files:**
- Modify: `resources/js/pages/Browse/Universities.tsx`

- [ ] **Step 1: Checkout previous state from commit ab9dc8e**

Run:
```bash
git checkout ab9dc8e -- resources/js/pages/Browse/Universities.tsx
```

Expected: Command runs successfully.

- [ ] **Step 2: Commit reverted layout**

Run:
```bash
git commit -m "style: revert Browse/Universities.tsx layout to in-place selection"
```

Expected: Commit succeeds.

---

### Task 2: Verification and asset build

**Files:**
- None

- [ ] **Step 1: Run Vite production build**

Run:
```bash
npm run build
```

Expected: Build completes successfully with no errors.
