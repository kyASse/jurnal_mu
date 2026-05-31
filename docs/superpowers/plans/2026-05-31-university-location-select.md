# Standardized City and Province Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users editing a university profile to select standard cities and provinces from dropdowns populated from the database.

**Architecture:** Create `provinces` and `cities` tables, seed them via a JSON data file, build API endpoints to fetch provinces and cascading cities, and update the React frontend select controls.

**Tech Stack:** Laravel, React, Inertia, Pest (Testing)

---

### Task 1: Create Database Migration
**Files:**
- Create: `database/migrations/2026_05_31_140000_create_provinces_and_cities_tables.php`

- [ ] **Step 1: Write migration code**
Create the migration file for `provinces` and `cities` tables.
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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

    public function down(): void
    {
        Schema::dropIfExists('cities');
        Schema::dropIfExists('provinces');
    }
};
```

- [ ] **Step 2: Run migration to verify it works**
Run: `docker exec jurnal-mu-app php artisan migrate`
Expected: Migration runs successfully and tables are created.

- [ ] **Step 3: Commit**
```bash
git add database/migrations/2026_05_31_140000_create_provinces_and_cities_tables.php
git commit -m "migration: create provinces and cities tables"
```

---

### Task 2: Create Region Data JSON File
**Files:**
- Create: `database/data/indonesian_regions.json`

- [ ] **Step 1: Write JSON content**
Write a file containing Indonesian provinces and major cities.
```json
[
  {
    "id": 1,
    "name": "Aceh",
    "cities": [
      { "id": 11, "name": "Banda Aceh" },
      { "id": 12, "name": "Sabang" },
      { "id": 13, "name": "Lhokseumawe" }
    ]
  },
  {
    "id": 2,
    "name": "Sumatera Utara",
    "cities": [
      { "id": 21, "name": "Medan" },
      { "id": 22, "name": "Binjai" },
      { "id": 23, "name": "Pematangsiantar" }
    ]
  },
  {
    "id": 3,
    "name": "Sumatera Barat",
    "cities": [
      { "id": 31, "name": "Padang" },
      { "id": 32, "name": "Bukittinggi" }
    ]
  },
  {
    "id": 4,
    "name": "Riau",
    "cities": [
      { "id": 41, "name": "Pekanbaru" },
      { "id": 42, "name": "Dumai" }
    ]
  },
  {
    "id": 5,
    "name": "Kepulauan Riau",
    "cities": [
      { "id": 51, "name": "Tanjungpinang" },
      { "id": 52, "name": "Batam" }
    ]
  },
  {
    "id": 6,
    "name": "Jambi",
    "cities": [
      { "id": 61, "name": "Jambi" },
      { "id": 62, "name": "Sungai Penuh" }
    ]
  },
  {
    "id": 7,
    "name": "Bengkulu",
    "cities": [
      { "id": 71, "name": "Bengkulu" }
    ]
  },
  {
    "id": 8,
    "name": "Sumatera Selatan",
    "cities": [
      { "id": 81, "name": "Palembang" },
      { "id": 82, "name": "Lubuklinggau" }
    ]
  },
  {
    "id": 9,
    "name": "Kepulauan Bangka Belitung",
    "cities": [
      { "id": 91, "name": "Pangkalpinang" }
    ]
  },
  {
    "id": 10,
    "name": "Lampung",
    "cities": [
      { "id": 101, "name": "Bandar Lampung" },
      { "id": 102, "name": "Metro" }
    ]
  },
  {
    "id": 11,
    "name": "DKI Jakarta",
    "cities": [
      { "id": 111, "name": "Jakarta Pusat" },
      { "id": 112, "name": "Jakarta Utara" },
      { "id": 113, "name": "Jakarta Barat" },
      { "id": 114, "name": "Jakarta Selatan" },
      { "id": 115, "name": "Jakarta Timur" }
    ]
  },
  {
    "id": 12,
    "name": "Banten",
    "cities": [
      { "id": 121, "name": "Serang" },
      { "id": 122, "name": "Tangerang" },
      { "id": 123, "name": "Cilegon" },
      { "id": 124, "name": "Tangerang Selatan" }
    ]
  },
  {
    "id": 13,
    "name": "Jawa Barat",
    "cities": [
      { "id": 131, "name": "Bandung" },
      { "id": 132, "name": "Bogor" },
      { "id": 133, "name": "Depok" },
      { "id": 134, "name": "Bekasi" },
      { "id": 135, "name": "Cirebon" },
      { "id": 136, "name": "Sukabumi" },
      { "id": 137, "name": "Tasikmalaya" },
      { "id": 138, "name": "Garut" },
      { "id": 139, "name": "Sumedang" }
    ]
  },
  {
    "id": 14,
    "name": "Jawa Tengah",
    "cities": [
      { "id": 141, "name": "Semarang" },
      { "id": 142, "name": "Surakarta" },
      { "id": 143, "name": "Magelang" },
      { "id": 144, "name": "Pekalongan" },
      { "id": 145, "name": "Salatiga" },
      { "id": 146, "name": "Tegal" },
      { "id": 147, "name": "Kudus" },
      { "id": 148, "name": "Banyumas" }
    ]
  },
  {
    "id": 15,
    "name": "DI Yogyakarta",
    "cities": [
      { "id": 151, "name": "Yogyakarta" },
      { "id": 152, "name": "Sleman" },
      { "id": 153, "name": "Bantul" },
      { "id": 154, "name": "Kulon Progo" },
      { "id": 155, "name": "Gunungkidul" }
    ]
  },
  {
    "id": 16,
    "name": "Jawa Timur",
    "cities": [
      { "id": 161, "name": "Surabaya" },
      { "id": 162, "name": "Malang" },
      { "id": 163, "name": "Kediri" },
      { "id": 164, "name": "Madiun" },
      { "id": 165, "name": "Mojokerto" },
      { "id": 166, "name": "Pasuruan" },
      { "id": 167, "name": "Probolinggo" },
      { "id": 168, "name": "Batu" },
      { "id": 169, "name": "Jember" },
      { "id": 170, "name": "Sidoarjo" },
      { "id": 171, "name": "Gresik" }
    ]
  },
  {
    "id": 17,
    "name": "Bali",
    "cities": [
      { "id": 171, "name": "Denpasar" },
      { "id": 172, "name": "Badung" }
    ]
  },
  {
    "id": 18,
    "name": "Nusa Tenggara Barat",
    "cities": [
      { "id": 181, "name": "Mataram" },
      { "id": 182, "name": "Bima" }
    ]
  },
  {
    "id": 19,
    "name": "Nusa Tenggara Timur",
    "cities": [
      { "id": 191, "name": "Kupang" }
    ]
  },
  {
    "id": 20,
    "name": "Kalimantan Barat",
    "cities": [
      { "id": 201, "name": "Pontianak" },
      { "id": 202, "name": "Singkawang" }
    ]
  },
  {
    "id": 21,
    "name": "Kalimantan Tengah",
    "cities": [
      { "id": 211, "name": "Palangkaraya" }
    ]
  },
  {
    "id": 22,
    "name": "Kalimantan Selatan",
    "cities": [
      { "id": 221, "name": "Banjarmasin" },
      { "id": 222, "name": "Banjarbaru" }
    ]
  },
  {
    "id": 23,
    "name": "Kalimantan Timur",
    "cities": [
      { "id": 231, "name": "Samarinda" },
      { "id": 232, "name": "Balikpapan" },
      { "id": 233, "name": "Bontang" }
    ]
  },
  {
    "id": 24,
    "name": "Kalimantan Utara",
    "cities": [
      { "id": 241, "name": "Tarakan" }
    ]
  },
  {
    "id": 25,
    "name": "Sulawesi Utara",
    "cities": [
      { "id": 251, "name": "Manado" },
      { "id": 252, "name": "Bitung" },
      { "id": 253, "name": "Tomohon" }
    ]
  },
  {
    "id": 26,
    "name": "Gorontalo",
    "cities": [
      { "id": 261, "name": "Gorontalo" }
    ]
  },
  {
    "id": 27,
    "name": "Sulawesi Tengah",
    "cities": [
      { "id": 271, "name": "Palu" }
    ]
  },
  {
    "id": 28,
    "name": "Sulawesi Barat",
    "cities": [
      { "id": 281, "name": "Mamuju" }
    ]
  },
  {
    "id": 29,
    "name": "Sulawesi Selatan",
    "cities": [
      { "id": 291, "name": "Makassar" },
      { "id": 292, "name": "Parepare" },
      { "id": 293, "name": "Palopo" }
    ]
  },
  {
    "id": 30,
    "name": "Sulawesi Tenggara",
    "cities": [
      { "id": 301, "name": "Kendari" },
      { "id": 302, "name": "Bau-Bau" }
    ]
  },
  {
    "id": 31,
    "name": "Maluku",
    "cities": [
      { "id": 311, "name": "Ambon" },
      { "id": 312, "name": "Tual" }
    ]
  },
  {
    "id": 32,
    "name": "Maluku Utara",
    "cities": [
      { "id": 321, "name": "Ternate" },
      { "id": 322, "name": "Tidore Kepulauan" }
    ]
  },
  {
    "id": 33,
    "name": "Papua",
    "cities": [
      { "id": 331, "name": "Jayapura" }
    ]
  },
  {
    "id": 34,
    "name": "Papua Barat",
    "cities": [
      { "id": 341, "name": "Manokwari" }
    ]
  },
  {
    "id": 35,
    "name": "Papua Tengah",
    "cities": [
      { "id": 351, "name": "Nabire" }
    ]
  },
  {
    "id": 36,
    "name": "Papua Pegunungan",
    "cities": [
      { "id": 361, "name": "Wamena" }
    ]
  },
  {
    "id": 37,
    "name": "Papua Selatan",
    "cities": [
      { "id": 371, "name": "Merauke" }
    ]
  },
  {
    "id": 38,
    "name": "Papua Barat Daya",
    "cities": [
      { "id": 381, "name": "Sorong" }
    ]
  }
]
```

- [ ] **Step 2: Commit**
```bash
git add database/data/indonesian_regions.json
git commit -m "database: add indonesian regions JSON dataset"
```

---

### Task 3: Create Models `Province` and `City`
**Files:**
- Create: `app/Models/Province.php`
- Create: `app/Models/City.php`

- [ ] **Step 1: Write `Province` Model**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Province extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }
}
```

