<?php

namespace App\Listeners\Doi;

use App\Events\Doi\PaymentProofUploaded;
use App\Models\User;
use App\Notifications\Doi\DoiPaymentProofUploadedNotification;
use Illuminate\Support\Facades\Notification;

class SendPaymentProofUploadedNotification
{
    /**
     * Handle the event.
     */
    public function handle(PaymentProofUploaded $event): void
    {
        $superAdmins = User::superAdmins()->get();

        if ($superAdmins->isNotEmpty()) {
            Notification::send($superAdmins, new DoiPaymentProofUploadedNotification($event->paymentProof));
        }
    }
}
