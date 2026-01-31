<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJournalRequest;
use App\Http\Requests\UpdateJournalRequest;
use App\Models\Journal;
use App\Models\ScientificField;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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

        return Inertia::render('User/Journals/Index', [
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

        return Inertia::render('User/Journals/Create', [
            'scientificFields' => $scientificFields,
            'indexationOptions' => $this->getIndexationOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreJournalRequest $request)
    {
        $this->authorize('create', Journal::class);
        $user = Auth::user();

        // Ensure user has a university assigned
        if (! $user->university_id) {
            return back()->withErrors(['university_id' => 'Anda belum terdaftar di kampus manapun. Hubungi Admin Kampus.']);
        }

        $validated = $request->validated();
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

        return Inertia::render('User/Journals/Edit', [
            'journal' => $journal,
            'scientificFields' => $scientificFields,
            'indexationOptions' => $this->getIndexationOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateJournalRequest $request, Journal $journal)
    {
        $this->authorize('update', $journal);

        $journal->update($request->validated());

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

    /**
     * Get available indexation platforms
     */
    private function getIndexationOptions(): array
    {
        return [
            ['value' => 'Scopus', 'label' => 'Scopus'],
            ['value' => 'WoS', 'label' => 'Web of Science (WoS)'],
            ['value' => 'DOAJ', 'label' => 'DOAJ (Directory of Open Access Journals)'],
            ['value' => 'Copernicus', 'label' => 'Copernicus'],
            ['value' => 'Google Scholar', 'label' => 'Google Scholar'],
            ['value' => 'Garuda', 'label' => 'Garuda (Ristekdikti)'],
            ['value' => 'Dimensions', 'label' => 'Dimensions'],
            ['value' => 'BASE', 'label' => 'BASE (Bielefeld Academic Search Engine)'],
        ];
    }
}
