# Technical Design: DOI Subscription Module 0 (Database & Foundation Models)

**Branch**: `feat/doi-subscription-module-0`  
**Date**: 2026-08-16  
**Status**: Ready for Implementation  
**Related Docs**: [docs/features/doi-subscription/SCHEMA.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/SCHEMA.md) | [docs/features/doi-subscription/DEVELOPMENT_STAGES.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/DEVELOPMENT_STAGES.md)

---

## 1. Overview & Objectives

Modul 0 bertujuan membangun seluruh fondasi data untuk fitur Langganan DOI (Crossref DOI Prefix & Turnitin/iThenticate Similarity Check) di platform Jurnal MU. Fondasi ini mencakup skema tabel relasional, PHP 8.2 Backed Enums dengan method presentation, Eloquent Models dengan relasi lengkap dan query scopes, serta database seeders awal.

---

## 2. Component Specifications

### 2.1 Enums (`app/Enums/Doi/`)

Semua enum menggunakan PHP 8.2 String Backed Enums dengan method `label(): string` (teks tampilan human-readable) dan `color(): string` / `badgeVariant(): string` (mapping token warna antarmuka):

1. **`SubscriptionStatus.php`**:
   - `ACTIVE = 'active'` (Label: "Aktif", Color: "emerald")
   - `INACTIVE = 'inactive'` (Label: "Belum Aktif", Color: "slate")
   - `PENDING_VERIFICATION = 'pending_verification'` (Label: "Menunggu Verifikasi", Color: "blue")
   - `GRACE_PERIOD = 'grace_period'` (Label: "Masa Tenggang", Color: "amber")
   - `EXPIRED = 'expired'` (Label: "Kadaluwarsa", Color: "rose")

2. **`InvoiceStatus.php`**:
   - `UNPAID = 'unpaid'` (Label: "Belum Dibayar", Color: "amber")
   - `PENDING_VERIFICATION = 'pending_verification'` (Label: "Menunggu Verifikasi", Color: "blue")
   - `PAID = 'paid'` (Label: "Lunas", Color: "emerald")
   - `EXPIRED = 'expired'` (Label: "Kadaluwarsa", Color: "slate")
   - `CANCELLED = 'cancelled'` (Label: "Dibatalkan", Color: "rose")

3. **`PaymentProofStatus.php`**:
   - `PENDING = 'pending'` (Label: "Menunggu Review", Color: "blue")
   - `APPROVED = 'approved'` (Label: "Disetujui", Color: "emerald")
   - `REJECTED = 'rejected'` (Label: "Ditolak", Color: "rose")

4. **`InvoiceItemType.php`**:
   - `ANNUAL_FEE = 'annual_fee'` (Label: "Biaya Tahunan Keanggotaan")
   - `PREFIX_REGISTRATION = 'prefix_registration'` (Label: "Registrasi Prefix Crossref")
   - `SIMILARITY_QUOTA = 'similarity_quota'` (Label: "Kuota Similarity Check")
   - `ADJUSTMENT = 'adjustment'` (Label: "Penyesuaian / Diskon Khusus")

5. **`QuotaChangeType.php`**:
   - `ALLOCATION = 'allocation'` (Label: "Alokasi Awal Paket")
   - `USAGE = 'usage'` (Label: "Penggunaan Uji Plagiasi")
   - `ADJUSTMENT = 'adjustment'` (Label: "Penyesuaian Manual Admin")
   - `RENEWAL = 'renewal'` (Label: "Perpanjangan Langganan Tahunan")

---

### 2.2 Database Migrations (`database/migrations/`)

Migrasi dibuat berurutan dengan penanganan foreign key cascading dan indexing performa tinggi:

| Migration Filename | Target Table | Primary / Foreign Keys | Indexes |
| :--- | :--- | :--- | :--- |
| `2026_08_16_000001_create_doi_packages_table.php` | `doi_packages` | `id` (PK) | `slug` (UK), `code` (UK), `is_active` |
| `2026_08_16_000002_create_doi_subscriptions_table.php` | `doi_subscriptions` | `id` (PK), `university_id` (FK $\rightarrow$ universities), `journal_id` (FK $\rightarrow$ journals), `doi_package_id` (FK $\rightarrow$ doi_packages) | `status`, `start_date`, `end_date`, `active_prefix`, `deleted_at` |
| `2026_08_16_000003_create_doi_bank_accounts_table.php` | `doi_bank_accounts` | `id` (PK) | `account_number`, `is_active` |
| `2026_08_16_000004_create_doi_invoices_table.php` | `doi_invoices` | `id` (PK), `subscription_id` (FK $\rightarrow$ doi_subscriptions), `university_id` (FK $\rightarrow$ universities), `user_id` (FK $\rightarrow$ users) | `invoice_number` (UK), `status`, `due_date`, `total_amount`, `deleted_at` |
| `2026_08_16_000005_create_doi_invoice_items_table.php` | `doi_invoice_items` | `id` (PK), `invoice_id` (FK $\rightarrow$ doi_invoices) | `invoice_id`, `item_type` |
| `2026_08_16_000006_create_doi_payment_proofs_table.php` | `doi_payment_proofs` | `id` (PK), `invoice_id` (FK $\rightarrow$ doi_invoices), `user_id` (FK $\rightarrow$ users), `bank_destination_id` (FK $\rightarrow$ doi_bank_accounts), `verified_by` (FK $\rightarrow$ users) | `invoice_id`, `status`, `transfer_date` |
| `2026_08_16_000007_create_doi_similarity_quota_logs_table.php` | `doi_similarity_quota_logs` | `id` (PK), `subscription_id` (FK $\rightarrow$ doi_subscriptions), `journal_id` (FK $\rightarrow$ journals), `user_id` (FK $\rightarrow$ users) | `subscription_id`, `change_type`, `created_at` |

