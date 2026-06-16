# Homepage Article Casing and Citation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correctly format all-caps featured article titles on the homepage to Title Case and add DOI and Export RIS buttons matching the article list page.

**Architecture:** Format titles on the backend Service before caching to ensure high performance and clean frontend code. Update the homepage frontend component to receive new fields and render the interactive DOI and RIS export buttons.

**Tech Stack:** PHP (Laravel), React, TypeScript, Tailwind CSS, Lucide React

---

### Task 1: Backend Service Title Casing and Field Mapping

**Files:**
- Modify: `app/Services/PublicHomeService.php`

- [ ] **Step 1: Add helper method `toTitleCaseIfAllUpper` in `PublicHomeService.php`**

```php
    /**
     * Convert title to Title Case only if it is in ALL CAPS.
     */
    private function toTitleCaseIfAllUpper(string $title): string
    {
        // Strip out numbers, punctuation, and spaces to see if remaining letters are fully uppercase
        $lettersOnly = preg_replace('/[^a-zA-Z]/', '', $title);
        if (empty($lettersOnly)) {
            return $title;
        }

        // If the letters are all uppercase, apply title case
        if (strtoupper($lettersOnly) === $lettersOnly) {
            $minorWords = ['and', 'or', 'in', 'of', 'to', 'the', 'a', 'an', 'dan', 'di', 'ke', 'dari', 'pada', 'untuk', 'dengan', 'yang', 'atau', 'serta', 'terhadap', 'dalam', 'oleh', 'bagi'];
            
            $words = explode(' ', strtolower($title));
            $formattedWords = [];
            foreach ($words as $index => $word) {
                if ($index > 0 && in_array($word, $minorWords)) {
                    $formattedWords[] = $word;
                } else {
                    $formattedWords[] = ucfirst($word);
                }
            }
            return implode(' ', $formattedWords);
        }

        return $title;
    }
```

- [ ] **Step 2: Update `getFeaturedArticles` mapping in `PublicHomeService.php`**

Modify `getFeaturedArticles` to use the helper and map more fields.

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
                    'title' => $this->toTitleCaseIfAllUpper($article->title),
                    'authors_list' => $article->authors_list,
                    'publication_date' => $article->publication_date?->format('Y-m-d'),
                    'article_url' => $article->article_url,
                    'pdf_url' => $article->pdf_url,
                    'google_scholar_url' => $article->google_scholar_url,
                    'authors' => $article->authors,
                    'volume' => $article->volume,
                    'issue' => $article->issue,
                    'pages' => $article->pages,
                    'doi' => $article->doi,
                    'doi_url' => $article->doi_url,
                    'abstract' => $article->abstract,
                    'journal' => [
                        'id' => $article->journal->id,
                        'title' => $article->journal->title,
                    ],
                ]);
        });
    }
