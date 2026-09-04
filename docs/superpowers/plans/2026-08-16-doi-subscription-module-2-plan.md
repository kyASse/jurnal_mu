# DOI Subscription Module 2 Implementation Plan: Dashboard Langganan DOI (Frontend & Backend)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun dashboard terpadu Langganan DOI & Similarity Check untuk Admin Kampus dan Pengelola Jurnal, mencakup backend agregasi data, rute multi-tenant, komponen bento grid tactile, visual quota gauge, serta integrasi navigasi sidebar.

**Architecture:** Backend controller (`DoiSubscriptionController`) mengagregasi data status langganan, masa berlaku, prefix Crossref, pemakaian kuota similarity, dan tagihan aktif untuk perguruan tinggi user. Frontend Inertia React 19 menggunakan Tailwind CSS v4, Lucide React, dan Radix UI primitives menyajikan UI bento grid dengan angka monospaced tabular (`tabular-nums font-mono`) dan micro-interactions halus.

**Tech Stack:** Laravel 12 + Inertia.js React 19 + TypeScript + Tailwind CSS v4 + Radix UI + Lucide Icons.

---

### Task 1: Backend Routes & Controllers (AdminKampus & User)

**Files:**
- Create: `app/Http/Controllers/AdminKampus/DoiSubscriptionController.php`
- Create: `app/Http/Controllers/User/DoiSubscriptionController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Doi/DoiDashboardTest.php`

- [ ] **Step 1: Write the failing feature test**

```php
<?php

namespace Tests\Feature\Doi;

use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\QuotaChangeType;
use App\Enums\Doi\SubscriptionStatus;
use App\Models\DoiBankAccount;
use App\Models\DoiInvoice;
use App\Models\DoiPackage;
use App\Models\DoiPaymentProof;
use App\Models\DoiSimilarityQuotaLog;
use App\Models\DoiSubscription;
use App\Models\Journal;
use App\Models\Role;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DoiPackageSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DoiDashboardTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminKampus;
    protected User $userPengelola;
    protected University $university;
    protected DoiPackage $package;
    protected DoiSubscription $subscription;
    protected Journal $journal;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRoles();
        $this->seed(DoiPackageSeeder::class);

        $this->university = University::factory()->create([
            'name' => 'Universitas Muhammadiyah Dashboard Test',
        ]);

        $this->adminKampus = User::factory()->adminKampus()->create([
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $this->userPengelola = User::factory()->user()->create([
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $field = ScientificField::firstOrCreate(['name' => 'Ilmu Komputer']);

        $this->journal = Journal::factory()->create([
            'user_id' => $this->userPengelola->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $field->id,
            'title' => 'Jurnal Dashboard Test',
        ]);

        $this->package = DoiPackage::where('code', 'DOI-INST-STD')->firstOrFail();

        $this->subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => null,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'start_date' => Carbon::now()->subMonths(2),
            'end_date' => Carbon::now()->addMonths(10),
            'active_prefix' => '10.22219',
            'similarity_quota_total' => 250,
            'similarity_quota_used' => 50,
            'auto_renew' => true,
        ]);
    }

    public function test_admin_kampus_can_view_doi_dashboard_with_active_subscription(): void
    {
        $invoice = DoiInvoice::create([
            'invoice_number' => 'INV/DOI/202608/0099',
            'subscription_id' => $this->subscription->id,
            'university_id' => $this->university->id,
            'user_id' => $this->adminKampus->id,
            'subtotal' => 7500000,
            'total_amount' => 7500000,
            'status' => InvoiceStatus::UNPAID,
            'due_date' => Carbon::now()->addDays(14),
        ]);

        DoiSimilarityQuotaLog::create([
            'subscription_id' => $this->subscription->id,
            'journal_id' => $this->journal->id,
            'user_id' => $this->adminKampus->id,
            'change_type' => QuotaChangeType::USAGE,
            'amount' => -5,
            'balance_after' => 200,
            'description' => 'Uji similarity artikel Vol 1 No 1',
        ]);

        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin-kampus.doi-subscription.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AdminKampus/Doi/Dashboard')
            ->has('subscription')
            ->where('subscription.status', 'active')
            ->where('subscription.active_prefix', '10.22219')
            ->where('subscription.similarity_quota_total', 250)
            ->where('subscription.similarity_quota_used', 50)
            ->where('subscription.remaining_quota', 200)
            ->has('activeInvoice')
            ->where('activeInvoice.invoice_number', 'INV/DOI/202608/0099')
            ->has('recentQuotaLogs', 1)
            ->where('recentQuotaLogs.0.amount', -5)
            ->where('universityName', $this->university->name)
        );
    }

    public function test_pengelola_jurnal_can_view_doi_dashboard(): void
    {
        $response = $this->actingAs($this->userPengelola)
            ->get(route('user.doi-subscription.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('User/Doi/Dashboard')
            ->has('subscription')
            ->where('subscription.status', 'active')
            ->where('subscription.active_prefix', '10.22219')
        );
    }

    public function test_unauthenticated_user_cannot_view_doi_dashboard(): void
    {
        $response = $this->get('/admin-kampus/doi-subscription');
        $response->assertRedirect('/login');

        $response2 = $this->get('/user/doi-subscription');
        $response2->assertRedirect('/login');
    }

    public function test_dashboard_handles_empty_state_when_no_subscription_exists(): void
    {
        $newUniv = University::factory()->create(['name' => 'Universitas Tanpa Langganan']);
        $newAdmin = User::factory()->adminKampus()->create([
            'university_id' => $newUniv->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($newAdmin)
            ->get(route('admin-kampus.doi-subscription.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AdminKampus/Doi/Dashboard')
            ->where('subscription', null)
            ->where('activeInvoice', null)
            ->has('packages')
        );
    }

    public function test_multi_tenant_isolation_in_dashboard(): void
    {
        $univB = University::factory()->create(['name' => 'Universitas B']);
        $adminB = User::factory()->adminKampus()->create([
            'university_id' => $univB->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($adminB)
            ->get(route('admin-kampus.doi-subscription.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AdminKampus/Doi/Dashboard')
            ->where('subscription', null)
        );
    }
}
```

