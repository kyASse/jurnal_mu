# Muhammadiyah Color Scheme Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the color scheme in `resources/css/app.css` to transition from green-yellow to Muhammadiyah navy-maroon guidelines, adding dark mode overrides and a custom accent gradient.

**Architecture:** Redefine Tailwind CSS theme variables inside `:root` and `.dark` blocks in `app.css`. Register the accent gradient custom theme property in Tailwind.

**Tech Stack:** Tailwind CSS v4, React, Vitest

---

### Task 1: Create Theme Color Validation Test

**Files:**
- Create: `resources/js/components/__tests__/theme.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';

test('theme colors are updated to Muhammadiyah brand guideline', () => {
    const cssPath = path.resolve(__dirname, '../../../css/app.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Light Mode
    expect(cssContent).toContain('--primary: #2C368A');
    expect(cssContent).toContain('--secondary: #E8242A');
    expect(cssContent).toContain('--accent-gradient: linear-gradient(135deg, #FCEE1F 0%, #E8242A 100%)');
    expect(cssContent).toContain('--sidebar-primary: #2C368A');
    expect(cssContent).toContain('--sidebar-accent: #f0f2ff');

    // Dark Mode
    expect(cssContent).toContain('--primary: #5C6BC0');
    expect(cssContent).toContain('--secondary: #EF5350');
    expect(cssContent).toContain('--sidebar-primary: #5C6BC0');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run resources/js/components/__tests__/theme.test.ts`
Expected: FAIL (file or variable contents mismatch)

- [ ] **Step 3: Commit the failing test**

```bash
git add resources/js/components/__tests__/theme.test.ts
git commit -m "test: add theme color validation test"
```

---

### Task 2: Redefine CSS Variables in app.css

**Files:**
- Modify: `resources/css/app.css`

- [ ] **Step 1: Write minimal implementation**
Modify `resources/css/app.css` to update CSS variables and add `@theme` registry.

Replacement inside `@theme` (around line 52):
```css
    --color-accent-gradient: var(--accent-gradient);
```

Replacement inside `:root` (from line 94):
```css
:root {
    /* Palette: "The Progressive Aurora" */
    --background: #f8fafc; /* Slate-50 */
    --foreground: #0f172a; /* Slate-900 */

    --card: #ffffff;
    --card-foreground: #0f172a;

    --popover: #ffffff;
    --popover-foreground: #0f172a;

    /* Muhammadiyah Navy */
    --primary: #2C368A;
    --primary-foreground: #ffffff;

    /* Muhammadiyah Maroon */
    --secondary: #E8242A;
    --secondary-foreground: #ffffff;

    --muted: #f1f5f9; /* Slate-100 */
    --muted-foreground: #64748b; /* Slate-500 */

    /* Accent Gradient (Yellow to Maroon) */
    --accent-gradient: linear-gradient(135deg, #FCEE1F 0%, #E8242A 100%);
    --accent: #FCEE1F;
    --accent-foreground: #0f172a;

    /* Accent Red for CTAs */
    --accent-red: #dc2626;
    --accent-red-foreground: #ffffff;

    --destructive: #ef4444;
    --destructive-foreground: #ffffff;

    --border: #e2e8f0; /* Slate-200 */
    --input: #e2e8f0;
    --ring: #2C368A;

    --chart-1: #2C368A;
    --chart-2: #E8242A;
    --chart-3: #fcee1f;
    --chart-4: #0f172a;
    --chart-5: #64748b;

    --radius: 0.625rem;

    /* Sidebar */
    --sidebar: #ffffff;
    --sidebar-foreground: #0f172a;
    --sidebar-primary: #2C368A;
    --sidebar-primary-foreground: #ffffff;
    --sidebar-accent: #f0f2ff; /* Very light navy */
    --sidebar-accent-foreground: #2C368A;
    --sidebar-border: #e2e8f0;
    --sidebar-ring: #2C368A;
}
```

Replacement inside `.dark` (from line 150):
```css
.dark {
    --background: #020617;
    --foreground: #f8fafc;

    --card: #0f172a;
    --card-foreground: #f8fafc;

    --popover: #0f172a;
    --popover-foreground: #f8fafc;

    --primary: #5C6BC0;
    --primary-foreground: #ffffff;

    --secondary: #EF5350;
    --secondary-foreground: #ffffff;

    --muted: #1e293b;
    --muted-foreground: #94a3b8;

    --accent-gradient: linear-gradient(135deg, #FCEE1F 0%, #EF5350 100%);
    --accent: #FCEE1F;
    --accent-foreground: #020617;

    --accent-red: #ef4444;
    --accent-red-foreground: #ffffff;

    --destructive: #7f1d1d;
    --destructive-foreground: #f8fafc;

    --border: #1e293b;
    --input: #1e293b;
    --ring: #5C6BC0;

    --chart-1: #5C6BC0;
    --chart-2: #EF5350;
    --chart-3: #fcee1f;
    --chart-4: #f8fafc;
    --chart-5: #94a3b8;

    --sidebar: #020617;
    --sidebar-foreground: #f8fafc;
    --sidebar-primary: #5C6BC0;
    --sidebar-primary-foreground: #ffffff;
    --sidebar-accent: #1e293b;
    --sidebar-accent-foreground: #5C6BC0;
    --sidebar-border: #1e293b;
    --sidebar-ring: #5C6BC0;
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run resources/js/components/__tests__/theme.test.ts`
Expected: PASS

- [ ] **Step 3: Run full test suite to check for regressions**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add resources/css/app.css
git commit -m "feat: redesign theme colors to Muhammadiyah navy-maroon and add accent gradient"
```
