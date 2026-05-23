# Browse Universities UI/UX Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Browse Universities UI/UX to match the premium green gradient brand design of the JurnalMu portal, extract reusable PublicNavbar/PublicFooter components, set up a 3-column grid with logo/name emphasis, and implement responsive pagination.

**Architecture:** We will build reusable `<PublicNavbar>` and `<PublicFooter>` React components, update existing public pages to use them, add university pagination and `logo_url` loading to `PublicJournalController.php`, add feature tests, and completely overhaul the layout of `Browse/Universities.tsx`.

**Tech Stack:** React, Tailwind CSS, Lucide icons, Inertia.js, Laravel (PHP 8.2, PHPUnit)

---

### Task 1: Create Public Navbar Component

**Files:**
- Create: `resources/js/components/public-navbar.tsx`

- [ ] **Step 1: Create the new reusable PublicNavbar component**
  Write the component with standard Inertia routing, using `@/assets/logo_dark.png` and pulling authentication details from the Inertia page props.
  Code content:
  ```tsx
  import logoUrl from '@/assets/logo_dark.png';
  import { type SharedData } from '@/types';
  import { Link, usePage } from '@inertiajs/react';
  import { Button } from '@/components/ui/button';
  import { Home, LayoutDashboard } from 'lucide-react';

  export default function PublicNavbar() {
      const { auth } = usePage<SharedData>().props;

      return (
          <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#079C4E] text-white backdrop-blur-md transition-all">
              <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-3">
                      <Link href={route('home')} className="flex items-center gap-3 transition-opacity hover:opacity-90">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                              <img src={logoUrl} alt="Majelis Diktilitbang" className="h-8 w-8 object-contain" />
                          </div>
                          <span className="font-heading text-2xl font-bold" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                              Journal MU
                          </span>
                      </Link>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4">
                      <div className="hidden items-center gap-6 pr-4 sm:flex">
                          <Link href={route('journals.index')} className="font-semibold text-white/90 transition-colors hover:text-white">
                              Journals
                          </Link>
                          <Link href={route('browse.universities')} className="font-semibold text-white/90 transition-colors hover:text-white">
                              Universities
                          </Link>
                          <Link href={route('events.index')} className="font-semibold text-white/90 transition-colors hover:text-white">
                              Events
                          </Link>
                      </div>
                      {auth?.user ? (
                          <Link href={route('dashboard')}>
                              <Button variant="secondary" className="border-0 bg-white font-bold text-[#079C4E] hover:bg-gray-100">
                                  <LayoutDashboard className="mr-2 h-4 w-4" />
                                  <span className="hidden sm:inline">Dashboard</span>
                              </Button>
                          </Link>
                      ) : (
                          <>
                              <Link href={route('login')}>
                                  <Button variant="ghost" className="px-2 text-white hover:bg-white/20 hover:text-white sm:px-4">
                                      Log in
                                  </Button>
                              </Link>
                              <Link href={route('register')}>
                                  <Button className="border-0 bg-[#FCEE1F] px-3 font-bold text-black hover:bg-[#e3d51b] sm:px-4">
                                      Register
                                  </Button>
                              </Link>
                          </>
                      )}
                  </div>
              </div>
          </nav>
      );
  }
  ```

- [ ] **Step 2: Commit Task 1**
  Run:
  ```bash
  git add resources/js/components/public-navbar.tsx
  git commit -m "feat: create reusable PublicNavbar component"
  ```

---

### Task 2: Create Public Footer Component

**Files:**
- Create: `resources/js/components/public-footer.tsx`

