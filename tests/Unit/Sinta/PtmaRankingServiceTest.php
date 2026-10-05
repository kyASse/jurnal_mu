<?php

namespace Tests\Unit\Sinta;

use App\Models\University;
use App\Models\UniversitySintaMetric;
use App\Services\Sinta\PtmaRankingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class PtmaRankingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_ranking_sorts_correctly_by_scopus_and_computes_dense_rank(): void
    {
        $u1 = University::factory()->create(['name' => 'Univ A', 'ptm_code' => '001', 'is_active' => true]);
        $u2 = University::factory()->create(['name' => 'Univ B', 'ptm_code' => '002', 'is_active' => true]);

        UniversitySintaMetric::create([
            'university_id' => $u1->id,
            'ptm_code' => '001',
            'scopus_docs' => 100,
            'sinta_score_overall' => 500,
        ]);

        UniversitySintaMetric::create([
            'university_id' => $u2->id,
            'ptm_code' => '002',
            'scopus_docs' => 300,
            'sinta_score_overall' => 400,
        ]);

        $service = new PtmaRankingService;
        $results = $service->getRankings(['sort' => 'scopus', 'dir' => 'desc']);

        $first = $results->first();
        $this->assertEquals($u2->id, $first->university_id);
        $this->assertEquals(1, $first->ranking_position);

        $last = $results->last();
        $this->assertEquals($u1->id, $last->university_id);
        $this->assertEquals(2, $last->ranking_position);
    }

    public function test_ranking_filters_by_search_query_and_accreditation(): void
    {
        $u1 = University::factory()->create([
            'name' => 'Universitas Muhammadiyah Surakarta',
            'short_name' => 'UMS',
            'code' => 'UMS01',
            'ptm_code' => '001',
            'accreditation_status' => 'Unggul',
            'is_active' => true,
        ]);

        $u2 = University::factory()->create([
            'name' => 'Universitas Ahmad Dahlan',
            'short_name' => 'UAD',
            'code' => 'UAD02',
            'ptm_code' => '002',
            'accreditation_status' => 'Baik Sekali',
            'is_active' => true,
        ]);

        UniversitySintaMetric::create([
            'university_id' => $u1->id,
            'ptm_code' => '001',
            'scopus_docs' => 500,
            'sinta_score_overall' => 2000,
        ]);

        UniversitySintaMetric::create([
            'university_id' => $u2->id,
            'ptm_code' => '002',
            'scopus_docs' => 400,
            'sinta_score_overall' => 1800,
        ]);

        $service = new PtmaRankingService;

        // Filter by search query q matching Univ A
        $resultsQ = $service->getRankings(['q' => 'Surakarta']);
        $this->assertCount(1, $resultsQ);
        $this->assertEquals($u1->id, $resultsQ->first()->university_id);

        // Filter by accreditation matching Univ B
        $resultsAcc = $service->getRankings(['accreditation' => 'Baik Sekali']);
        $this->assertCount(1, $resultsAcc);
        $this->assertEquals($u2->id, $resultsAcc->first()->university_id);

        // Filter by non-existent query
        $resultsNone = $service->getRankings(['q' => 'NonExistentUniv']);
        $this->assertCount(0, $resultsNone);
    }

    public function test_summary_stats_aggregates_ptma_totals(): void
    {
        $u1 = University::factory()->create(['name' => 'Univ A', 'ptm_code' => '001', 'is_active' => true]);
        $u2 = University::factory()->create(['name' => 'Univ B', 'ptm_code' => '002', 'is_active' => true]);

        UniversitySintaMetric::create([
            'university_id' => $u1->id,
            'ptm_code' => '001',
            'scopus_docs' => 100,
            'garuda_docs' => 50,
            'ipr_count' => 15,
            'research_count' => 10,
            'authors_count' => 20,
            'sinta_score_overall' => 1000,
        ]);

        UniversitySintaMetric::create([
            'university_id' => $u2->id,
            'ptm_code' => '002',
            'scopus_docs' => 200,
            'garuda_docs' => 70,
            'ipr_count' => 25,
            'research_count' => 30,
            'authors_count' => 40,
            'sinta_score_overall' => 3000,
        ]);

        $service = new PtmaRankingService;
        $stats = $service->getSummaryStats();

        $this->assertEquals(2, $stats['total_ptma_indexed']);
        $this->assertEquals(300, $stats['collective_scopus_docs']);
        $this->assertEquals(120, $stats['collective_garuda_docs']);
        $this->assertEquals(40, $stats['collective_ipr_count']);
        $this->assertEquals(40, $stats['collective_research_count']);
        $this->assertEquals(60, $stats['collective_authors_count']);
        $this->assertNotNull($stats['top_university_overall']);
        $this->assertEquals('Univ B', $stats['top_university_overall']->name);
        $this->assertEquals(3000, $stats['top_university_score']);
    }

    public function test_ranking_uses_deterministic_secondary_tie_breaker_sort(): void
    {
        $u1 = University::factory()->create(['name' => 'Univ 1', 'ptm_code' => '001', 'is_active' => true]);
        $u2 = University::factory()->create(['name' => 'Univ 2', 'ptm_code' => '002', 'is_active' => true]);

        // Both have identical scopus_docs
        UniversitySintaMetric::create([
            'university_id' => $u2->id,
            'ptm_code' => '002',
            'scopus_docs' => 100,
            'sinta_score_overall' => 500,
        ]);

        UniversitySintaMetric::create([
            'university_id' => $u1->id,
            'ptm_code' => '001',
            'scopus_docs' => 100,
            'sinta_score_overall' => 500,
        ]);

        $service = new PtmaRankingService;
        $results = $service->getRankings(['sort' => 'scopus', 'dir' => 'desc']);

        // Tie broken by universities.id ASC: u1 (lower id) comes before u2
        $this->assertEquals($u1->id, $results->first()->university_id);
        $this->assertEquals($u2->id, $results->last()->university_id);
    }

    public function test_summary_stats_are_cached_and_can_be_cleared(): void
    {
        Cache::forget('ptma_macro_stats');

        $u1 = University::factory()->create(['name' => 'Univ A', 'ptm_code' => '001', 'is_active' => true]);
        UniversitySintaMetric::create([
            'university_id' => $u1->id,
            'ptm_code' => '001',
            'scopus_docs' => 100,
            'sinta_score_overall' => 1000,
        ]);

        $service = new PtmaRankingService;
        $stats1 = $service->getSummaryStats();
        $this->assertEquals(1, $stats1['total_ptma_indexed']);
        $this->assertTrue(Cache::has('ptma_macro_stats'));

        // Add another university metric
        $u2 = University::factory()->create(['name' => 'Univ B', 'ptm_code' => '002', 'is_active' => true]);
        UniversitySintaMetric::create([
            'university_id' => $u2->id,
            'ptm_code' => '002',
            'scopus_docs' => 200,
            'sinta_score_overall' => 2000,
        ]);

        // Still cached, so statsCached equals stats1
        $statsCached = $service->getSummaryStats();
        $this->assertEquals(1, $statsCached['total_ptma_indexed']);

        // Clear cache
        PtmaRankingService::clearCache();
        $this->assertFalse(Cache::has('ptma_macro_stats'));

        // Fresh stats fetch
        $statsFresh = $service->getSummaryStats();
        $this->assertEquals(2, $statsFresh['total_ptma_indexed']);
    }
}
