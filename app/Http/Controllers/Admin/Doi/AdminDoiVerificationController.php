<?php

namespace App\Http\Controllers\Admin\Doi;

use App\Actions\Doi\VerifyPaymentProofAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Doi\Admin\VerifyPaymentProofRequest;
use App\Models\DoiPaymentProof;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminDoiVerificationController extends Controller
{
    /**
     * Approve payment proof and activate subscription.
     */
    public function approve(
        VerifyPaymentProofRequest $request,
        DoiPaymentProof $paymentProof,
        VerifyPaymentProofAction $action
    ): RedirectResponse {
        $action->execute(
            $paymentProof,
            true,
            $request->input('admin_notes'),
            $request->user()
        );

        return back()->with('success', 'Bukti pembayaran berhasil diverifikasi dan disetujui.');
    }

    /**
     * Reject payment proof with admin notes.
     */
    public function reject(
        VerifyPaymentProofRequest $request,
        DoiPaymentProof $paymentProof,
        VerifyPaymentProofAction $action
    ): RedirectResponse {
        $action->execute(
            $paymentProof,
            false,
            $request->input('admin_notes'),
            $request->user()
        );

        return back()->with('success', 'Bukti pembayaran berhasil ditolak.');
    }

    /**
     * Stream or preview the payment proof file.
     */
    public function stream(DoiPaymentProof $paymentProof): StreamedResponse
    {
        $this->authorize('view', $paymentProof);

        if (! Storage::disk('doi_proofs')->exists($paymentProof->file_path)) {
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
