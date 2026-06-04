# Browse Articles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a publicly accessible articles browsing and search page at `/browse/articles` featuring search fields selector and dynamic sidebar facet filters.

**Architecture:** Integrate Laravel Scout with the `database` driver on the `Article` model for "all fields" search, falling back to clean Eloquent queries for specific fields. Dynamic sidebar facets (subjects, journals, years) with result counts are calculated using database aggregations matching the current query filters.

**Tech Stack:** Laravel 12, Laravel Scout, MySQL, React 19, Inertia.js, Tailwind CSS v4, Lucide Icons.

---

## Plan Details

### Task 1: Install and Configure Laravel Scout
**Files:**
- Modify: `composer.json` (via composer install command)
- Modify: `.env`
- Create: `config/scout.php` (via publish command)

- [ ] **Step 1: Install Scout package**
  Run: `composer require laravel/scout` (or inside docker: `docker exec -it jurnal-mu-app composer require laravel/scout`)
  Expected output: Package installed successfully.

- [ ] **Step 2: Configure Scout environment variables**
  Modify: `.env` to add Scout configuration:
  ```env
  SCOUT_DRIVER=database
  ```

- [ ] **Step 3: Publish Scout configuration**
  Run: `docker exec -it jurnal-mu-app php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"`
  Expected output: Configuration published to `config/scout.php`.

- [ ] **Step 4: Commit configuration**
  Run:
  ```bash
  git add composer.json composer.lock .env
  git commit -m "chore: install and configure laravel scout with database driver"
  ```

---

### Task 2: Prepare Article Model for Searching
**Files:**
- Modify: `app/Models/Article.php`

- [ ] **Step 1: Add Searchable trait and implement toSearchableArray**
  Modify `app/Models/Article.php` to include the `Searchable` trait and customize indexable attributes.
  ```php
  // Add at top:
  use Laravel\Scout\Searchable;

  // Inside Article class:
  use HasFactory, Searchable;

  /**
   * Get the indexable data array for the model.
   *
   * @return array<string, mixed>
   */
  public function toSearchableArray(): array
  {
      return [
          'id' => (int) $this->id,
          'title' => $this->title,
          'abstract' => $this->abstract,
          'authors' => is_array($this->authors) ? implode(', ', $this->authors) : $this->authors,
          'keywords' => is_array($this->keywords) ? implode(', ', $this->keywords) : $this->keywords,
          'journal_title' => $this->journal?->title,
          'scientific_field_name' => $this->journal?->scientificField?->name,
      ];
  }
  ```

- [ ] **Step 2: Sync and re-index existing records**
  Run command: `docker exec -it jurnal-mu-app php artisan scout:import "App\Models\Article"`
  Expected output: "All [App\Models\Article] records have been imported."

- [ ] **Step 3: Commit Article model changes**
  Run:
  ```bash
  git add app/Models/Article.php
  git commit -m "feat: implement Searchable trait on Article model"
  ```

---

### Task 3: Create PublicArticleController and Implement Search & Facets Logic
**Files:**
- Create: `app/Http/Controllers/PublicArticleController.php`

