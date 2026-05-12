# Panduan Downgrade PHP 8.4 ke 8.2

## 📋 Ringkasan Analisis

Proyek **jurnal_mu** dapat di-downgrade dari PHP 8.4 ke 8.2 dengan **minimal impact**. Semua dependencies sudah kompatibel dengan PHP 8.2.

---

## ✅ Kompatibilitas Package

### Composer Dependencies (PHP Backend)

Semua package sudah mendukung PHP 8.2:

| Package | Versi Constraint | Kompatibilitas |
|---------|-----------------|----------------|
| `laravel/framework` | ^12.0 | ✅ Support 8.2+ |
| `laravel/sanctum` | ^4.0 | ✅ Support 8.2+ |
| `laravel/socialite` | ^5.23 | ✅ Support 8.2+ |
| `inertiajs/inertia-laravel` | ^2.0 | ✅ Support 8.2+ |
| `spatie/simple-excel` | ^3.9 | ✅ Support 8.2+ |
| `tightenco/ziggy` | ^2.4 | ✅ Support 8.2+ |
| **Dev Tools** |
| `laravel/pint` | ^1.18 | ✅ Support 8.2+ |
| `pestphp/pest` | ^3.8 | ✅ Support 8.2+ |
| `laravel/dusk` | ^8.3 | ✅ Support 8.2+ |

**Kesimpulan**: ✅ Tidak ada masalah dependency. `composer.json` sudah menggunakan `"php": "^8.2"`.

---

## 🔍 Analisis Kode (PHP Features)

### Fitur yang Digunakan dalam Project

#### 1. **`readonly` Properties** ✅ AMAN (PHP 8.1+)
Digunakan di:
- `app/Services/JournalService.php`
- `app/Jobs/HarvestJournalArticlesJob.php`

```php
// Aman untuk PHP 8.2
private readonly JournalCoverService $coverService;
public readonly Journal $journal;
```

#### 2. **Typed Class Constants** - TIDAK DITEMUKAN
Fitur PHP 8.3 baru - tidak digunakan dalam proyek.

#### 3. **Enums** - TIDAK DITEMUKAN
Fitur PHP 8.1 baru - tidak digunakan dalam proyek.

#### 4. **Attributes (#[...])** - MINIMAL
Hanya menggunakan Laravel built-in attributes yang sudah kompatibel dengan 8.2.

#### 5. **Property Hooks** - TIDAK DITEMUKAN
Fitur PHP 8.4 baru - tidak digunakan.

#### 6. **Asymmetric Visibility** - TIDAK DITEMUKAN
Fitur PHP 8.4 baru - tidak digunakan.

**Kesimpulan**: ✅ Kode PHP **sepenuhnya kompatibel dengan PHP 8.2**.

---

## 📦 NPM Dependencies

Frontend dependencies **tidak tergantung pada PHP version**, jadi tidak ada perubahan diperlukan di `package.json`.

---

## 🛠️ Langkah-Langkah Downgrade

### Fase 1: Verifikasi (Local Development)

#### 1. Update Local PHP ke 8.2
```bash
# Jika menggunakan XAMPP di Windows
# Edit: C:\xampp\php\php.ini
# Atau install PHP 8.2 terpisah dan update PATH
```

#### 2. Verifikasi PHP Version
```bash
php --version
# Harus menampilkan: PHP 8.2.x
```

#### 3. Clear Cache & Reinstall Dependencies
```bash
# Clear Laravel cache
php artisan optimize:clear

# Reinstall dependencies (composer.json tidak berubah)
composer install --no-dev

# Jalankan tests
php artisan test
php artisan dusk
```

#### 4. Check untuk Deprecation Warnings
```bash
php artisan lint
./vendor/bin/pint --test
npm run types
npm run lint
```

### Fase 2: Deploy ke Hostinger

#### 1. Update PHP Version di Dashboard Hostinger
- Login ke Hostinger Control Panel
- Navigate ke **PHP Version** settings
- Switch dari PHP 8.4 → PHP 8.2

#### 2. Verifikasi di SSH CLI
```bash
# SSH ke server
php --version
# Pastikan output menunjukkan PHP 8.2.x

# Jika masih tidak konsisten, update .bashrc alias
alias php='/usr/bin/php8.2'
source ~/.bashrc

# Verifikasi ulang
php --version
```

#### 3. Update Production Dependencies
```bash
# Di production server (via SSH)
cd /path/to/jurnal_mu
php artisan optimize:clear
composer install --no-dev --optimize-autoloader
php artisan migrate --force  # Jika ada pending migrations
```

#### 4. Verify Production
```bash
# Test aplikasi via SSH
php artisan tinker
# Jalankan quick test
```

