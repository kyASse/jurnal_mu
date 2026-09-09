<?php

namespace App\Events\Doi;

use App\Models\DoiPaymentProof;
use App\Models\DoiSubscription;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SubscriptionActivated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public DoiSubscription $subscription,
        public ?DoiPaymentProof $paymentProof = null
    ) {}
}
