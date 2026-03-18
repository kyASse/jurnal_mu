<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Handle journal submission approval workflow for Admin Kampus.
 *
 * @route /admin-kampus/journals/pending
 *
 * @features View pending journals, approve/reject submissions, send notifications
 */
class JournalApprovalController extends Controller
{
    /**
     * Display pending journal submissions awaiting approval.
     *
     * @route GET /admin-kampus/journals/pending
     */
    public function index(Request $request): Response
    {
        $query = Journal::query()
            ->where('university_id', auth()->user()->university_id)
            ->where('approval_status', 'pending')
            ->with(['user', 'scientificField', 'university']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('issn', 'like', "%{$search}%")
                    ->orWhere('e_issn', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $journals = $query->paginate(15)->withQueryString();

        return Inertia::render('AdminKampus/Journals/PendingApproval', [
            'journals' => $journals,
            'filters' => [
                'search' => $request->search,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Approve a journal submission.
     *
     * @route POST /admin-kampus/journals/{journal}/approve
     */
    public function approve(Request $request, Journal $journal)
    {
        $this->authorize('approve', $journal);

        $actorId = auth()->id();
        $before = [
            'approval_status' => $journal->approval_status,
            'approved_by' => $journal->approved_by,
            'approved_at' => $journal->approved_at,
            'rejection_reason' => $journal->rejection_reason,
        ];

        Log::info('JournalApprovalController@approve - Start', [
            'actor_id' => $actorId,
            'journal_id' => $journal->id,
            'journal_title' => $journal->title,
            'before' => $before,
        ]);

        // Ensure LPPM can only approve journals from their university
        if ($journal->university_id !== auth()->user()->university_id) {
            Log::warning('JournalApprovalController@approve - Unauthorized university access', [
                'actor_id' => $actorId,
                'journal_id' => $journal->id,
                'journal_university_id' => $journal->university_id,
                'actor_university_id' => auth()->user()->university_id,
            ]);

            abort(403, 'Unauthorized - Journal is not from your university');
        }

        // Prevent approving already approved journals
        if ($journal->approval_status === 'approved') {
            Log::info('JournalApprovalController@approve - Already approved', [
                'actor_id' => $actorId,
                'journal_id' => $journal->id,
                'before' => $before,
            ]);

            return back()->with('error', 'Jurnal sudah disetujui sebelumnya.');
        }

        try {
            $journal->update([
                'approval_status' => 'approved',
                'approved_by' => $actorId,
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);

            // Invalidate university statistics cache
            Cache::forget('browse.universities.stats');

            Log::info('JournalApprovalController@approve - Successfully approved', [
                'actor_id' => $actorId,
                'journal_id' => $journal->id,
                'after' => [
                    'approval_status' => $journal->approval_status,
                    'approved_by' => $journal->approved_by,
                    'approved_at' => $journal->approved_at,
                    'rejection_reason' => $journal->rejection_reason,
                ],
            ]);

            // TODO: Send JournalApprovedNotification
            // $journal->user->notify(new JournalApprovedNotification($journal));

            return redirect()
                ->route('admin-kampus.journals.pending')
                ->with('success', "Jurnal \"{$journal->name}\" berhasil disetujui dan sekarang terlihat di platform.");
        } catch (\Throwable $e) {
            Log::error('JournalApprovalController@approve - Failed to approve', [
                'actor_id' => $actorId,
                'journal_id' => $journal->id,
                'before' => $before,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Reject a journal submission with reason.
     *
     * @route POST /admin-kampus/journals/{journal}/reject
     */
    public function reject(Request $request, Journal $journal)
    {
        $request->validate([
            'reason' => 'required|string|min:10|max:1000',
        ], [
            'reason.required' => 'Alasan penolakan harus diisi.',
            'reason.min' => 'Alasan penolakan minimal 10 karakter.',
            'reason.max' => 'Alasan penolakan maksimal 1000 karakter.',
        ]);

        $this->authorize('approve', $journal);

        $actorId = auth()->id();
        $before = [
            'approval_status' => $journal->approval_status,
            'approved_by' => $journal->approved_by,
            'approved_at' => $journal->approved_at,
            'rejection_reason' => $journal->rejection_reason,
        ];

        Log::info('JournalApprovalController@reject - Start', [
            'actor_id' => $actorId,
            'journal_id' => $journal->id,
            'journal_title' => $journal->title,
            'reason' => $request->reason,
            'before' => $before,
        ]);

        // Ensure LPPM can only reject journals from their university
        if ($journal->university_id !== auth()->user()->university_id) {
            Log::warning('JournalApprovalController@reject - Unauthorized university access', [
                'actor_id' => $actorId,
                'journal_id' => $journal->id,
                'journal_university_id' => $journal->university_id,
                'actor_university_id' => auth()->user()->university_id,
            ]);

            abort(403, 'Unauthorized - Journal is not from your university');
        }

        // Prevent rejecting already processed journals
        if ($journal->approval_status !== 'pending') {
            Log::info('JournalApprovalController@reject - Already processed', [
                'actor_id' => $actorId,
                'journal_id' => $journal->id,
                'before' => $before,
            ]);

            return back()->with('error', 'Jurnal sudah diproses sebelumnya.');
        }

        try {
            $journal->update([
                'approval_status' => 'rejected',
                'approved_by' => $actorId,
                'approved_at' => now(),
                'rejection_reason' => $request->reason,
            ]);

            // Invalidate university statistics cache
            Cache::forget('browse.universities.stats');

            Log::info('JournalApprovalController@reject - Successfully rejected', [
                'actor_id' => $actorId,
                'journal_id' => $journal->id,
                'after' => [
                    'approval_status' => $journal->approval_status,
                    'approved_by' => $journal->approved_by,
                    'approved_at' => $journal->approved_at,
                    'rejection_reason' => $journal->rejection_reason,
                ],
            ]);

            // TODO: Send JournalRejectedNotification
            // $journal->user->notify(new JournalRejectedNotification($journal, $request->reason));

            return redirect()
                ->route('admin-kampus.journals.pending')
                ->with('success', "Jurnal \"{$journal->name}\" ditolak. Pengelola jurnal telah diberi notifikasi.");
        } catch (\Throwable $e) {
            Log::error('JournalApprovalController@reject - Failed to reject', [
                'actor_id' => $actorId,
                'journal_id' => $journal->id,
                'before' => $before,
                'reason' => $request->reason,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
