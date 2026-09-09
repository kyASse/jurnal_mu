# Spesifikasi Desain: Dinamisasi Fasilitas & Pengaturan Paket Langganan DOI

**Tanggal**: 23 Agustus 2026  
**Status**: Approved (Siap Implementasi)  
**Dokumen Terkait**: [PRD Langganan DOI](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/PRD.md) | [SCHEMA.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/SCHEMA.md)

---

## 1. Latar Belakang & Masalah

Pada modul Langganan DOI saat ini:
1. **Daftar Fasilitas / Keuntungan Paket (`DoiPackageDrawer.tsx` & `DoiEmptyState.tsx`)** masih ditulis statis (*hardcoded*) di komponen React/TSX.
2. **Kontak Helpdesk & Dukungan Teknis** (email & hotline telepon) masih tertulis statis di komponen UI drawer.
3. **Badge Rekomendasi Paket** masih menggunakan logika statis berbasis pencarian kata `gold` atau `platinum` pada kode paket (`pkg.code`).
4. Superadmin belum memiliki kendali penuh untuk menambah, mengubah, atau menghapus butir fasilitas/keuntungan per paket, menentukan paket unggulan/rekomendasi, dan mengatur kontak helpdesk pusat.

---

## 2. Sasaran & Ruang Lingkup

1. **Dinamisasi Poin Fasilitas/Keuntungan (`features`)**:
   * Setiap paket memiliki daftar butir fasilitas berupa array teks yang dapat dikelola via UI Superadmin.
   * Format penyimpanan JSON array di tabel `doi_packages`.
2. **Badge Rekomendasi & Urutan Tampil (`is_featured`, `badge_text`, `sort_order`)**:
   * Superadmin dapat menandai paket unggulan (*Featured*) dan menentukan label badge kustom (misal: "Rekomendasi", "Paling Diminati", "Hemat").
   * Superadmin dapat mengatur urutan prioritas tampil paket (*Sort Order*).
3. **Pengaturan Global Kontak Helpdesk DOI**:
   * Superadmin dapat mengatur Email Helpdesk, Nomor Telepon/WhatsApp Hotline, dan Jam Layanan secara terpusat melalui form pengaturan DOI.
4. **Konsistensi UI Pengguna**:
   * Komponen `DoiPackageDrawer.tsx` dan `DoiEmptyState.tsx` merender data fasilitas, badge rekomendasi, dan informasi kontak secara dinamis sesuai data dari backend.

---

## 3. Desain Arsitektur & Skema Database

### 3.1 Perubahan Tabel `doi_packages`
Migrasi database baru untuk menambahkan kolom-kolom berikut:

```php
Schema::table('doi_packages', function (Blueprint $table) {
    $table->json('features')->nullable()->after('description');
    $table->boolean('is_featured')->default(false)->after('similarity_quota_included');
    $table->string('badge_text', 50)->nullable()->after('is_featured');
    $table->integer('sort_order')->default(0)->after('badge_text');
});
```

### 3.2 Tabel Konfigurasi / Pengaturan DOI (`doi_settings`)
Tabel untuk menyimpan konfigurasi helpdesk global:

```php
Schema::create('doi_settings', function (Blueprint $table) {
    $table->id();
    $table->string('key')->unique();
    $table->text('value')->nullable();
    $table->string('type')->default('string'); // string, text, boolean, json
    $table->string('group')->default('general');
    $table->timestamps();
});
```

Kunci konfigurasi default:
* `doi_helpdesk_email`: `jurnal@diktilitbangmuhammadiyah.org`
* `doi_helpdesk_phone`: `+62 812-3456-7890`
* `doi_helpdesk_hours`: `Senin - Jumat, 08:00 - 16:00 WIB`
* `doi_helpdesk_notes`: `Hubungi Tim Layanan Jurnal & DOI Majelis Diktilitbang Pimpinan Pusat Muhammadiyah jika institusi Anda memerlukan penyesuaian khusus atau mengalami kendala deposit DOI.`

---

## 4. Perubahan Backend (Laravel)

### 4.1 Model `App\Models\DoiPackage`
* Menambahkan kolom baru pada `$fillable`:
  `'features'`, `'is_featured'`, `'badge_text'`, `'sort_order'`.
* Menambahkan casting pada `$casts`:
  * `'features' => 'array'`
  * `'is_featured' => 'boolean'`
  * `'sort_order' => 'integer'`
* Scope query helper:
  * `scopeOrdered($query)`: `->orderBy('sort_order', 'asc')->orderBy('id', 'asc')`.

### 4.2 Model `App\Models\DoiSetting`
* Helper methods:
  * `DoiSetting::get(string $key, mixed $default = null)`
  * `DoiSetting::set(string $key, mixed $value)`
  * `DoiSetting::getAllAsMap()`

