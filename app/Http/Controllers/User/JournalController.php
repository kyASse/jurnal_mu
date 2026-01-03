<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\ScientificField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class JournalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Journal::class);
        $user = Auth::user();

        $journals = Journal::where('user_id', $user->id)
            ->with(['scientificField', 'university'])
            ->latest()
            ->paginate(10);

        return Inertia::render('user/journals/index', [
            'journals' => $journals,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Journal::class);
        $scientificFields = ScientificField::select('id', 'name')->get();

        return Inertia::render('user/journals/create', [
            'scientificFields' => $scientificFields,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Journal::class);
        $user = Auth::user();

        // Ensure user has a university assigned
        if (!$user->university_id) {
            return back()->withErrors(['university_id' => 'Anda belum terdaftar di kampus manapun. Hubungi Admin Kampus.']);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'issn' => 'nullable|string|max:20',
            'e_issn' => 'nullable|string|max:20',
            'url' => 'required|url|max:500',
            'scientific_field_id' => 'required|exists:scientific_fields,id',
            'sinta_rank' => 'nullable|integer|min:1|max:6',
            'frequency' => 'required|string|max:50',
            'publisher' => 'nullable|string|max:255',
            'first_published_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
        ]);

        $validated['user_id'] = $user->id;
        $validated['university_id'] = $user->university_id;

        Journal::create($validated);

        return redirect()->route('journals.index')->with('success', 'Jurnal berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Journal $journal)
    {
        $this->authorize('update', $journal);

        $scientificFields = ScientificField::select('id', 'name')->get();

        return Inertia::render('user/journals/edit', [
            'journal' => $journal,
            'scientificFields' => $scientificFields,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Journal $journal)
    {
        $this->authorize('update', $journal);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'issn' => 'nullable|string|max:20',
            'e_issn' => 'nullable|string|max:20',
            'url' => 'required|url|max:500',
            'scientific_field_id' => 'required|exists:scientific_fields,id',
            'sinta_rank' => 'nullable|integer|min:1|max:6',
            'frequency' => 'required|string|max:50',
            'publisher' => 'nullable|string|max:255',
            'first_published_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
        ]);

        $journal->update($validated);

        return redirect()->route('journals.index')->with('success', 'Data jurnal berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Journal $journal)
    {
        $this->authorize('delete', $journal);

        $journal->delete();

        return redirect()->route('journals.index')->with('success', 'Jurnal berhasil dihapus.');
    }
}
