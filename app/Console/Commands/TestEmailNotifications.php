<?php

namespace App\Console\Commands;

use App\Models\Journal;
use App\Models\JournalAssessment;
use App\Models\User;
use App\Notifications\AssessmentApprovedNotification;
use App\Notifications\AssessmentRevisionRequestedNotification;
use App\Notifications\JournalApprovedNotification;
use App\Notifications\JournalRejectedNotification;
use App\Notifications\JournalReassignedNotification;
use App\Notifications\LppmApprovedNotification;
use App\Notifications\LppmRejectedNotification;
use App\Notifications\NewLPPMRegistrationNotification;
use App\Notifications\NewUserRegistrationNotification;
use App\Notifications\ReviewerAssignedNotification;
use App\Notifications\UserApprovedNotification;
use App\Notifications\UserRejectedNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class TestEmailNotifications extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'notification:test
                            {--email= : Override recipient email address (default: user in DB)}
                            {--type= : Send only specific type (e.g. user-approved, journal-rejected)}
                            {--mail-only : Skip database channel, send mail only}
                            {--cleanup : Delete test journal/assessment records after sending}';

    /**
     * The console command description.
     */
    protected $description = 'Test all email notifications by sending them synchronously to Mailtrap';

    private User $testUser;

    private Journal $testJournal;

    private JournalAssessment $testAssessment;

    private bool $createdJournal = false;

    private bool $createdAssessment = false;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('=== Email Notification Test — Jurnal MU ===');
        $this->newLine();

        // ── 1. Setup test user ────────────────────────────────────────────
        $this->testUser = User::first();

        if (! $this->testUser) {
            $this->error('No user found in database. Please run db:seed first.');

            return self::FAILURE;
        }

        // Override email if requested
        if ($email = $this->option('email')) {
            $this->testUser->email = $email;
            $this->line("  → Overriding recipient email to: <comment>{$email}</comment>");
        }

        $this->line("  → Test user : <comment>{$this->testUser->name}</comment> ({$this->testUser->email})");
        $this->newLine();

        // ── 2. Setup test journal ─────────────────────────────────────────
        $this->setupTestJournal();

        // ── 3. Setup test assessment ──────────────────────────────────────
        $this->setupTestAssessment();

        $this->newLine();
        $this->line('<fg=cyan>Sending notifications (synchronous — bypassing queue)...</>');
        $this->newLine();

        // ── 4. Define all tests ───────────────────────────────────────────
        $tests = $this->buildTests();

        // Filter by --type if given
        if ($type = $this->option('type')) {
            $tests = array_filter($tests, fn ($t) => $t['key'] === $type);
            if (empty($tests)) {
                $this->error("No test found with key '{$type}'. Available keys:");
                collect($this->buildTests())->each(fn ($t) => $this->line("  - {$t['key']}"));

                return self::FAILURE;
            }
        }

        // ── 5. Run each test ──────────────────────────────────────────────
        $passed = 0;
        $failed = 0;
        $skipped = 0;

        foreach ($tests as $test) {
            $this->sendNotification($test, $passed, $failed, $skipped);
        }

        // ── 6. Cleanup ────────────────────────────────────────────────────
        if ($this->option('cleanup')) {
            $this->cleanupTestData();
        }

        // ── 7. Summary ────────────────────────────────────────────────────
        $this->newLine();
        $this->line('═══════════════════════════════════════════════');
        $total = $passed + $failed + $skipped;
        $this->info("Results: {$passed}/{$total} sent successfully");
        if ($failed > 0) {
            $this->error("{$failed} failed — check logs above");
        }
        if ($skipped > 0) {
            $this->warn("{$skipped} skipped");
        }

        $this->newLine();
        $this->line('Check your <href=https://mailtrap.io>Mailtrap inbox</> to verify the emails.');
        $this->line("Mail config: <comment>".config('mail.mailers.smtp.host').':'.config('mail.mailers.smtp.port').'</comment>');
        $this->line("From: <comment>".config('mail.from.address').'</comment>');

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Build the list of all notification tests.
     */
    private function buildTests(): array
    {
        $user = $this->testUser;
        $journal = $this->testJournal;
        $assessment = $this->testAssessment;

        return [
            // ── Fase 1a: User Approval ─────────────────────────────────
            [
                'key' => 'user-approved',
                'label' => '[Fase 1a] UserApprovedNotification',
                'notifiable' => $user,
                'notification' => new UserApprovedNotification($user),
            ],
            [
                'key' => 'user-rejected',
                'label' => '[Fase 1a] UserRejectedNotification',
                'notifiable' => $user,
                'notification' => new UserRejectedNotification(
                    $user,
                    'Data profil tidak lengkap. NIDN tidak terdaftar di sistem Dikti.'
                ),
            ],

            // ── Fase 1b: LPPM Approval ─────────────────────────────────
            [
                'key' => 'lppm-approved',
                'label' => '[Fase 1b] LppmApprovedNotification',
                'notifiable' => $user,
                'notification' => new LppmApprovedNotification($user),
            ],
            [
                'key' => 'lppm-rejected',
                'label' => '[Fase 1b] LppmRejectedNotification',
                'notifiable' => $user,
                'notification' => new LppmRejectedNotification(
                    $user,
                    'Dokumen SK dari Rektor belum dilampirkan. Harap upload ulang.'
                ),
            ],

            // ── Fase 1c: Journal Approval ──────────────────────────────
            [
                'key' => 'journal-approved',
                'label' => '[Fase 1c] JournalApprovedNotification',
                'notifiable' => $user,
                'notification' => new JournalApprovedNotification($journal),
            ],
            [
                'key' => 'journal-rejected',
                'label' => '[Fase 1c] JournalRejectedNotification',
                'notifiable' => $user,
                'notification' => new JournalRejectedNotification(
                    $journal,
                    'ISSN tidak valid. Silakan verifikasi nomor ISSN di portal ISSN Indonesia.'
                ),
            ],

            // ── Fase 2a: New Registration Alerts ──────────────────────
            [
                'key' => 'new-lppm-registration',
                'label' => '[Fase 2a] NewLPPMRegistrationNotification',
                'notifiable' => $user,
                'notification' => new NewLPPMRegistrationNotification($user),
            ],
            [
                'key' => 'new-user-registration',
                'label' => '[Fase 2a] NewUserRegistrationNotification',
                'notifiable' => $user,
                'notification' => new NewUserRegistrationNotification($user),
            ],

            // ── Fase 2b: Journal Reassignment ──────────────────────────
            [
                'key' => 'journal-reassigned-assigned',
                'label' => '[Fase 2b] JournalReassignedNotification (type=assigned)',
                'notifiable' => $user,
                'notification' => new JournalReassignedNotification($journal, 'assigned'),
            ],
            [
                'key' => 'journal-reassigned-removed',
                'label' => '[Fase 2b] JournalReassignedNotification (type=removed)',
                'notifiable' => $user,
                'notification' => new JournalReassignedNotification($journal, 'removed'),
            ],

            // ── Fase 2c: Reviewer Assignment ───────────────────────────
            [
                'key' => 'reviewer-assigned',
                'label' => '[Fase 2c] ReviewerAssignedNotification',
                'notifiable' => $user,
                'notification' => new ReviewerAssignedNotification($assessment),
            ],

            // ── Pre-existing: Assessment Notifications ─────────────────
            [
                'key' => 'assessment-approved',
                'label' => '[Legacy] AssessmentApprovedNotification',
                'notifiable' => $user,
                'notification' => new AssessmentApprovedNotification(
                    $assessment,
                    'Penilaian Anda sangat baik. Selamat!'
                ),
            ],
            [
                'key' => 'assessment-revision',
                'label' => '[Legacy] AssessmentRevisionRequestedNotification',
                'notifiable' => $user,
                'notification' => new AssessmentRevisionRequestedNotification(
                    $assessment,
                    'Mohon lengkapi bukti pendukung pada indikator 3.2 dan 4.1.'
                ),
            ],
        ];
    }

    /**
     * Send a single notification and report result.
     */
    private function sendNotification(array $test, int &$passed, int &$failed, int &$skipped): void
    {
        $label = $test['label'];
        $this->line("  Sending: <comment>{$label}</comment>");

        try {
            $notification = $test['notification'];

            // Force mail-only for preview if requested
            if ($this->option('mail-only')) {
                $notification = new class($notification) extends \Illuminate\Notifications\Notification
                {
                    public function __construct(private $inner) {}

                    public function via($notifiable): array { return ['mail']; }

                    public function toMail($notifiable) { return $this->inner->toMail($notifiable); }
                };
            }

            // sendNow() bypasses the queue and sends synchronously
            Notification::sendNow([$test['notifiable']], $notification);

            $this->line("          <fg=green>✓ Sent</> → {$test['notifiable']->email}");
            $passed++;
        } catch (\Throwable $e) {
            $this->line("          <fg=red>✗ Failed</> — {$e->getMessage()}");
            $failed++;
        }

        $this->newLine();
    }

    /**
     * Create or reuse a test journal. Persists to DB so relationships work.
     */
    private function setupTestJournal(): void
    {
        // Reuse existing journal if available
        $existing = Journal::first();
        if ($existing) {
            $this->testJournal = $existing;
            $this->line("  → Test journal: <comment>{$existing->title}</comment> (existing, id={$existing->id})");

            return;
        }

        // Create a minimal test journal
        $this->testJournal = Journal::create([
            'university_id' => $this->testUser->university_id ?? 1,
            'user_id' => $this->testUser->id,
            'title' => '[TEST] Jurnal Ilmu Komputer dan Teknologi Informasi',
            'issn' => '2580-TEST',
            'e_issn' => '2580-TSTS',
            'url' => 'https://journal.example.ac.id/jikti',
            'oai_pmh_url' => '',
            'publisher' => 'Lembaga Penelitian Universitas Test',
            'approval_status' => 'approved',
            'is_active' => true,
        ]);

        $this->createdJournal = true;
        $this->line("  → Test journal: <comment>{$this->testJournal->title}</comment> (created, id={$this->testJournal->id})");
    }

    /**
     * Create or reuse a test journal assessment.
     */
    private function setupTestAssessment(): void
    {
        // Reuse existing assessment if available
        $existing = JournalAssessment::with('journal')->first();
        if ($existing) {
            $this->testAssessment = $existing;
            $this->line("  → Test assessment: id={$existing->id} (existing)");

            return;
        }

        // Create a minimal test assessment
        $this->testAssessment = JournalAssessment::create([
            'journal_id' => $this->testJournal->id,
            'user_id' => $this->testUser->id,
            'assessment_date' => now()->toDateString(),
            'period' => now()->year.'-'.now()->addYear()->year,
            'status' => 'submitted',
        ]);

        // Eager load journal relationship
        $this->testAssessment->load('journal');

        $this->createdAssessment = true;
        $this->line("  → Test assessment: <comment>id={$this->testAssessment->id}</comment> (created)");
    }

    /**
     * Clean up test records created during this run.
     */
    private function cleanupTestData(): void
    {
        $this->newLine();
        $this->line('<fg=yellow>Cleaning up test data...</>');

        if ($this->createdAssessment) {
            $this->testAssessment->forceDelete();
            $this->line('  → Deleted test assessment');
        }

        if ($this->createdJournal) {
            $this->testJournal->forceDelete();
            $this->line('  → Deleted test journal');
        }
    }
}