- [ ] **Step 2: Write `City` Model**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class City extends Model
{
    use HasFactory;

    protected $fillable = ['province_id', 'name'];

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }
}
```

- [ ] **Step 3: Commit**
```bash
git add app/Models/Province.php app/Models/City.php
git commit -m "model: create Province and City Eloquent models"
```

---

### Task 4: Create Seeder Class
**Files:**
- Create: `database/seeders/IndonesianRegionsSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`

- [ ] **Step 1: Write Seeder code**
Create `IndonesianRegionsSeeder` to parse JSON and seed database.
```php
<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Province;
use Illuminate\Database\Seeder;

class IndonesianRegionsSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/indonesian_regions.json');

        if (! file_exists($jsonPath)) {
            $this->command->error("JSON file not found at: {$jsonPath}");
            return;
        }

        $regions = json_decode(file_get_contents($jsonPath), true);

        foreach ($regions as $provinceData) {
            $province = Province::updateOrCreate(
                ['id' => $provinceData['id']],
                ['name' => $provinceData['name']]
            );

            foreach ($provinceData['cities'] as $cityData) {
                City::updateOrCreate(
                    ['id' => $cityData['id']],
                    [
                        'province_id' => $province->id,
                        'name' => $cityData['name'],
                    ]
                );
            }
        }
    }
}
```

- [ ] **Step 2: Add Seeder to DatabaseSeeder**
Modify `DatabaseSeeder.php` (around lines 15-30) to include the new seeder.
```php
        $this->call([
            RoleSeeder::class,
            ScientificFieldSeeder::class,
            IndonesianRegionsSeeder::class, // Add this
            UniversitySeeder::class,
            UserSeeder::class,
            // ...
        ]);
