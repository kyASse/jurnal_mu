# University Profile Features Design Spec

Provide public-facing pages for Muhammadiyah universities across Indonesia. It includes browsing universities, filtering by accreditation/sorting, viewing comprehensive university statistics, journal classification distributions, and searching/filtering articles published by their journals.

## Proposed Changes

### Backend Components

#### [NEW] [PublicUniversityController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/PublicUniversityController.php)
Create a dedicated controller to manage public university list and detail views.
* **`index` method**:
  * Fetch active universities.
  * Apply query filters: search (name/code/short name), accreditation status.
  * Eager load `journals_count` (active, approved journals).
  * Sort by Name (A-Z) or Journal Count (highest first).
  * Paginate results (12 per page) and return Inertia render of `Browse/Universities`.
* **`show` method**:
  * Load university details.
  * Fetch statistics:
    * Total journals count.
    * Total articles count (through university journals).
    * Scopus-indexed journals count.
  * Get Sinta distribution classification data (aggregating journal Sinta ranks).
  * Fetch paginated articles (10 per page) with search queries (title, journal, publication year).
  * Fetch all approved journals under this university for quick reference.
  * Return Inertia render of `Browse/UniversityProfile`.

#### [MODIFY] [web.php](file:///C:/xampp/htdocs/jurnal_mu/routes/web.php)
* Register new public routes:
  * `GET /browse/universities` mapped to `PublicUniversityController@index`.
  * `GET /browse/universities/{university}` mapped to `PublicUniversityController@show`.
* Clean up or redirect the legacy `PublicJournalController@browseUniversities` route if necessary.

---

### Frontend Components

#### [MODIFY] [Universities.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/Pages/Browse/Universities.tsx)
Overhaul existing list page:
* **Search & Filters**:
  * Search input for name/code.
  * Select dropdown for Accreditation.
  * Select dropdown for Sort (Alphabetical, Journal Count).
* **Grid Layout**:
  * Display university cards: logo image (fallback to Building icon/initials avatar if null), Name, Short name, Code, accreditation badge, city/province, and total journals count badge.
  * Click to navigate to `/browse/universities/{id}`.

#### [NEW] [UniversityProfile.tsx](file:///C:/xampp/js/Pages/Browse/UniversityProfile.tsx)
Create a new university profile page:
* **Header / Hero Section**:
  * Display logo, university name, code, accreditation status, cluster, website link, and address.
* **Stats Section**:
  * Grid showing count cards: Total Journals, Total Articles, Scopus-Indexed Journals, and Sinta Breakdown summary.
* **Classification Charts**:
  * Bar/Pie charts representing the journal distribution by Sinta Rank (S1 - S6, unaccredited).
* **Articles Database**:
  * Filter bar (Search by title, filter by Journal, filter by Year).
  * Paginated table showing article title/authors, journal title, year, and action buttons for DOI/PDF URLs.
* **Registered Journals Section**:
  * Carousel/Grid of journals belonging to the university.

---

## Verification Plan

### Automated Verification
* Run PHPUnit/Pest tests to verify route resolution:
  `php artisan test --filter=PublicUniversityTest`
* Verify database relationships and performance (check query count for N+1 issues).

### Manual Verification
* Access `/browse/universities` in browser.
* Search and apply accreditation filters, verify list updates.
* Click university card, verify navigation to `/browse/universities/{id}`.
* Verify stats widgets display correct count.
* Filter articles by title search, journal, and year; verify article table updates.
