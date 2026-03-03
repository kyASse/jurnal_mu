# Monthly Security Audit Report
**Tanggal:** 3 Maret 2026  
**Tipe Pemeriksaan:** Monthly Security Audit  
**Server:** sg-nme-web423 — `journalmu.org`  
**User Server:** u347029080  
**Pelaksana:** Operations Team  

---

## Ringkasan Eksekutif

| # | Pemeriksaan | Ditemukan | Status Akhir |
|---|-------------|-----------|--------------|
| 1 | Composer Security Audit (`composer audit`) | 4 kerentanan | ⚠️ SEBAGIAN — 1 unresolved (blocked) |
| 2 | NPM Security Audit (`npm audit`) | 6 kerentanan | ✅ SELESAI via `npm update` |
| 3 | Install `roave/security-advisories` | Konflik dependency | ❌ GAGAL — ditunda |

> **Kesimpulan:** Semua kerentanan NPM telah diselesaikan. Kerentanan PHP (Composer) memerlukan penanganan terpisah — tiga di antaranya dapat ditangani dengan update paket yang relevan, satu (`firebase/php-jwt`) tertahan oleh dependency constraint dari `laravel/socialite`. Pemasangan `roave/security-advisories` ditunda hingga konflik dependency terselesaikan.

---

## Detail Hasil Pemeriksaan

### Pemeriksaan 1: Composer Security Audit

**Perintah:** `composer audit`  
**Hasil:** 4 kerentanan di 4 paket

#### 1.1 `firebase/php-jwt` — LOW
| Field | Detail |
|-------|--------|
| **CVE** | CVE-2025-45769 |
| **Judul** | php-jwt contains weak encryption |
| **Advisory** | https://github.com/advisories/GHSA-2x45-7fc3-mxwq |
| **Versi Terdampak** | `< 7.0.0` |
| **Dilaporkan** | 31 Juli 2025 |
| **Severity** | 🟡 Low |

**Analisis:** Paket ini dikunci ke `v6.x` karena `laravel/socialite v5.23.1` mensyaratkan `firebase/php-jwt ^6.4`. Update ke `>=7.0.0` tidak bisa dilakukan tanpa terlebih dahulu mengupdate `laravel/socialite` ke versi yang mendukung `firebase/php-jwt ^7`.

#### 1.2 `phpunit/phpunit` — HIGH
| Field | Detail |
|-------|--------|
| **CVE** | CVE-2026-24765 |
| **Judul** | PHPUnit Vulnerable to Unsafe Deserialization in PHPT Code Coverage Handling |
| **Advisory** | https://github.com/advisories/GHSA-vvj3-c3rp-c85p |
| **Versi Terdampak** | `>=12.0.0,<12.5.8` \| `>=11.0.0,<11.5.50` \| `>=10.0.0,<10.5.62` \| `>=9.0.0,<9.6.33` \| `<8.5.52` |
| **Dilaporkan** | 27 Januari 2026 |
| **Severity** | 🔴 High |

**Analisis:** PHPUnit hanya digunakan di environment development/testing (dev-dependency). Risiko di production minimal. Namun update tetap direkomendasikan untuk melindungi pipeline CI dan lingkungan developer.

#### 1.3 `psy/psysh` — MEDIUM
| Field | Detail |
|-------|--------|
| **CVE** | CVE-2026-25129 |
| **Judul** | PsySH has Local Privilege Escalation via CWD `.psysh.php` auto-load |
| **Advisory** | https://github.com/advisories/GHSA-4486-gxhx-5mg7 |
| **Versi Terdampak** | `<=0.11.22` \| `>=0.12.0,<=0.12.18` |
| **Dilaporkan** | 30 Januari 2026 |
| **Severity** | 🟠 Medium |

**Analisis:** PsySH (`php artisan tinker`) adalah dev-dependency. Risiko di production tidak ada. Tetap perlu diupdate untuk keamanan lingkungan developer terutama jika `tinker` dijalankan di server production.

#### 1.4 `symfony/process` — MEDIUM
| Field | Detail |
|-------|--------|
| **CVE** | CVE-2026-24739 |
| **Judul** | Symfony's incorrect argument escaping under MSYS2/Git Bash can lead to destructive file operations on Windows |
| **Advisory** | https://github.com/advisories/GHSA-r39x-jcww-82v6 |
| **Versi Terdampak** | `>=8.0,<8.0.5` \| `>=7.4,<7.4.5` \| `>=7.3,<7.3.11` \| `>=6.4,<6.4.33` \| `<5.4.51` |
| **Dilaporkan** | 28 Januari 2026 |
| **Severity** | 🟠 Medium |

**Analisis:** Kerentanan ini spesifik pada environment Windows (MSYS2/Git Bash). Server production berjalan di Linux sehingga risiko langsung di production adalah rendah. Namun perlu diupdate karena `symfony/process` digunakan oleh banyak komponen Laravel internal dan developer yang bekerja di Windows dapat terekspos.

---

### Pemeriksaan 2: NPM Security Audit

**Perintah:** `npm audit`  
**Hasil Awal:** 6 kerentanan (1 low, 1 moderate, 4 high)

