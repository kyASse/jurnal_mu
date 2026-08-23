# DOI Subscription Module 1: Core Action, Service & Security Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun seluruh logika bisnis inti (*domain actions*), manajemen kuota similarity check (*quota service*), penyimpanan berkas bukti bayar privat/terenkripsi, dan isolasi otorisasi multi-tenant (*security policies*) untuk Modul Langganan DOI & Similarity Check.

**Architecture:** Domain Actions & Event-Driven Architecture (Approach 1). Setiap aksi bisnis dipisahkan ke dalam action class terisolasi (`GenerateInvoiceAction`, `StorePaymentProofAction`, `VerifyPaymentProofAction`), layanan kuota (`DoiQuotaManagerService`), serta otorisasi terpusat via Laravel Policies (`DoiSubscriptionPolicy`, `DoiInvoicePolicy`, `DoiPaymentProofPolicy`).

**Tech Stack:** PHP 8.2+, Laravel 12, MySQL 8.0, PHPUnit / Pest Testing Framework, Docker.

---

### Task 1: Storage Disk Configuration & Domain Events

**Files:**
- Modify: `config/filesystems.php`
- Create: `app/Events/Doi/PaymentProofUploaded.php`
- Create: `app/Events/Doi/SubscriptionActivated.php`
- Create: `app/Events/Doi/PaymentProofRejected.php`
- Test: `tests/Unit/Doi/DoiEventsTest.php`

- [ ] **Step 1: Write Unit Test for Domain Events**

Create `tests/Unit/Doi/DoiEventsTest.php`:
```php
<?php

namespace Tests\Unit\Doi;

use App\Events\Doi\PaymentProofRejected;
use App\Events\Doi\PaymentProofUploaded;
use App\Events\Doi\SubscriptionActivated;
use App\Models\DoiPaymentProof;
use App\Models\DoiSubscription;
use PHPUnit\Framework\TestCase;

class DoiEventsTest extends TestCase
{
    public function test_payment_proof_uploaded_event_holds_proof_instance(): void
    {
        $proof = new DoiPaymentProof(['id' => 1]);
        $event = new PaymentProofUploaded($proof);

        $this->assertSame($proof, $event->paymentProof);
    }

    public function test_subscription_activated_event_holds_subscription_and_proof(): void
    {
        $subscription = new DoiSubscription(['id' => 10]);
        $proof = new DoiPaymentProof(['id' => 1]);
        $event = new SubscriptionActivated($subscription, $proof);

        $this->assertSame($subscription, $event->subscription);
        $this->assertSame($proof, $event->paymentProof);
    }

    public function test_payment_proof_rejected_event_holds_proof_instance(): void
    {
        $proof = new DoiPaymentProof(['id' => 1]);
        $event = new PaymentProofRejected($proof);

        $this->assertSame($proof, $event->paymentProof);
    }
}
```

- [ ] **Step 2: Run test to verify failure**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Unit/Doi/DoiEventsTest.php`  
Expected: FAIL (Class App\Events\Doi\... not found)

- [ ] **Step 3: Implement Disk & Event Classes**

Modify `config/filesystems.php`:
Add `'doi_proofs'` disk to `'disks'`:
```php
        'doi_proofs' => [
            'driver' => 'local',
            'root' => storage_path('app/private/doi_proofs'),
            'visibility' => 'private',
            'throw' => false,
            'report' => false,
        ],
```

Create `app/Events/Doi/PaymentProofUploaded.php`:
```php
<?php

namespace App\Events\Doi;

use App\Models\DoiPaymentProof;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentProofUploaded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public DoiPaymentProof $paymentProof
    ) {}
}
```

Create `app/Events/Doi/SubscriptionActivated.php`:
```php
<?php

namespace App\Events\Doi;

use App\Models\DoiPaymentProof;
use App\Models\DoiSubscription;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SubscriptionActivated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public DoiSubscription $subscription,
        public ?DoiPaymentProof $paymentProof = null
    ) {}
}
```

Create `app/Events/Doi/PaymentProofRejected.php`:
```php
<?php

namespace App\Events\Doi;

use App\Models\DoiPaymentProof;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentProofRejected
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public DoiPaymentProof $paymentProof
    ) {}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Unit/Doi/DoiEventsTest.php`  
Expected: PASS (3 tests, 4 assertions)

- [ ] **Step 5: Commit**

```bash
git add config/filesystems.php app/Events/Doi/ tests/Unit/Doi/DoiEventsTest.php
git commit -m "feat(doi): configure private storage disk and domain events"
```

---

### Task 2: Implement Domain Actions (`GenerateInvoiceAction`, `StorePaymentProofAction`, `VerifyPaymentProofAction`)

**Files:**
- Create: `app/Actions/Doi/GenerateInvoiceAction.php`
- Create: `app/Actions/Doi/StorePaymentProofAction.php`
- Create: `app/Actions/Doi/VerifyPaymentProofAction.php`
- Test: `tests/Unit/Doi/DoiActionsTest.php`

- [ ] **Step 1: Write Unit Test for Domain Actions**

Create `tests/Unit/Doi/DoiActionsTest.php`:
```php
<?php

