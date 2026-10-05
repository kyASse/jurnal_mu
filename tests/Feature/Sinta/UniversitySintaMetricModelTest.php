<?php

namespace Tests\Feature\Sinta;

use App\Models\University;
use App\Models\UniversitySintaMetric;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UniversitySintaMetricModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_university_has_one_sinta_metric_relationship(): void
    {
        $university = University::factory()->create([
            'code' => 'UMY',
            'ptm_code' => '051010',
            'name' => 'Universitas Muhammadiyah Yogyakarta',
        ]);

        $metric = UniversitySintaMetric::create([
            'university_id' => $university->id,
            'sinta_id' => '417',
            'ptm_code' => '051010',
            'sinta_score_overall' => 245000.50,
            'sinta_score_3yr' => 89000.25,
            'national_rank_overall' => 15,
            'national_rank_3yr' => 12,
            'scopus_docs' => 1250,
            'scopus_citations' => 5400,
            'wos_docs' => 450,
            'wos_citations' => 1200,
            'garuda_docs' => 3400,
            'garuda_citations' => 8900,
            'google_docs' => 7800,
            'google_citations' => 15600,
            'research_count' => 520,
            'service_count' => 310,
            'ipr_count' => 140,
            'book_count' => 85,
            'authors_count' => 420,
            'departments_count' => 35,
            'journals_count' => 22,
            'raw_payload' => ['sample' => 'data', 'verified' => true],
            'sync_status' => 'success',
            'last_synced_at' => Carbon::now(),
        ]);

        $this->assertInstanceOf(UniversitySintaMetric::class, $university->sintaMetric);
        $this->assertEquals('245000.50', $university->sintaMetric->sinta_score_overall);
        $this->assertEquals('89000.25', $university->sintaMetric->sinta_score_3yr);
        $this->assertEquals(1250, $university->sintaMetric->scopus_docs);
        $this->assertEquals(3400, $university->sintaMetric->garuda_docs);
        $this->assertEquals(520, $university->sintaMetric->research_count);
        $this->assertIsArray($university->sintaMetric->raw_payload);
        $this->assertEquals('data', $university->sintaMetric->raw_payload['sample']);
        $this->assertInstanceOf(\DateTimeInterface::class, $university->sintaMetric->last_synced_at);

        $this->assertInstanceOf(University::class, $metric->university);
        $this->assertEquals($university->id, $metric->university->id);
    }

    public function test_university_sinta_metric_factory_creates_record(): void
    {
        $metric = UniversitySintaMetric::factory()->create();

        $this->assertNotNull($metric->id);
        $this->assertNotNull($metric->university_id);
        $this->assertNotNull($metric->ptm_code);
        $this->assertGreaterThan(0, $metric->sinta_score_overall);
        $this->assertEquals('success', $metric->sync_status);
        $this->assertInstanceOf(University::class, $metric->university);
    }
}
