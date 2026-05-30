# University Profile Charts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display a combined line/column chart on the public University Profile page showing cumulative journal growth and yearly article publication counts.

**Architecture:** 
1. Backend: Calculate `established_year` for each journal of a university using `first_published_year` database column, falling back to the oldest article's publication year. Range years dynamically from the earliest established year to the current year. Count cumulative journals and direct article publications per year, passing `chartData` to the Inertia view.
2. Frontend: Render a combined ReactApexChart component displaying cumulative journal growth as a green line (left y-axis) and yearly articles as a blue bar (right y-axis).

**Tech Stack:** Laravel, Inertia.js, React, TypeScript, ApexCharts (react-apexcharts)

---

### Task 1: Backend Implementation & Tests

**Files:**
- Modify: `app/Http/Controllers/PublicUniversityController.php`
- Modify: `tests/Feature/PublicUniversityTest.php`

- [ ] **Step 1: Write the failing test**

Add this test at the end of [PublicUniversityTest.php](file:///C:/xampp/htdocs/jurnal_mu/tests/Feature/PublicUniversityTest.php):

```php
it('passes correct chartData to public university profile view', function () {
    $university = University::factory()->create([
        'name' => 'Chart Test University',
        'is_active' => true,
    ]);

    $journal1 = Journal::factory()->create([
        'university_id' => $university->id,
        'title' => 'Journal 1',
        'is_active' => true,
        'approval_status' => 'approved',
        'first_published_year' => 2022,
    ]);

    $journal2 = Journal::factory()->create([
        'university_id' => $university->id,
        'title' => 'Journal 2',
        'is_active' => true,
        'approval_status' => 'approved',
        'first_published_year' => null, // fallback to article
    ]);

    Article::factory()->create([
        'journal_id' => $journal2->id,
        'publication_date' => '2024-06-15',
    ]);

    Article::factory()->create([
        'journal_id' => $journal1->id,
        'publication_date' => '2024-08-20',
    ]);

    Article::factory()->create([
        'journal_id' => $journal1->id,
        'publication_date' => '2025-01-10',
    ]);

    $response = $this->get(route('browse.universities.show', $university->id));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/UniversityProfile')
        ->has('chartData')
        ->where('chartData.years', [2022, 2023, 2024, 2025, 2026])
        ->where('chartData.journals', [1, 1, 2, 2, 2]) // Cumulative: 2022=1, 2023=1, 2024=2, 2025=2, 2026=2
        ->where('chartData.articles', [0, 0, 2, 1, 0]) // Non-cumulative: 2022=0, 2023=0, 2024=2, 2025=1, 2026=0
    );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/PublicUniversityTest.php`
Expected: FAIL with "Property [chartData] does not exist" or similar.

- [ ] **Step 3: Write implementation**

Modify `show` method in [PublicUniversityController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/PublicUniversityController.php) around line 192:

```diff
+        // Calculate chartData: Journal growth & Article publication trends
+        $universityJournals = Journal::where('university_id', $university->id)
+            ->where('is_active', true)
+            ->where('approval_status', 'approved')
+            ->get(['id', 'first_published_year']);
+
+        $driver = DB::connection()->getDriverName();
+        $yearRaw = match ($driver) {
+            'sqlite' => "strftime('%Y', publication_date)",
+            'pgsql' => "extract(year from publication_date)",
+            default => "YEAR(publication_date)",
+        };
+
+        $journalMinYears = DB::table('articles')
+            ->select('journal_id', DB::raw("MIN($yearRaw) as min_year"))
+            ->whereIn('journal_id', $universityJournals->pluck('id'))
+            ->whereNotNull('publication_date')
+            ->groupBy('journal_id')
+            ->pluck('min_year', 'journal_id')
+            ->toArray();
+
+        $establishedYears = [];
+        foreach ($universityJournals as $journal) {
+            $minArticleYear = $journalMinYears[$journal->id] ?? null;
+            $establishedYear = $journal->first_published_year ?? $minArticleYear;
+            if ($establishedYear && (int) $establishedYear > 1900) {
+                $establishedYears[] = (int) $establishedYear;
+                $journal->established_year = (int) $establishedYear;
+            } else {
+                $establishedYears[] = (int) date('Y');
+                $journal->established_year = (int) date('Y');
+            }
+        }
+
+        $startYear = !empty($establishedYears) ? min($establishedYears) : (int) date('Y') - 4;
+        $endYear = (int) date('Y');
+        if ($startYear < 1900) {
+            $startYear = 2020;
+        }
+        $yearsRange = range($startYear, $endYear);
+
+        $articleCountsByYear = DB::table('articles')
+            ->select(DB::raw("$yearRaw as year"), DB::raw('count(*) as total'))
+            ->whereIn('journal_id', $universityJournals->pluck('id'))
+            ->whereNotNull('publication_date')
+            ->groupBy('year')
+            ->pluck('total', 'year')
+            ->toArray();
+
+        $chartData = [
+            'years' => [],
+            'journals' => [],
+            'articles' => [],
+        ];
+
+        foreach ($yearsRange as $year) {
+            $cumulativeJournals = 0;
+            foreach ($universityJournals as $journal) {
+                if ($journal->established_year <= $year) {
+                    $cumulativeJournals++;
+                }
+            }
+
+            $chartData['years'][] = $year;
+            $chartData['journals'][] = $cumulativeJournals;
+            $chartData['articles'][] = (int) ($articleCountsByYear[$year] ?? 0);
+        }

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
             'filters' => (object) $request->only(['search', 'journal_id', 'year']),
+            'chartData' => $chartData,
         ]);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php -d variables_order=EGPCS DB_HOST=127.0.0.1 php artisan test tests/Feature/PublicUniversityTest.php` (override DB_HOST if required locally, or run standard `php artisan test`)
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/PublicUniversityController.php tests/Feature/PublicUniversityTest.php
git commit -m "feat(backend): calculate and pass chartData for university profile growth trends"
```

---

### Task 2: Frontend Implementation

**Files:**
- Modify: `resources/js/pages/Browse/UniversityProfile.tsx`

- [ ] **Step 1: Write implementation**

Update [UniversityProfile.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/Browse/UniversityProfile.tsx):

1. Update `Props` interface to receive `chartData`:
```typescript
interface ChartData {
    years: number[];
    journals: number[];
    articles: number[];
}

interface Props {
    // ... existing
    chartData: ChartData;
}
```

2. Inside `UniversityProfile` component, prepare ApexCharts options and series:
```typescript
    const chartSeries = [
        {
            name: 'Jurnal (Kumulatif)',
            type: 'line',
            data: chartData?.journals || [],
        },
        {
            name: 'Artikel Terbit',
            type: 'column',
            data: chartData?.articles || [],
        },
    ];

    const chartOptions = {
        chart: {
            type: 'line',
            height: 350,
            fontFamily: 'inherit',
            toolbar: { show: false },
        },
        stroke: {
            width: [4, 0],
            curve: 'smooth',
        },
        colors: ['#079C4E', '#3b82f6'],
        plotOptions: {
            bar: {
                columnWidth: '50%',
                borderRadius: 4,
            },
        },
        dataLabels: {
            enabled: false,
        },
        labels: (chartData?.years || []).map(String),
        xaxis: {
            type: 'category',
        },
        yaxis: [
            {
                title: {
                    text: 'Jurnal (Kumulatif)',
                },
                labels: {
                    formatter: (val: number) => Math.round(val),
                },
                min: 0,
            },
            {
                opposite: true,
                title: {
                    text: 'Artikel Terbit',
                },
                labels: {
                    formatter: (val: number) => Math.round(val),
                },
                min: 0,
            },
        ],
        tooltip: {
            shared: true,
            intersect: false,
        },
        legend: {
            position: 'top',
        },
    };
```

3. Insert Card layout right below the Stats Grid (after line 180) and before Sinta card section:
```tsx
                {/* Development Trend Chart */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-lg">Tren Perkembangan Jurnal & Artikel</CardTitle>
                        <CardDescription>Visualisasi pertumbuhan kumulatif jumlah jurnal dan publikasi artikel setiap tahun</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {ReactApexChart ? (
                            <ReactApexChart
                                options={chartOptions}
                                series={chartSeries}
                                type="line"
                                height={350}
                                width="100%"
                            />
                        ) : (
                            <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                                Memuat Grafik...
                            </div>
                        )}
                    </CardContent>
                </Card>
```

- [ ] **Step 2: Verify compile**

Run: `npm run build` & `npm run types`
Expected: SUCCESS with zero errors.

- [ ] **Step 3: Commit**

```bash
git add resources/js/pages/Browse/UniversityProfile.tsx
git commit -m "feat(frontend): display combined journal growth and article publications chart"
```
