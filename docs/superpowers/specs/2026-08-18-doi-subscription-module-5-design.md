# Technical Design Spec: DOI Subscription Module 5 (Background Scheduler & Notifikasi Email / In-App)

**Document Metadata**:
- **Topic**: Modul 5 - Background Scheduler & Notifikasi Email / In-App
- **Date**: 2026-08-18
- **Status**: APPROVED
- **Target Branch**: `feat/doi-subscription-module-5`
- **Dependencies**: Modul 0 (Database & Models), Modul 1 (Core Actions, Services, Security Policies), Modul 2 (Dashboard DOI), Modul 3 (Invoices & Payment Proof Workflow), Modul 4 (Super Admin Management & Verification Drawer)

---

## 1. Overview & Objective

Modul 5 melengkapi siklus hidup (*lifecycle*) otomatisasi langganan DOI dan sistem notifikasi transaksional:
1. **Background Scheduler Console Commands**:
   - `CheckExpiringDoiSubscriptionsCommand` (`doi:check-expiring-subscriptions`): Evaluasi harian `end_date` masa berlaku langganan. Melakukan transisi otomatis `ACTIVE` $\to$ `GRACE_PERIOD` (D+0 s.d D+7) atau `EXPIRED` (> D+7) dan mengirimkan notifikasi status langganan.
   - `SendInvoiceDueReminderCommand` (`doi:send-due-reminders`): Memindai faktur `UNPAID` dan mengirimkan notifikasi pengingat jatuh tempo pada interval H-30, H-14, H-7, H-1, dan hari-H jatuh tempo.
2. **Event Listeners**:
   - `SendPaymentProofUploadedNotification`: Menangkap event `PaymentProofUploaded` saat pengguna mengunggah bukti bayar $\to$ mengirimkan notifikasi ke seluruh `Role::SUPER_ADMIN` (Majelis Diktilitbang PPM).
   - `SendSubscriptionActivatedNotification`: Menangkap event `SubscriptionActivated` saat Super Admin menyetujui bukti bayar $\to$ mengirimkan notifikasi konfirmasi lunas & aktivasi langganan ke Admin Kampus & Pengelola Jurnal.
   - `SendPaymentProofRejectedNotification`: Menangkap event `PaymentProofRejected` saat Super Admin menolak bukti bayar $\to$ mengirimkan notifikasi penolakan beserta catatan admin verifikator ke Admin Kampus & Pengelola Jurnal.
3. **Dual-Channel Delivery (`mail` + `database`)**:
   - Format email Markdown responsif resmi Majelis Diktilitbang PPM.
   - Payload JSON terstruktur di tabel `notifications` untuk indikator lonceng / in-app notifications.
   - Asinkron (`ShouldQueue`) untuk performa tinggi tanpa membebani request web.

---

## 2. File & Component Breakdown

```text
app/
├── Console/
│   └── Commands/
│       └── Doi/
│           ├── CheckExpiringDoiSubscriptionsCommand.php # doi:check-expiring-subscriptions
│           └── SendInvoiceDueReminderCommand.php        # doi:send-due-reminders
├── Listeners/
│   └── Doi/
│       ├── SendPaymentProofUploadedNotification.php     # Listener PaymentProofUploaded -> Super Admin
│       ├── SendSubscriptionActivatedNotification.php    # Listener SubscriptionActivated -> User
│       └── SendPaymentProofRejectedNotification.php     # Listener PaymentProofRejected -> User
├── Notifications/
│   └── Doi/
│       ├── DoiPaymentProofUploadedNotification.php      # Ke Super Admin saat ada bukti baru
│       ├── DoiSubscriptionActivatedNotification.php     # Ke Institusi/User saat bukti disetujui (Lunas)
│       ├── DoiPaymentProofRejectedNotification.php      # Ke Institusi/User saat bukti ditolak
│       ├── DoiInvoiceDueReminderNotification.php        # Ke Institusi/User pengingat jatuh tempo
│       └── DoiSubscriptionStatusChangedNotification.php # Ke Institusi/User saat masuk grace period / expired
└── Providers/
    └── AppServiceProvider.php                           # Event listener bindings
routes/
└── console.php                                          # Schedule definitions
tests/
└── Feature/
    └── Doi/
        └── DoiSchedulerAndNotificationTest.php          # Feature tests
```

