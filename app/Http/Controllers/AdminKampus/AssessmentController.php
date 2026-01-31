<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\JournalAssessment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentController extends Controller
{
    /**
     * Display assessments from Admin Kampus's university.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $status = $request->input('status');
        $search = $request->input('search');

        $assessments = JournalAssessment::with([
            'journal.user',
            'journal.university',
            'journal.scientificField',
            'user',
            'reviewer',
        ])
            ->whereHas('journal', function ($query) use ($user) {
                $query->where('university_id', $user->university_id);
            })
            ->when($status, function ($query, $status) {
                $query->byStatus($status);
            })
            ->when($search, function ($query, $search) {
                $query->whereHas('journal', function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('issn', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('AdminKampus/Assessments/Index', [
            'assessments' => $assessments,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display assessment detail for review.
     */
    public function show(Request $request, JournalAssessment $assessment): Response
    {
        $this->authorize('view', $assessment);

        $assessment->load([
            'journal.user',
            'journal.university',
            'journal.scientificField',
            'user',
            'reviewer',
            'responses.evaluationIndicator.subCategory.category',
            'responses.attachments',
        ]);

        return Inertia::render('AdminKampus/Assessments/Show', [
            'assessment' => $assessment,
        ]);
    }

    /**
     * Display review page for submitted assessment.
     */
    public function review(Request $request, JournalAssessment $assessment): Response
    {
        $this->authorize('review', $assessment);

        $assessment->load([
            'journal.user',
            'journal.university',
            'journal.scientificField',
            'user',
            'reviewer',
            'responses.evaluationIndicator.subCategory.category',
            'responses.attachments',
        ]);

        return Inertia::render('AdminKampus/Assessments/Review', [
            'assessment' => $assessment,
        ]);
    }

    /**
     * Approve assessment and mark as reviewed.
     */
    public function approve(Request $request, JournalAssessment $assessment): RedirectResponse
    {
        $this->authorize('review', $assessment);

        $validated = $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $assessment->update([
            'status' => 'reviewed',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

        return redirect()
            ->route('admin-kampus.assessments.index')
            ->with('success', 'Assessment approved successfully.');
    }

    /**
     * Request revision - send assessment back to draft status.
     */
    public function requestRevision(Request $request, JournalAssessment $assessment): RedirectResponse
    {
        $this->authorize('review', $assessment);

        $validated = $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $assessment->update([
            'status' => 'draft',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'admin_notes' => $validated['admin_notes'],
        ]);

        return redirect()
            ->route('admin-kampus.assessments.index')
            ->with('success', 'Revision request sent to user.');
    }
}