- [ ] **Step 1: Write Controller Code**
  Create `app/Http/Controllers/PublicArticleController.php` with the following content:
  ```php
  <?php

  namespace App\Http\Controllers;

  use App\Models\Article;
  use App\Models\Journal;
  use App\Models\ScientificField;
  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\DB;
  use Inertia\Inertia;
  use Inertia\Response;

  class PublicArticleController extends Controller
  {
      public function index(Request $request): Response
      {
          $search = $request->input('q');
          $field = $request->input('field', 'all');
          
          // Sidebar filters (arrays of selected values)
          $selectedSubjects = $request->input('subjects', []);
          $selectedJournals = $request->input('journals', []);
          $selectedYears = $request->input('years', []);

          // Base query matching text search
          if ($search) {
              if ($field === 'all') {
                  // Fallback to database IDs returned by Scout search
                  $articleIds = Article::search($search)->keys();
                  $baseQuery = Article::whereIn('id', $articleIds);
              } else {
                  $baseQuery = Article::query();
                  if ($field === 'title') {
                      $baseQuery->where('title', 'like', "%{$search}%");
                  } elseif ($field === 'abstract') {
                      $baseQuery->where('abstract', 'like', "%{$search}%");
                  } elseif ($field === 'author') {
                      $baseQuery->where('authors', 'like', "%{$search}%");
                  } elseif ($field === 'subject') {
                      $baseQuery->whereHas('journal.scientificField', function ($query) use ($search) {
                          $query->where('name', 'like', "%{$search}%");
                      });
                  }
              }
          } else {
              $baseQuery = Article::query();
          }

          // Generate a clone of base query *before* applying sidebar filters
          // to compute total possible matches for dynamic facets
          $facetBaseQuery = clone $baseQuery;

          // Apply sidebar filters to the main query
          if (!empty($selectedSubjects)) {
              $baseQuery->whereHas('journal', function ($query) use ($selectedSubjects) {
                  $query->whereIn('scientific_field_id', $selectedSubjects);
              });
          }
          if (!empty($selectedJournals)) {
              $baseQuery->whereIn('journal_id', $selectedJournals);
          }
          if (!empty($selectedYears)) {
              $baseQuery->whereIn(DB::raw('YEAR(publication_date)'), $selectedYears);
          }

          // Subquery of matching IDs for facets
          $facetIdsSubquery = $facetBaseQuery->select('id');

          // 1. Dynamic Subjects Facet
          $subjectsFacet = ScientificField::join('journals', 'scientific_fields.id', '=', 'journals.scientific_field_id')
              ->join('articles', 'journals.id', '=', 'articles.journal_id')
              ->whereIn('articles.id', $facetIdsSubquery)
              ->where('scientific_fields.is_active', true)
              ->select('scientific_fields.id', 'scientific_fields.name', DB::raw('COUNT(articles.id) as count'))
              ->groupBy('scientific_fields.id', 'scientific_fields.name')
              ->orderBy('count', 'desc')
              ->get();

          // 2. Dynamic Journals Facet
          $journalsFacet = Journal::join('articles', 'journals.id', '=', 'articles.journal_id')
              ->whereIn('articles.id', $facetIdsSubquery)
              ->where('journals.is_active', true)
              ->select('journals.id', 'journals.title', DB::raw('COUNT(articles.id) as count'))
              ->groupBy('journals.id', 'journals.title')
              ->orderBy('count', 'desc')
              ->get();

          // 3. Dynamic Years Facet
          $yearsFacet = Article::whereIn('id', $facetIdsSubquery)
              ->select(DB::raw('YEAR(publication_date) as year'), DB::raw('COUNT(id) as count'))
              ->groupBy('year')
              ->orderBy('year', 'desc')
              ->get();

          // Fetch paginated results
          $articles = $baseQuery->with(['journal.scientificField', 'journal.university'])
              ->orderBy('publication_date', 'desc')
              ->paginate(10)
              ->withQueryString()
              ->through(fn ($article) => [
                  'id' => $article->id,
                  'title' => $article->title,
                  'abstract' => $article->abstract,
                  'authors' => $article->authors,
                  'authors_list' => $article->authors_list,
                  'keywords' => $article->keywords,
                  'doi' => $article->doi,
                  'doi_url' => $article->doi_url,
                  'publication_date' => $article->publication_date?->format('Y-m-d'),
                  'volume' => $article->volume,
                  'issue' => $article->issue,
                  'volume_issue' => $article->volume_issue,
                  'pages' => $article->pages,
                  'article_url' => $article->article_url,
                  'pdf_url' => $article->pdf_url,
                  'google_scholar_url' => $article->google_scholar_url,
                  'journal' => [
                      'id' => $article->journal->id,
                      'title' => $article->journal->title,
                      'publisher' => $article->journal->publisher,
                      'scientific_field' => $article->journal->scientificField ? [
                          'id' => $article->journal->scientificField->id,
                          'name' => $article->journal->scientificField->name,
                      ] : null,
                  ],
              ]);

          return Inertia::render('Browse/Articles', [
              'articles' => $articles,
              'facets' => [
                  'subjects' => $subjectsFacet,
                  'journals' => $journalsFacet,
                  'years' => $yearsFacet,
              ],
              'filters' => [
                  'q' => $search,
                  'field' => $field,
                  'subjects' => $selectedSubjects,
                  'journals' => $selectedJournals,
                  'years' => $selectedYears,
              ],
          ]);
      }
  }
  ```

