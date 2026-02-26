<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LppmApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public User $lppm
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
            ->subject('[Journal MU] Registrasi Admin LPPM Anda Disetujui')
            ->markdown('emails.lppm-approved', [
                'lppm' => $this->lppm,
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
            'message' => 'Registrasi Admin LPPM Anda telah disetujui. Anda sekarang dapat login sebagai Admin Kampus.',
            'action_url' => route('login'),
        ];
    }
}
