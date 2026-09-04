<?php

namespace App\Listeners\Doi;

use App\Events\Doi\PaymentProofRejected;
use App\Notifications\Doi\DoiPaymentProofRejectedNotification;

class SendPaymentProofRejectedNotification
{
    /**
     * Handle the event.
     */
    public function handle(PaymentProofRejected $event): void
    {
        $user = $event->paymentProof->user
            ?? $event->paymentProof->invoice?->user;

        if ($user) {
            $user->notify(new DoiPaymentProofRejectedNotification(
                $event->paymentProof,
                $event->paymentProof->admin_notes
            ));
        }
    }
}
