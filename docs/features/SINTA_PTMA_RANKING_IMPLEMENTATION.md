# Dokumentasi Fitur: Papan Peringkat SINTA PTMA (Interactive Multi-Variable Ranking)

Dokumentasi arsitektur, integrasi API, perankingan multi-dimensi, antarmuka frontend, dan panduan operasional subsistem Papan Peringkat SINTA PTMA pada platform **JurnalMu**.

---

## 1. Ringkasan & Tujuan Fitur

Fitur ini menyediakan tolok ukur (benchmarking) kinerja riset, publikasi internasional/nasional, pengabdian, dan luaran kekayaan intelektual (HKI) seluruh Perguruan Tinggi Muhammadiyah & 'Aisyiyah (PTMA) di Indonesia secara komparatif dan transparan berdasarkan data **SINTA API Version 3.0**.

### Kemampuan Utama:
1. **Perankingan Multi-Dimensi**: Pengurutan peringkat PTMA tidak hanya berdasarkan total skor SINTA, melainkan dapat dipilah per-variabel (Scopus, WoS, Garuda, Paten/HKI, Penelitian, Pengabdian, Buku, Dosen).
2. **Integrasi Rate-Safe & Offline-First**: Mendukung kuota ketat 500 request/hari dengan caching token 12 jam, throttle loop 150ms, dan *Deterministic Mock Driver* yang memungkinkan pengujian dan pengembangan lokal tanpa koneksi luar ke server Kemendikbud.
3. **High-End UI/UX Design**: Tampilan publik papan peringkat bertaraf *Awwwards-Tier* dengan *Double-Bezel Card Stream*, *Asymmetric Hero Bento*, *Floating Segmented Island Nav*, *Relative Sparkbars*, dan *Slide-Over Sheet Detail Drawer*.
4. **Panel Manajemen Super Admin**: Monitoring status sinkronisasi, indikator kuota, dan pemantik batch sinkronisasi massal dengan proteksi otorisasi ganda.

---

## 2. Arsitektur Database

Data metrik SINTA disimpan secara terisolasi pada tabel `university_sinta_metrics` dengan relasi 1-to-1 terhadap tabel `universities`.

