<?php

namespace App\Notifications;

use App\Models\JournalAssessment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReviewerAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public JournalAssessment $assessment
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
            ->subject('[Journal MU] Anda Ditugaskan sebagai Reviewer')
            ->markdown('emails.reviewer-assigned', [
                'assessment' => $this->assessment,
                'url' => route('reviewer.assignments.index'),
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
            'assessment_id' => $this->assessment->id,
            'journal_title' => $this->assessment->journal->title,
            'message' => "Anda ditugaskan sebagai reviewer untuk jurnal \"{$this->assessment->journal->title}\".",
            'action_url' => route('reviewer.assignments.index'),
        ];
    }
}
