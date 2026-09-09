<?php

namespace App\Http\Controllers\AdminKampus;

use App\Actions\Doi\StorePaymentProofAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Doi\StorePaymentProofRequest;
use App\Models\DoiInvoice;
use App\Models\DoiPaymentProof;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DoiPaymentProofController extends Controller
{
    /**
     * Store a newly uploaded payment proof for an invoice.
     */
    public function store(
        StorePaymentProofRequest $request,
        DoiInvoice $invoice,
        StorePaymentProofAction $action
    ): RedirectResponse {
        $validated = $request->validated();

        $action->execute(
            $invoice,
            $request->file('payment_proof'),
            $validated,
            $request->user()
        );

        return back()->with('success', 'Bukti pembayaran berhasil diunggah dan sedang menunggu verifikasi.');
    }

    /**
     * Stream or download the payment proof file.
     */
    public function show(DoiPaymentProof $paymentProof): StreamedResponse
    {
        $this->authorize('view', $paymentProof);

        if (!Storage::disk('doi_proofs')->exists($paymentProof->file_path)) {
            abort(404, 'File bukti pembayaran tidak ditemukan.');
        }

        return Storage::disk('doi_proofs')->response(
            $paymentProof->file_path,
            $paymentProof->file_name,
            [
                'Content-Type' => $paymentProof->mime_type ?? 'application/octet-stream',
            ]
        );
    }
}