namespace Tests\Unit\Doi;

use App\Actions\Doi\GenerateInvoiceAction;
use App\Actions\Doi\StorePaymentProofAction;
use App\Actions\Doi\VerifyPaymentProofAction;
use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\SubscriptionStatus;
use App\Events\Doi\PaymentProofRejected;
use App\Events\Doi\PaymentProofUploaded;
use App\Events\Doi\SubscriptionActivated;
use App\Models\DoiBankAccount;
use App\Models\DoiPackage;
use App\Models\DoiPaymentProof;
use App\Models\DoiSubscription;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DoiActionsTest extends TestCase
{
    use DatabaseTransactions;

    protected University $university;
    protected User $user;
    protected User $adminUser;
    protected DoiPackage $package;
    protected DoiSubscription $subscription;
    protected DoiBankAccount $bankAccount;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();

        Storage::fake('doi_proofs');
        Event::fake([PaymentProofUploaded::class, SubscriptionActivated::class, PaymentProofRejected::class]);

        $this->university = University::factory()->create(['name' => 'Universitas Muhammadiyah Actions Test']);
        $this->user = User::factory()->user()->create(['university_id' => $this->university->id]);
        $this->adminUser = User::factory()->superAdmin()->create();

        $field = ScientificField::factory()->create(['name' => 'Sains Komputer']);
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $field->id,
        ]);

        $this->package = DoiPackage::create([
            'name' => 'Paket Riset Standard',
            'slug' => 'paket-riset-standard',
            'code' => 'DOI-RST-STD',
            'price_annual' => 6000000.00,
            'prefix_included' => true,
            'similarity_quota_included' => 250,
            'is_active' => true,
        ]);

        $this->subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $journal->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::INACTIVE,
            'similarity_quota_total' => 0,
            'similarity_quota_used' => 0,
        ]);

        $this->bankAccount = DoiBankAccount::create([
            'bank_name' => 'BSI',
            'bank_code' => 'BSI',
            'account_number' => '7123-9999-00',
            'account_holder' => 'Majelis Diktilitbang',
            'is_active' => true,
        ]);
    }

    public function test_generate_invoice_action_creates_sequential_invoice(): void
    {
        $action = new GenerateInvoiceAction();
        $invoice = $action->execute($this->subscription, $this->user);

        $currentMonth = Carbon::now()->format('Ym');
        $this->assertStringStartsWith("INV/DOI/{$currentMonth}/", $invoice->invoice_number);
        $this->assertEquals(InvoiceStatus::UNPAID, $invoice->status);
        $this->assertEquals(6000000.00, (float) $invoice->total_amount);
        $this->assertCount(1, $invoice->items);
        $this->assertEquals(6000000.00, (float) $invoice->items->first()->total_price);

        // Generate second invoice in same month
        $invoice2 = $action->execute($this->subscription, $this->user);
        $this->assertNotEquals($invoice->invoice_number, $invoice2->invoice_number);
    }

    public function test_store_payment_proof_action_saves_file_and_updates_status(): void
    {
        $generateAction = new GenerateInvoiceAction();
        $invoice = $generateAction->execute($this->subscription, $this->user);

        $file = UploadedFile::fake()->create('transfer_receipt.jpg', 500, 'image/jpeg');

        $storeAction = new StorePaymentProofAction();
        $proof = $storeAction->execute($invoice, $this->user, $file, [
            'bank_sender' => 'Bank Mandiri',
            'account_name' => 'Bendahara Kampus',
            'bank_destination_id' => $this->bankAccount->id,
            'transfer_amount' => 6000000.00,
            'transfer_date' => Carbon::now()->toDateString(),
        ]);

        $this->assertInstanceOf(DoiPaymentProof::class, $proof);
        $this->assertEquals(PaymentProofStatus::PENDING, $proof->status);
        $this->assertEquals(InvoiceStatus::PENDING_VERIFICATION, $invoice->fresh()->status);
        $this->assertEquals(SubscriptionStatus::PENDING_VERIFICATION, $this->subscription->fresh()->status);

        Storage::disk('doi_proofs')->assertExists($proof->file_path);
        Event::assertDispatched(PaymentProofUploaded::class);
    }

    public function test_verify_payment_proof_action_approves_and_activates_subscription(): void
    {
        $generateAction = new GenerateInvoiceAction();
        $invoice = $generateAction->execute($this->subscription, $this->user);

        $file = UploadedFile::fake()->create('receipt.pdf', 300, 'application/pdf');
        $storeAction = new StorePaymentProofAction();
        $proof = $storeAction->execute($invoice, $this->user, $file, [
            'bank_sender' => 'BSI',
            'account_name' => 'Bendahara Kampus',
            'bank_destination_id' => $this->bankAccount->id,
            'transfer_amount' => 6000000.00,
            'transfer_date' => Carbon::now()->toDateString(),
        ]);

        $verifyAction = new VerifyPaymentProofAction();
        $result = $verifyAction->execute($proof, $this->adminUser, PaymentProofStatus::APPROVED, 'Pembayaran valid');

        $this->assertEquals(PaymentProofStatus::APPROVED, $proof->fresh()->status);
        $this->assertEquals(InvoiceStatus::PAID, $invoice->fresh()->status);
        $this->assertNotNull($invoice->fresh()->paid_at);

        $freshSub = $this->subscription->fresh();
        $this->assertEquals(SubscriptionStatus::ACTIVE, $freshSub->status);
        $this->assertNotNull($freshSub->start_date);
        $this->assertNotNull($freshSub->end_date);
        $this->assertEquals(250, $freshSub->similarity_quota_total);

        Event::assertDispatched(SubscriptionActivated::class);
    }

    public function test_verify_payment_proof_action_rejects_and_reverts_invoice(): void
    {
        $generateAction = new GenerateInvoiceAction();
        $invoice = $generateAction->execute($this->subscription, $this->user);

        $file = UploadedFile::fake()->create('receipt.jpg', 300, 'image/jpeg');
        $storeAction = new StorePaymentProofAction();
        $proof = $storeAction->execute($invoice, $this->user, $file, [
            'bank_sender' => 'BSI',
            'account_name' => 'Bendahara Kampus',
            'bank_destination_id' => $this->bankAccount->id,
            'transfer_amount' => 6000000.00,
            'transfer_date' => Carbon::now()->toDateString(),
        ]);

        $verifyAction = new VerifyPaymentProofAction();
        $verifyAction->execute($proof, $this->adminUser, PaymentProofStatus::REJECTED, 'Nominal tidak sesuai rekening koran');

        $this->assertEquals(PaymentProofStatus::REJECTED, $proof->fresh()->status);
        $this->assertEquals('Nominal tidak sesuai rekening koran', $proof->fresh()->admin_notes);
        $this->assertEquals(InvoiceStatus::UNPAID, $invoice->fresh()->status);

        Event::assertDispatched(PaymentProofRejected::class);
    }
}
```

- [ ] **Step 2: Run test to verify failure**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Unit/Doi/DoiActionsTest.php`  
Expected: FAIL (Classes GenerateInvoiceAction, StorePaymentProofAction, VerifyPaymentProofAction not found)

