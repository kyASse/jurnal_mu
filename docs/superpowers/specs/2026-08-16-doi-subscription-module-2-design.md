# Technical Design Spec: DOI Subscription Module 2 (Dashboard Langganan DOI - Frontend & Backend)

**Document Metadata**:
- **Topic**: Modul 2 - Dashboard Langganan DOI (Frontend & Backend)
- **Date**: 2026-08-16
- **Status**: APPROVED
- **Target Branch**: `feat/doi-subscription-module-2`
- **Dependencies**: Modul 0 (Database & Models), Modul 1 (Core Actions, Services, Security Policies)

---

## 1. Overview & Objective

Modul 2 mengimplementasikan antarmuka dan backend controller untuk **Dashboard Langganan DOI & Similarity Check**. Dashboard ini menjadi pusat monitoring bagi **Admin Kampus** dan **Pengelola Jurnal** untuk memantau:
1. Status masa aktif langganan Crossref tahunan beserta countdown waktu kadaluwarsa.
2. Prefix resmi Crossref institusi (`10.xxxxx/`) dengan aksi *1-Click Copy to Clipboard*.
3. Saldo dan kuota dokumen uji plagiasi (Turnitin/iThenticate) dalam bentuk visual progress gauge interaktif.
4. Ringkasan tagihan berjalan (*Active Invoice*) dan notifikasi penolakan bukti bayar jika ada.
5. Riwayat mutasi/penggunaan kuota similarity check terbaru.
6. Penanganan *empty state* / *onboarding view* jika perguruan tinggi belum memiliki langganan aktif.

---

## 2. Design Read & Visual System

- **Design Read**: *"Institutional B2B SaaS Dashboard untuk Administrator Perguruan Tinggi & Pengelola Jurnal Muhammadiyah, dengan bahasa visual Clean Tactile Enterprise, berbasis Tailwind CSS v4 + Radix UI + Plus Jakarta Sans & Tabular Numerals."*
- **Dials Calibration**:
  - `DESIGN_VARIANCE: 5` (Tata letak terstruktur, simetris, hierarki informasi jelas)
  - `MOTION_INTENSITY: 3` (Animasi halus pada progress bar gauge, feedback copy clipboard, hover tactile tanpa distraksi)
  - `VISUAL_DENSITY: 5` (Data padat dan efisien untuk kebutuhan operasional kampus)

### Semantic Color Palette
- Primary Brand: Muhammadiyah Blue (`#1E3A8A`)
- Neutral Surfaces: Pure White (`#FFFFFF`), Slate Gray (`#F8FAFC` / `#0F172A`), Border Subtle (`#E2E8F0`)
- Status Active/Lunas: Emerald (`#ECFDF5` bg, `#065F46` text, `#10B981` dot)
- Status Pending: Blue (`#EFF6FF` bg, `#1E40AF` text, `#3B82F6` dot)
- Status Unpaid/Warning: Amber (`#FFFBEB` bg, `#92400E` text, `#F59E0B` dot)
- Status Rejected/Expired: Rose (`#FEF2F2` bg, `#991B1B` text, `#EF4444` dot)

---

## 3. Backend Architecture & Controller

### 3.1 Routing Configuration (`routes/web.php`)
```php
// Admin Kampus Portal
Route::middleware(['auth', 'verified', 'role:' . Role::ADMIN_KAMPUS])
    ->prefix('admin-kampus')
    ->name('admin-kampus.')
    ->group(function () {
        Route::get('doi-subscription', [App\Http\Controllers\AdminKampus\DoiSubscriptionController::class, 'index'])
            ->name('doi-subscription.index');
    });

// Pengelola Jurnal Portal
Route::middleware(['auth', 'verified', 'role:' . Role::USER . ',' . Role::PENGELOLA_JURNAL])
    ->prefix('user')
    ->name('user.')
    ->group(function () {
        Route::get('doi-subscription', [App\Http\Controllers\User\DoiSubscriptionController::class, 'index'])
            ->name('doi-subscription.index');
    });
```

### 3.2 Controller Logic
- **`App\Http\Controllers\AdminKampus\DoiSubscriptionController@index`**:
  1. Identifikasi `university_id` dari `$user = auth()->user()`.
  2. Query `DoiSubscription` terbaru milik universitas dengan eager loading `doiPackage`.
  3. Query tagihan aktif `DoiInvoice` berstatus `UNPAID` atau `PENDING_VERIFICATION` dengan `latestPaymentProof`.
  4. Query riwayat log kuota `DoiSimilarityQuotaLog` (5 data terakhir) dengan relasi `journal` dan `user`.
  5. Hitung metrik: `days_remaining`, `is_expiring_soon`, `quota_percentage`, dan mapping badge status.
  6. Return `Inertia::render('AdminKampus/Doi/Dashboard', [...props])`.

