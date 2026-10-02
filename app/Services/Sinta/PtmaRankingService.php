<?php

namespace App\Services\Sinta;

use App\Models\University;
use App\Models\UniversitySintaMetric;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PtmaRankingService
{
    /**
     * Mapping of sort parameter keys to database column names.
     */
    protected array $sortMapping = [
        'sinta_overall' => 'sinta_score_overall',
        'sinta_3yr' => 'sinta_score_3yr',
        'scopus' => 'scopus_docs',
        'wos' => 'wos_docs',
        'garuda' => 'garuda_docs',
        'google' => 'google_docs',
        'research' => 'research_count',
        'service' => 'service_count',
        'ipr' => 'ipr_count',
        'book' => 'book_count',
        'authors' => 'authors_count',
    ];

    /**
     * Get paginated PTMA university rankings with dense rank calculation and filters.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getRankings(array $filters = [], int $perPage = 25): LengthAwarePaginator
    {
        $sortKey = $filters['sort'] ?? 'sinta_overall';
        $column = $this->sortMapping[$sortKey] ?? ($this->sortMapping['sinta_overall']);
        if (!in_array($column, array_values($this->sortMapping), true)) {
            $column = 'sinta_score_overall';
        }

        $direction = strtolower($filters['dir'] ?? $filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $query = UniversitySintaMetric::query()
            ->select('university_sinta_metrics.*')
            ->selectRaw("DENSE_RANK() OVER (ORDER BY {$column} {$direction}) as ranking_position")
            ->join('universities', 'universities.id', '=', 'university_sinta_metrics.university_id')
            ->where('universities.is_active', true)
            ->whereNull('universities.deleted_at')
            ->with(['university:id,name,short_name,code,ptm_code,logo_url,accreditation_status,city,province']);

        $search = $filters['q'] ?? $filters['search'] ?? null;
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('universities.name', 'like', "%{$search}%")
                    ->orWhere('universities.short_name', 'like', "%{$search}%")
                    ->orWhere('universities.code', 'like', "%{$search}%");
            });
        }

        $accreditation = $filters['accreditation'] ?? $filters['accreditation_status'] ?? null;
        if (!empty($accreditation)) {
            $query->where('universities.accreditation_status', $accreditation);
        }

        return $query->orderBy($column, $direction)->paginate($perPage);
    }

    /**
     * Get aggregated macro totals and top ranked university overall.
     *
     * @return array
     */
    public function getSummaryStats(): array
    {
        $totals = UniversitySintaMetric::query()
            ->join('universities', 'universities.id', '=', 'university_sinta_metrics.university_id')
            ->where('universities.is_active', true)
            ->whereNull('universities.deleted_at')
            ->selectRaw('
                COUNT(university_sinta_metrics.id) as total_ptma_indexed,
                COALESCE(SUM(scopus_docs), 0) as collective_scopus_docs,
                COALESCE(SUM(garuda_docs), 0) as collective_garuda_docs,
                COALESCE(SUM(ipr_count), 0) as collective_ipr_count,
                COALESCE(SUM(research_count), 0) as collective_research_count,
                COALESCE(SUM(authors_count), 0) as collective_authors_count
            ')
            ->first();

        $topUnivMetric = UniversitySintaMetric::query()
            ->select('university_sinta_metrics.*')
            ->join('universities', 'universities.id', '=', 'university_sinta_metrics.university_id')
            ->where('universities.is_active', true)
            ->whereNull('universities.deleted_at')
            ->orderByDesc('university_sinta_metrics.sinta_score_overall')
            ->with('university')
            ->first();

        return [
            'total_ptma_indexed' => (int) ($totals->total_ptma_indexed ?? 0),
            'collective_scopus_docs' => (int) ($totals->collective_scopus_docs ?? 0),
            'collective_garuda_docs' => (int) ($totals->collective_garuda_docs ?? 0),
            'collective_ipr_count' => (int) ($totals->collective_ipr_count ?? 0),
            'collective_research_count' => (int) ($totals->collective_research_count ?? 0),
            'collective_authors_count' => (int) ($totals->collective_authors_count ?? 0),
            'top_university_overall' => $topUnivMetric?->university,
            'top_university_score' => $topUnivMetric?->sinta_score_overall ?? 0,
        ];
    }
}