```

- [ ] **Step 3: Run existing tests to verify compiling**

Run: `docker exec jurnal-mu-app php artisan test --filter=PublicHomeTest`
Expected: PASS

- [ ] **Step 4: Commit changes**

Run:
```bash
git add app/Services/PublicHomeService.php
git commit -m "feat: format all-caps featured article titles and map extra fields"
```

---

### Task 2: Backend Feature Tests

**Files:**
- Modify: `tests/Feature/PublicHomeTest.php`

- [ ] **Step 1: Add title casing and extra field tests in `tests/Feature/PublicHomeTest.php`**

```php
it('formats all-caps titles and returns citation fields', function () {
    $university = University::factory()->create(['is_active' => true]);
    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'is_active' => true,
    ]);

    // Article with ALL-CAPS title
    $articleCaps = Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'ANALISIS PENERAPAN ALGORITMA DAN STRUKTUR DATA PADA WEB',
        'publication_date' => now(),
        'doi' => '10.12345/test.doi.1',
        'volume' => '10',
        'issue' => '2',
        'pages' => '123-130',
        'authors' => ['John Doe', 'Jane Doe'],
        'abstract' => 'This is a test abstract.',
    ]);

    // Article with Mixed-Case title
    $articleMixed = Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'An Analysis of A* Search Algorithm in Gaming',
        'publication_date' => now(),
    ]);

    // Clear cache first to force reload
    Cache::forget('home_featured_articles');

    $this->get('/');

    $cachedArticles = Cache::get('home_featured_articles');
    
    $cachedCaps = collect($cachedArticles)->firstWhere('id', $articleCaps->id);
    $cachedMixed = collect($cachedArticles)->firstWhere('id', $articleMixed->id);

    // Assert Casing
    expect($cachedCaps['title'])->toBe('Analisis Penerapan Algoritma dan Struktur Data pada Web');
    expect($cachedMixed['title'])->toBe('An Analysis of A* Search Algorithm in Gaming');

    // Assert Extra Fields
    expect($cachedCaps)->toHaveKeys(['authors', 'volume', 'issue', 'pages', 'doi', 'doi_url', 'abstract']);
    expect($cachedCaps['doi'])->toBe('10.12345/test.doi.1');
    expect($cachedCaps['volume'])->toBe('10');
    expect($cachedCaps['issue'])->toBe('2');
    expect($cachedCaps['pages'])->toBe('123-130');
    expect($cachedCaps['authors'])->toBe(['John Doe', 'Jane Doe']);
    expect($cachedCaps['abstract'])->toBe('This is a test abstract.');
});
```

- [ ] **Step 2: Run tests to verify all tests pass**

Run: `docker exec jurnal-mu-app php artisan test --filter=PublicHomeTest`
Expected: PASS

- [ ] **Step 3: Commit tests**

Run:
```bash
git add tests/Feature/PublicHomeTest.php
git commit -m "test: add test for featured articles title casing and citation fields"
```

---

### Task 3: Frontend welcome.tsx UI Update

**Files:**
- Modify: `resources/js/pages/welcome.tsx`

- [ ] **Step 1: Import `Download` and `FileText` icons**

Modify `resources/js/pages/welcome.tsx` imports:
```typescript
import { ArrowRight, BookOpen, Calendar, ChevronDown, Clock, GraduationCap, LayoutDashboard, Library, MapPin, Search, User, Download, FileText } from 'lucide-react';
```

- [ ] **Step 2: Update `WelcomeProps` typescript interface**

Modify `featuredArticles` interface in `welcome.tsx`:
```typescript
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
        authors?: string[];
        volume?: string;
        issue?: string;
        pages?: string;
        doi?: string;
        doi_url?: string;
        abstract?: string;
    }>;
```

- [ ] **Step 3: Add `downloadRis` helper function in the component**

Add inside `Welcome` component (e.g. before return statement):
```typescript
    const downloadRis = (article: any) => {
        const year = article.publication_date ? new Date(article.publication_date).getFullYear() : new Date().getFullYear();
        const authorsFormatted = article.authors && Array.isArray(article.authors)
            ? article.authors.map((a: string) => `AU  - ${a}`).join('\n')
            : 'AU  - Unknown';

        const risLines = ['TY  - JOUR', `TI  - ${article.title}`, authorsFormatted, `JO  - ${article.journal.title}`, `PY  - ${year}`];

        if (article.volume) risLines.push(`VL  - ${article.volume}`);
        if (article.issue) risLines.push(`IS  - ${article.issue}`);
        if (article.pages) risLines.push(`SP  - ${article.pages}`);
        if (article.doi) risLines.push(`DO  - ${article.doi}`);
        if (article.article_url) risLines.push(`UR  - ${article.article_url}`);
        if (article.abstract) risLines.push(`AB  - ${article.abstract}`);
        risLines.push('ER  -');

        const risContent = risLines.filter(Boolean).join('\n');
        const blob = new Blob([risContent], { type: 'application/x-research-info-systems;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute(
            'download',
            `${article.title
                .substring(0, 30)
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase()}.ris`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
```

- [ ] **Step 4: Update Buttons section in `welcome.tsx`**

Modify the article button container (around lines 371-390):
```typescript
                                        <div className="mt-6 flex flex-wrap items-center gap-3">
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

                                            {article.doi && (
                                                <a href={article.doi_url} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" variant="outline" className="text-gray-700 dark:text-gray-300">
                                                        <FileText className="mr-1 h-4 w-4" />
                                                        DOI
                                                    </Button>
                                                </a>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => downloadRis(article)}
                                                className="border-[#079C4E]/20 text-[#079C4E] hover:bg-[#079C4E]/10"
                                            >
                                                <Download className="mr-1 h-4 w-4" />
                                                Export RIS
                                            </Button>
                                        </div>
```

- [ ] **Step 5: Verify types and compilation**

Run: `npm run build` or inspect bundler logs to ensure zero typescript errors.

- [ ] **Step 6: Commit changes**

Run:
```bash
git add resources/js/pages/welcome.tsx
git commit -m "feat: add DOI and Export RIS buttons to homepage featured articles"
```

---

### Task 4: Clear Cache & Verification

- [ ] **Step 1: Clear application cache**

Run: `docker exec jurnal-mu-app php artisan cache:clear`
Expected: "Application cache cleared successfully."

- [ ] **Step 2: Verify all tests**

Run: `docker exec jurnal-mu-app php artisan test`
Expected: All tests pass.
