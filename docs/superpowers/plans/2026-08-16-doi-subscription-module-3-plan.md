# DOI Subscription Module 3 Implementation Plan: Invoices Management & Manual Bank Payment Proof

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun antarmuka dan backend manajemen tagihan (*Invoices*) serta alur pembayaran transfer manual dengan formulir unggah bukti bayar (*Payment Proof*) interaktif, live dropzone preview, instruksi rekening bank resmi Diktilitbang PPM, dan authorized private file streaming.

**Architecture:** Backend controller (`DoiInvoiceController` & `DoiPaymentProofController`) mengelola query invoice multi-tenant, otorisasi policy, validasi file upload via FormRequest, dan pemanggilan domain action `StorePaymentProofAction`. Frontend Inertia React 19 menggunakan Bento Grid table, slide-over payment drawer, drag-and-drop live preview dropzone, dan format monospaced tabular numerals.

**Tech Stack:** Laravel 12 + Inertia.js React 19 + TypeScript + Tailwind CSS v4 + Radix UI + Lucide Icons.

---

### Task 1: FormRequest, Controllers, and Routes for Invoices & Payment Proofs

**Files:**
- Create: `app/Http/Requests/Doi/StorePaymentProofRequest.php`
- Create: `app/Http/Controllers/AdminKampus/DoiInvoiceController.php`
- Create: `app/Http/Controllers/AdminKampus/DoiPaymentProofController.php`
- Create: `app/Http/Controllers/User/DoiInvoiceController.php`
- Create: `app/Http/Controllers/User/DoiPaymentProofController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Doi/DoiInvoiceTest.php`

- [ ] **Step 1: Write the failing feature test**

