# Design Spec: Refactor Public Navbar Component & Standardize Usage

**Date:** 2026-06-07  
**Topic:** Extract navbar from `public-layout.tsx` to use `<PublicNavbar />` and add "Articles" link.  
**Status:** Under Review  

---

## 1. Goal Description
The objective is to:
1. Update `resources/js/components/public-navbar.tsx` to include an "Articles" navigation link directing to the `browse.articles` route.
2. Replace the hardcoded `<nav>` header block in `resources/js/layouts/public-layout.tsx` with the unified `<PublicNavbar />` component.
3. Clean up unused imports or variables in `public-layout.tsx` resulting from the navbar removal.
4. Verify all public pages (welcome, journals, articles, universities, events index, and event details) use `<PublicNavbar />` correctly and render the updated menu links.

---

## 2. Proposed Changes

### 2.1 File: `resources/js/components/public-navbar.tsx`
- Add "Articles" to the navigation links.
- Place it between "Journals" and "Universities" or in sequential order:
  - Journals (`journals.index`)
  - Articles (`browse.articles`)
  - Universities (`browse.universities`)
  - Events (`events.index`)

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

### 2.2 File: `resources/js/layouts/public-layout.tsx`
- Import `PublicNavbar` from `@/components/public-navbar`.
- Remove the inline hardcoded `<nav>` element and its contents.
- Replace it with `<PublicNavbar />`.
- Remove any unused React imports, `logoUrl`, or routing helpers if no longer needed by the layout.

---

## 3. Verification Plan
- Build assets using Vite/npm to check for compilation/syntax errors.
- Verify that the navbar on all public pages (especially `/events` and `/events/{slug}`) loads correctly with the updated navigation items.
