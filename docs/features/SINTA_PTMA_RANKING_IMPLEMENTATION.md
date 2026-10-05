# Dokumentasi Fitur: Papan Peringkat SINTA PTMA (Interactive Multi-Variable Ranking)

Dokumentasi komprehensif arsitektur sistem, integrasi API SINTA v3.0, kalkulasi perankingan multi-dimensi, antarmuka visual frontend, visualisasi chart data, dan panduan operasional subsistem Papan Peringkat SINTA PTMA pada platform **JurnalMu**.

---

## 1. Ringkasan & Tujuan Fitur

Fitur ini menyediakan tolok ukur (*benchmarking*) komparatif kinerja riset, publikasi internasional/nasional, pengabdian kepada masyarakat (PkM), serta luaran kekayaan intelektual (HKI) seluruh Perguruan Tinggi Muhammadiyah & 'Aisyiyah (PTMA) di Indonesia secara transparan, berbasis data resmi **SINTA API Version 3.0 (Kemendikbudristek)**.

### Kemampuan Utama:
1. **Perankingan Multi-Dimensi Dinamis**: Pengurutan peringkat PTMA fleksibel pada 11 variabel luaran (Skor SINTA Overall, SINTA 3 Tahun, Scopus, Web of Science, Garuda, Google Scholar, Penelitian, Pengabdian/PkM, Paten/HKI, Buku, dan Dosen).
2. **Visualisasi Data Interaktif (shadcn/ui Charts + Recharts)**:
   - **Top 10 Benchmark Bar Chart**: Menampilkan perbandingan dinamis 10 kampus teratas yang reaktif mengikuti variabel pengurutan yang aktif.
   - **Top 3 Research Profile Radar Chart**: Komparasi multi-series 6 sumbu riset untuk tiga kampus teratas dengan garis kontur tegas dan arsiran transparan.
   - **Sidik Jari Riset Kampus (Radar Chart - Dots)**: Diagram radar individual pada slide-over drawer yang memvisualisasikan spesialisasi luaran internal perguruan tinggi.
3. **Integrasi API Rate-Safe & Offline-First**: Dirancang aman terhadap kuota ketat 500 request/hari dengan caching token Bearer 12 jam, throttle interval 150ms antar-request, penanganan anti-poisoning cache, serta *Deterministic Mock Driver* untuk pengujian lokal tanpa koneksi ke server eksternal.
4. **Desain Visual Konsisten & Design Tokens**: Menggunakan sistem desain token terpadu dari `resources/css/app.css` (`var(--primary)`, `var(--secondary)`, `var(--chart-1)` s/d `var(--chart-5)`), tipografi *El Messiri* & *Geist*, serta kompatibilitas mode gelap otomatis.
5. **Panel Manajemen Super Admin**: Monitoring status sinkronisasi, indikator kuota harian, serta pemicu sinkronisasi batch massal yang dilindungi otorisasi ganda.

---

## 2. Arsitektur Database

Data metrik SINTA disimpan secara terisolasi pada tabel `university_sinta_metrics` dengan relasi 1-to-1 terhadap tabel `universities`.

