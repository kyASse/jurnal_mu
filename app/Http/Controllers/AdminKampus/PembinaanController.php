<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\PembinaanRegistration;
use App\Models\ReviewerAssignment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PembinaanController extends Controller
{
    /**
     * Display Akreditasi registrations from the admin's university.
     */
    public function indexAkreditasi(Request $request): Response
    {
        return $this->indexByCategory($request, 'akreditasi');
    }

    /**
     * Display Indeksasi registrations from the admin's university.
     */
    public function indexIndeksasi(Request $request): Response
    {
        return $this->indexByCategory($request, 'indeksasi');
    }

    /**
     * Common method to display registrations by category.
     */
    private function indexByCategory(Request $request, string $category): Response
    {
        $this->authorize('viewAny', PembinaanRegistration::class);

        $user = $request->user();
        $query = PembinaanRegistration::with([
            'pembinaan',
            'journal',
            'user',
            'reviewer',
        ])->forUniversity($user->university_id)
            ->whereHas('pembinaan', function ($q) use ($category) {
                $q->where('category', $category);
            });

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('pembinaan_id')) {
            $query->forPembinaan($request->pembinaan_id);
        }

        if ($request->filled('search')) {
            $query->whereHas('journal', function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('issn', 'like', "%{$request->search}%");
            });
        }

        $registrations = $query->orderBy('registered_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('AdminKampus/Pembinaan/Index', [
            'registrations' => $registrations,
            'filters' => [
                'status' => $request->status,
                'pembinaan_id' => $request->pembinaan_id,
                'search' => $request->search,
            ],
            'category' => $category,
        ]);
    }

    /**
     * Display a specific registration detail.
     */
    public function show(PembinaanRegistration $registration): Response
    {
        $this->authorize('view', $registration);

        $registration->load([
            'pembinaan.accreditationTemplate',
            'journal.university',
            'journal.scientificField',
            'user',
            'reviewer',
            'attachments.uploader',
            'reviews.reviewer',
            'reviewerAssignments.reviewer',
            'reviewerAssignments.assigner',
        ]);

        return Inertia::render('AdminKampus/Pembinaan/Show', [
            'registration' => $registration,
            'category' => $registration->pembinaan->category,
        ]);
    }

    /**
     * Approve a registration.
     */
    public function approve(Request $request, PembinaanRegistration $registration): RedirectResponse
    {
        $this->authorize('approve', $registration);

        $registration->update([
            'status' => 'approved',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
            'rejection_reason' => null,
            'updated_by' => $request->user()->id,
        ]);

        // TODO: Send email notification to user

        return back()->with('success', 'Registration approved successfully.');
    }

    /**
     * Reject a registration.
     */
    public function reject(Request $request, PembinaanRegistration $registration): RedirectResponse
    {
        $this->authorize('reject', $registration);

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $registration->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
            'rejection_reason' => $validated['rejection_reason'],
            'updated_by' => $request->user()->id,
        ]);

        // TODO: Send email notification to user

        return back()->with('success', 'Registration rejected.');
    }

    /**
     * Assign a reviewer to a registration.
     */
    public function assignReviewer(Request $request, PembinaanRegistration $registration): RedirectResponse
    {
        $this->authorize('create', ReviewerAssignment::class);

        $validated = $request->validate([
            'reviewer_id' => 'required|exists:users,id',
        ]);

        // Use policy to validate assignment
        $this->authorize('assign', [
            ReviewerAssignment::class,
            $request->user()->id,
            $registration->id,
            $validated['reviewer_id'],
        ]);

        $reviewer = User::findOrFail($validated['reviewer_id']);

        // Check if reviewer is available
        if (! $reviewer->isAvailableForAssignment()) {
            return back()->with('error', 'Reviewer has reached maximum assignment capacity.');
        }

        ReviewerAssignment::create([
            'reviewer_id' => $validated['reviewer_id'],
            'registration_id' => $registration->id,
            'assigned_by' => $request->user()->id,
            'status' => 'assigned',
        ]);

        // Increment reviewer workload
        $reviewer->incrementAssignments();

        // TODO: Send email notification to reviewer

        return back()->with('success', 'Reviewer assigned successfully.');
    }

    /**
     * Remove a reviewer assignment.
     */
    public function removeAssignment(Request $request, ReviewerAssignment $assignment): RedirectResponse
    {
        $this->authorize('delete', $assignment);

        if ($assignment->isCompleted()) {
            return back()->with('error', 'Cannot remove completed assignment.');
        }

        $reviewer = $assignment->reviewer;

        $assignment->delete();

        // Decrement reviewer workload
        if ($reviewer) {
            $reviewer->decrementAssignments();
        }

        return back()->with('success', 'Reviewer assignment removed.');
    }

    /**
     * Get available reviewers for assignment dropdown.
     *
     * Features load balancing (prioritize least-loaded reviewers)
     * and optional expertise matching.
     */
    public function getReviewers(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        // Base query: reviewers from same university who are active and available
        $query = User::reviewers()
            ->where('university_id', $user->university_id)
            ->where('is_active', true)
            ->availableReviewers(); // Only those not at max capacity

        // Optional: Filter by expertise if journal's scientific_field_id provided
        if ($request->filled('scientific_field_id')) {
            $query->withExpertise($request->scientific_field_id);
        }

        // Load balancing: Sort by current_assignments (least loaded first)
        $reviewers = $query->orderBy('current_assignments', 'asc')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'current_assignments', 'max_assignments', 'reviewer_expertise']);

        // Add computed fields for UI display
        $reviewers->each(function ($reviewer) {
            $reviewer->workload_percentage = $reviewer->getWorkloadPercentage();
            $reviewer->is_available = $reviewer->isAvailableForAssignment();
            $reviewer->available_slots = $reviewer->max_assignments - $reviewer->current_assignments;
        });

        return response()->json($reviewers);
    }
}