### Skema Tabel `university_sinta_metrics`:
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED (PK)` | Identifier unik record metrik |
| `university_id` | `BIGINT UNSIGNED (FK, UNIQUE)` | Relasi ke `universities.id` (Cascade on delete) |
| `sinta_id` | `VARCHAR(50), NULL` | ID resmi afiliasi di SINTA (Indexed) |
| `ptm_code` | `VARCHAR(20)` | Kode PDDIKTI kampus (Indexed) |
| `sinta_score_overall` | `DECIMAL(12,2)` | Skor SINTA V3 Overall (Indexed) |
| `sinta_score_3yr` | `DECIMAL(12,2)` | Skor SINTA V3 3 Tahun Terakhir (Indexed) |
| `national_rank_overall` | `INT, NULL` | Peringkat nasional SINTA Overall |
| `national_rank_3yr` | `INT, NULL` | Peringkat nasional SINTA 3 Tahun |
| `scopus_docs` | `INT` | Total publikasi terindeks Scopus (Indexed) |
| `scopus_citations` | `INT` | Total sitasi Scopus |
| `wos_docs` | `INT` | Total publikasi Web of Science (Indexed) |
| `wos_citations` | `INT` | Total sitasi Web of Science |
| `garuda_docs` | `INT` | Total publikasi terindeks Garuda (Indexed) |
| `garuda_citations` | `INT` | Total sitasi Garuda |
| `google_docs` | `INT` | Total dokumen Google Scholar (Indexed) |
| `google_citations` | `INT` | Total sitasi Google Scholar |
| `research_count` | `INT` | Total kegiatan penelitian/hibah (Indexed) |
| `service_count` | `INT` | Total pengabdian masyarakat / PkM (Indexed) |
| `ipr_count` | `INT` | Total HKI / Paten terdaftar (Indexed) |
| `book_count` | `INT` | Total buku terdaftar (Indexed) |
| `authors_count` | `INT` | Jumlah dosen terdaftar di SINTA |
| `departments_count` | `INT` | Jumlah program studi |
| `journals_count` | `INT` | Jumlah jurnal yang diterbitkan kampus |
| `raw_payload` | `JSON, NULL` | Snapshot payload asli dari API SINTA |
| `sync_status` | `ENUM('pending','success','failed')` | Status sinkronisasi terakhir |
| `sync_error` | `TEXT, NULL` | Pesan error jika sinkronisasi gagal |
| `last_synced_at` | `TIMESTAMP, NULL` | Waktu terakhir penarikan data (Indexed) |

### Relasi Model Eloquent:
* `University::sintaMetric()` ➔ `HasOne(UniversitySintaMetric::class)`
* `UniversitySintaMetric::university()` ➔ `BelongsTo(University::class)`

---

## 3. Layanan Integrasi API (`SintaApiClient`)

File: `app/Services/Sinta/SintaApiClient.php`

### Alur Kerja:
1. **Autentikasi Token**:
   * Memanggil endpoint `POST /consumer/login` dengan `username` dan `password`.
   * Token disimpan dalam cache Laravel (`sinta_bearer_token`) dengan masa aktif 12 jam (43.200 detik).
   * Dilengkapi validasi pencegah *token cache poisoning* (melempar `\Exception` jika token kosong sebelum masuk cache).
2. **Pengambilan Metrik Afiliasi**:
   * URL endpoint: `POST /v3/{env}/{uniq}/affiliation/metric/kodept/{ptmCode}`.
   * Parameter `:type = kodept` dipetakan otomatis menggunakan `ptm_code` dari tabel `universities`.
3. **Deterministic Mock Driver (Offline/Dev Safety)**:
   * Jika `config('sinta.mock_mode') == true`, klien menggunakan generator data berbasis seed `crc32($ptmCode)`.
   * Menghasilkan data pengujian yang realistis dan konsisten antar-eksekusi tanpa membuat koneksi HTTP ke server SINTA Kemendikbud.

---

## 4. Mesin Peringkat Dinamis (`PtmaRankingService`)

File: `app/Services/Sinta/PtmaRankingService.php`

### Fitur Kalkulasi:
* **Dynamic SQL Window Function**:
  Menggunakan `DENSE_RANK() OVER (ORDER BY {$column} {$direction}) as ranking_position` langsung di query database. Kampus dengan nilai sama memperoleh ranking sama secara akurat tanpa terpotong paginasi.
* **Secondary Tie-Breaker Sort**:
  Setiap query pengurutan dilengkapi `->orderBy($column, $direction)->orderBy('universities.id', 'asc')` untuk menjamin stabilitas paginasi.
* **Daftar Sort Key yang Didukung**:
  * `sinta_overall` ➔ Skor SINTA Overall
  * `sinta_3yr` ➔ Skor SINTA 3 Tahun
  * `scopus` ➔ Dokumen Scopus
  * `wos` ➔ Dokumen Web of Science
  * `garuda` ➔ Dokumen Garuda
  * `google` ➔ Dokumen Google Scholar
  * `research` ➔ Jumlah Penelitian
  * `service` ➔ Jumlah Pengabdian (PkM)
  * `ipr` ➔ Jumlah Paten / HKI
  * `book` ➔ Jumlah Buku
  * `authors` ➔ Jumlah Dosen
* **Filter Tambahan**:
  * Pencarian teks bebas `q` (mencari nama kampus, singkatan, atau kode PT).
  * Filter akreditasi BAN-PT (`Unggul`, `Baik Sekali`, `Baik`, `A`, `B`).
* **Cache Statistik Makro**:
  Output `getSummaryStats()` dibungkus dalam `Cache::remember('ptma_macro_stats', 3600, ...)` dan di-flush otomatis via `PtmaRankingService::clearCache()` setiap kali sinkronisasi selesai.

---

## 5. Job Sinkronisasi & Perintah Artisan

### Background Job:
File: `app/Jobs/SyncUniversitySintaMetricJob.php`
* Mengimplementasikan `ShouldQueue`.
* Mengambil metrik untuk 1 universitas dan memperbarui record `UniversitySintaMetric` secara idempoten via `updateOrCreate`.
* Menangani error per kampus secara terisolasi tanpa membatalkan antrean kampus lainnya.

### Artisan CLI Command:
File: `app/Console/Commands/SyncSintaPtmaCommand.php`
```bash
# Sinkronisasi seluruh PTMA (dengan mock mode)
docker exec -i jurnal-mu-app php artisan sinta:sync-ptma --mock