- [ ] **Step 1: Create the new reusable PublicFooter component**
  Write the footer component incorporating navigation links, copyright, and Laravel/PHP version indicators.
  Code content:
  ```tsx
  import { Link, usePage } from '@inertiajs/react';

  interface PageProps {
      laravelVersion?: string;
      phpVersion?: string;
  }

  export default function PublicFooter() {
      const { laravelVersion, phpVersion } = usePage<{ props: PageProps }>().props as any;

      return (
          <footer className="bg-[#0f172a] py-12 text-center text-sm text-gray-500">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="mb-8 flex justify-center gap-6">
                      <Link href={route('home')} className="hover:text-white">
                          Home
                      </Link>
                      <a href="#" className="hover:text-white">
                          About Us
                      </a>
                      <a href="#" className="hover:text-white">
                          Privacy Policy
                      </a>
                      <a href="#" className="hover:text-white">
                          Contact Support
                      </a>
                  </div>
                  <p>&copy; {new Date().getFullYear()} JurnalMu - Muhammadiyah Higher Education Research Network.</p>
                  {laravelVersion && phpVersion && (
                      <p className="mt-2 text-xs text-gray-600">
                          Laravel v{laravelVersion} (PHP v{phpVersion})
                      </p>
                  )}
              </div>
          </footer>
      );
  }
  ```

- [ ] **Step 2: Commit Task 2**
  Run:
  ```bash
  git add resources/js/components/public-footer.tsx
  git commit -m "feat: create reusable PublicFooter component"
  ```

---

### Task 3: Replace Hardcoded Layouts in Public Pages

**Files:**
- Modify: `resources/js/pages/welcome.tsx`
- Modify: `resources/js/pages/Journals/Index.tsx`

- [ ] **Step 1: Update welcome.tsx to use PublicNavbar and PublicFooter**
  Remove hardcoded navbar/footer, and import the components.
  Lines to modify:
  Replace the navbar block (lines 57-101) with `<PublicNavbar />`.
  Replace the footer block (lines 412-432) with `<PublicFooter />`.

- [ ] **Step 2: Update Journals/Index.tsx to use PublicNavbar and PublicFooter**
  Replace the navbar block (lines 147-185) with `<PublicNavbar />`.
  Replace the footer block (lines 462-482) with `<PublicFooter />`.

- [ ] **Step 3: Commit Task 3**
  Run:
  ```bash
  git add resources/js/pages/welcome.tsx resources/js/pages/Journals/Index.tsx
  git commit -m "refactor: use reusable PublicNavbar and PublicFooter in welcome and journals index pages"
  ```

---

### Task 4: Update Backend Controller for Universities Browse

**Files:**
- Modify: `app/Http/Controllers/PublicJournalController.php`

- [ ] **Step 1: Modify browseUniversities method to load logo_url and paginate results**
  Update the method to query the `logo_url` field and change `->get()` to `->paginate(12)`.
  Ensure query parameters are preserved with `withQueryString()`.
  Code changes around lines 282-343:
  ```php
      public function browseUniversities(Request $request): Response
      {
          // Query active universities with approved journals count
          $universityQuery = University::where('is_active', true)
              ->withCount([
                  'journals' => function ($query) {
                      $query->where('is_active', true)
                          ->where('approval_status', 'approved');
                  },
              ])
              ->having('journals_count', '>', 0)
              ->orderBy('name');

          // Paginate results (12 items per page) to match journals layout
          $universityStats = $universityQuery->paginate(12)
              ->withQueryString()
              ->through(fn ($uni) => [
                  'id' => $uni->id,
                  'name' => $uni->name,
                  'code' => $uni->code,
                  'short_name' => $uni->short_name,
                  'logo_url' => $uni->logo_url,
                  'journals_count' => $uni->journals_count,
              ]);

          // If specific university selected, show its journals
          $selectedUniversity = null;
          $journals = null;

          if ($request->filled('university_id')) {
              $selectedUniversity = University::find($request->university_id);

              if ($selectedUniversity) {
                  // Get journals for selected university with pagination
                  $journals = Journal::query()
                      ->with(['scientificField'])
                      ->where('university_id', $request->university_id)
                      ->where('is_active', true)
                      ->where('approval_status', 'approved')
                      ->orderBy('title')
                      ->paginate(12)
                      ->withQueryString()
                      ->through(fn ($journal) => [
                          'id' => $journal->id,
                          'title' => $journal->title,
                          'issn' => $journal->issn,
                          'e_issn' => $journal->e_issn,
                          'url' => $journal->url,
                          'scientific_field' => $journal->scientificField ? [
                              'id' => $journal->scientificField->id,
                              'name' => $journal->scientificField->name,
                          ] : null,
                          'sinta_rank' => $journal->sinta_rank,
                          'sinta_rank_label' => $journal->sinta_rank_label,
                          'is_indexed_in_scopus' => $journal->is_indexed_in_scopus,
                      ]);
              }
          }

          return Inertia::render('Browse/Universities', [
              'universityStats' => $universityStats,
              'selectedUniversity' => $selectedUniversity ? [
                  'id' => $selectedUniversity->id,
                  'name' => $selectedUniversity->name,
                  'code' => $selectedUniversity->code,
                  'short_name' => $selectedUniversity->short_name,
                  'logo_url' => $selectedUniversity->logo_url,
              ] : null,
              'journals' => $journals,
              'filters' => $request->only(['university_id']),
          ]);
      }
  ```

