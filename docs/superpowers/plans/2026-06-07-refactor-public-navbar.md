# Refactor Public Navbar & Standardize Usage

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the unified `PublicNavbar` component to include the "Articles" link and use it consistently on all public layouts.

**Architecture:** Modify `public-navbar.tsx` to add "Articles" link, then replace the duplicate hardcoded navbar in `public-layout.tsx` with `<PublicNavbar />`.

**Tech Stack:** React 18, Tailwind CSS, Inertia.js.

---

### Task 1: Update Public Navbar Component

**Files:**
- Modify: `resources/js/components/public-navbar.tsx`

- [ ] **Step 1: Add "Articles" navigation item pointing to `browse.articles`**

Update the desktop link items in `resources/js/components/public-navbar.tsx`:

```tsx
                    <div className="hidden items-center gap-6 pr-4 sm:flex">
                        <Link href={route('journals.index')} className="font-semibold text-white/90 transition-colors hover:text-white">
                            Journals
                        </Link>
                        <Link href={route('browse.articles')} className="font-semibold text-white/90 transition-colors hover:text-white">
                            Articles
                        </Link>
                        <Link href={route('browse.universities')} className="font-semibold text-white/90 transition-colors hover:text-white">
                            Universities
                        </Link>
                        <Link href={route('events.index')} className="font-semibold text-white/90 transition-colors hover:text-white">
                            Events
                        </Link>
                    </div>
```

- [ ] **Step 2: Commit file changes**

Run:
```bash
git add resources/js/components/public-navbar.tsx
git commit -m "feat: add Articles navigation link to PublicNavbar"
```

---

### Task 2: Standardize Public Layout Navbar

**Files:**
- Modify: `resources/js/layouts/public-layout.tsx`

- [ ] **Step 1: Replace hardcoded navbar in PublicLayout with `<PublicNavbar />` component and clean up unused imports**

Replace the code in `resources/js/layouts/public-layout.tsx` with:

```tsx
import PublicFooter from '@/components/public-footer';
import PublicNavbar from '@/components/public-navbar';
import { PropsWithChildren } from 'react';

export default function PublicLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-sans text-[#1b1b18] selection:bg-[#079C4E] selection:text-white dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            {/* NAVBAR */}
            <PublicNavbar />

            {/* MAIN CONTENT */}
            <main className="flex-1 pt-16">{children}</main>

            {/* FOOTER */}
            <PublicFooter />
        </div>
    );
}
```

- [ ] **Step 2: Commit file changes**

Run:
```bash
git add resources/js/layouts/public-layout.tsx
git commit -m "refactor: use unified PublicNavbar in PublicLayout and cleanup layout code"
```

---

### Task 3: Build Verification

- [ ] **Step 1: Run npm build to verify production assets compile without error**

Run:
```bash
npm run build
```
Expected: Success.