### Skema Tabel `university_sinta_metrics`:
| Kolom | Tipe Data | Keterangan & Indeks |
| :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED (PK)` | Identifier unik record metrik |
| `university_id` | `BIGINT UNSIGNED (FK, UNIQUE)` | Relasi ke `universities.id` (Cascade on delete) |
| `sinta_id` | `VARCHAR(50), NULL` | ID resmi afiliasi di portal SINTA (Indexed) |
| `ptm_code` | `VARCHAR(20)` | Kode PDDIKTI kampus (Indexed) |
| `sinta_score_overall` | `DECIMAL(12,2)` | Skor SINTA V3 Keseluruhan (Indexed) |
| `sinta_score_3yr` | `DECIMAL(12,2)` | Skor SINTA V3 3 Tahun Terakhir (Indexed) |
| `national_rank_overall` | `INT, NULL` | Peringkat nasional SINTA Overall |
| `national_rank_3yr` | `INT, NULL` | Peringkat nasional SINTA 3 Tahun |
| `scopus_docs` | `INT` | Total publikasi terindeks Scopus (Indexed) |
| `scopus_citations` | `INT` | Total sitasi dokumen Scopus |
| `wos_docs` | `INT` | Total publikasi Web of Science (Indexed) |
| `wos_citations` | `INT` | Total sitasi dokumen Web of Science |
| `garuda_docs` | `INT` | Total publikasi terindeks Garuda (Indexed) |
| `garuda_citations` | `INT` | Total sitasi dokumen Garuda |
| `google_docs` | `INT` | Total dokumen Google Scholar (Indexed) |
| `google_citations` | `INT` | Total sitasi Google Scholar |
| `research_count` | `INT` | Total kegiatan penelitian/hibah (Indexed) |
| `service_count` | `INT` | Total kegiatan pengabdian masyarakat / PkM (Indexed) |
| `ipr_count` | `INT` | Total HKI / Paten terdaftar (Indexed) |
| `book_count` | `INT` | Total buku ber-ISBN terdaftar (Indexed) |
| `authors_count` | `INT` | Jumlah dosen/peneliti terdaftar di SINTA |
| `departments_count` | `INT` | Jumlah program studi terdata |
| `journals_count` | `INT` | Jumlah jurnal terakreditasi kampus |
| `raw_payload` | `JSON, NULL` | Snapshot payload mentah JSON dari API SINTA |
| `sync_status` | `ENUM('pending','success','failed')` | Status proses sinkronisasi terakhir |
| `sync_error` | `TEXT, NULL` | Pesan galat bila proses sinkronisasi gagal |
| `last_synced_at` | `TIMESTAMP, NULL` | Waktu terakhir penarikan data (Indexed) |

### Relasi Model Eloquent:
* `University::sintaMetric()` ➔ `HasOne(UniversitySintaMetric::class)`
* `UniversitySintaMetric::university()` ➔ `BelongsTo(University::class)`

---

## 3. Layanan Integrasi API (`SintaApiClient`)

File: `app/Services/Sinta/SintaApiClient.php`

### Alur Kerja & Mekanisme Proteksi:
1. **Autentikasi Token Bearer**:
   * Memanggil endpoint `POST /consumer/login` dengan kredensial `username` dan `password`.
   * Token disimpan dalam cache Laravel (`sinta_bearer_token`) selama 12 jam (43.200 detik).
   * **Anti-Poisoning Guard**: Memvalidasi token sebelum disimpan ke cache. Jika response login kosong/tidak valid, sistem langsung melempar exception dan tidak meng-cache token kosong.
2. **Pengambilan Metrik Afiliasi**:
   * Endpoint: `POST /v3/{env}/{uniq}/affiliation/metric/kodept/{ptmCode}`.
   * Parameter `:type = kodept` diinjeksi menggunakan nilai `ptm_code` kampus dari basis data.
3. **Deterministic Mock Driver (Offline & Safety Guard)**:
   * Jika `config('sinta.mock_mode') == true`, klien menggunakan generator berbasis seed deterministik `crc32($ptmCode)`.
   * Menghasilkan data simulasi yang realistis, proporsional, dan identik antar-eksekusi tanpa melakukan request jaringan keluar.

---

## 4. Mesin Peringkat Dinamis (`PtmaRankingService`)

File: `app/Services/Sinta/PtmaRankingService.php`

### Algoritma & Fitur Kalkulasi:
* **Dynamic SQL Window Function**:
  Menggunakan `DENSE_RANK() OVER (ORDER BY {$column} {$direction}) as ranking_position` secara langsung pada level query SQL. Kampus dengan nilai seri mendapat posisi ranking yang sama secara adil tanpa terpengaruh paginasi.
* **Secondary Tie-Breaker Sorting**:
  Setiap pengurutan dijamin stabil antar-halaman paginasi menggunakan penentu seri sekunder:
  ```php
  $query->orderBy($column, $direction)->orderBy('universities.id', 'asc');
  ```
* **11 Variabel Pengurutan yang Didukung**:
  `sinta_overall`, `sinta_3yr`, `scopus`, `wos`, `garuda`, `google`, `research`, `service`, `ipr`, `book`, `authors`.
* **Filter Tambahan**:
  * Pencarian teks bebas `q` (mencocokkan nama universitas, kode singkatan, atau kode PT).
  * Filter akreditasi BAN-PT (`Unggul`, `Baik Sekali`, `Baik`, `A`, `B`).
* **Caching Statistik Makro**:
  Hasil agregasi nasional `getSummaryStats()` dibungkus dalam `Cache::remember('ptma_macro_stats', 3600, ...)` dan di-flush otomatis via `PtmaRankingService::clearCache()` setiap kali batch sinkronisasi selesai.

---

## 5. Job Sinkronisasi & Perintah Artisan

### Background Job:
File: `app/Jobs/SyncUniversitySintaMetricJob.php`
* Mengimplementasikan interface `ShouldQueue`.
* Memproses sinkronisasi untuk 1 universitas dan memperbarui tabel secara idempoten via `updateOrCreate`.
* Isolasi galat: kegagalan penarikan data pada satu kampus tidak membatalkan eksekusi antrean kampus lainnya.

### Artisan CLI Command:
File: `app/Console/Commands/SyncSintaPtmaCommand.php`
```bash
# Sinkronisasi seluruh kampus PTMA (mode mock dev)
docker exec -i jurnal-mu-app php artisan sinta:sync-ptma --mock

