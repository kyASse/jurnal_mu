<?php

namespace App\Services\Doi;

use App\Enums\Doi\QuotaChangeType;
use App\Models\DoiSimilarityQuotaLog;
use App\Models\DoiSubscription;
use App\Models\Journal;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class DoiQuotaManagerService
{
    /**
     * Check if a subscription has sufficient remaining similarity quota.
     *
     * @param DoiSubscription $subscription
     * @param int $required
     * @return bool
     */
    public function hasRemainingQuota(DoiSubscription $subscription, int $required = 1): bool
    {
        if ($required <= 0) {
            return true;
        }

        return $subscription->remaining_quota >= $required;
    }

    /**
     * Deduct similarity quota from a subscription atomically.
     *
     * @param DoiSubscription $subscription
     * @param int $amount
     * @param Journal|null $journal
     * @param User|null $user
     * @param string $description
     * @return DoiSimilarityQuotaLog
     *
     * @throws InvalidArgumentException
     * @throws RuntimeException
     */
    public function deductQuota(
        DoiSubscription $subscription,
        int $amount,
        ?Journal $journal,
        ?User $user,
        string $description
    ): DoiSimilarityQuotaLog {
        if ($amount <= 0) {
            throw new InvalidArgumentException('Jumlah pengurangan kuota harus lebih dari 0.');
        }

        return DB::transaction(function () use ($subscription, $amount, $journal, $user, $description) {
            /** @var DoiSubscription $lockedSubscription */
            $lockedSubscription = DoiSubscription::query()
                ->where('id', $subscription->id)
                ->lockForUpdate()
                ->firstOrFail();

            $remaining = $lockedSubscription->similarity_quota_total - $lockedSubscription->similarity_quota_used;

            if ($remaining < $amount) {
                throw new RuntimeException("Kuota similarity tidak mencukupi. Sisa kuota: {$remaining}, dibutuhkan: {$amount}.");
            }

            $lockedSubscription->similarity_quota_used += $amount;
            $lockedSubscription->save();

            $balanceAfter = $lockedSubscription->similarity_quota_total - $lockedSubscription->similarity_quota_used;

            $log = DoiSimilarityQuotaLog::create([
                'subscription_id' => $lockedSubscription->id,
                'journal_id' => $journal?->id ?? $lockedSubscription->journal_id,
                'user_id' => $user?->id,
                'change_type' => QuotaChangeType::USAGE,
                'amount' => -$amount,
                'balance_after' => $balanceAfter,
                'description' => $description,
            ]);

            $subscription->similarity_quota_used = $lockedSubscription->similarity_quota_used;

            return $log;
        });
    }

    /**
     * Add similarity quota to a subscription atomically.
     *
     * @param DoiSubscription $subscription
     * @param int $amount
     * @param User|null $adminUser
     * @param string $description
     * @param QuotaChangeType $type
     * @return DoiSimilarityQuotaLog
     *
     * @throws InvalidArgumentException
     */
    public function addQuota(
        DoiSubscription $subscription,
        int $amount,
        ?User $adminUser,
        string $description,
        QuotaChangeType $type = QuotaChangeType::ADJUSTMENT
    ): DoiSimilarityQuotaLog {
        if ($amount <= 0) {
            throw new InvalidArgumentException('Jumlah penambahan kuota harus lebih dari 0.');
        }

        return DB::transaction(function () use ($subscription, $amount, $adminUser, $description, $type) {
            /** @var DoiSubscription $lockedSubscription */
            $lockedSubscription = DoiSubscription::query()
                ->where('id', $subscription->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedSubscription->similarity_quota_total += $amount;
            $lockedSubscription->save();

            $balanceAfter = $lockedSubscription->similarity_quota_total - $lockedSubscription->similarity_quota_used;

            $log = DoiSimilarityQuotaLog::create([
                'subscription_id' => $lockedSubscription->id,
                'journal_id' => $lockedSubscription->journal_id,
                'user_id' => $adminUser?->id,
                'change_type' => $type,
                'amount' => $amount,
                'balance_after' => $balanceAfter,
                'description' => $description,
            ]);

            $subscription->similarity_quota_total = $lockedSubscription->similarity_quota_total;

            return $log;
        });
    }
}
