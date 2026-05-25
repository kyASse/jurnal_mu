# Browse Universities Search & Filter Refactoring Spec

This specification defines the implementation to replace the combobox filter on the Browse Universities page with a multi-criteria search and filter bar that matches the UI/UX style of the Browse Journals page.

## Proposed Changes

### 1. Frontend: [Universities.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/Browse/Universities.tsx)
* **Remove**: `UniversityFilterCombobox` import and usage.
* **Add**: `Input`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, and `SelectItem` imports.
* **Props**: Access `accreditationOptions` and `filters` (containing `search`, `accreditation`, `sort`).
* **State Management**:
  * `search` state for text query.
  * `accreditationFilter` state for accreditation status option.
  * `sortFilter` state for sorting option.
* **Layout**:
  * A search input spanning full width with a search icon prefix.
  * A grid containing:
    * Select for Accreditations.
    * Select for Sorting (options: Name A-Z, Journals Count High-Low).
    * Action buttons: "Search" (submit) and "Clear" (if filters active).

### 2. Backend: [PublicUniversityController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/PublicUniversityController.php)
* Ensure `filters` passed to `Browse/Universities` includes `search`, `accreditation`, and `sort` query parameters so state can be correctly rehydrated on page reload.

## Verification Plan

### Automated Tests
* Update [PublicUniversityTest.php](file:///C:/xampp/htdocs/jurnal_mu/tests/Feature/PublicUniversityTest.php) to assert that:
  * Page receives `filters` and `accreditationOptions`.
  * Filtering by search query, accreditation status, or sort correctly updates the returned listing.
  * Run tests: `docker exec -i jurnal-mu-app php artisan test --filter=PublicUniversityTest`

### Manual Verification
* Run Vite production compilation: `npm run build`
