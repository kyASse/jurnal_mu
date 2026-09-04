# Technical Design Spec: DOI Subscription Module 4 (Super Admin Management & Verification Drawer)

**Document Metadata**:
- **Topic**: Modul 4 - Super Admin Management & Verification Drawer (Super Admin DOI Command Center)
- **Date**: 2026-08-17
- **Status**: APPROVED
- **Target Branch**: `feat/doi-subscription-module-4`
- **Dependencies**: Modul 0 (Database & Models), Modul 1 (Core Actions, Services, Security Policies), Modul 2 (Dashboard DOI), Modul 3 (Invoices & Payment Proof Workflow)

---

## 1. Overview & Objective

Modul 4 mengimplementasikan antarmuka dan backend terpadu **Super Admin DOI Command Center** untuk Majelis Diktilitbang PPM Muhammadiyah:
1. **Top National Bento Metrics**: Ringkasan total institusi PTMA aktif, antrian verifikasi pembayaran menunggu review, konsumsi kuota similarity check nasional, dan akumulasi tagihan.
2. **Antrian Verifikasi Bukti Pembayaran (Pending Queue)**: Menampilkan seluruh bukti transfer masuk yang menunggu verifikasi dari seluruh PTMA se-Indonesia.
3. **Interactive Split-View Verification Drawer**:
   - **Panel Kiri (Document Viewer)**: Preview langsung resi transfer bank (JPG/PNG gambar interaktif atau PDF embed) dengan kontrol zoom, rotate, dan unduh.
   - **Panel Kanan (Transaction Review & Decision)**: Perbandingan otomatis nominal tagihan vs nominal bukti transfer (`MATCH` / `MISMATCH`), rincian bank pengirim & tujuan, dan aksi persetujuan (*Approve & Perpanjang +1 Tahun*) atau penolakan (*Reject + Catatan Penolakan*).
4. **Master Langganan PTMA**: Pemantauan status langganan seluruh universitas & jurnal, penyesuaian kuota similarity manual (*Quota Adjustment Dialog*), dan audit log mutasi kuota.
5. **Manajemen Paket & Rekening Bank**: Pengelolaan data paket langganan resmi dan rekening bank tujuan transfer Diktilitbang PPM.

---

## 2. Design System & Frontend Architecture

- **Design Read**: *"Super Admin Institutional Command Center untuk Majelis Diktilitbang PPM Muhammadiyah, dengan bahasa visual Clean Tactile Enterprise, berbasis Tailwind CSS v4 + Radix UI + Plus Jakarta Sans & Tabular Numerals."*
- **Dials Calibration**:
  - `DESIGN_VARIANCE: 5` (Tata letak data terstruktur, tabbed interface simetris)
  - `MOTION_INTENSITY: 3` (Transisi split-view sheet halus, feedback approval instan)
  - `VISUAL_DENSITY: 5` (Metrik bento padat, perbandingan nominal tabular monospaced)

### 2.1 File & Directory Breakdown

```text
resources/js/
├── types/
│   └── doi.ts                               # Type definitions extended for Super Admin
├── components/
│   └── doi/
│       └── admin/
│           ├── DoiAdminStatsCards.tsx        # 4 Bento summary metrics
│           ├── DoiVerificationTable.tsx      # Tabel antrian bukti bayar & badge counter
│           ├── DoiVerificationDrawer.tsx     # Split-View Drawer (Doc viewer + Review panel)
│           ├── DoiDocumentViewer.tsx         # Image/PDF previewer (Zoom, Rotate, Download)
│           ├── DoiSubscriptionsMasterTable.tsx# Tabel monitoring langganan PTMA se-Indonesia
│           ├── DoiQuotaAdjustDialog.tsx      # Modal penyesuaian kuota similarity manual
│           ├── DoiPackageManagementTab.tsx   # Pengelolaan paket langganan
│           ├── DoiBankAccountManagementTab.tsx# Pengelolaan rekening bank resmi
│           └── index.ts                      # Barrel export
└── pages/
    └── Admin/
        └── Doi/
            └── Index.tsx                     # Halaman utama Super Admin DOI Command Center
```

---

## 3. Backend Architecture & Controller