---

## ⚠️ Potensi Issues & Solusi

### Issue #1: "Call to undefined function" setelah downgrade
**Penyebab**: Fitur PHP 8.3+ yang digunakan tapi tidak di-cek saat build.
**Solusi**: 
```bash
# Run full test suite
php artisan test --parallel

# Check untuk deprecated features
php -l app/  # Lint semua file PHP
```

### Issue #2: SSH CLI masih menunjukkan PHP 8.4 setelah downgrade
**Penyebab**: Environment variable atau alias `.bashrc` yang lama.
**Solusi**:
```bash
# SSH ke Hostinger
cat ~/.bashrc | grep php

# Jika ada alias PHP lama, update atau hapus:
# alias php='/usr/bin/php'  # SEBELUM
# alias php='/usr/bin/php8.2'  # SESUDAH

# Apply perubahan
source ~/.bashrc

# Verifikasi
which php
php --version
```

### Issue #3: Composer lock file compatibility
**Penyebab**: `composer.lock` mungkin belum di-regenerate untuk PHP 8.2.
**Solusi**:
```bash
# Regenerate lock file
rm composer.lock
composer install  # Ini akan membuat lock file baru
```

### Issue #4: Queue/Jobs tidak berjalan
**Penyebab**: Mismatch antara PHP CLI dan PHP-FPM version.
**Solusi**:
```bash
# Verifikasi di Hostinger Control Panel bahwa:
# - PHP CLI version = PHP 8.2
# - PHP-FPM version = PHP 8.2
# - Keduanya harus sama

# Test queue di SSH
php artisan queue:work --tries=1
```

---

## 📝 Checklist Pre-Downgrade

- [ ] Backup database production
- [ ] Backup semua code via Git
- [ ] Jalankan test suite lengkap di local
  ```bash
  php artisan test
  php artisan dusk
  npm run types
  npm run lint
  ```
- [ ] Ensure tidak ada pending migrations
  ```bash
  php artisan migrate:status
  ```
- [ ] Clear semua cache
  ```bash
  php artisan optimize:clear
  rm -rf storage/cache/*
  ```
- [ ] Commit perubahan ke Git (jika ada)

---

## 📝 Checklist Post-Downgrade

✅ **Local Development**
- [ ] PHP local sudah 8.2
- [ ] `php artisan test` pass
- [ ] `php artisan dusk` pass (atau smoke test)
- [ ] Build frontend sukses: `npm run build`
- [ ] Tidak ada PHP lint errors

✅ **Production (Hostinger)**
- [ ] PHP CLI menunjukkan 8.2 via SSH
- [ ] PHP-FPM menunjukkan 8.2 di Control Panel
- [ ] Aplikasi dapat diakses via browser
- [ ] Database queries bekerja normal
- [ ] Queue jobs (jika ada) berjalan
- [ ] Monitor error logs untuk 24 jam

```bash
# Check production error log
tail -f storage/logs/laravel.log

# Check PHP-FPM error log di Hostinger (biasanya):
# /home/username/logs/php-fpm.log
```

---

## 🔄 Rollback Plan (Jika Ada Masalah)

Jika terjadi masalah setelah downgrade:

1. **Local Rollback**
```bash
git reset --hard HEAD~1
# Install PHP 8.4 kembali
composer install
```

2. **Production Rollback (Hostinger)**
   - Login ke Hostinger Control Panel
   - Switch PHP version kembali ke 8.4
   - Clear application cache
   - Restart PHP-FPM

3. **Komunikasi ke Users**
   - Jika downtime, post update di status page
   - Jika ada data loss, restore dari backup

---

## 📞 Troubleshooting

### Debug PHP CLI vs FPM mismatch
```bash
# SSH ke Hostinger
# Cek CLI version
php -v

# Cek FPM version - buat file test.php di public/
<?php phpinfo(); ?>
# Akses via browser & cek "Server API"
# Harus sama dengan CLI version
```

### Monitor perubahan setelah downgrade
```bash
# Di local atau server
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Test aplikasi
php artisan tinker
>>> \App\Models\User::count()
>>> exit
```

---

## ✨ Kesimpulan

**Good News**: Downgrade dari PHP 8.4 ke 8.2 adalah **low-risk** karena:
- ✅ Semua packages sudah support PHP 8.2
- ✅ Kode tidak menggunakan fitur PHP 8.3/8.4 yang breaking
- ✅ `readonly` properties (fitur yang digunakan) sudah ada di PHP 8.1
- ✅ Tidak perlu modifikasi kode aplikasi

**Waktu estimasi**: 30 menit - 1 jam (termasuk testing)
