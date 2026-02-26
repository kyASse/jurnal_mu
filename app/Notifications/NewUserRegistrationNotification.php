<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewUserRegistrationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * Sent to all active Admin Kampus at the same university when a new User registers.
     */
    public function __construct(
        public User $applicant
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
            ->subject('[Journal MU] Pengelola Jurnal Baru Menunggu Persetujuan')
            ->markdown('emails.new-user-registration', [
                'applicant' => $this->applicant,
                'url' => route('admin-kampus.users.pending'),
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
            'applicant_id' => $this->applicant->id,
            'applicant_name' => $this->applicant->name,
            'university_id' => $this->applicant->university_id,
            'message' => "Pengelola jurnal baru \"{$this->applicant->name}\" menunggu persetujuan Anda.",
            'action_url' => route('admin-kampus.users.pending'),
        ];
    }
}