- [ ] **Step 2: Commit Task 4**
  Run:
  ```bash
  git add app/Http/Controllers/PublicJournalController.php
  git commit -m "feat: add logo_url and pagination to browseUniversities controller query"
  ```

---

### Task 5: Write Automated Feature Tests

**Files:**
- Modify: `tests/Feature/PublicJournalTest.php`

- [ ] **Step 1: Add browse universities test cases to PublicJournalTest.php**
  Add tests validating the browse universities route loads, returns paginated statistics, handles selected university route variables, and responds with logo URLs.
  Code content to append:
  ```php
  it('loads public browse universities page with paginated stats', function () {
      $university = University::factory()->create([
          'is_active' => true,
          'logo_url' => '/storage/logos/sample.png',
      ]);

      Journal::factory()->create([
          'university_id' => $university->id,
          'is_active' => true,
          'approval_status' => 'approved',
      ]);

      $response = $this->get(route('browse.universities'));

      $response->assertStatus(200);
      $response->assertInertia(fn (AssertableInertia $page) => $page
          ->component('Browse/Universities')
          ->has('universityStats')
          ->has('universityStats.data', 1)
          ->where('universityStats.data.0.logo_url', '/storage/logos/sample.png')
          ->where('universityStats.data.0.journals_count', 1)
          ->where('selectedUniversity', null)
      );
  });
  ```

- [ ] **Step 2: Run verification test and ensure it fails**
  Run: `docker exec -it jurnal_mu_app php artisan test --filter=loads_public_browse_universities_page_with_paginated_stats`
  Expected: FAIL (because `Browse/Universities.tsx` does not yet expect the paginated `universityStats` structure with `.data`).

- [ ] **Step 3: Commit Task 5**
  Run:
  ```bash
  git add tests/Feature/PublicJournalTest.php
  git commit -m "test: add automated feature test for browse universities endpoint"
  ```

---

### Task 6: Refactor Universities Browse Page Frontend

**Files:**
- Modify: `resources/js/pages/Browse/Universities.tsx`

