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
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DoiBankAccountSeeder;
use Database\Seeders\DoiPackageSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDoiManagementTest extends TestCase
{
    use DatabaseTransactions;

    protected User $superAdmin;
    protected User $adminKampus;
    protected User $userPengelola;
    protected University $university;
    protected DoiPackage $package;
    protected DoiSubscription $subscription;
    protected DoiInvoice $invoice;
    protected DoiBankAccount $bankAccount;
    protected DoiPaymentProof $paymentProof;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Administrator']);
        Role::firstOrCreate(['name' => Role::ADMIN_KAMPUS], ['display_name' => 'Administrator Kampus']);
        Role::firstOrCreate(['name' => Role::USER], ['display_name' => 'Pengelola Jurnal']);

        $this->seed(DoiPackageSeeder::class);
        $this->seed(DoiBankAccountSeeder::class);

        $this->university = University::factory()->create([
            'name' => 'Universitas Muhammadiyah Admin Test',
        ]);

        $this->superAdmin = User::factory()->superAdmin()->create([
            'is_active' => true,
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
        $this->bankAccount = DoiBankAccount::firstOrFail();

        $this->subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => null,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::PENDING_VERIFICATION,
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addYear(),
            'similarity_quota_total' => 250,
            'similarity_quota_used' => 0,
        ]);

        $this->invoice = DoiInvoice::create([
            'invoice_number' => 'INV/DOI/202608/9999',
            'subscription_id' => $this->subscription->id,
            'university_id' => $this->university->id,
            'user_id' => $this->adminKampus->id,
            'period_start' => Carbon::now(),
            'period_end' => Carbon::now()->addYear(),
            'subtotal' => 7500000,
            'total_amount' => 7500000,
            'status' => InvoiceStatus::UNPAID,
            'due_date' => Carbon::now()->addDays(14),
        ]);

        $this->paymentProof = DoiPaymentProof::create([
            'invoice_id' => $this->invoice->id,
            'user_id' => $this->adminKampus->id,
            'bank_sender' => 'Bank Mandiri',
            'account_name' => 'Bendahara UM Test',
            'bank_destination_id' => $this->bankAccount->id,
            'transfer_amount' => 7500000,
            'transfer_date' => Carbon::now()->toDateString(),
            'file_path' => 'proofs/test-proof.jpg',
            'file_name' => 'test-proof.jpg',
            'file_size' => 102400,
            'mime_type' => 'image/jpeg',
            'status' => PaymentProofStatus::PENDING,
        ]);
    }

    public function test_super_admin_can_access_doi_management_dashboard(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.doi-management.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Doi/Index')
            ->has('stats')
            ->has('pendingProofs')
            ->has('subscriptions')
            ->has('packages')
            ->has('bankAccounts')
        );
    }

    public function test_non_super_admin_cannot_access_doi_management_dashboard(): void
    {
        // Admin Kampus forbidden
        $responseKampus = $this->actingAs($this->adminKampus)
            ->get(route('admin.doi-management.index'));
        $responseKampus->assertStatus(403);

        // User Pengelola forbidden
        $responseUser = $this->actingAs($this->userPengelola)
            ->get(route('admin.doi-management.index'));
        $responseUser->assertStatus(403);
    }

    public function test_super_admin_can_approve_payment_proof(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.doi-management.payment-proofs.approve', $this->paymentProof), [
                'admin_notes' => 'Pembayaran valid dan lunas.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->paymentProof->refresh();
        $this->invoice->refresh();
        $this->subscription->refresh();

        $this->assertEquals(PaymentProofStatus::APPROVED, $this->paymentProof->status);
        $this->assertEquals($this->superAdmin->id, $this->paymentProof->verified_by);
        $this->assertNotNull($this->paymentProof->verified_at);
        $this->assertEquals('Pembayaran valid dan lunas.', $this->paymentProof->admin_notes);

        $this->assertEquals(InvoiceStatus::PAID, $this->invoice->status);
        $this->assertNotNull($this->invoice->paid_at);

        $this->assertEquals(SubscriptionStatus::ACTIVE, $this->subscription->status);
        $this->assertEquals(500, $this->subscription->similarity_quota_total); // 250 + 250 package quota
    }

    public function test_super_admin_can_reject_payment_proof_with_notes(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.doi-management.payment-proofs.reject', $this->paymentProof), [
                'admin_notes' => 'Bukti transfer tidak terbaca / buram.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->paymentProof->refresh();
        $this->invoice->refresh();
        $this->subscription->refresh();

        $this->assertEquals(PaymentProofStatus::REJECTED, $this->paymentProof->status);
        $this->assertEquals('Bukti transfer tidak terbaca / buram.', $this->paymentProof->admin_notes);
        $this->assertEquals(InvoiceStatus::UNPAID, $this->invoice->status);
        $this->assertEquals(SubscriptionStatus::INACTIVE, $this->subscription->status);
    }

    public function test_reject_payment_proof_requires_admin_notes(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.doi-management.payment-proofs.reject', $this->paymentProof), [
                'admin_notes' => '',
            ]);

        $response->assertSessionHasErrors(['admin_notes']);
        $this->paymentProof->refresh();
        $this->assertEquals(PaymentProofStatus::PENDING, $this->paymentProof->status);
    }

    public function test_super_admin_can_adjust_similarity_quota_with_audit_log(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.doi-management.subscriptions.adjust-quota', $this->subscription), [
                'amount' => 50,
                'description' => 'Bonus promo Dies Natalis',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->subscription->refresh();
        $this->assertEquals(300, $this->subscription->similarity_quota_total); // 250 + 50

        $this->assertDatabaseHas('doi_similarity_quota_logs', [
            'subscription_id' => $this->subscription->id,
            'user_id' => $this->superAdmin->id,
            'change_type' => QuotaChangeType::ADJUSTMENT->value,
            'amount' => 50,
            'balance_after' => 300,
            'description' => 'Bonus promo Dies Natalis',
        ]);
    }

    public function test_super_admin_can_manage_packages(): void
    {
        // 1. Create package
        $createResponse = $this->actingAs($this->superAdmin)
            ->post(route('admin.doi-management.packages.store'), [
                'name' => 'Paket Riset Khusus',
                'code' => 'DOI-RESEARCH-SPEC',
                'price_annual' => 15000000,
                'prefix_included' => true,
                'similarity_quota_included' => 1000,
                'is_active' => true,
                'description' => 'Paket untuk lembaga riset',
            ]);

        $createResponse->assertRedirect();
        $createResponse->assertSessionHas('success');

        $package = DoiPackage::where('code', 'DOI-RESEARCH-SPEC')->firstOrFail();
        $this->assertEquals('Paket Riset Khusus', $package->name);
        $this->assertEquals(1000, $package->similarity_quota_included);

        // 2. Update package
        $updateResponse = $this->actingAs($this->superAdmin)
            ->put(route('admin.doi-management.packages.update', $package), [
                'name' => 'Paket Riset Khusus Update',
                'code' => 'DOI-RESEARCH-SPEC',
                'price_annual' => 18000000,
                'prefix_included' => true,
                'similarity_quota_included' => 1200,
                'is_active' => true,
                'description' => 'Paket riset diupdate',
            ]);

        $updateResponse->assertRedirect();
        $package->refresh();
        $this->assertEquals('Paket Riset Khusus Update', $package->name);
        $this->assertEquals(18000000, (float) $package->price_annual);
        $this->assertEquals(1200, $package->similarity_quota_included);

        // 3. Delete package (without subscriptions)
        $deleteResponse = $this->actingAs($this->superAdmin)
            ->delete(route('admin.doi-management.packages.destroy', $package));

        $deleteResponse->assertRedirect();
        $this->assertDatabaseMissing('doi_packages', [
            'id' => $package->id,
        ]);
    }

    public function test_super_admin_can_manage_bank_accounts(): void
    {
        // 1. Create bank account
        $createResponse = $this->actingAs($this->superAdmin)
            ->post(route('admin.doi-management.bank-accounts.store'), [
                'bank_name' => 'Bank Syariah Indonesia',
                'bank_code' => 'BSI',
                'account_number' => '7112233445',
                'account_holder' => 'Majelis Diktilitbang PPM',
                'branch_name' => 'KCP Yogyakarta Kotagede',
                'is_active' => true,
                'display_order' => 5,
            ]);

        $createResponse->assertRedirect();
        $createResponse->assertSessionHas('success');

        $bankAccount = DoiBankAccount::where('account_number', '7112233445')->firstOrFail();
        $this->assertEquals('Bank Syariah Indonesia', $bankAccount->bank_name);

        // 2. Update bank account
        $updateResponse = $this->actingAs($this->superAdmin)
            ->put(route('admin.doi-management.bank-accounts.update', $bankAccount), [
                'bank_name' => 'Bank Syariah Indonesia (BSI)',
                'bank_code' => 'BSI',
                'account_number' => '7112233445',
                'account_holder' => 'Majelis Diktilitbang PPM Pusat',
                'branch_name' => 'KCP Yogyakarta Kotagede',
                'is_active' => true,
                'display_order' => 10,
            ]);

        $updateResponse->assertRedirect();
        $bankAccount->refresh();
        $this->assertEquals('Bank Syariah Indonesia (BSI)', $bankAccount->bank_name);
        $this->assertEquals('Majelis Diktilitbang PPM Pusat', $bankAccount->account_holder);

        // 3. Delete bank account (without payment proofs)
        $deleteResponse = $this->actingAs($this->superAdmin)
            ->delete(route('admin.doi-management.bank-accounts.destroy', $bankAccount));

        $deleteResponse->assertRedirect();
        $this->assertDatabaseMissing('doi_bank_accounts', [
            'id' => $bankAccount->id,
        ]);
    }
}
