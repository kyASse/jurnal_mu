# UI/UX Design & Frontend Specification
## Modul Menu Langganan DOI & Similarity Check
**Design System**: Tailwind CSS v4 + Radix UI + Lucide React + Plus Jakarta Sans  
**Aesthetic Style**: Clean Enterprise Academic, Tactile Cards, High Contrast, Micro-Interactions  
**Versi**: 1.0.0  
**Tanggal**: 15 Agustus 2026  
**Dokumentasi Terkait**: [PRD.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/PRD.md) | [ARCHITECTURE.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/ARCHITECTURE.md) | [SCHEMA.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/SCHEMA.md) | [ALGORITHM.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/ALGORITHM.md) | [TESTING_LOGS.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/TESTING_LOGS.md)

---

## 1. Design System & Visual Tokens

### 1.1 Color Palette & Semantic Tokens
Desain menggunakan palet warna korporat akademis bernuansa biru tua (Muhammadiyah Blue) berpadu dengan aksen emerald untuk status lunas/aktif, amber untuk pending/peringatan, dan crimson untuk jatuh tempo/ditolak.

```text
--color-primary:        #1E3A8A; /* Blue 900 - Brand Header & Primary CTA */
--color-primary-hover:  #172554; /* Blue 950 */
--color-surface-card:   #FFFFFF; /* Dark: #0F172A */
--color-surface-bg:     #F8FAFC; /* Dark: #020617 */
--color-border-subtle:  #E2E8F0; /* Dark: #1E293B */

/* Status Tokens */
--color-status-active-bg:   #ECFDF5; /* Emerald 50 */
--color-status-active-text: #065F46; /* Emerald 800 */
--color-status-active-dot:  #10B981; /* Emerald 500 */

--color-status-pending-bg:   #EFF6FF; /* Blue 50 */
--color-status-pending-text: #1E40AF; /* Blue 800 */
--color-status-pending-dot:  #3B82F6; /* Blue 500 */

--color-status-unpaid-bg:    #FFFBEB; /* Amber 50 */
--color-status-unpaid-text:  #92400E; /* Amber 800 */
--color-status-unpaid-dot:   #F59E0B; /* Amber 500 */

--color-status-rejected-bg:  #FEF2F2; /* Rose 50 */
--color-status-rejected-text:#991B1B; /* Rose 800 */
--color-status-rejected-dot: #EF4444; /* Rose 500 */
```

### 1.2 Typography & Numerical Formatting
* **Font Family**: Primary `Plus Jakarta Sans`, Secondary `Inter`.
* **Numerical & Invoices**: Menggunakan font dengan dukungan *tabular figures* (`font-mono` atau `tabular-nums`) agar perataan angka pada tabel tagihan dan nominal rupiah tidak bergeser saat data diperbarui.
* **Heading Scale**: `h1` (24px/32px Bold), `h2` (20px/28px SemiBold), `h3` (16px/24px Medium), `body` (14px/20px Regular), `caption` (12px/16px Regular).

---

## 2. Screen 1: Dashboard Langganan DOI

### 2.1 Layout Wireframe (Desktop)

