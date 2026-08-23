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
        $selectedSubjects = array_filter(array_map('intval', (array) $request->input('subjects', [])));
        $selectedJournals = array_filter(array_map('intval', (array) $request->input('journals', [])));
        $selectedYears = array_filter(array_map('intval', (array) $request->input('years', [])));

        // Base query matching text search
        if ($search) {
            $keywords = array_filter(explode(' ', $search));
            if ($field === 'all') {
                $baseQuery = Article::where(function ($query) use ($keywords) {
                    foreach ($keywords as $word) {
                        $query->where(function ($q) use ($word) {
                            $q->where('title', 'like', "%{$word}%")
                                ->orWhere('abstract', 'like', "%{$word}%")
                                ->orWhere('authors', 'like', "%{$word}%")
                                ->orWhere('keywords', 'like', "%{$word}%")
                                ->orWhereHas('journal', function ($j) use ($word) {
                                    $j->where('title', 'like', "%{$word}%")
                                        ->orWhere('publisher', 'like', "%{$word}%")
                                        ->orWhereHas('scientificField', function ($sf) use ($word) {
                                            $sf->where('name', 'like', "%{$word}%");
                                        });
                                });
                        });
                    }
                });
            } else {
                $baseQuery = Article::query();
                if ($field === 'title') {
                    $baseQuery->where(function ($query) use ($keywords) {
                        foreach ($keywords as $word) {
                            $query->where('title', 'like', "%{$word}%");
                        }
                    });
                } elseif ($field === 'abstract') {
                    $baseQuery->where(function ($query) use ($keywords) {
                        foreach ($keywords as $word) {
                            $query->where('abstract', 'like', "%{$word}%");
                        }
                    });
                } elseif ($field === 'author') {
                    $baseQuery->where(function ($query) use ($keywords) {
                        foreach ($keywords as $word) {
                            $query->where('authors', 'like', "%{$word}%");
                        }
                    });
                } elseif ($field === 'subject') {
                    $baseQuery->whereHas('journal.scientificField', function ($query) use ($keywords) {
                        foreach ($keywords as $word) {
                            $query->where('name', 'like', "%{$word}%");
                        }
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