```php
<?php

namespace Tests\Feature\Doi;

use App\Actions\Doi\GenerateInvoiceAction;
use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\SubscriptionStatus;
use App\Events\Doi\PaymentProofUploaded;
use App\Models\DoiBankAccount;
use App\Models\DoiInvoice;
use App\Models\DoiPackage;
use App\Models\DoiPaymentProof;
use App\Models\DoiSubscription;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DoiBankAccountSeeder;
use Database\Seeders\DoiPackageSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DoiInvoiceTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminKampus;
    protected User $userPengelola;
    protected University $university;
    protected DoiPackage $package;
    protected DoiSubscription $subscription;
    protected DoiInvoice $invoice;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Administrator']);
        Role::firstOrCreate(['name' => Role::ADMIN_KAMPUS], ['display_name' => 'Administrator Kampus']);
        Role::firstOrCreate(['name' => Role::USER], ['display_name' => 'Pengelola Jurnal']);

        $this->seed(DoiPackageSeeder::class);
        $this->seed(DoiBankAccountSeeder::class);

        $this->university = University::factory()->create([
            'name' => 'Universitas Muhammadiyah Invoice Test',
        ]);

        $this->adminKampus = User::factory()->adminKampus()->create([
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $this->userPengelola = User::factory()->user()->create([
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $this->package = DoiPackage::where('code', 'DOI-INST-STD')->firstOrFail();

        $this->subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'start_date' => Carbon::now()->subMonth(),
            'end_date' => Carbon::now()->addMonths(11),
            'similarity_quota_total' => 250,
            'similarity_quota_used' => 0,
        ]);

        $action = new GenerateInvoiceAction();
        $this->invoice = $action->execute($this->subscription, $this->adminKampus);
    }

    public function test_admin_kampus_can_view_invoice_list_for_their_university(): void
    {
        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin-kampus.doi-subscription.invoices.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AdminKampus/Doi/Invoices/Index')
            ->has('invoices', 1)
            ->where('invoices.0.invoice_number', $this->invoice->invoice_number)
            ->has('bankAccounts')
            ->has('stats')
            ->where('stats.totalInvoicesCount', 1)
            ->where('stats.unpaidInvoicesCount', 1)
            ->where('universityName', $this->university->name)
        );
    }

    public function test_pengelola_jurnal_can_view_invoice_list(): void
    {
        $response = $this->actingAs($this->userPengelola)
            ->get(route('user.doi-subscription.invoices.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('User/Doi/Invoices/Index')
            ->has('invoices', 1)
            ->where('invoices.0.invoice_number', $this->invoice->invoice_number)
        );
    }

    public function test_multi_tenant_isolation_on_invoice_listing(): void
    {
        $univB = University::factory()->create(['name' => 'Universitas B']);
        $adminB = User::factory()->adminKampus()->create([
            'university_id' => $univB->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($adminB)
            ->get(route('admin-kampus.doi-subscription.invoices.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AdminKampus/Doi/Invoices/Index')
            ->has('invoices', 0)
            ->where('stats.totalInvoicesCount', 0)
        );
    }

    public function test_admin_kampus_can_upload_payment_proof_for_unpaid_invoice(): void
    {
        Storage::fake('doi_proofs');
        Event::fake([PaymentProofUploaded::class]);

        $file = UploadedFile::fake()->create('transfer_receipt.jpg', 500, 'image/jpeg');

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.doi-subscription.payment-proofs.store', $this->invoice), [
                'bank_name' => 'Bank Syariah Indonesia',
                'account_number' => '1234567890',
                'account_name' => 'Bendahara UAD',
                'amount_paid' => $this->invoice->total_amount,
                'transfer_date' => Carbon::today()->format('Y-m-d'),
                'notes' => 'Pembayaran lunas langganan DOI',
                'proof_file' => $file,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('doi_payment_proofs', [
            'invoice_id' => $this->invoice->id,
            'university_id' => $this->university->id,
            'bank_name' => 'Bank Syariah Indonesia',
            'account_number' => '1234567890',
            'status' => PaymentProofStatus::PENDING->value,
        ]);

        $this->invoice->refresh();
        $this->assertEquals(InvoiceStatus::PENDING_VERIFICATION, $this->invoice->status);

        Event::assertDispatched(PaymentProofUploaded::class);
    }

    public function test_upload_payment_proof_validates_mime_and_size(): void
    {
        Storage::fake('doi_proofs');

        // File too large (> 5MB)
        $largeFile = UploadedFile::fake()->create('huge_file.pdf', 6000, 'application/pdf');

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.doi-subscription.payment-proofs.store', $this->invoice), [
                'bank_name' => 'Bank Syariah Indonesia',
                'account_number' => '1234567890',
                'account_name' => 'Bendahara UAD',
                'amount_paid' => $this->invoice->total_amount,
                'transfer_date' => Carbon::today()->format('Y-m-d'),
                'proof_file' => $largeFile,
            ]);

        $response->assertSessionHasErrors(['proof_file']);

        // Invalid file format (.txt)
        $txtFile = UploadedFile::fake()->create('receipt.txt', 100, 'text/plain');

        $response2 = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.doi-subscription.payment-proofs.store', $this->invoice), [
                'bank_name' => 'Bank Syariah Indonesia',
                'account_number' => '1234567890',
                'account_name' => 'Bendahara UAD',
                'amount_paid' => $this->invoice->total_amount,
                'transfer_date' => Carbon::today()->format('Y-m-d'),
                'proof_file' => $txtFile,
            ]);

        $response2->assertSessionHasErrors(['proof_file']);
    }

    public function test_admin_kampus_can_stream_own_payment_proof(): void
    {
        Storage::fake('doi_proofs');

        $file = UploadedFile::fake()->create('proof.pdf', 200, 'application/pdf');
        $storedPath = $file->store('doi_proofs/2026/08', 'doi_proofs');

        $proof = DoiPaymentProof::create([
            'invoice_id' => $this->invoice->id,
            'university_id' => $this->university->id,
            'user_id' => $this->adminKampus->id,
            'bank_name' => 'Bank Mandiri',
            'account_number' => '987654321',
            'account_name' => 'LPPM Test',
            'amount_paid' => 7500000,
            'transfer_date' => Carbon::today(),
            'file_path' => $storedPath,
            'file_name' => 'proof.pdf',
            'file_size' => 204800,
            'mime_type' => 'application/pdf',
            'status' => PaymentProofStatus::PENDING,
        ]);

        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin-kampus.doi-subscription.payment-proofs.stream', $proof));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_user_cannot_access_other_university_payment_proof(): void
    {
        Storage::fake('doi_proofs');

        $univB = University::factory()->create(['name' => 'Universitas B']);
        $adminB = User::factory()->adminKampus()->create([
            'university_id' => $univB->id,
            'is_active' => true,
        ]);

        $proof = DoiPaymentProof::create([
            'invoice_id' => $this->invoice->id,
            'university_id' => $this->university->id,
            'user_id' => $this->adminKampus->id,
            'bank_name' => 'Bank Mandiri',
            'account_number' => '987654321',
            'account_name' => 'LPPM Test',
            'amount_paid' => 7500000,
            'transfer_date' => Carbon::today(),
            'file_path' => 'doi_proofs/2026/08/fake.pdf',
            'file_name' => 'fake.pdf',
            'file_size' => 204800,
            'mime_type' => 'application/pdf',
            'status' => PaymentProofStatus::PENDING,
        ]);

        $response = $this->actingAs($adminB)
            ->get(route('admin-kampus.doi-subscription.payment-proofs.stream', $proof));

        $response->assertStatus(403);
    }

    public function test_cannot_upload_payment_proof_for_paid_invoice(): void
    {
        Storage::fake('doi_proofs');

        $this->invoice->update(['status' => InvoiceStatus::PAID, 'paid_at' => now()]);

        $file = UploadedFile::fake()->create('proof.jpg', 200, 'image/jpeg');

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.doi-subscription.payment-proofs.store', $this->invoice), [
                'bank_name' => 'Bank Syariah Indonesia',
                'account_number' => '1234567890',
                'account_name' => 'Bendahara UAD',
                'amount_paid' => $this->invoice->total_amount,
                'transfer_date' => Carbon::today()->format('Y-m-d'),
                'proof_file' => $file,
            ]);

        $response->assertStatus(403);
    }
}
```

