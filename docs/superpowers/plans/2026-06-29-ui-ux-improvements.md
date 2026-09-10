# Welcome Page UI/UX and Color Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement accessibility tags, touch target padding, Inertia client-side navigation, and dark mode color contrast overrides in `welcome.tsx`.

**Architecture:** Use `@inertiajs/react` `router.get` for SPA navigation, apply Tailwind responsive and theme classes for dark mode contrast and accessibility.

**Tech Stack:** React, Tailwind CSS v4, Inertia.js, Vitest, React Testing Library

---

### Task 1: Update Tests for UI/UX and Navigation

**Files:**
- Modify: `resources/js/pages/__tests__/welcome.test.tsx`

- [ ] **Step 1: Write the failing test**
Update `welcome.test.tsx` to assert accessibility attributes and client-side navigation.

```typescript
import { act, fireEvent, render, screen } from '@testing-library/react';
// ... existing imports ...

// Access mockGet to verify router navigation
const mockGet = vi.fn();
vi.mock('@inertiajs/react', () => {
    return {
        Link: ({ href, children, ...props }: any) => (
            <a href={href} {...props}>
                {children}
            </a>
        ),
        Head: ({ title }: any) => <title>{title}</title>,
        router: {
            get: (url: string, data?: any, options?: any) => mockGet(url, data, options),
        },
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

// ... existing mocks ...

describe('Welcome Page Redesign', () => {
    // ... existing tests ...

    it('should have accessibility labels on search input', () => {
        render(<Welcome />);
        const searchInput = screen.getByPlaceholderText(/Search for journals/i);
        expect(searchInput).toHaveAttribute('aria-label', 'Search academic content');
    });

    it('should perform client-side search using Inertia router', async () => {
        render(<Welcome />);
        const searchInput = screen.getByPlaceholderText(/Search for journals/i);
        fireEvent.change(searchInput, { target: { value: 'physics' } });
        
        const searchButton = screen.getByRole('button', { name: /Search/i });
        fireEvent.click(searchButton);

        expect(mockGet).toHaveBeenCalled();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run resources/js/pages/__tests__/welcome.test.tsx`
Expected: FAIL (no aria-label, search navigates via window.location.href instead of mockGet)

- [ ] **Step 3: Commit the failing test**

```bash
git add resources/js/pages/__tests__/welcome.test.tsx
git commit -m "test: add welcome page accessibility and Inertia navigation checks"
```

---

### Task 2: Implement UI/UX and Color Contrast Changes

**Files:**
- Modify: `resources/js/pages/welcome.tsx`

- [ ] **Step 1: Write minimal implementation**
Modify `resources/js/pages/welcome.tsx`:
1. Import `router` from `@inertiajs/react`:
   ```typescript
   import { Head, Link, usePage, router } from '@inertiajs/react';
   ```
2. Refactor `handleSearch` to use client-side Inertia navigation and manage a loading state:
   ```typescript
   const [isSearching, setIsSearching] = useState(false);

   const handleSearch = () => {
       if (!searchQuery.trim() || isSearching) return;

       setIsSearching(true);
       const params = searchType === 'journals'
           ? { search: searchQuery }
           : searchType === 'articles'
             ? { q: searchQuery }
             : { search: searchQuery };

       const routeName = searchType === 'journals'
           ? 'journals.index'
           : searchType === 'articles'
             ? 'browse.articles'
             : 'browse.universities';

       router.get(route(routeName), params, {
           onFinish: () => setIsSearching(false)
       });
   };
   ```
3. Add `aria-label="Search academic content"` to the input and disable elements during search:
   ```typescript
   <input
       type="text"
       aria-label="Search academic content"
       disabled={isSearching}
       // ... existing props ...
   />
   ```
4. Update Search button to show a spinner / disable state:
   ```typescript
   <Button
       className="h-11 flex-shrink-0 rounded-full bg-secondary px-6 text-white hover:bg-secondary/90 disabled:opacity-70"
       onClick={handleSearch}
       disabled={isSearching}
   >
       {isSearching ? 'Loading...' : 'Search'}
   </Button>
   ```
5. Increase search dropdown trigger padding:
   ```typescript
   className="mr-2 flex flex-shrink-0 items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none"
   ```
6. Add `dark:from-[#151a43] dark:to-[#6b1013]` dark mode contrast overrides to the Hero background:
   ```typescript
   <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-primary to-secondary dark:from-[#151a43] dark:to-[#6b1013] pb-32">
   ```
7. Add `dark:from-[#151a43] dark:to-[#6b1013]` to the footer CTA banner (line 667):
   ```typescript
   <div className="mt-24 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary dark:from-[#151a43] dark:to-[#6b1013] text-white shadow-2xl">
   ```
8. Add accessibility labels to link tags:
   - For line 480 (Explore all events):
     ```typescript
     <Link href={route('events.index')} aria-label="Explore all upcoming events">
     ```
   - For line 500 (Event link items):
     ```typescript
     <Link
         key={event.id}
         href={route('events.show', event.slug)}
         aria-label={`View details of event: ${event.title}`}
         // ... existing props ...
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
git commit -m "feat: improve welcome page accessibility, touch target size, search navigation, and dark mode background contrast"
```
