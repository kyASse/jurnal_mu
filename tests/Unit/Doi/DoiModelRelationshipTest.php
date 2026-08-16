<?php

namespace Tests\Unit\Doi;

use App\Enums\Doi\InvoiceItemType;
use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\QuotaChangeType;
use App\Enums\Doi\SubscriptionStatus;
use App\Models\DoiBankAccount;
use App\Models\DoiInvoice;
use App\Models\DoiInvoiceItem;
use App\Models\DoiPackage;
use App\Models\DoiPaymentProof;
use App\Models\DoiSimilarityQuotaLog;
use App\Models\DoiSubscription;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class DoiModelRelationshipTest extends TestCase
{
    use DatabaseTransactions;

    protected University $university;
    protected User $user;
    protected User $adminUser;
    protected ScientificField $scientificField;
    protected Journal $journal;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRoles();

        $this->university = University::factory()->create(['name' => 'Universitas Muhammadiyah Test']);
        $this->user = User::factory()->user()->create(['university_id' => $this->university->id]);
        $this->adminUser = User::factory()->superAdmin()->create();
        $this->scientificField = ScientificField::factory()->create(['name' => 'Teknologi Informasi']);

        $this->journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $this->scientificField->id,
            'title' => 'Jurnal Teknologi Informasi',
        ]);
    }

    public function test_doi_package_model_has_correct_attributes_casts_relations_and_scopes(): void
    {
        $package = DoiPackage::create([
            'name' => 'Paket Silver',
            'slug' => 'paket-silver',
            'code' => 'PKG-SLV',
            'description' => 'Silver package description',
            'price_annual' => 5000000,
            'prefix_included' => true,
            'similarity_quota_included' => 150,
            'is_active' => true,
        ]);

        $inactivePackage = DoiPackage::create([
            'name' => 'Paket Inactive',
            'slug' => 'paket-inactive',
            'code' => 'PKG-INA',
            'price_annual' => 1000000,
            'prefix_included' => false,
            'similarity_quota_included' => 0,
            'is_active' => false,
        ]);

        $this->assertInstanceOf(DoiPackage::class, $package);
        $this->assertTrue($package->prefix_included);
        $this->assertEquals(150, $package->similarity_quota_included);
        $this->assertTrue($package->is_active);
        $this->assertEmpty($package->subscriptions);

        $activePackageIds = DoiPackage::active()->pluck('id');
        $this->assertTrue($activePackageIds->contains($package->id));
        $this->assertFalse($activePackageIds->contains($inactivePackage->id));
    }

    public function test_doi_subscription_model_casts_relations_accessors_and_scopes_work(): void
    {
        $package = DoiPackage::create([
            'name' => 'Paket Gold',
            'slug' => 'paket-gold',
            'code' => 'PKG-GLD',
            'price_annual' => 10000000,
            'prefix_included' => true,
            'similarity_quota_included' => 300,
            'is_active' => true,
        ]);

        $subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'start_date' => Carbon::now()->subMonths(1)->toDateString(),
            'end_date' => Carbon::now()->addDays(20)->toDateString(),
            'active_prefix' => '10.12345',
            'similarity_quota_total' => 300,
            'similarity_quota_used' => 50,
            'auto_renew' => true,
            'notes' => 'Subscription active note',
        ]);

        $graceSubscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => null,
            'doi_package_id' => $package->id,
            'status' => SubscriptionStatus::GRACE_PERIOD,
            'start_date' => Carbon::now()->subYear()->toDateString(),
            'end_date' => Carbon::now()->subDays(5)->toDateString(),
            'active_prefix' => '10.54321',
            'similarity_quota_total' => 100,
            'similarity_quota_used' => 100,
            'auto_renew' => false,
        ]);

        $expiredSubscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => null,
            'doi_package_id' => $package->id,
            'status' => SubscriptionStatus::EXPIRED,
            'start_date' => Carbon::now()->subYears(2)->toDateString(),
            'end_date' => Carbon::now()->subYear()->toDateString(),
            'similarity_quota_total' => 50,
            'similarity_quota_used' => 50,
        ]);

        // Enum and Type Casts
        $this->assertEquals(SubscriptionStatus::ACTIVE, $subscription->status);
        $this->assertEquals('active', $subscription->status->value);
        $this->assertInstanceOf(Carbon::class, $subscription->start_date);
        $this->assertInstanceOf(Carbon::class, $subscription->end_date);
        $this->assertEquals(300, $subscription->similarity_quota_total);
        $this->assertEquals(50, $subscription->similarity_quota_used);
        $this->assertTrue($subscription->auto_renew);

        // Relationships
        $this->assertEquals($this->university->id, $subscription->university->id);
        $this->assertEquals($this->journal->id, $subscription->journal->id);
        $this->assertEquals($package->id, $subscription->package->id);
        $this->assertCount(3, $package->subscriptions);

        // Accessors
        $this->assertEquals(250, $subscription->remaining_quota);
        $this->assertTrue($subscription->is_expiring_soon);

        // Scopes
        $this->assertTrue(DoiSubscription::active()->pluck('id')->contains($subscription->id));
        $this->assertFalse(DoiSubscription::active()->pluck('id')->contains($graceSubscription->id));
        $this->assertTrue(DoiSubscription::gracePeriod()->pluck('id')->contains($graceSubscription->id));
        $this->assertTrue(DoiSubscription::expired()->pluck('id')->contains($expiredSubscription->id));
        $this->assertEquals(3, DoiSubscription::forUniversity($this->university->id)->count());
    }

    public function test_doi_invoice_and_invoice_item_models_operate_with_relations_and_scopes(): void
    {
        $package = DoiPackage::create([
            'name' => 'Paket Basic',
            'slug' => 'paket-basic',
            'code' => 'PKG-BSC',
            'price_annual' => 3000000,
            'is_active' => true,
        ]);

        $subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $package->id,
            'status' => SubscriptionStatus::ACTIVE,
        ]);

        $invoice = DoiInvoice::create([
            'invoice_number' => 'INV-2026-001',
            'subscription_id' => $subscription->id,
            'university_id' => $this->university->id,
            'user_id' => $this->user->id,
            'period_start' => Carbon::now()->toDateString(),
            'period_end' => Carbon::now()->addYear()->toDateString(),
            'subtotal' => 3000000,
            'discount' => 0,
            'tax' => 330000,
            'total_amount' => 3330000,
            'due_date' => Carbon::now()->addDays(14)->toDateString(),
            'status' => InvoiceStatus::UNPAID,
        ]);

        $paidInvoice = DoiInvoice::create([
            'invoice_number' => 'INV-2026-002',
            'subscription_id' => $subscription->id,
            'university_id' => $this->university->id,
            'user_id' => $this->user->id,
            'period_start' => Carbon::now()->subYear()->toDateString(),
            'period_end' => Carbon::now()->toDateString(),
            'subtotal' => 3000000,
            'discount' => 0,
            'tax' => 330000,
            'total_amount' => 3330000,
            'due_date' => Carbon::now()->subDays(14)->toDateString(),
            'paid_at' => Carbon::now()->subDays(10),
            'status' => InvoiceStatus::PAID,
        ]);

        $item1 = DoiInvoiceItem::create([
            'invoice_id' => $invoice->id,
            'description' => 'Biaya Tahunan Keanggotaan Crossref',
            'item_type' => InvoiceItemType::ANNUAL_FEE,
            'unit_price' => 3000000,
            'quantity' => 1,
            'total_price' => 3000000,
        ]);

        // Casts and relations
        $this->assertEquals(InvoiceStatus::UNPAID, $invoice->status);
        $this->assertEquals(InvoiceItemType::ANNUAL_FEE, $item1->item_type);
        $this->assertEquals($invoice->id, $item1->invoice->id);
        $this->assertCount(1, $invoice->items);
        $this->assertEquals($subscription->id, $invoice->subscription->id);
        $this->assertEquals($this->university->id, $invoice->university->id);
        $this->assertEquals($this->user->id, $invoice->user->id);
        $this->assertCount(2, $subscription->invoices);

        // Scopes
        $this->assertTrue(DoiInvoice::unpaid()->pluck('id')->contains($invoice->id));
        $this->assertTrue(DoiInvoice::paid()->pluck('id')->contains($paidInvoice->id));
        $this->assertEquals(0, DoiInvoice::pendingVerification()->count());
    }

    public function test_doi_bank_account_and_payment_proof_models_function_properly(): void
    {
        $bank = DoiBankAccount::create([
            'bank_name' => 'Bank Syariah Indonesia',
            'bank_code' => 'BSI',
            'account_number' => '7123456789',
            'account_holder' => 'Majelis Diktilitbang PP Muhammadiyah',
            'branch_name' => 'KC Yogyakarta',
            'is_active' => true,
            'display_order' => 1,
        ]);

        $inactiveBank = DoiBankAccount::create([
            'bank_name' => 'Bank Mandiri',
            'bank_code' => 'MANDIRI',
            'account_number' => '1370000000',
            'account_holder' => 'Majelis Diktilitbang',
            'is_active' => false,
            'display_order' => 2,
        ]);

        $package = DoiPackage::create([
            'name' => 'Paket Platinum',
            'slug' => 'paket-platinum',
            'code' => 'PKG-PLT',
            'price_annual' => 15000000,
        ]);

        $subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'doi_package_id' => $package->id,
            'status' => SubscriptionStatus::PENDING_VERIFICATION,
        ]);

        $invoice = DoiInvoice::create([
            'invoice_number' => 'INV-2026-003',
            'subscription_id' => $subscription->id,
            'university_id' => $this->university->id,
            'user_id' => $this->user->id,
            'period_start' => Carbon::now()->toDateString(),
            'period_end' => Carbon::now()->addYear()->toDateString(),
            'total_amount' => 15000000,
            'due_date' => Carbon::now()->addDays(7)->toDateString(),
            'status' => InvoiceStatus::PENDING_VERIFICATION,
        ]);

        $proof = DoiPaymentProof::create([
            'invoice_id' => $invoice->id,
            'user_id' => $this->user->id,
            'bank_sender' => 'Bank BNI',
            'account_name' => 'Bendahara Jurnal',
            'bank_destination_id' => $bank->id,
            'transfer_amount' => 15000000,
            'transfer_date' => Carbon::now()->toDateString(),
            'file_path' => 'doi/proofs/proof_1.jpg',
            'file_name' => 'bukti_bayar.jpg',
            'file_size' => 1024000,
            'mime_type' => 'image/jpeg',
            'status' => PaymentProofStatus::PENDING,
        ]);

        // Check bank account scope and relations
        $this->assertTrue(DoiBankAccount::active()->pluck('id')->contains($bank->id));
        $this->assertFalse(DoiBankAccount::active()->pluck('id')->contains($inactiveBank->id));
        $this->assertCount(1, $bank->paymentProofs);

        // Check payment proof casts and relations
        $this->assertEquals(PaymentProofStatus::PENDING, $proof->status);
        $this->assertEquals($invoice->id, $proof->invoice->id);
        $this->assertEquals($this->user->id, $proof->user->id);
        $this->assertEquals($bank->id, $proof->bankDestination->id);
        $this->assertEquals($proof->id, $invoice->latestPaymentProof->id);

        // Check scopes
        $this->assertTrue(DoiPaymentProof::pending()->pluck('id')->contains($proof->id));
        $this->assertEquals(0, DoiPaymentProof::approved()->count());
    }

    public function test_doi_similarity_quota_log_works_and_records_balance_changes(): void
    {
        $package = DoiPackage::create([
            'name' => 'Paket Pro',
            'slug' => 'paket-pro',
            'code' => 'PKG-PRO',
            'price_annual' => 8000000,
        ]);

        $subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'similarity_quota_total' => 200,
            'similarity_quota_used' => 10,
        ]);

        $log = DoiSimilarityQuotaLog::create([
            'subscription_id' => $subscription->id,
            'journal_id' => $this->journal->id,
            'user_id' => $this->user->id,
            'change_type' => QuotaChangeType::USAGE,
            'amount' => -1,
            'balance_after' => 189,
            'description' => 'Similarity check for article #101',
        ]);

        $this->assertEquals(QuotaChangeType::USAGE, $log->change_type);
        $this->assertEquals($subscription->id, $log->subscription->id);
        $this->assertEquals($this->journal->id, $log->journal->id);
        $this->assertEquals($this->user->id, $log->user->id);
        $this->assertCount(1, $subscription->quotaLogs);
    }

    public function test_university_and_journal_have_working_relationships_to_doi_subscription(): void
    {
        $package = DoiPackage::create([
            'name' => 'Paket Universal',
            'slug' => 'paket-universal',
            'code' => 'PKG-UNI',
            'price_annual' => 12000000,
        ]);

        $expiredSub = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $package->id,
            'status' => SubscriptionStatus::EXPIRED,
        ]);

        $activeSub = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $package->id,
            'status' => SubscriptionStatus::ACTIVE,
        ]);

        $this->assertCount(2, $this->university->doiSubscriptions);
        $this->assertEquals($activeSub->id, $this->university->activeDoiSubscription->id);
        $this->assertEquals($activeSub->id, $this->journal->doiSubscription->id);
        $this->assertCount(2, $this->journal->doiSubscriptions);
    }
}
