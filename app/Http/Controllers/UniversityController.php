<?php

namespace App\Http\Controllers;

abstract class Controller
{
    public function index(Request $request)
    {
        // Check if user can view any universities
        $this->authorize('viewAny', University::class);

        if ($request->user()->isSuperAdmin()) {
            $universities = University::with('journals')
                ->search($request->search)
                ->paginate(10);
        } else {
            // Admin Kampus & User only see their university
            $universities = University::where('id', $request->user()->university_id)
                ->with('journals')
                ->paginate(10);
        }

        return Inertia::render('Admin/Universities/Index', [
            'universities' => $universities,
        ]);
    }

    public function store(Request $request)
    {
        // Check if user can create university
        $this->authorize('create', University::class);

        $validated = $request->validate([
            'code' => 'required|unique:universities',
            'name' => 'required',
            // ... other fields
        ]);

        $university = University::create($validated);

        return redirect()->route('admin.universities.index')
            ->with('success', 'University created successfully');
    }

    public function update(Request $request, University $university)
    {
        // Check if user can update this university
        $this->authorize('update', $university);

        $validated = $request->validate([
            'name' => 'required',
            // ... other fields
        ]);

        $university->update($validated);

        return redirect()->route('admin.universities.index')
            ->with('success', 'University updated successfully');
    }

    public function destroy(University $university)
    {
        // Check if user can delete this university
        $this->authorize('delete', $university);

        $university->delete();

        return redirect()->route('admin.universities.index')
            ->with('success', 'University deleted successfully');
    }
}
