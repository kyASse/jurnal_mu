<?php

namespace App\Http\Controllers\Admin\Doi;

use App\Enums\Doi\QuotaChangeType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Doi\Admin\AdjustQuotaRequest;
use App\Models\DoiSubscription;
use App\Services\Doi\DoiQuotaManagerService;
use Illuminate\Http\RedirectResponse;

class AdminDoiSubscriptionController extends Controller
{
    /**
     * Adjust similarity quota for a subscription and log to audit trail.
     */
    public function adjustQuota(
        AdjustQuotaRequest $request,
        DoiSubscription $subscription,
        DoiQuotaManagerService $quotaManager
    ): RedirectResponse {
        $amount = (int) $request->input('amount');
        $description = $request->input('description');
        $changeType = $request->has('change_type') && $request->input('change_type')
            ? QuotaChangeType::from($request->input('change_type'))
            : QuotaChangeType::ADJUSTMENT;

        $quotaManager->addQuota(
            $subscription,
            $amount,
            $request->user(),
            $description,
            $changeType
        );

        return back()->with('success', "Kuota similarity sebanyak {$amount} berhasil ditambahkan ke langganan.");
    }
}
