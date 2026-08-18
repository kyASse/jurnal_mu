<?php

namespace Tests\Feature\Doi;

use App\Events\Doi\PaymentProofRejected;
use App\Events\Doi\PaymentProofUploaded;
use App\Events\Doi\SubscriptionActivated;
use App\Models\DoiBankAccount;
use App\Models\DoiInvoice;
use App\Models\DoiPackage;
use App\Models\DoiPaymentProof;
use App\Models\DoiSubscription;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use App\Notifications\Doi\DoiPaymentProofRejectedNotification;
use App\Notifications\Doi\DoiPaymentProofUploadedNotification;
use App\Notifications\Doi\DoiSubscriptionActivatedNotification;
use Database\Seeders\DoiBankAccountSeeder;
use Database\Seeders\DoiPackageSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class DoiSchedulerAndNotificationTest extends TestCase
{
    use DatabaseTransactions;

    protected User $superAdmin;
    protected User $user;
    protected University $university;
    protected DoiSubscription $subscription;
    protected DoiInvoice $invoice;
    protected DoiPaymentProof $paymentProof;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Administrator']);
        Role::firstOrCreate(['name' => Role::ADMIN_KAMPUS], ['display_name' => 'Administrator Kampus']);
        Role::firstOrCreate(['name' => Role::USER], ['display_name' => 'Pengelola Jurnal']);

        $this->seed(DoiPackageSeeder::class);
        $this->seed(DoiBankAccountSeeder::class);

        $this->university = University::factory()->create();

        $this->superAdmin = User::factory()->superAdmin()->create([
            'is_active' => true,
        ]);

        $this->user = User::factory()->user()->create([
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $package = DoiPackage::first();
        $bankAccount = DoiBankAccount::first();

        $this->subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => null,
            'doi_package_id' => $package->id,
            'status' => \App\Enums\Doi\SubscriptionStatus::INACTIVE,
            'start_date' => now(),
            'end_date' => now()->addYear(),
            'similarity_quota_total' => 100,
            'similarity_quota_used' => 0,
        ]);

        $this->invoice = DoiInvoice::create([
            'invoice_number' => 'INV/DOI/TEST/001',
            'subscription_id' => $this->subscription->id,
            'university_id' => $this->university->id,
            'user_id' => $this->user->id,
            'period_start' => now(),
            'period_end' => now()->addYear(),
            'subtotal' => 500000,
            'total_amount' => 500000,
            'status' => \App\Enums\Doi\InvoiceStatus::UNPAID,
            'due_date' => now()->addDays(7),
        ]);

        $this->paymentProof = DoiPaymentProof::create([
            'invoice_id' => $this->invoice->id,
            'user_id' => $this->user->id,
            'bank_sender' => 'Bank Mandiri',
            'account_name' => 'John Doe',
            'bank_destination_id' => $bankAccount->id,
            'transfer_amount' => 500000,
            'transfer_date' => now(),
            'file_path' => 'doi/payment_proofs/test.pdf',
            'file_name' => 'test.pdf',
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
            'status' => \App\Enums\Doi\PaymentProofStatus::PENDING,
            'admin_notes' => 'Proof image is blurry',
        ]);
    }

    public function test_payment_proof_uploaded_event_triggers_super_admin_notification(): void
    {
        Notification::fake();

        event(new PaymentProofUploaded($this->paymentProof));

        Notification::assertSentTo(
            [$this->superAdmin],
            DoiPaymentProofUploadedNotification::class
        );
    }

    public function test_subscription_activated_event_triggers_user_notification(): void
    {
        Notification::fake();

        event(new SubscriptionActivated($this->subscription, $this->paymentProof));

        Notification::assertSentTo(
            [$this->user],
            DoiSubscriptionActivatedNotification::class
        );
    }

    public function test_payment_proof_rejected_event_triggers_user_rejection_notification(): void
    {
        Notification::fake();

        event(new PaymentProofRejected($this->paymentProof));

        Notification::assertSentTo(
            [$this->user],
            DoiPaymentProofRejectedNotification::class,
            function (DoiPaymentProofRejectedNotification $notification) {
                return $notification->adminNotes === 'Proof image is blurry' ||
                       $notification->paymentProof->admin_notes === 'Proof image is blurry';
            }
        );
    }
}
