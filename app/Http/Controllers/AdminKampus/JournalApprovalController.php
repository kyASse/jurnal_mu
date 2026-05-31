<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
    public function index(Request $request)
    {
        return redirect()->route('admin-kampus.journals.index', [
            'approval_status' => 'pending',
            'search' => $request->search,
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

        // Ensure LPPM can only approve journals from their university
        if ($journal->university_id !== auth()->user()->university_id) {
            abort(403, 'Unauthorized - Journal is not from your university');
        }

        // Prevent approving already approved journals
        if ($journal->approval_status === 'approved') {
            return back()->with('error', 'Jurnal sudah disetujui sebelumnya.');
        }

        $journal->update([
            'approval_status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        // Invalidate university statistics cache
        Cache::forget('browse.universities.stats');

        // TODO: Send JournalApprovedNotification
        // $journal->user->notify(new JournalApprovedNotification($journal));

        return redirect()
            ->route('admin-kampus.journals.index')
            ->with('success', "Jurnal \"{$journal->title}\" berhasil disetujui dan sekarang terlihat di platform.");
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

        // Ensure LPPM can only reject journals from their university
        if ($journal->university_id !== auth()->user()->university_id) {
            abort(403, 'Unauthorized - Journal is not from your university');
        }

        // Prevent rejecting already processed journals
        if ($journal->approval_status !== 'pending') {
            return back()->with('error', 'Jurnal sudah diproses sebelumnya.');
        }

        $journal->update([
            'approval_status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $request->reason,
        ]);

        // Invalidate university statistics cache
        Cache::forget('browse.universities.stats');

        // TODO: Send JournalRejectedNotification
        // $journal->user->notify(new JournalRejectedNotification($journal, $request->reason));

        return redirect()
            ->route('admin-kampus.journals.index')
            ->with('success', "Jurnal \"{$journal->title}\" ditolak. Pengelola jurnal telah diberi notifikasi.");
    }
}
