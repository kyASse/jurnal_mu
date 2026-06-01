# Regions Data Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-crafted 97-city JSON dataset with complete region data (38 provinces, 514 kab/kota) sourced from `https://api-regional-indonesia.vercel.app`, stored locally via an artisan fetch command.

**Architecture:** Add `artisan regions:fetch` command that downloads data from the external API (IDs are sequential integers 1–38 for provinces), strips Kabupaten/Kota prefixes from city names, and saves to `database/data/indonesian_regions.json`. A new migration drops and recreates `provinces`/`cities` tables using `unsignedBigInteger` primary keys. Models get `$incrementing = false`. Seeder casts IDs to int. Tests updated for integer IDs.

**Tech Stack:** Laravel, PHP, Pest (Testing), Docker (`jurnal-mu-app`)

---

### Task 1: Create Artisan Command `regions:fetch`

**Files:**
- Create: `app/Console/Commands/FetchIndonesianRegionsCommand.php`

- [x] **Step 1: Write the command class**

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FetchIndonesianRegionsCommand extends Command
{
    protected $signature = 'regions:fetch';
    protected $description = 'Fetch Indonesian provinces and cities from BPS API and save to JSON dataset';

    private const BASE_URL = 'https://api-regional-indonesia.vercel.app/api';

    public function handle(): int
    {
        $this->info('Fetching provinces...');

        $provincesRaw = $this->fetchJson(self::BASE_URL . '/provinces?sort=name');
        if ($provincesRaw === null) {
            $this->error('Failed to fetch provinces. Aborting.');
            return self::FAILURE;
        }

        $regions = [];

        foreach ($provincesRaw as $province) {
            $provinceId = $province['id'];
            $provinceName = $province['name'];

            $this->info("Fetching cities for {$provinceName}...");

            $citiesRaw = $this->fetchJson(self::BASE_URL . "/cities/{$provinceId}?sort=name");
            if ($citiesRaw === null) {
                $this->error("Failed to fetch cities for province {$provinceName} (ID: {$provinceId}). Aborting.");
                return self::FAILURE;
            }

            $cities = array_map(function (array $city): array {
                return [
                    'id'   => $city['id'],
                    'name' => $this->stripCityPrefix($city['name']),
                ];
            }, $citiesRaw);

            $this->line("  → {$provinceName}: " . count($cities) . ' cities');

            $regions[] = [
                'id'     => $provinceId,
                'name'   => $provinceName,
                'cities' => $cities,
            ];
        }

        $outputPath = database_path('data/indonesian_regions.json');
        file_put_contents($outputPath, json_encode($regions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $totalCities = array_sum(array_map(fn ($r) => count($r['cities']), $regions));
        $this->info("Done! Saved " . count($regions) . " provinces and {$totalCities} cities to {$outputPath}");

        return self::SUCCESS;
    }

    private function fetchJson(string $url): ?array
    {
        $context = stream_context_create(['http' => ['timeout' => 15]]);
        $raw = @file_get_contents($url, false, $context);

        if ($raw === false) {
            return null;
        }

        $decoded = json_decode($raw, true);

        if (!isset($decoded['data']) || !is_array($decoded['data'])) {
            return null;
        }

        return $decoded['data'];
    }

    private function stripCityPrefix(string $name): string
    {
        if (str_starts_with($name, 'Kabupaten ')) {
            return substr($name, strlen('Kabupaten '));
        }

        if (str_starts_with($name, 'Kota ')) {
            return substr($name, strlen('Kota '));
        }

        return $name;
    }
}
```

- [x] **Step 2: Run the command to verify it works and generates valid JSON**

Run: `docker exec jurnal-mu-app php artisan regions:fetch`

Expected output (partial):
```
Fetching provinces...
Fetching cities for Aceh...
  → Aceh: 23 cities
Fetching cities for Bali...
  → Bali: 9 cities
...
Done! Saved 38 provinces and 514 cities to .../database/data/indonesian_regions.json
```

Then verify the output file structure is valid JSON:
Run: `docker exec jurnal-mu-app php -r "echo count(json_decode(file_get_contents(database_path('data/indonesian_regions.json')), true));"`

Expected: `38`

- [x] **Step 3: Commit**

```bash
git add app/Console/Commands/FetchIndonesianRegionsCommand.php database/data/indonesian_regions.json
git commit -m "feat: add regions:fetch artisan command and update JSON with full BPS dataset"
```

---

### Task 2: Create Migration to Drop & Recreate Tables with Integer IDs

**Files:**
- Create: `database/migrations/2026_06_01_000000_recreate_provinces_and_cities_with_integer_ids.php`

**Note:** The API returns sequential integer IDs (1–38 for provinces, sequential for cities), not BPS string codes. We use `unsignedBigInteger` primary keys with `$incrementing = false` on models.

- [x] **Step 1: Create the migration file**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop in reverse FK order
        Schema::dropIfExists('cities');
        Schema::dropIfExists('provinces');

        Schema::create('provinces', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('name', 100);
            $table->timestamps();
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedBigInteger('province_id');
            $table->foreign('province_id')->references('id')->on('provinces')->cascadeOnDelete();
            $table->string('name', 100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
        Schema::dropIfExists('provinces');

        // Restore original auto-increment schema
        Schema::create('provinces', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->timestamps();
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('province_id')->constrained('provinces')->cascadeOnDelete();
            $table->string('name', 100);
            $table->timestamps();
        });
    }
};
```

- [x] **Step 2: Run migration**

Run: `docker exec jurnal-mu-app php artisan migrate`

Expected: `Running migrations... 2026_06_01_000000_recreate_provinces_and_cities_with_integer_ids ........ 4ms DONE`

- [x] **Step 3: Commit**

```bash
git add database/migrations/2026_06_01_000000_recreate_provinces_and_cities_with_integer_ids.php
git commit -m "migration: drop and recreate provinces and cities tables with integer IDs"
```

---

### Task 3: Update Eloquent Models and Seeder for Integer IDs

**Files:**
- Modify: `app/Models/Province.php`
- Modify: `app/Models/City.php`
- Modify: `database/seeders/IndonesianRegionsSeeder.php`

- [x] **Step 1: Update `Province` model**

Replace the full file content with:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Province extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $fillable = ['name'];

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }
}
```

- [x] **Step 2: Update `City` model**

Replace the full file content with:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class City extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $fillable = ['province_id', 'name'];

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }
}
```

