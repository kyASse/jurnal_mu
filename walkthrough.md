# Walkthrough: DOI Subscription Module 3 (Invoices Management & Manual Bank Payment Proof)

**Target Branch**: `feat/doi-subscription-module-3`  
**Status**: COMPLETE & VERIFIED

---

## 1. Accomplishments

Modul 3 mengimplementasikan antarmuka dan backend manajemen tagihan (*Invoices*) serta alur pembayaran transfer manual dengan formulir unggah bukti bayar (*Payment Proof*) interaktif, live dropzone preview, instruksi rekening bank resmi Diktilitbang PPM, dan authorized private file streaming:

1. **Backend Routing & Controllers**:
   - [`app/Http/Requests/Doi/StorePaymentProofRequest.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Requests/Doi/StorePaymentProofRequest.php): Validasi ketat format file (`jpg`, `jpeg`, `png`, `pdf`), ukuran maksimal 5MB, data bank pengirim, dan proteksi invoice yang sudah lunas.
   - [`app/Http/Controllers/AdminKampus/DoiInvoiceController.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Controllers/AdminKampus/DoiInvoiceController.php): Listing invoice terisolasi per-institusi, agregasi statistik (`total`, `unpaid`, `paid`), dan data rekening resmi Diktilitbang PPM.
   - [`app/Http/Controllers/AdminKampus/DoiPaymentProofController.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Controllers/AdminKampus/DoiPaymentProofController.php): Handler upload bukti pembayaran ke disk privat `doi_proofs` dan secure streaming endpoint.
   - [`app/Http/Controllers/User/DoiInvoiceController.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Controllers/User/DoiInvoiceController.php) & [`User/DoiPaymentProofController.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Controllers/User/DoiPaymentProofController.php): Portal pengelola jurnal.
   - [`routes/web.php`](file:///c:/xampp/htdocs/jurnal_mu/routes/web.php): Registrasi rute `/admin-kampus/doi-subscription/invoices` dan `/user/doi-subscription/invoices`.

2. **Frontend Reusable Bento & Interactive Components**:
   - [`resources/js/components/doi/invoices/DoiInvoiceStatsCard.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/invoices/DoiInvoiceStatsCard.tsx): 3 Bento summary tiles dengan format monospaced tabular numerals.
   - [`resources/js/components/doi/invoices/DoiBankAccountsCard.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/invoices/DoiBankAccountsCard.tsx): Kartu rekening bank resmi Diktilitbang PPM Muhammadiyah (BSI & Mandiri) dengan tombol *1-Click Copy* nomor rekening.
   - [`resources/js/components/doi/invoices/DoiPaymentProofDropzone.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/invoices/DoiPaymentProofDropzone.tsx): Drag-and-drop file uploader dengan live thumbnail gambar / icon PDF preview.
   - [`resources/js/components/doi/invoices/DoiPaymentProofForm.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/invoices/DoiPaymentProofForm.tsx): Formulir pengiriman transfer (Bank Pengirim, No Rekening, Tanggal, Nominal, Catatan).
   - [`resources/js/components/doi/invoices/DoiVerificationTimeline.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/invoices/DoiVerificationTimeline.tsx): Linimasa riwayat status verifikasi dan alert merah catatan admin jika terjadi penolakan.
   - [`resources/js/components/doi/invoices/DoiInvoiceDetailDrawer.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/invoices/DoiInvoiceDetailDrawer.tsx): Slide-over sheet rincian invoice & checkout action.
   - [`resources/js/components/doi/invoices/DoiInvoiceTable.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/invoices/DoiInvoiceTable.tsx): Tabel data invoice dengan search, tab filter status (`Semua`, `Belum Bayar`, `Menunggu Verifikasi`, `Lunas`), dan pagination.

3. **Pages & Navigation**:
   - [`resources/js/pages/AdminKampus/Doi/Invoices/Index.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/pages/AdminKampus/Doi/Invoices/Index.tsx): Halaman utama manajemen tagihan Admin Kampus.
   - [`resources/js/pages/User/Doi/Invoices/Index.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/pages/User/Doi/Invoices/Index.tsx): Halaman monitoring tagihan Pengelola Jurnal.
   - [`resources/js/components/doi/DoiActiveInvoiceCard.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/DoiActiveInvoiceCard.tsx): Integrasi trigger pembayaran langsung dari dashboard utama.

---

## 2. Verification Results

### Frontend Vite Build
```text
✓ built in 17.14s (0 TypeScript errors)
```

### Full DOI Backend Regression Suite
```text
docker exec -i jurnal-mu-app php artisan test --filter=Doi

PASS  Tests\Unit\Doi\DoiActionsTest (4 tests)
PASS  Tests\Unit\Doi\DoiEnumsTest (5 tests)
PASS  Tests\Unit\Doi\DoiEventsTest (3 tests)
PASS  Tests\Unit\Doi\DoiModelRelationshipTest (6 tests)
PASS  Tests\Unit\Doi\DoiQuotaManagerServiceTest (4 tests)
PASS  Tests\Feature\Doi\DoiDashboardTest (5 tests)
PASS  Tests\Feature\Doi\DoiDatabaseFoundationTest (1 test)
PASS  Tests\Feature\Doi\DoiInvoiceTest (8 tests)
PASS  Tests\Feature\Doi\DoiSecurityPolicyTest (3 tests)

Tests:    39 passed (356 assertions)
Duration: 28.15s
```
