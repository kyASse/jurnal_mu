<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UniversityController extends Controller
{
    /**
     * Display a listing of universities.
     */
    public function index(Request $request): Response
    {
        // Check authirization
        $this->authorize('viewAny', University::class);

        // Base quewry
        $query = University::query();

        // Super admin can see all universities
        if ($request->user()->isSuperAdmin()) {
            // Apply search filter
            if ($request->has('search') && $request->search) {
                $query->search($request->search);
            }

            // Apply active filter
            if ($request->has('is_active') && $request->is_active) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Apply accreditation filter
            if ($request->has('accreditation_status') && $request->accreditation_status) {
                $query->byAccreditation($request->accreditation_status);
            }

            // Apply cluster filter
            if ($request->has('cluster') && $request->cluster) {
                $query->byCluster($request->cluster);
            }

            // Get universities with counts
            $universities = $query
                ->withCount(['users', 'journals'])
                ->orderBy('name')
                ->paginate(10)
                ->withQueryString()
                ->through(fn ($university) => [
                    'id' => $university->id,
                    'code' => $university->code,
                    'ptm_code' => $university->ptm_code,
                    'name' => $university->name,
                    'short_name' => $university->short_name,
                    'city' => $university->city,
                    'province' => $university->province,
                    'phone' => $university->phone,
                    'email' => $university->email,
                    'website' => $university->website,
                    'logo_url' => $university->logo_url,
                    'accreditation_status' => $university->accreditation_status,
                    'cluster' => $university->cluster,
                    'profile_description' => $university->profile_description,
                    'is_active' => $university->is_active,
                    'pending_updates' => $university->pending_updates,
                    'users_count' => $university->users_count,
                    'journals_count' => $university->journals_count,
                    'full_address' => $university->full_address,
                    'created_at' => $university->created_at->format('Y-m-d'),
                ]);
        } else {
            // Admin Kampus & User can only see their own university
            $universities = $query
                ->where('id', $request->user()->university_id)
                ->withCount(['users', 'journals'])
                ->paginate(10)
                ->through(fn ($university) => [
                    'id' => $university->id,
                    'code' => $university->code,
                    'name' => $university->name,
                    'short_name' => $university->short_name,
                    'city' => $university->city,
                    'province' => $university->province,
                    'users_count' => $university->users_count,
                    'journals_count' => $university->journals_count,
                ]);
        }

        // Get pending updates for Super Admin
        $pendingUniversities = [];
        if ($request->user()->isSuperAdmin()) {
            $pendingUniversities = University::whereNotNull('pending_updates')
                ->where('pending_updates', '!=', '[]')
                ->get()
                ->map(fn ($university) => [
                    'id' => $university->id,
                    'name' => $university->name,
                    'code' => $university->code,
                    'ptm_code' => $university->ptm_code,
                    'short_name' => $university->short_name,
                    'pending_updates' => $university->pending_updates,
                ]);
        }

        return Inertia::render('Admin/Universities/Index', [
            'universities' => $universities,
            'pendingUniversities' => $pendingUniversities,
            'filters' => $request->only(['search', 'is_active', 'accreditation_status', 'cluster']),
            'can' => [
                'create' => $request->user()->can('create', University::class),
            ],
        ]);
    }

    /**
     * Show the form for creating a new university.
     */
    public function create(Request $request): Response
    {
        // Check authorization
        $this->authorize('create', University::class);

        return Inertia::render('Admin/Universities/Create');
    }

    /**
     * Store a newly created university in storage.
     */
    public function store(Request $request)
    {
        // Check authorization
        $this->authorize('create', University::class);

        // Validate request
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:universities,code',
            'ptm_code' => 'nullable|string|max:10|unique:universities,ptm_code',
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'logo_url' => 'nullable|url|max:500',
            'accreditation_status' => 'nullable|string|max:50',
            'cluster' => 'nullable|string|max:50',
            'profile_description' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    $wordCount = count(preg_split('/\s+/', trim($value ?? ''), -1, PREG_SPLIT_NO_EMPTY));
                    if ($wordCount > 250) {
                        $fail('Deskripsi tidak boleh lebih dari 250 kata.');
                    }
                }
            ],
            'is_active' => 'boolean',
        ]);

        // Create university
        $university = University::create($validated);

        // Redirect to universities index with success message
        return redirect()->route('admin.universities.index')
            ->with('success', 'University created successfully.');
    }

    /**
     * Display the specified university.
     */
    public function show(Request $request, University $university): Response
    {
        // Check authorization
        $this->authorize('view', $university);

        // Load relationships
        $university->load(['users.role', 'journals']);

        return Inertia::render('Admin/Universities/Show', [
            'university' => [
                'id' => $university->id,
                'code' => $university->code,
                'ptm_code' => $university->ptm_code,
                'name' => $university->name,
                'short_name' => $university->short_name,
                'address' => $university->address,
                'city' => $university->city,
                'province' => $university->province,
                'postal_code' => $university->postal_code,
                'phone' => $university->phone,
                'email' => $university->email,
                'website' => $university->website,
                'logo_url' => $university->logo_url,
                'accreditation_status' => $university->accreditation_status,
                'cluster' => $university->cluster,
                'profile_description' => $university->profile_description,
                'is_active' => $university->is_active,
                'full_address' => $university->full_address,
                'created_at' => $university->created_at->format('Y-m-d H:i'),
                'updated_at' => $university->updated_at->format('Y-m-d H:i'),
                'users_count' => $university->users->count(),
                'journals_count' => $university->journals->count(),
            ],
            'users' => $university->users->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->display_name,
            ]),
            'journals' => $university->journals->map(fn ($journal) => [
                'id' => $journal->id,
                'title' => $journal->title,
                'issn' => $journal->issn,
            ]),
            'can' => [
                'update' => $request->user()->can('update', $university),
                'delete' => $request->user()->can('delete', $university),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified university.
     */
    public function edit(Request $request, University $university): Response
    {
        // Check authorization
        $this->authorize('update', $university);

        return Inertia::render('Admin/Universities/Edit', [
            'university' => [
                'id' => $university->id,
                'code' => $university->code,
                'ptm_code' => $university->ptm_code,
                'name' => $university->name,
                'short_name' => $university->short_name,
                'address' => $university->address,
                'city' => $university->city,
                'province' => $university->province,
                'postal_code' => $university->postal_code,
                'phone' => $university->phone,
                'email' => $university->email,
                'website' => $university->website,
                'logo_url' => $university->logo_url,
                'accreditation_status' => $university->accreditation_status,
                'cluster' => $university->cluster,
                'profile_description' => $university->profile_description,
                'is_active' => $university->is_active,
            ],
        ]);
    }

    /**
     * Update the specified university in storage.
     */
    public function update(Request $request, University $university)
    {
        // Check authorization
        $this->authorize('update', $university);

        // Validate request
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:universities,code,'.$university->id,
            'ptm_code' => 'nullable|string|max:10|unique:universities,ptm_code,'.$university->id,
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'logo_url' => 'nullable|url|max:500',
            'logo_file' => 'nullable|image|max:2048',
            'accreditation_status' => 'nullable|string|max:50',
            'cluster' => 'nullable|string|max:50',
            'profile_description' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    $wordCount = count(preg_split('/\s+/', trim($value ?? ''), -1, PREG_SPLIT_NO_EMPTY));
                    if ($wordCount > 250) {
                        $fail('Deskripsi tidak boleh lebih dari 250 kata.');
                    }
                }
            ],
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('logo_file')) {
            // Delete the old logo file if it exists in storage (path starts with '/storage/logos/')
            if ($university->logo_url && Str::startsWith($university->logo_url, '/storage/logos/')) {
                $oldPath = str_replace('/storage/', '', $university->logo_url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // Store the new logo file under 'logos' directory in the 'public' disk
            $file = $request->file('logo_file');
            $path = $file->store('logos', 'public');

            // Save the URL path '/storage/logos/filename' into the logo_url field
            $validated['logo_url'] = '/storage/'.$path;
        }

        // Unset logo_file from the validated fields before calling update
        unset($validated['logo_file']);

        // Update university
        $university->update($validated);

        // Redirect with success message
        return redirect()->route('admin.universities.index')
            ->with('success', 'University updated successfully.');
    }

    /**
     * Remove the specified university from storage.
     */
    public function destroy(Request $request, University $university)
    {
        // Check authorization
        $this->authorize('delete', $university);

        // Check if university has journals
        if ($university->journals()->count() > 0) {
            return back()->with('error', 'Cannot delete university with existing journals.');
        }

        // Soft delete university
        $university->delete();

        // Redirect with success message
        return redirect()->route('admin.universities.index')
            ->with('success', 'University deleted successfully.');
    }

    /**
     * Toggle active status of the university.
     */
    public function toggleActive(Request $request, University $university)
    {
        // Check authorization
        $this->authorize('update', $university);

        // Toggle active status
        $university->update([
            'is_active' => ! $university->is_active,
        ]);

        $status = $university->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "University {$status} successfully.");
    }

    /**
     * Approve or reject pending profile updates.
     */
    public function handlePendingUpdates(Request $request, University $university)
    {
        $this->authorize('update', $university);

        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
        ]);

        if (empty($university->pending_updates)) {
            return back()->with('error', 'Tidak ada pembaruan profil yang menunggu persetujuan.');
        }

        if ($validated['action'] === 'approve') {
            $university->update($university->pending_updates);
            $university->update(['pending_updates' => null]);

            return back()->with('success', 'Pembaruan profil universitas disetujui.');
        } else {
            $university->update(['pending_updates' => null]);

            return back()->with('success', 'Pembaruan profil universitas ditolak.');
        }
    }
}
