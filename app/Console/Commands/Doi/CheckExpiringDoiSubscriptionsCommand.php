<?php

namespace App\Console\Commands\Doi;

use App\Enums\Doi\SubscriptionStatus;
use App\Models\DoiSubscription;
use App\Notifications\Doi\DoiSubscriptionStatusChangedNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckExpiringDoiSubscriptionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'doi:check-expiring-subscriptions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check expiring DOI subscriptions and update their statuses to grace period or expired';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today();
        $gracePeriodThreshold = $today->copy()->subDays(7);

        $transitionedToGrace = 0;
        $transitionedToExpired = 0;

        // 1. Transition ACTIVE subscriptions whose end_date has passed
        $activeSubscriptions = DoiSubscription::where('status', SubscriptionStatus::ACTIVE)
            ->whereDate('end_date', '<', $today)
            ->get();

        foreach ($activeSubscriptions as $subscription) {
            $oldStatus = $subscription->status->value;
            $endDate = Carbon::parse($subscription->end_date)->startOfDay();

            if ($endDate->gte($gracePeriodThreshold)) {
                // Expired within last 7 days -> GRACE_PERIOD
                $subscription->update(['status' => SubscriptionStatus::GRACE_PERIOD]);
                $transitionedToGrace++;
                $this->notifyUsers($subscription, $oldStatus, SubscriptionStatus::GRACE_PERIOD->value);
            } else {
                // Expired more than 7 days ago -> EXPIRED
                $subscription->update(['status' => SubscriptionStatus::EXPIRED]);
                $transitionedToExpired++;
                $this->notifyUsers($subscription, $oldStatus, SubscriptionStatus::EXPIRED->value);
            }
        }

        // 2. Transition GRACE_PERIOD subscriptions whose end_date is older than 7 days ago
        $graceSubscriptions = DoiSubscription::where('status', SubscriptionStatus::GRACE_PERIOD)
            ->whereDate('end_date', '<', $gracePeriodThreshold)
            ->get();

        foreach ($graceSubscriptions as $subscription) {
            $oldStatus = $subscription->status->value;
            $subscription->update(['status' => SubscriptionStatus::EXPIRED]);
            $transitionedToExpired++;
            $this->notifyUsers($subscription, $oldStatus, SubscriptionStatus::EXPIRED->value);
        }

        $summary = "Processed DOI expiring subscriptions: {$transitionedToGrace} moved to Grace Period, {$transitionedToExpired} moved to Expired.";
        $this->info($summary);
        Log::info($summary);

        return self::SUCCESS;
    }

    /**
     * Send status change notification to associated users
     */
    protected function notifyUsers(DoiSubscription $subscription, string $oldStatus, string $newStatus): void
    {
        $recipients = collect();

        if ($subscription->university) {
            foreach ($subscription->university->users as $user) {
                $recipients->push($user);
            }
        }

        $latestInvoiceUser = $subscription->invoices()->latest()->first()?->user;
        if ($latestInvoiceUser) {
            $recipients->push($latestInvoiceUser);
        }

        if ($subscription->journal?->user) {
            $recipients->push($subscription->journal->user);
        }

        $recipients = $recipients->unique('id');

        foreach ($recipients as $recipient) {
            $recipient->notify(new DoiSubscriptionStatusChangedNotification($subscription, $oldStatus, $newStatus));
        }
    }
}
