<?php

namespace App\Notifications;

use App\Models\Journal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JournalReassignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @param  string  $type  Either 'assigned' (new manager) or 'removed' (old manager)
     */
    public function __construct(
        public Journal $journal,
        public string $type
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
        $isAssigned = $this->type === 'assigned';

        return (new MailMessage)
            ->subject($isAssigned
                ? '[Journal MU] Jurnal Baru Ditugaskan kepada Anda'
                : '[Journal MU] Pengelolaan Jurnal Dipindahkan'
            )
            ->markdown('emails.journal-reassigned', [
                'journal' => $this->journal,
                'type' => $this->type,
                'url' => $isAssigned
                    ? route('user.journals.show', $this->journal->id)
                    : route('user.journals.index'),
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $isAssigned = $this->type === 'assigned';

        return [
            'journal_id' => $this->journal->id,
            'journal_title' => $this->journal->title,
            'type' => $this->type,
            'message' => $isAssigned
                ? "Jurnal \"{$this->journal->title}\" telah ditugaskan kepada Anda."
                : "Pengelolaan jurnal \"{$this->journal->title}\" telah dipindahkan ke pengelola lain.",
            'action_url' => $isAssigned
                ? route('user.journals.show', $this->journal->id)
                : route('user.journals.index'),
        ];
    }
}