- [ ] **Step 3: Implement Actions**

Create `app/Actions/Doi/GenerateInvoiceAction.php`:
```php
<?php

namespace App\Actions\Doi;

use App\Enums\Doi\InvoiceItemType;
use App\Enums\Doi\InvoiceStatus;
use App\Models\DoiInvoice;
use App\Models\DoiInvoiceItem;
use App\Models\DoiSubscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GenerateInvoiceAction
{
    public function execute(
        DoiSubscription $subscription,
        User $user,
        ?Carbon $periodStart = null,
        ?Carbon $periodEnd = null,
        int $dueDateDays = 14
    ): DoiInvoice {
        return DB::transaction(function () use ($subscription, $user, $periodStart, $periodEnd, $dueDateDays) {
            $periodStart = $periodStart ?? Carbon::now();
            $periodEnd = $periodEnd ?? (clone $periodStart)->addYear();
            $dueDate = Carbon::now()->addDays($dueDateDays);

            $package = $subscription->package;
            $subtotal = (float) ($package?->price_annual ?? 0);
            $discount = 0.00;
            $tax = 0.00;
            $totalAmount = $subtotal - $discount + $tax;

            // Generate atomic sequential invoice number
            $currentMonth = Carbon::now()->format('Ym');
            $prefix = "INV/DOI/{$currentMonth}/";

            $lastInvoice = DoiInvoice::where('invoice_number', 'LIKE', "{$prefix}%")
                ->lockForUpdate()
                ->orderByDesc('invoice_number')
                ->first();

            if (! $lastInvoice) {
                $nextSequence = 1;
            } else {
                $lastSeqNumber = (int) substr($lastInvoice->invoice_number, -4);
                $nextSequence = $lastSeqNumber + 1;
            }

            $invoiceNumber = $prefix . str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);

            $invoice = DoiInvoice::create([
                'invoice_number' => $invoiceNumber,
                'subscription_id' => $subscription->id,
                'university_id' => $subscription->university_id,
                'user_id' => $user->id,
                'period_start' => $periodStart->toDateString(),
                'period_end' => $periodEnd->toDateString(),
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total_amount' => $totalAmount,
                'due_date' => $dueDate->toDateString(),
                'status' => InvoiceStatus::UNPAID,
            ]);

            DoiInvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => "Biaya Langganan Tahunan - " . ($package?->name ?? 'Paket DOI'),
                'item_type' => InvoiceItemType::ANNUAL_FEE,
                'unit_price' => $subtotal,
                'quantity' => 1,
                'total_price' => $subtotal,
            ]);

            return $invoice->load(['items', 'subscription', 'university']);
        });
    }
}
```

