<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewerRequest;
use App\Http\Requests\UpdateReviewerRequest;
use App\Models\Role;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewerController extends Controller
{
    /**
     * Display a listing of Reviewers.
     *
     * @route GET /admin/reviewers
     *
     * @features List all reviewers, filter by university/expertise/workload, search
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $query = User::reviewers()
            ->with(['university', 'roles'])
            ->where('is_active', true);

        // Filter by university
        if ($request->filled('university_id')) {
            $query->where('university_id', $request->university_id);
        }

        // Filter by expertise
        if ($request->filled('expertise_id')) {
            $query->withExpertise($request->expertise_id);
        }

        // Filter by workload status
        if ($request->filled('workload_status')) {
            switch ($request->workload_status) {
                case 'available':
                    $query->whereColumn('current_assignments', '<', 'max_assignments');
                    break;
                case 'busy':
                    $query->whereColumn('current_assignments', '>=', 'max_assignments');
                    break;
                case 'overloaded':
                    $query->whereColumn('current_assignments', '>', 'max_assignments');
                    break;
            }
        }

        // Search by name or email
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Sort by workload (default)
        $sortField = $request->get('sort', 'current_assignments');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $reviewers = $query->paginate(20)->withQueryString();

        // Add computed fields
        $reviewers->getCollection()->transform(function ($reviewer) {
            $reviewer->workload_percentage = $reviewer->getWorkloadPercentage();
            $reviewer->is_available = $reviewer->isAvailableForAssignment();

            return $reviewer;
        });

        return Inertia::render('Admin/Reviewers/Index', [
            'reviewers' => $reviewers,
            'universities' => University::where('is_active', true)->get(['id', 'name']),
            'scientificFields' => ScientificField::all(['id', 'name']),
            'filters' => [
                'search' => $request->search,
                'university_id' => $request->university_id,
                'expertise_id' => $request->expertise_id,
                'workload_status' => $request->workload_status,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Store a new reviewer (toggle user to reviewer).
     *
     * @route POST /admin/reviewers
     *
     * @features Toggle user to reviewer role, set initial metadata
     */
    public function store(StoreReviewerRequest $request): RedirectResponse
    {
        $user = User::findOrFail($request->user_id);

        $this->authorize('create', $user);

        // Toggle reviewer status
        $user->is_reviewer = true;
        $user->reviewer_expertise = $request->reviewer_expertise;
        $user->reviewer_bio = $request->reviewer_bio;
        $user->max_assignments = $request->max_assignments ?? 5;
        $user->current_assignments = 0;
        $user->save();

        // Add Reviewer role if not already present
        $reviewerRole = Role::where('name', Role::REVIEWER)->first();
        if ($reviewerRole && ! $user->roles()->where('role_id', $reviewerRole->id)->exists()) {
            $user->roles()->attach($reviewerRole->id);
        }

        return redirect()->back()->with('success', 'User promoted to Reviewer successfully.');
    }

    /**
     * Display the specified reviewer.
     *
     * @route GET /admin/reviewers/{id}
     *
     * @features Show reviewer profile with stats, assignment history
     */
    public function show(User $reviewer): Response
    {
        $this->authorize('view', $reviewer);

        $reviewer->load([
            'university',
            'roles',
            'reviewerAssignments.registration.journal',
            'pembinaanReviews',
        ]);

        // Get reviewer stats
        $stats = $reviewer->getReviewerStats();

        // Get expertise fields
        $expertiseFields = $reviewer->expertiseFields();

        return Inertia::render('Admin/Reviewers/Show', [
            'reviewer' => $reviewer,
            'stats' => $stats,
            'expertiseFields' => $expertiseFields,
            'workloadPercentage' => $reviewer->getWorkloadPercentage(),
            'isAvailable' => $reviewer->isAvailableForAssignment(),
        ]);
    }

    /**
     * Show the form for editing the specified reviewer.
     *
     * @route GET /admin/reviewers/{id}/edit
     *
     * @features Edit reviewer expertise, bio, max_assignments
     */
    public function edit(User $reviewer): Response
    {
        $this->authorize('update', $reviewer);

        $reviewer->load(['university', 'roles']);

        return Inertia::render('Admin/Reviewers/Edit', [
            'reviewer' => $reviewer,
            'scientificFields' => ScientificField::all(['id', 'name']),
            'expertiseFields' => $reviewer->expertiseFields(),
        ]);
    }

    /**
     * Update the specified reviewer.
     *
     * @route PUT /admin/reviewers/{id}
     *
     * @features Update reviewer metadata
     */
    public function update(UpdateReviewerRequest $request, User $reviewer): RedirectResponse
    {
        $this->authorize('update', $reviewer);

        $reviewer->update([
            'reviewer_expertise' => $request->reviewer_expertise,
            'reviewer_bio' => $request->reviewer_bio,
            'max_assignments' => $request->max_assignments ?? $reviewer->max_assignments,
        ]);

        return redirect()->route('admin.reviewers.show', $reviewer)
            ->with('success', 'Reviewer profile updated successfully.');
    }

    /**
     * Remove the specified reviewer (toggle off reviewer status).
     *
     * @route DELETE /admin/reviewers/{id}
     *
     * @features Remove reviewer role, keep user account
     */
    public function destroy(User $reviewer): RedirectResponse
    {
        $this->authorize('delete', $reviewer);

        // Check if reviewer has active assignments
        if ($reviewer->activeAssignments()->exists()) {
            return redirect()->back()->with('error', 'Cannot remove reviewer status while they have active assignments.');
        }

        // Remove reviewer status
        $reviewer->is_reviewer = false;
        $reviewer->reviewer_expertise = null;
        $reviewer->reviewer_bio = null;
        $reviewer->save();

        // Remove Reviewer role
        $reviewerRole = Role::where('name', Role::REVIEWER)->first();
        if ($reviewerRole) {
            $reviewer->roles()->detach($reviewerRole->id);
        }

        return redirect()->route('admin.reviewers.index')
            ->with('success', 'Reviewer status removed successfully.');
    }

    /**
     * Get reviewer statistics for dashboard.
     *
     * @route GET /admin/reviewers/{id}/stats
     *
     * @features Get detailed stats for reviewer
     */
    public function stats(User $reviewer): JsonResponse
    {
        $this->authorize('viewStats', $reviewer);

        return response()->json($reviewer->getReviewerStats());
    }

    /**
     * Toggle reviewer status for a user.
     *
     * @route POST /admin/reviewers/{user}/toggle
     *
     * @features Quick toggle reviewer on/off
     */
    public function toggle(User $user): RedirectResponse
    {
        if ($user->is_reviewer) {
            $this->authorize('delete', $user);

            // Check active assignments before removing
            if ($user->activeAssignments()->exists()) {
                return redirect()->back()->with('error', 'Cannot remove reviewer status while they have active assignments.');
            }

            $user->is_reviewer = false;
            $user->save();

            // Remove Reviewer role
            $reviewerRole = Role::where('name', Role::REVIEWER)->first();
            if ($reviewerRole) {
                $user->roles()->detach($reviewerRole->id);
            }

            return redirect()->back()->with('success', 'Reviewer status removed.');
        } else {
            $this->authorize('create', $user);

            $user->is_reviewer = true;
            $user->max_assignments = $user->max_assignments ?? 5;
            $user->save();

            // Add Reviewer role
            $reviewerRole = Role::where('name', Role::REVIEWER)->first();
            if ($reviewerRole && ! $user->roles()->where('role_id', $reviewerRole->id)->exists()) {
                $user->roles()->attach($reviewerRole->id);
            }

            return redirect()->back()->with('success', 'User promoted to Reviewer.');
        }
    }
}
