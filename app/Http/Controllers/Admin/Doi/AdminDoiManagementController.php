<?php

namespace App\Http\Controllers\Admin\Doi;

use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Doi\Admin\DoiSettingRequest;
use App\Models\DoiBankAccount;
use App\Models\DoiInvoice;
use App\Models\DoiPackage;
use App\Models\DoiPaymentProof;
use App\Models\DoiSetting;
use App\Models\DoiSubscription;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminDoiManagementController extends Controller
{
    /**
     * Display the DOI management dashboard for Super Admin.
     */
    public function index(): Response
    {
        $stats = [
            'total_subscriptions' => DoiSubscription::count(),
            'active_subscriptions' => DoiSubscription::where('status', SubscriptionStatus::ACTIVE)->count(),
            'pending_proofs_count' => DoiPaymentProof::where('status', PaymentProofStatus::PENDING)->count(),
            'total_revenue' => (float) DoiInvoice::where('status', InvoiceStatus::PAID)->sum('total_amount'),
        ];

        $pendingProofs = DoiPaymentProof::with([
            'invoice.university',
            'invoice.subscription.package',
            'user',
            'bankDestination',
        ])
            ->pending()
            ->latest()
            ->get();

        $subscriptions = DoiSubscription::with([
            'university',
            'journal',
            'package',
            'invoices' => fn ($q) => $q->latest()->limit(5),
            'quotaLogs' => fn ($q) => $q->latest()->limit(5),
        ])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $packages = DoiPackage::withCount('subscriptions')->ordered()->get();

        $bankAccounts = DoiBankAccount::orderBy('display_order')->get();

        $doiSettings = DoiSetting::getAllAsMap();

        return Inertia::render('Admin/Doi/Index', [
            'stats' => $stats,
            'pendingProofs' => $pendingProofs,
            'subscriptions' => $subscriptions,
            'packages' => $packages,
            'bankAccounts' => $bankAccounts,
            'doiSettings' => $doiSettings,
        ]);
    }

    /**
     * Update DOI helpdesk settings.
     */
    public function updateSettings(DoiSettingRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            DoiSetting::set($key, $value, 'string', 'helpdesk');
        }

        return back()->with('success', 'Pengaturan helpdesk DOI berhasil diperbarui.');
    }
}