Create `app/Actions/Doi/StorePaymentProofAction.php`:
```php
<?php

namespace App\Actions\Doi;

use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\SubscriptionStatus;
use App\Events\Doi\PaymentProofUploaded;
use App\Models\DoiInvoice;
use App\Models\DoiPaymentProof;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StorePaymentProofAction
{
    public function execute(
        DoiInvoice $invoice,
        User $user,
        UploadedFile $file,
        array $data
    ): DoiPaymentProof {
        // Validate MIME type & file extension
        $allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
        $mimeType = $file->getMimeType();

        if (! in_array($mimeType, $allowedMimes, true)) {
            throw ValidationException::withMessages([
                'file' => ['Format berkas tidak didukung. Harap unggah berkas JPG, PNG, atau PDF.'],
            ]);
        }

        if ($file->getSize() > 5120 * 1024) {
            throw ValidationException::withMessages([
                'file' => ['Ukuran berkas melebihi batas maksimal 5MB.'],
            ]);
        }

        return DB::transaction(function () use ($invoice, $user, $file, $data, $mimeType) {
            $year = Carbon::now()->format('Y');
            $month = Carbon::now()->format('m');
            $extension = $file->getClientOriginalExtension();
            $safeName = Str::random(40) . '.' . $extension;
            $directory = "{$year}/{$month}";
            $path = $file->storeAs($directory, $safeName, 'doi_proofs');

            $paymentProof = DoiPaymentProof::create([
                'invoice_id' => $invoice->id,
                'user_id' => $user->id,
                'bank_sender' => $data['bank_sender'],
                'account_name' => $data['account_name'],
                'bank_destination_id' => $data['bank_destination_id'],
                'transfer_amount' => $data['transfer_amount'],
                'transfer_date' => $data['transfer_date'],
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $mimeType,
                'status' => PaymentProofStatus::PENDING,
            ]);

            $invoice->update([
                'status' => InvoiceStatus::PENDING_VERIFICATION,
            ]);

            if ($invoice->subscription) {
                $invoice->subscription->update([
                    'status' => SubscriptionStatus::PENDING_VERIFICATION,
                ]);
            }

            event(new PaymentProofUploaded($paymentProof));

            return $paymentProof;
        });
    }
}
```

