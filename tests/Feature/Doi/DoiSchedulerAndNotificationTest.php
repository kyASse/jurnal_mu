<?php

namespace Tests\Feature\Doi;

use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\SubscriptionStatus;
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
use App\Notifications\Doi\DoiInvoiceDueReminderNotification;
use App\Notifications\Doi\DoiPaymentProofRejectedNotification;
use App\Notifications\Doi\DoiPaymentProofUploadedNotification;
use App\Notifications\Doi\DoiSubscriptionActivatedNotification;
use App\Notifications\Doi\DoiSubscriptionStatusChangedNotification;
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
            'status' => SubscriptionStatus::INACTIVE,
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
            'status' => InvoiceStatus::UNPAID,
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
            'status' => PaymentProofStatus::PENDING,
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

    public function test_check_expiring_subscriptions_command_transitions_active_to_grace_period(): void
    {
        Notification::fake();

        $this->subscription->update([
            'status' => SubscriptionStatus::ACTIVE,
            'end_date' => now()->subDays(3),
        ]);

        $this->artisan('doi:check-expiring-subscriptions')
            ->assertSuccessful();

        $this->assertEquals(SubscriptionStatus::GRACE_PERIOD, $this->subscription->fresh()->status);

        Notification::assertSentTo(
            [$this->user],
            DoiSubscriptionStatusChangedNotification::class,
            function (DoiSubscriptionStatusChangedNotification $notification) {
                return $notification->subscription->id === $this->subscription->id
                    && $notification->newStatus === SubscriptionStatus::GRACE_PERIOD->value;
            }
        );
    }

    public function test_check_expiring_subscriptions_command_transitions_grace_period_to_expired_after_7_days(): void
    {
        Notification::fake();

        $this->subscription->update([
            'status' => SubscriptionStatus::GRACE_PERIOD,
            'end_date' => now()->subDays(10),
        ]);

        $this->artisan('doi:check-expiring-subscriptions')
            ->assertSuccessful();

        $this->assertEquals(SubscriptionStatus::EXPIRED, $this->subscription->fresh()->status);

        Notification::assertSentTo(
            [$this->user],
            DoiSubscriptionStatusChangedNotification::class,
            function (DoiSubscriptionStatusChangedNotification $notification) {
                return $notification->subscription->id === $this->subscription->id
                    && $notification->newStatus === SubscriptionStatus::EXPIRED->value;
            }
        );
    }

    public function test_send_invoice_due_reminder_command_sends_notification_for_unpaid_invoices(): void
    {
        Notification::fake();

        $this->invoice->update([
            'status' => InvoiceStatus::UNPAID,
            'due_date' => now()->addDays(7),
        ]);

        $this->artisan('doi:send-due-reminders')
            ->assertSuccessful();

        Notification::assertSentTo(
            [$this->user],
            DoiInvoiceDueReminderNotification::class,
            function (DoiInvoiceDueReminderNotification $notification) {
                return $notification->invoice->id === $this->invoice->id;
            }
        );
    }
}
