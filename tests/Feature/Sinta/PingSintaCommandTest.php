<?php

namespace Tests\Feature\Sinta;

use App\Services\Sinta\SintaApiClient;
use Exception;
use Mockery;
use Tests\TestCase;

class PingSintaCommandTest extends TestCase
{
    public function test_ping_command_succeeds_in_mock_mode(): void
    {
        config(['sinta.mock_mode' => true]);

        $this->artisan('sinta:ping --mock')
            ->expectsOutputToContain('SINTA API Configuration Health-Check')
            ->expectsOutputToContain('Connection & Authentication SUCCESS')
            ->expectsOutputToContain('SINTA API Subsystem is Healthy and Ready')
            ->assertExitCode(0);
    }

    public function test_ping_command_fetches_sample_metric_read_only(): void
    {
        config(['sinta.mock_mode' => true]);

        $this->artisan('sinta:ping --mock --kodept=051010')
            ->expectsOutputToContain('Testing Sample Metric Fetch for Kode PT: 051010')
            ->expectsOutputToContain('Metric Fetch SUCCESS')
            ->expectsOutputToContain('No changes written to database')
            ->assertExitCode(0);
    }

    public function test_ping_command_handles_auth_failure_gracefully(): void
    {
        config(['sinta.mock_mode' => false]);

        $mockClient = Mockery::mock(SintaApiClient::class);
        $mockClient->shouldReceive('getToken')
            ->once()
            ->andThrow(new Exception('Unauthorized credentials'));

        $this->app->instance(SintaApiClient::class, $mockClient);

        $this->artisan('sinta:ping')
            ->expectsOutputToContain('Authentication FAILED')
            ->expectsOutputToContain('Troubleshooting Tips')
            ->assertExitCode(1);
    }

    public function test_ping_command_handles_metric_fetch_failure_gracefully(): void
    {
        config(['sinta.mock_mode' => false]);

        $mockClient = Mockery::mock(SintaApiClient::class);
        $mockClient->shouldReceive('getToken')
            ->once()
            ->andReturn('valid-bearer-token');

        $mockClient->shouldReceive('getAffiliationMetric')
            ->with('999999')
            ->once()
            ->andThrow(new Exception('PT Code not found'));

        $this->app->instance(SintaApiClient::class, $mockClient);

        $this->artisan('sinta:ping --kodept=999999')
            ->expectsOutputToContain('Connection & Authentication SUCCESS')
            ->expectsOutputToContain('Metric Fetch FAILED')
            ->assertExitCode(1);
    }
}
