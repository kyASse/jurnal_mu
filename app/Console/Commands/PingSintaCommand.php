<?php

namespace App\Console\Commands;

use App\Services\Sinta\SintaApiClient;
use Illuminate\Console\Command;
use Throwable;

class PingSintaCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sinta:ping 
                            {--kodept= : Sample PT code to test metric fetch read-only} 
                            {--mock : Force mock mode}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Health-check and test connectivity/authentication with SINTA API v3.0';

    /**
     * Execute the console command.
     */
    public function handle(SintaApiClient $client): int
    {
        if ($this->option('mock')) {
            config(['sinta.mock_mode' => true]);
            $client = new SintaApiClient;
        }

        $baseUrl = config('sinta.base_url', 'http://apisinta.kemdikbud.go.id');
        $env = config('sinta.env', 'dev');
        $username = (string) config('sinta.username', '');
        $hasPassword = !empty(config('sinta.password'));
        $hasUniq = !empty(config('sinta.uniq'));
        $mockMode = (bool) config('sinta.mock_mode', false);

        $this->info('=== SINTA API Configuration Health-Check ===');
        $this->table(
            ['Param', 'Value'],
            [
                ['Base URL', $baseUrl],
                ['Environment', $env],
                ['Username', $username !== '' ? substr($username, 0, 3).'***' : '<empty>'],
                ['Password Configured', $hasPassword ? 'Yes (***)' : '<empty>'],
                ['Uniq ID Configured', $hasUniq ? 'Yes (***)' : '<empty>'],
                ['Mock Mode', $mockMode ? 'Enabled (Simulated)' : 'Disabled (Live API)'],
            ]
        );

        $this->newLine();
        $this->info('Testing Authentication & Connectivity...');

        $startTime = microtime(true);

        try {
            $token = $client->getToken();
            $durationMs = round((microtime(true) - $startTime) * 1000, 2);

            $this->info("✓ Connection & Authentication SUCCESS ({$durationMs} ms)");
            $tokenPreview = strlen($token) > 10 ? substr($token, 0, 8).'...'.substr($token, -4) : '***';
            $this->line("  Bearer Token: {$tokenPreview}");
        } catch (Throwable $e) {
            $durationMs = round((microtime(true) - $startTime) * 1000, 2);
            $this->error("✗ Authentication FAILED ({$durationMs} ms)");
            $this->error("  Error: {$e->getMessage()}");
            $this->newLine();
            $this->warn('Troubleshooting Tips:');
            $this->line('1. Check SINTA_USERNAME and SINTA_PASSWORD in .env.');
            $this->line('2. Verify outgoing HTTP connection from server to apisinta.kemdikbud.go.id.');
            $this->line('3. Check if server IP requires whitelisting by Kemendikbudristek.');

            return Command::FAILURE;
        }

        if ($kodept = $this->option('kodept')) {
            $this->newLine();
            $this->info("Testing Sample Metric Fetch for Kode PT: {$kodept} (Read-Only)...");
            $startTime = microtime(true);

            try {
                $metric = $client->getAffiliationMetric($kodept);
                $durationMs = round((microtime(true) - $startTime) * 1000, 2);

                $this->info("✓ Metric Fetch SUCCESS ({$durationMs} ms)");
                $this->table(
                    ['Metric Key', 'Value'],
                    [
                        ['Kode PT', $metric['ptm_code'] ?? $kodept],
                        ['SINTA Score Overall', number_format($metric['sinta_score_overall'] ?? 0)],
                        ['SINTA Score 3Yr', number_format($metric['sinta_score_3yr'] ?? 0)],
                        ['Scopus Documents', number_format($metric['scopus_documents'] ?? 0)],
                        ['Garuda Documents', number_format($metric['garuda_documents'] ?? 0)],
                        ['Sync Status', $metric['sync_status'] ?? 'success'],
                    ]
                );
                $this->line('  Note: No changes written to database.');
            } catch (Throwable $e) {
                $durationMs = round((microtime(true) - $startTime) * 1000, 2);
                $this->error("✗ Metric Fetch FAILED ({$durationMs} ms)");
                $this->error("  Error: {$e->getMessage()}");

                return Command::FAILURE;
            }
        }

        $this->newLine();
        $this->info('✓ SINTA API Subsystem is Healthy and Ready.');

        return Command::SUCCESS;
    }
}
