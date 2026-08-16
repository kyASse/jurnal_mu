<?php

namespace App\Actions\Doi;

use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\QuotaChangeType;
use App\Enums\Doi\SubscriptionStatus;
use App\Events\Doi\PaymentProofRejected;
use App\Events\Doi\SubscriptionActivated;
use App\Models\DoiPaymentProof;
use App\Models\DoiSimilarityQuotaLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class VerifyPaymentProofAction
{
    /**
     * Verify payment proof (approve or reject) and update related invoice and subscription.
     *
     * @param  DoiPaymentProof  $proof
     * @param  bool  $isApproved
     * @param  string|null  $adminNotes
     * @param  User|null  $verifier
     * @return DoiPaymentProof
     */
    public function execute(
        DoiPaymentProof $proof,
        bool $isApproved,
        ?string $adminNotes = null,
        ?User $verifier = null
    ): DoiPaymentProof {
        return DB::transaction(function () use ($proof, $isApproved, $adminNotes, $verifier) {
            /** @var DoiPaymentProof $lockedProof */
            $lockedProof = DoiPaymentProof::where('id', $proof->id)
                ->lockForUpdate()
                ->firstOrFail();

            $verifierId = $verifier?->id ?? auth()->id();
            $now = Carbon::now();

            $invoice = $lockedProof->invoice()->lockForUpdate()->firstOrFail();
            $subscription = $invoice->subscription ? $invoice->subscription()->lockForUpdate()->first() : null;

            if ($isApproved) {
                $lockedProof->update([
                    'status' => PaymentProofStatus::APPROVED,
                    'verified_by' => $verifierId,
                    'verified_at' => $now,
                    'admin_notes' => $adminNotes,
                ]);

                $invoice->update([
                    'status' => InvoiceStatus::PAID,
                    'paid_at' => $now,
                ]);

                if ($subscription) {
                    $startDate = $subscription->start_date ? Carbon::parse($subscription->start_date) : $now->copy();
                    $currentEndDate = $subscription->end_date ? Carbon::parse($subscription->end_date) : null;

                    if (! $subscription->start_date || $subscription->status === SubscriptionStatus::EXPIRED) {
                        $startDate = $now->copy();
                        $newEndDate = $startDate->copy()->addYear();
                    } elseif ($currentEndDate && $currentEndDate->isFuture()) {
                        $newEndDate = $currentEndDate->copy()->addYear();
                    } else {
                        $newEndDate = $now->copy()->addYear();
                    }

                    $package = $subscription->package;
                    $quotaToAdd = (int) ($package?->similarity_quota_included ?? 0);

                    $isRenewal = $subscription->status === SubscriptionStatus::ACTIVE || $subscription->similarity_quota_total > 0;
                    $newQuotaTotal = (int) $subscription->similarity_quota_total + $quotaToAdd;

                    $subscription->update([
                        'status' => SubscriptionStatus::ACTIVE,
                        'start_date' => $startDate->toDateString(),
                        'end_date' => $newEndDate->toDateString(),
                        'similarity_quota_total' => $newQuotaTotal,
                    ]);

                    if ($quotaToAdd > 0) {
                        DoiSimilarityQuotaLog::create([
                            'subscription_id' => $subscription->id,
                            'journal_id' => $subscription->journal_id,
                            'user_id' => $verifierId,
                            'change_type' => $isRenewal ? QuotaChangeType::RENEWAL : QuotaChangeType::ALLOCATION,
                            'amount' => $quotaToAdd,
                            'balance_after' => $newQuotaTotal,
                            'description' => "Aktivasi langganan via pembayaran invoice #{$invoice->invoice_number}",
                        ]);
                    }

                    SubscriptionActivated::dispatch($subscription, $lockedProof);
                }
            } else {
                $lockedProof->update([
                    'status' => PaymentProofStatus::REJECTED,
                    'verified_by' => $verifierId,
                    'verified_at' => $now,
                    'admin_notes' => $adminNotes,
                ]);

                $invoice->update([
                    'status' => InvoiceStatus::UNPAID,
                    'paid_at' => null,
                ]);

                if ($subscription && $subscription->status === SubscriptionStatus::PENDING_VERIFICATION) {
                    $subscription->update([
                        'status' => SubscriptionStatus::INACTIVE,
                    ]);
                }

                PaymentProofRejected::dispatch($lockedProof);
            }

            return $lockedProof->fresh(['invoice', 'user', 'bankDestination', 'verifier']);
        });
    }
}
