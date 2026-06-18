<?php

namespace App\Services;

use App\Models\Agenda;
use App\Models\Article;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use Illuminate\Support\Facades\Cache;

class PublicHomeService
{
    /**
     * Get featured journals with random ordering, cached for performance.
     */
    public function getFeaturedJournals()
    {
        return Cache::remember('featured_journals_welcome', now()->addDay(), function () {
            return Journal::with(['university', 'scientificField'])
                ->where('is_active', true)
                ->whereNotNull('sinta_rank')
                ->whereIn('sinta_rank', ['sinta_1', 'sinta_2'])
                ->inRandomOrder()
                ->limit(4)
                ->get()
                ->map(fn ($journal) => [
                    'id' => $journal->id,
                    'title' => $journal->title,
                    'sinta_rank' => $journal->sinta_rank,
                    'sinta_rank_label' => $journal->sinta_rank_label,
                    'issn' => $journal->issn,
                    'e_issn' => $journal->e_issn,
                    'university' => $journal->university->name ?? 'Unknown',
                    'cover_image_url' => $journal->cover_image_url,
                    'indexation_labels' => $journal->indexation_labels,
                ]);
        });
    }

    /**
     * Force refresh the featured journals cache
     */
    public function refreshFeaturedJournalsCache(): void
    {
        Cache::forget('featured_journals_welcome');
        // Re-warm the cache immediately
        $this->getFeaturedJournals();
    }

