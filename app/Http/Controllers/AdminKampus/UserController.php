<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users within the admin's university.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $authUser = $request->user();

        // Base query: Only users with 'User' role from admin's university
        $query = User::query()
            ->with(['role', 'university'])
            ->forUniversity($authUser->university_id)
            ->whereHas('role', function ($q) {
                $q->where('name', 'User');
            });

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply active status filter
        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Get users with journal count
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
                'position' => $user->position,
                'avatar_url' => $user->avatar_url,
                'is_active' => $user->is_active,
                'journals_count' => $user->journals_count ?? 0,
                'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            ]);

        return Inertia::render('AdminKampus/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'is_active']),
            'university' => [
                'id' => $authUser->university->id,
                'name' => $authUser->university->name,
                'short_name' => $authUser->university->short_name,
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', User::class);

        $authUser = $request->user();

        return Inertia::render('AdminKampus/Users/Create', [
            'university' => [
                'id' => $authUser->university->id,
                'name' => $authUser->university->name,
                'short_name' => $authUser->university->short_name,
            ],
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $authUser = $request->user();

        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        // Get 'User' role
        $userRole = Role::where('name', 'User')->firstOrFail();

        // Verify admin can assign this role
        if (!$authUser->can('canAssignRole', [User::class, 'User'])) {
            abort(403, 'You are not authorized to assign this role.');
        }

        // Create new user with auto-assigned university and role
        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'position' => $validated['position'] ?? null,
            'university_id' => $authUser->university_id, // Auto-assign from admin's university
            'role_id' => $userRole->id, // Auto-assign 'User' role
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin-kampus.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(Request $request, User $user): Response
    {
        // Load role first for isUser() check
        $user->load('role');
        
        $this->authorize('view', $user);

        // Verify user belongs to admin's university
        $authUser = $request->user();
        if ($user->university_id !== $authUser->university_id) {
            abort(404, 'User not found.');
        }

        // Verify it's a 'User' role
        if (!$user->isUser()) {
            abort(404, 'User not found.');
        }

        // Load remaining relationships
        $user->load(['university', 'journals.scientificField']);

        return Inertia::render('AdminKampus/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'position' => $user->position,
                'avatar_url' => $user->avatar_url,
                'is_active' => $user->is_active,
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
                'created_at' => $journal->created_at->format('Y-m-d'),
            ]),
            'university' => [
                'id' => $authUser->university->id,
                'name' => $authUser->university->name,
                'short_name' => $authUser->university->short_name,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(Request $request, User $user): Response
    {
        // Load role first for isUser() check
        $user->load('role');
        
        $this->authorize('update', $user);

        // Verify user belongs to admin's university
        $authUser = $request->user();
        if ($user->university_id !== $authUser->university_id) {
            abort(404, 'User not found.');
        }

        // Verify it's a 'User' role
        if (!$user->isUser()) {
            abort(404, 'User not found.');
        }

        return Inertia::render('AdminKampus/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'position' => $user->position,
                'is_active' => $user->is_active,
            ],
            'university' => [
                'id' => $authUser->university->id,
                'name' => $authUser->university->name,
                'short_name' => $authUser->university->short_name,
            ],
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        // Load role first for isUser() check
        $user->load('role');
        
        $this->authorize('update', $user);

        // Verify user belongs to admin's university
        $authUser = $request->user();
        if ($user->university_id !== $authUser->university_id) {
            abort(404, 'User not found.');
        }

        // Verify it's a 'User' role
        if (!$user->isUser()) {
            abort(404, 'User not found.');
        }

        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        // Update user
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'position' => $validated['position'] ?? null,
            'is_active' => $validated['is_active'] ?? $user->is_active,
        ]);

        // Update password if provided
        if (!empty($validated['password'])) {
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        return redirect()->route('admin-kampus.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        // Load role first for isUser() check
        $user->load('role');
        
        $this->authorize('delete', $user);

        // Verify user belongs to admin's university
        $authUser = $request->user();
        if ($user->university_id !== $authUser->university_id) {
            abort(404, 'User not found.');
        }

        // Verify it's a 'User' role
        if (!$user->isUser()) {
            abort(404, 'User not found.');
        }

        // Check if user has journals
        if ($user->journals()->count() > 0) {
            return back()->with('error', 'Cannot delete user with existing journals. Please reassign or delete journals first.');
        }

        // Soft delete user
        $user->delete();

        return redirect()->route('admin-kampus.users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Toggle active status of the user.
     */
    public function toggleActive(Request $request, User $user): RedirectResponse
    {
        // Load role first for isUser() check
        $user->load('role');
        
        $this->authorize('toggleActiveStatus', $user);

        // Verify user belongs to admin's university
        $authUser = $request->user();
        if ($user->university_id !== $authUser->university_id) {
            abort(404, 'User not found.');
        }

        // Verify it's a 'User' role
        if (!$user->isUser()) {
            abort(404, 'User not found.');
        }

        // Toggle active status
        $user->update([
            'is_active' => !$user->is_active,
        ]);

        $status = $user->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "User {$status} successfully.");
    }
}