Create `app/Actions/Doi/VerifyPaymentProofAction.php`:
```php
<?php

namespace App\Actions\Doi;

use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\QuotaChangeType;
use App\Enums\Doi\SubscriptionStatus;
use App\Events\Doi\PaymentProofRejected;
use App\Events\Doi\SubscriptionActivated;
use App\Models\DoiPaymentProof;
use App\Models\DoiSimilarityQuotaLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VerifyPaymentProofAction
{
    public function execute(
        DoiPaymentProof $proof,
        User $adminUser,
        PaymentProofStatus $decision,
        ?string $adminNotes = null
    ): array {
        return DB::transaction(function () use ($proof, $adminUser, $decision, $adminNotes) {
            $invoice = $proof->invoice()->lockForUpdate()->firstOrFail();
            $subscription = $invoice->subscription()->lockForUpdate()->firstOrFail();

            if ($decision === PaymentProofStatus::APPROVED) {
                $proof->update([
                    'status' => PaymentProofStatus::APPROVED,
                    'verified_by' => $adminUser->id,
                    'verified_at' => Carbon::now(),
                    'admin_notes' => $adminNotes,
                ]);

                $invoice->update([
                    'status' => InvoiceStatus::PAID,
                    'paid_at' => Carbon::now(),
                ]);

                // Calculate subscription active dates
                $now = Carbon::now();
                $package = $subscription->package;

                if ($subscription->status === SubscriptionStatus::ACTIVE && $subscription->end_date && $subscription->end_date->isFuture()) {
                    $startDate = $subscription->start_date;
                    $endDate = (clone $subscription->end_date)->addYear();
                } else {
                    $startDate = $now->toDateString();
                    $endDate = (clone $now)->addYear()->toDateString();
                }

                $newQuotaIncluded = $package?->similarity_quota_included ?? 0;
                $newTotalQuota = $subscription->similarity_quota_total + $newQuotaIncluded;

                $subscription->update([
                    'status' => SubscriptionStatus::ACTIVE,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'similarity_quota_total' => $newTotalQuota,
                ]);

                // Record quota allocation log
                if ($newQuotaIncluded > 0) {
                    DoiSimilarityQuotaLog::create([
                        'subscription_id' => $subscription->id,
                        'journal_id' => $subscription->journal_id,
                        'user_id' => $adminUser->id,
                        'change_type' => QuotaChangeType::RENEWAL,
                        'amount' => $newQuotaIncluded,
                        'balance_after' => $newTotalQuota - $subscription->similarity_quota_used,
                        'description' => "Aktivasi langganan & alokasi kuota paket " . ($package?->name ?? ''),
                    ]);
                }

                event(new SubscriptionActivated($subscription, $proof));
            } elseif ($decision === PaymentProofStatus::REJECTED) {
                if (empty($adminNotes)) {
                    throw ValidationException::withMessages([
                        'admin_notes' => ['Catatan alasan penolakan wajib diisi.'],
                    ]);
                }

                $proof->update([
                    'status' => PaymentProofStatus::REJECTED,
                    'verified_by' => $adminUser->id,
                    'verified_at' => Carbon::now(),
                    'admin_notes' => $adminNotes,
                ]);

                $invoice->update([
                    'status' => InvoiceStatus::UNPAID,
                ]);

                if ($subscription->status === SubscriptionStatus::PENDING_VERIFICATION) {
                    $subscription->update([
                        'status' => SubscriptionStatus::INACTIVE,
                    ]);
                }

                event(new PaymentProofRejected($proof));
            }

            return [
                'proof' => $proof->fresh(),
                'invoice' => $invoice->fresh(),
                'subscription' => $subscription->fresh(),
            ];
        });
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Unit/Doi/DoiActionsTest.php`  
Expected: PASS (4 tests, 26 assertions)

- [ ] **Step 5: Commit**

```bash
git add app/Actions/Doi/ tests/Unit/Doi/DoiActionsTest.php
git commit -m "feat(doi): implement domain actions for invoice generation, proof storage, and verification"
```

---

### Task 3: Implement Quota Manager Service (`DoiQuotaManagerService`)

**Files:**
- Create: `app/Services/Doi/DoiQuotaManagerService.php`
- Test: `tests/Unit/Doi/DoiQuotaManagerServiceTest.php`

- [ ] **Step 1: Write Unit Test for Quota Manager**

