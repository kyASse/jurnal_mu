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
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class DoiSecurityPolicyTest extends TestCase
{
    use DatabaseTransactions;

    protected User $superAdmin;
    protected User $adminKampusA;
    protected User $adminKampusB;
    protected User $userA;
    protected User $userB;
    protected University $universityA;
    protected University $universityB;
    protected DoiPackage $package;
    protected DoiBankAccount $bankAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $superAdminRole = Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Admin']);
        $adminKampusRole = Role::firstOrCreate(['name' => Role::ADMIN_KAMPUS], ['display_name' => 'Admin Kampus']);
        $userRole = Role::firstOrCreate(['name' => Role::USER], ['display_name' => 'User']);

        $this->universityA = University::firstOrCreate(
            ['code' => 'TEST-UNI-A'],
            ['name' => 'University A', 'is_active' => true]
        );

        $this->universityB = University::firstOrCreate(
            ['code' => 'TEST-UNI-B'],
            ['name' => 'University B', 'is_active' => true]
        );

        $this->superAdmin = User::create([
            'name' => 'Super Admin User',
            'email' => 'superadmin_sec@example.com',
            'password' => bcrypt('password'),
            'role_id' => $superAdminRole->id,
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        $this->adminKampusA = User::create([
            'name' => 'Admin Kampus A',
            'email' => 'adminkampus_a@example.com',
            'password' => bcrypt('password'),
            'role_id' => $adminKampusRole->id,
            'university_id' => $this->universityA->id,
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        $this->adminKampusB = User::create([
            'name' => 'Admin Kampus B',
            'email' => 'adminkampus_b@example.com',
            'password' => bcrypt('password'),
            'role_id' => $adminKampusRole->id,
            'university_id' => $this->universityB->id,
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        $this->userA = User::create([
            'name' => 'User A',
            'email' => 'user_a@example.com',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'university_id' => $this->universityA->id,
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        $this->userB = User::create([
            'name' => 'User B',
            'email' => 'user_b@example.com',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'university_id' => $this->universityB->id,
            'is_active' => true,
            'approval_status' => 'approved',
        ]);

        $this->package = DoiPackage::firstOrCreate(
            ['code' => 'DOI-TEST-PKG'],
            [
                'name' => 'Test Package',
                'slug' => 'test-package',
                'description' => 'Test package for policy tests',
                'price_annual' => 1000000,
                'is_active' => true,
            ]
        );

        $this->bankAccount = DoiBankAccount::firstOrCreate(
            ['account_number' => '9999888877'],
            [
                'bank_name' => 'Bank Mandiri',
                'bank_code' => 'MANDIRI',
                'account_holder' => 'PT Test Jurnal',
                'is_active' => true,
            ]
        );
    }

    public function test_subscription_policy_enforces_tenant_isolation(): void
    {
        $subscriptionA = DoiSubscription::create([
            'university_id' => $this->universityA->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonths(11),
            'active_prefix' => '10.1234',
        ]);

        $subscriptionB = DoiSubscription::create([
            'university_id' => $this->universityB->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonths(11),
            'active_prefix' => '10.5678',
        ]);

        // Super Admin can view & renew any
        $this->assertTrue($this->superAdmin->can('viewAny', DoiSubscription::class));
        $this->assertTrue($this->superAdmin->can('view', $subscriptionA));
        $this->assertTrue($this->superAdmin->can('view', $subscriptionB));
        $this->assertTrue($this->superAdmin->can('create', DoiSubscription::class));
        $this->assertTrue($this->superAdmin->can('renew', $subscriptionA));
        $this->assertTrue($this->superAdmin->can('renew', $subscriptionB));

        // Admin Kampus A can view & renew only subscription A
        $this->assertTrue($this->adminKampusA->can('viewAny', DoiSubscription::class));
        $this->assertTrue($this->adminKampusA->can('view', $subscriptionA));
        $this->assertFalse($this->adminKampusA->can('view', $subscriptionB));
        $this->assertTrue($this->adminKampusA->can('create', DoiSubscription::class));
        $this->assertTrue($this->adminKampusA->can('renew', $subscriptionA));
        $this->assertFalse($this->adminKampusA->can('renew', $subscriptionB));

        // Regular User A can view subscription A but not subscription B
        $this->assertTrue($this->userA->can('viewAny', DoiSubscription::class));
        $this->assertTrue($this->userA->can('view', $subscriptionA));
        $this->assertFalse($this->userA->can('view', $subscriptionB));
        $this->assertFalse($this->userA->can('renew', $subscriptionB));
    }

    public function test_invoice_policy_enforces_tenant_isolation(): void
    {
        $subscriptionA = DoiSubscription::create([
            'university_id' => $this->universityA->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::PENDING_VERIFICATION,
            'start_date' => now(),
            'end_date' => now()->addYear(),
        ]);

        $invoiceA = DoiInvoice::create([
            'invoice_number' => 'INV-TEST-A-001',
            'subscription_id' => $subscriptionA->id,
            'university_id' => $this->universityA->id,
            'user_id' => $this->userA->id,
            'period_start' => now(),
            'period_end' => now()->addYear(),
            'subtotal' => 1000000,
            'discount' => 0,
            'tax' => 0,
            'total_amount' => 1000000,
            'due_date' => now()->addDays(7),
            'status' => InvoiceStatus::UNPAID,
        ]);

        $subscriptionB = DoiSubscription::create([
            'university_id' => $this->universityB->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::PENDING_VERIFICATION,
            'start_date' => now(),
            'end_date' => now()->addYear(),
        ]);

        $invoiceB = DoiInvoice::create([
            'invoice_number' => 'INV-TEST-B-001',
            'subscription_id' => $subscriptionB->id,
            'university_id' => $this->universityB->id,
            'user_id' => $this->userB->id,
            'period_start' => now(),
            'period_end' => now()->addYear(),
            'subtotal' => 1000000,
            'discount' => 0,
            'tax' => 0,
            'total_amount' => 1000000,
            'due_date' => now()->addDays(7),
            'status' => InvoiceStatus::UNPAID,
        ]);

        // Super Admin can view and upload proof
        $this->assertTrue($this->superAdmin->can('viewAny', DoiInvoice::class));
        $this->assertTrue($this->superAdmin->can('view', $invoiceA));
        $this->assertTrue($this->superAdmin->can('view', $invoiceB));
        $this->assertTrue($this->superAdmin->can('uploadProof', $invoiceA));
        $this->assertTrue($this->superAdmin->can('uploadProof', $invoiceB));

        // Admin Kampus A & User A can access Invoice A but not Invoice B
        $this->assertTrue($this->adminKampusA->can('view', $invoiceA));
        $this->assertFalse($this->adminKampusA->can('view', $invoiceB));
        $this->assertTrue($this->adminKampusA->can('uploadProof', $invoiceA));
        $this->assertFalse($this->adminKampusA->can('uploadProof', $invoiceB));

        $this->assertTrue($this->userA->can('view', $invoiceA));
        $this->assertFalse($this->userA->can('view', $invoiceB));
        $this->assertTrue($this->userA->can('uploadProof', $invoiceA));
        $this->assertFalse($this->userA->can('uploadProof', $invoiceB));
    }

    public function test_payment_proof_policy_restricts_verification_to_super_admin(): void
    {
        $subscriptionA = DoiSubscription::create([
            'university_id' => $this->universityA->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::PENDING_VERIFICATION,
            'start_date' => now(),
            'end_date' => now()->addYear(),
        ]);

        $invoiceA = DoiInvoice::create([
            'invoice_number' => 'INV-TEST-A-002',
            'subscription_id' => $subscriptionA->id,
            'university_id' => $this->universityA->id,
            'user_id' => $this->userA->id,
            'period_start' => now(),
            'period_end' => now()->addYear(),
            'subtotal' => 1000000,
            'discount' => 0,
            'tax' => 0,
            'total_amount' => 1000000,
            'due_date' => now()->addDays(7),
            'status' => InvoiceStatus::UNPAID,
        ]);

        $proofA = DoiPaymentProof::create([
            'invoice_id' => $invoiceA->id,
            'user_id' => $this->userA->id,
            'bank_sender' => 'BCA',
            'account_name' => 'User A Sender',
            'bank_destination_id' => $this->bankAccount->id,
            'transfer_amount' => 1000000,
            'transfer_date' => now()->format('Y-m-d'),
            'file_path' => 'proofs/proof-a.jpg',
            'file_name' => 'proof-a.jpg',
            'file_size' => 1024,
            'mime_type' => 'image/jpeg',
            'status' => PaymentProofStatus::PENDING,
        ]);

        // Super admin can view & verify
        $this->assertTrue($this->superAdmin->can('viewAny', DoiPaymentProof::class));
        $this->assertTrue($this->superAdmin->can('view', $proofA));
        $this->assertTrue($this->superAdmin->can('verify', $proofA));

        // Admin Kampus A can view proof A but CANNOT verify
        $this->assertTrue($this->adminKampusA->can('view', $proofA));
        $this->assertFalse($this->adminKampusA->can('verify', $proofA));

        // User A can view proof A but CANNOT verify
        $this->assertTrue($this->userA->can('view', $proofA));
        $this->assertFalse($this->userA->can('verify', $proofA));

        // Admin Kampus B and User B CANNOT view proof A and CANNOT verify
        $this->assertFalse($this->adminKampusB->can('view', $proofA));
        $this->assertFalse($this->adminKampusB->can('verify', $proofA));
        $this->assertFalse($this->userB->can('view', $proofA));
        $this->assertFalse($this->userB->can('verify', $proofA));
    }
}