```

- [ ] **Step 3: Run seeder and verify**
Run: `docker exec jurnal-mu-app php artisan db:seed --class=IndonesianRegionsSeeder`
Expected: Seed runs successfully with no errors.

- [ ] **Step 4: Commit**
```bash
git add database/seeders/IndonesianRegionsSeeder.php database/seeders/DatabaseSeeder.php
git commit -m "seeder: create IndonesianRegionsSeeder and add to DatabaseSeeder"
```

---

### Task 5: Create API Endpoints
**Files:**
- Create: `app/Http/Controllers/LocationController.php`
- Modify: `routes/web.php:349-360` (or inside auth routing middleware group)

- [ ] **Step 1: Write LocationController**
```php
<?php

namespace App\Http\Controllers;

use App\Models\Province;
use App\Models\City;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function provinces(): JsonResponse
    {
        return response()->json(
            Province::orderBy('name')->get(['id', 'name'])
        );
    }

    public function cities(int $provinceId): JsonResponse
    {
        return response()->json(
            City::where('province_id', $provinceId)->orderBy('name')->get(['id', 'name'])
        );
    }
}
```

- [ ] **Step 2: Add API Routes to routes/web.php**
Register routes inside the authenticated/admin-kampus group.
```php
        // API Location lookup
        Route::get('locations/provinces', [App\Http\Controllers\LocationController::class, 'provinces'])
            ->name('locations.provinces');
        Route::get('locations/provinces/{province}/cities', [App\Http\Controllers\LocationController::class, 'cities'])
            ->name('locations.cities');
