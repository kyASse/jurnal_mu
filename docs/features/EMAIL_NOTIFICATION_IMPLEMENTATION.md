# Email Notification Integration

**Date**: February 24, 2026  
**Status**: ✅ FASE 1 & 2 COMPLETED (Fase 3 — Pembinaan Deferred)  
**Related**: [SOFTLAUNCHING_NOTES_12_FEB_2026.md](../meeting-notes/SOFTLAUNCHING_NOTES_12_FEB_2026.md), [MEETING_NOTES_08_FEB_2026.md](../meeting-notes/MEETING_NOTES_08_FEB_2026.md)

---

## 📋 Overview

Implementasi notifikasi email untuk semua event approval/rejection dan penugasan di platform Jurnal MU. Fitur ini merupakan action item dari soft launch (12 Feb 2026): *"Aktifkan notifikasi email untuk approval/actions — Segera"*.

**Semua notifikasi menggunakan dual channel**: `mail` (email SMTP) + `database` (in-app notification yang sudah ada di frontend). Semua notifikasi berjalan secara async melalui Laravel Queue (`ShouldQueue`).

---

## ✅ Sudah Terimplementasi

### Infrastruktur

| Komponen | Detail |
|---|---|
| **Queue Table** | Migration `create_jobs_table` sudah dijalankan |
| **Queue Driver** | `QUEUE_CONNECTION=database` (`.env.example`) |
| **Mail Config** | `.env.example` diupdate ke Mailtrap (staging), `MAIL_FROM_ADDRESS=noreply@jurnalmu.id` |
| **Worker Command** | `php artisan queue:work --tries=3` |

### Notifikasi yang Sudah Ada Sebelumnya (Live sebelum Fase ini)

| Class | Trigger | Penerima | Template |
|---|---|---|---|
| `AssessmentApprovedNotification` | Admin Kampus approve assessment | Pengelola Jurnal (User) | `emails.assessment-approved` |
| `AssessmentRevisionRequestedNotification` | Admin Kampus request revisi | Pengelola Jurnal (User) | `emails.assessment-revision-requested` |

### Fase 1 — Notifikasi Prioritas Tinggi (Approval/Rejection)

#### 1a. Approval/Rejection Pendaftaran User

**Controller**: `AdminKampus\UserApprovalController` — method `approve()` dan `reject()`

| Class | Trigger | Penerima |
|---|---|---|
| `UserApprovedNotification` | Admin Kampus approve pendaftaran user | Pendaftar (User) |
| `UserRejectedNotification` | Admin Kampus reject pendaftaran user | Pendaftar (User) |

**File**:
- `app/Notifications/UserApprovedNotification.php`
- `app/Notifications/UserRejectedNotification.php`
- `resources/views/emails/user-approved.blade.php`
- `resources/views/emails/user-rejected.blade.php`

**Payload Email**:
- Approved: nama, email, nama universitas, link ke halaman login
- Rejected: nama, email, nama universitas, **alasan penolakan**, link ke halaman login

---

#### 1b. Approval/Rejection Registrasi Admin LPPM

**Controller**: `Admin\LppmApprovalController` — method `approve()` dan `reject()`

| Class | Trigger | Penerima |
|---|---|---|
| `LppmApprovedNotification` | Dikti (Super Admin) approve registrasi LPPM | Pendaftar LPPM |
| `LppmRejectedNotification` | Dikti (Super Admin) reject registrasi LPPM | Pendaftar LPPM |

**File**:
- `app/Notifications/LppmApprovedNotification.php`
- `app/Notifications/LppmRejectedNotification.php`
- `resources/views/emails/lppm-approved.blade.php`
- `resources/views/emails/lppm-rejected.blade.php`

**Payload Email**:
- Approved: nama, email, nama universitas, role yang diterima (Admin Kampus), link login
- Rejected: nama, email, nama universitas, **alasan penolakan**, link login

---

#### 1c. Approval/Rejection Pengajuan Jurnal

**Controller**: `AdminKampus\JournalApprovalController` — method `approve()` dan `reject()`

| Class | Trigger | Penerima |
|---|---|---|
| `JournalApprovedNotification` | Admin Kampus approve jurnal | Pengelola Jurnal (User) |
| `JournalRejectedNotification` | Admin Kampus reject jurnal | Pengelola Jurnal (User) |

