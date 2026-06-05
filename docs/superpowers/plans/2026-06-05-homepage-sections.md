# Homepage Recent Articles and Top Universities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add recent articles and top universities sections to the portal homepage with cache support and a premium layout.

**Architecture:** Extend PublicHomeService with cached query methods, pass data via HomeController to the Inertia welcome page, and build responsive grid components in welcome.tsx.

**Tech Stack:** Laravel, Eloquent, Inertia.js, React, Tailwind CSS, Pest.

---

### Task 1: Backend Service Methods in PublicHomeService

**Files:**
- Modify: `app/Services/PublicHomeService.php`
- Test: `tests/Feature/PublicHomeTest.php`

- [ ] **Step 1: Write Pest tests for cache behavior**
  Add these two test cases to `tests/Feature/PublicHomeTest.php`:
  ```php
  it('caches the recent articles output', function () {
      $university = University::factory()->create(['is_active' => true]);
      $journal = Journal::factory()->create([
          'university_id' => $university->id,
          'is_active' => true,
      ]);
      \App\Models\Article::factory()->create([
          'journal_id' => $journal->id,
          'title' => 'Test Article',
          'publication_date' => now(),
      ]);

      expect(Cache::has('home_recent_articles'))->toBeFalse();
      $this->get('/');
      expect(Cache::has('home_recent_articles'))->toBeTrue();
      expect(Cache::get('home_recent_articles')->first()['title'])->toBe('Test Article');
  });

  it('caches the top universities output', function () {
      $university = University::factory()->create(['is_active' => true]);
      $journal = Journal::factory()->create([
          'university_id' => $university->id,
          'is_active' => true,
          'approval_status' => 'approved',
      ]);

      expect(Cache::has('home_top_universities'))->toBeFalse();
      $this->get('/');
      expect(Cache::has('home_top_universities'))->toBeTrue();
      expect(Cache::get('home_top_universities')->first()['name'])->toBe($university->name);
  });
  ```

- [ ] **Step 2: Run the tests to verify failure**
  Run in terminal:
  `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/PublicHomeTest.php`
  Expected: FAIL (missing methods or properties in controller/service)

- [ ] **Step 3: Implement cached methods in PublicHomeService**
  Add these methods inside `PublicHomeService` in `app/Services/PublicHomeService.php`:
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

- [ ] **Step 4: Run the tests to verify caching methods exist**
  Note: This test will still fail on controller integration until Task 2 is complete.
  Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/PublicHomeTest.php`

- [ ] **Step 5: Commit**
  ```bash
  git add app/Services/PublicHomeService.php tests/Feature/PublicHomeTest.php
  git commit -m "feat: add cached queries for recent articles and top universities in service"
  ```

---

### Task 2: Controller Integration and Data Prop Passing

**Files:**
- Modify: `app/Http/Controllers/HomeController.php`
- Modify: `tests/Feature/PublicHomeTest.php`

- [ ] **Step 1: Update Inertia assertion in PublicHomeTest**
  Modify the first test in `tests/Feature/PublicHomeTest.php` to assert the presence of `recentArticles` and `topUniversities` props:
  ```php
  $response->assertInertia(fn (AssertableInertia $page) => $page
      ->component('welcome')
      ->has('featuredJournals', 4)
      ->has('totalUniversities')
      ->has('totalJournals')
      ->has('totalArticles')
      ->has('scientificFields')
      ->has('recentArticles')
      ->has('topUniversities')
  );
  ```

- [ ] **Step 2: Run tests to verify failure**
  Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/PublicHomeTest.php`
  Expected: FAIL (missing recentArticles and topUniversities props in welcome page render)

- [ ] **Step 3: Modify HomeController to fetch and pass props**
  Update `index()` method of `HomeController` in `app/Http/Controllers/HomeController.php`:
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

- [ ] **Step 4: Run Pest tests to verify success**
  Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/PublicHomeTest.php`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add app/Http/Controllers/HomeController.php tests/Feature/PublicHomeTest.php
  git commit -m "feat: integrate recent articles and top universities in HomeController"
  ```

---

### Task 3: welcome.tsx Page Props & Recent Articles Section

**Files:**
- Modify: `resources/js/pages/welcome.tsx`

- [ ] **Step 1: Update props interfaces in welcome.tsx**
  Add imports for `User`, `Calendar`, and update interface `WelcomeProps` in `resources/js/pages/welcome.tsx`:
  ```typescript
  // Add User to existing lucide-react imports if not present:
  import { ArrowRight, BookOpen, Clock, GraduationCap, LayoutDashboard, Library, MapPin, Search, User, Calendar } from 'lucide-react';

  interface WelcomeProps extends SharedData {
      // Existing properties ...
      recentArticles: Array<{
          id: number;
          title: string;
          authors_list: string;
          publication_date?: string;
          article_url?: string;
          pdf_url?: string;
          google_scholar_url: string;
          journal: {
              id: number;
              title: string;
          };
      }>;
      topUniversities: Array<{
          id: number;
          name: string;
          short_name: string | null;
          city: string | null;
          province: string | null;
          logo_url: string | null;
          journals_count: number;
      }>;
  }
  ```

- [ ] **Step 2: Destructure recentArticles in welcome() function**
  Add `recentArticles` and `topUniversities` to the destructured props line inside `Welcome()`:
  ```typescript
  const { auth, featuredJournals, totalUniversities, totalJournals, totalArticles, scientificFields, upcomingEvents, recentArticles, topUniversities } =
      usePage<WelcomeProps>().props;
  ```

