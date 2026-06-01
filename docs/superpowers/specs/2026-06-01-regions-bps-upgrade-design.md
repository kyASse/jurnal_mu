# Design Spec: Upgrade Region Data to BPS Official Dataset

**Date:** 2026-06-01  
**Branch:** feature/add-provincies-and-cities-data-master  
**Status:** Approved for implementation

---

## Goal

Replace the current hand-crafted 97-city JSON dataset with the full official BPS (Badan Pusat Statistik) dataset of 38 provinces and 514 kabupaten/kota, sourced from `https://api-regional-indonesia.vercel.app`.

Data is fetched once via an artisan command and stored locally as JSON. The seeder reads from that JSON — no runtime dependency on the external API.

---

## Architecture

```
[Artisan Command: regions:fetch]
        │
        ▼
[database/data/indonesian_regions.json]  ← overwritten with BPS data
        │
        ▼
[IndonesianRegionsSeeder]
        │
        ▼
[provinces table] ←── string BPS ID ("11", "12", ...)
[cities table]    ←── string BPS ID ("1101", "1102", ...)
        │
        ▼
[LocationController → /api/locations/provinces + /cities/{province}]
        │
        ▼
[Edit.tsx cascading selects] ← no change needed
```

---

## Components

### 1. Artisan Command — `regions:fetch`

**File:** `app/Console/Commands/FetchIndonesianRegionsCommand.php`  
**Signature:** `regions:fetch`

**Behavior:**
1. `GET https://api-regional-indonesia.vercel.app/api/provinces?sort=name` → 38 provinces
2. For each province, `GET /api/cities/{provinceId}?sort=name` → kabupaten/kota list
3. Strip prefix `"Kabupaten "` and `"Kota "` from city names before saving
4. Merge into unified array structure matching existing seeder JSON format
5. Overwrite `database/data/indonesian_regions.json`
6. Print progress per province to console: `Fetching Aceh... (23 cities)`

**Error handling:**
- If HTTP response is not 200 or `data` key is missing/null: throw `RuntimeException` with message indicating which endpoint failed
- Wrap all HTTP calls in try/catch; on failure abort with `$this->error(...)` and exit code 1

**Output JSON format:**
```json
[
  {
    "id": "11",
    "name": "Aceh",
    "cities": [
      { "id": "1101", "name": "Simeulue" },
      { "id": "1171", "name": "Banda Aceh" }
    ]
  }
]
```

**Name stripping rules:**
- Remove leading `"Kabupaten "` (with trailing space)
- Remove leading `"Kota "` (with trailing space)
- Preserve original name if neither prefix matches

---

### 2. Migration — Drop & Recreate with String BPS IDs

**File:** `database/migrations/2026_06_01_000000_recreate_provinces_and_cities_with_bps_codes.php`

**`up()` method:**
1. Drop `cities` table (FK-dependent, must be dropped first)
2. Drop `provinces` table
3. Recreate `provinces` with `string('id', 10)->primary()`
4. Recreate `cities` with `string('id', 10)->primary()` and `string('province_id', 10)` FK

**`down()` method:**
Reverse — recreate integer ID versions (matching original migration schema).

**Schema:**
```php
// provinces
Schema::create('provinces', function (Blueprint $table) {
    $table->string('id', 10)->primary();
    $table->string('name', 100);
    $table->timestamps();
});

// cities
Schema::create('cities', function (Blueprint $table) {
    $table->string('id', 10)->primary();
    $table->string('province_id', 10);
    $table->foreign('province_id')->references('id')->on('provinces')->cascadeOnDelete();
    $table->string('name', 100);
    $table->timestamps();
});
```

---

### 3. Model Updates — `Province` and `City`

Add to both models:
```php
public $incrementing = false;
protected $keyType = 'string';
```

`$fillable` remains unchanged. `unguard()`/`reguard()` in seeder still handles `id` assignment.

---

### 4. Seeder — `IndonesianRegionsSeeder`

No structural change. Reads from `database/data/indonesian_regions.json`. The JSON now contains string BPS IDs — the seeder passes them through as-is via `updateOrCreate`.

No new logic needed.

---

### 5. Test Updates

**`ProvinceCityTest`:**
- Change sample `id` values from integers to BPS strings: `'id' => '11'` for province, `'id' => '1101'` for city

**`LocationControllerTest`:**
- Change `Province::create(['id' => 1, ...])` → `Province::create(['id' => '11', ...])`
- Change `City::create(['id' => 10, ...])` → `City::create(['id' => '1101', ...])`
- Update route param: `route('admin-kampus.locations.cities', '11')`

---

### 6. Frontend — `Edit.tsx`

**No changes required.** The cascading dropdown already matches provinces by name (not ID). With more cities available, users simply get a fuller list. No API contract changes — `LocationController` returns same `{id, name}` shape.

---

## Data Flow — Seeding

```
php artisan regions:fetch
  → writes database/data/indonesian_regions.json (38 provinces, 514 cities)

php artisan migrate
  → runs new migration (drop & recreate string-ID tables)

php artisan db:seed --class=IndonesianRegionsSeeder
  → reads JSON, seeds provinces + cities with BPS string IDs
```

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| API unreachable during `regions:fetch` | Command exits with error message, JSON not overwritten |
| API returns non-array `data` | Command throws RuntimeException, exits with code 1 |
| JSON file missing when seeder runs | Seeder prints error and returns early (existing behavior) |
| Invalid province ID in route | 404 via route model binding (existing behavior) |

---

## Testing Strategy

- Unit: `ProvinceCityTest` — model creation, fillable, relationships (string IDs)
- Feature: `LocationControllerTest` — auth access, JSON structure, 404 on invalid province
- Command: Manual run `php artisan regions:fetch` in Docker, verify JSON output
- Integration: `php artisan test tests/Feature/AdminKampus` — no regressions

---

## Out of Scope

- Kecamatan (district) and Desa/Kelurahan (village) levels — not needed for university profile
- UI search/autocomplete for city dropdown — current `<select>` sufficient at 514 items
- Caching of API responses beyond local JSON file