    /**
     * Get SINTA statistics (cached)
     */
    public function getSintaStats()
    {
        return Cache::remember('home_sinta_stats', now()->addHours(6), function () {
            $stats = [];
            for ($rank = 1; $rank <= 6; $rank++) {
                $key = 'sinta_'.$rank;
                $stats[$key] = Journal::where('is_active', true)
                    ->where('sinta_rank', $key)
                    ->count();
            }

            // Non-SINTA (Unaccredited but Indexed)
            $stats['non_sinta'] = Journal::where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('sinta_rank')
                        ->orWhere('sinta_rank', '');
                })
                ->whereNotNull('indexations')
                ->where('indexations', '!=', '[]')
                ->where('indexations', '!=', '')
                ->count();

            return $stats;
        });
    }

    /**
     * Get overall university, journal, and article counts (cached)
     */
    public function getOverallStats()
    {
        return Cache::remember('home_overall_stats', now()->addHours(6), function () {
            return [
                'totalUniversities' => University::where('is_active', true)
                    ->whereHas('journals', function ($query) {
                        $query->where('is_active', true);
                    })->count(),
                'totalJournals' => Journal::where('is_active', true)->count(),
                'totalArticles' => Article::count(),
            ];
        });
    }

    /**
     * Get indexation statistics (cached)
     */
    public function getIndexationStats()
    {
        return Cache::remember('home_indexation_stats', now()->addHours(6), function () {
            $platforms = ['Scopus', 'Web of Science', 'DOAJ', 'Dimensions', 'EBSCO', 'ProQuest'];
            $stats = [];

            foreach ($platforms as $platform) {
                $stats[strtolower(str_replace(' ', '_', $platform))] = Journal::where('is_active', true)
                    ->whereNotNull("indexations->{$platform}")
                    ->count();
            }

            return $stats;
        });
    }

    /**
     * Get top scientific fields by journal count (cached)
     */
    public function getTopScientificFields()
    {
        return Cache::remember('home_top_scientific_fields', now()->addHours(6), function () {
            return ScientificField::withCount(['journals' => function ($query) {
                $query->where('is_active', true);
            }])
                ->having('journals_count', '>', 0)
                ->orderByDesc('journals_count')
                ->take(12)
                ->get(['id', 'name']);
        });
    }

    /**
     * Get upcoming active events/agendas for the homepage (cached)
     */
    public function getUpcomingEvents()
    {
        return Cache::remember('home_upcoming_events', now()->addHours(2), function () {
            return Agenda::with('university:id,name,logo_url')
                ->active()
                ->where('date_start', '>=', now()->toDateString())
                ->orderBy('date_start', 'asc')
                ->limit(4)
                ->get()
                ->map(fn ($agenda) => [
                    'id' => $agenda->id,
                    'title' => $agenda->title,
                    'slug' => $agenda->slug,
                    'type' => $agenda->type,
                    'thumbnail_url' => $agenda->thumbnail_url,
                    'date_start' => $agenda->date_start?->format('Y-m-d'),
                    'time_start' => $agenda->time_start?->format('H:i'),
                    'location_type' => $agenda->location_type,
                    'is_featured' => $agenda->is_featured,
                    'university' => $agenda->university ? [
                        'name' => $agenda->university->name,
                        'logo_url' => $agenda->university->logo_url,
                    ] : null,
                ]);
        });
    }

    /**
     * Convert title to Title Case only if it is in ALL CAPS.
     */
    private function toTitleCaseIfAllUpper(string $title): string
    {
        $title = trim($title);
        $lettersOnly = preg_replace('/[^\p{L}]/u', '', $title);
        if (empty($lettersOnly)) {
            return $title;
        }

        // If the letters are all uppercase and the script supports casing
        if (mb_strtoupper($lettersOnly, 'UTF-8') === $lettersOnly && mb_strtoupper($lettersOnly, 'UTF-8') !== mb_strtolower($lettersOnly, 'UTF-8')) {
            $minorWords = ['and', 'or', 'in', 'of', 'to', 'the', 'a', 'an', 'dan', 'di', 'ke', 'dari', 'pada', 'untuk', 'dengan', 'yang', 'atau', 'serta', 'terhadap', 'dalam', 'oleh', 'bagi', 'by', 'with', 'from', 'at', 'but', 'for'];

            $words = preg_split('/\s+/', mb_strtolower($title, 'UTF-8'));
            $formattedWords = [];
            $wordCount = count($words);
            foreach ($words as $index => $word) {
                $cleanedWord = trim($word, '.,:;()[]{}""\'\'');
                $isLastWord = ($index === $wordCount - 1);

                if ($index > 0 && $isLastWord === false && in_array($cleanedWord, $minorWords)) {
                    $formattedWords[] = $word;
                } else {
                    $formattedWords[] = preg_replace_callback(
                        '/^([^\p{L}]*)(\p{L})/u',
                        fn ($m) => $m[1].mb_strtoupper($m[2], 'UTF-8'),
                        $word
                    );
                }
            }

            // Post-process common acronyms
            $acronyms = ['Doi', 'Pdf', 'Url', 'Sinta', 'Oai-pmh', 'Oai', 'Pmh', 'Ris', 'Issn', 'E-issn'];
            $acronymReplacements = ['DOI', 'PDF', 'URL', 'SINTA', 'OAI-PMH', 'OAI', 'PMH', 'RIS', 'ISSN', 'E-ISSN'];

            $formattedTitle = implode(' ', $formattedWords);
            $formattedTitle = preg_replace_callback(
                '/:\s*([^\p{L}]*)(\p{L})/u',
                fn ($m) => ': '.$m[1].mb_strtoupper($m[2], 'UTF-8'),
                $formattedTitle
            );

            foreach ($acronyms as $idx => $acronym) {
                $formattedTitle = preg_replace('/\b'.preg_quote($acronym, '/').'\b/u', $acronymReplacements[$idx], $formattedTitle);
            }

            return $formattedTitle;
        }

        return $title;
    }

    /**
     * Get 6 featured articles in random order.
     */
    public function getFeaturedArticles()
    {
        return Cache::remember('home_featured_articles', now()->addHours(2), function () {
            return Article::whereHas('journal', function ($query) {
                $query->where('is_active', true)
                    ->where('approval_status', 'approved');
            })
                ->with(['journal:id,title'])
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
                    'journal' => $article->journal ? [
                        'id' => $article->journal->id,
                        'title' => $article->journal->title,
                    ] : null,
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
}
