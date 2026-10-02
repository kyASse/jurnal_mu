<?php

namespace App\Jobs;

use App\Models\University;
use App\Models\UniversitySintaMetric;
use App\Services\Sinta\SintaApiClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class SyncUniversitySintaMetricJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public University $university
    ) {}

    /**
     * Execute the job.
     */
    public function handle(SintaApiClient $client): void
    {
        $ptmCode = $this->university->ptm_code;

        if (empty($ptmCode)) {
            Log::warning("Skipping SINTA sync: University ID {$this->university->id} ({$this->university->name}) has no ptm_code.");
            return;
        }

        try {
            $data = $client->getAffiliationMetric($ptmCode);

            UniversitySintaMetric::updateOrCreate(
                ['university_id' => $this->university->id],
                array_merge($data, [
                    'ptm_code' => $ptmCode,
                    'sync_status' => 'success',
                    'sync_error' => null,
                    'last_synced_at' => now(),
                ])
            );
        } catch (Throwable $e) {
            Log::error("Failed to sync SINTA metric for University ID {$this->university->id} (ptm_code: {$ptmCode}): {$e->getMessage()}");

            UniversitySintaMetric::updateOrCreate(
                ['university_id' => $this->university->id],
                [
                    'ptm_code' => $ptmCode,
                    'sync_status' => 'failed',
                    'sync_error' => $e->getMessage(),
                    'last_synced_at' => now(),
                ]
            );
        }
    }
}