- [ ] **Step 1: Fully refactor Browse/Universities.tsx**
  Implement the new UI design using the paginated data structure, dynamic hero headers, brand fonts, 3-column layouts, logo images with custom fallback circles, and double pagination.
  Code structure:
  ```tsx
  import logoUrl from '@/assets/logo_dark.png';
  import JournalCard from '@/components/journal-card';
  import PublicNavbar from '@/components/public-navbar';
  import PublicFooter from '@/components/public-footer';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
  import { UniversityFilterCombobox } from '@/components/ui/university-filter-combobox';
  import { Head, Link, router } from '@inertiajs/react';
  import { BookOpen, Building2, ChevronLeft, ChevronRight, Home } from 'lucide-react';
  import { useState } from 'react';

  interface Journal {
      id: number;
      title: string;
      issn: string | null;
      e_issn: string | null;
      url: string | null;
      scientific_field: {
          id: number;
          name: string;
      } | null;
      sinta_rank: number | null;
      sinta_rank_label: string | null;
      is_indexed_in_scopus: boolean;
  }

  interface UniversityStat {
      id: number;
      name: string;
      code: string;
      short_name: string;
      logo_url: string | null;
      journals_count: number;
  }

  interface SelectedUniversity {
      id: number;
      name: string;
      code: string;
      short_name: string;
      logo_url: string | null;
  }

  interface PaginatedData<T> {
      data: T[];
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      links: Array<{
          url: string | null;
          label: string;
          active: boolean;
      }>;
  }

  interface Props {
      universityStats: PaginatedData<UniversityStat>;
      selectedUniversity: SelectedUniversity | null;
      journals: PaginatedData<Journal> | null;
      filters: {
          university_id?: string;
      };
  }

  export default function BrowseUniversities({ universityStats, selectedUniversity, journals, filters }: Props) {
      const [universityFilter, setUniversityFilter] = useState(filters.university_id || '');

      const handleUniversityChange = (value: string) => {
          setUniversityFilter(value);
          if (value && value !== 'all') {
              router.get(route('browse.universities'), { university_id: value }, { preserveState: true });
          } else {
              router.get(route('browse.universities'), {}, { preserveState: true });
          }
      };

      const handleUniversityCardClick = (universityId: number) => {
          setUniversityFilter(universityId.toString());
          router.get(route('browse.universities'), { university_id: universityId }, { preserveState: true });
      };

      const handlePageChange = (url: string | null) => {
          if (!url) return;
          router.get(url, {}, { preserveScroll: true, preserveState: true });
      };

      // Helper function to extract initials for fallback logo
      const getInitials = (name: string, shortName?: string) => {
          if (shortName) return shortName.substring(0, 4);
          return name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 3)
              .toUpperCase();
      };

      return (
          <>
              <Head title={selectedUniversity ? `${selectedUniversity.name} - Universities` : "Browse by University - JurnalMu"}>
                  <link rel="preconnect" href="https://fonts.googleapis.com" />
                  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                  <link
                      href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                      rel="stylesheet"
                  />
              </Head>

              <div className="min-h-screen bg-gray-50 font-sans text-[#1b1b18] selection:bg-[#079C4E] selection:text-white dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                  <PublicNavbar />

                  {/* Dynamic Adaptive Hero Header */}
                  <main className="pt-16">
                      <div className="bg-gradient-to-br from-[#079C4E] to-[#10816F] pt-16 pb-20 text-white">
                          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                              {selectedUniversity ? (
                                  <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
                                      {/* Selected University Logo */}
                                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-3 shadow-md">
                                          {selectedUniversity.logo_url ? (
                                              <img
                                                  src={selectedUniversity.logo_url}
                                                  alt={selectedUniversity.name}
                                                  className="h-full w-full object-contain"
                                              />
                                          ) : (
                                              <span className="text-xl font-bold text-[#079C4E]">
                                                  {getInitials(selectedUniversity.name, selectedUniversity.short_name)}
                                              </span>
                                          )}
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex flex-wrap items-center gap-3">
                                              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: '"El Messiri", serif' }}>
                                                  {selectedUniversity.name}
                                              </h1>
                                              <Badge className="bg-[#FCEE1F] text-black hover:bg-[#FCEE1F]/90 font-mono">
                                                  {selectedUniversity.code}
                                              </Badge>
                                          </div>
                                          <p className="mt-2 text-emerald-50 max-w-2xl text-lg">
                                              Explore {journals?.total || 0} academic journals published by this institution
                                          </p>
                                      </div>
                                      <Button
                                          onClick={() => handleUniversityChange('all')}
                                          className="mt-4 border-0 bg-white font-bold text-[#079C4E] hover:bg-gray-100 md:mt-0"
                                      >
                                          <ChevronLeft className="mr-2 h-4 w-4" />
                                          Back to All
                                      </Button>
                                  </div>
                              ) : (
                                  <div>
                                      <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: '"El Messiri", serif' }}>
                                          Browse by <span className="text-[#FCEE1F]">University</span>
                                      </h1>
                                      <p className="max-w-2xl text-lg text-emerald-50">
                                          Explore {universityStats.total} Muhammadiyah Higher Education Institutions and discover their academic research outlets
                                      </p>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Filter panel, overlapping on desktop */}
                      <div className="relative z-20 mx-auto -mt-10 mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
                          <Card className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border-none">
                              <CardContent className="p-0">
                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                      <div className="flex-1">
                                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                              Quick Navigation
                                          </span>
                                          <p className="text-xs text-muted-foreground mt-1">
                                              Choose a university from the directory list or use search below
                                          </p>
                                      </div>
                                      <UniversityFilterCombobox
                                          universities={universityStats.data.map((uni) => ({
                                              id: uni.id,
                                              name: uni.name,
                                              code: uni.code,
                                              short_name: uni.short_name,
                                          }))}
                                          value={universityFilter || 'all'}
                                          onValueChange={handleUniversityChange}
                                          placeholder="Search and select university..."
                                          className="h-12 w-full sm:max-w-md border-gray-200 dark:border-zinc-800"
                                      />
                                  </div>
                              </CardContent>
                          </Card>
                      </div>

                      {/* Main Section */}
                      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                          {selectedUniversity && journals ? (
                              /* Detail View */
                              <div className="space-y-8">
                                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                      Showing {journals.data.length > 0 ? (journals.current_page - 1) * journals.per_page + 1 : 0} to{' '}
                                      {Math.min(journals.current_page * journals.per_page, journals.total)} of {journals.total} journals
                                  </div>

                                  {journals.data.length === 0 ? (
                                      <div className="rounded-2xl bg-white p-16 text-center shadow-lg dark:bg-zinc-900">
                                          <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No journals found</h3>
                                          <p className="mb-6 text-gray-600 dark:text-gray-400">No journals are currently published by this university.</p>
                                          <Button variant="outline" onClick={() => handleUniversityChange('all')}>
                                              Back to All Universities
                                          </Button>
                                      </div>
                                  ) : (
                                      <div className="space-y-8">
                                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                              {journals.data.map((journal) => (
                                                  <JournalCard
                                                      key={journal.id}
                                                      id={journal.id}
                                                      title={journal.title}
                                                      issn={journal.issn}
                                                      e_issn={journal.e_issn}
                                                      sinta_rank={journal.sinta_rank_label}
                                                      external_url={journal.url}
                                                  />
                                              ))}
                                          </div>

                                          {/* Journals Pagination */}
                                          {journals.last_page > 1 && (
                                              <div className="mt-12 flex items-center justify-between">
                                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                                      Page {journals.current_page} of {journals.last_page}
                                                  </div>
                                                  <div className="flex gap-2">
                                                      {journals.links.map((link, index) => {
                                                          const isPrev = link.label.includes('Previous');
                                                          const isNext = link.label.includes('Next');

                                                          return (
                                                              <Button
                                                                  key={index}
                                                                  variant={link.active ? 'default' : 'outline'}
                                                                  size="sm"
                                                                  disabled={!link.url}
                                                                  onClick={() => handlePageChange(link.url)}
                                                                  className={link.active ? 'bg-[#079C4E] hover:bg-[#068A42] text-white border-0' : ''}
                                                              >
                                                                  {isPrev ? <ChevronLeft className="h-4 w-4 mr-1 sm:inline" /> : null}
                                                                  <span className={isPrev || isNext ? 'hidden sm:inline' : ''}>
                                                                      {isPrev ? 'Previous' : isNext ? 'Next' : link.label}
                                                                  </span>
                                                                  {isNext ? <ChevronRight className="h-4 w-4 ml-1 sm:inline" /> : null}
                                                              </Button>
                                                          );
                                                      })}
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  )}
                              </div>
                          ) : (
                              /* List View: 3-column Grid of Universities */
                              <div className="space-y-8">
                                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                      Showing {universityStats.data.length > 0 ? (universityStats.current_page - 1) * universityStats.per_page + 1 : 0} to{' '}
                                      {Math.min(universityStats.current_page * universityStats.per_page, universityStats.total)} of {universityStats.total} universities
                                  </div>

                                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                      {universityStats.data.map((university) => (
                                          <Card
                                              key={university.id}
                                              className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-zinc-900 flex flex-col justify-between"
                                              onClick={() => handleUniversityCardClick(university.id)}
                                          >
                                              <div className="flex gap-4">
                                                  {/* University Logo / Fallback initials */}
                                                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white border border-gray-100 dark:border-zinc-800 p-2 shadow-sm object-contain font-sans">
                                                      {university.logo_url ? (
                                                          <img
                                                              src={university.logo_url}
                                                              alt={university.name}
                                                              className="h-full w-full object-contain"
                                                          />
                                                      ) : (
                                                          <div className="flex h-full w-full items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-[#079C4E] dark:bg-emerald-950/20">
                                                              {getInitials(university.name, university.short_name)}
                                                          </div>
                                                      )}
                                                  </div>
                                                  <div className="flex-1 space-y-1.5">
                                                      <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#079C4E] transition-colors">
                                                          {university.name}
                                                      </h3>
                                                      <div className="flex flex-wrap gap-2">
                                                          {university.short_name && (
                                                              <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-600 py-0 px-2 font-medium">
                                                                  {university.short_name}
                                                              </Badge>
                                                          )}
                                                          <Badge variant="outline" className="text-xs border-gray-100 text-gray-400 py-0 px-2 font-mono">
                                                              {university.code}
                                                          </Badge>
                                                      </div>
                                                  </div>
                                              </div>
                                              
                                              <div className="mt-6 pt-4 border-t border-gray-50 dark:border-zinc-800/50 flex items-center justify-between text-sm">
                                                  <span className="text-gray-500 font-medium">Registered Journals</span>
                                                  <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1 font-bold text-xs text-[#079C4E] ring-1 ring-emerald-500/20 dark:bg-emerald-500/10">
                                                      {university.journals_count} {university.journals_count === 1 ? 'Journal' : 'Journals'}
                                                  </span>
                                              </div>
                                          </Card>
                                      ))}
                                  </div>

                                  {/* Universities Pagination */}
                                  {universityStats.last_page > 1 && (
                                      <div className="mt-12 flex items-center justify-between">
                                          <div className="text-sm text-gray-600 dark:text-gray-400">
                                              Page {universityStats.current_page} of {universityStats.last_page}
                                          </div>
                                          <div className="flex gap-2">
                                              {universityStats.links.map((link, index) => {
                                                  const isPrev = link.label.includes('Previous');
                                                  const isNext = link.label.includes('Next');

                                                  return (
                                                      <Button
                                                          key={index}
                                                          variant={link.active ? 'default' : 'outline'}
                                                          size="sm"
                                                          disabled={!link.url}
                                                          onClick={() => handlePageChange(link.url)}
                                                          className={link.active ? 'bg-[#079C4E] hover:bg-[#068A42] text-white border-0' : ''}
                                                      >
                                                          {isPrev ? <ChevronLeft className="h-4 w-4 mr-1 sm:inline" /> : null}
                                                          <span className={isPrev || isNext ? 'hidden sm:inline' : ''}>
                                                              {isPrev ? 'Previous' : isNext ? 'Next' : link.label}
                                                          </span>
                                                          {isNext ? <ChevronRight className="h-4 w-4 ml-1 sm:inline" /> : null}
                                                      </Button>
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  </main>

                  <PublicFooter />
              </div>
          </>
      );
  }
  ```

- [ ] **Step 2: Commit Task 6**
  Run:
  ```bash
  git add resources/js/pages/Browse/Universities.tsx
  git commit -m "style: refactor browse universities page to match premium brand design with 3-column grid and pagination"
  ```

---

### Task 7: Verification

**Files:**
- None

- [ ] **Step 1: Run PHPUnit verification tests**
  Run: `docker exec -it jurnal_mu_app php artisan test --filter=loads_public_browse_universities_page_with_paginated_stats`
  Expected: PASS

- [ ] **Step 2: Compile assets and verify build**
  Run: `npm run build`
  Expected: PASS with no compilation errors.
