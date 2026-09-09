<?php

namespace App\Notifications\Doi;

use App\Models\DoiInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DoiInvoiceDueReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public DoiInvoice $invoice,
        public int $daysRemaining = 3
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $amount = number_format((float) $this->invoice->total_amount, 0, ',', '.');
        $dueDate = $this->invoice->due_date?->format('d M Y') ?? '-';

        return (new MailMessage)
            ->subject('Pengingat Jatuh Tempo Invoice DOI - #'.$this->invoice->invoice_number)
            ->greeting('Halo,')
            ->line('Ini adalah pengingat bahwa Invoice DOI #'.$this->invoice->invoice_number.' akan jatuh tempo dalam '.$this->daysRemaining.' hari.')
            ->line('Total Tagihan: Rp '.$amount)
            ->line('Tanggal Jatuh Tempo: '.$dueDate)
            ->action('Bayar Sekarang', route('user.doi.invoices.index'))
            ->line('Segera lakukan pembayaran dan unggah bukti transfer sebelum tanggal jatuh tempo.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'invoice_id' => $this->invoice->id,
            'invoice_number' => $this->invoice->invoice_number,
            'days_remaining' => $this->daysRemaining,
            'due_date' => $this->invoice->due_date?->format('Y-m-d'),
            'message' => 'Invoice #'.$this->invoice->invoice_number.' akan jatuh tempo dalam '.$this->daysRemaining.' hari.',
            'action_url' => route('user.doi.invoices.index'),
        ];
    }
}