Create `tests/Unit/Doi/DoiQuotaManagerServiceTest.php`:
```php
<?php

namespace Tests\Unit\Doi;

use App\Enums\Doi\QuotaChangeType;
use App\Enums\Doi\SubscriptionStatus;
use App\Models\DoiPackage;
use App\Models\DoiSubscription;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use App\Services\Doi\DoiQuotaManagerService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use InvalidArgumentException;
use Tests\TestCase;

class DoiQuotaManagerServiceTest extends TestCase
{
    use DatabaseTransactions;

    protected University $university;
    protected User $user;
    protected User $adminUser;
    protected Journal $journal;
    protected DoiSubscription $subscription;
    protected DoiQuotaManagerService $quotaService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();

        $this->university = University::factory()->create(['name' => 'Universitas Muhammadiyah Quota Test']);
        $this->user = User::factory()->user()->create(['university_id' => $this->university->id]);
        $this->adminUser = User::factory()->superAdmin()->create();

        $field = ScientificField::factory()->create(['name' => 'Teknik Elektro']);
        $this->journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $field->id,
        ]);

        $package = DoiPackage::create([
            'name' => 'Paket Premium Quota',
            'slug' => 'paket-premium-quota',
            'code' => 'PKG-PRM-QTA',
            'price_annual' => 10000000,
            'similarity_quota_included' => 500,
            'is_active' => true,
        ]);

        $this->subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'start_date' => Carbon::now()->subMonths(2)->toDateString(),
            'end_date' => Carbon::now()->addMonths(10)->toDateString(),
            'similarity_quota_total' => 100,
            'similarity_quota_used' => 20,
        ]);

        $this->quotaService = new DoiQuotaManagerService();
    }

    public function test_has_remaining_quota_evaluates_correctly(): void
    {
        $this->assertTrue($this->quotaService->hasRemainingQuota($this->subscription, 80));
        $this->assertFalse($this->quotaService->hasRemainingQuota($this->subscription, 81));
    }

    public function test_deduct_quota_records_log_and_updates_used_balance(): void
    {
        $log = $this->quotaService->deductQuota(
            $this->subscription,
            5,
            $this->journal,
            $this->user,
            'Similarity test article #44'
        );

        $freshSub = $this->subscription->fresh();
        $this->assertEquals(25, $freshSub->similarity_quota_used);
        $this->assertEquals(75, $freshSub->remaining_quota);

        $this->assertEquals(QuotaChangeType::USAGE, $log->change_type);
        $this->assertEquals(-5, $log->amount);
        $this->assertEquals(75, $log->balance_after);
    }

    public function test_deduct_quota_fails_when_exceeding_limit(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->quotaService->deductQuota(
            $this->subscription,
            85,
            $this->journal,
            $this->user,
            'Attempt over quota'
        );
    }

    public function test_add_quota_updates_total_and_logs_adjustment(): void
    {
        $log = $this->quotaService->addQuota(
            $this->subscription,
            50,
            $this->adminUser,
            'Bonus kuota riset tahunan'
        );

        $freshSub = $this->subscription->fresh();
        $this->assertEquals(150, $freshSub->similarity_quota_total);
        $this->assertEquals(130, $freshSub->remaining_quota);

        $this->assertEquals(QuotaChangeType::ADJUSTMENT, $log->change_type);
        $this->assertEquals(50, $log->amount);
        $this->assertEquals(130, $log->balance_after);
    }
}
```

- [ ] **Step 2: Run test to verify failure**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Unit/Doi/DoiQuotaManagerServiceTest.php`  
Expected: FAIL (Class DoiQuotaManagerService not found)

- [ ] **Step 3: Implement DoiQuotaManagerService**

Create `app/Services/Doi/DoiQuotaManagerService.php`:
```php
<?php

namespace App\Services\Doi;

