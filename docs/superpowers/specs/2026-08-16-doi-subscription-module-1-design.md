# Technical Design Spec: DOI Subscription Module 1 (Core Actions, Services & Security Policy)

## 1. Executive Summary
- **Module**: Modul 1 — Core Action, Service & Security Policy
- **Feature**: Menu Langganan DOI & Similarity Check
- **Platform**: Laravel 12, PHP 8.2+, MySQL 8.0, Storage Local Private Disk
- **Goal**: Menyediakan pondasi logika bisnis inti (*domain actions*), manajemen kuota similarity check (*quota service*), penyimpanan berkas bukti bayar terenkripsi/privat, dan isolasi otorisasi multi-tenant (*security policies*).

---

## 2. Directory Structure & Components

```text
app/
├── Actions/
│   └── Doi/
│       ├── GenerateInvoiceAction.php
│       ├── StorePaymentProofAction.php
│       └── VerifyPaymentProofAction.php
├── Events/
│   └── Doi/
│       ├── PaymentProofUploaded.php
│       ├── SubscriptionActivated.php
│       └── PaymentProofRejected.php
├── Policies/
│   ├── DoiSubscriptionPolicy.php
│   ├── DoiInvoicePolicy.php
│   └── DoiPaymentProofPolicy.php
└── Services/
    └── Doi/
        └── DoiQuotaManagerService.php
config/
└── filesystems.php (tambah disk: 'doi_proofs')
tests/
├── Feature/
│   └── Doi/
│       └── DoiSecurityPolicyTest.php
└── Unit/
    └── Doi/
        ├── DoiActionsTest.php
        └── DoiQuotaManagerServiceTest.php
```

---

## 3. Component Details & Business Logic

### 3.1 `GenerateInvoiceAction` (`app/Actions/Doi/GenerateInvoiceAction.php`)
- **Tujuan**: Menerbitkan invoice baru dengan nomor atomik `INV/DOI/YYYYMM/XXXX` secara aman dari *race condition*.
- **Parameter Masukan**:
  - `DoiSubscription $subscription`
  - `User $user`
  - `?Carbon $periodStart = null`
  - `?Carbon $periodEnd = null`
  - `int $dueDateDays = 14`
- **Logika Eksekusi**:
  1. Buka database transaction `DB::transaction()`.
  2. Ambil prefix periode `INV/DOI/{YYYYMM}/`.
  3. Lakukan `DoiInvoice::where('invoice_number', 'LIKE', "{$prefix}%")->lockForUpdate()->orderByDesc('invoice_number')->first()`.
  4. Hitung sequence angka berikutnya (`+1`), format pad 4 digit (`0001`, `0002`, dst).
  5. Hitung harga paket: `price_annual`, hitung PPN/tax (jika ada, default 0 atau 11%), diskon (default 0), total.
  6. Buat baris `DoiInvoice` dengan status `InvoiceStatus::UNPAID`.
  7. Buat baris `DoiInvoiceItem` (`ANNUAL_FEE` senilai harga paket).
  8. Kembalikan instance `DoiInvoice` (dengan relasi items dimuat).

### 3.2 `StorePaymentProofAction` (`app/Actions/Doi/StorePaymentProofAction.php`)
- **Tujuan**: Memproses berkas unggahan bukti transfer dengan validasi multi-layer dan menyimpannya di private storage disk.
- **Parameter Masukan**:
  - `DoiInvoice $invoice`
  - `User $user`
  - `UploadedFile $file`
  - `array $data` (`bank_sender`, `account_name`, `bank_destination_id`, `transfer_amount`, `transfer_date`)
- **Logika Eksekusi**:
  1. Validasi berkas:
     - Ukuran berkas $\le 5\text{ MB}$ (5120 KB).
     - MIME type biner diperiksa menggunakan `finfo` (`image/jpeg`, `image/png`, `application/pdf`).
  2. Generate path aman ter-obfuscate: `doi_proofs/{YYYY}/{MM}/{hash}.{ext}`.
  3. Simpan berkas ke disk `doi_proofs` via `Storage::disk('doi_proofs')->putFileAs(...)`.
  4. Simpan baris `DoiPaymentProof` dengan status `PaymentProofStatus::PENDING`.
  5. Update `DoiInvoice` ke status `InvoiceStatus::PENDING_VERIFICATION`.
  6. Dispatch event `PaymentProofUploaded($paymentProof)`.
  7. Kembalikan instance `DoiPaymentProof`.

### 3.3 `VerifyPaymentProofAction` (`app/Actions/Doi/VerifyPaymentProofAction.php`)
- **Tujuan**: Memproses keputusan persetujuan/penolakan pembayaran oleh Super Admin.
- **Parameter Masukan**:
  - `DoiPaymentProof $proof`
  - `User $adminUser`
  - `PaymentProofStatus $decision` (`APPROVED` atau `REJECTED`)
  - `?string $adminNotes = null`
