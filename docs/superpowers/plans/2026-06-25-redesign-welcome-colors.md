# Welcome Page Color Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded green, navy, and yellow hex values in `welcome.tsx` with Tailwind theme variables, updating background patterns to use modern brand gradients.

**Architecture:** Update `resources/js/pages/welcome.tsx` to use `primary`, `secondary`, `accent`, and `accent-gradient` classes. Add a verification test to verify rendering and assert no hardcoded hex values remain.

**Tech Stack:** React, Tailwind CSS v4, Vitest, React Testing Library

---

### Task 1: Create Welcome Page Verification Test

**Files:**
- Create: `resources/js/pages/__tests__/welcome.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import Welcome from '../welcome';
import fs from 'fs';
import path from 'path';

// Setup mock route
beforeAll(() => {
    (globalThis as any).route = (name: string, params?: any) => `/route/${name}`;
});

// Mock @inertiajs/react
vi.mock('@inertiajs/react', () => {
    return {
        Link: ({ href, children, ...props }: any) => (
            <a href={href} {...props}>
                {children}
            </a>
        ),
        Head: ({ title }: any) => <title>{title}</title>,
        usePage: () => ({
            props: {
                auth: { user: null },
                featuredJournals: [],
                totalUniversities: 10,
                totalJournals: 50,
                totalArticles: 100,
                scientificFields: [],
                upcomingEvents: [],
                featuredArticles: [],
                topUniversities: [],
            },
        }),
    };
});

// Mock layouts
vi.mock('@/layouts/public-layout', () => ({
    default: ({ children }: any) => <div data-testid="public-layout">{children}</div>,
}));

// Mock child components to prevent import errors
vi.mock('@/components/public-navbar', () => ({
    default: () => <div data-testid="public-navbar" />
}));
vi.mock('@/components/public-footer', () => ({
    default: () => <div data-testid="public-footer" />
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    ArrowRight: () => <span>ArrowRight</span>,
    BookOpen: () => <span>BookOpen</span>,
    Calendar: () => <span>Calendar</span>,
    ChevronDown: () => <span>ChevronDown</span>,
    Clock: () => <span>Clock</span>,
    Download: () => <span>Download</span>,
    FileText: () => <span>FileText</span>,
    GraduationCap: () => <span>GraduationCap</span>,
    LayoutDashboard: () => <span>LayoutDashboard</span>,
    Library: () => <span>Library</span>,
    MapPin: () => <span>MapPin</span>,
    Search: () => <span>Search</span>,
    User: () => <span>User</span>,
}));

describe('Welcome Page Redesign', () => {
    it('should render welcome page without crashing', () => {
        render(<Welcome />);
        expect(screen.getByText(/Discover Muhammadiyah/i)).toBeInTheDocument();
    });

    it('should not contain hardcoded green or old navy hex colors in welcome.tsx', () => {
        const welcomePath = path.resolve(__dirname, '../welcome.tsx');
        const content = fs.readFileSync(welcomePath, 'utf8');

        expect(content).not.toContain('#079C4E');
        expect(content).not.toContain('#1A2A75');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run resources/js/pages/__tests__/welcome.test.tsx`
Expected: FAIL (source code contains `#079C4E` and `#1A2A75`)

- [ ] **Step 3: Commit the failing test**

```bash
git add resources/js/pages/__tests__/welcome.test.tsx
git commit -m "test: add welcome page color redesign verification test"
```

---

### Task 2: Refactor welcome.tsx to Use Theme Variables

**Files:**
- Modify: `resources/js/pages/welcome.tsx`

- [ ] **Step 1: Write minimal implementation**
Modify `resources/js/pages/welcome.tsx` to replace all old color hex values with the new theme color classes.

#### Replacements:
1. Line 166:
`selection:bg-[#079C4E]` -> `selection:bg-primary`

2. Line 172:
`bg-gradient-to-br from-[#079C4E] to-[#10816F]` -> `bg-gradient-to-br from-primary to-secondary`

