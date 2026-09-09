<?php

namespace App\Notifications\Doi;

use App\Models\DoiPaymentProof;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DoiPaymentProofUploadedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public DoiPaymentProof $paymentProof
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $invoiceNumber = $this->paymentProof->invoice?->invoice_number ?? 'N/A';
        $amount = number_format((float) $this->paymentProof->transfer_amount, 0, ',', '.');

        return (new MailMessage)
            ->subject('Bukti Pembayaran DOI Diunggah - Invoice #'.$invoiceNumber)
            ->greeting('Halo Admin,')
            ->line('Bukti pembayaran baru telah diunggah untuk Invoice #'.$invoiceNumber.'.')
            ->line('Jumlah Transfer: Rp '.$amount)
            ->line('Pengirim: '.$this->paymentProof->account_name.' ('.$this->paymentProof->bank_sender.')')
            ->action('Verifikasi Pembayaran', route('admin.doi.verifications.index'))
            ->line('Silakan lakukan verifikasi terhadap pembayaran tersebut.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'payment_proof_id' => $this->paymentProof->id,
            'invoice_id' => $this->paymentProof->invoice_id,
            'invoice_number' => $this->paymentProof->invoice?->invoice_number,
            'amount' => $this->paymentProof->transfer_amount,
            'message' => 'Bukti pembayaran baru diunggah untuk Invoice #'.($this->paymentProof->invoice?->invoice_number ?? ''),
            'action_url' => route('admin.doi.verifications.index'),
        ];
    }
}