# Sinkronisasi kampus spesifik berdasarkan ID universitas
docker exec -i jurnal-mu-app php artisan sinta:sync-ptma --university_id=1
```
* Menampilkan *progress bar* interaktif di terminal console.
* Menerapkan throttle delay `150ms` (`usleep(150000)`) antar-panggilan API untuk mematuhi rate limit server.

---

## 6. Arsitektur Antarmuka Pengguna (Frontend React + Inertia.js)

Komponen publik terletak pada direktori `resources/js/pages/Public/PtmaRanking/`.

### Struktur Komponen Halaman:

```
resources/js/pages/Public/PtmaRanking/
├── Index.tsx                       # Root Leaderboard Page & SEO Metadata
├── components/
│   ├── PtmaHeroBento.tsx           # Header Hero Gradient + Spotlight #1 + Macro Stats Bento
│   ├── VariableSegmentedNav.tsx    # Floating Island Navigation dengan 11 Variabel
│   ├── PtmaStatisticsChart.tsx     # Visualisasi Data Statistik: Top 10 Bar & Top 3 Radar
│   ├── FilterControlBar.tsx        # Search Input & shadcn DropdownMenu Akreditasi
│   ├── LeaderboardTable.tsx        # Tabel Kontainer Papan Peringkat
│   ├── LeaderboardRow.tsx          # Baris Peringkat, Sparkbar Relatif, Button Rincian
│   └── PtmaDetailDrawer.tsx        # Slide-Over Detail Drawer & Radar Sidik Jari Riset
└── types.ts                        # Deklarasi Tipe TypeScript
```

### Rincian Komponen:

1. **`PtmaHeroBento.tsx`**:
   * Visual header seragam dengan halaman publik `Browse/Universities.tsx` menggunakan `bg-hero-gradient` dan tipografi *El Messiri*.
   * Mengeliminasi tabrakan tata letak negatif margin, menghasilkan transisi bersih ke area kartu.
   * Spotlight PTMA #1 beraksen emas dipadukan grid 2x2 statistik makro nasional (Total PTMA, Scopus, Garuda, Paten).

2. **`VariableSegmentedNav.tsx`**:
   * Komponen navigasi pulau mengambang (*floating island pill*) berisi 11 pilihan variabel perankingan.
   * Transisi indikator menggunakan Motion physics (`layoutId="activePillIndicator"`).

3. **`PtmaStatisticsChart.tsx` (Visualisasi Data Statistik)**:
   * Terletak tepat di bawah navigasi variabel dan di atas bar filter.
   * Dilengkapi tombol toggle lipat (*Collapsible*): "Tampilkan Grafik" / "Sembunyikan Grafik".
   * Menggunakan komponen resmi `@/components/ui/tabs` dengan dua mode tab:
     * **Tab 1: Top 10 Benchmark (Horizontal Bar Chart)**:
       - Menampilkan perbandingan 10 kampus teratas secara horizontal.
       - Skema warna hierarkis: Kampus #1 Unggulan menggunakan token `var(--chart-3)` (Sun Yellow), kampus peringkat 2–10 menggunakan token `var(--chart-1)` (Navy).
       - Label sumbu dan tooltip interaktif terformat dalam lokal angka Indonesia (`id-ID`).
     * **Tab 2: Profil Riset Top 3 (Multi-Series Radar Chart)**:
       - Implementasi pola resmi shadcn multi-radar.
       - Menampilkan 6 sumbu luaran riset: Scopus, Garuda, WoS, HKI, Riset, Pengabdian.
       - Grid latar belakang polygon (`<PolarGrid />`) dengan kontur garis tegas (`strokeWidth={2}`) dan arsiran transparan (`fillOpacity={0.25}`, `0.2`, `0.15`) tanpa bulatan dot berlebih agar komparasi tumpang tindih mudah dibaca.
       - Skema warna seri: Peringkat 1 (`var(--chart-1)` Navy), Peringkat 2 (`var(--chart-2)` Maroon), Peringkat 3 (`var(--chart-3)` Sun Yellow).
       - Dilengkapi komponen `<ChartLegend />` dan tooltip dengan indikator garis.

4. **`FilterControlBar.tsx`**:
   * Input pencarian teks instan dengan debounce 350ms.
   * Dropdown filter akreditasi BAN-PT mengadopsi standar resmi shadcn `DropdownMenu` (`DropdownMenuRadioGroup`, `DropdownMenuRadioItem`).

5. **`LeaderboardTable.tsx` & `LeaderboardRow.tsx`**:
   * Badge medali peringkat bergradasi: Emas (#1), Perak (#2), Perunggu (#3).
   * Nilai metrik utama disorot dengan `font-mono tabular-nums`.
   * Batang visual relatif (*Relative Sparkbar*) yang memperlihatkan proporsi perolehan terhadap kampus pemuncak.
   * Tombol aksi "Rincian ↗" untuk membuka panel drawer detail kampus.

6. **`PtmaDetailDrawer.tsx` (Slide-Over Card)**:
   * Header sticky bergaya *glassmorphism* dengan avatar doppelrand, badge akreditasi BAN-PT, peringkat nasional, dan peringkat PTMA.
   * Scorecard sorotan skor SINTA Overall & 3 Tahun.
   * **Radar Chart "Sidik Jari Riset & Luaran"**:
     - Mengadopsi pola resmi shadcn **Radar Chart - Dots** (`chart-radar-dots.tsx`).
     - Menggunakan `<PolarGrid />` bergaris poligon, poligon arsiran tunggal `fill="var(--color-score)"` beropasitas `0.6`, dan penanda titik pada tiap sudut vertex (`dot={{ r: 4, fillOpacity: 1 }}`).
     - Memberikan representasi visual yang jelas mengenai spesialisasi luaran kampus bersangkutan.
   * 3 Modul Bento Tematik:
     1. *Publikasi & Sitasi Global*: Dokumen Scopus, Sitasi Scopus, Dokumen WoS, Sitasi WoS.
     2. *Publikasi Nasional & HKI*: Dokumen Garuda, Sitasi Garuda, Paten/HKI, Buku Terbit.
     3. *Produktivitas Riset & Akademik*: Penelitian, Pengabdian (PkM), Dosen Terdaftar, Jurnal Kampus.
   * Tombol interaktif "Salin Tautan" dengan integrasi deep-link URL parameter `?campus={code}`.

---

## 7. Perbedaan Basis Normalisasi Radar Chart

Sistem memiliki dua implementasi diagram radar dengan tujuan analisis yang berbeda secara fundamental:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PERBANDINGAN FORMULA RADAR CHART                     │
├───────────────────────────────────┬────────────────────────────────────┤
│   RADAR DRAWER DETAIL KAMPUS      │      RADAR TAB KOMPARASI TOP 3     │
│   (Sidik Jari Riset Internal)     │      (Benchmark Antar-Kampus)      │
├───────────────────────────────────┼────────────────────────────────────┤
│ Sifat: INTRA-KAMPUS (Internal)    │ Sifat: INTER-KAMPUS (Antar-Kampus) │
│ Basis 100%: Nilai volume tertinggi│ Basis 100%: Nilai tertinggi di     │
│ milik kampus itu sendiri di antara│ antara 3 kampus pada sumbu dimensi │
│ 6 dimensi luaran.                 │ yang bersangkutan.                 │
│                                   │                                    │
│ Rumus:                            │ Rumus:                             │
│ score = (val / max(internal)) * 100│ score = (val / max(top3_axis)) * 100│
│                                   │                                    │
│ Tujuan Analisis:                  │ Tujuan Analisis:                   │
│ Mengidentifikasi spesialisasi dan │ Mengetahui kampus mana yang unggul │
│ portofolio riset kampus tersebut  │ secara absolut pada masing-masing  │
│ (apakah kuat di Scopus, Garuda,   │ bidang di kelompok pemuncak.       │
│ atau Pengabdian).                 │                                    │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 8. Pemetaan Design Tokens & Dark Mode

Seluruh elemen visual menggunakan variabel tema dari `resources/css/app.css`:

| Token CSS | Mode Terang (Light) | Mode Gelap (Dark) | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| `--primary` | `#2C368A` (Navy) | `#5C6BC0` | Warna aksen utama, tombol, teks sorotan |
| `--secondary` | `#E8242A` (Maroon) | `#EF5350` | Warna aksen sekunder |
| `--chart-1` | `#2C368A` | `#5C6BC0` | Bar #2-#10, Radar Drawer, Radar Rank 1 Top 3 |
| `--chart-2` | `#E8242A` | `#EF5350` | Radar Rank 2 Top 3 |
| `--chart-3` | `#fcee1f` (Sun Yellow) | `#fcee1f` | Bar #1 Unggulan, Radar Rank 3 Top 3 |
| `--chart-4` | `#0f172a` | `#f8fafc` | Elemen visual kontras gelap/terang |
| `--chart-5` | `#64748b` | `#94a3b8` | Aksen netral / teks pendukung |
| `--border` | `#e2e8f0` | `#1e293b` | Garis batas komponen & grid polar chart |

