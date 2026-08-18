<?php

namespace App\Http\Controllers\AdminKampus;

use App\Actions\Doi\GenerateInvoiceAction;
use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Doi\SubscribeDoiPackageRequest;
use App\Models\DoiInvoice;
use App\Models\DoiPackage;
use App\Models\DoiSimilarityQuotaLog;
use App\Models\DoiSubscription;
use App\Models\Journal;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoiSubscriptionController extends Controller
{
    /**
     * Subscribe institutional university to a DOI package and generate invoice.
     */
    public function subscribe(
        SubscribeDoiPackageRequest $request,
        GenerateInvoiceAction $generateInvoiceAction
    ): RedirectResponse {
        $user = $request->user();
        $universityId = $user->university_id;
        $packageId = (int) $request->validated('package_id');
        $package = DoiPackage::findOrFail($packageId);

        // Check if university already has an active unpaid or pending verification invoice
        $existingInvoice = DoiInvoice::where('university_id', $universityId)
            ->whereIn('status', [InvoiceStatus::UNPAID, InvoiceStatus::PENDING_VERIFICATION])
            ->latest('id')
            ->first();

        if ($existingInvoice) {
            return redirect()
                ->route('admin-kampus.doi.invoices.index', [
                    'invoice_id' => $existingInvoice->id,
                    'action' => 'pay',
                ])
                ->with('warning', 'Anda sudah memiliki tagihan aktif yang belum selesai dibayar.');
        }

        $subscription = DoiSubscription::firstOrCreate(
            ['university_id' => $universityId],
            [
                'doi_package_id' => $package->id,
                'status' => SubscriptionStatus::INACTIVE,
            ]
        );

        if ($subscription->doi_package_id !== $package->id) {
            $subscription->doi_package_id = $package->id;
            $subscription->save();
        }

        $subscription->load('package');

        $invoice = $generateInvoiceAction->execute($subscription, $user);

        return redirect()
            ->route('admin-kampus.doi.invoices.index', [
                'invoice_id' => $invoice->id,
                'action' => 'pay',
            ])
            ->with('success', 'Paket berhasil dipilih. Tagihan telah diterbitkan, silakan lakukan konfirmasi pembayaran.');
    }

    /**
     * Display the institutional DOI & Similarity Check subscription dashboard.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('AdminKampus/Doi/Dashboard', $this->getDashboardProps($request));
    }

    /**
     * Prepare dashboard props data for the current user's university.
     *
     * @return array<string, mixed>
     */
    protected function getDashboardProps(Request $request): array
    {
        $user = $request->user();
        $university = $user->university;

        $subscription = DoiSubscription::with('package')
            ->where('university_id', $user->university_id)
            ->latest('id')
            ->first();

        $activeInvoice = null;
        $recentQuotaLogs = [];
        $packages = [];

        if ($subscription) {
            $activeInvoice = DoiInvoice::with(['items', 'latestPaymentProof'])
                ->where('subscription_id', $subscription->id)
                ->whereIn('status', [InvoiceStatus::UNPAID, InvoiceStatus::PENDING_VERIFICATION])
                ->latest('id')
                ->first();

            $recentQuotaLogs = DoiSimilarityQuotaLog::with(['journal', 'user'])
                ->where('subscription_id', $subscription->id)
                ->latest('id')
                ->limit(5)
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'change_type' => $log->change_type->value,
                    'change_type_label' => $log->change_type->label(),
                    'amount' => $log->amount,
                    'balance_after' => $log->balance_after,
                    'description' => $log->description,
                    'created_at' => $log->created_at?->format('d M Y, H:i') ?? '',
                    'journal_title' => $log->journal?->title,
                    'user_name' => $log->user?->name,
                ]);
        } else {
            $packages = DoiPackage::active()->orderBy('price_annual')->get();
        }

        $subscriptionData = null;
        if ($subscription) {
            $now = Carbon::now();
            $endDate = $subscription->end_date ? Carbon::parse($subscription->end_date) : null;
            $daysRemaining = $endDate ? max(0, (int) $now->diffInDays($endDate, false)) : 0;
            $totalQuota = $subscription->similarity_quota_total;
            $usedQuota = $subscription->similarity_quota_used;
            $remainingQuota = $subscription->remaining_quota;
            $quotaPercentage = $totalQuota > 0 ? (int) round(($remainingQuota / $totalQuota) * 100) : 0;

            $subscriptionData = [
                'id' => $subscription->id,
                'status' => $subscription->status->value,
                'status_label' => $subscription->status->label(),
                'status_color' => $subscription->status->color(),
                'start_date' => $subscription->start_date?->format('d M Y'),
                'end_date' => $subscription->end_date?->format('d M Y'),
                'days_remaining' => (int) $daysRemaining,
                'is_expiring_soon' => $subscription->is_expiring_soon,
                'active_prefix' => $subscription->active_prefix,
                'similarity_quota_total' => $totalQuota,
                'similarity_quota_used' => $usedQuota,
                'remaining_quota' => $remainingQuota,
                'quota_percentage' => $quotaPercentage,
                'auto_renew' => (bool) $subscription->auto_renew,
                'package' => $subscription->package ? [
                    'id' => $subscription->package->id,
                    'name' => $subscription->package->name,
                    'code' => $subscription->package->code,
                    'description' => $subscription->package->description,
                    'price_annual' => (float) $subscription->package->price_annual,
                    'similarity_quota_included' => $subscription->package->similarity_quota_included,
                ] : null,
            ];
        }

        $invoiceData = null;
        if ($activeInvoice) {
            $invoiceData = [
                'id' => $activeInvoice->id,
                'invoice_number' => $activeInvoice->invoice_number,
                'total_amount' => (float) $activeInvoice->total_amount,
                'due_date' => $activeInvoice->due_date?->format('d M Y') ?? '',
                'status' => $activeInvoice->status->value,
                'status_label' => $activeInvoice->status->label(),
                'status_color' => $activeInvoice->status->color(),
                'latest_payment_proof' => $activeInvoice->latestPaymentProof ? [
                    'id' => $activeInvoice->latestPaymentProof->id,
                    'status' => $activeInvoice->latestPaymentProof->status->value,
                    'status_label' => $activeInvoice->latestPaymentProof->status->label(),
                    'admin_notes' => $activeInvoice->latestPaymentProof->admin_notes,
                    'created_at' => $activeInvoice->latestPaymentProof->created_at?->format('d M Y, H:i'),
                ] : null,
            ];
        }

        $journalsCount = $user->university_id
            ? Journal::where('university_id', $user->university_id)->count()
            : 0;

        return [
            'subscription' => $subscriptionData,
            'activeInvoice' => $invoiceData,
            'recentQuotaLogs' => $recentQuotaLogs,
            'packages' => $packages,
            'universityName' => $university?->name ?? 'Institusi',
            'journalsCount' => $journalsCount,
        ];
    }
}
