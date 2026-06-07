# Design Spec: Homepage Recent Articles and Top Universities Sections

**Date:** 2026-06-05  
**Topic:** Adding Recent Articles and Top Universities sections to the Homepage  
**Status:** Approved  

---

## 1. Objectives & Requirements

### Objectives
- Enhance the landing page experience by showcasing actual research articles and participating universities.
- Maintain premium look and feel of JurnalMu.
- Ensure efficient load times by using Laravel's Cache facade.

### Requirements
- **Recent Articles**:
  - Display exactly 6 articles.
  - Sorted by publication date descending, then creation timestamp.
  - Rendered in a clean, 2-column grid layout.
  - Display title, author list, publication date, and parent journal.
  - Cache results for 2 hours to avoid database load.
- **Top Universities**:
  - Display exactly 6 active universities.
  - Sorted by count of approved journals descending, then name ascending.
  - Rendered in a 3-column grid layout.
  - Display logo (or initials placeholder), name, city, province, and journal count badge.
  - Cache results for 6 hours.

---

## 2. Technical Design

### A. Backend Changes

#### 1. PublicHomeService (`app/Services/PublicHomeService.php`)
We will add two cache-backed methods:
```php
/**
 * Get the 6 most recent articles.
 */
public function getRecentArticles()
{
    return Cache::remember('home_recent_articles', now()->addHours(2), function () {
        return Article::with(['journal.university', 'journal.scientificField'])
            ->orderBy('publication_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(fn ($article) => [
                'id' => $article->id,
                'title' => $article->title,
                'authors_list' => $article->authors_list,
                'publication_date' => $article->publication_date?->format('Y-m-d'),
                'article_url' => $article->article_url,
                'pdf_url' => $article->pdf_url,
                'google_scholar_url' => $article->google_scholar_url,
                'journal' => [
                    'id' => $article->journal->id,
                    'title' => $article->journal->title,
                ],
            ]);
    });
}

/**
 * Get top 6 universities by active journal count.
 */
public function getTopUniversities()
{
    return Cache::remember('home_top_universities', now()->addHours(6), function () {
        return University::where('is_active', true)
            ->whereHas('journals', function ($q) {
                $q->where('is_active', true)
                    ->where('approval_status', 'approved');
            })
            ->withCount(['journals' => function ($q) {
                $q->where('is_active', true)
                    ->where('approval_status', 'approved');
            }])
            ->orderByDesc('journals_count')
            ->orderBy('name', 'asc')
            ->limit(6)
            ->get()
            ->map(fn ($uni) => [
                'id' => $uni->id,
                'name' => $uni->name,
                'short_name' => $uni->short_name,
                'city' => $uni->city,
                'province' => $uni->province,
                'logo_url' => $uni->logo_url,
                'journals_count' => $uni->journals_count,
            ]);
    });
}
```

#### 2. HomeController (`app/Http/Controllers/HomeController.php`)
Pass the variables to the Inertia render response:
```php
public function index(Request $request): Response
{
    $featuredJournals = $this->homeService->getFeaturedJournals();
    $overallStats = $this->homeService->getOverallStats();
    $scientificFields = $this->homeService->getTopScientificFields();
    $upcomingEvents = $this->homeService->getUpcomingEvents();
    $recentArticles = $this->homeService->getRecentArticles();
    $topUniversities = $this->homeService->getTopUniversities();

    return Inertia::render('welcome', [
        'featuredJournals' => $featuredJournals,
        'totalUniversities' => $overallStats['totalUniversities'],
        'totalJournals' => $overallStats['totalJournals'],
        'totalArticles' => $overallStats['totalArticles'],
        'scientificFields' => $scientificFields,
        'upcomingEvents' => $upcomingEvents,
        'recentArticles' => $recentArticles,
        'topUniversities' => $topUniversities,
    ]);
}
```

### B. Frontend Changes

#### 1. welcome.tsx (`resources/js/pages/welcome.tsx`)
- Accept `recentArticles` and `topUniversities` as props.
- Add helper function `getInitials(name, shortName)` if not already available (copied/derived from `Browse/Universities.tsx`).
- Insert **Recent Articles** section above **Upcoming Events**:
  - Grid: `grid grid-cols-1 md:grid-cols-2 gap-6`.
  - Content: Title, metadata with Lucide icons (`User` for authors, `Calendar` for date), badge for journal name, links to view article/PDF/scholar.
- Insert **Top Universities** section below **Upcoming Events**:
  - Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`.
  - Card: Large initials/logo badge on the left, Name/Location on the right, and a badge with the count of journals. Action link routes to `browse.universities.show`.

---

## 3. Verification Plan
1. **Cache Clearing**:
   - Run `php artisan cache:clear` to verify that new queries execute and cache successfully.
2. **Visual Verification**:
   - Inspect the homepage layout. Check spacing, responsive breakpoints (desktop, tablet, mobile).
   - Verify that clicking university cards redirects to their profile.
   - Verify that article cards direct to external or details pages.
