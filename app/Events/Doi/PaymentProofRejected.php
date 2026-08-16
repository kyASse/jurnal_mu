<?php

namespace App\Events\Doi;

use App\Models\DoiPaymentProof;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentProofRejected
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public DoiPaymentProof $paymentProof
    ) {}
}
