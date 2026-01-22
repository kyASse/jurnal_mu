<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        // Base query: Users from admin's university (excluding Super Admin)
        $query = User::query()
            ->with(['role', 'roles', 'university'])
            ->forUniversity($authUser->university_id)
            ->where(function ($q) {
                $q->whereHas('role', function ($query) {
                    $query->whereNotIn('name', [Role::SUPER_ADMIN]);
                })
                ->orWhereHas('roles', function ($query) {
                    $query->whereNotIn('name', [Role::SUPER_ADMIN]);
                });
            });

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply active status filter
        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Apply role filter
        if ($request->filled('role_id')) {
            $query->where(function ($q) use ($request) {
                $q->where('role_id', $request->role_id)
                    ->orWhereHas('roles', function ($query) use ($request) {
                        $query->where('roles.id', $request->role_id);
                    });
            });
        }

        // Get users with journal count
        $users = $query
            ->withCount('journals')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($user) {
                // Get all roles for this user
                $userRoles = $user->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                ])->toArray();

                // Add primary role if not already in roles array
                if ($user->role && ! collect($userRoles)->contains('id', $user->role->id)) {
                    $userRoles[] = [
                        'id' => $user->role->id,
                        'name' => $user->role->name,
                        'display_name' => $user->role->display_name,
                    ];
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'position' => $user->position,
                    'avatar_url' => $user->avatar_url,
                    'is_active' => $user->is_active,
                    'roles' => $userRoles,
                    'journals_count' => $user->journals_count,
                    'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get assignable roles for filter (not Super Admin)
        $roles = Role::query()
            ->whereNotIn('name', [Role::SUPER_ADMIN])
            ->orderBy('display_name')
            ->get(['id', 'name', 'display_name']);

        return Inertia::render('AdminKampus/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'is_active', 'role_id']),
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

        // Get assignable roles (not Super Admin)
        $roles = Role::query()
            ->whereNotIn('name', [Role::SUPER_ADMIN])
            ->orderBy('display_name')
            ->get(['id', 'name', 'display_name', 'description']);

        return Inertia::render('AdminKampus/Users/Create', [
            'university' => [
                'id' => $authUser->university->id,
                'name' => $authUser->university->name,
                'short_name' => $authUser->university->short_name,
            ],
            'roles' => $roles,
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
            'role_ids' => 'required|array|min:1',
            'role_ids.*' => 'required|exists:roles,id',
            'is_active' => 'boolean',
        ]);

        // Verify no Super Admin role in selection
        $superAdminRole = Role::where('name', Role::SUPER_ADMIN)->first();
        if ($superAdminRole && in_array($superAdminRole->id, $validated['role_ids'])) {
            abort(403, 'Admin Kampus cannot assign Super Admin role.');
        }

        // Get the first role as primary role for backwards compatibility
        $primaryRoleId = $validated['role_ids'][0];

        // Create new user with auto-assigned university and primary role
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'position' => $validated['position'] ?? null,
            'university_id' => $authUser->university_id, // Auto-assign from admin's university
            'role_id' => $primaryRoleId,
            'is_active' => $validated['is_active'],
            'is_reviewer' => false, // Will be updated if Reviewer role is selected
        ]);

        // Attach all selected roles to the user
        $user->roles()->attach($validated['role_ids'], [
            'assigned_at' => now(),
            'assigned_by' => $authUser->id,
        ]);

        // Update is_reviewer flag if Reviewer role is selected
        $reviewerRole = Role::where('name', Role::REVIEWER)->first();
        if ($reviewerRole && in_array($reviewerRole->id, $validated['role_ids'])) {
            $user->update(['is_reviewer' => true]);
        }

        return redirect()->route('admin-kampus.users.index')
            ->with('success', 'User created successfully with assigned roles.');
    }

    /**
     * Display the specified user.
     */
    public function show(Request $request, User $user): Response
    {
        $user->load('role');
        $this->authorize('view', $user);

        $authUser = $request->user();
        $this->ensureUserBelongsToUniversityAndIsUser($user, $authUser);

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
        $user->load(['role', 'roles']);
        $this->authorize('update', $user);

        $authUser = $request->user();
        $this->ensureUserBelongsToUniversityAndIsUser($user, $authUser);

        // Get assignable roles (not Super Admin)
        $roles = Role::query()
            ->whereNotIn('name', [Role::SUPER_ADMIN])
            ->orderBy('display_name')
            ->get(['id', 'name', 'display_name', 'description']);

        // Get user's current role IDs
        $userRoleIds = $user->roles->pluck('id')->toArray();

        // If no roles in pivot table but has primary role, add it
        if (empty($userRoleIds) && $user->role_id) {
            $userRoleIds = [$user->role_id];
        }

        return Inertia::render('AdminKampus/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'position' => $user->position,
                'is_active' => $user->is_active,
                'role_ids' => $userRoleIds,
            ],
            'university' => [
                'id' => $authUser->university->id,
                'name' => $authUser->university->name,
                'short_name' => $authUser->university->short_name,
            ],
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $user->load('role');
        $this->authorize('update', $user);

        $authUser = $request->user();
        $this->ensureUserBelongsToUniversityAndIsUser($user, $authUser);

        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
            'role_ids' => 'required|array|min:1',
            'role_ids.*' => 'required|exists:roles,id',
            'is_active' => 'boolean',
        ]);

        // Verify no Super Admin role in selection
        $superAdminRole = Role::where('name', Role::SUPER_ADMIN)->first();
        if ($superAdminRole && in_array($superAdminRole->id, $validated['role_ids'])) {
            abort(403, 'Admin Kampus cannot assign Super Admin role.');
        }

        // Prepare data for update
        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'position' => $validated['position'] ?? null,
            'is_active' => $validated['is_active'] ?? $user->is_active,
            'role_id' => $validated['role_ids'][0], // Update primary role
        ];

        // Include password in update if provided
        if (! empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        // Update is_reviewer flag based on role selection
        $reviewerRole = Role::where('name', Role::REVIEWER)->first();
        $data['is_reviewer'] = $reviewerRole && in_array($reviewerRole->id, $validated['role_ids']);

        // Update user with all fields
        $user->update($data);

        // Sync roles in pivot table
        $user->roles()->sync(
            collect($validated['role_ids'])->mapWithKeys(fn ($roleId) => [
                $roleId => [
                    'assigned_at' => now(),
                    'assigned_by' => $authUser->id,
                ]
            ])->toArray()
        );

        return redirect()->route('admin-kampus.users.index')
            ->with('success', 'User updated successfully with assigned roles.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        $user->load('role');
        $this->authorize('delete', $user);

        $authUser = $request->user();
        $this->ensureUserBelongsToUniversityAndIsUser($user, $authUser);

        // Check if user has journals
        if ($user->journals()->count() > 0) {
            return back()->with('error', 'Cannot delete user because they still have associated journals. Please delete or reassign all of the user\'s journals before trying again.');
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
        $user->load('role');
        $this->authorize('toggleActiveStatus', $user);

        $authUser = $request->user();
        $this->ensureUserBelongsToUniversityAndIsUser($user, $authUser);

        // Toggle active status
        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        $status = $user->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "User {$status} successfully.");
    }

    /**
     * Ensure the user belongs to the admin's university and is not Super Admin.
     *
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
     */
    private function ensureUserBelongsToUniversityAndIsUser(User $user, User $authUser): void
    {
        // Load role for isSuperAdmin() check if not already loaded
        if (! $user->relationLoaded('role')) {
            $user->load('role');
        }

        // Verify user belongs to admin's university
        if ($user->university_id !== $authUser->university_id) {
            abort(404, 'User not found.');
        }

        // Verify it's not a Super Admin
        if ($user->isSuperAdmin()) {
            abort(404, 'User not found.');
        }
    }
}
