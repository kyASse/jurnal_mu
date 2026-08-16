<?php

namespace Tests\Feature\Doi;

use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
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
    protected DoiBankAccount $bankAccount;

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
        $this->bankAccount = DoiBankAccount::firstOrFail();

        $this->subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => null,
            'doi_package_id' => $this->package->id,
            'status' => \App\Enums\Doi\SubscriptionStatus::INACTIVE,
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addYear(),
            'similarity_quota_total' => 250,
            'similarity_quota_used' => 0,
        ]);

        $this->invoice = DoiInvoice::create([
            'invoice_number' => 'INV/DOI/202608/0101',
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
    }

    public function test_admin_kampus_can_view_invoice_list_for_their_university(): void
    {
        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin-kampus.doi.invoices.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AdminKampus/Doi/Invoices/Index')
            ->has('invoices.data', 1)
            ->where('invoices.data.0.invoice_number', 'INV/DOI/202608/0101')
            ->has('bankAccounts')
        );
    }

    public function test_pengelola_jurnal_can_view_invoice_list(): void
    {
        $response = $this->actingAs($this->userPengelola)
            ->get(route('user.doi.invoices.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('User/Doi/Invoices/Index')
            ->has('invoices.data', 1)
            ->where('invoices.data.0.invoice_number', 'INV/DOI/202608/0101')
        );
    }

    public function test_multi_tenant_isolation_on_invoice_listing(): void
    {
        $otherUniv = University::factory()->create(['name' => 'Universitas Lain']);
        $otherAdmin = User::factory()->adminKampus()->create([
            'university_id' => $otherUniv->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($otherAdmin)
            ->get(route('admin-kampus.doi.invoices.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AdminKampus/Doi/Invoices/Index')
            ->has('invoices.data', 0)
        );
    }

    public function test_admin_kampus_can_upload_payment_proof_for_unpaid_invoice(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('receipt.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.doi.invoices.payment-proof.store', $this->invoice), [
                'bank_sender' => 'Bank Mandiri',
                'account_name' => 'Bendahara UM',
                'bank_destination_id' => $this->bankAccount->id,
                'transfer_amount' => 7500000,
                'transfer_date' => Carbon::now()->format('Y-m-d'),
                'payment_proof' => $file,
            ]);

        $response->assertRedirect();
        $this->invoice->refresh();
        $this->assertEquals(InvoiceStatus::PENDING_VERIFICATION, $this->invoice->status);

        $this->assertDatabaseHas('doi_payment_proofs', [
            'invoice_id' => $this->invoice->id,
            'user_id' => $this->adminKampus->id,
            'bank_sender' => 'Bank Mandiri',
            'account_name' => 'Bendahara UM',
            'bank_destination_id' => $this->bankAccount->id,
            'transfer_amount' => 7500000,
            'status' => PaymentProofStatus::PENDING->value,
        ]);

        $proof = DoiPaymentProof::where('invoice_id', $this->invoice->id)->first();
        $this->assertNotNull($proof);
        Storage::disk('local')->assertExists($proof->file_path);
    }

    public function test_upload_payment_proof_validates_mime_and_size(): void
    {
        Storage::fake('local');

        // Invalid MIME type (text file)
        $invalidFile = UploadedFile::fake()->create('document.txt', 100, 'text/plain');

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.doi.invoices.payment-proof.store', $this->invoice), [
                'bank_sender' => 'Bank Mandiri',
                'account_name' => 'Bendahara UM',
                'bank_destination_id' => $this->bankAccount->id,
                'transfer_amount' => 7500000,
                'transfer_date' => Carbon::now()->format('Y-m-d'),
                'payment_proof' => $invalidFile,
            ]);

        $response->assertSessionHasErrors(['payment_proof']);

        // Exceeding max size (5MB = 5120KB) -> create 6MB file
        $largeFile = UploadedFile::fake()->create('large.pdf', 6000, 'application/pdf');

        $responseLarge = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.doi.invoices.payment-proof.store', $this->invoice), [
                'bank_sender' => 'Bank Mandiri',
                'account_name' => 'Bendahara UM',
                'bank_destination_id' => $this->bankAccount->id,
                'transfer_amount' => 7500000,
                'transfer_date' => Carbon::now()->format('Y-m-d'),
                'payment_proof' => $largeFile,
            ]);

        $responseLarge->assertSessionHasErrors(['payment_proof']);
    }

    public function test_admin_kampus_can_stream_own_payment_proof(): void
    {
        Storage::fake('local');
        $filePath = 'doi/payment_proofs/test_receipt.pdf';
        Storage::disk('local')->put($filePath, 'fake pdf content');

        $proof = DoiPaymentProof::create([
            'invoice_id' => $this->invoice->id,
            'user_id' => $this->adminKampus->id,
            'bank_sender' => 'Bank Mandiri',
            'account_name' => 'Bendahara UM',
            'bank_destination_id' => $this->bankAccount->id,
            'transfer_amount' => 7500000,
            'transfer_date' => Carbon::now(),
            'file_path' => $filePath,
            'file_name' => 'test_receipt.pdf',
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
            'status' => PaymentProofStatus::PENDING,
        ]);

        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin-kampus.doi.payment-proofs.show', $proof));

        $response->assertStatus(200);
    }

    public function test_user_cannot_access_other_university_payment_proof(): void
    {
        Storage::fake('local');
        $filePath = 'doi/payment_proofs/other_receipt.pdf';
        Storage::disk('local')->put($filePath, 'fake pdf content');

        $proof = DoiPaymentProof::create([
            'invoice_id' => $this->invoice->id,
            'user_id' => $this->adminKampus->id,
            'bank_sender' => 'Bank Mandiri',
            'account_name' => 'Bendahara UM',
            'bank_destination_id' => $this->bankAccount->id,
            'transfer_amount' => 7500000,
            'transfer_date' => Carbon::now(),
            'file_path' => $filePath,
            'file_name' => 'other_receipt.pdf',
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
            'status' => PaymentProofStatus::PENDING,
        ]);

        $otherUniv = University::factory()->create(['name' => 'Universitas Asing']);
        $otherUser = User::factory()->user()->create([
            'university_id' => $otherUniv->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($otherUser)
            ->get(route('user.doi.payment-proofs.show', $proof));

        $response->assertStatus(403);
    }

    public function test_cannot_upload_payment_proof_for_paid_invoice(): void
    {
        Storage::fake('local');
        $this->invoice->update(['status' => InvoiceStatus::PAID]);

        $file = UploadedFile::fake()->create('receipt.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.doi.invoices.payment-proof.store', $this->invoice), [
                'bank_sender' => 'Bank Mandiri',
                'account_name' => 'Bendahara UM',
                'bank_destination_id' => $this->bankAccount->id,
                'transfer_amount' => 7500000,
                'transfer_date' => Carbon::now()->format('Y-m-d'),
                'payment_proof' => $file,
            ]);

        $response->assertSessionHasErrors(['invoice']);
    }
}
