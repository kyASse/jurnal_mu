<?php

namespace App\Notifications\Doi;

use App\Models\DoiPaymentProof;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DoiPaymentProofRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public ?string $adminNotes;

    public function __construct(
        public DoiPaymentProof $paymentProof,
        ?string $adminNotes = null
    ) {
        $this->adminNotes = $adminNotes ?? $paymentProof->admin_notes;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $invoiceNumber = $this->paymentProof->invoice?->invoice_number ?? 'N/A';
        $notes = $this->adminNotes ?? 'Tidak ada catatan khusus.';

        return (new MailMessage)
            ->subject('Bukti Pembayaran DOI Ditolak - Invoice #'.$invoiceNumber)
            ->greeting('Halo,')
            ->line('Mohon maaf, bukti pembayaran Anda untuk Invoice #'.$invoiceNumber.' telah ditolak.')
            ->line('Catatan Admin: '.$notes)
            ->action('Unggah Ulang Bukti Pembayaran', route('user.doi.invoices.index'))
            ->line('Silakan periksa kembali dan unggah bukti pembayaran yang valid.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'payment_proof_id' => $this->paymentProof->id,
            'invoice_id' => $this->paymentProof->invoice_id,
            'admin_notes' => $this->adminNotes,
            'message' => 'Bukti pembayaran Anda ditolak. Catatan: '.($this->adminNotes ?? '-'),
            'action_url' => route('user.doi.invoices.index'),
        ];
    }
}