- [ ] **Step 2: Run test to verify failure**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/DoiInvoiceTest.php`
Expected: FAIL (Routes and controllers not registered yet).

- [ ] **Step 3: Implement `StorePaymentProofRequest.php`**

Create `app/Http/Requests/Doi/StorePaymentProofRequest.php`:
```php
<?php

namespace App\Http\Requests\Doi;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentProofRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
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

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'bank_name' => 'Nama Bank Pengirim',
            'account_number' => 'Nomor Rekening Pengirim',
            'account_name' => 'Nama Pemilik Rekening',
            'amount_paid' => 'Nominal yang Ditransfer',
            'transfer_date' => 'Tanggal Transfer',
            'notes' => 'Catatan Tambahan',
            'proof_file' => 'Berkas Bukti Transfer',
        ];
    }
}
```

- [ ] **Step 4: Register routes in `routes/web.php`**

In `routes/web.php`, add under Admin Kampus and User route groups for DOI Subscription:
```php
// Under Admin Kampus DOI Subscription group:
Route::get('invoices', [App\Http\Controllers\AdminKampus\DoiInvoiceController::class, 'index'])
    ->name('invoices.index');
Route::get('invoices/{invoice}', [App\Http\Controllers\AdminKampus\DoiInvoiceController::class, 'show'])
    ->name('invoices.show');
Route::post('invoices/{invoice}/payment-proof', [App\Http\Controllers\AdminKampus\DoiPaymentProofController::class, 'store'])
    ->name('payment-proofs.store');
Route::get('payment-proofs/{proof}/stream', [App\Http\Controllers\AdminKampus\DoiPaymentProofController::class, 'stream'])
    ->name('payment-proofs.stream');

// Under User DOI Subscription group:
Route::get('invoices', [App\Http\Controllers\User\DoiInvoiceController::class, 'index'])
    ->name('invoices.index');
Route::get('invoices/{invoice}', [App\Http\Controllers\User\DoiInvoiceController::class, 'show'])
    ->name('invoices.show');
Route::get('payment-proofs/{proof}/stream', [App\Http\Controllers\User\DoiPaymentProofController::class, 'stream'])
    ->name('payment-proofs.stream');
