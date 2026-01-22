<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of Users (Pengelola Jurnal).
     */
    public function index(Request $request): Response
    {
        // Only Super Admin can access
        $this->authorize('manage-users');

        // Base query for User role only
        $query = User::query()
            ->with(['role', 'university'])
            ->whereHas('role', function ($query) {
                $query->where('name', 'User');
            });

        // Apply filters if any
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Filter by University
        if ($request->has('university_id') && $request->university_id) {
            $query->where('university_id', $request->university_id);
        }

        // Filter by Active Status
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by Reviewer Status
        if ($request->has('is_reviewer') && $request->is_reviewer !== null) {
            $query->where('is_reviewer', $request->boolean('is_reviewer'));
        }

        // Get Users with counts
        $users = $query
            ->withCount('journals')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
                'is_active' => $user->is_active,
                'is_reviewer' => $user->is_reviewer ?? false,
                'university' => $user->university ? [
                    'id' => $user->university->id,
                    'name' => $user->university->name,
                    'short_name' => $user->university->short_name,
                    'code' => $user->university->code,
                ] : null,
                'journals_count' => $user->journals_count ?? 0,
                'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            ]);

        // Get all universities for filter dropdown
        $universities = University::query()
            ->orderBy('name')
            ->get(['id', 'name', 'short_name', 'code']);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'universities' => $universities,
            'filters' => $request->only(['search', 'university_id', 'is_active', 'is_reviewer']),
        ]);
    }

    /**
     * Show the form for creating a new User.
     */
    public function create()
    {
        $this->authorize('manage-users');

        // Get all active universities
        $universities = University::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'short_name', 'code']);

        return Inertia::render('Admin/Users/Create', [
            'universities' => $universities,
        ]);
    }

    /**
     * Store a newly created User in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('manage-users');

        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
            'university_id' => 'required|exists:universities,id',
            'is_active' => 'required|boolean',
            'is_reviewer' => 'boolean',
        ]);

        // Get User role
        $userRole = Role::where('name', 'User')->firstOrFail();

        // Create new User
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'position' => $validated['position'] ?? null,
            'university_id' => $validated['university_id'],
            'role_id' => $userRole->id,
            'is_active' => $validated['is_active'],
            'is_reviewer' => $validated['is_reviewer'] ?? false,
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengelola Jurnal created successfully.');
    }

    /**
     * Display the specified User.
     */
    public function show(Request $request, User $user): Response
    {
        $this->authorize('manage-users');

        // Verify it's a User
        if (! $user->isUser()) {
            abort(404, 'Pengelola Jurnal not found.');
        }

        // Load relationships
        $user->load(['role', 'university', 'journals.scientificField']);

        return Inertia::render('Admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'position' => $user->position,
                'avatar_url' => $user->avatar_url,
                'is_active' => $user->is_active,
                'is_reviewer' => $user->is_reviewer ?? false,
                'university' => $user->university ? [
                    'id' => $user->university->id,
                    'name' => $user->university->name,
                    'short_name' => $user->university->short_name,
                    'code' => $user->university->code,
                    'city' => $user->university->city,
                    'province' => $user->university->province,
                ] : null,
                'last_login_at' => $user->last_login_at?->format('Y-m-d H:i'),
                'created_at' => $user->created_at->format('Y-m-d H:i'),
                'updated_at' => $user->updated_at->format('Y-m-d H:i'),
                'journals_count' => $user->journals->count(),
            ],
            'journals' => $user->journals->map(fn ($journal) => [
                'id' => $journal->id,
                'title' => $journal->title,
                'issn' => $journal->issn,
                'scientific_field' => $journal->scientificField?->name,
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified User.
     */
    public function edit(Request $request, User $user): Response
    {
        $this->authorize('manage-users');

        // Verify it's a User
        if (! $user->isUser()) {
            abort(404, 'Pengelola Jurnal not found.');
        }

        $user->load('university');

        // Get all active universities
        $universities = University::active()
            ->orderBy('name')
            ->get(['id', 'name', 'short_name', 'code']);

        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'position' => $user->position,
                'university_id' => $user->university_id,
                'is_active' => $user->is_active,
                'is_reviewer' => $user->is_reviewer ?? false,
            ],
            'universities' => $universities,
        ]);
    }

    /**
     * Update the specified User in storage.
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('manage-users');

        // Verify it's a User
        if (! $user->isUser()) {
            abort(404, 'Pengelola Jurnal not found.');
        }

        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
            'university_id' => 'required|exists:universities,id',
            'is_active' => 'boolean',
            'is_reviewer' => 'boolean',
        ]);

        // Update User
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'position' => $validated['position'] ?? null,
            'university_id' => $validated['university_id'],
            'is_active' => $validated['is_active'] ?? $user->is_active,
            'is_reviewer' => $validated['is_reviewer'] ?? $user->is_reviewer ?? false,
        ]);

        // Update password if provided
        if (! empty($validated['password'])) {
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengelola Jurnal updated successfully.');
    }

    /**
     * Remove the specified User from storage.
     */
    public function destroy(Request $request, User $user)
    {
        $this->authorize('manage-users');

        // Load role relationship
        $user->load('role');

        // Verify it's a User
        if (! $user->isUser()) {
            abort(404, 'Pengelola Jurnal not found.');
        }

        // Check if User has managed journals
        if ($user->journals()->count() > 0) {
            return back()->with('error', 'Cannot delete Pengelola Jurnal with existing journals. Please reassign or delete journals first.');
        }

        // Soft delete User
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengelola Jurnal deleted successfully.');
    }

    /**
     * Toggle active status of the User.
     */
    public function toggleActive(Request $request, User $user)
    {
        $this->authorize('manage-users');

        // Load role relationship
        $user->load('role');

        // Verify it's a User
        if (! $user->isUser()) {
            abort(404, 'Pengelola Jurnal not found.');
        }

        // Toggle active status
        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        $status = $user->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Pengelola Jurnal {$status} successfully.");
    }
}