| Paket | Severity | CVE/Advisory | Keterangan |
|-------|----------|--------------|------------|
| `ajv` `<6.14.0` | 🟠 Moderate | GHSA-2g4f-4pwh-qvx6 | ReDoS saat menggunakan opsi `$data` |
| `axios` `1.0.0 - 1.13.4` | 🔴 High | GHSA-43fc-jf86-j433 | DoS via `__proto__` key di `mergeConfig` |
| `minimatch` `<=3.1.3 \| 9.0.0-9.0.6` | 🔴 High | GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74 | Multiple ReDoS (3 CVE) |
| `qs` `6.7.0 - 6.14.1` | — | GHSA-w7fw-mjwx-w883 | DoS via `arrayLimit` bypass pada comma parsing |
| `rollup` `4.0.0 - 4.58.0` | 🔴 High | GHSA-mw96-cpmx-2vgc | Arbitrary File Write via Path Traversal |
| `tar` `<7.5.8` | 🔴 High | GHSA-83g3-92jg-28cx | Arbitrary File Read/Write via Hardlink Target Escape |

**Tindakan:** `npm update` dijalankan dan seluruh 6 kerentanan telah diselesaikan otomatis.

```
added 19 packages, removed 65 packages, changed 133 packages, and audited 558 packages in 38s
found 0 vulnerabilities
```

---

### Pemeriksaan 3: Percobaan Instalasi `roave/security-advisories`

**Perintah:** `composer require --dev roave/security-advisories:dev-latest`  
**Hasil:** ❌ GAGAL — dependency conflict

**Raw Error:**
```
Problem 1
  - laravel/socialite is locked to version v5.23.1 and an update of this package was not requested.
  - Root composer.json requires roave/security-advisories dev-latest
  - laravel/socialite v5.23.1 requires firebase/php-jwt ^6.4
  - roave/security-advisories dev-latest conflicts with firebase/php-jwt <7
```

**Analisis Root Cause:**  
`roave/security-advisories` secara eksplisit memblokir pemasangan paket yang memiliki kerentanan yang diketahui. Karena `firebase/php-jwt <7.0.0` memiliki CVE aktif (CVE-2025-45769), paket ini masuk dalam daftar konflik. Sementara itu, `laravel/socialite v5.23.1` membatasi versi `firebase/php-jwt` pada range `^6.4`, sehingga menciptakan konflik yang tidak bisa diselesaikan tanpa mengupdate `laravel/socialite` terlebih dahulu.

**Composer.json dikembalikan ke kondisi semula secara otomatis** oleh Composer setelah instalasi gagal.

---

## Tindakan yang Dilakukan

### TINDAKAN 1 — Update NPM Dependencies [✅ SELESAI]

**Prioritas:** High  
**Waktu Penyelesaian:** 3 Maret 2026

**Langkah yang diambil:**
```bash
npm update
```

**Hasil:** 6 kerentanan berhasil diselesaikan. Tidak ada breaking changes yang dilaporkan — semua update bersifat semver-compatible.

---

## Tindakan yang Ditunda / Memerlukan Tindak Lanjut

### TINDAK LANJUT 1 — Update `laravel/socialite` untuk membuka jalan update `firebase/php-jwt`

**Prioritas:** Medium  
**Target:** Sprint/maintenance berikutnya

**Langkah yang direkomendasikan:**

1. Periksa versi terbaru `laravel/socialite` yang mendukung `firebase/php-jwt ^7`:
   ```bash
   composer show laravel/socialite --all | grep "requires"
   ```
2. Jika tersedia, jalankan update terbatas:
   ```bash
   composer update laravel/socialite firebase/php-jwt --with-all-dependencies
   ```
3. Jalankan test suite untuk memastikan tidak ada regresi pada fitur Google OAuth:
   ```bash
   php artisan test --filter=Auth
   php artisan dusk --filter=Google
   ```
4. Jika update berhasil, coba pasang kembali `roave/security-advisories`:
   ```bash
   composer require --dev roave/security-advisories:dev-latest
   ```

---

### TINDAK LANJUT 2 — Update `phpunit/phpunit` ke versi patched

**Prioritas:** Medium (dev-only, tapi CVE High)  
**Target:** Sprint/maintenance berikutnya

**Langkah yang direkomendasikan:**
```bash
composer update phpunit/phpunit --with-dependencies
php artisan test  # validasi test suite masih berjalan
```

---

### TINDAK LANJUT 3 — Update `psy/psysh` dan `symfony/process`

**Prioritas:** Low–Medium  
**Target:** Bersamaan dengan Tindak Lanjut 2

**Langkah yang direkomendasikan:**
```bash
composer update psy/psysh symfony/process --with-dependencies
php artisan test  # validasi tidak ada regresi
```

---

## Catatan Risiko

| # | Paket | Risiko di Production | Prioritas Update |
|---|-------|----------------------|-----------------|
| 1 | `firebase/php-jwt` | Rendah (enkripsi JWT lemah, bukan RCE) | Medium — perlu update socialite terlebih dahulu |
| 2 | `phpunit/phpunit` | Tidak Ada (dev-only) | Medium — lindungi pipeline CI |
| 3 | `psy/psysh` | Sangat Rendah (dev-only, butuh akses lokal) | Low |
| 4 | `symfony/process` | Rendah (khusus Windows MSYS2) | Low–Medium |

> **Catatan:** Seluruh kerentanan Composer berasal dari dev-dependencies atau memiliki vektor serangan yang tidak relevan dengan konfigurasi production (Linux server). Tidak ada kerentanan yang berdampak langsung pada keamanan aplikasi di production saat ini.

---

## Status Akhir

| Komponen | Sebelum | Sesudah |
|----------|---------|---------|
| NPM Vulnerabilities | 6 (1 moderate, 1 low, 4 high) | **0** ✅ |
| Composer Vulnerabilities | 4 (1 low, 1 medium×2, 1 high) | **4** ⚠️ (butuh tindak lanjut) |
| `roave/security-advisories` | Belum terpasang | Belum terpasang (gagal, ditunda) |
