# DOI Subscription Self-Service Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun alur pemesanan mandiri (*self-service checkout*) dan penerbitan faktur tagihan instan untuk Admin Kampus, sehingga Admin Kampus dapat memilih paket langganan langsung di antarmuka, menerbitkan faktur, dan langsung diarahkan ke layar instruksi pembayaran serta unggah bukti transfer.

**Architecture:** Route POST `admin-kampus.doi.subscribe` divalidasi oleh `SubscribeDoiPackageRequest` dan ditangani oleh `AdminKampus\DoiSubscriptionController@subscribe`. Menggunakan `GenerateInvoiceAction` untuk menerbitkan sequential invoice dan redirect ke `/admin-kampus/doi/invoices?invoice_id=...&action=pay`. Frontend `DoiPackageDrawer.tsx` menyediakan tombol CTA konfirmasi pemesanan interaktif dengan loading state.

**Tech Stack:** Laravel 12 + Inertia React (TypeScript) + Tailwind CSS + Lucide Icons + PHPUnit.

---

### Task 1: Backend FormRequest, Controller Endpoint, Route & Feature Test

**Files:**
- Create: `app/Http/Requests/Doi/SubscribeDoiPackageRequest.php`
- Modify: `app/Http/Controllers/AdminKampus/DoiSubscriptionController.php`
- Modify: `routes/web.php`
- Create: `tests/Feature/Doi/DoiSubscriptionSelfServiceTest.php`

- [ ] **Step 1: Write the failing feature test**

Create `tests/Feature/Doi/DoiSubscriptionSelfServiceTest.php` with test cases:
1. `test_admin_kampus_can_subscribe_to_package_and_generate_invoice`: Admin Kampus submits `package_id`, asserts invoice created, redirected to invoice page with `action=pay`.
2. `test_admin_kampus_redirected_to_existing_unpaid_invoice_without_duplication`: Asserts no duplicate invoice is created if unpaid invoice exists.
3. `test_non_admin_kampus_cannot_subscribe`: Asserts non-admin campus or guest receives 403/302.

- [ ] **Step 2: Run test to verify failure**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/DoiSubscriptionSelfServiceTest.php`
Expected: FAIL (Route/action not implemented yet).

- [ ] **Step 3: Implement `SubscribeDoiPackageRequest.php`**

Create FormRequest with `package_id` validation and `isAdminKampus()` authorization.

- [ ] **Step 4: Implement `subscribe()` method in `AdminKampus\DoiSubscriptionController.php` & Register Route**

Implement logic in controller: anti-duplication check, subscription init, `GenerateInvoiceAction::execute()`, and redirect with flash message. Register route `POST /admin-kampus/doi/subscribe` in `routes/web.php`.

- [ ] **Step 5: Run test to verify it passes**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/DoiSubscriptionSelfServiceTest.php`
Expected: PASS (All 3 tests passing).

- [ ] **Step 6: Commit**

```bash
git add app/Http/Requests/Doi/SubscribeDoiPackageRequest.php app/Http/Controllers/AdminKampus/DoiSubscriptionController.php routes/web.php tests/Feature/Doi/DoiSubscriptionSelfServiceTest.php
git commit -m "feat(doi): implement self-service subscription order endpoint and tests"
```

---

### Task 2: Frontend Drawer & Dashboard Integration

**Files:**
- Modify: `resources/js/components/doi/DoiPackageDrawer.tsx`
- Modify: `resources/js/pages/AdminKampus/Doi/Dashboard.tsx`

- [ ] **Step 1: Update `DoiPackageDrawer.tsx`**

Add `onSubscribe?: (pkg: DoiPackageData) => void` or Inertia form submit handler, add primary button **[Konfirmasi & Ajukan Paket Ini]** in footer with price summary, loading spinner, and proper disabled states.

- [ ] **Step 2: Update `Dashboard.tsx`**

Connect package selection and subscription handler from `DoiEmptyState` and `DoiPackageDrawer` to trigger `router.post(route('admin-kampus.doi.subscribe'), { package_id: selectedPackage.id })`.

- [ ] **Step 3: Run frontend build check**

Run: `npm run build`
Expected: SUCCESS with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add resources/js/components/doi/DoiPackageDrawer.tsx resources/js/pages/AdminKampus/Doi/Dashboard.tsx
git commit -m "feat(doi): add interactive subscription order action to package drawer"
```

---

### Task 3: Full Verification & Regression Test Suite

**Files:**
- Full test suite & Vite build

- [ ] **Step 1: Run full DOI feature & unit tests in Docker**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/` and `docker exec -i jurnal-mu-app php artisan test tests/Unit/Doi/`
Expected: 100% tests PASS.

- [ ] **Step 2: Update `walkthrough.md`**

Document the self-service ordering workflow and verification results.

- [ ] **Step 3: Commit**

```bash
git add walkthrough.md
git commit -m "docs: update walkthrough with self-service order flow"
```