```

- [ ] **Step 5: Implement `AdminKampus\DoiInvoiceController`, `AdminKampus\DoiPaymentProofController`, `User\DoiInvoiceController`, and `User\DoiPaymentProofController`**

Create `app/Http/Controllers/AdminKampus/DoiInvoiceController.php`:
```php
<?php

namespace App\Http\Controllers\AdminKampus;

use App\Enums\Doi\InvoiceStatus;
use App\Http\Controllers\Controller;
use App\Models\DoiBankAccount;
use App\Models\DoiInvoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoiInvoiceController extends Controller
{
    /**
     * Display the invoices list for the current university.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('AdminKampus/Doi/Invoices/Index', $this->getInvoicesProps($request));
    }

    /**
     * Display single invoice detail JSON / drawer payload.
     */
    public function show(Request $request, DoiInvoice $invoice)
    {
        $this->authorize('view', $invoice);

        $invoice->load(['items', 'paymentProofs', 'subscription.package']);

        if ($request->wantsJson()) {
            return response()->json([
                'invoice' => $this->formatInvoice($invoice),
            ]);
        }

        return redirect()->route('admin-kampus.doi-subscription.invoices.index', [
            'invoice_id' => $invoice->id,
        ]);
    }

    /**
     * Prepare invoices props for Inertia rendering.
     *
     * @return array<string, mixed>
     */
    protected function getInvoicesProps(Request $request): array
    {
        $user = $request->user();
        $university = $user->university;

        $invoicesQuery = DoiInvoice::with(['items', 'paymentProofs', 'subscription.package'])
            ->where('university_id', $user->university_id)
            ->latest('id');

        $allInvoices = (clone $invoicesQuery)->get();

        $totalInvoicesCount = $allInvoices->count();
        $unpaidInvoices = $allInvoices->whereIn('status', [InvoiceStatus::UNPAID, InvoiceStatus::PENDING_VERIFICATION]);
        $unpaidInvoicesCount = $unpaidInvoices->count();
        $unpaidTotalAmount = (float) $unpaidInvoices->sum('total_amount');
        $paidTotalAmount = (float) $allInvoices->where('status', InvoiceStatus::PAID)->sum('total_amount');

        $bankAccounts = DoiBankAccount::active()->get()->map(fn ($bank) => [
            'id' => $bank->id,
            'bank_name' => $bank->bank_name,
            'bank_code' => $bank->bank_code,
            'account_number' => $bank->account_number,
            'account_name' => $bank->account_name,
            'branch' => $bank->branch,
            'instructions' => $bank->instructions,
        ]);

        $formattedInvoices = $allInvoices->map(fn ($invoice) => $this->formatInvoice($invoice));

        return [
            'invoices' => $formattedInvoices,
            'bankAccounts' => $bankAccounts,
            'stats' => [
                'totalInvoicesCount' => $totalInvoicesCount,
                'unpaidInvoicesCount' => $unpaidInvoicesCount,
                'unpaidTotalAmount' => $unpaidTotalAmount,
                'paidTotalAmount' => $paidTotalAmount,
            ],
            'universityName' => $university?->name ?? 'Institusi',
        ];
    }

    /**
     * Format DoiInvoice model into frontend data structure.
     */
    protected function formatInvoice(DoiInvoice $invoice): array
    {
        return [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'subscription_id' => $invoice->subscription_id,
            'subtotal' => (float) $invoice->subtotal,
            'discount' => (float) $invoice->discount,
            'tax' => (float) $invoice->tax,
            'total_amount' => (float) $invoice->total_amount,
            'status' => $invoice->status->value,
            'status_label' => $invoice->status->label(),
            'status_color' => $invoice->status->color(),
            'period_start' => $invoice->period_start?->format('d M Y'),
            'period_end' => $invoice->period_end?->format('d M Y'),
            'due_date' => $invoice->due_date?->format('d M Y') ?? '',
            'paid_at' => $invoice->paid_at?->format('d M Y, H:i'),
            'created_at' => $invoice->created_at?->format('d M Y, H:i') ?? '',
            'items' => $invoice->items->map(fn ($item) => [
                'id' => $item->id,
                'item_type' => $item->item_type->value,
                'item_type_label' => $item->item_type->label(),
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total_price' => (float) $item->total_price,
            ]),
            'latest_payment_proof' => $invoice->latestPaymentProof ? [
                'id' => $invoice->latestPaymentProof->id,
                'bank_name' => $invoice->latestPaymentProof->bank_name,
                'account_number' => $invoice->latestPaymentProof->account_number,
                'account_name' => $invoice->latestPaymentProof->account_name,
                'amount_paid' => (float) $invoice->latestPaymentProof->amount_paid,
                'transfer_date' => $invoice->latestPaymentProof->transfer_date?->format('d M Y'),
                'file_name' => $invoice->latestPaymentProof->file_name,
                'file_size' => $invoice->latestPaymentProof->file_size,
                'status' => $invoice->latestPaymentProof->status->value,
                'status_label' => $invoice->latestPaymentProof->status->label(),
                'admin_notes' => $invoice->latestPaymentProof->admin_notes,
                'created_at' => $invoice->latestPaymentProof->created_at?->format('d M Y, H:i'),
            ] : null,
            'payment_proofs' => $invoice->paymentProofs->map(fn ($proof) => [
                'id' => $proof->id,
                'bank_name' => $proof->bank_name,
                'account_number' => $proof->account_number,
                'account_name' => $proof->account_name,
                'amount_paid' => (float) $proof->amount_paid,
                'transfer_date' => $proof->transfer_date?->format('d M Y'),
                'file_name' => $proof->file_name,
                'file_size' => $proof->file_size,
                'status' => $proof->status->value,
                'status_label' => $proof->status->label(),
                'admin_notes' => $proof->admin_notes,
                'created_at' => $proof->created_at?->format('d M Y, H:i'),
            ]),
        ];
    }
}
```

Create `app/Http/Controllers/AdminKampus/DoiPaymentProofController.php`:
```php
<?php