- **Logika Eksekusi**:
  1. Buka database transaction `DB::transaction()`.
  2. Kunci baris invoice dan subscription dengan `lockForUpdate()`.
  3. **Jika Keputusan = APPROVED**:
     - Update `DoiPaymentProof`: `status = APPROVED`, `verified_by = $adminUser->id`, `verified_at = now()`, `admin_notes = $adminNotes`.
     - Update `DoiInvoice`: `status = PAID`, `paid_at = now()`.
     - Update `DoiSubscription`:
       - `status = SubscriptionStatus::ACTIVE`.
       - Jika masa aktif lama masih aktif/grace period: `end_date = end_date->addYear()`.
       - Jika belum aktif/kadaluwarsa: `start_date = now()`, `end_date = now()->addYear()`.
       - Top-up kuota: `similarity_quota_total += package->similarity_quota_included`.
     - Catat log kuota melalui `DoiQuotaManagerService::addQuota(...)` dengan tipe `QuotaChangeType::RENEWAL`.
     - Dispatch event `SubscriptionActivated($subscription, $proof)`.
  4. **Jika Keputusan = REJECTED**:
     - Update `DoiPaymentProof`: `status = REJECTED`, `verified_by = $adminUser->id`, `verified_at = now()`, `admin_notes = $adminNotes` (wajib diisi).
     - Kembalikan status `DoiInvoice` ke `InvoiceStatus::UNPAID`.
     - Dispatch event `PaymentProofRejected($proof)`.
  5. Kembalikan array hasil verifikasi `['proof' => $proof, 'invoice' => $invoice, 'subscription' => $subscription]`.

### 3.4 `DoiQuotaManagerService` (`app/Services/Doi/DoiQuotaManagerService.php`)
- **Tujuan**: Pengelolaan kuota uji kesamaan artikel secara terpusat, atomik, dan memiliki audit log lengkap.
- **Metode Utama**:
  1. `hasRemainingQuota(DoiSubscription $subscription, int $required = 1): bool`
     - Mengembalikan `true` jika `($subscription->similarity_quota_total - $subscription->similarity_quota_used) >= $required`.
  2. `deductQuota(DoiSubscription $subscription, int $amount, ?Journal $journal, ?User $user, string $description): DoiSimilarityQuotaLog`
     - Menggunakan `DB::transaction()` & `lockForUpdate()`.
     - Memastikan status langganan `ACTIVE`.
     - Validasi sisa kuota mencukupi.
     - Increment `similarity_quota_used += $amount`.
     - Catat `DoiSimilarityQuotaLog` (`change_type = USAGE`, `amount = -$amount`, `balance_after = sisa`).
  3. `addQuota(DoiSubscription $subscription, int $amount, ?User $adminUser, string $description, QuotaChangeType $type = QuotaChangeType::ADJUSTMENT): DoiSimilarityQuotaLog`
     - Menggunakan `DB::transaction()` & `lockForUpdate()`.
     - Increment `similarity_quota_total += $amount`.
     - Catat `DoiSimilarityQuotaLog` (`change_type = $type`, `amount = +$amount`, `balance_after = total - used`).

---

## 4. Storage & Security Policies

### 4.1 Disk Configuration (`config/filesystems.php`)
```php
'doi_proofs' => [
    'driver' => 'local',
    'root' => storage_path('app/private/doi_proofs'),
    'visibility' => 'private',
    'throw' => false,
    'report' => false,
],
```

### 4.2 Security Policies (`app/Policies/`)
1. **`DoiSubscriptionPolicy`**:
   - `viewAny(User $user)`: Super Admin, Admin Kampus, Pengelola Jurnal aktif.
   - `view(User $user, DoiSubscription $subscription)`:
     - Super Admin: selalu `true`.
     - Admin Kampus: `true` jika `user.university_id === subscription.university_id`.
     - Pengelola Jurnal: `true` jika `subscription.journal_id` dikelola user atau milik universitasnya.
   - `create(User $user)`: Admin Kampus atau Pengelola Jurnal.
2. **`DoiInvoicePolicy`**:
   - `view(User $user, DoiInvoice $invoice)`: Super Admin, Admin Kampus satu universitas, atau pemilik invoice (`user_id`).
   - `uploadProof(User $user, DoiInvoice $invoice)`: User yang memiliki akses ke invoice dan status invoice `UNPAID` atau `PENDING_VERIFICATION` (re-upload).
3. **`DoiPaymentProofPolicy`**:
   - `view(User $user, DoiPaymentProof $proof)`: Super Admin, Admin Kampus satu universitas, atau uploader.
   - `verify(User $user, DoiPaymentProof $proof)`: Hanya Super Admin (`$user->isSuperAdmin()`).

---

## 5. Testing & Verification Plan

1. **Unit Test Actions (`tests/Unit/Doi/DoiActionsTest.php`)**:
   - Test invoice generation sequence & atomic numbering.
   - Test payment proof upload, validation, and safe storage hashing.
   - Test approve payment proof (+1 year renewal, invoice paid, quota added).
   - Test reject payment proof (invoice unpaid, notes recorded).
2. **Unit Test Quota Manager (`tests/Unit/Doi/DoiQuotaManagerServiceTest.php`)**:
   - Test hasRemainingQuota check.
   - Test deductQuota success & exception when quota exhausted.
   - Test addQuota & quota balance audit trail.
3. **Feature Test Security Policies (`tests/Feature/Doi/DoiSecurityPolicyTest.php`)**:
   - Test multi-tenant isolation: Admin Kampus A cannot view invoices/subscriptions of Kampus B.
   - Test Super Admin can verify proofs while regular users/admin kampus cannot.