- [ ] **Step 2: Run test to verify failure**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/DoiDashboardTest.php`
Expected: FAIL (Route or Controller not found).

- [ ] **Step 3: Add routes in `routes/web.php`**

In `routes/web.php`, add under Admin Kampus and User route groups:
```php
// In Admin Kampus group:
Route::get('doi-subscription', [App\Http\Controllers\AdminKampus\DoiSubscriptionController::class, 'index'])
    ->name('doi-subscription.index');

// In User group:
Route::get('doi-subscription', [App\Http\Controllers\User\DoiSubscriptionController::class, 'index'])
    ->name('doi-subscription.index');
```

- [ ] **Step 4: Implement `AdminKampus\DoiSubscriptionController` and `User\DoiSubscriptionController`**

Create `app/Http/Controllers/AdminKampus/DoiSubscriptionController.php`:
```php
<?php

namespace App\Http\Controllers\AdminKampus;

use App\Enums\Doi\InvoiceStatus;
use App\Http\Controllers\Controller;
use App\Models\DoiInvoice;
use App\Models\DoiPackage;
use App\Models\DoiSimilarityQuotaLog;
use App\Models\DoiSubscription;
use App\Models\Journal;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoiSubscriptionController extends Controller
{
    /**
     * Display the institutional DOI & Similarity Check subscription dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $university = $user->university;

        $subscription = DoiSubscription::with('package')
            ->where('university_id', $user->university_id)
            ->latest('id')
            ->first();

        $activeInvoice = null;
        $recentQuotaLogs = [];
        $packages = [];

        if ($subscription) {
            $activeInvoice = DoiInvoice::with(['items', 'latestPaymentProof'])
                ->where('subscription_id', $subscription->id)
                ->whereIn('status', [InvoiceStatus::UNPAID, InvoiceStatus::PENDING_VERIFICATION])
                ->latest('id')
                ->first();

            $recentQuotaLogs = DoiSimilarityQuotaLog::with(['journal', 'user'])
                ->where('subscription_id', $subscription->id)
                ->latest('id')
                ->limit(5)
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'change_type' => $log->change_type->value,
                    'change_type_label' => $log->change_type->label(),
                    'amount' => $log->amount,
                    'balance_after' => $log->balance_after,
                    'description' => $log->description,
                    'created_at' => $log->created_at?->format('d M Y, H:i') ?? '',
                    'journal_title' => $log->journal?->title,
                    'user_name' => $log->user?->name,
                ]);
        } else {
            $packages = DoiPackage::active()->orderBy('price_annual')->get();
        }

        $subscriptionData = null;
        if ($subscription) {
            $now = Carbon::now();
            $endDate = $subscription->end_date ? Carbon::parse($subscription->end_date) : null;
            $daysRemaining = $endDate ? max(0, $now->diffInDays($endDate, false)) : 0;
            $totalQuota = $subscription->similarity_quota_total;
            $usedQuota = $subscription->similarity_quota_used;
            $remainingQuota = $subscription->remaining_quota;
            $quotaPercentage = $totalQuota > 0 ? round(($remainingQuota / $totalQuota) * 100) : 0;

            $subscriptionData = [
                'id' => $subscription->id,
                'status' => $subscription->status->value,
                'status_label' => $subscription->status->label(),
                'status_color' => $subscription->status->color(),
                'start_date' => $subscription->start_date?->format('d M Y'),
                'end_date' => $subscription->end_date?->format('d M Y'),
                'days_remaining' => (int) $daysRemaining,
                'is_expiring_soon' => $subscription->is_expiring_soon,
                'active_prefix' => $subscription->active_prefix,
                'similarity_quota_total' => $totalQuota,
                'similarity_quota_used' => $usedQuota,
                'remaining_quota' => $remainingQuota,
                'quota_percentage' => $quotaPercentage,
                'auto_renew' => (bool) $subscription->auto_renew,
                'package' => $subscription->package ? [
                    'id' => $subscription->package->id,
                    'name' => $subscription->package->name,
                    'code' => $subscription->package->code,
                    'description' => $subscription->package->description,
                    'price_annual' => (float) $subscription->package->price_annual,
                    'similarity_quota_included' => $subscription->package->similarity_quota_included,
                ] : null,
            ];
        }

        $invoiceData = null;
        if ($activeInvoice) {
            $invoiceData = [
                'id' => $activeInvoice->id,
                'invoice_number' => $activeInvoice->invoice_number,
                'total_amount' => (float) $activeInvoice->total_amount,
                'due_date' => $activeInvoice->due_date?->format('d M Y') ?? '',
                'status' => $activeInvoice->status->value,
                'status_label' => $activeInvoice->status->label(),
                'status_color' => $activeInvoice->status->color(),
                'latest_payment_proof' => $activeInvoice->latestPaymentProof ? [
                    'id' => $activeInvoice->latestPaymentProof->id,
                    'status' => $activeInvoice->latestPaymentProof->status->value,
                    'status_label' => $activeInvoice->latestPaymentProof->status->label(),
                    'admin_notes' => $activeInvoice->latestPaymentProof->admin_notes,
                    'created_at' => $activeInvoice->latestPaymentProof->created_at?->format('d M Y, H:i'),
                ] : null,
            ];
        }

        $journalsCount = $user->university_id
            ? Journal::where('university_id', $user->university_id)->count()
            : 0;

        return Inertia::render('AdminKampus/Doi/Dashboard', [
            'subscription' => $subscriptionData,
            'activeInvoice' => $invoiceData,
            'recentQuotaLogs' => $recentQuotaLogs,
            'packages' => $packages,
            'universityName' => $university?->name ?? 'Institusi',
            'journalsCount' => $journalsCount,
        ]);
    }
}
```

Create `app/Http/Controllers/User/DoiSubscriptionController.php`:
```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\AdminKampus\DoiSubscriptionController as BaseController;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoiSubscriptionController extends BaseController
{
    /**
     * Display the DOI & Similarity Check subscription dashboard for Journal Managers.
     */
    public function index(Request $request): Response
    {
        $response = parent::index($request);
        $props = $response->toResponse($request)->getOriginalContent()['page']['props'];

        return Inertia::render('User/Doi/Dashboard', $props);
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/DoiDashboardTest.php`
Expected: PASS (5 passed, assertions verified).

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/AdminKampus/DoiSubscriptionController.php app/Http/Controllers/User/DoiSubscriptionController.php routes/web.php tests/Feature/Doi/DoiDashboardTest.php
git commit -m "feat(doi): add dashboard controllers and multi-tenant routes for admin kampus and user"
```

---

### Task 2: Reusable Frontend DOI Components

**Files:**
- Create: `resources/js/types/doi.ts`
- Create: `resources/js/components/doi/DoiStatusHero.tsx`
- Create: `resources/js/components/doi/DoiPrefixCard.tsx`
- Create: `resources/js/components/doi/DoiQuotaGauge.tsx`
- Create: `resources/js/components/doi/DoiActiveInvoiceCard.tsx`
- Create: `resources/js/components/doi/DoiQuotaLogTable.tsx`
- Create: `resources/js/components/doi/DoiPackageDrawer.tsx`
- Create: `resources/js/components/doi/DoiEmptyState.tsx`

- [ ] **Step 1: Create TypeScript interface definitions (`resources/js/types/doi.ts`)**

```typescript
export interface DoiPackageData {
  id: number;
  name: string;
  code: string;
  description: string;
  price_annual: number;
  similarity_quota_included: number;
}

export interface DoiSubscriptionData {
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
  auto_renew: boolean;
  package: DoiPackageData | null;
}

export interface DoiPaymentProofData {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  status_label: string;
  admin_notes: string | null;
  created_at: string;
}

export interface DoiActiveInvoiceData {
  id: number;
  invoice_number: string;
  total_amount: number;
  due_date: string;
  status: 'unpaid' | 'pending_verification' | 'paid' | 'expired' | 'cancelled';
  status_label: string;
  status_color: string;
  latest_payment_proof: DoiPaymentProofData | null;
}

export interface DoiQuotaLogData {
  id: number;
  change_type: string;
  change_type_label: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
  journal_title: string | null;
  user_name: string | null;
}

export interface DoiDashboardProps {
  subscription: DoiSubscriptionData | null;
  activeInvoice: DoiActiveInvoiceData | null;
  recentQuotaLogs: DoiQuotaLogData[];
  packages?: DoiPackageData[];
  universityName: string;
  journalsCount: number;
}
```

- [ ] **Step 2: Implement `DoiStatusHero.tsx`**

Banner status langganan dengan *pulsing live dot*, countdown sisa hari, tanggal masa berlaku, dan trigger drawer info paket.

- [ ] **Step 3: Implement `DoiPrefixCard.tsx`**

Kartu prefix Crossref dengan monospaced typeface, 1-click copy dengan toast/checkmark tooltip animasi, jumlah jurnal terafiliasi, link ke portal Crossref.

- [ ] **Step 4: Implement `DoiQuotaGauge.tsx`**

Progress gauge kuota similarity check dengan transisi animasi halus (`duration-500`), persentase ketersediaan, status badge dinamis (Emerald/Amber/Rose), angka tabular mono.

- [ ] **Step 5: Implement `DoiActiveInvoiceCard.tsx`**

Banner tagihan aktif berjalan yang adaptif: peringatan unpaid/jatuh tempo, notifikasi pending verification, atau alert merah dengan catatan admin jika bukti transfer ditolak.

- [ ] **Step 6: Implement `DoiQuotaLogTable.tsx`**

Tabel mutasi 5 pemakaian kuota similarity check terakhir dengan badge jenis perubahan.

- [ ] **Step 7: Implement `DoiPackageDrawer.tsx` & `DoiEmptyState.tsx`**

Slide-over sheet rincian manfaat paket aktif & empty state onboarding saat universitas belum memiliki langganan aktif.

- [ ] **Step 8: Commit**

```bash
git add resources/js/types/doi.ts resources/js/components/doi/
git commit -m "feat(doi): create reusable bento components and types for doi dashboard"
```

---

### Task 3: Dashboard Pages & Sidebar Navigation Integration

**Files:**
- Create: `resources/js/pages/AdminKampus/Doi/Dashboard.tsx`
- Create: `resources/js/pages/User/Doi/Dashboard.tsx`
- Modify: `resources/js/components/app-sidebar.tsx`

- [ ] **Step 1: Implement `AdminKampus/Doi/Dashboard.tsx`**

Halaman utama dashboard untuk Admin Kampus, mengintegrasikan `AppLayout`, `DoiStatusHero`, `DoiPrefixCard`, `DoiQuotaGauge`, `DoiActiveInvoiceCard`, `DoiQuotaLogTable`, dan `DoiEmptyState`.

- [ ] **Step 2: Implement `User/Doi/Dashboard.tsx`**

Halaman dashboard untuk Pengelola Jurnal (User role), menyajikan informasi monitoring yang sama dengan konteks read-only institusi.

- [ ] **Step 3: Update `resources/js/components/app-sidebar.tsx`**

Tambahkan item menu navigasi `Langganan DOI` dengan icon `Globe` atau `ShieldCheck` pada section Admin Kampus dan Pengelola Jurnal yang mengarah ke route `admin-kampus.doi-subscription.index` dan `user.doi-subscription.index`.

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/AdminKampus/Doi/Dashboard.tsx resources/js/pages/User/Doi/Dashboard.tsx resources/js/components/app-sidebar.tsx
git commit -m "feat(doi): implement dashboard pages and integrate sidebar navigation"
```

---

### Task 4: Build Verification & Regression Test Suite

**Files:**
- Test: Full PHPUnit & Vite build

- [ ] **Step 1: Run TypeScript & Vite build**

Run: `npm run build`
Expected: Build successfully created without TS errors or missing imports.

- [ ] **Step 2: Run full DOI backend test suite**

Run: `docker exec -i jurnal-mu-app php artisan test --filter=Doi`
Expected: All tests PASS.

- [ ] **Step 3: Commit any adjustments if needed**

```bash
git commit -m "chore(doi): verify build and full test suite regression for module 2"
```