# Sinkronisasi 1 kampus spesifik berdasarkan ID universitas
docker exec -i jurnal-mu-app php artisan sinta:sync-ptma --university_id=1
```
* Dilengkapi progress bar interaktif di terminal.
* Menerapkan throttle delay `150ms` (`usleep(150000)`) antar-iterasi untuk melindungi batas laju request API.

---

## 6. Antarmuka Pengguna (Frontend React + Inertia.js)

Komponen publik terletak pada direktori `resources/js/pages/Public/PtmaRanking/`.

### Struktur Komponen:
1. **`Index.tsx`**:
   Halaman root leaderboard publik (`/ptma/ranking`) dengan `<Head>` SEO metadata dan dukungan deep-linking parameter URL `?campus=...`.
2. **`PtmaHeroBento.tsx`**:
   Bento grid 12-kolom asimetris:
   * Kolom Kiri (`col-span-5`): Kartu *Spotlight #1 PTMA* dengan arsitektur *Double-Bezel* (`rounded-[2rem]` outer shell, `rounded-[calc(2rem-0.5rem)]` inner core) dan aksen emas.
   * Kolom Kanan (`col-span-7`): Grid 2x2 statistik makro nasional (Total PTMA, Scopus Kolektif, Garuda Kolektif, Paten Kolektif).
3. **`VariableSegmentedNav.tsx`**:
   Pill navigasi mengambang (floating island) dengan animasi pegas (spring physics) menggunakan Motion (`motion/react`) via `layoutId="activePillIndicator"`.
4. **`FilterControlBar.tsx`**:
   Bar pencarian nama kampus dengan debounce 350ms dan dropdown filter akreditasi BAN-PT.
5. **`LeaderboardTable.tsx` & `LeaderboardRow.tsx`**:
   Penyajian baris data berarsitektur *Double-Bezel*:
   * Badge peringkat bergradasi logam: Emas (#1), Perak (#2), Perunggu (#3).
   * Kolom angka utama dinamis (`font-mono tabular-nums`) sesuai variabel aktif.
   * Batang visual persentase relatif (*Relative Sparkbar*) terhadap kampus pemuncak.
   * Tombol aksi bergaya *Button-in-Button* ("Rincian ↗").
6. **`PtmaDetailDrawer.tsx`**:
   Drawer geser dari sisi kanan (Slide-Over Sheet) dengan scorecard lengkap 14 variabel kampus, kunci scroll body saat terbuka, aksi salin tautan kampus, dan dukungan penutupan via tombol ESC / klik latar belakang.

---

## 7. Panel Manajemen Super Admin

File: `resources/js/pages/Admin/Sinta/Index.tsx`
Rute: `GET /admin/sinta` (Khusus Super Admin)

### Fitur:
* Proteksi middleware ketat: `['auth', 'verified', 'role:'.Role::SUPER_ADMIN]`. Pengguna non-admin otomatis ditolak dengan `403 Forbidden`.
* 4 Kartu Status: Total Kampus Target, Berhasil Sinkron, Gagal Sinkron, Status Mode Sistem (Mock / Live).
* Tabel riwayat sinkronisasi per kampus beserta status dan pesan error.
* Dialog konfirmasi proteksi (`AlertDialog`) sebelum mengeksekusi pemantik sinkronisasi massal (`POST /admin/sinta/sync`).

---

## 8. Panduan Konfigurasi Lingkungan (`.env`)

Tambahkan konfigurasi berikut ke file `.env` sistem:

```dotenv
# Konfigurasi Integrasi SINTA API v3.0
SINTA_API_URL=http://apisinta.kemdikbud.go.id
SINTA_ENV=prod               # 'dev' untuk pengujian atau 'prod' untuk live
SINTA_USERNAME=your_username
SINTA_PASSWORD=your_password
SINTA_UNIQ_ID=your_uniq_id
SINTA_DAILY_LIMIT=500
SINTA_MOCK_MODE=true         # Set true untuk lokal dev/testing (nol request keluar)
```

---

## 9. Verifikasi & Pengujian

### 1. Menjalankan Migrasi & Seeder Lokal:
```bash
docker exec -i jurnal-mu-app php artisan migrate
docker exec -i jurnal-mu-app php artisan db:seed --class=SintaPtmaSeeder
```

### 2. Menjalankan Backend Test Suite (PHPUnit / Pest):
```bash
docker exec -i jurnal-mu-app php artisan test tests/Feature/Sinta tests/Unit/Sinta
```
*Hasil: 24 test cases, 136 assertions passing (100% green).*

### 3. Menjalankan Frontend Test Suite (Vitest):
```bash
npm test
```
*Hasil: 19 file pengujian, 123 unit/component tests passing (100% green).*

### 4. Pengecekan Type & Build Frontend:
```bash
npm run types
npm run build
```
*Hasil: 0 type errors, build Vite selesai tanpa error.*
