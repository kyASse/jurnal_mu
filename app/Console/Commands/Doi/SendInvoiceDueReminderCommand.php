<?php

namespace App\Console\Commands\Doi;

use App\Enums\Doi\InvoiceStatus;
use App\Models\DoiInvoice;
use App\Notifications\Doi\DoiInvoiceDueReminderNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendInvoiceDueReminderCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'doi:send-due-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send due date reminders for unpaid DOI invoices';

    /**
     * Target intervals in days before due date.
     * H-30 (30), H-14 (14), H-7 (7), H-1 (1), H-0 (0)
     *
     * @var array<int>
     */
    protected array $targetIntervals = [30, 14, 7, 1, 0];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today();
        $invoices = DoiInvoice::where('status', InvoiceStatus::UNPAID)
            ->whereNotNull('due_date')
            ->get();

        $sentCount = 0;

        foreach ($invoices as $invoice) {
            $dueDate = Carbon::parse($invoice->due_date)->startOfDay();
            $daysRemaining = (int) $today->diffInDays($dueDate, false);

            if (in_array($daysRemaining, $this->targetIntervals, true) || $daysRemaining < 0) {
                $this->notifyUsers($invoice, $daysRemaining);
                $sentCount++;
            }
        }

        $summary = "Processed DOI unpaid invoice due reminders: {$sentCount} notification(s) sent.";
        $this->info($summary);
        Log::info($summary);

        return self::SUCCESS;
    }

    /**
     * Send due reminder notification to associated users
     */
    protected function notifyUsers(DoiInvoice $invoice, int $daysRemaining): void
    {
        $recipients = collect();

        if ($invoice->user) {
            $recipients->push($invoice->user);
        }

        if ($invoice->university) {
            foreach ($invoice->university->users as $user) {
                $recipients->push($user);
            }
        }

        $recipients = $recipients->unique('id');

        foreach ($recipients as $recipient) {
            $recipient->notify(new DoiInvoiceDueReminderNotification($invoice, $daysRemaining));
        }
    }
}