---

## 9. Panel Manajemen Super Admin

File: `resources/js/pages/Admin/Sinta/Index.tsx`  
Rute: `GET /admin/sinta` (Khusus Super Admin)

### Fitur Pengelolaan:
* **Proteksi Akses**: Dilindungi middleware ganda `['auth', 'verified', 'role:'.Role::SUPER_ADMIN]`. Akses non-admin secara otomatis ditolak dengan kode respon `403 Forbidden`.
* **Statistik Cepat**: Kartu monitoring total kampus target, jumlah berhasil sinkron, jumlah gagal, serta status sistem (Mock / Live).
* **Riwayat Sinkronisasi**: Tabel pantauan waktu sinkronisasi terakhir per kampus beserta detail galat sinkronisasi jika terjadi kendala.
* **Sinkronisasi Massal Terproteksi**: Tombol pemantik sinkronisasi massal (`POST /admin/sinta/sync`) dilengkapi dialog konfirmasi `AlertDialog` untuk mencegah pemicuan tanpa sengaja.

---

## 10. Panduan Konfigurasi Lingkungan (`.env`)

Konfigurasi berikut wajib didefinisikan pada file `.env` aplikasi:

```dotenv
# Konfigurasi Integrasi SINTA API v3.0 Kemendikbudristek
SINTA_API_URL=http://apisinta.kemdikbud.go.id
SINTA_ENV=prod               # 'dev' untuk pengujian sandbox atau 'prod' untuk production
SINTA_USERNAME=your_username
SINTA_PASSWORD=your_password
SINTA_UNIQ_ID=your_uniq_id
SINTA_DAILY_LIMIT=500
SINTA_MOCK_MODE=true         # Set true untuk pengujian lokal / offline tanpa request keluar
```

---

## 11. Panduan Verifikasi & Pengujian

### 1. Menjalankan Migrasi & Database Seeder:
```bash
docker exec -i jurnal-mu-app php artisan migrate
docker exec -i jurnal-mu-app php artisan db:seed --class=SintaPtmaSeeder
```

### 2. Menjalankan Backend Test Suite (PHPUnit):
```bash
docker exec -i jurnal-mu-app php artisan test tests/Feature/Sinta tests/Unit/Sinta
```
*Hasil Verifikasi: 24 test cases lulus (140 assertions passing, 100% green).*

### 3. Menjalankan Frontend Test Suite (Vitest):
```bash
npx vitest run resources/js/pages/Public/PtmaRanking/
```
*Hasil Verifikasi: 4 file test suite, 47 unit/component tests lulus (100% green).*

### 4. Pengecekan Type & Build Produksi:
```bash
npm run types
npm run build
```
*Hasil Verifikasi: 0 type error (`tsc --noEmit`), bundel produksi Vite terkompilasi bersih tanpa peringatan fatal.*
