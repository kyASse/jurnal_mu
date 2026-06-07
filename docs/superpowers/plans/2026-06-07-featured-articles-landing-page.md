# Featured Articles on Landing Page Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the article section on the landing page to display a random selection of articles, and rename all occurrences from `recentArticles` to `featuredArticles`.

**Architecture:** Update `PublicHomeService.php` to fetch random articles and use the new cache key. Propagate variables through `HomeController.php` to `welcome.tsx` and rename in `PublicHomeTest.php`.

**Tech Stack:** Laravel, PHP 8.2+, Inertia.js, React 18.

---

### Task 1: Update PublicHomeService

**Files:**
- Modify: `app/Services/PublicHomeService.php`

- [ ] **Step 1: Replace getRecentArticles() with getFeaturedArticles() utilizing inRandomOrder()**

Update `app/Services/PublicHomeService.php` (lines 165-187):

```php
    /**
     * Get 6 featured articles in random order.
     */
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

- [ ] **Step 2: Commit file changes**

Run:
```bash
git add app/Services/PublicHomeService.php
git commit -m "feat: change recent articles to randomly selected featured articles in PublicHomeService"
```

---

### Task 2: Update HomeController

**Files:**
- Modify: `app/Http/Controllers/HomeController.php`

- [ ] **Step 1: Update controller to call getFeaturedArticles() and pass featuredArticles to view**

Update `app/Http/Controllers/HomeController.php` (lines 25-36):

```php
        $featuredArticles = $this->homeService->getFeaturedArticles();
        $topUniversities = $this->homeService->getTopUniversities();

        return Inertia::render('welcome', [
            'featuredJournals' => $featuredJournals,
            'totalUniversities' => $overallStats['totalUniversities'],
            'totalJournals' => $overallStats['totalJournals'],
            'totalArticles' => $overallStats['totalArticles'],
            'scientificFields' => $scientificFields,
            'upcomingEvents' => $upcomingEvents,
            'featuredArticles' => $featuredArticles,
            'topUniversities' => $topUniversities,
        ]);
```

- [ ] **Step 2: Commit file changes**

Run:
```bash
git add app/Http/Controllers/HomeController.php
git commit -m "refactor: rename recentArticles to featuredArticles in HomeController"
```

---

### Task 3: Update welcome.tsx

**Files:**
- Modify: `resources/js/pages/welcome.tsx`

- [ ] **Step 1: Update welcome component props type definition, destructuring, and UI sections**

Replace lines 33-45 in `resources/js/pages/welcome.tsx` with:

```tsx
    featuredArticles: Array<{
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
```

Replace line 77:
```tsx
        featuredArticles,
```

Replace lines 235-320 (the entire articles section block):

```tsx
                    {/* FEATURED ARTICLES SECTION */}
                    {featuredArticles && featuredArticles.length > 0 && (
                        <div className="mt-24 mb-16">
                            <div className="mb-12 flex items-end justify-between">
                                <div>
                                    <h2 className="font-heading text-3xl font-bold text-[#079C4E]" style={{ fontFamily: '"El Messiri", serif' }}>
                                        Featured Articles
                                    </h2>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                                        Explore research publications from Muhammadiyah scholars.
                                    </p>
                                </div>
                                <Link
                                    href={route('browse.articles')}
                                    className="group flex items-center font-semibold text-[#1A2A75] hover:text-[#079C4E]"
                                >
                                    Browse All Articles
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {featuredArticles.map((article) => (
                                    <div
                                        key={article.id}
                                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-zinc-900"
                                    >
                                        <div className="space-y-3">
                                            <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#079C4E] dark:bg-emerald-950/30 dark:text-emerald-400">
                                                {article.journal.title}
                                            </div>

                                            <h3 className="line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-[#079C4E] dark:text-white">
                                                {article.article_url ? (
                                                    <a href={article.article_url} target="_blank" rel="noopener noreferrer">
                                                        {article.title}
                                                    </a>
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
                                                        <span>
                                                            {new Date(article.publication_date).toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center gap-3">
                                            {article.pdf_url ? (
                                                <Button asChild size="sm" className="bg-[#079C4E] text-white hover:bg-[#068a45]">
                                                    <a href={article.pdf_url} target="_blank" rel="noopener noreferrer">
                                                        Read Full PDF
                                                    </a>
                                                </Button>
                                            ) : article.article_url ? (
                                                <Button asChild size="sm" className="bg-[#079C4E] text-white hover:bg-[#068a45]">
                                                    <a href={article.article_url} target="_blank" rel="noopener noreferrer">
                                                        View Article
                                                    </a>
                                                </Button>
                                            ) : null}
                                            <Button asChild variant="outline" size="sm" className="border-gray-200 dark:border-gray-700">
                                                <a href={article.google_scholar_url} target="_blank" rel="noopener noreferrer">
                                                    Google Scholar
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
```

- [ ] **Step 2: Commit file changes**

Run:
```bash
git add resources/js/pages/welcome.tsx
git commit -m "refactor: rename recentArticles to featuredArticles and update UI layout in welcome view"
```

---

### Task 4: Update PublicHomeTest

**Files:**
- Modify: `tests/Feature/PublicHomeTest.php`

- [ ] **Step 1: Replace assertions and cache keys for recentArticles with featuredArticles**

Replace line 41:
```php
        ->has('featuredArticles')
```

Replace lines 75-91 (caches featured articles test case):

```php
it('caches the featured articles output', function () {
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

    expect(Cache::has('home_featured_articles'))->toBeFalse();
    $this->get('/');
    expect(Cache::has('home_featured_articles'))->toBeTrue();
    expect(Cache::get('home_featured_articles')->first()['title'])->toBe('Test Article');
});
```

- [ ] **Step 2: Commit file changes**

Run:
```bash
git add tests/Feature/PublicHomeTest.php
git commit -m "test: update public home feature tests for featuredArticles prop and cache"
```

---

### Task 5: Build Verification

- [ ] **Step 1: Run npm build to verify production assets compile without error**

Run:
```bash
npm run build
```
Expected: Success.
