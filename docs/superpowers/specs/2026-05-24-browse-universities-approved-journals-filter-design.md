# Browse Universities Approved Journals Filter Spec

This specification defines the query constraint to only display universities that have at least one approved journal on the Browse Universities page.

## Proposed Changes

### 1. Backend: [PublicUniversityController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/PublicUniversityController.php)
* Update the base query in `index()` to restrict the university search using `whereHas('journals')` with status checks:
  ```php
  $query = University::query()
      ->where('is_active', true)
      ->whereHas('journals', function ($q) {
          $q->where('is_active', true)
            ->where('approval_status', 'approved');
      })
      ->withCount(['journals' => function ($q) {
          $q->where('is_active', true)
            ->where('approval_status', 'approved');
      }]);
  ```

## Verification Plan

### Automated Tests
* Update [PublicUniversityTest.php](file:///C:/xampp/htdocs/jurnal_mu/tests/Feature/PublicUniversityTest.php) to:
  * Create one university with an approved journal and one university without journals.
  * Assert only the university with approved journals is returned in the browse listing.
  * Run tests: `docker exec -i jurnal-mu-app php artisan test --filter=PublicUniversityTest`