```text
+---------------------------------------------------------------------------------------------------+
|  [Header] Menu Langganan DOI  /  Dashboard                               [ Bantuan & FAQ ] [?]   |
+---------------------------------------------------------------------------------------------------+
|  [STATUS HERO BANNER]                                                                             |
|  [● AKTIF] Masa Langganan Aktif s.d 31 Des 2026 (Sisa 138 Hari)            [ Perpanjang Sekarang ]|
+---------------------------------------------------------------------------------------------------+
|  BENTO GRID SECTION                                                                               |
|  +-----------------------------------+  +------------------------------------------------------+  |
|  | KARTU A: INFORMASI PREFIX CROSSREF|  | KARTU B: SIMILARITY CHECK (iTHENTICATE)              |  |
|  | Prefix Resmi:                     |  | Sisa Kuota: 142 / 200 Dokumen                        |  |
|  | [ 10.22219/  ] [ Salin Prefix ]   |  | [========================.........] 71% Tersedia     |  |
|  | Jumlah Jurnal Terdaftar: 18 Jurnal|  | Terpakai: 58 Dokumen | Kuota Reset: 31 Des 2026      |  |
|  | Status Registrasi: Terverifikasi  |  |                                                      |  |
|  | [ Buka Crossref Portal -> ]       |  | [ + Tambah Kuota Similarity ]                        |  |
|  +-----------------------------------+  +------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
|  +---------------------------------------------------------------------------------------------+  |
|  | KARTU C: TAGIHAN AKTIF & PERINGATAN PEMBAYARAN                                              |  |
|  | [!] Tagihan Periode 2026: INV/DOI/202608/0001 • Rp 7.500.000 (Jatuh Tempo: 15 Sep 2026)      |  |
|  | Status: Menunggu Pembayaran                                  [ Unggah Bukti Bayar Sekarang ] |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

### 2.2 Komponen Kunci Dashboard
1. **Status Hero Banner**:
   * Menampilkan lampu indikator *pulsing dot* hijau jika aktif, kuning jika mendekati masa kadaluwarsa, merah jika telah kadaluwarsa.
   * Countdown waktu aktif dengan visual badge pill yang jelas.
2. **Kartu Prefix Crossref (`DoiPrefixCard`)**:
   * Textbox monospaced berisi prefix resmi institusi dengan tombol *Copy to Clipboard* bersuara/visual tooltip centang hijau saat diklik.
   * Shortcut link eksternal ke Crossref Metadata Manager.
3. **Similarity Check Quota Gauge (`DoiQuotaGauge`)**:
   * Progress gauge bar interaktif dengan transisi halus (`transition-all duration-500`).
   * Rincian dokumen: Total dialokasikan, terpakai, dan sisa.
   * Badge indikator warna (Hijau > 30%, Kuning 10-30%, Merah < 10%).

---

## 3. Screen 2: Tagihan Pembayaran (Invoices)

### 3.1 Layout Wireframe

```text
+---------------------------------------------------------------------------------------------------+
|  [Header] Tagihan Pembayaran DOI                                   [ + Buat Tagihan Baru (Admin)] |
|  Kelola seluruh faktur biaya tahunan dan riwayat pembayaran institusi                             |
+---------------------------------------------------------------------------------------------------+
|  [Search: Cari No. Invoice / Periode...]  [Filter Status: Semua v]  [Filter Tahun: 2026 v]         |
+---------------------------------------------------------------------------------------------------+
|  TABEL TAGIHAN                                                                                    |
|  +--------------------+---------------+----------------+--------------+------------+------------+ |
|  | NO. INVOICE        | PERIODE       | JATUH TEMPO    | NOMINAL (IDR)| STATUS     | AKSI       | |
|  +--------------------+---------------+----------------+--------------+------------+------------+ |
|  | INV/DOI/202608/0001| 2026 (1 Thn)  | 15 Sep 2026    | Rp 7.500.000 | [● UNPAID] | [Bayar] [v]| |
|  | INV/DOI/202508/0038| 2025 (1 Thn)  | 15 Sep 2025    | Rp 6.500.000 | [● LUNAS]  | [Unduh PDF]| |
|  | INV/DOI/202408/0012| 2024 (1 Thn)  | 15 Sep 2024    | Rp 6.000.000 | [● LUNAS]  | [Unduh PDF]| |
|  +--------------------+---------------+----------------+--------------+------------+------------+ |
|  Showing 1 to 3 of 3 invoices                                            [ << ]  [ 1 ]  [ >> ]    |
+---------------------------------------------------------------------------------------------------+
```

### 3.2 Modal / Slide-Over Drawer Detail Tagihan
* **Informasi Rincian Tagihan**:
  * Kop Resmi Majelis Diktilitbang PPM & No. Faktur.
  * Tabel Rincian Biaya:
    * 1x Biaya Pemeliharaan Prefix Crossref Tahunan: Rp 3.500.000
    * 200 Dokumen Alokasi Similarity Check: Rp 4.000.000
    * Diskon Subsidi Afiliasi: - Rp 0
    * **Total Tagihan**: **Rp 7.500.000**
* **Instruksi Pembayaran**:
  * Menampilkan nomor rekening BSI/Mandiri resmi dengan tombol *1-Click Copy*.
  * Tombol CTA primer: **"Unggah Bukti Pembayaran"** (membuka form upload langsung terikat ke ID invoice tersebut).
  * Tombol sekunder: **"Unduh Invoice Resmi (PDF)"**.

---

## 4. Screen 3: Bukti Pembayaran (Payment Proofs & Upload)

### 4.1 Layout Wireframe

```text
+---------------------------------------------------------------------------------------------------+
|  [Tab: Form Unggah Bukti]   [Tab: Riwayat Bukti Pembayaran (2)]                                    |
+---------------------------------------------------------------------------------------------------+
|  [ALERT REJECTION NOTE DARI ADMIN - HANYA TAMPIL JIKA STATUS BUKTI TERAKHIR DITOLAK]             |
|  [!] PERHATIAN: Bukti Pembayaran Terakhir Ditolak oleh Administrator (Diktilitbang)               |
|      Catatan: "Nominal transfer pada resi kurang Rp 500.000 dari total tagihan. Mohon transfer    |
|      kekurangannya dan unggah bukti transfer gabungan."                                           |
+---------------------------------------------------------------------------------------------------+
|  FORMULIR UNGGAH BUKTI PEMBAYARAN                                                                 |
|                                                                                                   |
|  1. Pilih Tagihan:         [ INV/DOI/202608/0001 - Rp 7.500.000 (Periode 2026)                 v] |
|                                                                                                   |
|  2. Rekening Tujuan:       +--------------------------------------------------------------------+ |
|                            | Bank Syariah Indonesia (BSI) - Rekening: 7123-4567-89              | |
|                            | a.n Majelis Diktilitbang PPM             [ Salin Nomor Rekening ]  | |
|                            +--------------------------------------------------------------------+ |
|                                                                                                   |
|  3. Bank Pengirim:         [ Bank Syariah Indonesia (BSI)                                      v] |
|  4. Nama Pemilik Rekening: [ LPPM Universitas Muhammadiyah Contoh                               ] |
|  5. Tanggal Transfer:      [ 15/08/2026                                                       📅] |
|  6. Nominal Ditransfer:    [ Rp 7.500.000                                                       ] |
|                                                                                                   |
|  7. Berkas Bukti Transfer:                                                                        |
|  +----------------------------------------------------------------------------------------------+ |
|  |     [ 📤 DRAG & DROP FILE DISINI ATAU KLIK UNTUK MEMILIH ]                                   | |
|  |     Mendukung format: JPG, PNG, PDF (Maksimum 5 MB)                                          | |
|  +----------------------------------------------------------------------------------------------+ |
|  | File terpilih: bukti_transfer_bsi_agustus2026.pdf (1.2 MB) [ Preview ] [ Hapus ]              | |
|                                                                                                   |
|  8. Catatan Pengirim:      [ Pembayaran langganan DOI tahun 2026 LPPM UM Contoh                 ] |
|                                                                                                   |
|  [ Batal ]                                                     [ Kirim Bukti Pembayaran (Submit) ]|
+---------------------------------------------------------------------------------------------------+
```

### 4.2 Status Verifikasi Tracker & Riwayat Bukti
Tabel Riwayat Bukti Pembayaran menampilkan:
* **Tanggal Kirim**: `15 Agu 2026, 14:30 WIB`
* **Invoice Terkait**: `INV/DOI/202608/0001`
* **Nominal Dilaporkan**: `Rp 7.500.000`
* **Status Verifikasi Badge**:
  * `Menunggu Verifikasi` (Pill Biru dengan ikon Jam/Clock).
  * `Disetujui` (Pill Hijau dengan ikon Check-Circle).
  * `Ditolak` (Pill Merah dengan ikon Alert-Triangle + Tooltip/Modal Catatan).
* **Catatan Admin**: Kotak deskripsi catatan langsung di baris tabel jika ditolak.
* **Aksi**: Tombol *Lihat Berkas* (Signed Preview Modal) & Tombol *Unggah Ulang*.

---

## 5. Screen 4: Super Admin Verification Drawer (Admin View)

### 5.1 Wireframe Split-View Modal Review
Ketika Super Admin membuka antrian bukti pembayaran yang berstatus *Menunggu Verifikasi*:

```text
+---------------------------------------------------------------------------------------------------+
|  Verifikasi Bukti Pembayaran: INV/DOI/202608/0001                                            [ X ]|
+-------------------------------------------------+-------------------------------------------------+
|  PANEL KIRI: DOKUMEN BUKTI TRANSFER             |  PANEL KANAN: DATA TRANSAKSI & AKSI REVIEW      |
|  +-------------------------------------------+  |  Universitas:  Univ. Muhammadiyah Contoh        |
|  | [ PDF / IMAGE PREVIEW AREA ]              |  |  No. Invoice:  INV/DOI/202608/0001              |
|  | [ Zoom + ] [ Zoom - ] [ Rotate ] [ Unduh ]|  |  Total Tagihan:Rp 7.500.000                     |
|  |                                           |  |  ---------------------------------------------  |
|  |  +-------------------------------------+  |  |  Bank Asal:    Bank Syariah Indonesia (BSI)     |
|  |  | RESI TRANSFER BANK                  |  |  |  Nama Rekening:LPPM UM Contoh                   |
|  |  | Tanggal: 15/08/2026 14:12           |  |  |  Nominal Bukti:Rp 7.500.000 [✓ MATCH]          |
|  |  | Jumlah: Rp 7.500.000                |  |  |  Tanggal Kirim:15/08/2026 14:30 WIB             |
|  |  | Tujuan: Majelis Diktilitbang PPM    |  |  |  ---------------------------------------------  |
|  |  +-------------------------------------+  |  |  Catatan Verifikator (Wajib diisi jika tolak):  |
|  +-------------------------------------------+  |  [ Masukkan catatan untuk pengelola jurnal... ] |
|                                                 |                                                 |
|                                                 |  [ ✕ Tolak Bukti Bayar ]   [ ✓ Setujui & Lunas ]|
+-------------------------------------------------+-------------------------------------------------+
```

---

## 6. Accessibility & Responsive Checklist

* **Touch Target Size**: Seluruh tombol aksi, tab, dan area upload memiliki target sentuh minimum $\ge 44 \times 44\text{ px}$ pada tampilan mobile.
* **Color Contrast**: Rasio kontras teks status dan tombol memenuhi standar WCAG AA $\ge 4.5:1$ (e.g., teks hijau tua `#065F46` di atas latar `#ECFDF5`).
* **Keyboard Navigation**: Form dropzone dapat diakses melalui tombol `Tab` dan diaktivasi menggunakan tombol `Enter`/`Space`.
* **Screen Reader Accessibility**: Seluruh badge status memiliki atribut `aria-label` deskriptif (misal: `aria-label="Status langganan aktif"`).
* **Mobile Responsiveness**: Pada viewport `< 768px`, tabel bertransformasi menjadi *Card List View* dengan tombol aksi yang mudah dijangkau satu tangan (*thumb zone friendly*).