3. Line 173:
`bg-[#FCEE1F]` -> `bg-accent`

4. Line 174:
`bg-[#1A2A75]` -> `bg-secondary`

5. Line 187:
`text-[#FCEE1F]` -> `text-accent`

6. Line 196:
`focus-within:ring-[#FCEE1F]/50` -> `focus-within:ring-accent/50`

7. Line 256:
`bg-[#1A2A75] px-6 text-white hover:bg-[#131f57]` -> `bg-secondary px-6 text-white hover:bg-secondary/90`

8. Line 281:
`border-l-[#079C4E]` -> `border-l-primary`

9. Line 290:
`bg-emerald-100 p-4 text-[#079C4E] dark:bg-[#079C4E]/20` -> `bg-primary/10 p-4 text-primary dark:bg-primary/20`

10. Line 297:
`border-l-[#1A2A75]` -> `border-l-secondary`

11. Line 306:
`bg-[#1A2A75]/10 p-4 text-[#1A2A75] dark:bg-[#1A2A75]/20` -> `bg-secondary/10 p-4 text-secondary dark:bg-secondary/20`

12. Line 338 & 369 & 476 & 564:
`text-[#079C4E]` -> `text-primary`

13. Line 343 & 376 & 573:
`text-[#1A2A75] hover:text-[#079C4E]` -> `text-secondary hover:text-primary`

14. Line 391:
`bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#079C4E] dark:bg-emerald-950/30 dark:text-emerald-400` -> `bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/30 dark:text-primary`

15. Line 396 & 527 & 600:
`group-hover:text-[#079C4E]` -> `group-hover:text-primary`

16. Line 428 & 434:
`bg-[#079C4E] text-white hover:bg-[#068a45]` -> `bg-primary text-white hover:bg-primary/90`

17. Line 459:
`border-[#079C4E]/20 text-[#079C4E] hover:bg-[#079C4E]/10` -> `border-primary/20 text-primary hover:bg-primary/10`

18. Line 486:
`bg-[#1A2A75] hover:bg-[#131f57]` -> `bg-secondary hover:bg-secondary/90`

19. Line 506:
`hover:border-[#079C4E]` -> `hover:border-primary`

20. Line 510:
`group-hover:bg-[#079C4E]/10` -> `group-hover:bg-primary/10`

21. Line 511:
`text-[#079C4E]` -> `text-primary`

22. Line 518:
`bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-[#1A2A75] uppercase dark:bg-blue-900/30 dark:text-blue-300` -> `bg-secondary/10 px-3 py-1 text-xs font-semibold tracking-wide text-secondary uppercase dark:bg-secondary/30 dark:text-secondary`

23. Line 532 & 536:
`text-[#079C4E]` -> `text-primary`

24. Line 549:
`group-hover:bg-[#079C4E]` -> `group-hover:bg-primary`

25. Line 588:
`group-hover:border-[#079C4E]/20` -> `group-hover:border-primary/20`

26. Line 592:
`text-[#079C4E] dark:text-emerald-400` -> `text-primary dark:text-primary`

27. Line 607:
`bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#1A2A75] dark:bg-blue-950/30` -> `bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary dark:bg-secondary/30`

28. Line 667:
`bg-[#1A2A75] text-white` -> `bg-gradient-to-br from-primary to-secondary text-white`

29. Line 684:
`bg-[#FCEE1F] px-8 text-lg font-bold text-[#1A2A75] hover:bg-[#e3d51b]` -> `bg-accent-gradient px-8 text-lg font-bold text-white hover:opacity-90`

30. Line 692:
`hover:text-[#1A2A75]` -> `hover:text-secondary`

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run resources/js/pages/__tests__/welcome.test.tsx`
Expected: PASS

- [ ] **Step 3: Run full test suite to check for regressions**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/welcome.tsx
git commit -m "feat: migrate welcome page colors to brand guidelines navy-maroon theme variables"
```
