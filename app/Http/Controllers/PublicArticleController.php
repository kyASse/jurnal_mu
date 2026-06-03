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
                // Eagerly fetch scout keys
                $articleIds = Article::search($search)->keys();
                $baseQuery = Article::where(function ($query) use ($search, $articleIds) {
                    $query->whereIn('id', $articleIds)
                        ->orWhereHas('journal', function ($q) use ($search) {
                            $q->where('title', 'like', "%{$search}%")
                                ->orWhere('publisher', 'like', "%{$search}%")
                                ->orWhereHas('scientificField', function ($sf) use ($search) {
                                    $sf->where('name', 'like', "%{$search}%");
                                });
                        });
                });
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
        if (! empty($selectedSubjects)) {
            $baseQuery->whereHas('journal', function ($query) use ($selectedSubjects) {
                $query->whereIn('scientific_field_id', $selectedSubjects);
            });
        }
        if (! empty($selectedJournals)) {
            $baseQuery->whereIn('journal_id', $selectedJournals);
        }
        if (! empty($selectedYears)) {
            $baseQuery->where(function ($query) use ($selectedYears) {
                foreach ($selectedYears as $year) {
                    $query->orWhereBetween('publication_date', ["{$year}-01-01", "{$year}-12-31"]);
                }
            });
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
