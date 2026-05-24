# Design Specification: Browse Universities UI/UX Refactoring

This document describes the design and specification for refactoring the public Browse Universities page to match the premium brand design aesthetic of the JurnalMu portal, extract reusable navigation components, and implement a fully responsive 3-column layout.

---

## Goal

Refactor the UI/UX of [Browse/Universities.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/Browse/Universities.tsx) to align with the premium brand aesthetic of [Journals/Index.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/Journals/Index.tsx). In the process, extract the navbar and footer layouts into reusable React components to eliminate code duplication across public pages, and ensure high-fidelity responsive behavior with robust pagination.

---

## Proposed Components

### 1. Reusable Public Navbar Component
* **Path**: [resources/js/components/public-navbar.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/components/public-navbar.tsx) [NEW]
* **Design**:
  * Fixed positioning (`fixed top-0 z-50 w-full`) with a green background (`bg-[#079C4E]`), white text, and a bottom border.
  * Implements backdrop-blur when scrolled.
  * Left Side: Majelis Diktilitbang logo (`logo_dark.png` inside a circular white background) and the title "Journal MU" in the brand font `El Messiri`.
  * Navigation Links: "Journals", "Universities", and "Events".
  * Right Side: Contextual authentication states fetched dynamically using Inertia's `usePage<SharedData>().props.auth`. If the user is authenticated, it shows a "Dashboard" button. Otherwise, it shows "Log in" and a yellow accent "Register" button (`bg-[#FCEE1F]`).

### 2. Reusable Public Footer Component
* **Path**: [resources/js/components/public-footer.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/components/public-footer.tsx) [NEW]
* **Design**:
  * Dark theme background (`bg-[#0f172a] text-gray-500`) with white text on hover.
  * Centered layout with navigation links (About Us, Privacy Policy, Contact Support, etc.) and the copyright statement.
  * Includes the optional Laravel/PHP versions dynamically fetched or passed down.

---

## Proposed Changes

### Backend Changes

#### [MODIFY] [PublicJournalController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/PublicJournalController.php)
* **University Query Modification**:
  * Update the query in the `browseUniversities` method to retrieve `logo_url` from the database.
  * Implement pagination on the university listing instead of fetching all universities at once. We will use a standard page size of `12` universities per page to match the journals index.
  * Query update:
    ```php
    $universityQuery = University::where('is_active', true)
        ->withCount([
            'journals' => function ($query) {
                $query->where('is_active', true)
                    ->where('approval_status', 'approved');
            },
        ])
        ->having('journals_count', '>', 0)
        ->orderBy('name');

    // Paginate the universities instead of using cache-remember directly, or structure cache carefully
    $universityStats = $universityQuery->paginate(12)->withQueryString();
    ```

### Frontend Changes

#### [NEW] [public-navbar.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/components/public-navbar.tsx)
* Create the shared navigation header component as defined above.

#### [NEW] [public-footer.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/components/public-footer.tsx)
* Create the shared footer component as defined above.

#### [MODIFY] [welcome.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/welcome.tsx)
* Clean up the hardcoded navbar and footer and replace them with `<PublicNavbar />` and `<PublicFooter />`.

#### [MODIFY] [Index.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/Journals/Index.tsx)
* Clean up the hardcoded navbar and footer and replace them with `<PublicNavbar />` and `<PublicFooter />`.

#### [MODIFY] [Universities.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/Browse/Universities.tsx)
* **Navbar & Footer integration**: Import and use `<PublicNavbar />` and `<PublicFooter />`.
* **Fonts Setup**: Add preconnect links and Google Fonts loading (`El Messiri` + `Plus Jakarta Sans`) inside the page `<Head>`.
* **Body Styling**: Apply the neutral grey/dark background (`bg-gray-50 dark:bg-[#0a0a0a]`).
* **Hero Header**:
  * Container: `bg-gradient-to-br from-[#079C4E] to-[#10816F] text-white pt-24 pb-20`.
  * **All Universities View**: Displays "Browse Universities" title in `El Messiri` and descriptive subtitle.
  * **Selected University View**: Displays a clean back button inside the hero, the university full name, and its accreditation status / journal counts.
* **Search / Select Panel**:
  * Implemented as a card overlapping the hero section or positioned nicely below it (`-mt-10 mb-8 mx-auto max-w-7xl`).
  * Features the search bar and the combobox side-by-side.
* **Grid Layout (All Universities View)**:
  * Styled as `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.
  * Highlight the logo and name inside each card:
    * Displays the university logo using `logo_url` in a rounded square layout (`h-16 w-16 bg-white border border-gray-100 dark:border-zinc-800 rounded-xl p-2 shrink-0 flex items-center justify-center object-contain`).
    * Displays a beautiful brand-themed initials placeholder if `logo_url` is null.
    * University name rendered in bold, larger text with dynamic color hover effects.
* **Pagination (All Universities)**:
  * Implements responsive pagination controls that collapse to simple back/next buttons on mobile, and standard page number lists on desktop.

---

## Verification Plan

### Automated Tests
* Run existing test suites to ensure no regressions:
  * `docker exec -it jurnal_mu_app php artisan test`

### Manual Verification
* Access `/browse/universities` on desktop and inspect the 3-column layout, branding, logos, and pagination.
* Toggle mobile view in browser Developer Tools to verify responsive single-column layouts and mobile pagination.
* Select a university and check that its journals are listed with pagination, and that the header adapts dynamically.
* Ensure `/journals` and `/` (welcome page) still display the navbar and footer correctly.