**File**:
- `app/Notifications/JournalApprovedNotification.php`
- `app/Notifications/JournalRejectedNotification.php`
- `resources/views/emails/journal-approved.blade.php`
- `resources/views/emails/journal-rejected.blade.php`

**Payload Email**:
- Approved: judul jurnal, ISSN/E-ISSN, nama universitas, tanggal disetujui, link ke hal. jurnal
- Rejected: judul jurnal, ISSN/E-ISSN, nama universitas, **alasan penolakan**, link ke hal. jurnal

---

### Fase 2 — Notifikasi Prioritas Sedang (Alerts & Assignments)

#### 2a. Alert Pendaftaran Baru ke Admin

**Controller**: `Auth\RegisteredUserController` — method `store()`

| Class | Trigger | Penerima |
|---|---|---|
| `NewLPPMRegistrationNotification` | LPPM baru mendaftar | Semua Super Admin |
| `NewUserRegistrationNotification` | Pengelola Jurnal baru mendaftar | Semua Admin Kampus aktif di universitas yang sama |

**File**:
- `app/Notifications/NewLPPMRegistrationNotification.php`
- `app/Notifications/NewUserRegistrationNotification.php`
- `resources/views/emails/new-lppm-registration.blade.php`
- `resources/views/emails/new-user-registration.blade.php`

**Payload Email**:
- Nama pendaftar, email, universitas, waktu daftar, link ke halaman pending approval

---

#### 2b. Reassignment Jurnal

**Controller**: `AdminKampus\JournalController` — method `reassign()`

| Class | Trigger | Penerima |
|---|---|---|
| `JournalReassignedNotification` (type: `'removed'`) | Admin Kampus reassign jurnal | Manager lama |
| `JournalReassignedNotification` (type: `'assigned'`) | Admin Kampus reassign jurnal | Manager baru |

**File**:
- `app/Notifications/JournalReassignedNotification.php`
- `resources/views/emails/journal-reassigned.blade.php`

**Catatan**: Satu class, dua pengiriman — satu ke manager lama (`'removed'`) dan satu ke manager baru (`'assigned'`). Template Blade menggunakan conditional `@if($type === 'assigned')` untuk konten yang berbeda.

---

#### 2c. Penugasan Reviewer

**Controller**: `Dikti\AssessmentController` — method `assignReviewer()`

| Class | Trigger | Penerima |
|---|---|---|
| `ReviewerAssignedNotification` | Dikti assign reviewer ke assessment | Reviewer yang ditugaskan |

**File**:
- `app/Notifications/ReviewerAssignedNotification.php`
- `resources/views/emails/reviewer-assigned.blade.php`

**Payload Email**: nama jurnal, ISSN, universitas, periode assessment, tanggal ditugaskan, link ke halaman assignments reviewer

---

## 🟡 Belum Terimplementasi (Deferred)

### Fase 3 — Notifikasi Pembinaan

Fitur Pembinaan masih membutuhkan klarifikasi scope sebelum notifikasinya diimplementasi:

| Event | Controller | Penerima | Class yang Perlu Dibuat |
|---|---|---|---|
| Admin Kampus approve registrasi pembinaan | `AdminKampus\PembinaanController@approve` | Pendaftar (User) | `PembinaanApprovedNotification` |
| Admin Kampus reject registrasi pembinaan | `AdminKampus\PembinaanController@reject` | Pendaftar (User) | `PembinaanRejectedNotification` |
| Admin Kampus assign reviewer pembinaan | `AdminKampus\PembinaanController@assignReviewer` | Reviewer | `PembinaanReviewerAssignedNotification` |
| User submit registrasi pembinaan | `User\PembinaanController@store` | Admin Kampus | `NewPembinaanRegistrationNotification` |

Stub TODO masih ada di masing-masing controller tersebut.

---

## 🔜 Langkah Selanjutnya

### 1. Konfigurasi .env Lokal (Segera)