---

## 3. Console Commands & Scheduler Logic

### 3.1 `CheckExpiringDoiSubscriptionsCommand` (`doi:check-expiring-subscriptions`)
- **Jadwal**: Harian pukul `01:00 WIB` (`Asia/Jakarta`).
- **Transisi Status**:
  1. `ACTIVE` $\to$ `GRACE_PERIOD`: `end_date < now()->startOfDay()` dan `end_date >= now()->subDays(7)->startOfDay()`. Dispatches `DoiSubscriptionStatusChangedNotification` (`status = 'grace_period'`).
  2. `[ACTIVE, GRACE_PERIOD]` $\to$ `EXPIRED`: `end_date < now()->subDays(7)->startOfDay()`. Dispatches `DoiSubscriptionStatusChangedNotification` (`status = 'expired'`).

### 3.2 `SendInvoiceDueReminderCommand` (`doi:send-due-reminders`)
- **Jadwal**: Harian pukul `08:00 WIB` (`Asia/Jakarta`).
- **Target**: `DoiInvoice` dengan `status = InvoiceStatus::UNPAID`.
- **Interval Target**: H-30, H-14, H-7, H-1, H-0 (Due Date), Overdue.
- **Notifikasi**: `DoiInvoiceDueReminderNotification` dikirimkan ke penanggung jawab invoice.

---

## 4. Notifications & Listeners Specification

Setiap kelas notifikasi mengimplementasikan `ShouldQueue` dan saluran `['mail', 'database']`:

| Notifikasi | Penerima | Pemicu (Trigger) | Konten Utama |
| :--- | :--- | :--- | :--- |
| `DoiPaymentProofUploadedNotification` | Seluruh `Role::SUPER_ADMIN` | `PaymentProofUploaded` Event | Notifikasi bukti bayar baru masuk untuk diverifikasi + link ke drawer verifikasi Super Admin |
| `DoiSubscriptionActivatedNotification` | User / Admin Kampus | `SubscriptionActivated` Event | Konfirmasi faktur lunas, perpanjangan masa aktif $+1$ tahun, penambahan kuota similarity + link ke dashboard |
| `DoiPaymentProofRejectedNotification` | User / Admin Kampus | `PaymentProofRejected` Event | Pemberitahuan penolakan bukti bayar, catatan verifikator + link ke drawer unggah ulang |
| `DoiInvoiceDueReminderNotification` | User / Admin Kampus | `doi:send-due-reminders` Command | Rincian tagihan, sisa hari jatuh tempo, info rekening transfer resmi BSI/Mandiri + tombol Bayar Sekarang |
| `DoiSubscriptionStatusChangedNotification` | User / Admin Kampus | `doi:check-expiring-subscriptions` | Pemberitahuan masa tenggang 7 hari / status kadaluwarsa layanan DOI + panduan perpanjangan |

---

## 5. Testing & Verification Plan

### 5.1 Automated Feature Test (`tests/Feature/Doi/DoiSchedulerAndNotificationTest.php`)
- `test_check_expiring_subscriptions_command_transitions_active_to_grace_period`: Assert status `GRACE_PERIOD` dan notifikasi terkirim.
- `test_check_expiring_subscriptions_command_transitions_grace_period_to_expired_after_7_days`: Assert status `EXPIRED` dan notifikasi terkirim.
- `test_send_invoice_due_reminder_command_sends_notification_for_unpaid_invoices`: Assert pengingat jatuh tempo terkirim pada interval target.
- `test_payment_proof_uploaded_event_triggers_super_admin_notification`: Assert event `PaymentProofUploaded` mengirim notifikasi ke Super Admin.
- `test_subscription_activated_event_triggers_user_notification`: Assert event `SubscriptionActivated` mengirim notifikasi persetujuan ke user.
- `test_payment_proof_rejected_event_triggers_user_rejection_notification`: Assert event `PaymentProofRejected` mengirim notifikasi penolakan dengan `admin_notes` ke user.

### 5.2 Full Regression Test Suite
- `docker exec -i jurnal-mu-app php artisan test --filter=Doi`: 100% lulus.
