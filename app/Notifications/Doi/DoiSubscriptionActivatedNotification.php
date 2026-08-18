<?php

namespace App\Notifications\Doi;

use App\Models\DoiPaymentProof;
use App\Models\DoiSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DoiSubscriptionActivatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public DoiSubscription $subscription,
        public ?DoiPaymentProof $paymentProof = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $packageName = $this->subscription->package?->name ?? 'DOI Subscription';
        $startDate = $this->subscription->start_date?->format('d M Y') ?? '-';
        $endDate = $this->subscription->end_date?->format('d M Y') ?? '-';

        return (new MailMessage)
            ->subject('Langganan DOI Berhasil Diaktifkan')
            ->greeting('Halo,')
            ->line('Selamat! Langganan DOI Anda telah resmi diaktifkan.')
            ->line('Paket: '.$packageName)
            ->line('Masa Berlaku: '.$startDate.' s/d '.$endDate)
            ->line('Total Kuota Similarity: '.number_format($this->subscription->similarity_quota_total))
            ->action('Lihat Dashboard DOI', route('user.doi.subscriptions.index'))
            ->line('Terima kasih telah menggunakan layanan kami.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'subscription_id' => $this->subscription->id,
            'payment_proof_id' => $this->paymentProof?->id,
            'package_name' => $this->subscription->package?->name,
            'message' => 'Langganan DOI Anda telah berhasil diaktifkan.',
            'action_url' => route('user.doi.subscriptions.index'),
        ];
    }
}
