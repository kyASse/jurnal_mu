# Standardize Global Fonts

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Load brand fonts globally to resolve fallback font discrepancies on other public pages.

**Architecture:** Replace bunny.net fonts in the master blade template `app.blade.php` with Google Fonts preconnect and stylesheet loader links, then remove the local stylesheet loading from `welcome.tsx`.

**Tech Stack:** Laravel (blade), React 18, Google Fonts.

---

### Task 1: Update app.blade.php

**Files:**
- Modify: `resources/views/app.blade.php`

- [ ] **Step 1: Replace local font loader with global Google Fonts preconnect and link loader**

Replace lines 39-41 in `resources/views/app.blade.php` with the global brand font links:

```html
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Commit file changes**

Run:
```bash
git add resources/views/app.blade.php
git commit -m "feat: load brand fonts globally in app.blade.php"
```

---

### Task 2: Clean up welcome.tsx

**Files:**
- Modify: `resources/js/pages/welcome.tsx`

- [ ] **Step 1: Remove local font stylesheet link from `<Head>`**

Replace the local `<link>` tags in `resources/js/pages/welcome.tsx` (lines 91-98):

```tsx
            <Head title="JurnalMu - Muhammadiyah Journal Portal">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>
```

with a clean `<Head>` component call:

```tsx
            <Head title="JurnalMu - Muhammadiyah Journal Portal" />
```

- [ ] **Step 2: Commit file changes**

Run:
```bash
git add resources/js/pages/welcome.tsx
git commit -m "refactor: remove redundant local font loading from welcome view"
```

---

### Task 3: Build Verification

- [ ] **Step 1: Run npm build to verify production assets compile without error**

Run:
```bash
npm run build
```
Expected: Success.
