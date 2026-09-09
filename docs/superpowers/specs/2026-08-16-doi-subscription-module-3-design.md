# Technical Design Spec: DOI Subscription Module 3 (Invoices Management & Manual Bank Payment Proof)

**Document Metadata**:
- **Topic**: Modul 3 - Tagihan Pembayaran & Upload Bukti Bayar Manual (Invoices Management & Payment Proof Workflow)
- **Date**: 2026-08-16
- **Status**: APPROVED
- **Target Branch**: `feat/doi-subscription-module-3`
- **Dependencies**: Modul 0 (Database & Models), Modul 1 (Core Actions, Services, Security Policies), Modul 2 (Dashboard DOI)

---

## 1. Overview & Objective

Modul 3 mengimplementasikan antarmuka dan alur backend untuk **Manajemen Tagihan & Alur Pembayaran Transfer Bank Manual**. Fitur ini memfasilitasi **Admin Kampus** dan **Pengelola Jurnal** untuk:
1. Meninjau seluruh daftar tagihan (*Invoices*) institusi mereka dengan filter status (`ALL`, `UNPAID`, `PENDING_VERIFICATION`, `PAID`, `EXPIRED`), pencarian nomor tagihan, dan representasi angka tabular monospaced.
2. Membuka *Interactive Slide-Over Detail & Checkout Drawer* yang memuat rincian item tagihan, kuota similarity yang diperoleh, dan nomor rekening resmi Diktilitbang PPM Muhammadiyah (BSI & Bank Mandiri).
3. Melakukan aksi pembayaran transfer manual dan mengunggah bukti bayar secara langsung (*Drag-and-Drop Live Dropzone*) dengan validasi format/ukuran file serta preview dokumen.
4. Memantau linimasa status verifikasi (*Verification Timeline*) dan menindaklanjuti catatan penolakan jika bukti bayar sebelumnya ditolak oleh Super Admin.
5. Melakukan streaming dokumen bukti transfer secara aman (*Authorized Private File Stream*).

---

## 2. Design System & Frontend Architecture

- **Design Read**: *"Institutional B2B SaaS Billing Management untuk Administrator Perguruan Tinggi Muhammadiyah, dengan bahasa visual Clean Tactile Enterprise, berbasis Tailwind CSS v4 + Radix UI + Plus Jakarta Sans & Tabular Numerals."*
- **Dials Calibration**:
  - `DESIGN_VARIANCE: 5` (Struktur simetris, tata letak data teratur dan informatif)
  - `MOTION_INTENSITY: 3` (Transisi slide-over sheet halus, feedback 1-click copy dengan centang animasi, upload progress)
  - `VISUAL_DENSITY: 5` (Tabel data padat, statistik ringkas di bagian atas, format monospaced tabular pada nominal Rupiah)

### 2.1 File & Directory Breakdown

```text
resources/js/
├── types/
│   └── doi.ts                               # Type definitions
├── components/
│   └── doi/
│       └── invoices/
│           ├── DoiInvoiceTable.tsx          # Tabel data invoice dengan search, filter status & pagination
│           ├── DoiInvoiceStatsCard.tsx      # 3 Bento summary tiles (Total Tagihan, Belum Bayar, Lunas)
│           ├── DoiInvoiceDetailDrawer.tsx   # Slide-over sheet rincian invoice & checkout actions
│           ├── DoiBankAccountsCard.tsx      # Kartu rekening resmi Diktilitbang PPM + 1-Click Copy
│           ├── DoiPaymentProofDropzone.tsx  # Drag-and-drop file uploader + image/PDF live preview
│           ├── DoiPaymentProofForm.tsx      # Form input transfer bank (Bank, Rekening, Tanggal, Nominal)
│           ├── DoiVerificationTimeline.tsx  # Timeline status verifikasi & admin notes alert
│           └── index.ts                     # Barrel export
└── pages/
    ├── AdminKampus/Doi/Invoices/
    │   └── Index.tsx                        # Halaman utama manajemen tagihan Admin Kampus
    └── User/Doi/Invoices/
        └── Index.tsx                        # Halaman monitoring tagihan Pengelola Jurnal
```

---

## 3. Backend Architecture & Controller

### 3.1 Routing Configuration (`routes/web.php`)

