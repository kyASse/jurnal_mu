<?php

namespace App\Notifications;

use App\Models\Journal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JournalRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Journal $journal,
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
            ->subject('[Journal MU] Pengajuan Jurnal Ditolak')
            ->markdown('emails.journal-rejected', [
                'journal' => $this->journal,
                'reason' => $this->reason,
                'url' => route('user.journals.show', $this->journal->id),
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
            'journal_id' => $this->journal->id,
            'journal_title' => $this->journal->title,
            'reason' => $this->reason,
            'message' => "Pengajuan jurnal \"{$this->journal->title}\" ditolak karena: {$this->reason}. Silakan periksa kembali dan ajukan ulang jika sudah diperbaiki.",
            'action_url' => route('user.journals.show', $this->journal->id),
        ];
    }
}
