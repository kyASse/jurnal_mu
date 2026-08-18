# Walkthrough: DOI Subscription Module 5 (Background Scheduler & Notifikasi Email / In-App)

**Target Branch:** `feat/doi-subscription-module-5`  
**Status:** COMPLETED & FULLY VERIFIED (100% Tests Passing, Build Clean)

---

## 1. Accomplishments Overview

Modul 5 menyempurnakan otomatisasi background scheduler dan siklus notifikasi transaksional terpadu (Mail Markdown + Database In-App) untuk ekosistem langganan DOI:
1. **Background Console Scheduler (`routes/console.php`)**:
   - `doi:check-expiring-subscriptions` (`CheckExpiringDoiSubscriptionsCommand.php`): Evaluasi harian pukul `01:00 WIB` untuk mendeteksi `end_date` langganan $\to$ transisi otomatis ke `GRACE_PERIOD` (D+0 s.d D+7) atau `EXPIRED` (> D+7) + dispatch `DoiSubscriptionStatusChangedNotification`.
   - `doi:send-due-reminders` (`SendInvoiceDueReminderCommand.php`): Pindaian harian pukul `08:00 WIB` untuk faktur `UNPAID` $\to$ dispatch `DoiInvoiceDueReminderNotification` pada interval H-30, H-14, H-7, H-1, H-0, dan overdue.
2. **Event Listeners Terdaftar (`app/Listeners/Doi/`)**:
   - `SendPaymentProofUploadedNotification`: Menangkap event `PaymentProofUploaded` saat bukti bayar diunggah $\to$ notifikasi otomatis ke semua Super Admin (`Role::SUPER_ADMIN`).
   - `SendSubscriptionActivatedNotification`: Menangkap event `SubscriptionActivated` saat Super Admin menyetujui faktur $\to$ notifikasi konfirmasi lunas & aktivasi langganan $+1$ tahun ke Institusi/User.
   - `SendPaymentProofRejectedNotification`: Menangkap event `PaymentProofRejected` saat Super Admin menolak faktur $\to$ notifikasi alasan penolakan beserta catatan admin ke Institusi/User.
3. **Dual-Channel Delivery (`mail` + `database`)**:
   - Saluran email Markdown responsif dengan tombol CTA interaktif dan format currency monospaced.
   - Saluran database JSON terstruktur di tabel `notifications` untuk indikator lonceng / in-app navbar.
   - Asinkron (`ShouldQueue`) untuk performa tinggi tanpa membebani respon HTTP.

---

## 2. File & Component Breakdown

### Console Commands & Scheduler
- [`app/Console/Commands/Doi/CheckExpiringDoiSubscriptionsCommand.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Console/Commands/Doi/CheckExpiringDoiSubscriptionsCommand.php)
- [`app/Console/Commands/Doi/SendInvoiceDueReminderCommand.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Console/Commands/Doi/SendInvoiceDueReminderCommand.php)
- [`routes/console.php`](file:///c:/xampp/htdocs/jurnal_mu/routes/console.php)

### Notifications & Listeners
- [`app/Notifications/Doi/DoiPaymentProofUploadedNotification.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Notifications/Doi/DoiPaymentProofUploadedNotification.php)
- [`app/Notifications/Doi/DoiSubscriptionActivatedNotification.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Notifications/Doi/DoiSubscriptionActivatedNotification.php)
- [`app/Notifications/Doi/DoiPaymentProofRejectedNotification.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Notifications/Doi/DoiPaymentProofRejectedNotification.php)
- [`app/Notifications/Doi/DoiInvoiceDueReminderNotification.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Notifications/Doi/DoiInvoiceDueReminderNotification.php)
- [`app/Notifications/Doi/DoiSubscriptionStatusChangedNotification.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Notifications/Doi/DoiSubscriptionStatusChangedNotification.php)
- [`app/Listeners/Doi/SendPaymentProofUploadedNotification.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Listeners/Doi/SendPaymentProofUploadedNotification.php)
- [`app/Listeners/Doi/SendSubscriptionActivatedNotification.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Listeners/Doi/SendSubscriptionActivatedNotification.php)
- [`app/Listeners/Doi/SendPaymentProofRejectedNotification.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Listeners/Doi/SendPaymentProofRejectedNotification.php)
- [`app/Providers/AppServiceProvider.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Providers/AppServiceProvider.php)

### Automated Test Suite
- [`tests/Feature/Doi/DoiSchedulerAndNotificationTest.php`](file:///c:/xampp/htdocs/jurnal_mu/tests/Feature/Doi/DoiSchedulerAndNotificationTest.php)

---

## 3. Verification Results

### Automated Tests
- `tests/Feature/Doi/DoiSchedulerAndNotificationTest.php`: **6 passed (11 assertions)**
- Full DOI Test Suite: **53 passed (425 assertions)**

### Frontend Build
- `npm run build`: built in **59.08s** (0 errors).
