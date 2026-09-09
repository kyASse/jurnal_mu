# DOI Subscription Module 4 Implementation Plan: Super Admin Management & Verification Drawer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun antarmuka dan backend terpadu Super Admin DOI Command Center untuk Majelis Diktilitbang PPM Muhammadiyah: agregasi metrik nasional, antrian verifikasi bukti transfer dengan interactive split-view drawer (document viewer gambar/PDF + review & persetujuan), master langganan seluruh PTMA, penyesuaian kuota similarity, serta manajemen paket dan rekening bank.

**Architecture:** Backend controller (`AdminDoiManagementController`, `AdminDoiVerificationController`, `AdminDoiSubscriptionController`, `AdminDoiPackageController`, `AdminDoiBankAccountController`) mengelola otorisasi Super Admin, pemanggilan domain action `VerifyPaymentProofAction` & `DoiQuotaManagerService`. Frontend Inertia React 19 menggunakan Bento Grid metric tiles, split-view document preview drawer, tabbed management views, dan format monospaced tabular numerals.

**Tech Stack:** Laravel 12 + Inertia.js React 19 + TypeScript + Tailwind CSS v4 + Radix UI + Lucide Icons.

---

### Task 1: Super Admin Backend Controllers, FormRequests, Actions & Routes

**Files:**
- Create: `app/Http/Requests/Doi/Admin/VerifyPaymentProofRequest.php`
- Create: `app/Http/Requests/Doi/Admin/AdjustQuotaRequest.php`
- Create: `app/Http/Requests/Doi/Admin/DoiPackageRequest.php`
- Create: `app/Http/Requests/Doi/Admin/DoiBankAccountRequest.php`
- Create: `app/Http/Controllers/Admin/Doi/AdminDoiManagementController.php`
- Create: `app/Http/Controllers/Admin/Doi/AdminDoiVerificationController.php`
- Create: `app/Http/Controllers/Admin/Doi/AdminDoiSubscriptionController.php`
- Create: `app/Http/Controllers/Admin/Doi/AdminDoiPackageController.php`
- Create: `app/Http/Controllers/Admin/Doi/AdminDoiBankAccountController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Doi/AdminDoiManagementTest.php`

- [ ] **Step 1: Write the failing feature test**

Create `tests/Feature/Doi/AdminDoiManagementTest.php` covering:
1. `test_super_admin_can_access_doi_management_dashboard`: Assert 200 OK, props lengkap untuk Super Admin.
2. `test_non_super_admin_cannot_access_doi_management_dashboard`: Assert 403 Forbidden untuk role selain Super Admin.
3. `test_super_admin_can_approve_payment_proof`: Assert status proof `APPROVED`, invoice `PAID`, subscription $+1$ year, similarity quota added, event dispatched.
4. `test_super_admin_can_reject_payment_proof_with_notes`: Assert status proof `REJECTED`, invoice `UNPAID`, notes saved, event dispatched.
5. `test_reject_payment_proof_requires_admin_notes`: Assert validation error when rejecting without reason.
6. `test_super_admin_can_adjust_similarity_quota_with_audit_log`: Assert quota changed and recorded in `doi_similarity_quota_logs`.
7. `test_super_admin_can_manage_packages`: Assert CRUD packages.
8. `test_super_admin_can_manage_bank_accounts`: Assert CRUD bank accounts.

- [ ] **Step 2: Run test to verify failure**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/AdminDoiManagementTest.php`
Expected: FAIL (Routes and controllers not registered yet).

- [ ] **Step 3: Implement FormRequests**

Implement `VerifyPaymentProofRequest`, `AdjustQuotaRequest`, `DoiPackageRequest`, `DoiBankAccountRequest`.

- [ ] **Step 4: Register routes in `routes/web.php`**

Register Super Admin group `/admin/doi-management` with permissions restricted to `Role::SUPER_ADMIN`.

- [ ] **Step 5: Implement Super Admin Controllers**

Implement `AdminDoiManagementController`, `AdminDoiVerificationController`, `AdminDoiSubscriptionController`, `AdminDoiPackageController`, `AdminDoiBankAccountController`.

- [ ] **Step 6: Run test to verify it passes**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/AdminDoiManagementTest.php`
Expected: PASS (All tests passing).

- [ ] **Step 7: Commit**

