<?php

namespace Tests\Unit\Doi;

use App\Events\Doi\PaymentProofRejected;
use App\Events\Doi\PaymentProofUploaded;
use App\Events\Doi\SubscriptionActivated;
use App\Models\DoiPaymentProof;
use App\Models\DoiSubscription;
use PHPUnit\Framework\TestCase;

class DoiEventsTest extends TestCase
{
    public function test_payment_proof_uploaded_event_holds_proof_instance(): void
    {
        $proof = new DoiPaymentProof(['id' => 1]);
        $event = new PaymentProofUploaded($proof);

        $this->assertSame($proof, $event->paymentProof);
    }

    public function test_subscription_activated_event_holds_subscription_and_proof(): void
    {
        $subscription = new DoiSubscription(['id' => 10]);
        $proof = new DoiPaymentProof(['id' => 1]);
        $event = new SubscriptionActivated($subscription, $proof);

        $this->assertSame($subscription, $event->subscription);
        $this->assertSame($proof, $event->paymentProof);
    }

    public function test_payment_proof_rejected_event_holds_proof_instance(): void
    {
        $proof = new DoiPaymentProof(['id' => 1]);
        $event = new PaymentProofRejected($proof);

        $this->assertSame($proof, $event->paymentProof);
    }
}
