<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LppmRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public User $lppm,
        public string $reason
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('[Journal MU] Registrasi Admin LPPM Ditolak')
            ->markdown('emails.lppm-rejected', [
                'lppm' => $this->lppm,
                'reason' => $this->reason,
                'url' => route('login'),
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'user_id' => $this->lppm->id,
            'user_name' => $this->lppm->name,
            'reason' => $this->reason,
            'message' => "Maaf, registrasi Admin LPPM Anda ditolak karena: {$this->reason}.",
            'action_url' => route('login'),
        ];
    }
}