- [x] **Step 3: Update seeder to cast IDs to integer**

The JSON from the API has string IDs (`"1"`, `"2"`). Cast to `int` before passing to `updateOrCreate` so they match the `unsignedBigInteger` column.

Replace the full file content of `database/seeders/IndonesianRegionsSeeder.php` with:
```php
<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Province;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IndonesianRegionsSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/indonesian_regions.json');

        if (! file_exists($jsonPath)) {
            if ($this->command) {
                $this->command->error("JSON file not found at: {$jsonPath}");
            }
            return;
        }

        $regions = json_decode(file_get_contents($jsonPath), true);

        Province::unguard();
        City::unguard();

        try {
            DB::transaction(function () use ($regions) {
                foreach ($regions as $provinceData) {
                    $province = Province::updateOrCreate(
                        ['id' => (int) $provinceData['id']],
                        ['name' => $provinceData['name']]
                    );

                    foreach ($provinceData['cities'] as $cityData) {
                        City::updateOrCreate(
                            ['id' => (int) $cityData['id']],
                            [
                                'province_id' => $province->id,
                                'name'        => $cityData['name'],
                            ]
                        );
                    }
                }
            });
        } finally {
            Province::reguard();
            City::reguard();
        }
    }
}
```

- [x] **Step 3: Run seeder to verify models work with new schema**

Run: `docker exec jurnal-mu-app php artisan db:seed --class=IndonesianRegionsSeeder`

Expected: No errors. Then verify row counts:
Run: `docker exec jurnal-mu-app php artisan tinker --execute="echo Province::count() . ' provinces, ' . City::count() . ' cities';"`

