# Technical Design Spec: DOI Subscription Self-Service Order Flow

**Document Metadata**:
- **Topic**: Self-Service Order & Instant Invoice Generation for Admin Kampus
- **Date**: 2026-08-18
- **Status**: APPROVED
- **Target Branch**: `feat/doi-self-service-order`
- **Dependencies**: Modul 0 s.d 5 (DOI Subscription System)

---

## 1. Overview & Business Problem

Sebelumnya, antarmuka `DoiPackageDrawer` hanya menyajikan rincian manfaat paket dan kontak helpdesk tanpa aksi langsung untuk mengajukan langganan. Hal ini mengharuskan Admin Kampus berkoordinasi manual di luar aplikasi untuk mendapatkan faktur tagihan.

**Solusi**:
Membangun alur pemesanan mandiri (*self-service checkout*) 100% tuntas:
1. Admin Kampus dapat memilih paket di `DoiEmptyState` atau `DoiPackageDrawer` dan menekan **[Konfirmasi & Ajukan Paket Ini]**.
2. Backend (`AdminKampus\DoiSubscriptionController@subscribe`) memvalidasi hak akses, memeriksa invoice aktif (anti-duplikasi), menginisialisasi langganan, dan memanggil `GenerateInvoiceAction` untuk menerbitkan sequential invoice resmi (`INV/DOI/YYYYMM/XXXX`).
3. Sistem secara instan me-redirect pengguna ke halaman `/admin-kampus/doi/invoices?invoice_id=xxx&action=pay` dengan drawer pembayaran (pilihan transfer BSI / Mandiri dan dropzone upload bukti transfer) yang langsung terbuka.

---

## 2. File & Component Breakdown

```text
app/
├── Http/
│   ├── Controllers/
│   │   └── AdminKampus/
│   │       └── DoiSubscriptionController.php        # Method subscribe()
│   └── Requests/
│       └── Doi/
│           └── SubscribeDoiPackageRequest.php       # FormRequest validasi package_id & role
resources/
├── js/
│   ├── components/
│   │   └── doi/
│   │       └── DoiPackageDrawer.tsx                 # Tombol Konfirmasi & Ajukan + feedback loading
│   └── pages/
│       └── AdminKampus/
│           └── Doi/
│               └── Dashboard.tsx                    # Handler submit pemesanan
routes/
└── web.php                                          # Route POST /admin-kampus/doi/subscribe
tests/
└── Feature/
    └── Doi/
        └── DoiSubscriptionSelfServiceTest.php       # Automated test suite
```

---

## 3. Detailed Logic & Rules

### 3.1 Route & Middleware
- Route: `POST /admin-kampus/doi/subscribe`
- Name: `admin-kampus.doi.subscribe`
- Middleware: `auth`, `role:admin_kampus`

### 3.2 FormRequest: `SubscribeDoiPackageRequest`
- Validasi:
  ```php
  public function rules(): array
  {
      return [
          'package_id' => ['required', 'integer', 'exists:doi_packages,id'],
      ];
  }
  ```
- Otorisasi:
  ```php
  public function authorize(): bool
  {
      return $this->user()?->isAdminKampus() && !empty($this->user()?->university_id);
  }
  ```

### 3.3 Controller Handler: `subscribe()`
1. Cari universitas pengguna: `$universityId = $user->university_id;`
2. Validasi Anti-Duplikasi:
   ```php
   $existingUnpaidInvoice = DoiInvoice::whereHas('subscription', fn ($q) => $q->where('university_id', $universityId))
       ->whereIn('status', [InvoiceStatus::UNPAID, InvoiceStatus::PENDING_VERIFICATION])
       ->first();

   if ($existingUnpaidInvoice) {
       return redirect()->route('admin-kampus.doi.invoices.index', [
           'invoice_id' => $existingUnpaidInvoice->id,
           'action' => 'pay',
       ])->with('warning', 'Institusi Anda telah memiliki tagihan berjalan yang belum diselesaikan.');
   }
   ```
3. Cari atau buat `DoiSubscription`:
   ```php
   $subscription = DoiSubscription::firstOrCreate(
       ['university_id' => $universityId],
       [
           'package_id' => $package->id,
           'status' => SubscriptionStatus::INACTIVE,
           'similarity_quota_total' => 0,
           'similarity_quota_used' => 0,
       ]
   );
   $subscription->update(['package_id' => $package->id]);
   ```
4. Panggil `GenerateInvoiceAction`:
   ```php
   $invoice = app(GenerateInvoiceAction::class)->execute($subscription, $user);
   ```
5. Redirect ke drawer pembayaran:
   ```php
   return redirect()->route('admin-kampus.doi.invoices.index', [
       'invoice_id' => $invoice->id,
       'action' => 'pay',
   ])->with('success', 'Pengajuan langganan berhasil. Silakan lakukan transfer pembayaran.');
   ```

---

## 4. Frontend UX Enhancements

- **`DoiPackageDrawer.tsx`**:
  - Tombol CTA utama: **[Konfirmasi & Ajukan Paket Ini]** dengan loading spinner jika sedang submit.
  - Ditampilkan rincian total biaya per tahun.
  - Memanggil `router.post(route('admin-kampus.doi.subscribe'), { package_id: currentPackage.id })`.

---

## 5. Verification Plan

1. **Automated Feature Tests (`tests/Feature/Doi/DoiSubscriptionSelfServiceTest.php`)**:
   - `test_admin_kampus_can_subscribe_to_package_and_generate_invoice`
   - `test_admin_kampus_redirected_to_existing_unpaid_invoice_without_duplication`
   - `test_non_admin_kampus_cannot_subscribe`
2. **Full Regression Suite**:
   - `docker exec -i jurnal-mu-app php artisan test --filter=Doi`
3. **Frontend Compilation**:
   - `npm run build`
