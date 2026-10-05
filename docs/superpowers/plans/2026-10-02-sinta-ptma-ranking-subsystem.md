# SINTA PTMA Interactive Multi-Variable Ranking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun subsistem integrasi data API SINTA v3.0 dan papan peringkat (leaderboard) interaktif multi-variabel untuk seluruh kampus PTMA di platform JurnalMu.

**Architecture:** Arsitektur terisolasi 4-layer: (1) Migration & Model `university_sinta_metrics`, (2) Service `SintaApiClient` dengan token caching & mock driver untuk dev terisolasi tanpa network call ke base URL resmi SINTA, (3) Background Queue Job `SyncUniversitySintaMetricJob` dan Artisan Command untuk sync rate-safe (<500 req/hari), (4) `PtmaRankingService` untuk dynamic dense-ranking dan summary stats, serta (5) High-End Inertia React UI (Asymmetrical Hero Bento, Variable Segmented Nav, Double-Bezel Row, Slide-Over Sheet Drawer).

**Tech Stack:** Laravel 11/12, PHP 8.2+, Inertia.js 2.0, React 19, TypeScript, Tailwind CSS, shadcn/ui, Motion (`motion/react`), Pest/PHPUnit, Vitest.

**Spec:** [`docs/superpowers/specs/2026-10-02-sinta-ptma-ranking-subsystem-design.md`](file:///c:/xampp/htdocs/jurnal_mu/docs/superpowers/specs/2026-10-02-sinta-ptma-ranking-subsystem-design.md)

## Global Constraints
- Artisan commands MUST run inside Docker container: `docker exec -it jurnal-mu-app php artisan ...`
- BANNED: Membuat direct HTTP request ke `http://apisinta.kemdikbud.go.id` saat development & unit test. Selalu gunakan `SINTA_MOCK_MODE=true` atau Mock HTTP fixture.
- BANNED Fonts in Frontend: Inter, Roboto, Arial default. Gunakan `Geist` + `Geist Mono` tabular nums.
- BANNED Colors: AI purple gradient slop. Gunakan Slate/Zinc neutral + single accent Deep Emerald Muhammadiyah (`#059669`).
- Card Architecture: Gunakan arsitektur Double-Bezel (Doppelrand) untuk card utama dan baris tabel peringkat.
- Responsive Rule: Semua layout di `< 768px` wajib collapse ke single column dengan `w-full px-4`.

---

### Task 1: Database Migration & Model `UniversitySintaMetric`

**Files:**
- Create: `database/migrations/2026_10_02_000001_create_university_sinta_metrics_table.php`
- Create: `app/Models/UniversitySintaMetric.php`
- Modify: `app/Models/University.php`
- Test: `tests/Feature/Sinta/UniversitySintaMetricModelTest.php`

**Interfaces:**
- Consumes: `universities` table (`id`, `ptm_code`)
- Produces: `App\Models\UniversitySintaMetric` Eloquent model with 1-to-1 relation `$university->sintaMetric`

- [ ] **Step 1: Write failing feature test for UniversitySintaMetric model and relation**

```php
<?php

namespace Tests\Feature\Sinta;

use App\Models\University;
use App\Models\UniversitySintaMetric;
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
            'scopus_docs' => 1250,
            'garuda_docs' => 3400,
            'sync_status' => 'success',
        ]);

        $this->assertInstanceOf(UniversitySintaMetric::class, $university->sintaMetric);
        $this->assertEquals(245000.50, $university->sintaMetric->sinta_score_overall);
        $this->assertEquals($university->id, $metric->university->id);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Feature/Sinta/UniversitySintaMetricModelTest.php`
Expected: FAIL (Class `UniversitySintaMetric` not found or table does not exist).

- [ ] **Step 3: Create migration file**

File: `database/migrations/2026_10_02_000001_create_university_sinta_metrics_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('university_sinta_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->unique()->constrained('universities')->cascadeOnDelete();
            $table->string('sinta_id', 50)->nullable()->index();
            $table->string('ptm_code', 20)->index();

            // Official Scores
            $table->decimal('sinta_score_overall', 12, 2)->default(0.00)->index();
            $table->decimal('sinta_score_3yr', 12, 2)->default(0.00)->index();
            $table->integer('national_rank_overall')->nullable();
            $table->integer('national_rank_3yr')->nullable();

            // Publications & Citations
            $table->integer('scopus_docs')->default(0)->index();
            $table->integer('scopus_citations')->default(0);
            $table->integer('wos_docs')->default(0)->index();
            $table->integer('wos_citations')->default(0);
            $table->integer('garuda_docs')->default(0)->index();
            $table->integer('garuda_citations')->default(0);
            $table->integer('google_docs')->default(0)->index();
            $table->integer('google_citations')->default(0);

            // Tri Dharma & Outputs
            $table->integer('research_count')->default(0)->index();
            $table->integer('service_count')->default(0)->index();
            $table->integer('ipr_count')->default(0)->index();
            $table->integer('book_count')->default(0)->index();

            // Institution Resources
            $table->integer('authors_count')->default(0);
            $table->integer('departments_count')->default(0);
            $table->integer('journals_count')->default(0);

            // Audit & Payload
            $table->json('raw_payload')->nullable();
            $table->enum('sync_status', ['pending', 'success', 'failed'])->default('pending');
            $table->text('sync_error')->nullable();
            $table->timestamp('last_synced_at')->nullable()->index();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('university_sinta_metrics');
    }
};
```

- [ ] **Step 4: Create Model and update University relation**

File: `app/Models/UniversitySintaMetric.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UniversitySintaMetric extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'sinta_score_overall' => 'decimal:2',
        'sinta_score_3yr' => 'decimal:2',
        'scopus_docs' => 'integer',
        'scopus_citations' => 'integer',
        'wos_docs' => 'integer',
        'wos_citations' => 'integer',
        'garuda_docs' => 'integer',
        'garuda_citations' => 'integer',
        'google_docs' => 'integer',
        'google_citations' => 'integer',
        'research_count' => 'integer',
        'service_count' => 'integer',
        'ipr_count' => 'integer',
        'book_count' => 'integer',
        'authors_count' => 'integer',
        'departments_count' => 'integer',
        'journals_count' => 'integer',
        'raw_payload' => 'array',
        'last_synced_at' => 'datetime',
    ];

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }
}
```

Modify `app/Models/University.php` to add relation:
```php
    /**
     * Get SINTA metrics for this university
     */
    public function sintaMetric(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UniversitySintaMetric::class);
    }
```

- [ ] **Step 5: Run migration and verify test passes**

Run: `docker exec -it jurnal-mu-app php artisan migrate`
Run: `docker exec -it jurnal-mu-app php artisan test tests/Feature/Sinta/UniversitySintaMetricModelTest.php`
Expected: PASS.

- [ ] **Step 6: Commit changes**

```bash
git add database/migrations/*create_university_sinta_metrics_table.php app/Models/UniversitySintaMetric.php app/Models/University.php tests/Feature/Sinta/UniversitySintaMetricModelTest.php
git commit -m "feat(sinta): add university_sinta_metrics migration and model"
```

---

### Task 2: Config & `SintaApiClient` Service with Mock Driver

**Files:**
- Create: `config/sinta.php`
- Create: `app/Services/Sinta/SintaApiClient.php`
- Test: `tests/Unit/Sinta/SintaApiClientTest.php`

**Interfaces:**
- Consumes: `config('sinta')`, `Illuminate\Support\Facades\Http`, `Illuminate\Support\Facades\Cache`
- Produces: `SintaApiClient::getAffiliationMetric(string $ptmCode): array`

- [ ] **Step 1: Write failing unit test for `SintaApiClient`**

File: `tests/Unit/Sinta/SintaApiClientTest.php`
```php
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

        $client = new SintaApiClient();
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

        Http::fake([
            'http://apisinta.kemdikbud.go.id/consumer/login' => Http::response(['token' => 'dummy-jwt-token-12345'], 200),
            'http://apisinta.kemdikbud.go.id/v3/dev/abc-uniq-123/affiliation/metric/kodept/051010' => Http::response([
                'sinta_score_v3_overall' => 125000,
                'sinta_score_v3_3yr' => 45000,
                'scopus' => 800,
                'garuda' => 2000,
            ], 200),
        ]);

        $client = new SintaApiClient();
        $token = $client->getToken();

        $this->assertEquals('dummy-jwt-token-12345', $token);
        $this->assertTrue(Cache::has('sinta_bearer_token'));

        $data = $client->getAffiliationMetric('051010');
        $this->assertEquals(125000, $data['sinta_score_overall']);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Unit/Sinta/SintaApiClientTest.php`
Expected: FAIL (Config or class not found).

- [ ] **Step 3: Create `config/sinta.php`**

```php
<?php

return [
    'base_url' => env('SINTA_API_URL', 'http://apisinta.kemdikbud.go.id'),
    'env' => env('SINTA_ENV', 'dev'),
    'username' => env('SINTA_USERNAME', ''),
    'password' => env('SINTA_PASSWORD', ''),
    'uniq' => env('SINTA_UNIQ_ID', ''),
    'daily_rate_limit' => env('SINTA_DAILY_LIMIT', 500),
    'mock_mode' => env('SINTA_MOCK_MODE', true),
];
```

- [ ] **Step 4: Implement `app/Services/Sinta/SintaApiClient.php`**

```php
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
        $this->env = config('sinta.env', 'dev');
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
                throw new Exception('Gagal melakukan autentikasi ke API SINTA: ' . $response->status());
            }

            return $response->json('token');
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
                'body' => $response->body()
            ]);
            throw new Exception("SINTA API error ({$response->status()}): {$response->body()}");
        }

        $payload = $response->json();
        return $this->normalizeMetricPayload($ptmCode, $payload);
    }

    protected function normalizeMetricPayload(string $ptmCode, array $data): array
    {
        return [
            'ptm_code' => $ptmCode,
            'sinta_id' => $data['sinta_id'] ?? null,
            'sinta_score_overall' => (float) ($data['sinta_score_v3_overall'] ?? $data['sinta_score_overall'] ?? 0),
            'sinta_score_3yr' => (float) ($data['sinta_score_v3_3yr'] ?? $data['sinta_score_3yr'] ?? 0),
            'national_rank_overall' => $data['national_rank_overall'] ?? null,
            'national_rank_3yr' => $data['national_rank_3yr'] ?? null,
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

    protected function generateMockMetric(string $ptmCode): array
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
            'sinta_id' => 'SINTA-' . substr(abs($seed), 0, 5),
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
```

- [ ] **Step 5: Run tests and verify they pass**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Unit/Sinta/SintaApiClientTest.php`
Expected: PASS.

- [ ] **Step 6: Commit changes**

```bash
git add config/sinta.php app/Services/Sinta/SintaApiClient.php tests/Unit/Sinta/SintaApiClientTest.php
git commit -m "feat(sinta): add SintaApiClient service with mock driver and token caching"
```

---

### Task 3: Background Queue Job & Artisan Sync Command

**Files:**
- Create: `app/Jobs/SyncUniversitySintaMetricJob.php`
- Create: `app/Console/Commands/SyncSintaPtmaCommand.php`
- Test: `tests/Feature/Sinta/SyncSintaPtmaCommandTest.php`

**Interfaces:**
- Consumes: `University`, `SintaApiClient`
- Produces: `php artisan sinta:sync-ptma` CLI tool, dispatches `SyncUniversitySintaMetricJob`

- [ ] **Step 1: Write feature test for Sync command**

File: `tests/Feature/Sinta/SyncSintaPtmaCommandTest.php`
```php
<?php

namespace Tests\Feature\Sinta;

use App\Models\University;
use App\Models\UniversitySintaMetric;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class SyncSintaPtmaCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_command_dispatches_jobs_for_ptma(): void
    {
        config(['sinta.mock_mode' => true]);

        University::factory()->create([
            'code' => 'UMY',
            'ptm_code' => '051010',
            'is_active' => true,
        ]);

        $this->artisan('sinta:sync-ptma', ['--mock' => true])
            ->expectsOutputToContain('Selesai sinkronisasi')
            ->assertSuccessful();

        $this->assertDatabaseHas('university_sinta_metrics', [
            'ptm_code' => '051010',
            'sync_status' => 'success',
        ]);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Feature/Sinta/SyncSintaPtmaCommandTest.php`
Expected: FAIL (Command not found).

- [ ] **Step 3: Create `app/Jobs/SyncUniversitySintaMetricJob.php`**

```php
<?php

namespace App\Jobs;

use App\Models\University;
use App\Models\UniversitySintaMetric;
use App\Services\Sinta\SintaApiClient;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncUniversitySintaMetricJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public University $university)
    {
    }

    public function handle(SintaApiClient $client): void
    {
        $ptmCode = $this->university->ptm_code;

        if (!$ptmCode) {
            Log::warning("Skipping SINTA sync: University {$this->university->id} has no ptm_code.");
            return;
        }

        try {
            $data = $client->getAffiliationMetric($ptmCode);

            UniversitySintaMetric::updateOrCreate(
                ['university_id' => $this->university->id],
                array_merge($data, [
                    'sync_status' => 'success',
                    'sync_error' => null,
                    'last_synced_at' => now(),
                ])
            );
        } catch (Exception $e) {
            Log::error("SINTA Sync failed for {$this->university->code}: {$e->getMessage()}");

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
```

- [ ] **Step 4: Create `app/Console/Commands/SyncSintaPtmaCommand.php`**

```php
<?php

namespace App\Console\Commands;

use App\Jobs\SyncUniversitySintaMetricJob;
use App\Models\University;
use App\Services\Sinta\SintaApiClient;
use Illuminate\Console\Command;

class SyncSintaPtmaCommand extends Command
{
    protected $signature = 'sinta:sync-ptma {--university_id= : Sync single university by ID} {--mock : Run with mock data}';
    protected $description = 'Sinkronisasi data metrik SINTA untuk seluruh kampus PTMA';

    public function handle(SintaApiClient $client): int
    {
        if ($this->option('mock')) {
            config(['sinta.mock_mode' => true]);
        }

        $univId = $this->option('university_id');

        $query = University::query()->whereNotNull('ptm_code')->where('is_active', true);
        if ($univId) {
            $query->where('id', $univId);
        }

        $universities = $query->get();

        if ($universities->isEmpty()) {
            $this->warn('Tidak ada universitas aktif dengan ptm_code yang ditemukan.');
            return self::SUCCESS;
        }

        $this->info("Memulai sinkronisasi untuk {$universities->count()} universitas PTMA...");
        $bar = $this->output->createProgressBar($universities->count());

        foreach ($universities as $university) {
            SyncUniversitySintaMetricJob::dispatchSync($university);
            $bar->advance();
            usleep(100000); // 100ms throttle
        }

        $bar->finish();
        $this->newLine();
        $this->info('Selesai sinkronisasi metrik SINTA PTMA.');

        return self::SUCCESS;
    }
}
```

- [ ] **Step 5: Run test and verify it passes**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Feature/Sinta/SyncSintaPtmaCommandTest.php`
Expected: PASS.

- [ ] **Step 6: Commit changes**

```bash
git add app/Jobs/SyncUniversitySintaMetricJob.php app/Console/Commands/SyncSintaPtmaCommand.php tests/Feature/Sinta/SyncSintaPtmaCommandTest.php
git commit -m "feat(sinta): add SyncUniversitySintaMetricJob and artisan command"
```

---

### Task 4: Ranking Engine Service (`PtmaRankingService`)

**Files:**
- Create: `app/Services/Sinta/PtmaRankingService.php`
- Test: `tests/Unit/Sinta/PtmaRankingServiceTest.php`

**Interfaces:**
- Consumes: `UniversitySintaMetric`, `University`
- Produces:
  - `PtmaRankingService::getRankings(array $filters, int $perPage = 25): LengthAwarePaginator`
  - `PtmaRankingService::getSummaryStats(): array`

- [ ] **Step 1: Write failing unit test for `PtmaRankingService`**

File: `tests/Unit/Sinta/PtmaRankingServiceTest.php`
```php
<?php

namespace Tests\Unit\Sinta;

use App\Models\University;
use App\Models\UniversitySintaMetric;
use App\Services\Sinta\PtmaRankingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PtmaRankingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_ranking_sorts_correctly_by_scopus_and_computes_dense_rank(): void
    {
        $u1 = University::factory()->create(['name' => 'Univ A', 'ptm_code' => '001']);
        $u2 = University::factory()->create(['name' => 'Univ B', 'ptm_code' => '002']);

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

        $service = new PtmaRankingService();
        $results = $service->getRankings(['sort' => 'scopus', 'dir' => 'desc']);

        $this->assertEquals($u2->id, $results->first()->university_id);
        $this->assertEquals(1, $results->first()->ranking_position);
    }

    public function test_summary_stats_aggregates_ptma_totals(): void
    {
        $u1 = University::factory()->create(['name' => 'Univ A', 'ptm_code' => '001']);
        $u2 = University::factory()->create(['name' => 'Univ B', 'ptm_code' => '002']);

        UniversitySintaMetric::create([
            'university_id' => $u1->id,
            'ptm_code' => '001',
            'scopus_docs' => 100,
            'ipr_count' => 15,
            'sinta_score_overall' => 1000,
        ]);

        UniversitySintaMetric::create([
            'university_id' => $u2->id,
            'ptm_code' => '002',
            'scopus_docs' => 200,
            'ipr_count' => 25,
            'sinta_score_overall' => 3000,
        ]);

        $service = new PtmaRankingService();
        $stats = $service->getSummaryStats();

        $this->assertEquals(2, $stats['total_ptma_indexed']);
        $this->assertEquals(300, $stats['collective_scopus_docs']);
        $this->assertEquals(40, $stats['collective_ipr_count']);
        $this->assertEquals('Univ B', $stats['top_university_overall']->name);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Unit/Sinta/PtmaRankingServiceTest.php`
Expected: FAIL (Class not found).

- [ ] **Step 3: Implement `app/Services/Sinta/PtmaRankingService.php`**

```php
<?php

namespace App\Services\Sinta;

use App\Models\University;
use App\Models\UniversitySintaMetric;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PtmaRankingService
{
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

    public function getRankings(array $filters = [], int $perPage = 25): LengthAwarePaginator
    {
        $sortKey = $filters['sort'] ?? 'sinta_overall';
        $column = $this->sortMapping[$sortKey] ?? 'sinta_score_overall';
        $direction = strtolower($filters['dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $query = UniversitySintaMetric::query()
            ->select('university_sinta_metrics.*')
            ->selectRaw("DENSE_RANK() OVER (ORDER BY {$column} {$direction}) as ranking_position")
            ->join('universities', 'universities.id', '=', 'university_sinta_metrics.university_id')
            ->where('universities.is_active', true)
            ->with(['university:id,name,short_name,code,ptm_code,logo_url,accreditation_status,city,province']);

        if (!empty($filters['q'])) {
            $search = $filters['q'];
            $query->where(function ($q) use ($search) {
                $q->where('universities.name', 'like', "%{$search}%")
                    ->orWhere('universities.short_name', 'like', "%{$search}%")
                    ->orWhere('universities.code', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['accreditation'])) {
            $query->where('universities.accreditation_status', $filters['accreditation']);
        }

        return $query->orderBy($column, $direction)->paginate($perPage);
    }

    public function getSummaryStats(): array
    {
        $totals = UniversitySintaMetric::query()
            ->join('universities', 'universities.id', '=', 'university_sinta_metrics.university_id')
            ->where('universities.is_active', true)
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
            ->join('universities', 'universities.id', '=', 'university_sinta_metrics.university_id')
            ->where('universities.is_active', true)
            ->orderByDesc('sinta_score_overall')
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Unit/Sinta/PtmaRankingServiceTest.php`
Expected: PASS.

- [ ] **Step 5: Commit changes**

```bash
git add app/Services/Sinta/PtmaRankingService.php tests/Unit/Sinta/PtmaRankingServiceTest.php
git commit -m "feat(sinta): implement PtmaRankingService with dynamic dense ranking and stats"
```

---

### Task 5: Controllers & Web Routing

**Files:**
- Create: `app/Http/Controllers/Sinta/PtmaRankingController.php`
- Create: `app/Http/Controllers/Admin/AdminSintaController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Sinta/PtmaRankingControllerTest.php`

**Interfaces:**
- Consumes: `PtmaRankingService`, `Inertia\Inertia`
- Produces:
  - Route `GET /ptma/ranking` -> `Public/PtmaRanking/Index`
  - Route `GET /admin/sinta` -> `Admin/Sinta/Index`
  - Route `POST /admin/sinta/sync` -> dispatch sync batch

- [ ] **Step 1: Write feature test for Controller endpoints**

File: `tests/Feature/Sinta/PtmaRankingControllerTest.php`
```php
<?php

namespace Tests\Feature\Sinta;

use App\Models\Role;
use App\Models\University;
use App\Models\UniversitySintaMetric;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PtmaRankingControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_view_ptma_ranking_page(): void
    {
        $univ = University::factory()->create(['name' => 'UMY', 'ptm_code' => '051010']);
        UniversitySintaMetric::create([
            'university_id' => $univ->id,
            'ptm_code' => '051010',
            'sinta_score_overall' => 150000,
        ]);

        $response = $this->get(route('ptma.ranking'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/PtmaRanking/Index')
            ->has('rankings.data')
            ->has('stats')
            ->has('filters')
        );
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Feature/Sinta/PtmaRankingControllerTest.php`
Expected: FAIL (Route not defined).

- [ ] **Step 3: Implement `app/Http/Controllers/Sinta/PtmaRankingController.php`**

```php
<?php

namespace App\Http\Controllers\Sinta;

use App\Http\Controllers\Controller;
use App\Services\Sinta\PtmaRankingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PtmaRankingController extends Controller
{
    public function __construct(protected PtmaRankingService $rankingService)
    {
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['sort', 'dir', 'q', 'accreditation']);
        $perPage = (int) $request->input('per_page', 25);

        $rankings = $this->rankingService->getRankings($filters, $perPage);
        $stats = $this->rankingService->getSummaryStats();

        return Inertia::render('Public/PtmaRanking/Index', [
            'rankings' => $rankings,
            'stats' => $stats,
            'filters' => [
                'sort' => $filters['sort'] ?? 'sinta_overall',
                'dir' => $filters['dir'] ?? 'desc',
                'q' => $filters['q'] ?? '',
                'accreditation' => $filters['accreditation'] ?? '',
                'per_page' => $perPage,
            ],
        ]);
    }
}
```

- [ ] **Step 4: Implement `app/Http/Controllers/Admin/AdminSintaController.php`**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SyncUniversitySintaMetricJob;
use App\Models\University;
use App\Models\UniversitySintaMetric;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSintaController extends Controller
{
    public function index(): Response
    {
        $metrics = UniversitySintaMetric::with('university:id,name,short_name,code,ptm_code')
            ->orderByDesc('last_synced_at')
            ->paginate(30);

        $totalUniversities = University::whereNotNull('ptm_code')->count();
        $syncedSuccess = UniversitySintaMetric::where('sync_status', 'success')->count();
        $syncedFailed = UniversitySintaMetric::where('sync_status', 'failed')->count();

        return Inertia::render('Admin/Sinta/Index', [
            'metrics' => $metrics,
            'summary' => [
                'total_ptma' => $totalUniversities,
                'synced_success' => $syncedSuccess,
                'synced_failed' => $syncedFailed,
                'mock_mode' => (bool) config('sinta.mock_mode'),
            ],
        ]);
    }

    public function syncAll(Request $request): RedirectResponse
    {
        $universities = University::whereNotNull('ptm_code')->where('is_active', true)->get();

        foreach ($universities as $university) {
            SyncUniversitySintaMetricJob::dispatch($university);
        }

        return redirect()->back()->with('success', "Proses sinkronisasi dijadwalkan untuk {$universities->count()} PTMA.");
    }
}
```

- [ ] **Step 5: Register routes in `routes/web.php`**

Add public route and admin routes:
```php
// Public PTMA SINTA Ranking Leaderboard
Route::get('/ptma/ranking', [App\Http\Controllers\Sinta\PtmaRankingController::class, 'index'])->name('ptma.ranking');

// Admin SINTA Management (Protected)
Route::middleware(['auth', 'verified'])->prefix('admin/sinta')->name('admin.sinta.')->group(function () {
    Route::get('/', [App\Http\Controllers\Admin\AdminSintaController::class, 'index'])->name('index');
    Route::post('/sync', [App\Http\Controllers\Admin\AdminSintaController::class, 'syncAll'])->name('sync');
});
```

- [ ] **Step 6: Run test and verify it passes**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Feature/Sinta/PtmaRankingControllerTest.php`
Expected: PASS.

- [ ] **Step 7: Commit changes**

```bash
git add app/Http/Controllers/Sinta/PtmaRankingController.php app/Http/Controllers/Admin/AdminSintaController.php routes/web.php tests/Feature/Sinta/PtmaRankingControllerTest.php
git commit -m "feat(sinta): add PtmaRankingController and AdminSintaController routes"
```

---

### Task 6: Frontend React Components — Hero Bento & Floating Nav

**Files:**
- Create: `resources/js/pages/Public/PtmaRanking/components/PtmaHeroBento.tsx`
- Create: `resources/js/pages/Public/PtmaRanking/components/VariableSegmentedNav.tsx`
- Create: `resources/js/pages/Public/PtmaRanking/components/FilterControlBar.tsx`

**Interfaces:**
- Consumes: Stats props, filter state, Inertia `router`
- Produces: Asymmetric Hero Bento, Floating Variable Nav with Motion spring physics, Search/Filter bar

- [ ] **Step 1: Create `PtmaHeroBento.tsx`**

File: `resources/js/pages/Public/PtmaRanking/components/PtmaHeroBento.tsx`
```tsx
import React from 'react';

interface StatsProps {
    total_ptma_indexed: number;
    collective_scopus_docs: number;
    collective_garuda_docs: number;
    collective_ipr_count: number;
    top_university_overall?: {
        name: string;
        short_name?: string;
        logo_url?: string;
        city?: string;
    };
    top_university_score: number;
}

export const PtmaHeroBento: React.FC<{ stats: StatsProps }> = ({ stats }) => {
    return (
        <section className="relative w-full py-8 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Spotlight #1 Leaderboard (Double-Bezel Architecture) */}
                <div className="lg:col-span-5 relative group">
                    <div className="rounded-[2rem] p-2 bg-gradient-to-br from-amber-500/15 via-zinc-100 to-emerald-500/10 dark:from-amber-500/10 dark:via-zinc-900/40 dark:to-emerald-500/5 ring-1 ring-amber-500/30">
                        <div className="rounded-[calc(2rem-0.5rem)] p-6 md:p-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-sm flex flex-col justify-between h-full min-h-[260px]">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold ring-1 ring-amber-500/20">
                                    ★ Top PTMA Nasional
                                </span>
                                <span className="text-xs font-mono text-zinc-400">Peringkat #1</span>
                            </div>

                            <div className="my-6">
                                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                    {stats.top_university_overall?.name ?? 'Universitas Muhammadiyah'}
                                </h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {stats.top_university_overall?.city ?? 'Indonesia'}
                                </p>
                            </div>

                            <div className="flex items-baseline gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <span className="text-3xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                                    {new Intl.NumberFormat('id-ID').format(stats.top_university_score)}
                                </span>
                                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                    Skor SINTA Overall
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Macro Power Grid (2x2) */}
                <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl p-5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total PTMA Terindeks</span>
                        <div className="my-3">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                                {stats.total_ptma_indexed}
                            </span>
                            <span className="text-xs text-zinc-500 block mt-1">Kampus Muhammadiyah & 'Aisyiyah</span>
                        </div>
                    </div>

                    <div className="rounded-2xl p-5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Publikasi Scopus</span>
                        <div className="my-3">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                                {new Intl.NumberFormat('id-ID').format(stats.collective_scopus_docs)}
                            </span>
                            <span className="text-xs text-zinc-500 block mt-1">Total Artikel Terindeks Global</span>
                        </div>
                    </div>

                    <div className="rounded-2xl p-5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Publikasi Garuda</span>
                        <div className="my-3">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                                {new Intl.NumberFormat('id-ID').format(stats.collective_garuda_docs)}
                            </span>
                            <span className="text-xs text-zinc-500 block mt-1">Total Dokumen Terakreditasi Nasional</span>
                        </div>
                    </div>

                    <div className="rounded-2xl p-5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">Paten & HKI</span>
                        <div className="my-3">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                                {new Intl.NumberFormat('id-ID').format(stats.collective_ipr_count)}
                            </span>
                            <span className="text-xs text-zinc-500 block mt-1">Kekayaan Intelektual Terdaftar</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
```

- [ ] **Step 2: Create `VariableSegmentedNav.tsx`**

File: `resources/js/pages/Public/PtmaRanking/components/VariableSegmentedNav.tsx`
```tsx
import React from 'react';
import { router } from '@inertiajs/react';
import { motion } from 'motion/react';

interface NavProps {
    currentSort: string;
    filters: Record<string, any>;
}

const VARIABLES = [
    { key: 'sinta_overall', label: 'Skor SINTA Overall' },
    { key: 'sinta_3yr', label: 'Skor 3 Tahun' },
    { key: 'scopus', label: 'Scopus' },
    { key: 'garuda', label: 'Garuda' },
    { key: 'wos', label: 'WoS' },
    { key: 'ipr', label: 'Paten / HKI' },
    { key: 'research', label: 'Penelitian' },
    { key: 'service', label: 'Pengabdian' },
];

export const VariableSegmentedNav: React.FC<NavProps> = ({ currentSort, filters }) => {
    const handleSwitch = (key: string) => {
        router.get(
            '/ptma/ranking',
            { ...filters, sort: key, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    return (
        <div className="w-full overflow-x-auto pb-2 scrollbar-none my-6">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                {VARIABLES.map((item) => {
                    const isActive = currentSort === item.key;
                    return (
                        <button
                            key={item.key}
                            onClick={() => handleSwitch(item.key)}
                            className={`relative px-4 py-2 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                                isActive
                                    ? 'text-zinc-900 dark:text-zinc-50 font-semibold'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activePillIndicator"
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-full shadow-sm"
                                />
                            )}
                            <span className="relative z-10">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
```

- [ ] **Step 3: Create `FilterControlBar.tsx`**

File: `resources/js/pages/Public/PtmaRanking/components/FilterControlBar.tsx`
```tsx
import React, { useState } from 'react';
import { router } from '@inertiajs/react';

interface FilterProps {
    filters: {
        q?: string;
        accreditation?: string;
        sort?: string;
        dir?: string;
    };
}

export const FilterControlBar: React.FC<FilterProps> = ({ filters }) => {
    const [search, setSearch] = useState(filters.q || '');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/ptma/ranking',
            { ...filters, q: search, page: 1 },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleAccreditationChange = (val: string) => {
        router.get(
            '/ptma/ranking',
            { ...filters, accreditation: val, page: 1 },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau singkatan PTMA..."
                    className="w-full px-4 py-2.5 text-sm rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
            </form>

            <div className="flex items-center gap-2">
                <select
                    value={filters.accreditation || ''}
                    onChange={(e) => handleAccreditationChange(e.target.value)}
                    className="px-4 py-2 text-xs rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none"
                >
                    <option value="">Semua Akreditasi</option>
                    <option value="Unggul">Unggul</option>
                    <option value="Baik Sekali">Baik Sekali</option>
                    <option value="Baik">Baik</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                </select>
            </div>
        </div>
    );
};
```

- [ ] **Step 4: Commit components**

```bash
git add resources/js/pages/Public/PtmaRanking/components/*
git commit -m "feat(sinta): add PtmaHeroBento, VariableSegmentedNav, and FilterControlBar"
```

---

### Task 7: Frontend React Components — Leaderboard Table, Row, & Detail Drawer

**Files:**
- Create: `resources/js/pages/Public/PtmaRanking/components/LeaderboardRow.tsx`
- Create: `resources/js/pages/Public/PtmaRanking/components/LeaderboardTable.tsx`
- Create: `resources/js/pages/Public/PtmaRanking/components/PtmaDetailDrawer.tsx`
- Create: `resources/js/pages/Public/PtmaRanking/Index.tsx`

- [ ] **Step 1: Create `LeaderboardRow.tsx`**

File: `resources/js/pages/Public/PtmaRanking/components/LeaderboardRow.tsx`
```tsx
import React from 'react';

interface UniversityData {
    id: number;
    name: string;
    short_name?: string;
    code?: string;
    ptm_code?: string;
    logo_url?: string;
    accreditation_status?: string;
    city?: string;
}

interface MetricRowProps {
    metric: {
        id: number;
        ranking_position: number;
        sinta_score_overall: number;
        sinta_score_3yr: number;
        scopus_docs: number;
        garuda_docs: number;
        wos_docs: number;
        ipr_count: number;
        research_count: number;
        service_count: number;
        university: UniversityData;
    };
    currentSort: string;
    topValue: number;
    onSelectDetail: (metric: any) => void;
}

export const LeaderboardRow: React.FC<MetricRowProps> = ({ metric, currentSort, topValue, onSelectDetail }) => {
    const rank = metric.ranking_position;
    const univ = metric.university;

    const getValue = () => {
        switch (currentSort) {
            case 'scopus': return { val: metric.scopus_docs, label: 'Dokumen' };
            case 'garuda': return { val: metric.garuda_docs, label: 'Dokumen' };
            case 'wos': return { val: metric.wos_docs, label: 'Dokumen' };
            case 'ipr': return { val: metric.ipr_count, label: 'Paten/HKI' };
            case 'research': return { val: metric.research_count, label: 'Judul' };
            case 'service': return { val: metric.service_count, label: 'PkM' };
            case 'sinta_3yr': return { val: metric.sinta_score_3yr, label: 'Skor' };
            default: return { val: metric.sinta_score_overall, label: 'Skor' };
        }
    };

    const currentData = getValue();
    const ratio = topValue > 0 ? Math.min(100, Math.max(5, (currentData.val / topValue) * 100)) : 10;

    const getRankBadgeClass = () => {
        if (rank === 1) return 'bg-amber-400/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-400/30';
        if (rank === 2) return 'bg-slate-300/30 text-slate-700 dark:text-slate-300 ring-1 ring-slate-400/30';
        if (rank === 3) return 'bg-amber-700/15 text-amber-800 dark:text-amber-600 ring-1 ring-amber-700/20';
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500';
    };

    return (
        <div className="group relative rounded-2xl p-1 bg-zinc-50/50 dark:bg-zinc-900/30 ring-1 ring-zinc-200/70 dark:ring-zinc-800/80 hover:ring-emerald-500/30 transition-all">
            <div className="rounded-[calc(1rem-0.125rem)] p-4 md:px-6 md:py-4 bg-white dark:bg-zinc-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Rank & Univ Identity */}
                <div className="flex items-center gap-4 min-w-[280px]">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm ${getRankBadgeClass()}`}>
                        #{rank}
                    </span>
                    <div>
                        <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {univ.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            {univ.accreditation_status && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                                    {univ.accreditation_status}
                                </span>
                            )}
                            <span className="text-xs text-zinc-400">{univ.city ?? 'Indonesia'}</span>
                        </div>
                    </div>
                </div>

                {/* Primary Metric & Sparkbar */}
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex flex-col items-end">
                        <span className="text-lg md:text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                            {new Intl.NumberFormat('id-ID').format(currentData.val)}
                        </span>
                        <div className="w-24 md:w-32 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${ratio}%` }} />
                        </div>
                    </div>

                    {/* Button-in-Button Detail Action */}
                    <button
                        onClick={() => onSelectDetail(metric)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-zinc-700 dark:text-zinc-300 transition-all flex items-center gap-1.5"
                    >
                        Rincian
                        <span className="w-4 h-4 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px]">↗</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
```

- [ ] **Step 2: Create `LeaderboardTable.tsx`**

File: `resources/js/pages/Public/PtmaRanking/components/LeaderboardTable.tsx`
```tsx
import React from 'react';
import { LeaderboardRow } from './LeaderboardRow';

interface TableProps {
    metrics: any[];
    currentSort: string;
    onSelectDetail: (metric: any) => void;
}

export const LeaderboardTable: React.FC<TableProps> = ({ metrics, currentSort, onSelectDetail }) => {
    if (!metrics || metrics.length === 0) {
        return (
            <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <p className="text-sm text-zinc-400">Tidak ada kampus yang cocok dengan kriteria pencarian.</p>
            </div>
        );
    }

    const topValue = metrics[0] ? (
        currentSort === 'scopus' ? metrics[0].scopus_docs :
        currentSort === 'garuda' ? metrics[0].garuda_docs :
        currentSort === 'wos' ? metrics[0].wos_docs :
        currentSort === 'ipr' ? metrics[0].ipr_count :
        currentSort === 'research' ? metrics[0].research_count :
        currentSort === 'service' ? metrics[0].service_count :
        metrics[0].sinta_score_overall
    ) : 1;

    return (
        <div className="space-y-3 my-4">
            {metrics.map((item) => (
                <LeaderboardRow
                    key={item.id}
                    metric={item}
                    currentSort={currentSort}
                    topValue={topValue}
                    onSelectDetail={onSelectDetail}
                />
            ))}
        </div>
    );
};
```

- [ ] **Step 3: Create `PtmaDetailDrawer.tsx`**

File: `resources/js/pages/Public/PtmaRanking/components/PtmaDetailDrawer.tsx`
```tsx
import React from 'react';

interface DrawerProps {
    metric: any | null;
    onClose: () => void;
}

export const PtmaDetailDrawer: React.FC<DrawerProps> = ({ metric, onClose }) => {
    if (!metric) return null;

    const univ = metric.university;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                            Scorecard Kampus
                        </span>
                        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600">✕</button>
                    </div>

                    <div className="my-6">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{univ.name}</h3>
                        <p className="text-xs text-zinc-500 mt-1">{univ.code} · {univ.city}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 my-4">
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                            <span className="text-[11px] text-zinc-400 block">SINTA Overall</span>
                            <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                                {new Intl.NumberFormat('id-ID').format(metric.sinta_score_overall)}
                            </span>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                            <span className="text-[11px] text-zinc-400 block">SINTA 3 Tahun</span>
                            <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                                {new Intl.NumberFormat('id-ID').format(metric.sinta_score_3yr)}
                            </span>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                            <span className="text-[11px] text-zinc-400 block">Scopus Dokumen</span>
                            <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                                {new Intl.NumberFormat('id-ID').format(metric.scopus_docs)}
                            </span>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                            <span className="text-[11px] text-zinc-400 block">Garuda Dokumen</span>
                            <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                                {new Intl.NumberFormat('id-ID').format(metric.garuda_docs)}
                            </span>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                            <span className="text-[11px] text-zinc-400 block">Paten / HKI</span>
                            <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                                {new Intl.NumberFormat('id-ID').format(metric.ipr_count)}
                            </span>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                            <span className="text-[11px] text-zinc-400 block">Penelitian (Riset)</span>
                            <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                                {new Intl.NumberFormat('id-ID').format(metric.research_count)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-full text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    >
                        Tutup Rincian
                    </button>
                </div>
            </div>
        </div>
    );
};
```

- [ ] **Step 4: Create `Index.tsx` Page**

File: `resources/js/pages/Public/PtmaRanking/Index.tsx`
```tsx
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { PtmaHeroBento } from './components/PtmaHeroBento';
import { VariableSegmentedNav } from './components/VariableSegmentedNav';
import { FilterControlBar } from './components/FilterControlBar';
import { LeaderboardTable } from './components/LeaderboardTable';
import { PtmaDetailDrawer } from './components/PtmaDetailDrawer';

interface PageProps {
    rankings: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    stats: any;
    filters: Record<string, any>;
}

export default function PtmaRankingIndex({ rankings, stats, filters }: PageProps) {
    const [selectedMetric, setSelectedMetric] = useState<any | null>(null);

    return (
        <>
            <Head title="Papan Peringkat SINTA PTMA — JurnalMu" />
            <div className="min-h-[100dvh] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* Page Header */}
                    <div className="mb-6">
                        <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-emerald-600 dark:text-emerald-400">
                            Benchmark Institusi
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-1">
                            Peringkat Riset SINTA PTMA
                        </h1>
                        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mt-2 max-w-3xl">
                            Eksplorasi tolok ukur kinerja riset, publikasi internasional Scopus, jurnal nasional Garuda, dan luaran HKI seluruh Perguruan Tinggi Muhammadiyah & 'Aisyiyah se-Indonesia.
                        </p>
                    </div>

                    {/* Bento Hero */}
                    <PtmaHeroBento stats={stats} />

                    {/* Variable Segmented Nav */}
                    <VariableSegmentedNav currentSort={filters.sort || 'sinta_overall'} filters={filters} />

                    {/* Search & Filter */}
                    <FilterControlBar filters={filters} />

                    {/* Leaderboard Table */}
                    <LeaderboardTable
                        metrics={rankings.data}
                        currentSort={filters.sort || 'sinta_overall'}
                        onSelectDetail={setSelectedMetric}
                    />

                    {/* Drawer Detail */}
                    <PtmaDetailDrawer
                        metric={selectedMetric}
                        onClose={() => setSelectedMetric(null)}
                    />
                </main>
            </div>
        </>
    );
}
```

- [ ] **Step 5: Verify build & tests**

Run: `npm run build` or `npm run types`
Expected: PASS (No TypeScript or build errors).

- [ ] **Step 6: Commit changes**

```bash
git add resources/js/pages/Public/PtmaRanking/*
git commit -m "feat(sinta): implement high-end LeaderboardTable, Row, Drawer, and Index page"
```

---

### Task 8: Super Admin SINTA Management Dashboard

**Files:**
- Create: `resources/js/pages/Admin/Sinta/Index.tsx`
- Test: `tests/Feature/Sinta/AdminSintaSyncTest.php`

**Interfaces:**
- Consumes: Admin session, `AdminSintaController`
- Produces: UI for monitoring SINTA sync logs, trigger sync now button with quota safety check

- [ ] **Step 1: Write feature test for admin sync**

File: `tests/Feature/Sinta/AdminSintaSyncTest.php`
```php
<?php

namespace Tests\Feature\Sinta;

use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSintaSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_trigger_sinta_sync(): void
    {
        $role = Role::create(['name' => 'Super Admin']);
        $admin = User::factory()->create(['role_id' => $role->id]);

        $univ = University::factory()->create(['name' => 'UMY', 'ptm_code' => '051010']);

        $response = $this->actingAs($admin)->post(route('admin.sinta.sync'));

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }
}
```

- [ ] **Step 2: Run test to verify it passes or fails**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Feature/Sinta/AdminSintaSyncTest.php`
Expected: PASS.

- [ ] **Step 3: Create `resources/js/pages/Admin/Sinta/Index.tsx`**

```tsx
import React from 'react';
import { Head, router } from '@inertiajs/react';

interface AdminProps {
    metrics: {
        data: any[];
    };
    summary: {
        total_ptma: number;
        synced_success: number;
        synced_failed: number;
        mock_mode: boolean;
    };
}

export default function AdminSintaIndex({ metrics, summary }: AdminProps) {
    const handleSyncNow = () => {
        if (confirm('Jalankan proses sinkronisasi untuk seluruh kampus PTMA? Pastikan kuota harian mencukupi.')) {
            router.post(route('admin.sinta.sync'));
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Head title="Manajemen Integrasi SINTA — Admin" />
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Sinkronisasi API SINTA PTMA</h1>
                    <p className="text-sm text-zinc-500">Monitor data metrik dan kuota request harian API SINTA</p>
                </div>
                <button
                    onClick={handleSyncNow}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                >
                    Sync Data Sekarang
                </button>
            </div>

            {/* Quota & Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900">
                    <span className="text-xs text-zinc-400">Total Kampus Target</span>
                    <p className="text-2xl font-bold font-mono mt-1">{summary.total_ptma}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900">
                    <span className="text-xs text-emerald-600">Berhasil Sinkron</span>
                    <p className="text-2xl font-bold font-mono mt-1 text-emerald-600">{summary.synced_success}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900">
                    <span className="text-xs text-rose-500">Gagal Sinkron</span>
                    <p className="text-2xl font-bold font-mono mt-1 text-rose-500">{summary.synced_failed}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900">
                    <span className="text-xs text-zinc-400">Mode Sistem</span>
                    <p className="text-sm font-semibold font-mono mt-2">
                        {summary.mock_mode ? 'Mock Mode (Dev)' : 'Live API (Production)'}
                    </p>
                </div>
            </div>

            {/* Sync Table */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 uppercase font-mono">
                        <tr>
                            <th className="p-3">Kampus</th>
                            <th className="p-3">Kode PTM</th>
                            <th className="p-3">Skor SINTA</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Terakhir Sync</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {metrics.data.map((m) => (
                            <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                <td className="p-3 font-medium">{m.university?.name}</td>
                                <td className="p-3 font-mono">{m.ptm_code}</td>
                                <td className="p-3 font-mono">{m.sinta_score_overall}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                        m.sync_status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                    }`}>
                                        {m.sync_status}
                                    </span>
                                </td>
                                <td className="p-3 text-zinc-400">{m.last_synced_at ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Commit changes**

```bash
git add resources/js/pages/Admin/Sinta/Index.tsx tests/Feature/Sinta/AdminSintaSyncTest.php
git commit -m "feat(sinta): implement AdminSintaIndex management dashboard and sync test"
```

---

### Task 9: Full End-to-End Verification & Fixture Seeding

**Files:**
- Modify: `database/seeders/DatabaseSeeder.php`
- Test: All SINTA test suites

- [ ] **Step 1: Run complete SINTA test suite**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Feature/Sinta tests/Unit/Sinta`
Expected: ALL PASS.

- [ ] **Step 2: Run frontend type checking & build verification**

Run: `npm run types`
Run: `npm run build`
Expected: PASS with zero errors.

- [ ] **Step 3: Commit final plan verification marker**

```bash
git commit --allow-empty -m "chore(sinta): complete full test and build verification"
```