Isi credentials Mailtrap di file `.env` lokal untuk mulai testing:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=<dari Mailtrap dashboard>
MAIL_PASSWORD=<dari Mailtrap dashboard>
MAIL_FROM_ADDRESS="noreply@jurnalmu.id"
MAIL_FROM_NAME="Jurnal MU"
QUEUE_CONNECTION=database
```

### 2. Jalankan Queue Worker (Untuk Development)

```bash
php artisan queue:work --tries=3
```

Atau untuk background (powershell):

```bash
Start-Job { php artisan queue:work --tries=3 }
```

### 3. Test Manual

```bash
# Test via tinker (contoh: send notification ke user pertama)
php artisan tinker
>>> $user = App\Models\User::first();
>>> $user->notify(new App\Notifications\UserApprovedNotification($user));
# Cek Mailtrap inbox dan tabel notifications di DB
```

### 4. Setup Failed Jobs Monitoring (Recommended)

```bash
php artisan queue:failed-table
php artisan migrate
```

Pantau failed jobs via:

```bash
php artisan queue:failed
php artisan queue:retry all
```

### 5. Konfigurasi Production (Saat Go-Live)

Ganti Mailtrap dengan SMTP production (Mailgun/Postmark/SES) di `.env` production:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org  # atau smtp.postmarkapp.com
MAIL_USERNAME=<production-key>
MAIL_PASSWORD=<production-secret>
```

Setup **Supervisor** di server untuk menjaga queue worker berjalan terus:

```ini
[program:jurnal_mu_worker]
command=php /path/to/artisan queue:work --tries=3 --sleep=3 --max-time=3600
autostart=true
autorestart=true
```

### 6. Implementasi Fase 3 — Pembinaan (Saat Fitur Siap)

Setelah scope notifikasi Pembinaan dikonfirmasi:
1. Buat 4 notification class di `app/Notifications/`
2. Buat 4 Blade template di `resources/views/emails/`
3. Uncomment `// TODO:` stubs di `AdminKampus\PembinaanController` dan `User\PembinaanController`

### 7. Tambahkan Test Coverage

Buat Pest feature test untuk setiap notification:

```php
// tests/Feature/Notifications/UserApprovalNotificationTest.php
it('sends UserApprovedNotification when user is approved', function () {
    Notification::fake();
    // ...
    Notification::assertSentTo($user, UserApprovedNotification::class);
});
```

---

## 📁 Struktur File

```
app/
└── Notifications/
    ├── AssessmentApprovedNotification.php         ← sudah ada sebelumnya
    ├── AssessmentRevisionRequestedNotification.php ← sudah ada sebelumnya
    ├── UserApprovedNotification.php               ← Fase 1a (baru)
    ├── UserRejectedNotification.php               ← Fase 1a (baru)
    ├── LppmApprovedNotification.php               ← Fase 1b (baru)
    ├── LppmRejectedNotification.php               ← Fase 1b (baru)
    ├── JournalApprovedNotification.php            ← Fase 1c (baru)
    ├── JournalRejectedNotification.php            ← Fase 1c (baru)
    ├── NewLPPMRegistrationNotification.php        ← Fase 2a (baru)
    ├── NewUserRegistrationNotification.php        ← Fase 2a (baru)
    ├── JournalReassignedNotification.php          ← Fase 2b (baru)
    └── ReviewerAssignedNotification.php           ← Fase 2c (baru)

resources/views/emails/
    ├── assessment-approved.blade.php              ← sudah ada sebelumnya
    ├── assessment-revision-requested.blade.php    ← sudah ada sebelumnya
    ├── user-approved.blade.php                    ← Fase 1a (baru)
    ├── user-rejected.blade.php                    ← Fase 1a (baru)
    ├── lppm-approved.blade.php                    ← Fase 1b (baru)
    ├── lppm-rejected.blade.php                    ← Fase 1b (baru)
    ├── journal-approved.blade.php                 ← Fase 1c (baru)
    ├── journal-rejected.blade.php                 ← Fase 1c (baru)
    ├── new-lppm-registration.blade.php            ← Fase 2a (baru)
    ├── new-user-registration.blade.php            ← Fase 2a (baru)
    ├── journal-reassigned.blade.php               ← Fase 2b (baru)
    └── reviewer-assigned.blade.php                ← Fase 2c (baru)
```
