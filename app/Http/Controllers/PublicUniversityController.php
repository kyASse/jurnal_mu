<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Journal;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PublicUniversityController extends Controller
{
    // Skeleton methods to be implemented next
    public function index(Request $request): Response
    {
        $query = University::query()
            ->where('is_active', true)
            ->whereHas('journals', function ($q) {
                $q->where('is_active', true)
                    ->where('approval_status', 'approved');
            })
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

        $universitiesList = University::where('is_active', true)
            ->whereHas('journals', function ($q) {
                $q->where('is_active', true)
                    ->where('approval_status', 'approved');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'short_name']);

        // Get available accreditations for filter options
        $accreditationOptions = University::where('is_active', true)
            ->whereNotNull('accreditation_status')
            ->whereHas('journals', function ($q) {
                $q->where('is_active', true)
                    ->where('approval_status', 'approved');
            })
            ->distinct()
            ->pluck('accreditation_status');

        return Inertia::render('Browse/Universities', [
            'universityStats' => $universities,
            'universities' => $universitiesList,
            'filters' => (object) $request->only(['search', 'accreditation', 'sort']),
            'accreditationOptions' => $accreditationOptions,
        ]);
    }

    public function show(University $university, Request $request): Response
    {
        if (!$university->is_active || !$university->journals()->where('is_active', true)->where('approval_status', 'approved')->exists()) {
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
            ->indexedInScopus()
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
            ->map(fn ($j) => [
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
        $driver = DB::connection()->getDriverName();
        $yearExpression = match ($driver) {
            'sqlite' => "strftime('%Y', publication_date) as year",
            'pgsql' => 'extract(year from publication_date) as year',
            default => 'YEAR(publication_date) as year',
        };

        $years = Article::whereIn('journal_id', function ($query) use ($university) {
            $query->select('id')
                ->from('journals')
                ->where('university_id', $university->id)
                ->where('is_active', true)
                ->where('approval_status', 'approved');
        })
            ->whereNotNull('publication_date')
            ->selectRaw($yearExpression)
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        // Calculate chartData: Journal growth & Article publication trends
        $universityJournals = Journal::where('university_id', $university->id)
            ->where('is_active', true)
            ->where('approval_status', 'approved')
            ->get(['id', 'first_published_year']);

        $driver = DB::connection()->getDriverName();
        $yearRaw = match ($driver) {
            'sqlite' => "strftime('%Y', publication_date)",
            'pgsql' => 'extract(year from publication_date)',
            default => 'YEAR(publication_date)',
        };

        $journalMinYears = DB::table('articles')
            ->select('journal_id', DB::raw("MIN($yearRaw) as min_year"))
            ->whereIn('journal_id', $universityJournals->pluck('id'))
            ->whereNotNull('publication_date')
            ->groupBy('journal_id')
            ->pluck('min_year', 'journal_id')
            ->toArray();

        $establishedYears = [];
        foreach ($universityJournals as $journal) {
            $minArticleYear = $journalMinYears[$journal->id] ?? null;
            $establishedYear = $journal->first_published_year ?? $minArticleYear;
            if ($establishedYear && (int) $establishedYear > 1900) {
                $establishedYears[] = (int) $establishedYear;
                $journal->established_year = (int) $establishedYear;
            } else {
                $establishedYears[] = (int) date('Y');
                $journal->established_year = (int) date('Y');
            }
        }

        $startYear = !empty($establishedYears) ? min($establishedYears) : (int) date('Y') - 4;
        $endYear = (int) date('Y');
        if ($startYear < 1900) {
            $startYear = 2020;
        }
        $yearsRange = range($startYear, $endYear);

        $articleCountsByYear = DB::table('articles')
            ->select(DB::raw("$yearRaw as year"), DB::raw('count(*) as total'))
            ->whereIn('journal_id', $universityJournals->pluck('id'))
            ->whereNotNull('publication_date')
            ->groupBy('year')
            ->pluck('total', 'year')
            ->toArray();

        $chartData = [
            'years' => [],
            'journals' => [],
            'articles' => [],
        ];

        foreach ($yearsRange as $year) {
            $cumulativeJournals = 0;
            foreach ($universityJournals as $journal) {
                if ($journal->established_year <= $year) {
                    $cumulativeJournals++;
                }
            }

            $chartData['years'][] = (int) $year;
            $chartData['journals'][] = $cumulativeJournals;
            $chartData['articles'][] = (int) ($articleCountsByYear[$year] ?? 0);
        }

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
            'chartData' => $chartData,
        ]);
    }
}
