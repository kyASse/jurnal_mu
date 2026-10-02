<?php

namespace App\Console\Commands;

use App\Jobs\SyncUniversitySintaMetricJob;
use App\Models\University;
use App\Models\UniversitySintaMetric;
use Illuminate\Console\Command;

class SyncSintaPtmaCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sinta:sync-ptma 
                            {--university_id= : Sync single university by ID} 
                            {--mock : Run with mock data}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync SINTA affiliation metrics for PTMA universities';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if ($this->option('mock')) {
            config(['sinta.mock_mode' => true]);
        }

        if ($universityId = $this->option('university_id')) {
            $universities = University::where('id', $universityId)->get();

            if ($universities->isEmpty()) {
                $this->error("University with ID {$universityId} not found.");
                return Command::FAILURE;
            }
        } else {
            $universities = University::whereNotNull('ptm_code')
                ->where('is_active', true)
                ->get();
        }

        if ($universities->isEmpty()) {
            $this->warn('No active universities with ptm_code found to sync.');
            return Command::SUCCESS;
        }

        $this->info("Starting SINTA sync for {$universities->count()} university(ies)...");
        $bar = $this->output->createProgressBar($universities->count());
        $bar->start();

        $successCount = 0;
        $failCount = 0;

        foreach ($universities as $university) {
            try {
                SyncUniversitySintaMetricJob::dispatchSync($university);

                $metric = UniversitySintaMetric::where('university_id', $university->id)->first();
                if ($metric && $metric->sync_status === 'success') {
                    $successCount++;
                } else {
                    $failCount++;
                }
            } catch (\Throwable $e) {
                $failCount++;
                $this->error("Error syncing university {$university->id}: {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        $this->info("SINTA synchronization completed successfully. Synced: {$successCount}, Failed: {$failCount}.");

        return Command::SUCCESS;
    }
}