```bash
git add app/Http/Requests/Doi/Admin/ app/Http/Controllers/Admin/Doi/ routes/web.php tests/Feature/Doi/AdminDoiManagementTest.php
git commit -m "feat(doi): implement super admin controllers, verification actions, and management routes"
```

---

### Task 2: Reusable Frontend Super Admin Components

**Files:**
- Modify: `resources/js/types/doi.ts`
- Create: `resources/js/components/doi/admin/DoiAdminStatsCards.tsx`
- Create: `resources/js/components/doi/admin/DoiDocumentViewer.tsx`
- Create: `resources/js/components/doi/admin/DoiVerificationDrawer.tsx`
- Create: `resources/js/components/doi/admin/DoiVerificationTable.tsx`
- Create: `resources/js/components/doi/admin/DoiSubscriptionsMasterTable.tsx`
- Create: `resources/js/components/doi/admin/DoiQuotaAdjustDialog.tsx`
- Create: `resources/js/components/doi/admin/DoiPackageManagementTab.tsx`
- Create: `resources/js/components/doi/admin/DoiBankAccountManagementTab.tsx`
- Create: `resources/js/components/doi/admin/index.ts`

- [ ] **Step 1: Extend TypeScript definitions in `resources/js/types/doi.ts`**

Add `SuperAdminDoiManagementProps`, `VerificationReviewData`, `AdjustQuotaFormData`, `DoiPackageFormData`, `DoiBankAccountFormData`.

- [ ] **Step 2: Implement `DoiAdminStatsCards.tsx`**

4 Bento summary metrics (Total PTMA Aktif, Pending Queue with live pulse indicator, Kuota Similarity Terpakai, Total Tagihan Berjalan).

- [ ] **Step 3: Implement `DoiDocumentViewer.tsx` & `DoiVerificationDrawer.tsx`**

Split-view verification drawer:
- Left panel: Zoom In/Out, Rotate, Download controls for Image/PDF receipts.
- Right panel: University info, invoice breakdown, comparison badge (`MATCH`/`MISMATCH`), approval button & reject with notes.

- [ ] **Step 4: Implement `DoiVerificationTable.tsx` & `DoiSubscriptionsMasterTable.tsx`**

Pending queue table and national master subscriptions table with search, status filters, and action buttons.

- [ ] **Step 5: Implement `DoiQuotaAdjustDialog.tsx`, `DoiPackageManagementTab.tsx`, and `DoiBankAccountManagementTab.tsx`**

Modal penyesuaian kuota audit log + tab CRUD paket & rekening bank resmi.

- [ ] **Step 6: Commit**

```bash
git add resources/js/types/doi.ts resources/js/components/doi/admin/
git commit -m "feat(doi): create reusable frontend super admin components and split-view drawer"
```

---

### Task 3: Super Admin Command Center Page & Sidebar Navigation

**Files:**
- Create: `resources/js/pages/Admin/Doi/Index.tsx`
- Modify: `resources/js/components/app-sidebar.tsx`

- [ ] **Step 1: Implement `resources/js/pages/Admin/Doi/Index.tsx`**

Integrates AppLayout, Breadcrumbs, Head, DoiAdminStatsCards, and 4 interactive Tabs:
- Tab 1: Antrian Verifikasi (Pending Queue)
- Tab 2: Master Langganan PTMA
- Tab 3: Paket Langganan
- Tab 4: Rekening Bank Resmi

- [ ] **Step 2: Update Sidebar Navigation in `app-sidebar.tsx`**

Add `Kelola DOI (Diktilitbang)` in `app-sidebar.tsx` under Super Admin menu group.

- [ ] **Step 3: Commit**

```bash
git add resources/js/pages/Admin/Doi/Index.tsx resources/js/components/app-sidebar.tsx
git commit -m "feat(doi): implement super admin doi management page and sidebar navigation"
```

---

### Task 4: Build Verification & Regression Test Suite

**Files:**
- Full test suite & Vite build

- [ ] **Step 1: Run TypeScript & Vite build**

Run: `npm run build`
Expected: SUCCESS without error.

- [ ] **Step 2: Run full DOI backend test suite**

Run: `docker exec -i jurnal-mu-app php artisan test --filter=Doi`
Expected: 100% tests PASS.

- [ ] **Step 3: Commit any adjustments if needed**
