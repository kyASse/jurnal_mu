<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public User $applicant,
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
            ->subject('[Journal MU] Pendaftaran Akun Ditolak')
            ->markdown('emails.user-rejected', [
                'applicant' => $this->applicant,
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
            'user_id' => $this->applicant->id,
            'user_name' => $this->applicant->name,
            'reason' => $this->reason,
            'message' => "Maaf, pendaftaran akun Anda ditolak karena: {$this->reason}. Silakan periksa kembali dan ajukan ulang jika sudah diperbaiki.",
            'action_url' => route('login'),
        ];
    }
}