namespace App\Http\Controllers\AdminKampus;

use App\Actions\Doi\StorePaymentProofAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Doi\StorePaymentProofRequest;
use App\Models\DoiInvoice;
use App\Models\DoiPaymentProof;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DoiPaymentProofController extends Controller
{
    /**
     * Store a newly uploaded payment proof for an unpaid invoice.
     */
    public function store(
        StorePaymentProofRequest $request,
        DoiInvoice $invoice,
        StorePaymentProofAction $action
    ): RedirectResponse {
        $this->authorize('uploadProof', $invoice);

        $action->execute(
            $invoice,
            $request->user(),
            $request->validated(),
            $request->file('proof_file')
        );

        return back()->with('success', 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi dari Super Admin Diktilitbang.');
    }

    /**
     * Stream payment proof file securely from private storage disk.
     */
    public function stream(DoiPaymentProof $proof)
    {
        $this->authorize('view', $proof);

        if (! Storage::disk('doi_proofs')->exists($proof->file_path)) {
            abort(404, 'Berkas bukti pembayaran tidak ditemukan.');
        }

        return Storage::disk('doi_proofs')->response($proof->file_path, $proof->file_name);
    }
}
```

Create `app/Http/Controllers/User/DoiInvoiceController.php`:
```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\AdminKampus\DoiInvoiceController as BaseController;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoiInvoiceController extends BaseController
{
    /**
     * Display the invoices list for Journal Managers.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('User/Doi/Invoices/Index', $this->getInvoicesProps($request));
    }
}
```

Create `app/Http/Controllers/User/DoiPaymentProofController.php`:
```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\AdminKampus\DoiPaymentProofController as BaseController;

class DoiPaymentProofController extends BaseController
{
    // Inherits store and stream actions with security policy checks
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/DoiInvoiceTest.php`
Expected: PASS (8 passed, assertions verified).

- [ ] **Step 7: Commit**

```bash
git add app/Http/Requests/Doi/StorePaymentProofRequest.php app/Http/Controllers/AdminKampus/DoiInvoiceController.php app/Http/Controllers/AdminKampus/DoiPaymentProofController.php app/Http/Controllers/User/DoiInvoiceController.php app/Http/Controllers/User/DoiPaymentProofController.php routes/web.php tests/Feature/Doi/DoiInvoiceTest.php
git commit -m "feat(doi): add invoice and payment proof controllers, form request validation, and routes"
```

---

### Task 2: Reusable Frontend Invoice & Payment Components

**Files:**
- Modify: `resources/js/types/doi.ts`
- Create: `resources/js/components/doi/invoices/DoiInvoiceStatsCard.tsx`
- Create: `resources/js/components/doi/invoices/DoiBankAccountsCard.tsx`
- Create: `resources/js/components/doi/invoices/DoiPaymentProofDropzone.tsx`
- Create: `resources/js/components/doi/invoices/DoiPaymentProofForm.tsx`
- Create: `resources/js/components/doi/invoices/DoiVerificationTimeline.tsx`
- Create: `resources/js/components/doi/invoices/DoiInvoiceDetailDrawer.tsx`
- Create: `resources/js/components/doi/invoices/DoiInvoiceTable.tsx`
- Create: `resources/js/components/doi/invoices/index.ts`

- [ ] **Step 1: Extend TypeScript definitions in `resources/js/types/doi.ts`**

Add `DoiInvoiceDetailData`, `DoiInvoicesPageProps`, `StorePaymentProofFormData`.

- [ ] **Step 2: Implement `DoiInvoiceStatsCard.tsx`**

3 Bento summary tiles (Total Invoices, Unpaid Invoices Amount, Paid Invoices Amount) dengan monospaced tabular numerals.

- [ ] **Step 3: Implement `DoiBankAccountsCard.tsx`**

Kartu informasi rekening bank resmi Diktilitbang PPM Muhammadiyah (BSI & Mandiri) dengan tombol *1-Click Copy* nomor rekening.

- [ ] **Step 4: Implement `DoiPaymentProofDropzone.tsx`**

Area drag-and-drop file upload dengan live thumbnail/PDF preview, validasi ekstensi/ukuran file (max 5MB), remove/replace triggers.

- [ ] **Step 5: Implement `DoiPaymentProofForm.tsx` & `DoiVerificationTimeline.tsx`**

Form input data pengirim (Bank, Rekening, Tanggal, Nominal, Catatan) + Linimasa status verifikasi / alert merah jika ada catatan penolakan admin.

- [ ] **Step 6: Implement `DoiInvoiceDetailDrawer.tsx` & `DoiInvoiceTable.tsx`**

Slide-over detail sheet & tabel data invoice lengkap dengan filter status, search, badges, dan trigger pembayaran.

- [ ] **Step 7: Commit**

```bash
git add resources/js/types/doi.ts resources/js/components/doi/invoices/
git commit -m "feat(doi): create reusable frontend invoice and payment proof components"
```

---

### Task 3: Invoices Pages & Navigation Integration

**Files:**
- Create: `resources/js/pages/AdminKampus/Doi/Invoices/Index.tsx`
- Create: `resources/js/pages/User/Doi/Invoices/Index.tsx`
- Modify: `resources/js/components/doi/DoiActiveInvoiceCard.tsx`

- [ ] **Step 1: Implement `AdminKampus/Doi/Invoices/Index.tsx`**

Halaman utama daftar tagihan Admin Kampus mengintegrasikan `AppLayout`, `DoiInvoiceStatsCard`, `DoiInvoiceTable`, `DoiInvoiceDetailDrawer`, dan auto-open drawer via URL query parameter (`?invoice_id=...`).

- [ ] **Step 2: Implement `User/Doi/Invoices/Index.tsx`**

Halaman monitoring tagihan Pengelola Jurnal.

- [ ] **Step 3: Connect Action Button in `DoiActiveInvoiceCard.tsx`**

Update tombol *"Bayar Sekarang"* / *"Lihat Tagihan"* di dashboard utama DOI agar langsung mengarahkan ke `route('admin-kampus.doi-subscription.invoices.index', { invoice_id: activeInvoice.id })`.

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/AdminKampus/Doi/Invoices/Index.tsx resources/js/pages/User/Doi/Invoices/Index.tsx resources/js/components/doi/DoiActiveInvoiceCard.tsx
git commit -m "feat(doi): implement invoices pages and connect dashboard payment triggers"
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
