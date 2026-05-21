<?php

namespace App\Http\Controllers;

use App\Models\University;
use App\Models\Journal;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PublicUniversityController extends Controller
{
    // Skeleton methods to be implemented next
    public function index(Request $request): Response
    {
        $query = University::query()
            ->where('is_active', true)
            ->withCount(['journals' => function ($q) {
                $q->where('is_active', true)
                  ->where('approval_status', 'approved');
            }]);

        // Apply Search Filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('short_name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Apply Accreditation Filter
        if ($request->filled('accreditation')) {
            $query->where('accreditation_status', $request->accreditation);
        }

        // Apply Sorting
        $sortBy = $request->input('sort', 'name');
        if ($sortBy === 'journals_count') {
            $query->orderBy('journals_count', 'desc');
        } else {
            $query->orderBy('name', 'asc');
        }

        $universities = $query->paginate(12)->withQueryString();

        // Get available accreditations for filter options
        $accreditationOptions = University::whereNotNull('accreditation_status')
            ->distinct()
            ->pluck('accreditation_status');

        return Inertia::render('Browse/Universities', [
            'universities' => $universities,
            'filters' => $request->only(['search', 'accreditation', 'sort']),
            'accreditationOptions' => $accreditationOptions,
        ]);
    }

    public function show(University $university, Request $request): Response
    {
        return Inertia::render('Browse/UniversityProfile', []);
    }
}
