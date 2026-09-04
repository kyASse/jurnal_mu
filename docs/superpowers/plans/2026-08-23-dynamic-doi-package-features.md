# Dynamic DOI Package Features & Helpdesk Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menjadikan seluruh butir fasilitas & keuntungan paket DOI, badge rekomendasi, urutan tampil, dan informasi kontak helpdesk sepenuhnya dinamis dan dapat dikelola oleh Superadmin melalui UI.

**Architecture:** Menambahkan kolom `features` (JSON array), `is_featured` (boolean), `badge_text` (string), dan `sort_order` (integer) pada tabel `doi_packages`, serta membuat tabel/model `doi_settings` untuk kontak helpdesk global. Memperbarui FormRequest, Controller, dan seeder Laravel, lalu menghubungkan data tersebut ke Form Repeater Superadmin, Drawer Rincian Paket, dan Kartu Paket di antarmuka pengguna.

**Tech Stack:** Laravel 11 / PHP 8.2+, Inertia.js v2, React 18 / TypeScript, Tailwind CSS v4, shadcn/ui.

---

### File Structure Map

| File Path | Responsibility | Action |
| :--- | :--- | :---: |
| `database/migrations/2026_08_23_000001_add_dynamic_fields_to_doi_packages_table.php` | Migrasi kolom `features`, `is_featured`, `badge_text`, `sort_order` pada `doi_packages` | CREATE |
| `database/migrations/2026_08_23_000002_create_doi_settings_table.php` | Migrasi tabel pengaturan `doi_settings` | CREATE |
| `app/Models/DoiPackage.php` | Model paket DOI dengan casting JSON & scopes | MODIFY |
| `app/Models/DoiSetting.php` | Model pengaturan key-value helpdesk DOI | CREATE |
| `database/seeders/DoiPackageSeeder.php` | Seeder paket awal lengkap dengan `features` & `is_featured` | MODIFY |
| `database/seeders/DoiSettingSeeder.php` | Seeder konfigurasi kontak helpdesk default | CREATE |
| `database/seeders/DatabaseSeeder.php` | Pendaftaran `DoiSettingSeeder` | MODIFY |
| `app/Http/Requests/Doi/Admin/DoiPackageRequest.php` | Validasi array `features`, boolean `is_featured`, `badge_text`, `sort_order` | MODIFY |
| `app/Http/Requests/Doi/Admin/DoiSettingRequest.php` | Validasi input pengaturan helpdesk DOI | CREATE |
| `app/Http/Controllers/Admin/Doi/AdminDoiManagementController.php` | Pass settings ke Superadmin & handle update settings | MODIFY |
| `app/Http/Controllers/AdminKampus/DoiSubscriptionController.php` | Pass `features`, `is_featured`, `badge_text`, `doiSettings` ke dashboard | MODIFY |
| `routes/web.php` | Tambah route `POST /admin/doi-management/settings` | MODIFY |
| `resources/js/types/doi.ts` | Definisi tipe TypeScript `DoiPackageData`, `DoiPackageFormData`, `DoiSettingsData` | MODIFY |
| `resources/js/components/doi/admin/DoiPackageManagementTab.tsx` | UI Superadmin: Dynamic repeater features, toggle featured, badge text, sort order | MODIFY |
| `resources/js/components/doi/admin/DoiHelpdeskSettingsCard.tsx` | UI Superadmin: Form kelola email, hotline, jam kerja helpdesk | CREATE |
| `resources/js/pages/Admin/Doi/Index.tsx` | Tab pengaturan helpdesk & prop integration | MODIFY |
| `resources/js/components/doi/DoiPackageDrawer.tsx` | Render fasilitas dinamis & kontak helpdesk dinamis | MODIFY |
| `resources/js/components/doi/DoiEmptyState.tsx` | Render fasilitas dinamis pada kartu paket, badge rekomendasi dinamis, sort order | MODIFY |

---

### Task 1: Database Migrations

**Files:**
- Create: `database/migrations/2026_08_23_000001_add_dynamic_fields_to_doi_packages_table.php`
- Create: `database/migrations/2026_08_23_000002_create_doi_settings_table.php`

- [ ] **Step 1: Buat file migrasi kolom baru pada `doi_packages`**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doi_packages', function (Blueprint $table) {
            $table->json('features')->nullable()->after('description');
            $table->boolean('is_featured')->default(false)->after('similarity_quota_included');
            $table->string('badge_text', 50)->nullable()->after('is_featured');
            $table->integer('sort_order')->default(0)->after('badge_text');
        });
    }

    public function down(): void
    {
        Schema::table('doi_packages', function (Blueprint $table) {
            $table->dropColumn(['features', 'is_featured', 'badge_text', 'sort_order']);
        });
    }
};
```

- [ ] **Step 2: Buat file migrasi tabel `doi_settings`**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string');
            $table->string('group')->default('general');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_settings');
    }
};
```

