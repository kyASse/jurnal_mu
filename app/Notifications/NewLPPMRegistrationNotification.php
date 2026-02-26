<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewLPPMRegistrationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * Sent to all Super Admins when a new LPPM Admin registers.
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
            ->subject('[Journal MU] Pendaftaran LPPM Baru Menunggu Persetujuan')
            ->markdown('emails.new-lppm-registration', [
                'applicant' => $this->applicant,
                'url' => route('admin.admin-kampus.index'),
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
            'message' => "Pendaftar LPPM baru \"{$this->applicant->name}\" menunggu persetujuan Anda.",
            'action_url' => route('admin.admin-kampus.index'),
        ];
    }
}
