<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\DoiBankAccount;
use App\Models\DoiInvoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoiInvoiceController extends Controller
{
    /**
     * Display a listing of invoices for the current user's university.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = DoiInvoice::with(['subscription.package', 'items', 'latestPaymentProof.bankDestination'])
            ->where('university_id', $user->university_id);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where('invoice_number', 'like', "%{$search}%");
        }

        $invoices = $query->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($invoice) => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'subtotal' => (float) $invoice->subtotal,
                'discount' => (float) $invoice->discount,
                'tax' => (float) $invoice->tax,
                'total_amount' => (float) $invoice->total_amount,
                'due_date' => $invoice->due_date?->format('d M Y'),
                'paid_at' => $invoice->paid_at?->format('d M Y, H:i'),
                'status' => $invoice->status->value,
                'status_label' => $invoice->status->label(),
                'status_color' => $invoice->status->color(),
                'period_start' => $invoice->period_start?->format('d M Y'),
                'period_end' => $invoice->period_end?->format('d M Y'),
                'package_name' => $invoice->subscription?->package?->name,
                'items_count' => $invoice->items->count(),
                'latest_payment_proof' => $invoice->latestPaymentProof ? [
                    'id' => $invoice->latestPaymentProof->id,
                    'status' => $invoice->latestPaymentProof->status->value,
                    'status_label' => $invoice->latestPaymentProof->status->label(),
                    'admin_notes' => $invoice->latestPaymentProof->admin_notes,
                    'created_at' => $invoice->latestPaymentProof->created_at?->format('d M Y, H:i'),
                ] : null,
            ]);

        $bankAccounts = DoiBankAccount::active()->get()->map(fn ($bank) => [
            'id' => $bank->id,
            'bank_name' => $bank->bank_name,
            'account_number' => $bank->account_number,
            'account_holder' => $bank->account_holder,
            'branch' => $bank->branch,
            'qr_code_path' => $bank->qr_code_path,
        ]);

        return Inertia::render('AdminKampus/Doi/Invoices/Index', [
            'invoices' => $invoices,
            'bankAccounts' => $bankAccounts,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Display the specified invoice details.
     */
    public function show(Request $request, DoiInvoice $invoice): Response
    {
        $this->authorize('view', $invoice);

        $invoice->load(['subscription.package', 'items', 'paymentProofs.bankDestination', 'university', 'user']);

        $bankAccounts = DoiBankAccount::active()->get()->map(fn ($bank) => [
            'id' => $bank->id,
            'bank_name' => $bank->bank_name,
            'account_number' => $bank->account_number,
            'account_holder' => $bank->account_holder,
            'branch' => $bank->branch,
            'qr_code_path' => $bank->qr_code_path,
        ]);

        return Inertia::render('AdminKampus/Doi/Invoices/Show', [
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'subtotal' => (float) $invoice->subtotal,
                'discount' => (float) $invoice->discount,
                'tax' => (float) $invoice->tax,
                'total_amount' => (float) $invoice->total_amount,
                'due_date' => $invoice->due_date?->format('d M Y'),
                'paid_at' => $invoice->paid_at?->format('d M Y, H:i'),
                'status' => $invoice->status->value,
                'status_label' => $invoice->status->label(),
                'status_color' => $invoice->status->color(),
                'period_start' => $invoice->period_start?->format('d M Y'),
                'period_end' => $invoice->period_end?->format('d M Y'),
                'package' => $invoice->subscription?->package ? [
                    'name' => $invoice->subscription->package->name,
                    'code' => $invoice->subscription->package->code,
                ] : null,
                'items' => $invoice->items->map(fn ($item) => [
                    'id' => $item->id,
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'total_price' => (float) $item->total_price,
                ]),
                'payment_proofs' => $invoice->paymentProofs->map(fn ($proof) => [
                    'id' => $proof->id,
                    'bank_sender' => $proof->bank_sender,
                    'account_name' => $proof->account_name,
                    'bank_destination' => $proof->bankDestination?->bank_name,
                    'transfer_amount' => (float) $proof->transfer_amount,
                    'transfer_date' => $proof->transfer_date?->format('d M Y'),
                    'file_name' => $proof->file_name,
                    'status' => $proof->status->value,
                    'status_label' => $proof->status->label(),
                    'admin_notes' => $proof->admin_notes,
                    'created_at' => $proof->created_at?->format('d M Y, H:i'),
                ]),
                'university_name' => $invoice->university?->name,
            ],
            'bankAccounts' => $bankAccounts,
        ]);
    }
}
