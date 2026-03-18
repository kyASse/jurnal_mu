<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJournalRequest;
use App\Http\Requests\UpdateJournalRequest;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Services\JournalCoverService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class JournalController extends Controller
{
    protected JournalCoverService $coverService;

    public function __construct(JournalCoverService $coverService)
    {
        $this->coverService = $coverService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Journal::class);
        $user = Auth::user();

        $query = Journal::where('user_id', $user->id)
            ->with(['scientificField', 'university']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('issn', 'like', "%{$search}%")
                    ->orWhere('e_issn', 'like', "%{$search}%");
            });
        }

        // Filter by SINTA rank
        if ($sintaRank = $request->input('sinta_rank')) {
            $query->where('sinta_rank', $sintaRank);
        }

        // Filter by scientific field
        if ($fieldId = $request->input('scientific_field_id')) {
            $query->where('scientific_field_id', $fieldId);
        }

        // Filter by approval status
        if ($status = $request->input('approval_status')) {
            $query->where('approval_status', $status);
        }

        $journals = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('User/Journals/Index', [
            'journals' => $journals,
            'filters' => $request->only(['search', 'sinta_rank', 'scientific_field_id', 'approval_status']),
            'scientificFields' => ScientificField::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Journal::class);
        $scientificFields = ScientificField::select('id', 'name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('User/Journals/Create', [
            'scientificFields' => $scientificFields,
            'sintaRankOptions' => Journal::getSintaRankOptions(),
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

        Log::info('JournalController@store - Start', [
            'actor_id' => $user?->id,
            'request_method' => $request->method(),
            'request_all' => $request->except(['cover_image']),
        ]);

        // Ensure user has a university assigned
        if (! $user->university_id) {
            Log::warning('JournalController@store - Missing university assignment', [
                'actor_id' => $user?->id,
            ]);

            return back()->with('error', 'Anda belum terdaftar di kampus manapun. Hubungi Admin Kampus untuk mendaftarkan akun Anda ke universitas.');
        }

        try {
            $validated = $request->validated();
            $validated['user_id'] = $user->id;
            $validated['university_id'] = $user->university_id;

            // Bug fix: unset cover_image so UploadedFile object is not passed to Journal::create()
            // The file is handled separately after the record is created.
            unset($validated['cover_image']);

            $journal = Journal::create($validated);

            // Handle optional cover image upload
            if ($request->hasFile('cover_image')) {
                $journal->update(['cover_image' => $this->coverService->upload($request->file('cover_image'), $journal)]);
            }

            Log::info('JournalController@store - Successfully created', [
                'actor_id' => $user?->id,
                'journal_id' => $journal->id,
                'journal_title' => $journal->title,
                'approval_status' => $journal->approval_status,
                'is_active' => $journal->is_active,
            ]);

            return redirect()->route('user.journals.index')->with('success', 'Jurnal berhasil ditambahkan.');
        } catch (\Throwable $e) {
            Log::error('JournalController@store - Failed to create', [
                'actor_id' => $user?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Journal $journal)
    {
        $this->authorize('view', $journal);

        $journal->load([
            'scientificField',
            'university',
            'assessments' => fn ($q) => $q->latest()->limit(10),
            'articles' => fn ($q) => $q->latest()->limit(10),
        ]);

        return Inertia::render('User/Journals/Show', [
            'journal' => $journal,
            'statistics' => [
                'total_assessments' => $journal->assessments()->count(),
                'latest_score' => $journal->assessments()->latest()->first()?->total_score,
                'total_articles' => $journal->articles()->count(),
            ],
        ]);
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
            'sintaRankOptions' => Journal::getSintaRankOptions(),
            'indexationOptions' => $this->getIndexationOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateJournalRequest $request, Journal $journal)
    {
        $this->authorize('update', $journal);

        $user = Auth::user();
        $before = [
            'title' => $journal->title,
            'issn' => $journal->issn,
            'e_issn' => $journal->e_issn,
            'approval_status' => $journal->approval_status,
            'is_active' => $journal->is_active,
        ];

        Log::info('JournalController@update - Start', [
            'actor_id' => $user?->id,
            'journal_id' => $journal->id,
            'request_method' => $request->method(),
            'request_all' => $request->except(['cover_image']),
            'before' => $before,
        ]);

        try {
            $validated = $request->validated();

            // Handle optional cover image upload
            if ($request->hasFile('cover_image')) {
                $validated['cover_image'] = $this->coverService->upload($request->file('cover_image'), $journal);
            } else {
                unset($validated['cover_image']);
            }

            $journal->update($validated);
            $journal->refresh();

            Log::info('JournalController@update - Successfully updated', [
                'actor_id' => $user?->id,
                'journal_id' => $journal->id,
                'before' => $before,
                'after' => [
                    'title' => $journal->title,
                    'issn' => $journal->issn,
                    'e_issn' => $journal->e_issn,
                    'approval_status' => $journal->approval_status,
                    'is_active' => $journal->is_active,
                ],
            ]);

            return redirect()->route('user.journals.index')->with('success', 'Data jurnal berhasil diperbarui.');
        } catch (\Throwable $e) {
            Log::error('JournalController@update - Failed to update', [
                'actor_id' => $user?->id,
                'journal_id' => $journal->id,
                'before' => $before,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Upload or replace the cover image for a journal (dedicated endpoint).
     *
     * @route PATCH /user/journals/{journal}/cover
     *
     * @features Upload cover image; replaces existing cover; returns to journal show page
     */
    public function uploadCover(Request $request, Journal $journal)
    {
        $this->authorize('update', $journal);

        $request->validate([
            'cover_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048|dimensions:min_width=300,min_height=400',
        ], [
            'cover_image.required' => 'Pilih file gambar untuk diupload.',
            'cover_image.image' => 'File cover harus berupa gambar.',
            'cover_image.mimes' => 'Format cover harus JPEG, PNG, JPG, atau WebP.',
            'cover_image.max' => 'Ukuran file cover maksimal 2MB.',
            'cover_image.dimensions' => 'Resolusi cover minimal 300x400 piksel.',
        ]);

        $journal->update(['cover_image' => $this->coverService->upload($request->file('cover_image'), $journal)]);

        return redirect()->route('user.journals.show', $journal)
            ->with('success', 'Cover jurnal berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Journal $journal)
    {
        $this->authorize('delete', $journal);

        $user = Auth::user();
        $snapshot = [
            'title' => $journal->title,
            'issn' => $journal->issn,
            'e_issn' => $journal->e_issn,
            'approval_status' => $journal->approval_status,
            'is_active' => $journal->is_active,
        ];

        Log::info('JournalController@destroy - Start', [
            'actor_id' => $user?->id,
            'journal_id' => $journal->id,
            'journal' => $snapshot,
        ]);

        try {
            $journal->delete();

            Log::info('JournalController@destroy - Successfully deleted', [
                'actor_id' => $user?->id,
                'journal_id' => $journal->id,
                'journal' => $snapshot,
            ]);

            return redirect()->route('user.journals.index')->with('success', 'Jurnal berhasil dihapus.');
        } catch (\Throwable $e) {
            Log::error('JournalController@destroy - Failed to delete', [
                'actor_id' => $user?->id,
                'journal_id' => $journal->id,
                'journal' => $snapshot,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Get available indexation platforms
     */
    private function getIndexationOptions(): array
    {
        return collect(Journal::getIndexationPlatforms())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->toArray();
    }
}