---

### 2.3 Eloquent Models (`app/Models/`)

1. **`DoiPackage.php`**:
   - Casts: `price_annual` $\rightarrow$ `decimal:2`, `prefix_included` $\rightarrow$ `boolean`, `similarity_quota_included` $\rightarrow$ `integer`, `is_active` $\rightarrow$ `boolean`.
   - Relasi: `subscriptions()` (`HasMany`).
   - Scopes: `scopeActive($query)`.
2. **`DoiSubscription.php`**:
   - Traits: `HasFactory`, `SoftDeletes`.
   - Casts: `status` $\rightarrow$ `SubscriptionStatus::class`, `start_date` $\rightarrow$ `date`, `end_date` $\rightarrow$ `date`, `similarity_quota_total` $\rightarrow$ `integer`, `similarity_quota_used` $\rightarrow$ `integer`, `auto_renew` $\rightarrow$ `boolean`.
   - Relasi: `university()` (`BelongsTo`), `journal()` (`BelongsTo`), `package()` (`BelongsTo`), `invoices()` (`HasMany`), `quotaLogs()` (`HasMany`).
   - Accessor: `remaining_quota` $\rightarrow$ `similarity_quota_total - similarity_quota_used`, `is_expiring_soon` (sisa $\le 30$ hari).
   - Scopes: `scopeActive()`, `scopeGracePeriod()`, `scopeExpired()`, `scopeForUniversity($universityId)`.
3. **`DoiInvoice.php`**:
   - Traits: `HasFactory`, `SoftDeletes`.
   - Casts: `status` $\rightarrow$ `InvoiceStatus::class`, `period_start` $\rightarrow$ `date`, `period_end` $\rightarrow$ `date`, `due_date` $\rightarrow$ `date`, `paid_at` $\rightarrow$ `datetime`, `subtotal` $\rightarrow$ `decimal:2`, `discount` $\rightarrow$ `decimal:2`, `tax` $\rightarrow$ `decimal:2`, `total_amount` $\rightarrow$ `decimal:2`.
   - Relasi: `subscription()` (`BelongsTo`), `university()` (`BelongsTo`), `user()` (`BelongsTo`), `items()` (`HasMany`), `paymentProofs()` (`HasMany`), `latestPaymentProof()` (`HasOne`).
   - Scopes: `scopeUnpaid()`, `scopePaid()`, `scopePendingVerification()`.
4. **`DoiInvoiceItem.php`**:
   - Casts: `item_type` $\rightarrow$ `InvoiceItemType::class`, `unit_price` $\rightarrow$ `decimal:2`, `quantity` $\rightarrow$ `integer`, `total_price` $\rightarrow$ `decimal:2`.
   - Relasi: `invoice()` (`BelongsTo`).
5. **`DoiPaymentProof.php`**:
   - Casts: `status` $\rightarrow$ `PaymentProofStatus::class`, `transfer_amount` $\rightarrow$ `decimal:2`, `transfer_date` $\rightarrow$ `date`, `verified_at` $\rightarrow$ `datetime`, `file_size` $\rightarrow$ `integer`.
   - Relasi: `invoice()` (`BelongsTo`), `user()` (`BelongsTo`), `bankDestination()` (`BelongsTo`), `verifier()` (`BelongsTo` $\rightarrow$ `User`).
   - Scopes: `scopePending()`, `scopeApproved()`, `scopeRejected()`.
6. **`DoiBankAccount.php`**:
   - Casts: `is_active` $\rightarrow$ `boolean`, `display_order` $\rightarrow$ `integer`.
   - Scopes: `scopeActive($query)`.
7. **`DoiSimilarityQuotaLog.php`**:
   - Casts: `change_type` $\rightarrow$ `QuotaChangeType::class`, `amount` $\rightarrow$ `integer`, `balance_after` $\rightarrow$ `integer`.
   - Relasi: `subscription()` (`BelongsTo`), `journal()` (`BelongsTo`), `user()` (`BelongsTo`).

---

### 2.4 Database Seeders (`database/seeders/`)

1. **`DoiPackageSeeder.php`**:
   - Paket Institusi Basic (Prefix included, 100 Kuota Similarity Check, Rp 3.500.000 / thn)
   - Paket Institusi Standard (Prefix included, 250 Kuota Similarity Check, Rp 6.000.000 / thn)
   - Paket Institusi Premium (Prefix included, 500 Kuota Similarity Check, Rp 10.000.000 / thn)
   - Paket Mandiri Jurnal (Prefix shared/individual, 50 Kuota Similarity Check, Rp 1.500.000 / thn)
2. **`DoiBankAccountSeeder.php`**:
   - Bank Syariah Indonesia (BSI) - No. Rek: `7123-4567-89` a.n Majelis Diktilitbang PPM
   - Bank Mandiri - No. Rek: `137-00-1234567-8` a.n Majelis Diktilitbang PPM

---

## 3. Verification & Testing Strategy for Module 0

1. **Migration Verification**:
   ```bash
   docker exec -it jurnal-mu-app php artisan migrate:fresh --seed
   ```
2. **Unit Test Suite (`tests/Unit/Doi/DoiModelRelationshipTest.php`)**:
   - Memvalidasi casting Enum pada setiap model.
   - Memvalidasi relasi `DoiSubscription` $\leftrightarrow$ `DoiInvoice` $\leftrightarrow$ `DoiPaymentProof`.
   - Memvalidasi accessor `remaining_quota` dan query scope `active()`.
   - Memvalidasi seeders berjalan tanpa duplikasi error.
