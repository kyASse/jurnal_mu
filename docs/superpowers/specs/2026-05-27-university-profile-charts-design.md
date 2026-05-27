# University Profile Charts Design

Display dual y-axes chart on the public University Profile page showing cumulative journal growth and yearly article publications.

## Proposed Changes

### 1. Backend: [PublicUniversityController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/PublicUniversityController.php)

In the `show` method, we will add:
- Query to get the oldest article publication year for each approved journal of the university:
  ```php
  $driver = DB::connection()->getDriverName();
  $yearRaw = match ($driver) {
      'sqlite' => "strftime('%Y', publication_date)",
      'pgsql' => "extract(year from publication_date)",
      default => "YEAR(publication_date)",
  };

  $universityJournals = Journal::where('university_id', $university->id)
      ->where('is_active', true)
      ->where('approval_status', 'approved')
      ->get(['id', 'first_published_year']);

  $journalMinYears = DB::table('articles')
      ->select('journal_id', DB::raw("MIN($yearRaw) as min_year"))
      ->whereIn('journal_id', $universityJournals->pluck('id'))
      ->whereNotNull('publication_date')
      ->groupBy('journal_id')
      ->pluck('min_year', 'journal_id')
      ->toArray();
  ```
- Calculate the `established_year` for each journal:
  - If `first_published_year` is set, use it.
  - Else if oldest article year is set, use it.
  - Else fallback to the current year.
- Build the range of years:
  - `start_year` = minimum established year (fallback: current year - 4).
  - `end_year` = current year.
- Query article counts grouped by publication year.
- Calculate:
  - Cumulative journals: Count of journals where `established_year <= $year`.
  - Articles: Count of articles published in `$year`.
- Pass `chartData` to Inertia render.

### 2. Frontend: [UniversityProfile.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/Browse/UniversityProfile.tsx)

- Receive `chartData` prop:
  ```typescript
  interface ChartData {
      years: number[];
      journals: number[];
      articles: number[];
  }
  ```
- Render `ReactApexChart` with:
  - `series`:
    - `Jurnal (Kumulatif)` (type: `line`, data: `chartData.journals`)
    - `Artikel Terbit` (type: `column`, data: `chartData.articles`)
  - Dual y-axes configured:
    - Left y-axis for Jurnal (integer formatting).
    - Right y-axis for Artikel (integer formatting).
  - Clean colors (`#079C4E` green for line, `#3b82f6` blue for columns).

## Verification Plan

### Automated Tests
- Run `tests/Feature/PublicUniversityTest.php` to verify controller loads correctly.
- Add test assertions checking `chartData` is passed with correct structure and data.

### Manual Verification
- Access the university profile page.
- Inspect the ApexCharts component rendering correct cumulative and yearly numbers.
