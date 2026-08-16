<?php

namespace Tests\Unit\Doi;

use App\Actions\Doi\GenerateInvoiceAction;
use App\Actions\Doi\StorePaymentProofAction;
use App\Actions\Doi\VerifyPaymentProofAction;
use App\Enums\Doi\InvoiceItemType;
use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\QuotaChangeType;
use App\Enums\Doi\SubscriptionStatus;
use App\Events\Doi\PaymentProofRejected;
use App\Events\Doi\PaymentProofUploaded;
use App\Events\Doi\SubscriptionActivated;
use App\Models\DoiBankAccount;
use App\Models\DoiInvoice;
use App\Models\DoiPackage;
use App\Models\DoiPaymentProof;
use App\Models\DoiSimilarityQuotaLog;
use App\Models\DoiSubscription;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Database\Seeders\DoiBankAccountSeeder;
use Database\Seeders\DoiPackageSeeder;
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
    protected ScientificField $scientificField;
    protected Journal $journal;
    protected DoiPackage $package;
    protected DoiBankAccount $bankAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRoles();
        $this->seed(DoiPackageSeeder::class);
        $this->seed(DoiBankAccountSeeder::class);

        $this->university = University::factory()->create(['name' => 'Universitas Muhammadiyah Actions Test']);
        $this->user = User::factory()->user()->create(['university_id' => $this->university->id]);
        $this->adminUser = User::factory()->superAdmin()->create();
        $this->scientificField = ScientificField::factory()->create(['name' => 'Teknologi Informasi']);

        $this->journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'title' => 'Jurnal DOI Action Test',
        ]);

        $this->package = DoiPackage::where('code', 'DOI-INST-STD')->firstOrFail();
        $this->bankAccount = DoiBankAccount::where('is_active', true)->firstOrFail();
    }

    public function test_generate_invoice_action_creates_sequential_invoice(): void
    {
        $subscription1 = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::INACTIVE,
        ]);

        $subscription2 = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => null,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::INACTIVE,
        ]);

        $action = new GenerateInvoiceAction();

        $invoice1 = $action->execute($subscription1, $this->user);
        $invoice2 = $action->execute($subscription2, $this->user);

        $monthYear = Carbon::now()->format('Ym');
        $expectedPrefix = "INV/DOI/{$monthYear}/";

        $this->assertStringStartsWith($expectedPrefix, $invoice1->invoice_number);
        $this->assertStringStartsWith($expectedPrefix, $invoice2->invoice_number);

        // Extract sequential numbers
        $num1 = (int) substr($invoice1->invoice_number, -4);
        $num2 = (int) substr($invoice2->invoice_number, -4);
        $this->assertEquals($num1 + 1, $num2);

        // Check attributes & items
        $this->assertEquals($subscription1->id, $invoice1->subscription_id);
        $this->assertEquals($this->university->id, $invoice1->university_id);
        $this->assertEquals($this->user->id, $invoice1->user_id);
        $this->assertEquals(InvoiceStatus::UNPAID, $invoice1->status);
        $this->assertEquals($this->package->price_annual, $invoice1->subtotal);
        $this->assertEquals($this->package->price_annual, $invoice1->total_amount);

        $this->assertCount(1, $invoice1->items);
        $this->assertEquals(InvoiceItemType::ANNUAL_FEE, $invoice1->items->first()->item_type);
        $this->assertEquals($this->package->price_annual, $invoice1->items->first()->unit_price);
    }

    public function test_store_payment_proof_action_saves_file_and_updates_status(): void
    {
        Storage::fake('doi_proofs');
        Event::fake([PaymentProofUploaded::class]);

        $subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::INACTIVE,
        ]);

        $invoice = DoiInvoice::create([
            'invoice_number' => 'INV/DOI/202608/9001',
            'subscription_id' => $subscription->id,
            'university_id' => $this->university->id,
            'user_id' => $this->user->id,
            'period_start' => Carbon::now()->toDateString(),
            'period_end' => Carbon::now()->addYear()->toDateString(),
            'subtotal' => 5000000,
            'discount' => 0,
            'tax' => 0,
            'total_amount' => 5000000,
            'due_date' => Carbon::now()->addDays(14)->toDateString(),
            'status' => InvoiceStatus::UNPAID,
        ]);

        $file = UploadedFile::fake()->create('bukti_transfer.jpg', 500, 'image/jpeg');

        $action = new StorePaymentProofAction();
        $proof = $action->execute($invoice, $file, [
            'bank_sender' => 'Bank Mandiri',
            'account_name' => 'Bendahara Jurnal Test',
            'bank_destination_id' => $this->bankAccount->id,
            'transfer_amount' => 5000000,
            'transfer_date' => Carbon::now()->toDateString(),
        ], $this->user);

        $this->assertInstanceOf(DoiPaymentProof::class, $proof);
        $this->assertEquals(PaymentProofStatus::PENDING, $proof->status);
        $this->assertEquals('Bank Mandiri', $proof->bank_sender);
        $this->assertEquals('Bendahara Jurnal Test', $proof->account_name);
        $this->assertEquals($this->bankAccount->id, $proof->bank_destination_id);
        $this->assertEquals('bukti_transfer.jpg', $proof->file_name);

        Storage::disk('doi_proofs')->assertExists($proof->file_path);

        $this->assertEquals(InvoiceStatus::PENDING_VERIFICATION, $invoice->fresh()->status);
        Event::assertDispatched(PaymentProofUploaded::class, function ($event) use ($proof) {
            return $event->paymentProof->id === $proof->id;
        });
    }

    public function test_verify_payment_proof_action_approves_and_activates_subscription(): void
    {
        Event::fake([SubscriptionActivated::class]);

        $subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::PENDING_VERIFICATION,
            'similarity_quota_total' => 50,
            'similarity_quota_used' => 0,
        ]);

        $invoice = DoiInvoice::create([
            'invoice_number' => 'INV/DOI/202608/9002',
            'subscription_id' => $subscription->id,
            'university_id' => $this->university->id,
            'user_id' => $this->user->id,
            'period_start' => Carbon::now()->toDateString(),
            'period_end' => Carbon::now()->addYear()->toDateString(),
            'subtotal' => 5000000,
            'discount' => 0,
            'tax' => 0,
            'total_amount' => 5000000,
            'due_date' => Carbon::now()->addDays(14)->toDateString(),
            'status' => InvoiceStatus::PENDING_VERIFICATION,
        ]);

        $proof = DoiPaymentProof::create([
            'invoice_id' => $invoice->id,
            'user_id' => $this->user->id,
            'bank_sender' => 'Bank BCA',
            'account_name' => 'Pengelola Jurnal',
            'bank_destination_id' => $this->bankAccount->id,
            'transfer_amount' => 5000000,
            'transfer_date' => Carbon::now()->toDateString(),
            'file_path' => 'proofs/test_proof.jpg',
            'file_name' => 'test_proof.jpg',
            'file_size' => 1024,
            'mime_type' => 'image/jpeg',
            'status' => PaymentProofStatus::PENDING,
        ]);

        $action = new VerifyPaymentProofAction();
        $result = $action->execute($proof, isApproved: true, adminNotes: 'Pembayaran valid & lunas', verifier: $this->adminUser);

        $this->assertEquals(PaymentProofStatus::APPROVED, $result->status);
        $this->assertEquals($this->adminUser->id, $result->verified_by);
        $this->assertNotNull($result->verified_at);
        $this->assertEquals('Pembayaran valid & lunas', $result->admin_notes);

        $freshInvoice = $invoice->fresh();
        $this->assertEquals(InvoiceStatus::PAID, $freshInvoice->status);
        $this->assertNotNull($freshInvoice->paid_at);

        $freshSubscription = $subscription->fresh();
        $this->assertEquals(SubscriptionStatus::ACTIVE, $freshSubscription->status);
        $this->assertNotNull($freshSubscription->start_date);
        $this->assertNotNull($freshSubscription->end_date);
        $this->assertEquals(50 + $this->package->similarity_quota_included, $freshSubscription->similarity_quota_total);

        // Check similarity quota log
        $this->assertDatabaseHas('doi_similarity_quota_logs', [
            'subscription_id' => $subscription->id,
            'journal_id' => $this->journal->id,
            'user_id' => $this->adminUser->id,
            'amount' => $this->package->similarity_quota_included,
            'balance_after' => 50 + $this->package->similarity_quota_included,
        ]);

        Event::assertDispatched(SubscriptionActivated::class, function ($event) use ($subscription, $proof) {
            return $event->subscription->id === $subscription->id
                && $event->paymentProof?->id === $proof->id;
        });
    }

    public function test_verify_payment_proof_action_rejects_and_reverts_invoice(): void
    {
        Event::fake([PaymentProofRejected::class]);

        $subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::PENDING_VERIFICATION,
        ]);

        $invoice = DoiInvoice::create([
            'invoice_number' => 'INV/DOI/202608/9003',
            'subscription_id' => $subscription->id,
            'university_id' => $this->university->id,
            'user_id' => $this->user->id,
            'period_start' => Carbon::now()->toDateString(),
            'period_end' => Carbon::now()->addYear()->toDateString(),
            'subtotal' => 5000000,
            'discount' => 0,
            'tax' => 0,
            'total_amount' => 5000000,
            'due_date' => Carbon::now()->addDays(14)->toDateString(),
            'status' => InvoiceStatus::PENDING_VERIFICATION,
        ]);

        $proof = DoiPaymentProof::create([
            'invoice_id' => $invoice->id,
            'user_id' => $this->user->id,
            'bank_sender' => 'Bank BCA',
            'account_name' => 'Pengelola Jurnal',
            'bank_destination_id' => $this->bankAccount->id,
            'transfer_amount' => 1000000, // Invalid amount
            'transfer_date' => Carbon::now()->toDateString(),
            'file_path' => 'proofs/test_proof.jpg',
            'file_name' => 'test_proof.jpg',
            'file_size' => 1024,
            'mime_type' => 'image/jpeg',
            'status' => PaymentProofStatus::PENDING,
        ]);

        $action = new VerifyPaymentProofAction();
        $result = $action->execute($proof, isApproved: false, adminNotes: 'Nominal transfer tidak sesuai tagihan', verifier: $this->adminUser);

        $this->assertEquals(PaymentProofStatus::REJECTED, $result->status);
        $this->assertEquals($this->adminUser->id, $result->verified_by);
        $this->assertNotNull($result->verified_at);
        $this->assertEquals('Nominal transfer tidak sesuai tagihan', $result->admin_notes);

        $freshInvoice = $invoice->fresh();
        $this->assertEquals(InvoiceStatus::UNPAID, $freshInvoice->status);
        $this->assertNull($freshInvoice->paid_at);

        Event::assertDispatched(PaymentProofRejected::class, function ($event) use ($proof) {
            return $event->paymentProof->id === $proof->id;
        });
    }
}
