# University Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a public-facing university directory and detailed profile page displaying university metadata, key statistics (total journals, total articles, Scopus index count), journal Sinta distributions, and a searchable, filterable articles table.

**Architecture:** A dedicated `PublicUniversityController` serving public pages via Inertia.js. Route `/browse/universities` shows the searchable list, and `/browse/universities/{university}` displays the detailed profile and metrics.

**Tech Stack:** Laravel, Inertia.js, React 19, TypeScript, Tailwind CSS v4, Lucide Icons, ApexCharts.

---

### Task 1: Routes and Controller Skeleton

**Files:**
- Modify: [web.php](file:///C:/xampp/htdocs/jurnal_mu/routes/web.php)
- Create: [PublicUniversityController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/PublicUniversityController.php)

- [ ] **Step 1: Add Routes to routes/web.php**
  Replace the legacy `/browse/universities` route mapping to use the new `PublicUniversityController`.
  
  Code change in [routes/web.php](file:///C:/xampp/htdocs/jurnal_mu/routes/web.php):
  ```php
  // Find: Route::get('/browse/universities', [PublicJournalController::class, 'browseUniversities'])
  // Replace with:
  use App\Http\Controllers\PublicUniversityController;
  
  Route::get('/browse/universities', [PublicUniversityController::class, 'index'])->name('browse.universities');
  Route::get('/browse/universities/{university}', [PublicUniversityController::class, 'show'])->name('browse.universities.show');
  ```

- [ ] **Step 2: Create PublicUniversityController.php**
  Create the controller skeleton and basic imports.
  
  File content for [PublicUniversityController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/PublicUniversityController.php):
  ```php
  <?php

  namespace App\Http\Controllers;

  use App\Models\University;
  use App\Models\Journal;
  use App\Models\Article;
  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\DB;
  use Inertia\Inertia;
  use Inertia\Response;

  class PublicUniversityController extends Controller
  {
      // Skeleton methods to be implemented next
      public function index(Request $request): Response
      {
          return Inertia::render('Browse/Universities', []);
      }

      public function show(University $university, Request $request): Response
      {
          return Inertia::render('Browse/UniversityProfile', []);
      }
  }
  ```

- [ ] **Step 3: Commit Task 1**
  ```bash
  git add routes/web.php app/Http/Controllers/PublicUniversityController.php
  git commit -m "feat(university): set up routes and controller skeleton"
  ```

---

### Task 2: Implement University List Query & View Overhaul

**Files:**
- Modify: [PublicUniversityController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/PublicUniversityController.php)
- Modify: [Universities.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/Pages/Browse/Universities.tsx)

- [ ] **Step 1: Implement index Method in PublicUniversityController.php**
  Write database query for loading active universities with journal counts, search filters, and sorting.
  
  Code in [PublicUniversityController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/PublicUniversityController.php):
  ```php
  public function index(Request $request): Response
  {
      $query = University::query()
          ->where('is_active', true)
          ->withCount(['journals' => function ($q) {
              $q->where('is_active', true)
                ->where('approval_status', 'approved');
          }]);

      // Apply Search Filter
      if ($request->filled('search')) {
          $search = $request->search;
          $query->where(function ($q) use ($search) {
              $q->where('name', 'like', "%{$search}%")
                ->orWhere('short_name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
          });
      }

      // Apply Accreditation Filter
      if ($request->filled('accreditation')) {
          $query->where('accreditation_status', $request->accreditation);
      }

      // Apply Sorting
      $sortBy = $request->input('sort', 'name');
      if ($sortBy === 'journals_count') {
          $query->orderBy('journals_count', 'desc');
      } else {
          $query->orderBy('name', 'asc');
      }

      $universities = $query->paginate(12)->withQueryString();

      // Get available accreditations for filter options
      $accreditationOptions = University::whereNotNull('accreditation_status')
          ->distinct()
          ->pluck('accreditation_status');

      return Inertia::render('Browse/Universities', [
          'universities' => $universities,
          'filters' => $request->only(['search', 'accreditation', 'sort']),
          'accreditationOptions' => $accreditationOptions,
      ]);
  }
  ```

- [ ] **Step 2: Overhaul Universities.tsx View**
  Update list view with filters, cards, and routing to profile detail.
  
  Code in [Universities.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/Pages/Browse/Universities.tsx):
  ```tsx
  import PublicLayout from '@/layouts/public-layout';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Input } from '@/components/ui/input';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
  import { Head, Link, router } from '@inertiajs/react';
  import { BookOpen, Building2, Search } from 'lucide-react';
  import { useState, useEffect } from 'react';
  import { useDebounce } from 'use-debounce';

  interface University {
      id: number;
      name: string;
      short_name: string | null;
      code: string;
      city: string | null;
      province: string | null;
      logo_url: string | null;
      accreditation_status: string | null;
      journals_count: number;
  }

  interface PaginatedUniversities {
      data: University[];
      current_page: number;
      last_page: number;
      links: any[];
  }

  interface Props {
      universities: PaginatedUniversities;
      filters: {
          search?: string;
          accreditation?: string;
          sort?: string;
      };
      accreditationOptions: string[];
  }

  export default function BrowseUniversities({ universities, filters, accreditationOptions }: Props) {
      const [search, setSearch] = useState(filters.search || '');
      const [debouncedSearch] = useDebounce(search, 500);
      const [accreditation, setAccreditation] = useState(filters.accreditation || 'all');
      const [sort, setSort] = useState(filters.sort || 'name');

      useEffect(() => {
          const query: any = {};
          if (debouncedSearch) query.search = debouncedSearch;
          if (accreditation !== 'all') query.accreditation = accreditation;
          if (sort !== 'name') query.sort = sort;

          router.get(route('browse.universities'), query, {
              preserveState: true,
              replace: true,
          });
      }, [debouncedSearch, accreditation, sort]);

      const handlePageChange = (url: string | null) => {
          if (!url) return;
          router.get(url);
      };

      return (
          <PublicLayout>
              <Head title="Browse Universities - JurnalMu" />

              <div className="container mx-auto max-w-7xl px-4 py-8">
                  <div className="mb-8 text-center sm:text-left">
                      <h1 className="text-3xl font-bold font-heading text-[#079C4E]" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                          Perguruan Tinggi Muhammadiyah 'Aisyiyah
                      </h1>
                      <p className="mt-2 text-muted-foreground">Jelajahi profil dan pangkalan data jurnal ilmiah kampus PTMA se-Indonesia</p>
                  </div>

                  {/* Filters Bar */}
                  <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="relative">
                          <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                              placeholder="Cari Universitas, Nama Singkat atau Kode..."
                              className="pl-9"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                          />
                      </div>

                      <Select value={accreditation} onValueChange={setAccreditation}>
                          <SelectTrigger>
                              <SelectValue placeholder="Semua Akreditasi" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">Semua Akreditasi</SelectItem>
                              {accreditationOptions.map((opt) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>

                      <Select value={sort} onValueChange={setSort}>
                          <SelectTrigger>
                              <SelectValue placeholder="Urutkan" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="name">Nama (A-Z)</SelectItem>
                              <SelectItem value="journals_count">Jumlah Jurnal Terbanyak</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>

                  {/* University Cards Grid */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {universities.data.map((uni) => (
                          <Link key={uni.id} href={route('browse.universities.show', uni.id)}>
                              <Card className="h-full border transition-all hover:border-[#079C4E]/50 hover:shadow-md cursor-pointer flex flex-col justify-between">
                                  <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
                                      {uni.logo_url ? (
                                          <img
                                              src={uni.logo_url}
                                              alt={uni.name}
                                              className="h-12 w-12 rounded-lg object-contain border bg-white p-1"
                                          />
                                      ) : (
                                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-[#079C4E] border border-emerald-100">
                                              <Building2 className="h-6 w-6" />
                                          </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                          <CardTitle className="text-base font-bold line-clamp-2 leading-tight">
                                              {uni.name}
                                          </CardTitle>
                                          <span className="font-mono text-xs text-muted-foreground">Code: {uni.code}</span>
                                      </div>
                                  </CardHeader>
                                  <CardContent className="pt-0 flex flex-col gap-2">
                                      <div className="flex flex-wrap gap-1">
                                          {uni.accreditation_status && (
                                              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold border-emerald-100">
                                                  {uni.accreditation_status}
                                              </Badge>
                                          )}
                                          {(uni.city || uni.province) && (
                                              <Badge variant="outline" className="text-xs max-w-full truncate">
                                                  {uni.city || uni.province}
                                              </Badge>
                                          )}
                                      </div>
                                      <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
                                          <span className="text-muted-foreground flex items-center gap-1">
                                              <BookOpen className="h-4 w-4" /> Jurnal
                                          </span>
                                          <span className="font-semibold text-[#079C4E]">{uni.journals_count} Jurnal</span>
                                      </div>
                                  </CardContent>
                              </Card>
                          </Link>
                      ))}
                  </div>

                  {/* Pagination Links */}
                  {universities.last_page > 1 && (
                      <div className="mt-8 flex justify-center gap-1">
                          {universities.links.map((link, idx) => (
                              <Button
                                  key={idx}
                                  variant={link.active ? 'default' : 'outline'}
                                  className={link.active ? 'bg-[#079C4E] text-white hover:bg-[#068442]' : ''}
                                  onClick={() => handlePageChange(link.url)}
                                  disabled={!link.url}
                                  dangerouslySetInnerHTML={{ __html: link.label }}
                              />
                          ))}
                      </div>
                  )}
              </div>
          </PublicLayout>
      );
  }
  ```

- [ ] **Step 3: Commit Task 2**
  ```bash
  git add app/Http/Controllers/PublicUniversityController.php resources/js/Pages/Browse/Universities.tsx
  git commit -m "feat(university): implement list filtering, sorting, and styling with logos"
  ```

---

### Task 3: Implement Detail Page Queries & Skeleton Page

**Files:**
- Modify: [PublicUniversityController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/PublicUniversityController.php)
- Create: [UniversityProfile.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/Pages/Browse/UniversityProfile.tsx)

- [ ] **Step 1: Implement show Method Queries in PublicUniversityController.php**
  Fetch university metadata, metrics, sinta breakdown, registered journals, and paginated articles.
  
  Code in [PublicUniversityController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/PublicUniversityController.php):
  ```php
  public function show(University $university, Request $request): Response
  {
      if (!$university->is_active) {
          abort(404);
      }

      // 1. Statistics Aggregation
      $totalJournals = Journal::where('university_id', $university->id)
          ->where('is_active', true)
          ->where('approval_status', 'approved')
          ->count();

      $scopusCount = Journal::where('university_id', $university->id)
          ->where('is_active', true)
          ->where('approval_status', 'approved')
          ->where('is_indexed_in_scopus', true)
          ->count();

      $totalArticles = Article::whereIn('journal_id', function ($query) use ($university) {
          $query->select('id')
              ->from('journals')
              ->where('university_id', $university->id)
              ->where('is_active', true)
              ->where('approval_status', 'approved');
      })->count();

      // 2. Journal Classifications (Sinta Ranks)
      $sintaRanks = Journal::select('sinta_rank', DB::raw('count(*) as total'))
          ->where('university_id', $university->id)
          ->where('is_active', true)
          ->where('approval_status', 'approved')
          ->groupBy('sinta_rank')
          ->get()
          ->pluck('total', 'sinta_rank')
          ->toArray();

      // Normalize sinta ranks count to ensure all categories S1-S6 are representable
      $sintaBreakdown = [
          'S1' => $sintaRanks['sinta_1'] ?? $sintaRanks['S1'] ?? 0,
          'S2' => $sintaRanks['sinta_2'] ?? $sintaRanks['S2'] ?? 0,
          'S3' => $sintaRanks['sinta_3'] ?? $sintaRanks['S3'] ?? 0,
          'S4' => $sintaRanks['sinta_4'] ?? $sintaRanks['S4'] ?? 0,
          'S5' => $sintaRanks['sinta_5'] ?? $sintaRanks['S5'] ?? 0,
          'S6' => $sintaRanks['sinta_6'] ?? $sintaRanks['S6'] ?? 0,
          'TT' => $sintaRanks['tidak_terakreditasi'] ?? $sintaRanks['TT'] ?? 0,
      ];

      // 3. Get all approved journals for this university
      $journals = Journal::where('university_id', $university->id)
          ->where('is_active', true)
          ->where('approval_status', 'approved')
          ->with(['scientificField'])
          ->orderBy('title')
          ->get()
          ->map(fn($j) => [
              'id' => $j->id,
              'title' => $j->title,
              'sinta_rank_label' => $j->sinta_rank_label,
              'cover_image_url' => $j->cover_image_url,
              'scientific_field' => $j->scientificField ? $j->scientificField->name : null,
          ]);

      // 4. Paginated Articles Query
      $articlesQuery = Article::whereIn('journal_id', function ($query) use ($university) {
          $query->select('id')
              ->from('journals')
              ->where('university_id', $university->id)
              ->where('is_active', true)
              ->where('approval_status', 'approved');
      })->with(['journal']);

      // Apply Search Filter on Articles
      if ($request->filled('search')) {
          $articlesQuery->where('title', 'like', "%{$request->search}%");
      }

      // Apply Journal Filter on Articles
      if ($request->filled('journal_id')) {
          $articlesQuery->where('journal_id', $request->journal_id);
      }

      // Apply Year Filter on Articles
      if ($request->filled('year')) {
          $articlesQuery->whereYear('publication_date', $request->year);
      }

      $articles = $articlesQuery->orderBy('publication_date', 'desc')
          ->paginate(10)
          ->withQueryString();

      // List of years for article filter
      $years = Article::whereIn('journal_id', function ($query) use ($university) {
          $query->select('id')
              ->from('journals')
              ->where('university_id', $university->id);
      })
      ->whereNotNull('publication_date')
      ->selectRaw('YEAR(publication_date) as year')
      ->distinct()
      ->orderBy('year', 'desc')
      ->pluck('year')
      ->toArray();

      return Inertia::render('Browse/UniversityProfile', [
          'university' => $university,
          'stats' => [
              'total_journals' => $totalJournals,
              'total_articles' => $totalArticles,
              'scopus_count' => $scopusCount,
              'sinta_breakdown' => $sintaBreakdown,
          ],
          'journals' => $journals,
          'articles' => $articles,
          'years' => $years,
          'filters' => $request->only(['search', 'journal_id', 'year']),
      ]);
  }
  ```

- [ ] **Step 2: Create UniversityProfile.tsx Page Skeleton**
  Create the Inertia profile details page view skeleton with header banner and statistics cards.
  
  Code in [UniversityProfile.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/Pages/Browse/UniversityProfile.tsx):
  ```tsx
  import PublicLayout from '@/layouts/public-layout';
  import { Badge } from '@/components/ui/badge';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Head, Link, router } from '@inertiajs/react';
  import { Award, BookOpen, Building2, FileText, Globe, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
  import { useState } from 'react';

  interface Props {
      university: {
          id: number;
          name: string;
          short_name: string | null;
          code: string;
          address: string | null;
          city: string | null;
          province: string | null;
          website: string | null;
          email: string | null;
          phone: string | null;
          logo_url: string | null;
          accreditation_status: string | null;
          cluster: string | null;
          profile_description: string | null;
      };
      stats: {
          total_journals: number;
          total_articles: number;
          scopus_count: number;
          sinta_breakdown: Record<string, number>;
      };
      journals: any[];
      articles: any;
      years: number[];
      filters: any;
  }

  export default function UniversityProfile({ university, stats, journals, articles, years, filters }: Props) {
      return (
          <PublicLayout>
              <Head title={`${university.name} - JurnalMu`} />

              {/* Header Hero Section */}
              <div className="bg-gradient-to-r from-[#079C4E] to-[#056f37] py-12 text-white">
                  <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center gap-6">
                      {university.logo_url ? (
                          <img
                              src={university.logo_url}
                              alt={university.name}
                              className="h-24 w-24 rounded-2xl object-contain bg-white p-2 border-2 border-white/20 shadow-lg"
                          />
                      ) : (
                          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 text-white border-2 border-white/20 shadow-lg">
                              <Building2 className="h-12 w-12" />
                          </div>
                      )}
                      <div className="flex-1 text-center md:text-left">
                          <div className="flex flex-col md:flex-row md:items-center gap-3">
                              <h1 className="text-3xl font-bold font-heading" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                  {university.name}
                              </h1>
                              {university.accreditation_status && (
                                  <Badge className="bg-[#FCEE1F] text-black font-extrabold self-center md:self-start border-none">
                                      {university.accreditation_status}
                                  </Badge>
                              )}
                          </div>
                          <p className="mt-2 text-white/90">Kode PT: {university.code} {university.short_name && `• ${university.short_name}`}</p>
                          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-white/80">
                              {(university.address || university.city) && (
                                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-[#FCEE1F]" /> {university.address || university.city}</span>
                              )}
                              {university.website && (
                                  <a href={university.website.startsWith('http') ? university.website : `https://${university.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white underline">
                                      <Globe className="h-4 w-4 text-[#FCEE1F]" /> {university.website}
                                  </a>
                              )}
                              {university.email && (
                                  <span className="flex items-center gap-1"><Mail className="h-4 w-4 text-[#FCEE1F]" /> {university.email}</span>
                              )}
                          </div>
                      </div>
                  </div>
              </div>

              <div className="container mx-auto max-w-7xl px-4 py-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                      <Card>
                          <CardContent className="pt-6 flex items-center gap-4">
                              <div className="rounded-lg bg-emerald-50 p-3 text-[#079C4E]">
                                  <BookOpen className="h-6 w-6" />
                              </div>
                              <div>
                                  <p className="text-sm font-medium text-muted-foreground">Total Jurnal</p>
                                  <h3 className="text-2xl font-bold text-gray-900">{stats.total_journals}</h3>
                              </div>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardContent className="pt-6 flex items-center gap-4">
                              <div className="rounded-lg bg-emerald-50 p-3 text-[#079C4E]">
                                  <FileText className="h-6 w-6" />
                              </div>
                              <div>
                                  <p className="text-sm font-medium text-muted-foreground">Total Artikel</p>
                                  <h3 className="text-2xl font-bold text-gray-900">{stats.total_articles.toLocaleString('id-ID')}</h3>
                              </div>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardContent className="pt-6 flex items-center gap-4">
                              <div className="rounded-lg bg-emerald-50 p-3 text-[#079C4E]">
                                  <Award className="h-6 w-6" />
                              </div>
                              <div>
                                  <p className="text-sm font-medium text-muted-foreground">Jurnal Terindeks Scopus</p>
                                  <h3 className="text-2xl font-bold text-gray-900">{stats.scopus_count}</h3>
                              </div>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardContent className="pt-6 flex items-center gap-4">
                              <div className="rounded-lg bg-emerald-50 p-3 text-[#079C4E]">
                                  <ShieldCheck className="h-6 w-6" />
                              </div>
                              <div>
                                  <p className="text-sm font-medium text-muted-foreground">Cluster PT</p>
                                  <h3 className="text-2xl font-bold text-gray-900">{university.cluster || '-'}</h3>
                              </div>
                          </CardContent>
                      </Card>
                  </div>
              </div>
          </PublicLayout>
      );
  }
  ```

- [ ] **Step 3: Commit Task 3**
  ```bash
  git add app/Http/Controllers/PublicUniversityController.php resources/js/Pages/Browse/UniversityProfile.tsx
  git commit -m "feat(university): implement profile header metadata and metrics queries"
  ```

---

### Task 4: Sinta Distribution Chart & Registered Journals

**Files:**
- Modify: [UniversityProfile.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/Pages/Browse/UniversityProfile.tsx)

- [ ] **Step 1: Implement Sinta Chart and Journals Carousel**
  Import ApexCharts inside `UniversityProfile.tsx` to render the Sinta classification hybrid statistics.
  
  Complete imports and layout additions for `UniversityProfile.tsx` component body:
  ```tsx
  // Insert inside components import block:
  import ReactApexChart from 'react-apexcharts';
  import { Button } from '@/components/ui/button';
  import { CardDescription } from '@/components/ui/card';
  ```
  
  Add layout content inside `<div className="container mx-auto max-w-7xl px-4 py-8">` after the stats grid:
  ```tsx
  {/* Add layout below stats grid in UniversityProfile.tsx */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Sinta Breakdown Chart */}
      <Card className="lg:col-span-1">
          <CardHeader>
              <CardTitle className="text-lg">Klasifikasi SINTA Jurnal</CardTitle>
              <CardDescription>Distribusi akreditasi jurnal ilmiah terdaftar</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
              <ReactApexChart
                  options={{
                      chart: { type: 'donut', fontFamily: 'inherit' },
                      labels: ['Sinta 1', 'Sinta 2', 'Sinta 3', 'Sinta 4', 'Sinta 5', 'Sinta 6', 'Tidak Terakreditasi'],
                      colors: ['#079C4E', '#10b981', '#3b82f6', '#60a5fa', '#f59e0b', '#fca5a5', '#9ca3af'],
                      legend: { position: 'bottom' },
                      dataLabels: { enabled: false }
                  }}
                  series={[
                      stats.sinta_breakdown.S1,
                      stats.sinta_breakdown.S2,
                      stats.sinta_breakdown.S3,
                      stats.sinta_breakdown.S4,
                      stats.sinta_breakdown.S5,
                      stats.sinta_breakdown.S6,
                      stats.sinta_breakdown.TT
                  ]}
                  type="donut"
                  height={250}
              />
          </CardContent>
      </Card>

      {/* Registered Jurnal List */}
      <Card className="lg:col-span-2">
          <CardHeader>
              <CardTitle className="text-lg">Jurnal Terdaftar ({journals.length})</CardTitle>
              <CardDescription>Jurnal ilmiah Perguruan Tinggi yang sudah terverifikasi</CardDescription>
          </CardHeader>
          <CardContent>
              {journals.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">Belum ada jurnal terdaftar</div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                      {journals.map((journal) => (
                          <Link key={journal.id} href={route('journals.show', journal.id)}>
                              <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-[#079C4E] hover:bg-emerald-50/20 transition-all cursor-pointer">
                                  <div className="h-10 w-8 bg-gray-100 border flex items-center justify-center rounded text-[8px] font-bold text-gray-400 overflow-hidden">
                                      {journal.cover_image_url ? (
                                          <img src={journal.cover_image_url} alt={journal.title} className="h-full w-full object-cover" />
                                      ) : 'COVER'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-bold text-gray-900 truncate">{journal.title}</h4>
                                      <p className="text-xs text-muted-foreground truncate">{journal.scientific_field || 'Bidang Umum'}</p>
                                  </div>
                                  {journal.sinta_rank_label && (
                                      <Badge className="bg-[#079C4E] text-white text-xs">{journal.sinta_rank_label}</Badge>
                                  )}
                              </div>
                          </Link>
                      ))}
                  </div>
              )}
          </CardContent>
      </Card>
  </div>
  ```

- [ ] **Step 2: Commit Task 4**
  ```bash
  git add resources/js/Pages/Browse/UniversityProfile.tsx
  git commit -m "feat(university): add sinta breakdown chart and registered journals grid"
  ```

---

### Task 5: Implement Filterable Articles Database Table

**Files:**
- Modify: [UniversityProfile.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/Pages/Browse/UniversityProfile.tsx)

- [ ] **Step 1: Add Articles Table UI and Filters**
  Include filter inputs for searching article title, filtering by year, and filtering by journal, and render a paginated data table.
  
  Append to the imports block:
  ```tsx
  import { Input } from '@/components/ui/input';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
  ```
  
  Add states & filter logic:
  ```tsx
  // Put this logic inside the UniversityProfile function body:
  const [search, setSearch] = useState(filters.search || '');
  const [debouncedSearch] = useDebounce(search, 500);
  const [journalId, setJournalId] = useState(filters.journal_id || 'all');
  const [year, setYear] = useState(filters.year || 'all');

  // Trigger search update
  useEffect(() => {
      const query: any = {};
      if (debouncedSearch) query.search = debouncedSearch;
      if (journalId !== 'all') query.journal_id = journalId;
      if (year !== 'all') query.year = year;

      router.get(route('browse.universities.show', university.id), query, {
          preserveState: true,
          replace: true,
          preserveScroll: true
      });
  }, [debouncedSearch, journalId, year]);

  const handlePageChange = (url: string | null) => {
      if (!url) return;
      router.get(url, {}, { preserveScroll: true });
  };
  ```

  Add Articles Section HTML structure under the middle section grid in the layout return block:
  ```tsx
  {/* Articles Database Section */}
  <Card className="mt-8">
      <CardHeader>
          <CardTitle className="text-xl">Database Artikel Ilmiah</CardTitle>
          <CardDescription>Telusuri artikel ilmiah yang diterbitkan oleh jurnal milik Perguruan Tinggi ini</CardDescription>
      </CardHeader>
      <CardContent>
          {/* Article Filters Bar */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                  <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Cari Judul Artikel..."
                      className="pl-9"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                  />
              </div>

              <Select value={journalId} onValueChange={setJournalId}>
                  <SelectTrigger>
                      <SelectValue placeholder="Semua Jurnal" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Semua Jurnal</SelectItem>
                      {journals.map((j) => (
                          <SelectItem key={j.id} value={j.id.toString()}>{j.title}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>

              <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                      <SelectValue placeholder="Semua Tahun Terbit" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Semua Tahun Terbit</SelectItem>
                      {years.map((y) => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>

          {/* Articles Table */}
          {articles.data.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">Artikel tidak ditemukan</div>
          ) : (
              <div className="overflow-x-auto">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Artikel & Penulis</TableHead>
                              <TableHead>Jurnal</TableHead>
                              <TableHead>Tahun Terbit</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {articles.data.map((article: any) => (
                              <TableRow key={article.id}>
                                  <TableCell className="max-w-[450px]">
                                      <div className="font-bold text-gray-900 line-clamp-2">{article.title}</div>
                                      <div className="text-xs text-muted-foreground mt-1 truncate">
                                          {Array.isArray(article.authors) ? article.authors.join(', ') : (article.authors || 'Penulis Tidak Diketahui')}
                                      </div>
                                  </TableCell>
                                  <TableCell>
                                      {article.journal && (
                                          <Link href={route('journals.show', article.journal.id)} className="text-[#079C4E] hover:underline font-semibold text-xs">
                                              {article.journal.title}
                                          </Link>
                                      )}
                                  </TableCell>
                                  <TableCell>
                                      {article.publication_date ? new Date(article.publication_date).getFullYear() : '-'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                      {article.article_url && (
                                          <a href={article.article_url} target="_blank" rel="noopener noreferrer">
                                              <Button size="sm" className="bg-[#079C4E] hover:bg-[#068442] text-white">Buka Artikel</Button>
                                          </a>
                                      )}
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </div>
          )}

          {/* Pagination */}
          {articles.last_page > 1 && (
              <div className="mt-6 flex justify-center gap-1">
                  {articles.links.map((link: any, idx: number) => (
                      <Button
                          key={idx}
                          variant={link.active ? 'default' : 'outline'}
                          className={link.active ? 'bg-[#079C4E] text-white hover:bg-[#068442]' : ''}
                          onClick={() => handlePageChange(link.url)}
                          disabled={!link.url}
                          dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                  ))}
              </div>
          )}
      </CardContent>
  </Card>
  ```

- [ ] **Step 2: Commit Task 5**
  ```bash
  git add resources/js/Pages/Browse/UniversityProfile.tsx
  git commit -m "feat(university): implement searchable paginated articles table"
  ```

---

### Task 6: Add Automated Tests

**Files:**
- Create: [PublicUniversityTest.php](file:///C:/xampp/htdocs/jurnal_mu/tests/Feature/PublicUniversityTest.php)

- [ ] **Step 1: Write Route Integration Tests**
  Create Pest feature test to verify both list page and profile page, including parameters checking.
  
  Code in [PublicUniversityTest.php](file:///C:/xampp/htdocs/jurnal_mu/tests/Feature/PublicUniversityTest.php):
  ```php
  <?php

  use App\Models\University;
  use App\Models\Journal;
  use App\Models\Article;
  use Inertia\Testing\AssertableInertia;

  it('loads public universities listing successfully with filters', function () {
      University::factory()->create([
          'name' => 'Universitas Muhammadiyah A',
          'code' => '051001',
          'is_active' => true,
          'accreditation_status' => 'Unggul'
      ]);

      University::factory()->create([
          'name' => 'Universitas Muhammadiyah B',
          'code' => '051002',
          'is_active' => true,
          'accreditation_status' => 'A'
      ]);

      // Request listing page
      $response = $this->get(route('browse.universities'));

      $response->assertStatus(200);
      $response->assertInertia(fn (AssertableInertia $page) => $page
          ->component('Browse/Universities')
          ->has('universities.data', 2)
          ->has('accreditationOptions')
      );
  });

  it('loads specific active university profile details successfully', function () {
      $university = University::factory()->create([
          'name' => 'Test University',
          'is_active' => true,
          'accreditation_status' => 'Unggul'
      ]);

      $journal = Journal::factory()->create([
          'university_id' => $university->id,
          'title' => 'Test Journal',
          'is_active' => true,
          'approval_status' => 'approved',
          'sinta_rank' => 'sinta_2'
      ]);

      Article::factory()->create([
          'journal_id' => $journal->id,
          'title' => 'Test Article Title',
          'authors' => ['Author A', 'Author B'],
          'publication_date' => '2026-05-15'
      ]);

      $response = $this->get(route('browse.universities.show', $university->id));

      $response->assertStatus(200);
      $response->assertInertia(fn (AssertableInertia $page) => $page
          ->component('Browse/UniversityProfile')
          ->where('university.name', 'Test University')
          ->where('stats.total_journals', 1)
          ->where('stats.total_articles', 1)
          ->has('articles.data', 1)
      );
  });
  ```

- [ ] **Step 2: Run Tests to Verify**
  Run: `php artisan test tests/Feature/PublicUniversityTest.php`
  Expected: All tests pass.

- [ ] **Step 3: Commit Task 6**
  ```bash
  git add tests/Feature/PublicUniversityTest.php
  git commit -m "test(university): add public university listing and profile tests"
  ```
