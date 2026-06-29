# Hero Section Cube Pattern Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the cube pattern background from the CTA section to the hero section in `welcome.tsx`.

**Architecture:** Replace the absolute positioned radial dot pattern overlay in the hero section background with the transparent cube pattern overlay.

**Tech Stack:** React, Tailwind CSS v4, Vitest, React Testing Library

---

### Task 1: Create Validation Test for Hero Cube Pattern

**Files:**
- Modify: `resources/js/pages/__tests__/welcome.test.tsx`

- [ ] **Step 1: Write the failing test**
Update `resources/js/pages/__tests__/welcome.test.tsx` to add an assertion for the hero cube pattern.

```typescript
    it('should contain the transparent cube pattern in welcome.tsx', () => {
        const welcomePath = path.resolve(__dirname, '../welcome.tsx');
        const content = fs.readFileSync(welcomePath, 'utf8');
        // Assert that at least two occurrences of the cube pattern exist (one for CTA, one for Hero)
        const occurrences = (content.match(/bg-\[url\('https:\/\/www\.transparenttextures\.com\/patterns\/cubes\.png'\)\]/g) || []).length;
        expect(occurrences).toBeGreaterThanOrEqual(2);
    });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run resources/js/pages/__tests__/welcome.test.tsx`
Expected: FAIL (only 1 occurrence found in CTA)

- [ ] **Step 3: Commit the failing test**

```bash
git add resources/js/pages/__tests__/welcome.test.tsx
git commit -m "test: add validation check for hero section cube pattern"
```

---

### Task 2: Apply Cube Pattern to welcome.tsx Hero Background

**Files:**
- Modify: `resources/js/pages/welcome.tsx`

- [ ] **Step 1: Write minimal implementation**
In `resources/js/pages/welcome.tsx` (around lines 176-180), replace the dot pattern overlay with the cube pattern overlay:

```diff
-                        <div
-                            className="absolute inset-0 opacity-5"
-                            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
-                        ></div>
+                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run resources/js/pages/__tests__/welcome.test.tsx`
Expected: PASS

- [ ] **Step 3: Run full test suite for regression**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/welcome.tsx
git commit -m "feat: apply transparent cube pattern to hero background"
```
