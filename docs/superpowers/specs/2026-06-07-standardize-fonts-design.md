# Design Spec: Standardize Global Fonts

**Date:** 2026-06-07  
**Topic:** Load brand fonts globally to prevent fallback font rendering inconsistencies.  
**Status:** Under Review  

---

## 1. Goal Description
The objective is to fix font loading inconsistency:
1. Brand fonts (`Plus Jakarta Sans` and `El Messiri`) are currently loaded locally in the `welcome.tsx` view.
2. Other pages (like Events, Articles, Universities) do not load these fonts, causing navigation/footer elements to render with system fallback fonts.
3. We will load these brand fonts globally in the master template `app.blade.php` to ensure consistent typography across all public pages.

---

## 2. Proposed Changes

### 2.1 File: `resources/views/app.blade.php`
- Add Google Fonts preconnect and link tags to the `<head>` of `app.blade.php`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  ```
- Keep or replace bunny.net links to minimize loading redundancy if not needed, but keeping it ensures backwards compatibility with admin/user layouts that might depend on `Instrument Sans`.

### 2.2 File: `resources/js/pages/welcome.tsx`
- Remove the Google Fonts `<link>` preconnect and stylesheet loader tags from the `<Head>` block.

---

## 3. Verification Plan
- Build assets using Vite/npm to check for compilation/syntax errors.
- Inspect rendered pages (Home, Events, Articles, etc.) to verify all public pages use the exact same brand fonts (`Plus Jakarta Sans` for body/navbar/footer and `El Messiri` for titles).