use App\Enums\Doi\QuotaChangeType;
use App\Enums\Doi\SubscriptionStatus;
use App\Models\DoiSimilarityQuotaLog;
use App\Models\DoiSubscription;
use App\Models\Journal;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class DoiQuotaManagerService
{
    public function hasRemainingQuota(DoiSubscription $subscription, int $required = 1): bool
    {
        return $subscription->remaining_quota >= $required;
    }

    public function deductQuota(
        DoiSubscription $subscription,
        int $amount,
        ?Journal $journal,
        ?User $user,
        string $description
    ): DoiSimilarityQuotaLog {
        if ($amount <= 0) {
            throw new InvalidArgumentException('Jumlah kuota yang dipotong harus lebih dari 0.');
        }

        return DB::transaction(function () use ($subscription, $amount, $journal, $user, $description) {
            /** @var DoiSubscription $lockedSub */
            $lockedSub = DoiSubscription::where('id', $subscription->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedSub->status !== SubscriptionStatus::ACTIVE) {
                throw new InvalidArgumentException('Langganan DOI tidak dalam status aktif.');
            }

            if ($lockedSub->remaining_quota < $amount) {
                throw new InvalidArgumentException("Sisa kuota similarity check ({$lockedSub->remaining_quota}) tidak mencukupi untuk pemotongan {$amount}.");
            }

            $lockedSub->increment('similarity_quota_used', $amount);
            $newBalance = $lockedSub->similarity_quota_total - $lockedSub->similarity_quota_used;

            return DoiSimilarityQuotaLog::create([
                'subscription_id' => $lockedSub->id,
                'journal_id' => $journal?->id ?? $lockedSub->journal_id,
                'user_id' => $user?->id,
                'change_type' => QuotaChangeType::USAGE,
                'amount' => -$amount,
                'balance_after' => $newBalance,
                'description' => $description,
            ]);
        });
    }

    public function addQuota(
        DoiSubscription $subscription,
        int $amount,
        ?User $adminUser,
        string $description,
        QuotaChangeType $type = QuotaChangeType::ADJUSTMENT
    ): DoiSimilarityQuotaLog {
        if ($amount <= 0) {
            throw new InvalidArgumentException('Jumlah kuota yang ditambahkan harus lebih dari 0.');
        }

        return DB::transaction(function () use ($subscription, $amount, $adminUser, $description, $type) {
            /** @var DoiSubscription $lockedSub */
            $lockedSub = DoiSubscription::where('id', $subscription->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedSub->increment('similarity_quota_total', $amount);
            $newBalance = $lockedSub->similarity_quota_total - $lockedSub->similarity_quota_used;

            return DoiSimilarityQuotaLog::create([
                'subscription_id' => $lockedSub->id,
                'journal_id' => $lockedSub->journal_id,
                'user_id' => $adminUser?->id,
                'change_type' => $type,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'description' => $description,
            ]);
        });
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Unit/Doi/DoiQuotaManagerServiceTest.php`  
Expected: PASS (4 tests, 12 assertions)

- [ ] **Step 5: Commit**

```bash
git add app/Services/Doi/ tests/Unit/Doi/DoiQuotaManagerServiceTest.php
git commit -m "feat(doi): implement centralized similarity quota manager service"
```

---

### Task 4: Implement Authorization Policies (`DoiSubscriptionPolicy`, `DoiInvoicePolicy`, `DoiPaymentProofPolicy`)

**Files:**
- Create: `app/Policies/DoiSubscriptionPolicy.php`
- Create: `app/Policies/DoiInvoicePolicy.php`
- Create: `app/Policies/DoiPaymentProofPolicy.php`
- Test: `tests/Feature/Doi/DoiSecurityPolicyTest.php`

- [ ] **Step 1: Write Feature Test for Security Policies**

Create `tests/Feature/Doi/DoiSecurityPolicyTest.php`:
```php
<?php

namespace Tests\Feature\Doi;

use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\SubscriptionStatus;
use App\Models\DoiBankAccount;
use App\Models\DoiInvoice;
use App\Models\DoiPackage;
use App\Models\DoiPaymentProof;
use App\Models\DoiSubscription;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class DoiSecurityPolicyTest extends TestCase
{
    use DatabaseTransactions;

    protected University $universityA;
    protected University $universityB;
    protected User $superAdmin;
    protected User $adminKampusA;
    protected User $adminKampusB;
    protected User $userJournalA;
    protected DoiSubscription $subscriptionA;
    protected DoiInvoice $invoiceA;
    protected DoiPaymentProof $proofA;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();

        $this->universityA = University::factory()->create(['name' => 'Universitas Muhammadiyah A']);
        $this->universityB = University::factory()->create(['name' => 'Universitas Muhammadiyah B']);

        $this->superAdmin = User::factory()->superAdmin()->create();
        $this->adminKampusA = User::factory()->adminKampus()->create(['university_id' => $this->universityA->id]);
        $this->adminKampusB = User::factory()->adminKampus()->create(['university_id' => $this->universityB->id]);
        $this->userJournalA = User::factory()->user()->create(['university_id' => $this->universityA->id]);

        $field = ScientificField::factory()->create();
        $journalA = Journal::factory()->create([
            'user_id' => $this->userJournalA->id,
            'university_id' => $this->universityA->id,
            'scientific_field_id' => $field->id,
        ]);

        $package = DoiPackage::create([
            'name' => 'Paket Policy',
            'slug' => 'paket-policy',
            'code' => 'PKG-PLC',
            'price_annual' => 3500000,
        ]);

        $this->subscriptionA = DoiSubscription::create([
            'university_id' => $this->universityA->id,
            'journal_id' => $journalA->id,
            'doi_package_id' => $package->id,
            'status' => SubscriptionStatus::ACTIVE,
        ]);

        $this->invoiceA = DoiInvoice::create([
            'invoice_number' => 'INV/DOI/202608/9001',
            'subscription_id' => $this->subscriptionA->id,
            'university_id' => $this->universityA->id,
            'user_id' => $this->userJournalA->id,
            'total_amount' => 3500000,
            'due_date' => now()->addDays(14),
            'status' => InvoiceStatus::UNPAID,
        ]);

        $bank = DoiBankAccount::create([
            'bank_name' => 'BSI',
            'bank_code' => 'BSI',
            'account_number' => '7123-1111-22',
            'account_holder' => 'Majelis Diktilitbang',
            'is_active' => true,
        ]);

        $this->proofA = DoiPaymentProof::create([
            'invoice_id' => $this->invoiceA->id,
            'user_id' => $this->userJournalA->id,
            'bank_sender' => 'Bank Mandiri',
            'account_name' => 'Pengelola Jurnal A',
            'bank_destination_id' => $bank->id,
            'transfer_amount' => 3500000,
            'transfer_date' => now()->toDateString(),
            'file_path' => 'doi_proofs/sample.jpg',
            'file_name' => 'sample.jpg',
            'file_size' => 1024,
            'mime_type' => 'image/jpeg',
            'status' => PaymentProofStatus::PENDING,
        ]);
    }

    public function test_subscription_policy_enforces_tenant_isolation(): void
    {
        $this->assertTrue(Gate::forUser($this->superAdmin)->allows('view', $this->subscriptionA));
        $this->assertTrue(Gate::forUser($this->adminKampusA)->allows('view', $this->subscriptionA));
        $this->assertTrue(Gate::forUser($this->userJournalA)->allows('view', $this->subscriptionA));
        $this->assertFalse(Gate::forUser($this->adminKampusB)->allows('view', $this->subscriptionA));
    }

    public function test_invoice_policy_enforces_tenant_isolation(): void
    {
        $this->assertTrue(Gate::forUser($this->superAdmin)->allows('view', $this->invoiceA));
        $this->assertTrue(Gate::forUser($this->adminKampusA)->allows('view', $this->invoiceA));
        $this->assertTrue(Gate::forUser($this->userJournalA)->allows('view', $this->invoiceA));
        $this->assertFalse(Gate::forUser($this->adminKampusB)->allows('view', $this->invoiceA));
    }

    public function test_payment_proof_policy_restricts_verification_to_super_admin(): void
    {
        $this->assertTrue(Gate::forUser($this->superAdmin)->allows('verify', $this->proofA));
        $this->assertFalse(Gate::forUser($this->adminKampusA)->allows('verify', $this->proofA));
        $this->assertFalse(Gate::forUser($this->userJournalA)->allows('verify', $this->proofA));
        $this->assertFalse(Gate::forUser($this->adminKampusB)->allows('verify', $this->proofA));
    }
}
```

- [ ] **Step 2: Run test to verify failure**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/DoiSecurityPolicyTest.php`  
Expected: FAIL (Policies not found or Gates returning false)

- [ ] **Step 3: Implement Policies**

Create `app/Policies/DoiSubscriptionPolicy.php`:
```php
<?php

namespace App\Policies;

use App\Models\DoiSubscription;
use App\Models\User;

class DoiSubscriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, DoiSubscription $subscription): bool
    {
        if (! $user->is_active) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminKampus()) {
            return $user->university_id === $subscription->university_id;
        }

        if ($user->isUser() || $user->isPengelolaJurnal()) {
            if ($subscription->journal_id && $subscription->journal && $subscription->journal->user_id === $user->id) {
                return true;
            }

            return $user->university_id === $subscription->university_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->is_active && ($user->isSuperAdmin() || $user->isAdminKampus() || $user->isPengelolaJurnal());
    }

    public function renew(User $user, DoiSubscription $subscription): bool
    {
        return $this->view($user, $subscription);
    }
}
```

Create `app/Policies/DoiInvoicePolicy.php`:
```php
<?php

namespace App\Policies;

use App\Models\DoiInvoice;
use App\Models\User;

class DoiInvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, DoiInvoice $invoice): bool
    {
        if (! $user->is_active) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminKampus()) {
            return $user->university_id === $invoice->university_id;
        }

        if ($user->isUser() || $user->isPengelolaJurnal()) {
            return $user->id === $invoice->user_id || $user->university_id === $invoice->university_id;
        }

        return false;
    }

    public function uploadProof(User $user, DoiInvoice $invoice): bool
    {
        return $this->view($user, $invoice);
    }
}
```

Create `app/Policies/DoiPaymentProofPolicy.php`:
```php
<?php

namespace App\Policies;

use App\Models\DoiPaymentProof;
use App\Models\User;

class DoiPaymentProofPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, DoiPaymentProof $proof): bool
    {
        if (! $user->is_active) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminKampus()) {
            return $user->university_id === $proof->invoice?->university_id;
        }

        if ($user->isUser() || $user->isPengelolaJurnal()) {
            return $user->id === $proof->user_id || $user->university_id === $proof->invoice?->university_id;
        }

        return false;
    }

    public function verify(User $user, DoiPaymentProof $proof): bool
    {
        return $user->is_active && $user->isSuperAdmin();
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/DoiSecurityPolicyTest.php`  
Expected: PASS (3 tests, 11 assertions)

- [ ] **Step 5: Commit**

```bash
git add app/Policies/Doi* tests/Feature/Doi/DoiSecurityPolicyTest.php
git commit -m "feat(doi): implement multi-tenant security policies for subscriptions, invoices, and proofs"
```

---

### Task 5: End-to-End Module 1 Full Test Suite Verification

**Files:**
- Test: All tests in `tests/Unit/Doi` and `tests/Feature/Doi`

- [ ] **Step 1: Run complete test suite**

Run: `docker exec -i jurnal-mu-app php artisan test --filter=Doi`  
Expected: All tests PASS (22+ tests, 150+ assertions).

- [ ] **Step 2: Check git status & log**

Run: `git status`  
Run: `git log -n 5 --oneline`