- [ ] **Step 3: Jalankan migrasi melalui Docker**

Run: `docker exec -it jurnal-mu-app php artisan migrate`  
Expected: `Migrating: ...add_dynamic_fields_to_doi_packages_table` dan `create_doi_settings_table` successfully migrated.

- [ ] **Step 4: Commit migrasi**

```bash
git add database/migrations/2026_08_23_000001_add_dynamic_fields_to_doi_packages_table.php database/migrations/2026_08_23_000002_create_doi_settings_table.php
git commit -m "feat(doi): add migrations for dynamic package features and doi settings"
```

---

### Task 2: Models and Seeders

**Files:**
- Modify: `app/Models/DoiPackage.php`
- Create: `app/Models/DoiSetting.php`
- Modify: `database/seeders/DoiPackageSeeder.php`
- Create: `database/seeders/DoiSettingSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`

- [ ] **Step 1: Perbarui Model `App\Models\DoiPackage`**

Tambahkan `$fillable` dan `$casts` untuk kolom baru:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DoiPackage extends Model
{
    use HasFactory;

    protected $table = 'doi_packages';

    protected $fillable = [
        'name',
        'slug',
        'code',
        'description',
        'price_annual',
        'prefix_included',
        'similarity_quota_included',
        'is_active',
        'features',
        'is_featured',
        'badge_text',
        'sort_order',
    ];

    protected $casts = [
        'price_annual' => 'decimal:2',
        'prefix_included' => 'boolean',
        'similarity_quota_included' => 'integer',
        'is_active' => 'boolean',
        'features' => 'array',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(DoiSubscription::class, 'doi_package_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('price_annual', 'asc');
    }
}
```

- [ ] **Step 2: Buat Model `App\Models\DoiSetting`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DoiSetting extends Model
{
    use HasFactory;

    protected $table = 'doi_settings';

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
    ];

    /**
     * Get a setting value by key with optional default.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, mixed $value, string $type = 'string', string $group = 'general'): self
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type, 'group' => $group]
        );
    }

    /**
     * Get all DOI settings as key-value array.
     *
     * @return array<string, string|null>
     */
    public static function getAllAsMap(): array
    {
        return static::pluck('value', 'key')->toArray();
    }
}
```

- [ ] **Step 3: Update `DoiPackageSeeder.php` dengan data default lengkap**

```php
<?php

namespace Database\Seeders;

use App\Models\DoiPackage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DoiPackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Paket Mandiri Jurnal',
                'slug' => Str::slug('Paket Mandiri Jurnal'),
                'code' => 'DOI-JOURNAL-SINGLE',
                'description' => 'Paket berlangganan DOI mandiri untuk pengelola jurnal tunggal dengan alokasi kuota uji similaritas 50 dokumen/tahun.',
                'price_annual' => 1500000,
                'prefix_included' => true,
                'similarity_quota_included' => 50,
                'is_active' => true,
                'is_featured' => false,
                'badge_text' => null,
                'sort_order' => 1,
                'features' => [
                    'Prefix Resmi Crossref Atas Nama Institusi',
                    'Deposit DOI Tanpa Batas untuk 1 Jurnal',
                    'Alokasi Kuota Uji Plagiasi 50 Dokumen / Tahun',
                    'Integrasi Metadata Otomatis OJS (OAI-PMH)',
                    'Dukungan Teknis Melalui Email & Tiket Bantuan',
                ],
            ],
            [
                'name' => 'Paket Institusi Basic',
                'slug' => Str::slug('Paket Institusi Basic'),
                'code' => 'DOI-INST-BASIC',
                'description' => 'Paket berlangganan DOI untuk institusi skala dasar dengan alokasi kuota uji similaritas 100 dokumen/tahun.',
                'price_annual' => 3500000,
                'prefix_included' => true,
                'similarity_quota_included' => 100,
                'is_active' => true,
                'is_featured' => false,
                'badge_text' => null,
                'sort_order' => 2,
                'features' => [
                    'Prefix Resmi Crossref Atas Nama Institusi',
                    'Deposit DOI Tanpa Batas untuk Seluruh Jurnal Terdaftar',
                    'Alokasi Kuota Uji Plagiasi 100 Dokumen / Tahun',
                    'Integrasi Metadata Otomatis Melalui OAI-PMH',
                    'Laporan Statistik & Dashboard Sentralisasi Kampus',
                    'Dukungan Teknis Majelis Diktilitbang PPM',
                ],
            ],
            [
                'name' => 'Paket Institusi Standard',
                'slug' => Str::slug('Paket Institusi Standard'),
                'code' => 'DOI-INST-STD',
                'description' => 'Paket berlangganan DOI untuk institusi skala menengah dengan alokasi kuota uji similaritas 250 dokumen/tahun.',
                'price_annual' => 6000000,
                'prefix_included' => true,
                'similarity_quota_included' => 250,
                'is_active' => true,
                'is_featured' => true,
                'badge_text' => 'Populer',
                'sort_order' => 3,
                'features' => [
                    'Prefix Resmi Crossref Atas Nama Institusi',
                    'Deposit DOI Tanpa Batas untuk Seluruh Jurnal Terdaftar',
                    'Alokasi Kuota Uji Plagiasi 250 Dokumen / Tahun',
                    'Integrasi Metadata Otomatis Melalui OAI-PMH',
                    'Laporan Statistik & Dashboard Sentralisasi Kampus',
                    'Dukungan Teknis Prioritas Majelis Diktilitbang PPM',
                    'Pemeliharaan Tahunan & Notifikasi Masa Berakhir Otomatis',
                ],
            ],
            [
                'name' => 'Paket Institusi Premium',
                'slug' => Str::slug('Paket Institusi Premium'),
                'code' => 'DOI-INST-PREM',
                'description' => 'Paket berlangganan DOI untuk institusi skala besar dengan alokasi kuota uji similaritas 500 dokumen/tahun.',
                'price_annual' => 10000000,
                'prefix_included' => true,
                'similarity_quota_included' => 500,
                'is_active' => true,
                'is_featured' => false,
                'badge_text' => 'Eksklusif',
                'sort_order' => 4,
                'features' => [
                    'Prefix Resmi Crossref Atas Nama Institusi',
                    'Deposit DOI Tanpa Batas untuk Seluruh Jurnal Terdaftar',
                    'Alokasi Kuota Uji Plagiasi 500 Dokumen / Tahun',
                    'Integrasi Metadata Otomatis Melalui OAI-PMH',
                    'Laporan Statistik & Dashboard Sentralisasi Kampus',
                    'Dukungan Teknis VIP & Konsultasi Akreditasi SINTA',
                    'Pendampingan Teknis OJS & Migrasi DOI',
                ],
            ],
        ];

        foreach ($packages as $package) {
            DoiPackage::updateOrCreate(
                ['code' => $package['code']],
                $package
            );
        }
    }
}
```

- [ ] **Step 4: Buat `DoiSettingSeeder.php`**

```php
<?php

namespace Database\Seeders;

use App\Models\DoiSetting;
use Illuminate\Database\Seeder;

class DoiSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key' => 'doi_helpdesk_email',
                'value' => 'jurnal@diktilitbangmuhammadiyah.org',
                'type' => 'string',
                'group' => 'helpdesk',
            ],
            [
                'key' => 'doi_helpdesk_phone',
                'value' => '+62 812-3456-7890',
                'type' => 'string',
                'group' => 'helpdesk',
            ],
            [
                'key' => 'doi_helpdesk_hours',
                'value' => 'Senin - Jumat, 08:00 - 16:00 WIB',
                'type' => 'string',
                'group' => 'helpdesk',
            ],
            [
                'key' => 'doi_helpdesk_notes',
                'value' => 'Hubungi Tim Layanan Jurnal & DOI Majelis Diktilitbang Pimpinan Pusat Muhammadiyah jika institusi Anda memerlukan penyesuaian khusus atau mengalami kendala deposit DOI.',
                'type' => 'text',
                'group' => 'helpdesk',
            ],
        ];

        foreach ($settings as $setting) {
            DoiSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
```

- [ ] **Step 5: Daftarkan di `DatabaseSeeder.php` & Jalankan Seeder**

Run: `docker exec -it jurnal-mu-app php artisan db:seed --class=DoiPackageSeeder`  
Run: `docker exec -it jurnal-mu-app php artisan db:seed --class=DoiSettingSeeder`  
Expected: Seeders run without errors.

- [ ] **Step 6: Commit Model & Seeders**

```bash
git add app/Models/DoiPackage.php app/Models/DoiSetting.php database/seeders/DoiPackageSeeder.php database/seeders/DoiSettingSeeder.php database/seeders/DatabaseSeeder.php
git commit -m "feat(doi): add DoiSetting model and updated package seeds with dynamic features"
```

---

### Task 3: Backend FormRequest, Controller & Routes

**Files:**
- Modify: `app/Http/Requests/Doi/Admin/DoiPackageRequest.php`
- Create: `app/Http/Requests/Doi/Admin/DoiSettingRequest.php`
- Modify: `app/Http/Controllers/Admin/Doi/AdminDoiPackageController.php`
- Modify: `app/Http/Controllers/Admin/Doi/AdminDoiManagementController.php`
- Modify: `app/Http/Controllers/AdminKampus/DoiSubscriptionController.php`
- Modify: `routes/web.php`

- [ ] **Step 1: Update `DoiPackageRequest.php`**

Tambahkan validasi:
```php
        return [
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', Rule::unique('doi_packages', 'code')->ignore($packageId)],
            'slug' => ['nullable', 'string', 'max:100', Rule::unique('doi_packages', 'slug')->ignore($packageId)],
            'description' => ['nullable', 'string'],
            'price_annual' => ['required', 'numeric', 'min:0'],
            'prefix_included' => ['boolean'],
            'similarity_quota_included' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'features' => ['nullable', 'array'],
            'features.*' => ['required', 'string', 'max:255'],
            'is_featured' => ['boolean'],
            'badge_text' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
```

- [ ] **Step 2: Update `AdminDoiPackageController.php`**

Tangani default `is_featured`, `features`, `sort_order`, `badge_text`:
```php
        $validated['prefix_included'] = $request->boolean('prefix_included', true);
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['is_featured'] = $request->boolean('is_featured', false);
        $validated['sort_order'] = (int) ($validated['sort_order'] ?? 0);
        $validated['features'] = array_values(array_filter($request->input('features', []) ?? []));
```

- [ ] **Step 3: Buat `DoiSettingRequest.php`**

```php
<?php

namespace App\Http\Requests\Doi\Admin;

use Illuminate\Foundation\Http\FormRequest;

class DoiSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && $user->isSuperAdmin() && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'doi_helpdesk_email' => ['required', 'email', 'max:255'],
            'doi_helpdesk_phone' => ['required', 'string', 'max:50'],
            'doi_helpdesk_hours' => ['nullable', 'string', 'max:100'],
            'doi_helpdesk_notes' => ['nullable', 'string'],
        ];
    }
}
```

- [ ] **Step 4: Update `AdminDoiManagementController.php` & Route `web.php`**

Tambahkan method `updateSettings` dan kirimkan `doiSettings` ke halaman SuperAdmin:
```php
    public function updateSettings(DoiSettingRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            DoiSetting::set($key, $value, 'string', 'helpdesk');
        }

        return back()->with('success', 'Pengaturan helpdesk DOI berhasil diperbarui.');
    }
```
Dan di `routes/web.php`:
```php
Route::post('settings', [AdminDoiManagementController::class, 'updateSettings'])->name('settings.update');
```

- [ ] **Step 5: Update `AdminKampus/DoiSubscriptionController.php`**

Kirimkan `features`, `is_featured`, `badge_text`, `sort_order` pada paket serta kirimkan `doiSettings` ke props Inertia.

- [ ] **Step 6: Commit Controller & Route Changes**

```bash
git add app/Http/Requests/Doi/Admin/DoiPackageRequest.php app/Http/Requests/Doi/Admin/DoiSettingRequest.php app/Http/Controllers/Admin/Doi/AdminDoiPackageController.php app/Http/Controllers/Admin/Doi/AdminDoiManagementController.php app/Http/Controllers/AdminKampus/DoiSubscriptionController.php routes/web.php
git commit -m "feat(doi): add backend controller handling for dynamic package features and settings"
```

---

### Task 4: TypeScript Types

**Files:**
- Modify: `resources/js/types/doi.ts`

- [ ] **Step 1: Update interface `DoiPackageData`, `DoiPackageFormData`, `DoiSettingsData`, `SuperAdminDoiManagementProps`**

Tambahkan field `features?: string[] | null`, `is_featured?: boolean`, `badge_text?: string | null`, `sort_order?: number`, `doiSettings?: DoiSettingsData`.

- [ ] **Step 2: Commit TypeScript types**

```bash
git add resources/js/types/doi.ts
git commit -m "types(doi): update TypeScript interfaces for dynamic package features and helpdesk settings"
```

---

### Task 5: Superadmin UI Components

**Files:**
- Modify: `resources/js/components/doi/admin/DoiPackageManagementTab.tsx`
- Create: `resources/js/components/doi/admin/DoiHelpdeskSettingsCard.tsx`
- Modify: `resources/js/pages/Admin/Doi/Index.tsx`

- [ ] **Step 1: Perbarui modal input paket di `DoiPackageManagementTab.tsx`**

Tambahkan:
- Dynamic Item Repeater untuk list `features` (Input string per baris, tombol hapus ikon tong sampah, tombol "+ Tambah Fasilitas").
- Toggle Switch `is_featured` ("Paket Unggulan / Rekomendasi").
- Input text `badge_text` ("Label Badge Kustom").
- Input number `sort_order` ("Urutan Tampilan").
- Kolom tabel menampilkan badge `is_featured` & jumlah butir fasilitas.

- [ ] **Step 2: Buat komponen `DoiHelpdeskSettingsCard.tsx`**

Form input untuk mengelola:
- Email Layanan DOI (`doi_helpdesk_email`)
- Hotline Telepon/WA (`doi_helpdesk_phone`)
- Jam Kerja Layanan (`doi_helpdesk_hours`)
- Catatan / Pengantar Bantuan (`doi_helpdesk_notes`)

- [ ] **Step 3: Update `Admin/Doi/Index.tsx`**

Tampilkan `DoiHelpdeskSettingsCard` di samping/bawah tab paket atau di tab baru.

- [ ] **Step 4: Verifikasi build frontend**

Run: `npm run build` or `npx tsc --noEmit`  
Expected: TypeScript compile clean without errors.

- [ ] **Step 5: Commit Superadmin UI**

```bash
git add resources/js/components/doi/admin/DoiPackageManagementTab.tsx resources/js/components/doi/admin/DoiHelpdeskSettingsCard.tsx resources/js/pages/Admin/Doi/Index.tsx
git commit -m "feat(doi): add superadmin UI for dynamic package features repeater and helpdesk settings"
```

---

### Task 6: User & Admin Kampus UI (`DoiPackageDrawer.tsx` & `DoiEmptyState.tsx`)

**Files:**
- Modify: `resources/js/components/doi/DoiPackageDrawer.tsx`
- Modify: `resources/js/components/doi/DoiEmptyState.tsx`
- Modify: `resources/js/pages/AdminKampus/Doi/Dashboard.tsx`
- Modify: `resources/js/pages/User/Doi/Dashboard.tsx`

- [ ] **Step 1: Update `DoiPackageDrawer.tsx`**

1. Ambil `currentPackage?.features` jika tersedia (fallback ke default jika null/kosong).
2. Ambil informasi email, hotline, dan deskripsi bantuan dari props `doiSettings` atau default fallback.
3. Render list `<li>` secara dinamis.

- [ ] **Step 2: Update `DoiEmptyState.tsx`**

1. Ganti hardcoded `isFeatured` regex dengan `pkg.is_featured`.
2. Gunakan `pkg.badge_text || 'Rekomendasi'` sebagai text badge kartu rekomendasi.
3. Render fasilitas kartu dari `pkg.features` (fallback default jika kosong).
4. Pastikan paket diurutkan sesuai `sort_order`.

- [ ] **Step 3: Hubungkan `doiSettings` di Dashboard Admin Kampus & User**

Pass `doiSettings` ke `DoiPackageDrawer`.

- [ ] **Step 4: Build & compile frontend**

Run: `npm run build`  
Expected: Build success with 0 errors.

- [ ] **Step 5: Commit User UI**

```bash
git add resources/js/components/doi/DoiPackageDrawer.tsx resources/js/components/doi/DoiEmptyState.tsx resources/js/pages/AdminKampus/Doi/Dashboard.tsx resources/js/pages/User/Doi/Dashboard.tsx
git commit -m "feat(doi): connect dynamic package features and helpdesk settings to drawer and empty state UI"
```

---

### Task 7: End-to-End Verification & Testing

**Files:**
- Create: `tests/Feature/Admin/Doi/AdminDoiPackageDynamicFeaturesTest.php`

- [ ] **Step 1: Buat feature test PHPUnit / Pest**

Uji bahwa:
1. Superadmin dapat membuat paket dengan `features` array, `is_featured`, `badge_text`, dan `sort_order`.
2. Superadmin dapat mengupdate pengaturan helpdesk DOI.
3. Admin Kampus & User menerima data paket dengan `features` dinamis dan `doiSettings`.

- [ ] **Step 2: Jalankan test**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Feature/Admin/Doi/AdminDoiPackageDynamicFeaturesTest.php`  
Expected: All tests pass.

- [ ] **Step 3: Commit verification test**

```bash
git add tests/Feature/Admin/Doi/AdminDoiPackageDynamicFeaturesTest.php
git commit -m "test(doi): add automated feature tests for dynamic package features and helpdesk settings"
```