- **`App\Http\Controllers\User\DoiSubscriptionController@index`**:
  - Logika identik dengan penyesuaian role context dan return `Inertia::render('User/Doi/Dashboard', [...props])`.

---

## 4. Frontend Architecture & TypeScript Schema

### 4.1 Inertia Props Contract (`types/doi.ts` atau inline props)
```typescript
export interface DoiDashboardProps {
  subscription: {
    id: number;
    status: 'active' | 'inactive' | 'pending_verification' | 'grace_period' | 'expired';
    status_label: string;
    status_color: string;
    start_date: string | null;
    end_date: string | null;
    days_remaining: number;
    is_expiring_soon: boolean;
    active_prefix: string | null;
    similarity_quota_total: number;
    similarity_quota_used: number;
    remaining_quota: number;
    quota_percentage: number;
    package: {
      id: number;
      name: string;
      code: string;
      description: string;
      price_annual: number;
      similarity_quota_included: number;
    } | null;
  } | null;
  activeInvoice: {
    id: number;
    invoice_number: string;
    total_amount: number;
    due_date: string;
    status: 'unpaid' | 'pending_verification' | 'paid' | 'expired' | 'cancelled';
    status_label: string;
    latest_payment_proof: {
      id: number;
      status: 'pending' | 'approved' | 'rejected';
      admin_notes: string | null;
      created_at: string;
    } | null;
  } | null;
  recentQuotaLogs: Array<{
    id: number;
    change_type: string;
    change_type_label: string;
    amount: number;
    balance_after: number;
    description: string;
    created_at: string;
    journal_title: string | null;
    user_name: string | null;
  }>;
  universityName: string;
  journalsCount: number;
}
```

### 4.2 UI Components Breakdown (`resources/js/components/doi/`)
1. **`DoiStatusHero.tsx`**:
   - Header banner dengan badge *pulsing live dot*, countdown hari tersisa, dan info paket.
2. **`DoiPrefixCard.tsx`**:
   - Kartu monospaced prefix Crossref (`10.xxxxx/`), tombol *1-Click Copy* dengan visual checkmark animasi, jumlah jurnal terafiliasi, dan shortcut ke portal Crossref.
3. **`DoiQuotaGauge.tsx`**:
   - Progress bar fluid similarity check (Emerald $>30\%$, Amber $10\text{--}30\%$, Rose $<10\%$), detail kuota terpakai vs tersisa, dan angka monospaced tabular.
4. **`DoiActiveInvoiceCard.tsx`**:
   - Banner status tagihan berjalan: peringatan unpaid/jatuh tempo, notifikasi pending review, atau alert merah dengan catatan admin jika bukti transfer ditolak.
5. **`DoiQuotaLogTable.tsx`**:
   - Tabel 5 mutasi pemakaian kuota similarity check terakhir.
6. **`DoiPackageDrawer.tsx`**:
   - Sheet slide-over rincian fitur paket langganan aktif.
7. **`DoiEmptyState.tsx`**:
   - Tampilan onboarding informatif saat kampus belum memiliki langganan aktif.

---

## 5. Testing & Verification Plan

### 5.1 Automated Feature Test (`tests/Feature/Doi/DoiDashboardTest.php`)
- `test_admin_kampus_can_view_doi_dashboard_with_active_subscription`: Memastikan response 200 OK, props lengkap untuk Admin Kampus.
- `test_pengelola_jurnal_can_view_doi_dashboard`: Memastikan response 200 OK untuk role User/Pengelola Jurnal.
- `test_unauthenticated_user_redirected_to_login`: Memastikan route terlindungi autentikasi.
- `test_dashboard_handles_empty_state_when_no_subscription_exists`: Memastikan penanganan `subscription: null` tanpa exception.
- `test_multi_tenant_isolation_in_dashboard`: Memastikan isolasi data antar kampus.

### 5.2 Build & Regression Suite
- `npm run build`: Memastikan bundling React Inertia TypeScript bebas error.
- `docker exec -i jurnal-mu-app php artisan test --filter=Doi`: Memastikan 100% test suite DOI lulus.
