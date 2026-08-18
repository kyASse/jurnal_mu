<?php

namespace App\Listeners\Doi;

use App\Events\Doi\SubscriptionActivated;
use App\Notifications\Doi\DoiSubscriptionActivatedNotification;

class SendSubscriptionActivatedNotification
{
    /**
     * Handle the event.
     */
    public function handle(SubscriptionActivated $event): void
    {
        $user = $event->paymentProof?->user
            ?? $event->subscription->journal?->user
            ?? $event->subscription->invoices()->latest()->first()?->user;

        if ($user) {
            $user->notify(new DoiSubscriptionActivatedNotification($event->subscription, $event->paymentProof));
        }
    }
}
