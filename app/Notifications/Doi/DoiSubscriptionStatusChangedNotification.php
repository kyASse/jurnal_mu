<?php

namespace App\Notifications\Doi;

use App\Models\DoiSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DoiSubscriptionStatusChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public DoiSubscription $subscription,
        public string $oldStatus = '',
        public string $newStatus = ''
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $packageName = $this->subscription->package?->name ?? 'DOI Subscription';

        return (new MailMessage)
            ->subject('Perubahan Status Langganan DOI')
            ->greeting('Halo,')
            ->line('Status langganan DOI Anda (Paket: '.$packageName.') telah berubah dari "'.$this->oldStatus.'" menjadi "'.$this->newStatus.'".')
            ->action('Lihat Detail Langganan', route('user.doi.subscriptions.index'))
            ->line('Jika Anda memiliki pertanyaan, silakan hubungi tim dukungan kami.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'subscription_id' => $this->subscription->id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'message' => 'Status langganan DOI Anda telah berubah menjadi '.$this->newStatus.'.',
            'action_url' => route('user.doi.subscriptions.index'),
        ];
    }
}
