<?php

namespace App\Services\Sinta;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SintaApiClient
{
    protected string $baseUrl;

    protected string $env;

    protected string $username;

    protected string $password;

    protected string $uniq;

    protected bool $mockMode;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('sinta.base_url', 'http://apisinta.kemdikbud.go.id'), '/');
        $this->env = (string) config('sinta.env', 'dev');
        $this->username = (string) config('sinta.username', '');
        $this->password = (string) config('sinta.password', '');
        $this->uniq = (string) config('sinta.uniq', '');
        $this->mockMode = (bool) config('sinta.mock_mode', true);
    }

    public function getToken(): string
    {
        if ($this->mockMode) {
            return 'mock-token-sinta-dev';
        }

        return Cache::remember('sinta_bearer_token', 43200, function () { // 12 hours TTL
            $response = Http::timeout(15)->post("{$this->baseUrl}/consumer/login", [
                'username' => $this->username,
                'password' => $this->password,
            ]);

            if (!$response->successful()) {
                Log::error('SINTA Login Failed', ['body' => $response->body()]);
                throw new Exception('Gagal melakukan autentikasi ke API SINTA: '.$response->status());
            }

            $token = $response->json('token');
            if (empty($token) || !is_string($token)) {
                Log::error('SINTA Login returned empty token payload', ['body' => $response->body()]);
                throw new Exception('API SINTA berhasil dihubungi namun tidak mengembalikan token yang valid.');
            }

            return $token;
        });
    }

    public function getAffiliationMetric(string $ptmCode): array
    {
        if ($this->mockMode) {
            return $this->generateMockMetric($ptmCode);
        }

        $token = $this->getToken();
        $url = "{$this->baseUrl}/v3/{$this->env}/{$this->uniq}/affiliation/metric/kodept/{$ptmCode}";

        $response = Http::withToken($token)
            ->timeout(20)
            ->post($url);

        if (!$response->successful()) {
            Log::error("SINTA Metric Fetch Failed for {$ptmCode}", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new Exception("SINTA API error ({$response->status()}): {$response->body()}");
        }

        $payload = (array) $response->json();

        return $this->normalizeMetricPayload($ptmCode, $payload);
    }

    public function normalizeMetricPayload(string $ptmCode, array $data): array
    {
        return [
            'ptm_code' => $ptmCode,
            'sinta_id' => $data['sinta_id'] ?? null,
            'sinta_score_overall' => (float) ($data['sinta_score_v3_overall'] ?? $data['sinta_score_overall'] ?? 0),
            'sinta_score_3yr' => (float) ($data['sinta_score_v3_3yr'] ?? $data['sinta_score_3yr'] ?? 0),
            'national_rank_overall' => isset($data['national_rank_overall']) ? (int) $data['national_rank_overall'] : null,
            'national_rank_3yr' => isset($data['national_rank_3yr']) ? (int) $data['national_rank_3yr'] : null,
            'scopus_docs' => (int) ($data['scopus'] ?? $data['scopus_docs'] ?? 0),
            'scopus_citations' => (int) ($data['scopus_citations'] ?? 0),
            'wos_docs' => (int) ($data['wos'] ?? $data['wos_docs'] ?? 0),
            'wos_citations' => (int) ($data['wos_citations'] ?? 0),
            'garuda_docs' => (int) ($data['garuda'] ?? $data['garuda_docs'] ?? 0),
            'garuda_citations' => (int) ($data['garuda_citations'] ?? 0),
            'google_docs' => (int) ($data['google'] ?? $data['google_docs'] ?? 0),
            'google_citations' => (int) ($data['google_citations'] ?? 0),
            'research_count' => (int) ($data['research'] ?? $data['research_count'] ?? 0),
            'service_count' => (int) ($data['service'] ?? $data['service_count'] ?? 0),
            'ipr_count' => (int) ($data['ipr'] ?? $data['ipr_count'] ?? 0),
            'book_count' => (int) ($data['book'] ?? $data['book_count'] ?? 0),
            'authors_count' => (int) ($data['authors'] ?? $data['authors_count'] ?? 0),
            'departments_count' => (int) ($data['departments'] ?? $data['departments_count'] ?? 0),
            'journals_count' => (int) ($data['journals'] ?? $data['journals_count'] ?? 0),
            'raw_payload' => $data,
        ];
    }

    public function generateMockMetric(string $ptmCode): array
    {
        $seed = crc32($ptmCode);
        mt_srand($seed);

        $scopus = mt_rand(50, 1800);
        $garuda = mt_rand(200, 4500);
        $wos = mt_rand(20, 600);
        $google = mt_rand(500, 12000);
        $research = mt_rand(30, 450);
        $service = mt_rand(20, 300);
        $ipr = mt_rand(10, 250);
        $book = mt_rand(15, 350);

        $scoreOverall = ($scopus * 40) + ($garuda * 15) + ($wos * 35) + ($research * 25) + ($ipr * 30);
        $score3Yr = $scoreOverall * 0.42;

        return [
            'ptm_code' => $ptmCode,
            'sinta_id' => 'SINTA-'.substr((string) abs($seed), 0, 5),
            'sinta_score_overall' => round($scoreOverall, 2),
            'sinta_score_3yr' => round($score3Yr, 2),
            'national_rank_overall' => mt_rand(1, 450),
            'national_rank_3yr' => mt_rand(1, 450),
            'scopus_docs' => $scopus,
            'scopus_citations' => $scopus * mt_rand(3, 8),
            'wos_docs' => $wos,
            'wos_citations' => $wos * mt_rand(2, 6),
            'garuda_docs' => $garuda,
            'garuda_citations' => $garuda * mt_rand(1, 4),
            'google_docs' => $google,
            'google_citations' => $google * mt_rand(4, 12),
            'research_count' => $research,
            'service_count' => $service,
            'ipr_count' => $ipr,
            'book_count' => $book,
            'authors_count' => mt_rand(40, 850),
            'departments_count' => mt_rand(12, 65),
            'journals_count' => mt_rand(3, 35),
            'raw_payload' => ['mock' => true, 'generated_for' => $ptmCode],
        ];
    }
}
