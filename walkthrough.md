# Walkthrough: DOI Subscription Module 4 (Super Admin Management & Verification Drawer)

**Target Branch:** `feat/doi-subscription-module-4`  
**Status:** COMPLETED & FULLY VERIFIED (100% Tests Passing, Build Clean)

---

## 1. Accomplishments Overview

Modul 4 mengimplementasikan pusat kendali terpadu **Super Admin DOI Command Center** untuk Majelis Diktilitbang PPM Muhammadiyah:
1. **Top National Bento Metrics**: 4 kartu metrik agregasi nasional (Total PTMA Aktif, Antrian Verifikasi dengan Live Pulsing Amber Dot, Konsumsi Kuota Similarity Terpakai, Total Pendapatan Faktur Lunas).
2. **Interactive Split-View Verification Drawer**:
   - **Document Viewer**: Live preview gambar resi atau PDF embed dengan tombol `Zoom In (+)`, `Zoom Out (-)`, `Rotate 90°`, dan `Buka Berkas Asli / Download`.
   - **Transaction Review & Decision**: Otomatisasi perbandingan nominal tagihan vs nominal transfer (`MATCH` / `MISMATCH` badge), detail rekening bank, tombol `[Setujui & Perpanjang +1 Tahun]`, dan form penolakan `[Tolak Bukti]` dengan validasi catatan wajib.
3. **Master Langganan PTMA**: Tabel pemantauan seluruh universitas & jurnal se-Indonesia dengan filter status, pencarian, progress kuota, dan modal penyesuaian kuota manual (`DoiQuotaAdjustDialog`).
4. **Manajemen Master Paket & Rekening Bank**: Tab CRUD paket langganan dan rekening bank resmi Diktilitbang PPM.
5. **Sidebar Navigation**: Menu `Kelola DOI (Diktilitbang)` di bawah bagian Super Admin.

---

## 2. File & Component Breakdown

### Backend Controllers, FormRequests, & Routes
- [`app/Http/Requests/Doi/Admin/VerifyPaymentProofRequest.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Requests/Doi/Admin/VerifyPaymentProofRequest.php)
- [`app/Http/Requests/Doi/Admin/AdjustQuotaRequest.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Requests/Doi/Admin/AdjustQuotaRequest.php)
- [`app/Http/Requests/Doi/Admin/DoiPackageRequest.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Requests/Doi/Admin/DoiPackageRequest.php)
- [`app/Http/Requests/Doi/Admin/DoiBankAccountRequest.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Requests/Doi/Admin/DoiBankAccountRequest.php)
- [`app/Http/Controllers/Admin/Doi/AdminDoiManagementController.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Controllers/Admin/Doi/AdminDoiManagementController.php)
- [`app/Http/Controllers/Admin/Doi/AdminDoiVerificationController.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Controllers/Admin/Doi/AdminDoiVerificationController.php)
- [`app/Http/Controllers/Admin/Doi/AdminDoiSubscriptionController.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Controllers/Admin/Doi/AdminDoiSubscriptionController.php)
- [`app/Http/Controllers/Admin/Doi/AdminDoiPackageController.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Controllers/Admin/Doi/AdminDoiPackageController.php)
- [`app/Http/Controllers/Admin/Doi/AdminDoiBankAccountController.php`](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Controllers/Admin/Doi/AdminDoiBankAccountController.php)
- [`routes/web.php`](file:///c:/xampp/htdocs/jurnal_mu/routes/web.php) (Prefix `/admin/doi-management`)

### Frontend Components & Page
- [`resources/js/types/doi.ts`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/types/doi.ts)
- [`resources/js/components/doi/admin/DoiAdminStatsCards.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/admin/DoiAdminStatsCards.tsx)
- [`resources/js/components/doi/admin/DoiDocumentViewer.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/admin/DoiDocumentViewer.tsx)
- [`resources/js/components/doi/admin/DoiVerificationDrawer.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/admin/DoiVerificationDrawer.tsx)
- [`resources/js/components/doi/admin/DoiVerificationTable.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/admin/DoiVerificationTable.tsx)
- [`resources/js/components/doi/admin/DoiSubscriptionsMasterTable.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/admin/DoiSubscriptionsMasterTable.tsx)
- [`resources/js/components/doi/admin/DoiQuotaAdjustDialog.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/admin/DoiQuotaAdjustDialog.tsx)
- [`resources/js/components/doi/admin/DoiPackageManagementTab.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/admin/DoiPackageManagementTab.tsx)
- [`resources/js/components/doi/admin/DoiBankAccountManagementTab.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/doi/admin/DoiBankAccountManagementTab.tsx)
- [`resources/js/pages/Admin/Doi/Index.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/pages/Admin/Doi/Index.tsx)
- [`resources/js/components/app-sidebar.tsx`](file:///c:/xampp/htdocs/jurnal_mu/resources/js/components/app-sidebar.tsx)

---

## 3. Verification Results

### Automated Tests
- `tests/Feature/Doi/AdminDoiManagementTest.php`: **8 passed (58 assertions)**
- Full DOI Test Suite: **47 passed (414 assertions)**

### Frontend Build
- `npm run build`: built in **23.77s** (0 errors).