### 4.3 Form Request `App\Http\Requests\Doi\Admin\DoiPackageRequest`
* Aturan validasi:
  * `'features'` => `['nullable', 'array']`
  * `'features.*'` => `['required', 'string', 'max:255']`
  * `'is_featured'` => `['boolean']`
  * `'badge_text'` => `['nullable', 'string', 'max:50']`
  * `'sort_order'` => `['nullable', 'integer', 'min:0']`

### 4.4 Form Request & Controller Setting `App\Http\Controllers\Admin\Doi\AdminDoiSettingController`
* Endpoint untuk memperbarui setting kontak helpdesk DOI (`POST /admin/doi-management/settings`).

### 4.5 Seeders (`DoiPackageSeeder.php` & `DoiSettingSeeder.php`)
* Mengisi data default paket dengan `features` lengkap, contoh:
  * **Paket Institusi Basic**:
    * Prefix Resmi Crossref Atas Nama Institusi
    * Deposit DOI Tanpa Batas (Unlimited) untuk Seluruh Jurnal Terdaftar
    * Alokasi Kuota Uji Plagiasi 100 Dokumen / Periode
    * Integrasi Metadata Otomatis Melalui OAI-PMH
    * Laporan Statistik & Dashboard Sentralisasi Kampus
  * **Paket Institusi Standard**:
    * Poin di atas + Kuota Plagiasi 250 Dokumen + Prioritas Bantuan Teknis
  * **Paket Institusi Premium** (`is_featured: true`, `badge_text: 'Rekomendasi'`):
    * Poin di atas + Kuota Plagiasi 500 Dokumen + Pendampingan Indeksasi & Migrasi OJS
* Mengisi data default `doi_settings` helpdesk.

---

## 5. Perubahan Frontend (React / Inertia / TypeScript)

### 5.1 Definisi Tipe (`resources/js/types/doi.ts`)
* Update `DoiPackageData`:
  ```typescript
  export interface DoiPackageData {
      id: number;
      name: string;
      slug: string;
      code: string;
      description: string | null;
      price_annual: number | string;
      prefix_included: boolean;
      similarity_quota_included: number;
      is_active: boolean;
      features?: string[] | null;
      is_featured?: boolean;
      badge_text?: string | null;
      sort_order?: number;
      created_at?: string;
      updated_at?: string;
  }
  ```
* Tambah tipe `DoiSettingsData`:
  ```typescript
  export interface DoiSettingsData {
      doi_helpdesk_email?: string;
      doi_helpdesk_phone?: string;
      doi_helpdesk_hours?: string;
      doi_helpdesk_notes?: string;
  }
  ```

### 5.2 Superadmin Panel (`DoiPackageManagementTab.tsx`)
* Tambah Item Repeater untuk mengelola list `features`:
  * Tombol "+ Tambah Fasilitas / Keuntungan"
  * Baris input string dengan tombol ikon hapus (`Trash2`)
  * Input placeholder deskriptif
* Tambah Switch toggle `is_featured` ("Jadikan Paket Unggulan / Rekomendasi").
* Tambah input `badge_text` (misal: "Rekomendasi", "Terlaris").
* Tambah input `sort_order` (Urutan Tampilan).
* Tambah form/card terpisah "Pengaturan Helpdesk & Dukungan DOI" untuk mengedit email, hotline, dan catatan bantuan.

### 5.3 Komponen Pengguna (`DoiPackageDrawer.tsx` & `DoiEmptyState.tsx`)
* **`DoiPackageDrawer.tsx`**:
  * Menggunakan `currentPackage?.features` untuk merender list checklist.
  * Menggunakan `settings?.doi_helpdesk_*` untuk merender kotak informasi kontak dan jam operasional.
* **`DoiEmptyState.tsx`**:
  * Merender checklist fasilitas dari `pkg.features` pada setiap kartu paket.
  * Menampilkan badge `pkg.badge_text || 'Rekomendasi'` hanya jika `pkg.is_featured` bernilai true.
  * Kartu diurutkan berdasarkan `sort_order`.

---

## 6. Rencana Verifikasi & Pengujian

1. **Uji Migrasi & Seeding**:
   * Jalankan migrasi dan seeder: `docker exec -it jurnal-mu-app php artisan migrate --seed`.
2. **Uji CRUD Superadmin**:
   * Tambah paket baru dengan 5 butir fasilitas kustom, centang `is_featured`, isi `badge_text: 'Paket Populer'`.
   * Edit paket yang ada, ubah salah satu poin fasilitas dan urutan tampil.
   * Edit kontak helpdesk (ganti nomor telepon dan email) via form admin.
3. **Uji Tampilan Pengguna**:
   * Buka dashboard Langganan DOI sebagai Admin Kampus / Pengelola Jurnal.
   * Verifikasi kartu paket di empty state menampilkan fasilitas dinamis dan badge rekomendasi baru.
   * Buka Drawer Rincian Paket, verifikasi seluruh butir fasilitas dan kontak bantuan sesuai dengan input Superadmin.
