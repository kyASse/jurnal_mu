<?php

namespace Tests\Feature\Sinta;

use App\Jobs\SyncUniversitySintaMetricJob;
use App\Models\University;
use App\Models\UniversitySintaMetric;
use App\Services\Sinta\SintaApiClient;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class SyncSintaPtmaCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_syncs_active_ptma_universities_with_mock(): void
    {
        config(['sinta.mock_mode' => true]);

        $activeUni = University::factory()->create([
            'name' => 'Universitas Muhammadiyah Yogyakarta',
            'ptm_code' => '051010',
            'is_active' => true,
        ]);

        $inactiveUni = University::factory()->create([
            'name' => 'Universitas Non Aktif',
            'ptm_code' => '051099',
            'is_active' => false,
        ]);

        $noPtmCodeUni = University::factory()->create([
            'name' => 'Universitas Tanpa Kode',
            'ptm_code' => null,
            'is_active' => true,
        ]);

        $this->artisan('sinta:sync-ptma --mock')
            ->expectsOutputToContain('SINTA synchronization completed')
            ->assertExitCode(0);

        $this->assertDatabaseHas('university_sinta_metrics', [
            'university_id' => $activeUni->id,
            'ptm_code' => '051010',
            'sync_status' => 'success',
        ]);

        $this->assertDatabaseMissing('university_sinta_metrics', [
            'university_id' => $inactiveUni->id,
        ]);

        $this->assertDatabaseMissing('university_sinta_metrics', [
            'university_id' => $noPtmCodeUni->id,
        ]);
    }

    public function test_command_syncs_single_university_by_id(): void
    {
        config(['sinta.mock_mode' => true]);

        $uni1 = University::factory()->create([
            'name' => 'Universitas Ahmad Dahlan',
            'ptm_code' => '051011',
            'is_active' => true,
        ]);

        $uni2 = University::factory()->create([
            'name' => 'Universitas Muhammadiyah Surakarta',
            'ptm_code' => '051012',
            'is_active' => true,
        ]);

        $this->artisan("sinta:sync-ptma --university_id={$uni1->id} --mock")
            ->expectsOutputToContain('SINTA synchronization completed')
            ->assertExitCode(0);

        $this->assertDatabaseHas('university_sinta_metrics', [
            'university_id' => $uni1->id,
            'ptm_code' => '051011',
            'sync_status' => 'success',
        ]);

        $this->assertDatabaseMissing('university_sinta_metrics', [
            'university_id' => $uni2->id,
        ]);
    }

    public function test_job_skips_when_ptm_code_is_null(): void
    {
        $uni = University::factory()->create([
            'ptm_code' => null,
            'is_active' => true,
        ]);

        $client = new SintaApiClient();
        $job = new SyncUniversitySintaMetricJob($uni);
        $job->handle($client);

        $this->assertDatabaseMissing('university_sinta_metrics', [
            'university_id' => $uni->id,
        ]);
    }

    public function test_job_handles_api_exception_gracefully(): void
    {
        $uni = University::factory()->create([
            'ptm_code' => '051010',
            'is_active' => true,
        ]);

        $mockClient = Mockery::mock(SintaApiClient::class);
        $mockClient->shouldReceive('getAffiliationMetric')
            ->with('051010')
            ->andThrow(new Exception('Network connection timed out'));

        $job = new SyncUniversitySintaMetricJob($uni);
        $job->handle($mockClient);

        $this->assertDatabaseHas('university_sinta_metrics', [
            'university_id' => $uni->id,
            'ptm_code' => '051010',
            'sync_status' => 'failed',
            'sync_error' => 'Network connection timed out',
        ]);
    }
}
