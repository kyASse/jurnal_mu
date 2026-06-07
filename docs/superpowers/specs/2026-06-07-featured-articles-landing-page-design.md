# Design Spec: Featured Articles on Landing Page

**Date:** 2026-06-07  
**Topic:** Change landing page article section from recent to randomly shuffled featured articles.  
**Status:** Under Review  

---

## 1. Goal Description
The objective is to:
1. Change the landing page article section to display randomly shuffled articles instead of the most recent ones.
2. Align the terminology across service, controller, view, and test files by renaming `recentArticles` to `featuredArticles`.
3. Update the UI section header to "Featured Articles" to match the "Featured Journals" section.

---

## 2. Proposed Changes

### 2.1 Service: `app/Services/PublicHomeService.php`
- Rename `getRecentArticles()` to `getFeaturedArticles()`.
- Update the query to fetch random articles using `inRandomOrder()` and cache key `home_featured_articles`:
  ```php
  public function getFeaturedArticles()
  {
      return Cache::remember('home_featured_articles', now()->addHours(2), function () {
          return Article::with(['journal.university', 'journal.scientificField'])
              ->inRandomOrder()
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
  ```

### 2.2 Controller: `app/Http/Controllers/HomeController.php`
- Call `$this->homeService->getFeaturedArticles()` and pass `featuredArticles` to the welcome page render.

### 2.3 View: `resources/js/pages/welcome.tsx`
- Rename prop `recentArticles` to `featuredArticles` in view component and interfaces.
- Update UI header text from "Recent Articles" to "Featured Articles".
- Update description text to: "Explore research publications from Muhammadiyah scholars."

### 2.4 Tests: `tests/Feature/PublicHomeTest.php`
- Update test cases asserting the `recentArticles` prop to `featuredArticles`.
- Update test cases verifying `home_recent_articles` cache to `home_featured_articles`.

---

## 3. Verification Plan
- Run tests (`docker exec -i jurnal-mu-app php artisan test`) to verify all assertions pass.
- Build assets using Vite/npm to check for compilation/syntax errors.