```

- [ ] **Step 3: Commit**
```bash
git add app/Http/Controllers/LocationController.php routes/web.php
git commit -m "route: implement API endpoints for provinces and cities lookup"
```

---

### Task 6: Implement Location Endpoint Tests
**Files:**
- Create: `tests/Feature/LocationControllerTest.php`

- [ ] **Step 1: Write test file**
```php
<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Province;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminKampus;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);

        $university = University::factory()->create();
        $adminKampusRole = Role::where('name', Role::ADMIN_KAMPUS)->first();

        $this->adminKampus = User::factory()->create([
            'role_id' => $adminKampusRole->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        $province = Province::create(['id' => 1, 'name' => 'DIY']);
        City::create(['id' => 10, 'province_id' => $province->id, 'name' => 'Yogyakarta']);
    }

    public function test_authenticated_user_can_fetch_provinces(): void
    {
        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin-kampus.locations.provinces'));

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'DIY']);
    }

    public function test_authenticated_user_can_fetch_cities(): void
    {
        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin-kampus.locations.cities', 1));

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Yogyakarta']);
    }

    public function test_unauthenticated_user_is_blocked_from_fetching_locations(): void
    {
        $response = $this->get(route('admin-kampus.locations.provinces'));
        $response->assertRedirect(route('login'));
    }
}
```

- [ ] **Step 2: Run test suite**
Run: `docker exec jurnal-mu-app php artisan test tests/Feature/LocationControllerTest.php`
Expected: PASS

- [ ] **Step 3: Commit**
```bash
git add tests/Feature/LocationControllerTest.php
git commit -m "test: write location controller features test"
```

---

### Task 7: Update Frontend Component
**Files:**
- Modify: `resources/js/pages/AdminKampus/University/Edit.tsx`

- [ ] **Step 1: Implement dynamic fetching and select controls in Edit.tsx**
Add API fetch logic using standard React fetch API inside `useEffect` hooks. Replace manual input fields for city & province with `<select>` components.

Modify the imports at the top of the file:
```typescript
import { useEffect, useState } from 'react';
```

Add states inside the `Edit` component body:
```typescript
    const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);
    const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
```

Add `useEffect` to fetch provinces on mount:
```typescript
    useEffect(() => {
        setIsLoadingProvinces(true);
        fetch(route('admin-kampus.locations.provinces'))
            .then(res => res.json())
            .then(data => {
                setProvinces(data);
                setIsLoadingProvinces(false);
            })
            .catch(() => setIsLoadingProvinces(false));
    }, []);
```

Add `useEffect` to fetch cities if a province is already set on page load:
```typescript
    useEffect(() => {
        if (provinces.length === 0 || !data.province) return;
        const matchingProv = provinces.find(p => p.name.toLowerCase() === data.province.toLowerCase());
        if (matchingProv) {
            setIsLoadingCities(true);
            fetch(route('admin-kampus.locations.cities', matchingProv.id))
                .then(res => res.json())
                .then(cityData => {
                    setCities(cityData);
                    setIsLoadingCities(false);
                })
                .catch(() => setIsLoadingCities(false));
        } else {
            setCities([]);
        }
    }, [provinces, data.province]);
```

Modify the inputs for city and province inside the JSX:
Replace:
```tsx
                                        <div>
                                            <Label htmlFor="province">Provinsi</Label>
                                            <Input
                                                id="province"
                                                value={data.province}
                                                onChange={(e) => setData('province', e.target.value)}
                                                className="mt-1"
                                            />
                                            <InputError message={errors.province} className="mt-2" />
                                        </div>
```
With:
```tsx
                                        <div>
                                            <Label htmlFor="province">Provinsi</Label>
                                            <select
                                                id="province"
                                                value={data.province}
                                                onChange={(e) => {
                                                    const selectedName = e.target.value;
                                                    setData((prev) => ({
                                                        ...prev,
                                                        province: selectedName,
                                                        city: '', // reset city
                                                    }));
                                                }}
                                                disabled={isLoadingProvinces}
                                                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                            >
                                                <option value="">Pilih Provinsi</option>
                                                {provinces.map((prov) => (
                                                    <option key={prov.id} value={prov.name}>
                                                        {prov.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.province} className="mt-2" />
                                        </div>
```

And replace:
```tsx
                                        <div>
                                            <Label htmlFor="city">Kota/Kabupaten</Label>
                                            <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} className="mt-1" />
                                            <InputError message={errors.city} className="mt-2" />
                                        </div>
```
With:
```tsx
                                        <div>
                                            <Label htmlFor="city">Kota/Kabupaten</Label>
                                            <select
                                                id="city"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                disabled={isLoadingCities || !data.province}
                                                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                            >
                                                <option value="">Pilih Kota/Kabupaten</option>
                                                {cities.map((ct) => (
                                                    <option key={ct.id} value={ct.name}>
                                                        {ct.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.city} className="mt-2" />
                                        </div>
```

- [ ] **Step 2: Verify compilation and tests**
Run: `npm run types`
Run: `docker exec jurnal-mu-app php artisan test tests/Feature/AdminKampus`
Expected: Typescript compilation succeeds. All feature tests pass.

- [ ] **Step 3: Commit**
```bash
git add resources/js/pages/AdminKampus/University/Edit.tsx
git commit -m "feat: replace province and city inputs with dynamic cascading select fields"
```
