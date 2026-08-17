<?php

namespace App\Actions\Doi;

use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\SubscriptionStatus;
use App\Events\Doi\PaymentProofUploaded;
use App\Models\DoiInvoice;
use App\Models\DoiPaymentProof;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class StorePaymentProofAction
{
    /**
     * Allowed mime types for payment proof files.
     */
    protected array $allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
    ];

    /**
     * Max file size in bytes (5 MB).
     */
    protected int $maxFileSizeBytes = 5 * 1024 * 1024;

    /**
     * Store payment proof and update invoice status.
     *
     * @param  DoiInvoice  $invoice
     * @param  UploadedFile  $file
     * @param  array  $data
     * @param  User|null  $user
     * @return DoiPaymentProof
     *
     * @throws ValidationException
     */
    public function execute(
        DoiInvoice $invoice,
        UploadedFile $file,
        array $data,
        ?User $user = null
    ): DoiPaymentProof {
        $this->validateFile($file);

        return DB::transaction(function () use ($invoice, $file, $data, $user) {
            $folder = 'proofs/' . Carbon::now()->format('Y/m');
            Storage::disk('doi_proofs')->makeDirectory($folder);
            $storedPath = $file->store($folder, 'doi_proofs');

            $userId = $user?->id ?? auth()->id() ?? $invoice->user_id;

            $proof = DoiPaymentProof::create([
                'invoice_id' => $invoice->id,
                'user_id' => $userId,
                'bank_sender' => $data['bank_sender'] ?? '',
                'account_name' => $data['account_name'] ?? '',
                'bank_destination_id' => $data['bank_destination_id'] ?? null,
                'transfer_amount' => $data['transfer_amount'] ?? $invoice->total_amount,
                'transfer_date' => $data['transfer_date'] ?? Carbon::now()->toDateString(),
                'file_path' => $storedPath,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => PaymentProofStatus::PENDING,
            ]);

            $invoice->update([
                'status' => InvoiceStatus::PENDING_VERIFICATION,
            ]);

            if ($invoice->subscription && in_array($invoice->subscription->status, [SubscriptionStatus::INACTIVE, SubscriptionStatus::EXPIRED])) {
                $invoice->subscription->update([
                    'status' => SubscriptionStatus::PENDING_VERIFICATION,
                ]);
            }

            PaymentProofUploaded::dispatch($proof);

            return $proof->load('invoice', 'user', 'bankDestination');
        });
    }

    /**
     * Validate uploaded file mime and size.
     *
     * @param  UploadedFile  $file
     * @throws ValidationException
     */
    protected function validateFile(UploadedFile $file): void
    {
        $mime = $file->getMimeType();
        $size = $file->getSize();

        if (! in_array($mime, $this->allowedMimeTypes)) {
            throw ValidationException::withMessages([
                'payment_proof' => ['Format file tidak didukung. Unggah file gambar (JPG, PNG, WEBP) atau PDF.'],
            ]);
        }

        if ($size > $this->maxFileSizeBytes) {
            throw ValidationException::withMessages([
                'payment_proof' => ['Ukuran file melebihi batas maksimum 5 MB.'],
            ]);
        }
    }
}