```php
// Admin Kampus Portal
Route::middleware(['auth', 'verified', 'role:' . Role::ADMIN_KAMPUS])
    ->prefix('admin-kampus/doi-subscription')
    ->name('admin-kampus.doi-subscription.')
    ->group(function () {
        // Invoice Listing & Detail
        Route::get('invoices', [App\Http\Controllers\AdminKampus\DoiInvoiceController::class, 'index'])
            ->name('invoices.index');
        Route::get('invoices/{invoice}', [App\Http\Controllers\AdminKampus\DoiInvoiceController::class, 'show'])
            ->name('invoices.show');

        // Payment Proof Upload & Stream
        Route::post('invoices/{invoice}/payment-proof', [App\Http\Controllers\AdminKampus\DoiPaymentProofController::class, 'store'])
            ->name('payment-proofs.store');
        Route::get('payment-proofs/{proof}/stream', [App\Http\Controllers\AdminKampus\DoiPaymentProofController::class, 'stream'])
            ->name('payment-proofs.stream');
    });

// Pengelola Jurnal Portal (Monitoring View)
Route::middleware(['auth', 'verified', 'role:' . Role::USER])
    ->prefix('user/doi-subscription')
    ->name('user.doi-subscription.')
    ->group(function () {
        Route::get('invoices', [App\Http\Controllers\User\DoiInvoiceController::class, 'index'])
            ->name('invoices.index');
        Route::get('invoices/{invoice}', [App\Http\Controllers\User\DoiInvoiceController::class, 'show'])
            ->name('invoices.show');
        Route::get('payment-proofs/{proof}/stream', [App\Http\Controllers\User\DoiPaymentProofController::class, 'stream'])
            ->name('payment-proofs.stream');
    });
```

### 3.2 Form Request Validation (`StorePaymentProofRequest.php`)
```php
public function rules(): array
{
    return [
        'bank_name' => ['required', 'string', 'max:100'],
        'account_number' => ['required', 'string', 'max:50'],
        'account_name' => ['required', 'string', 'max:150'],
        'amount_paid' => ['required', 'numeric', 'min:1'],
        'transfer_date' => ['required', 'date', 'before_or_equal:today'],
        'notes' => ['nullable', 'string', 'max:500'],
        'proof_file' => [
            'required',
            'file',
            'mimes:jpg,jpeg,png,pdf',
            'max:5120', // 5 MB max
        ],
    ];
}
```

### 3.3 Controller Responsibilities
1. **`AdminKampus\DoiInvoiceController@index`**:
   - Query `DoiInvoice` berelasi dengan `subscription.package`, `items`, dan `paymentProofs` milik universitas pengguna.
   - Menyediakan data statistik ringkas: `total_invoices_count`, `unpaid_invoices_count`, `unpaid_total_amount`, `paid_total_amount`.
   - Mengambil daftar rekening resmi `DoiBankAccount::active()->get()`.
   - Render `AdminKampus/Doi/Invoices/Index`.

2. **`AdminKampus\DoiPaymentProofController@store`**:
   - Otorisasi `authorize('uploadProof', $invoice)` via `DoiInvoicePolicy`.
   - Validasi data via `StorePaymentProofRequest`.
   - Menjalankan `StorePaymentProofAction` untuk menyimpan file bukti secara atomik ke disk privat `doi_proofs` dan memperbarui status invoice ke `PENDING_VERIFICATION`.
   - Redirect kembali dengan flash message sukses.

3. **`AdminKampus\DoiPaymentProofController@stream`**:
   - Otorisasi `authorize('view', $proof)` via `DoiPaymentProofPolicy`.
   - Verifikasi eksistensi file pada disk `doi_proofs`.
   - Mengembalikan `Storage::disk('doi_proofs')->response($proof->file_path)`.

---

## 4. TypeScript Interface Extensions (`types/doi.ts`)

```typescript
export interface DoiInvoiceDetailData extends DoiActiveInvoiceData {
  subtotal: number;
  discount: number;
  tax: number;
  period_start: string | null;
  period_end: string | null;
  paid_at: string | null;
  created_at: string;
  items: Array<{
    id: number;
    item_type: string;
    item_type_label: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  payment_proofs: DoiPaymentProofData[];
}

export interface DoiInvoicesPageProps {
  invoices: DoiInvoiceDetailData[];
  bankAccounts: DoiBankAccountData[];
  stats: {
    totalInvoicesCount: number;
    unpaidInvoicesCount: number;
    unpaidTotalAmount: number;
    paidTotalAmount: number;
  };
  universityName: string;
}
```

---

## 5. Testing & Verification Plan

### 5.1 Automated Feature Test (`tests/Feature/Doi/DoiInvoiceTest.php`)
- `test_admin_kampus_can_view_invoice_list_for_their_university`: Assert 200 OK, props lengkap untuk Admin Kampus.
- `test_pengelola_jurnal_can_view_invoice_list`: Assert 200 OK untuk role User.
- `test_multi_tenant_isolation_on_invoice_listing`: Assert invoice kampus lain tidak muncul di listing.
- `test_admin_kampus_can_upload_payment_proof_for_unpaid_invoice`: Assert upload fake file berhasil, status berubah ke `pending_verification`, event ter-dispatch.
- `test_upload_payment_proof_validates_mime_and_size`: Assert file invalid atau $>5\text{MB}$ memicu error validasi.
- `test_admin_kampus_can_stream_own_payment_proof`: Assert response stream file 200 OK.
- `test_user_cannot_access_other_university_payment_proof`: Assert 403 Forbidden saat mengakses bukti kampus lain.
- `test_cannot_upload_payment_proof_for_paid_invoice`: Assert penolakan upload pada invoice yang sudah lunas.

### 5.2 Build & Regression Suite
- `npm run build`: Kompilasi frontend React 19 + TypeScript + Vite.
- `docker exec -i jurnal-mu-app php artisan test --filter=Doi`: 100% test suite lulus.
