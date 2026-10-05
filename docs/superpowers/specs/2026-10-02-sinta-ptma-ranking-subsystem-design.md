# Design Spec: SINTA PTMA Interactive Multi-Variable Ranking Subsystem

- **Date:** 2026-10-02
- **Author:** Vanguard UI Architect & Backend System Engineer
- **Status:** Approved (Pre-Implementation)
- **Target System:** JurnalMu (Asosiasi Jurnal Muhammadiyah / PTMA)

---

## 1. Executive Summary & Objective

Sub-sistem integrasi API SINTA v3.0 dan Papan Peringkat Interaktif PTMA (Perguruan Tinggi Muhammadiyah & 'Aisyiyah) dirancang untuk menyajikan tolok ukur (benchmarking) kinerja riset, publikasi, pengabdian, dan luaran HKI seluruh kampus PTMA di Indonesia.

Sistem ini menggabungkan:
1. **Sinkronisasi Aman & Terisolasi**: Pengambilan data metrik agregat afiliasi dari SINTA API v3.0 berbasis kuota (500 request/hari) dengan token caching dan mode mock.
2. **Multi-Dimensi Ranking Engine**: Perhitungan peringkat dinamis untuk ranking global (Skor SINTA) dan per-variabel (Scopus, WoS, Garuda, Paten/HKI, Riset, PkM, Buku).
3. **High-End UI/UX (Awwwards-Tier)**: Dashboard benchmarking bergaya *Clean Structural Prestige* dengan Asymmetric Hero Bento, Floating Variable Switcher, Double-Bezel Leaderboard Row, Sparkbar visual, dan Slide-Over Detail Drawer.

---

## 2. Arsitektur & Skema Database

### 2.1 Skema Tabel `university_sinta_metrics`
Tabel penampung data metrik resmi dari SINTA, terpisah 1-to-1 dengan tabel master `universities`.

```sql
CREATE TABLE university_sinta_metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    university_id BIGINT UNSIGNED NOT NULL UNIQUE,
    sinta_id VARCHAR(50) NULL,
    ptm_code VARCHAR(20) NOT NULL,
    
    -- Skor Resmi SINTA
    sinta_score_overall DECIMAL(12,2) DEFAULT 0.00,
    sinta_score_3yr DECIMAL(12,2) DEFAULT 0.00,
    national_rank_overall INT NULL,
    national_rank_3yr INT NULL,
    
    -- Publikasi & Sitasi Global / Nasional
    scopus_docs INT DEFAULT 0,
    scopus_citations INT DEFAULT 0,
    wos_docs INT DEFAULT 0,
    wos_citations INT DEFAULT 0,
    garuda_docs INT DEFAULT 0,
    garuda_citations INT DEFAULT 0,
    google_docs INT DEFAULT 0,
    google_citations INT DEFAULT 0,
    
    -- Riset & Luaran Tri Dharma
    research_count INT DEFAULT 0,
    service_count INT DEFAULT 0,
    ipr_count INT DEFAULT 0,
    book_count INT DEFAULT 0,
    
    -- Sumber Daya Kampus
    authors_count INT DEFAULT 0,
    departments_count INT DEFAULT 0,
    journals_count INT DEFAULT 0,
    
    -- Audit & Fallback
    raw_payload JSON NULL,
    sync_status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    sync_error TEXT NULL,
    last_synced_at TIMESTAMP NULL,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    CONSTRAINT fk_univ_sinta_metrics_univ_id 
        FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE,
    
    INDEX idx_sinta_ptm_code (ptm_code),
    INDEX idx_sinta_score_overall (sinta_score_overall),
    INDEX idx_sinta_score_3yr (sinta_score_3yr),
    INDEX idx_scopus_docs (scopus_docs),
    INDEX idx_wos_docs (wos_docs),
    INDEX idx_garuda_docs (garuda_docs),
    INDEX idx_google_docs (google_docs),
    INDEX idx_research_count (research_count),
    INDEX idx_service_count (service_count),
    INDEX idx_ipr_count (ipr_count),
    INDEX idx_book_count (book_count),
    INDEX idx_last_synced_at (last_synced_at)
);
```

### 2.2 Relasi Model Eloquent
* `University::hasOne(UniversitySintaMetric::class)`
* `UniversitySintaMetric::belongsTo(University::class)`

---

## 3. Sub-sistem Integrasi API SINTA (Sync Engine)

### 3.1 Konfigurasi & Lingkungan (`config/sinta.php`)
```php
return [
    'base_url' => env('SINTA_API_URL', 'http://apisinta.kemdikbud.go.id'),
    'env' => env('SINTA_ENV', 'prod'), // 'dev' atau 'prod'
    'username' => env('SINTA_USERNAME'),
    'password' => env('SINTA_PASSWORD'),
    'uniq' => env('SINTA_UNIQ_ID'),
    'daily_rate_limit' => env('SINTA_DAILY_LIMIT', 500),
    'mock_mode' => env('SINTA_MOCK_MODE', false),
];
```

### 3.2 Klien API SINTA (`App\Services\Sinta\SintaApiClient`)
1. **Autentikasi & Token Cache**:
   - Hit endpoint `POST /consumer/login` dengan `username` dan `password`.
   - Simpan Bearer Token di cache Laravel (`sinta_bearer_token`) dengan masa berlaku 12 jam.
2. **Endpoint Afiliasi Metrik**:
   - Path segment: `POST /v3/{env}/{uniq}/affiliation/metric/kodept/{ptm_code}`.
   - Header: `Authorization: Bearer {token}`, `Content-Type: application/json`.
3. **Mock Driver Terisolasi**:
   - Jika `SINTA_MOCK_MODE=true` atau kredensial kosong, klien mengembalikan fixture JSON realistis tanpa membuat network request ke base URL resmi.
4. **Proteksi Limit & Error**:
   - Rate limit guard: Melacak jumlah request harian menggunakan counter di cache Redis/File.
   - Circuit breaker: Jika mendeteksi response HTTP 429 atau kuota harian mencapai ambang batas, queue otomatis dihentikan sementara (pause).

### 3.3 Job & Artisan Command
* **`App\Jobs\SyncUniversitySintaMetricJob`**: Bertugas mengeksekusi penarikan 1 kampus dengan delay 1.5 detik antar-kampus. Merekam hasil ke tabel `university_sinta_metrics` dan mengupdate `raw_payload`.
* **`App\Console\Commands\SyncSintaPtmaCommand`** (`php artisan sinta:sync-ptma`):
  - Mengambil seluruh kampus aktif yang memiliki `ptm_code`.
  - Mendaftarkan queue job batch per kampus.
  - Opsi `--id=` untuk sync kampus tunggal, `--mock` untuk uji coba dengan fixture.

---

## 4. Ranking Engine & Query Strategy

### 4.1 Service Kelas (`App\Services\Sinta\PtmaRankingService`)
Menyediakan kalkulasi leaderboard dan insight analitik:

1. **Method `getRankings(array $filters, int $perPage = 25)`**:
   - Sorting keys: `sinta_overall`, `sinta_3yr`, `scopus`, `wos`, `garuda`, `google`, `research`, `service`, `ipr`, `book`.
   - Dynamic dense ranking via SQL:
     ```sql
     DENSE_RANK() OVER (ORDER BY {selected_column} DESC) AS ranking_position
     ```
   - Filtering: Filter nama/kode (`q`), filter akreditasi BAN-PT (`accreditation_status`), filter provinsi (`province`).
   - Relasi: Eager loading `university:id,name,short_name,code,ptm_code,logo_url,accreditation_status,city,province`.
2. **Method `getSummaryStats()`**:
   - Menghasilkan metrik makro nasional PTMA:
     - `total_ptma_indexed`: Jumlah kampus PTMA terindeks.
     - `collective_scopus_docs`: Total seluruh dokumen Scopus seluruh PTMA.
     - `collective_ipr_count`: Total Paten/HKI seluruh PTMA.
     - `top_university_overall`: Data kampus peringkat 1 nasional SINTA saat ini.
3. **Caching**:
   - Hasil query dibungkus `Cache::remember()` selama 1 jam dengan tag cache `ptma_rankings`. Cache di-flush otomatis setiap kali sinkronisasi metrik selesai.

---

## 5. High-End UI/UX Design & Komponen Frontend

- **Vibe Language:** Clean Structural Prestige (OLED Neutral / Slate-900, aksen Deep Emerald Muhammadiyah `#059669`, tipografi Geist + Geist Mono).
- **Dials Setting:** `DESIGN_VARIANCE: 7` | `MOTION_INTENSITY: 5` | `VISUAL_DENSITY: 6`.

### 5.1 Komponen Halaman Publik (`resources/js/pages/Public/PtmaRanking/`)

```
Index.tsx
├── components/
│   ├── PtmaHeroBento.tsx           (Asymmetrical Bento Spotlight #1 + Macro Stats)
│   ├── VariableSegmentedNav.tsx    (Floating Island Nav dengan Motion layoutId)
│   ├── FilterControlBar.tsx        (Search, Akreditasi Dropdown, Export Button-in-Button)
│   ├── LeaderboardTable.tsx        (Tabel Presisi dengan Layout Animation)
│   │   ├── LeaderboardRow.tsx      (Double-Bezel Card Row, Sparkbar, Metallic Top 3)
│   │   └── EmptyState.tsx          (Visual Empty State terkalibrasi)
│   └── PtmaDetailDrawer.tsx        (Slide-Over Sheet untuk Breakdown 1 PTMA)
```

### 5.2 Rincian Interaksi & Haptic Details
1. **Asymmetric Bento Hero (`PtmaHeroBento.tsx`)**:
   - Kolom Kiri (Spotlight #1): Double-bezel container dengan ring emas halus, menampilkan logo besar PTMA pemuncak klasemen, skor total, dan status akreditasi.
   - Kolom Kanan (2x2 Grid): Tile ringkas untuk Scopus Kolektif, Paten Kolektif, Total Dosen Terverifikasi, dan Jurnal Kampus Terakreditasi.
2. **Floating Variable Switcher (`VariableSegmentedNav.tsx`)**:
   - Horizontal pill bar dengan transisi pegas (spring physics `stiffness: 260, damping: 25`).
   - Pengelompokan: `Semua (Skor SINTA)` | `Scopus` | `Garuda` | `WoS` | `Riset & PkM` | `Paten/HKI` | `Buku`.
   - Update parameter URL secara reaktif via Inertia router (`preserveState: true, preserveScroll: true`).
3. **Leaderboard Row Double-Bezel (`LeaderboardRow.tsx`)**:
   - Outer shell ring tipis `ring-1 ring-zinc-200/80 dark:ring-zinc-800` dengan inner core berlatar putih/gelap bersih.
   - Badge Top 3: Emas (#1), Perak (#2), Perunggu (#3).
   - Dynamic Headline & Sparkbar: Menampilkan nilai variabel aktif dengan format `font-mono tabular-nums` dan batang visual persentase relatif terhadap peringkat #1.
4. **Slide-Over Sheet Drawer (`PtmaDetailDrawer.tsx`)**:
   - Drawer slide-in dari sisi kanan saat tombol "Detail Metrik" diklik.
   - Tidak memutus alur scroll pengguna. Menampilkan scorecard 10 variabel, perbandingan produktivitas, serta tombol "Salin Tautan Kampus" dan "Ekspor Data".

---

## 6. Antarmuka Manajemen Admin (`Admin/Sinta/`)
- Halaman `Admin/Sinta/Index.tsx` khusus Super Admin.
- Kartu indikator kuota request harian (Request terpakai vs Batas 500/hari).
- Log status sinkronisasi terakhir per kampus (Tanggal, Status `success`/`failed`, Pesan error jika gagal).
- Tombol aksi "Mulai Sinkronisasi Sekarang" dengan modal dialog proteksi konfirmasi ganda.

---

## 7. Rencana Pengujian (Testing Strategy)

### 7.1 Backend Tests (PHPUnit / Pest)
1. `tests/Unit/Sinta/SintaApiClientTest.php`:
   - Pengujian caching Bearer Token (token tidak di-request ulang jika masih valid).
   - Pengujian Mock Driver (mengembalikan fixture yang valid tanpa koneksi HTTP luar).
   - Penanganan error HTTP 429 dan payload error dari SINTA.
2. `tests/Feature/Sinta/PtmaRankingTest.php`:
   - Pengujian endpoint publik `GET /ptma/ranking`.
   - Verifikasi pengurutan data per masing-masing variabel (`?sort=scopus`, `?sort=ipr`, dll).
   - Verifikasi filtering nama kampus dan akreditasi BAN-PT.
   - Verifikasi proteksi otorisasi endpoint admin sync `POST /admin/sinta/sync`.

### 7.2 Frontend Tests (Vitest)
1. `resources/js/pages/Public/PtmaRanking/__tests__/PtmaRanking.test.tsx`:
   - Verifikasi render komponen Hero Bento dan ringkasan makro.
   - Verifikasi interaksi klik pada Variable Switcher (Inertia router dipanggil dengan parameter sort yang sesuai).
   - Verifikasi pembukaan modal/drawer detail kampus.

---

## 8. Anti-Slop & Pre-Flight Verification Checklist
- [x] Tidak ada font terlarang (Inter/Roboto default); gunakan Geist & Geist Mono tabular.
- [x] Tidak ada AI-purple gradient; gunakan monokrom zinc dengan aksen tunggal Deep Emerald Muhammadiyah.
- [x] Double-bezel nested container diterapkan pada card utama dan baris peringkat.
- [x] Tombol CTA menggunakan arsitektur button-in-button.
- [x] Animasi dan layout collapse secara aman ke single-column di layar mobile `< 768px`.
- [x] Zero direct network call ke base URL SINTA saat proses development dan automated testing.