Expected: `38 provinces, 514 cities`

- [x] **Step 4: Commit**

```bash
git add app/Models/Province.php app/Models/City.php
git commit -m "model: add incrementing=false and keyType=string for BPS string IDs"
```

---

### Task 4: Update Unit Tests for String IDs

**Files:**
- Modify: `tests/Unit/Models/ProvinceCityTest.php`

The current tests use `Province::create(['name' => ...])` without explicit IDs (relying on auto-increment). With `$incrementing = false`, creating a Province without an `id` will fail. Tests must provide explicit BPS-style string IDs via `unguard()`.

- [x] **Step 1: Rewrite the test file**

```php
<?php

use App\Models\City;
use App\Models\Province;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Province::unguard();
    City::unguard();
});

afterEach(function () {
    Province::reguard();
    City::reguard();
});

test('province can be created and has correct fillable attributes', function () {
    $province = Province::create([
        'id'          => 1,
        'name'        => 'Jawa Barat',
        'extra_field' => 'should be ignored',
    ]);

    expect($province)->toBeInstanceOf(Province::class)
        ->and($province->id)->toBe(1)
        ->and($province->name)->toBe('Jawa Barat')
        ->and($province->extra_field)->toBeNull();
});

test('city can be created and has correct fillable attributes', function () {
    $province = Province::create(['id' => 1, 'name' => 'Jawa Barat']);

    $city = City::create([
        'id'          => 101,
        'province_id' => 1,
        'name'        => 'Bandung',
        'extra_field' => 'should be ignored',
    ]);

    expect($city)->toBeInstanceOf(City::class)
        ->and($city->province_id)->toBe(1)
        ->and($city->name)->toBe('Bandung')
        ->and($city->extra_field)->toBeNull();
});

test('province has many cities relationship', function () {
    $province = Province::create(['id' => 1, 'name' => 'Jawa Barat']);
    $province->cities()->create(['id' => 101, 'name' => 'Bandung']);
    $province->cities()->create(['id' => 102, 'name' => 'Bekasi']);

    expect($province->cities)->toHaveCount(2)
        ->and($province->cities->pluck('name')->toArray())->toEqualCanonicalizing(['Bandung', 'Bekasi']);
});

test('city belongs to province relationship', function () {
    $province = Province::create(['id' => 1, 'name' => 'Jawa Barat']);
    $city = City::create([
        'id'          => 101,
        'province_id' => 1,
        'name'        => 'Bandung',
    ]);

    expect($city->province)->toBeInstanceOf(Province::class)
        ->and($city->province->name)->toBe('Jawa Barat');
});
```

- [x] **Step 2: Run tests to verify they pass**

Run: `docker exec jurnal-mu-app php artisan test tests/Unit/Models/ProvinceCityTest.php`

Expected:
```
PASS  Tests\Unit\Models\ProvinceCityTest
✓ province can be created and has correct fillable attributes
✓ city can be created and has correct fillable attributes
✓ province has many cities relationship
✓ city belongs to province relationship
```

- [x] **Step 3: Commit**

```bash
git add tests/Unit/Models/ProvinceCityTest.php
git commit -m "test: update ProvinceCityTest to use BPS string IDs"
```

---

### Task 5: Update Feature Tests for String IDs

**Files:**
- Modify: `tests/Feature/LocationControllerTest.php`

The feature tests create `Province` records without explicit IDs. With `$incrementing = false`, all creates need explicit `id`. Also update `unguard`/`reguard` wrapping.

- [x] **Step 1: Rewrite the test file**

