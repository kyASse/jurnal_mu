<?php

namespace Tests\Unit\Sinta;

use App\Services\Sinta\SintaApiClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SintaApiClientTest extends TestCase
{
    public function test_mock_mode_returns_fixture_without_network_request(): void
    {
        config(['sinta.mock_mode' => true]);
        Http::preventStrayRequests();

        $client = new SintaApiClient;
        $result = $client->getAffiliationMetric('051010');

        $this->assertIsArray($result);
        $this->assertArrayHasKey('sinta_score_overall', $result);
        $this->assertArrayHasKey('scopus_docs', $result);
        $this->assertEquals('051010', $result['ptm_code']);
    }

    public function test_client_caches_bearer_token(): void
    {
        config([
            'sinta.mock_mode' => false,
            'sinta.base_url' => 'http://apisinta.kemdikbud.go.id',
            'sinta.username' => 'testuser',
            'sinta.password' => 'secret123',
            'sinta.uniq' => 'abc-uniq-123',
            'sinta.env' => 'dev',
        ]);

        Cache::forget('sinta_bearer_token');

        Http::fake([
            'http://apisinta.kemdikbud.go.id/consumer/login' => Http::response(['token' => 'dummy-jwt-token-12345'], 200),
            'http://apisinta.kemdikbud.go.id/v3/dev/abc-uniq-123/affiliation/metric/kodept/051010' => Http::response([
                'sinta_score_v3_overall' => 125000,
                'sinta_score_v3_3yr' => 45000,
                'scopus' => 800,
                'garuda' => 2000,
            ], 200),
        ]);

        $client = new SintaApiClient;
        $token = $client->getToken();

        $this->assertEquals('dummy-jwt-token-12345', $token);
        $this->assertTrue(Cache::has('sinta_bearer_token'));

        $data = $client->getAffiliationMetric('051010');
        $this->assertEquals(125000, $data['sinta_score_overall']);
    }

    public function test_client_throws_exception_on_empty_token_response(): void
    {
        config([
            'sinta.mock_mode' => false,
            'sinta.base_url' => 'http://apisinta.kemdikbud.go.id',
            'sinta.username' => 'testuser',
            'sinta.password' => 'secret123',
        ]);

        Cache::forget('sinta_bearer_token');

        Http::fake([
            'http://apisinta.kemdikbud.go.id/consumer/login' => Http::response(['token' => ''], 200),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('API SINTA berhasil dihubungi namun tidak mengembalikan token yang valid.');

        $client = new SintaApiClient;
        $client->getToken();
    }
}