- [ ] **Step 2: Commit Controller**
  Run:
  ```bash
  git add app/Http/Controllers/PublicArticleController.php
  git commit -m "feat: implement PublicArticleController with dynamic facet aggregations"
  ```

---

### Task 4: Define Public Search Routes
**Files:**
- Modify: `routes/web.php`

- [ ] **Step 1: Add GET Route**
  Modify `routes/web.php` to register the controller action. Place it near the top level guest-accessible browse routes:
  ```php
  // Add top import:
  use App\Http\Controllers\PublicArticleController;

  // Near the journals route:
  Route::get('/browse/articles', [PublicArticleController::class, 'index'])->name('browse.articles');
  ```

- [ ] **Step 2: Commit Web Route**
  Run:
  ```bash
  git add routes/web.php
  git commit -m "feat: add route /browse/articles for public search"
  ```

---

### Task 5: Build React Frontend Browse Articles Page
**Files:**
- Create: `resources/js/pages/Browse/Articles.tsx`

- [ ] **Step 1: Write Browse Articles Component**
  Create `resources/js/pages/Browse/Articles.tsx` with high-quality visual design, collapsible abstract panels, RIS download functionality, search fields dropdown, and dynamic sidebar filters.
  ```tsx
  import PublicFooter from '@/components/public-footer';
  import PublicNavbar from '@/components/public-navbar';
  import { Button } from '@/components/ui/button';
  import { Checkbox } from '@/components/ui/checkbox';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
  import { Head, Link, router } from '@inertiajs/react';
  import { BookOpen, Calendar, ChevronDown, ChevronUp, Download, ExternalLink, FileDown, FileText, Filter, RotateCcw, Search } from 'lucide-react';
  import React, { useState } from 'react';

  interface Article {
      id: number;
      title: string;
      abstract: string | null;
      authors: string[] | null;
      authors_list: string;
      keywords: string[] | null;
      doi: string | null;
      doi_url: string | null;
      publication_date: string;
      volume: string | null;
      issue: string | null;
      volume_issue: string | null;
      pages: string | null;
      article_url: string | null;
      pdf_url: string | null;
      google_scholar_url: string;
      journal: {
          id: number;
          title: string;
          publisher: string | null;
          scientific_field: {
              id: number;
              name: string;
          } | null;
      };
  }

  interface FacetItem {
      id?: number;
      name?: string;
      title?: string;
      year?: number;
      count: number;
  }

  interface Props {
      articles: {
          data: Article[];
          current_page: number;
          last_page: number;
          total: number;
          links: Array<{
              url: string | null;
              label: string;
              active: boolean;
          }>;
      };
      facets: {
          subjects: FacetItem[];
          journals: FacetItem[];
          years: FacetItem[];
      };
      filters: {
          q?: string;
          field?: string;
          subjects?: number[];
          journals?: number[];
          years?: number[];
      };
  }

  export default function ArticlesBrowse({ articles, facets, filters }: Props) {
      const [searchQuery, setSearchQuery] = useState(filters.q || '');
      const [searchField, setSearchField] = useState(filters.field || 'all');
      const [selectedSubjects, setSelectedSubjects] = useState<number[]>(
          Array.isArray(filters.subjects) ? filters.subjects.map(Number) : []
      );
      const [selectedJournals, setSelectedJournals] = useState<number[]>(
          Array.isArray(filters.journals) ? filters.journals.map(Number) : []
      );
      const [selectedYears, setSelectedYears] = useState<number[]>(
          Array.isArray(filters.years) ? filters.years.map(Number) : []
      );
      const [expandedAbstracts, setExpandedAbstracts] = useState<Record<number, boolean>>({});

      const applyFilters = (
          q = searchQuery,
          field = searchField,
          subjects = selectedSubjects,
          journals = selectedJournals,
          years = selectedYears
      ) => {
          router.get(
              route('browse.articles'),
              {
                  q,
                  field,
                  subjects,
                  journals,
                  years,
              },
              { preserveState: true }
          );
      };

      const handleSearchSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          applyFilters();
      };

      const toggleSubject = (id: number) => {
          const next = selectedSubjects.includes(id)
              ? selectedSubjects.filter((x) => x !== id)
              : [...selectedSubjects, id];
          setSelectedSubjects(next);
          applyFilters(searchQuery, searchField, next, selectedJournals, selectedYears);
      };

      const toggleJournal = (id: number) => {
          const next = selectedJournals.includes(id)
              ? selectedJournals.filter((x) => x !== id)
              : [...selectedJournals, id];
          setSelectedJournals(next);
          applyFilters(searchQuery, searchField, selectedSubjects, next, selectedYears);
      };

      const toggleYear = (year: number) => {
          const next = selectedYears.includes(year)
              ? selectedYears.filter((x) => x !== year)
              : [...selectedYears, year];
          setSelectedYears(next);
          applyFilters(searchQuery, searchField, selectedSubjects, selectedJournals, next);
      };

      const resetFilters = () => {
          setSearchQuery('');
          setSearchField('all');
          setSelectedSubjects([]);
          setSelectedJournals([]);
          setSelectedYears([]);
          router.get(route('browse.articles'));
      };

      const toggleAbstract = (id: number) => {
          setExpandedAbstracts((prev) => ({ ...prev, [id]: !prev[id] }));
      };

      const downloadRis = (article: Article) => {
          const year = new Date(article.publication_date).getFullYear();
          const authorsFormatted = article.authors
              ? article.authors.map((a) => `AU  - ${a}`).join('\n')
              : 'AU  - Unknown';

          const risLines = [
              'TY  - JOUR',
              `TI  - ${article.title}`,
              authorsFormatted,
              `JO  - ${article.journal.title}`,
              `PY  - ${year}`,
          ];

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
          link.setAttribute('download', `${article.title.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ris`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      };

      const hasActiveFilters =
          searchQuery ||
          selectedSubjects.length > 0 ||
          selectedJournals.length > 0 ||
          selectedYears.length > 0;

      return (
          <>
              <Head title="Browse Articles - JurnalMu">
                  <link rel="preconnect" href="https://fonts.googleapis.com" />
                  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                  <link
                      href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                      rel="stylesheet"
                  />
              </Head>

              <div className="min-h-screen bg-gray-50 font-sans text-[#1b1b18] selection:bg-[#079C4E] selection:text-white dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                  <PublicNavbar />

                  <main className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:px-8">
                      {/* Page Header */}
                      <div className="mb-8 text-center">
                          <h1 className="font-heading text-4xl font-bold tracking-tight text-[#079C4E]" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                              Browse Articles
                          </h1>
                          <p className="mt-2 text-gray-600 dark:text-gray-400">
                              Search and filter through all harvested research publications
                          </p>
                      </div>

                      {/* Search Bar Container */}
                      <form onSubmit={handleSearchSubmit} className="mb-8 flex flex-col gap-3 sm:flex-row">
                          <div className="flex flex-1 items-center rounded-lg border border-gray-300 bg-white px-3 py-1 shadow-sm dark:border-white/10 dark:bg-[#151515]">
                              <Search className="mr-2 h-5 w-5 text-gray-400" />
                              <Input
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  placeholder="Search articles..."
                                  className="border-0 bg-transparent py-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
                              />
                          </div>

                          <Select value={searchField} onValueChange={setSearchField}>
                              <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-300 dark:bg-[#151515] dark:border-white/10">
                                  <SelectValue placeholder="Search Fields" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">All Fields</SelectItem>
                                  <SelectItem value="title">Title</SelectItem>
                                  <SelectItem value="abstract">Abstract</SelectItem>
                                  <SelectItem value="subject">Subject</SelectItem>
                                  <SelectItem value="author">Author</SelectItem>
                              </SelectContent>
                          </Select>

                          <Button type="submit" className="bg-[#079C4E] hover:bg-[#068542] text-white px-6 font-semibold">
                              Search
                          </Button>
                      </form>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                          {/* Left Sidebar */}
                          <div className="lg:col-span-1 space-y-6">
                              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111111]">
                                  <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-white/10">
                                      <h2 className="flex items-center text-lg font-bold">
                                          <Filter className="mr-2 h-4 w-4 text-[#079C4E]" />
                                          Refine Search
                                      </h2>
                                      {hasActiveFilters && (
                                          <Button
                                              variant="ghost"
                                              onClick={resetFilters}
                                              className="h-auto p-0 text-xs font-semibold text-red-500 hover:bg-transparent hover:text-red-700"
                                          >
                                              <RotateCcw className="mr-1 h-3 w-3" />
                                              Clear
                                          </Button>
                                      )}
                                  </div>

                                  {/* Subject Facet */}
                                  <div className="mb-6">
                                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                                          Subjects
                                      </h3>
                                      <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                                          {facets.subjects.length > 0 ? (
                                              facets.subjects.map((item) => (
                                                  <div key={item.id} className="flex items-center space-x-2">
                                                      <Checkbox
                                                          id={`subject-${item.id}`}
                                                          checked={selectedSubjects.includes(Number(item.id))}
                                                          onCheckedChange={() => toggleSubject(Number(item.id))}
                                                      />
                                                      <Label
                                                          htmlFor={`subject-${item.id}`}
                                                          className="flex flex-1 justify-between text-sm font-normal cursor-pointer"
                                                      >
                                                          <span className="truncate mr-2">{item.name}</span>
                                                          <span className="text-gray-400">({item.count})</span>
                                                      </Label>
                                                  </div>
                                              ))
                                          ) : (
                                              <p className="text-xs text-gray-400">No subjects found</p>
                                          )}
                                      </div>
                                  </div>

                                  {/* Journal Facet */}
                                  <div className="mb-6">
                                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                                          Journals
                                      </h3>
                                      <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                                          {facets.journals.length > 0 ? (
                                              facets.journals.map((item) => (
                                                  <div key={item.id} className="flex items-center space-x-2">
                                                      <Checkbox
                                                          id={`journal-${item.id}`}
                                                          checked={selectedJournals.includes(Number(item.id))}
                                                          onCheckedChange={() => toggleJournal(Number(item.id))}
                                                      />
                                                      <Label
                                                          htmlFor={`journal-${item.id}`}
                                                          className="flex flex-1 justify-between text-sm font-normal cursor-pointer"
                                                      >
                                                          <span className="truncate mr-2">{item.title}</span>
                                                          <span className="text-gray-400">({item.count})</span>
                                                      </Label>
                                                  </div>
                                              ))
                                          ) : (
                                              <p className="text-xs text-gray-400">No journals found</p>
                                          )}
                                      </div>
                                  </div>

                                  {/* Publication Year Facet */}
                                  <div>
                                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                                          Publication Years
                                      </h3>
                                      <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                                          {facets.years.length > 0 ? (
                                              facets.years.map((item) => (
                                                  <div key={item.year} className="flex items-center space-x-2">
                                                      <Checkbox
                                                          id={`year-${item.year}`}
                                                          checked={selectedYears.includes(Number(item.year))}
                                                          onCheckedChange={() => toggleYear(Number(item.year))}
                                                      />
                                                      <Label
                                                          htmlFor={`year-${item.year}`}
                                                          className="flex flex-1 justify-between text-sm font-normal cursor-pointer"
                                                      >
                                                          <span>{item.year}</span>
                                                          <span className="text-gray-400">({item.count})</span>
                                                      </Label>
                                                  </div>
                                              ))
                                          ) : (
                                              <p className="text-xs text-gray-400">No publication years</p>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Right Content Column */}
                          <div className="lg:col-span-3 space-y-6">
                              {/* Total count summary */}
                              <div className="flex items-center justify-between">
                                  <p className="text-sm text-gray-500">
                                      Found <span className="font-bold text-gray-800 dark:text-white">{articles.total}</span> articles
                                  </p>
                              </div>

                              {/* Articles List */}
                              {articles.data.length > 0 ? (
                                  articles.data.map((article) => {
                                      const isExpanded = !!expandedAbstracts[article.id];
                                      return (
                                          <div
                                              key={article.id}
                                              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-white/10 dark:bg-[#111111]"
                                          >
                                              {/* Article Card Metadata Badges */}
                                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                                                  <span className="flex items-center gap-1 bg-gray-100 dark:bg-[#1d1d1d] px-2.5 py-1 rounded-full font-medium">
                                                      <Calendar className="h-3 w-3" />
                                                      {new Date(article.publication_date).toLocaleDateString('en-US', {
                                                          year: 'numeric',
                                                          month: 'short',
                                                          day: 'numeric',
                                                      })}
                                                  </span>
                                                  {article.volume_issue && (
                                                      <span className="bg-gray-100 dark:bg-[#1d1d1d] px-2.5 py-1 rounded-full font-medium text-[#079C4E]">
                                                          {article.volume_issue}
                                                      </span>
                                                  )}
                                                  {article.pages && (
                                                      <span className="bg-gray-100 dark:bg-[#1d1d1d] px-2.5 py-1 rounded-full font-medium">
                                                          pp. {article.pages}
                                                      </span>
                                                  )}
                                                  {article.journal.scientific_field && (
                                                      <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-semibold">
                                                          {article.journal.scientific_field.name}
                                                      </span>
                                                  )}
                                              </div>

                                              {/* Title */}
                                              <h3 className="text-xl font-bold text-gray-900 hover:text-[#079C4E] dark:text-white dark:hover:text-[#079C4E] transition-colors mb-2">
                                                  {article.title}
                                              </h3>

                                              {/* Authors */}
                                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                  {article.authors_list}
                                              </p>

                                              {/* Published By / Publisher */}
                                              <div className="text-xs text-gray-500 mb-3">
                                                  <span>Published in: </span>
                                                  <Link
                                                      href={route('journals.show', article.journal.id)}
                                                      className="font-semibold text-[#079C4E] hover:underline"
                                                  >
                                                      {article.journal.title}
                                                  </Link>
                                                  {article.journal.publisher && (
                                                      <span> &bull; Published by {article.journal.publisher}</span>
                                                  )}
                                              </div>

                                              {/* Abstract content (collapsible) */}
                                              {article.abstract && (
                                                  <div className="mb-4">
                                                      <p className={`text-sm text-gray-600 dark:text-gray-400 ${!isExpanded && 'line-clamp-3'}`}>
                                                          {article.abstract}
                                                      </p>
                                                      <Button
                                                          variant="ghost"
                                                          onClick={() => toggleAbstract(article.id)}
                                                          className="mt-1 h-auto p-0 text-xs font-semibold text-[#079C4E] hover:bg-transparent hover:text-[#068542]"
                                                      >
                                                          {isExpanded ? (
                                                              <span className="flex items-center">
                                                                  Show Less <ChevronUp className="ml-1 h-3 w-3" />
                                                              </span>
                                                          ) : (
                                                              <span className="flex items-center">
                                                                  Read Abstract <ChevronDown className="ml-1 h-3 w-3" />
                                                              </span>
                                                          )}
                                                      </Button>
                                                  </div>
                                              )}

                                              {/* Keywords List */}
                                              {article.keywords && article.keywords.length > 0 && (
                                                  <div className="flex flex-wrap gap-1.5 mb-5">
                                                      {article.keywords.map((kw, idx) => (
                                                          <span
                                                              key={idx}
                                                              className="text-xs bg-gray-50 text-gray-500 dark:bg-[#181818] px-2 py-0.5 rounded border border-gray-100 dark:border-white/5"
                                                          >
                                                              #{kw}
                                                          </span>
                                                      ))}
                                                  </div>
                                              )}

                                              {/* Action Buttons Link Group */}
                                              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-white/5">
                                                  {article.pdf_url && (
                                                      <a href={article.pdf_url} target="_blank" rel="noopener noreferrer">
                                                          <Button size="sm" variant="outline" className="border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20">
                                                              <FileDown className="mr-1 h-4 w-4" />
                                                              PDF
                                                          </Button>
                                                      </a>
                                                  )}

                                                  {article.article_url && (
                                                      <a href={article.article_url} target="_blank" rel="noopener noreferrer">
                                                          <Button size="sm" variant="outline" className="text-gray-700 dark:text-gray-300">
                                                              <ExternalLink className="mr-1 h-4 w-4" />
                                                              Original Article
                                                          </Button>
                                                      </a>
                                                  )}

                                                  {article.doi_url && (
                                                      <a href={article.doi_url} target="_blank" rel="noopener noreferrer">
                                                          <Button size="sm" variant="outline" className="text-gray-700 dark:text-gray-300">
                                                              <FileText className="mr-1 h-4 w-4" />
                                                              DOI
                                                          </Button>
                                                      </a>
                                                  )}

                                                  <a href={article.google_scholar_url} target="_blank" rel="noopener noreferrer">
                                                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-blue-950/20">
                                                          <Search className="mr-1 h-4 w-4" />
                                                          Google Scholar
                                                      </Button>
                                                  </a>

                                                  <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => downloadRis(article)}
                                                      className="text-[#079C4E] border-[#079C4E]/20 hover:bg-[#079C4E]/10"
                                                  >
                                                      <Download className="mr-1 h-4 w-4" />
                                                      Export Citation (RIS)
                                                  </Button>
                                              </div>
                                          </div>
                                      );
                                  })
                              ) : (
                                  <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-white/10">
                                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">No articles found</h3>
                                      <p className="mt-1 text-gray-500">Try adjusting your filters or search terms.</p>
                                  </div>
                              )}

                              {/* Pagination Controls */}
                              {articles.last_page > 1 && (
                                  <div className="mt-8 flex justify-center space-x-1">
                                      {articles.links.map((link, idx) => {
                                          if (!link.url) {
                                              return (
                                                  <span
                                                      key={idx}
                                                      className="px-3.5 py-2 rounded-lg text-sm text-gray-400 border border-gray-200 dark:border-white/10 cursor-not-allowed"
                                                      dangerouslySetInnerHTML={{ __html: link.label }}
                                                  />
                                              );
                                          }
                                          return (
                                              <Link
                                                  key={idx}
                                                  href={link.url}
                                                  className={`px-3.5 py-2 rounded-lg text-sm border transition-colors ${
                                                      link.active
                                                          ? 'bg-[#079C4E] text-white border-[#079C4E]'
                                                          : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200 hover:text-gray-900 dark:bg-[#111] dark:border-white/10 dark:hover:bg-[#181818] dark:text-gray-300'
                                                  }`}
                                                  dangerouslySetInnerHTML={{ __html: link.label }}
                                              />
                                          );
                                      })}
                                  </div>
                              )}
                          </div>
                      </div>
                  </main>

                  <PublicFooter />
              </div>
          </>
      );
  }
  ```

- [ ] **Step 2: Commit React Component**
  Run:
  ```bash
  git add resources/js/pages/Browse/Articles.tsx
  git commit -m "feat: implement React articles browse page with search fields and dynamic facets"
  ```

---

### Task 6: Write Integration Test for Public Search & Facets
**Files:**
- Create: `tests/Feature/PublicArticleSearchTest.php`

- [ ] **Step 1: Write Search Test Case**
  Create `tests/Feature/PublicArticleSearchTest.php` to verify routing, search filtering, and facets aggregation response.
  ```php
  <?php

  namespace Tests\Feature;

  use App\Models\Article;
  use App\Models\Journal;
  use App\Models\ScientificField;
  use App\Models\University;
  use Illuminate\Foundation\Testing\RefreshDatabase;
  use Tests\TestCase;

  class PublicArticleSearchTest extends TestCase
  {
      use RefreshDatabase;

      public function test_articles_browse_page_accessible_and_renders_inertia()
      {
          $university = University::factory()->create(['is_active' => true]);
          $field = ScientificField::factory()->create(['is_active' => true, 'name' => 'Computer Science']);
          $journal = Journal::factory()->create([
              'university_id' => $university->id,
              'scientific_field_id' => $field->id,
              'is_active' => true,
              'approval_status' => 'approved',
          ]);
          
          Article::factory()->create([
              'journal_id' => $journal->id,
              'title' => 'Advanced Machine Learning Search',
              'abstract' => 'This is a test abstract.',
              'authors' => ['Jane Doe', 'John Smith'],
              'keywords' => ['AI', 'Search'],
              'publication_date' => '2026-01-15',
          ]);

          $response = $this->get('/browse/articles');

          $response->assertStatus(200);
          $response->assertInertia(fn ($page) => $page
              ->component('Browse/Articles')
              ->has('articles.data', 1)
              ->where('articles.data.0.title', 'Advanced Machine Learning Search')
              ->has('facets.subjects')
              ->has('facets.journals')
              ->has('facets.years')
          );
      }

      public function test_articles_browse_filters_by_specific_field()
      {
          $university = University::factory()->create(['is_active' => true]);
          $field = ScientificField::factory()->create(['is_active' => true]);
          $journal = Journal::factory()->create([
              'university_id' => $university->id,
              'scientific_field_id' => $field->id,
              'is_active' => true,
              'approval_status' => 'approved',
          ]);
          
          Article::factory()->create([
              'journal_id' => $journal->id,
              'title' => 'Specific Target Title',
              'abstract' => 'Unrelated abstract content',
              'authors' => ['Author One'],
              'publication_date' => '2026-02-10',
          ]);

          Article::factory()->create([
              'journal_id' => $journal->id,
              'title' => 'Other Title',
              'abstract' => 'Target term in abstract',
              'authors' => ['Author Two'],
              'publication_date' => '2026-03-12',
          ]);

          // Filter by title only
          $response = $this->get('/browse/articles?q=Target&field=title');
          $response->assertStatus(200);
          $response->assertInertia(fn ($page) => $page
              ->has('articles.data', 1)
              ->where('articles.data.0.title', 'Specific Target Title')
          );

          // Filter by abstract only
          $response = $this->get('/browse/articles?q=Target&field=abstract');
          $response->assertStatus(200);
          $response->assertInertia(fn ($page) => $page
              ->has('articles.data', 1)
              ->where('articles.data.0.title', 'Other Title')
          );
      }
  }
  ```

- [ ] **Step 2: Run Tests to Verify Failure**
  Run search test to confirm failure:
  `docker exec -it jurnal-mu-app php artisan test --filter=PublicArticleSearchTest`
  Expected: FAIL (because route and controller do not exist yet)

- [ ] **Step 3: Commit Test Case**
  Run:
  ```bash
  git add tests/Feature/PublicArticleSearchTest.php
  git commit -m "test: add integration tests for public articles search and facets"
  ```