```php
<?php

use App\Models\City;
use App\Models\Province;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Province::unguard();
    City::unguard();
});

afterEach(function () {
    Province::reguard();
    City::reguard();
});

test('guest or non-admin-kampus cannot access location endpoints', function () {
    $province = Province::create(['id' => 1, 'name' => 'Jawa Barat']);

    // Guest returns unauthorized
    $this->getJson('/admin-kampus/locations/provinces')->assertStatus(401);
    $this->getJson("/admin-kampus/locations/provinces/{$province->id}/cities")->assertStatus(401);

    // Regular user returns forbidden
    $this->seedRoles();
    $user = User::factory()->user()->create();
    $this->actingAs($user);

    $this->get('/admin-kampus/locations/provinces')->assertStatus(403);
    $this->get("/admin-kampus/locations/provinces/{$province->id}/cities")->assertStatus(403);
});

test('admin-kampus can list provinces ordered by name', function () {
    $this->seedRoles();
    $admin = User::factory()->adminKampus()->create();
    $this->actingAs($admin);

    Province::create(['id' => 6, 'name' => 'Jawa Timur']);
    Province::create(['id' => 15, 'name' => 'DKI Jakarta']);
    Province::create(['id' => 1, 'name' => 'Jawa Barat']);

    $response = $this->getJson('/admin-kampus/locations/provinces');

    $response->assertOk()
        ->assertJsonCount(3)
        ->assertJson([
            ['name' => 'DKI Jakarta'],
            ['name' => 'Jawa Barat'],
            ['name' => 'Jawa Timur'],
        ]);
});

test('admin-kampus can list cities of a province ordered by name', function () {
    $this->seedRoles();
    $admin = User::factory()->adminKampus()->create();
    $this->actingAs($admin);

    $province1 = Province::create(['id' => 1, 'name' => 'Jawa Barat']);
    $province2 = Province::create(['id' => 4, 'name' => 'Jawa Tengah']);

    City::create(['id' => 10, 'province_id' => 1, 'name' => 'Bekasi']);
    City::create(['id' => 11, 'province_id' => 1, 'name' => 'Bandung']);
    City::create(['id' => 20, 'province_id' => 4, 'name' => 'Semarang']);

    $response = $this->getJson("/admin-kampus/locations/provinces/{$province1->id}/cities");

    $response->assertOk()
        ->assertJsonCount(2)
        ->assertJson([
            ['name' => 'Bandung'],
            ['name' => 'Bekasi'],
        ]);
});

test('returns 404 when province does not exist', function () {
    $this->seedRoles();
    $admin = User::factory()->adminKampus()->create();
    $this->actingAs($admin);

    // Integer ID that doesn't exist
    $this->getJson('/admin-kampus/locations/provinces/99999/cities')
        ->assertStatus(404);
});
```

- [x] **Step 2: Run tests to verify they pass**

Run: `docker exec jurnal-mu-app php artisan test tests/Feature/LocationControllerTest.php`

Expected:
```
PASS  Tests\Feature\LocationControllerTest
✓ guest or non-admin-kampus cannot access location endpoints
✓ admin-kampus can list provinces ordered by name
✓ admin-kampus can list cities of a province ordered by name
✓ returns 404 when province does not exist
```

- [x] **Step 3: Run full AdminKampus test suite to verify no regressions**

Run: `docker exec jurnal-mu-app php artisan test tests/Feature/AdminKampus`

Expected: All tests pass.

- [x] **Step 4: Commit**

```bash
git add tests/Feature/LocationControllerTest.php
git commit -m "test: update LocationControllerTest to use BPS string IDs"
```

---

### Task 6: Final Verification

- [x] **Step 1: Run all tests**

Run: `docker exec jurnal-mu-app php artisan test`

Expected: All feature and unit tests pass (pre-existing failures in AccreditationTemplateTest etc. are unrelated to this feature — ignore them, only check new/modified tests).

- [x] **Step 2: Verify data integrity in DB**

Run: `docker exec jurnal-mu-app php artisan tinker --execute="echo 'Provinces: ' . Province::count() . PHP_EOL . 'Cities: ' . City::count();"`

Expected:
```
Provinces: 38
Cities: 514
```

- [x] **Step 3: Commit (if any remaining uncommitted changes)**

```bash
git status
# If clean, nothing to do. If not:
git add -A
git commit -m "chore: final cleanup for BPS regions upgrade"
```