- [ ] **Step 3: Insert Recent Articles section in welcome.tsx**
  Add the section above the `UPCOMING EVENTS SECTION` (around line 200, before `upcomingEvents && ...`):
  ```tsx
  {/* RECENT ARTICLES SECTION */}
  {recentArticles && recentArticles.length > 0 && (
      <div className="mt-24 mb-16">
          <div className="mb-12 flex items-end justify-between">
              <div>
                  <h2 className="font-heading text-3xl font-bold text-[#079C4E]" style={{ fontFamily: '"El Messiri", serif' }}>
                      Recent Articles
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Read the latest publications from Muhammadiyah researchers.</p>
              </div>
              <Link href={route('browse.articles')} className="group flex items-center font-semibold text-[#1A2A75] hover:text-[#079C4E]">
                  Browse All Articles
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
              {recentArticles.map((article) => (
                  <div key={article.id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-zinc-900">
                      <div className="space-y-3">
                          <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#079C4E] dark:bg-emerald-950/30 dark:text-emerald-400">
                              {article.journal.title}
                          </div>
                          
                          <h3 className="line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-[#079C4E] dark:text-white">
                              {article.article_url ? (
                                  <a href={article.article_url} target="_blank" rel="noopener noreferrer">{article.title}</a>
                              ) : (
                                  article.title
                              )}
                          </h3>

                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1.5">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="line-clamp-1">{article.authors_list}</span>
                              </div>
                              {article.publication_date && (
                                  <div className="flex items-center gap-1.5">
                                      <Calendar className="h-4 w-4 text-gray-400" />
                                      <span>{new Date(article.publication_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="mt-6 flex items-center gap-3">
                          {article.pdf_url ? (
                              <Button asChild size="sm" className="bg-[#079C4E] text-white hover:bg-[#068a45]">
                                  <a href={article.pdf_url} target="_blank" rel="noopener noreferrer">Read Full PDF</a>
                              </Button>
                          ) : article.article_url ? (
                              <Button asChild size="sm" className="bg-[#079C4E] text-white hover:bg-[#068a45]">
                                  <a href={article.article_url} target="_blank" rel="noopener noreferrer">View Article</a>
                              </Button>
                          ) : null}
                          <Button asChild variant="outline" size="sm" className="border-gray-200 dark:border-gray-700">
                              <a href={article.google_scholar_url} target="_blank" rel="noopener noreferrer">Google Scholar</a>
                          </Button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  )}
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add resources/js/pages/welcome.tsx
  git commit -m "feat: render recent articles section in welcome.tsx"
  ```

---

### Task 4: welcome.tsx Top Universities Section

**Files:**
- Modify: `resources/js/pages/welcome.tsx`

- [ ] **Step 1: Add getInitials helper function**
  Add this helper function at the top of the file (before the `Welcome` component definition):
  ```typescript
  function getInitials(name: string, shortName?: string | null): string {
      if (shortName) return shortName.substring(0, 3).toUpperCase();
      const words = name.split(' ');
      if (words.length >= 3) {
          return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      } else if (words.length === 2) {
          return (words[0][0] + words[1][0]).toUpperCase();
      } else {
          return name.substring(0, 3).toUpperCase();
      }
  }
  ```

- [ ] **Step 2: Insert Top Universities section in welcome.tsx**
  Add the section below the `UPCOMING EVENTS SECTION` (around the journals by subject section):
  ```tsx
  {/* TOP UNIVERSITIES SECTION */}
  {topUniversities && topUniversities.length > 0 && (
      <div className="mt-24 mb-16">
          <div className="mb-12 flex items-end justify-between">
              <div>
                  <h2 className="font-heading text-3xl font-bold text-[#079C4E]" style={{ fontFamily: '"El Messiri", serif' }}>
                      Top Universities
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Leading Muhammadiyah institutions by active scientific journals.</p>
              </div>
              <Link href={route('browse.universities')} className="group flex items-center font-semibold text-[#1A2A75] hover:text-[#079C4E]">
                  Browse All Universities
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topUniversities.map((uni) => (
                  <Link
                      key={uni.id}
                      href={route('browse.universities.show', uni.id)}
                      className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-zinc-900"
                  >
                      {/* Logo or Initials placeholder */}
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-2 border border-gray-100 group-hover:border-[#079C4E]/20 dark:bg-zinc-800 dark:border-zinc-800">
                          {uni.logo_url ? (
                              <img src={uni.logo_url} alt={uni.name} className="h-full w-full object-contain" />
                          ) : (
                              <span className="text-lg font-bold text-[#079C4E] dark:text-emerald-400">
                                  {getInitials(uni.name, uni.short_name)}
                              </span>
                          )}
                      </div>

                      {/* Details */}
                      <div className="flex-grow space-y-1 min-w-0">
                          <h3 className="truncate text-lg font-bold text-gray-900 transition-colors group-hover:text-[#079C4E] dark:text-white">
                              {uni.name}
                          </h3>
                          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                              {uni.city ? `${uni.city}, ${uni.province || ''}` : 'Muhammadiyah Network'}
                          </p>
                          <div className="pt-1">
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#1A2A75] dark:bg-blue-950/30 dark:text-blue-300">
                                  {uni.journals_count} {uni.journals_count === 1 ? 'Journal' : 'Journals'}
                              </span>
                          </div>
                      </div>
                  </Link>
              ))}
          </div>
      </div>
  )}
  ```

- [ ] **Step 3: Run Pest tests and build frontend to verify code is valid**
  Run:
  `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/PublicHomeTest.php`
  `npm run build` or `npm run dev` to verify compile succeeds.

- [ ] **Step 4: Commit**
  ```bash
  git add resources/js/pages/welcome.tsx
  git commit -m "feat: render top universities section in welcome.tsx"
  ```