### 3.1 Routing Configuration (`routes/web.php`)

```php
// Super Admin DOI Command Center
Route::middleware(['auth', 'verified', 'role:' . Role::SUPER_ADMIN])
    ->prefix('admin/doi-management')
    ->name('admin.doi-management.')
    ->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\Doi\AdminDoiManagementController::class, 'index'])
            ->name('index');

        // Verification Actions
        Route::post('verifications/{paymentProof}/approve', [App\Http\Controllers\Admin\Doi\AdminDoiVerificationController::class, 'approve'])
            ->name('verifications.approve');
        Route::post('verifications/{paymentProof}/reject', [App\Http\Controllers\Admin\Doi\AdminDoiVerificationController::class, 'reject'])
            ->name('verifications.reject');
        Route::get('verifications/{paymentProof}/stream', [App\Http\Controllers\Admin\Doi\AdminDoiVerificationController::class, 'stream'])
            ->name('verifications.stream');

        // Quota Management for PTMA
        Route::post('subscriptions/{subscription}/adjust-quota', [App\Http\Controllers\Admin\Doi\AdminDoiSubscriptionController::class, 'adjustQuota'])
            ->name('subscriptions.adjust-quota');

        // Packages CRUD
        Route::post('packages', [App\Http\Controllers\Admin\Doi\AdminDoiPackageController::class, 'store'])
            ->name('packages.store');
        Route::put('packages/{package}', [App\Http\Controllers\Admin\Doi\AdminDoiPackageController::class, 'update'])
            ->name('packages.update');
        Route::delete('packages/{package}', [App\Http\Controllers\Admin\Doi\AdminDoiPackageController::class, 'destroy'])
            ->name('packages.destroy');

        // Bank Accounts CRUD
        Route::post('bank-accounts', [App\Http\Controllers\Admin\Doi\AdminDoiBankAccountController::class, 'store'])
            ->name('bank-accounts.store');
        Route::put('bank-accounts/{bankAccount}', [App\Http\Controllers\Admin\Doi\AdminDoiBankAccountController::class, 'update'])
            ->name('bank-accounts.update');
        Route::delete('bank-accounts/{bankAccount}', [App\Http\Controllers\Admin\Doi\AdminDoiBankAccountController::class, 'destroy'])
            ->name('bank-accounts.destroy');
    });
```

### 3.2 Form Request Validation

1. **`VerifyPaymentProofRequest.php`**:
```php
public function rules(): array
{
    return [
        'action' => ['required', 'in:approve,reject'],
        'admin_notes' => ['required_if:action,reject', 'nullable', 'string', 'max:1000'],
    ];
}
```

2. **`AdjustQuotaRequest.php`**:
```php
public function rules(): array
{
    return [
        'amount' => ['required', 'integer', 'min:1'],
        'type' => ['required', 'in:add,deduct'],
        'notes' => ['required', 'string', 'max:255'],
    ];
}
```

---

## 4. Testing & Verification Plan

### 4.1 Automated Feature Test (`tests/Feature/Doi/AdminDoiManagementTest.php`)
- `test_super_admin_can_access_doi_management_dashboard`: Assert 200 OK, props lengkap untuk Super Admin.
- `test_non_super_admin_cannot_access_doi_management_dashboard`: Assert 403 Forbidden untuk role selain Super Admin.
- `test_super_admin_can_approve_payment_proof`: Assert proof approved, invoice paid, subscription $+1$ year, similarity quota added, event dispatched.
- `test_super_admin_can_reject_payment_proof_with_notes`: Assert proof rejected, invoice reverted to unpaid, notes recorded, event dispatched.
- `test_reject_payment_proof_requires_admin_notes`: Assert validation error when rejecting without reason.
- `test_super_admin_can_adjust_similarity_quota_with_audit_log`: Assert quota adjustment recorded in audit log.
- `test_super_admin_can_manage_packages_and_bank_accounts`: Assert full CRUD on packages and bank accounts.

### 4.2 Build & Regression Suite
- `npm run build`: Kompilasi frontend React 19 + TypeScript + Vite.
- `docker exec -i jurnal-mu-app php artisan test --filter=Doi`: 100% test suite lulus.
