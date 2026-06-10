<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\HarvestJournalArticlesJob;
use App\Jobs\ImportArticlesXmlJob;
use App\Jobs\ProcessCsvImportJob;
use App\Models\ArticleImportLog;
use App\Models\CsvImport;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Spatie\SimpleExcel\SimpleExcelWriter;

/**
 * JournalController - Super Admin
 *
 * Manages journal viewing operations for Super Admin role.
 * Super Admin can view all journals from all universities.
 */
class JournalController extends Controller
{
    /**
     * Display a listing of all journals in the system.
     *
     * @route GET /admin/journals
     *
     * @features List all journals, search, filter by PTM/status/SINTA/scientific field, pagination
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Journal::class);

        $authUser = $request->user();

        // Base query - Super Admin sees all journals
        $query = Journal::query()
            ->with(['university', 'user', 'scientificField']);

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply university filter (Super Admin only)
        if ($request->filled('university_id')) {
            $query->where('university_id', $request->university_id);
        }

        // Apply status filter
        if ($request->filled('status')) {
            $query->byAssessmentStatus($request->status);
        }

        // Apply SINTA rank filter
        if ($request->filled('sinta_rank')) {
            $query->bySintaRank($request->sinta_rank);
        }

        // Apply scientific field filter
        if ($request->filled('scientific_field_id')) {
            $query->where('scientific_field_id', $request->scientific_field_id);
        }

        // Apply indexation filter
        if ($request->filled('indexation')) {
            $query->byIndexation($request->indexation);
        }

        // Paginate results
        $journals = $query
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($journal) => [
                'id' => $journal->id,
                'title' => $journal->title,
                'issn' => $journal->issn,
                'e_issn' => $journal->e_issn,
                'url' => $journal->url,
                'university' => [
                    'id' => $journal->university->id,
                    'name' => $journal->university->name,
                ],
                'user' => [
                    'id' => $journal->user->id,
                    'name' => $journal->user->name,
                    'email' => $journal->user->email,
                ],
                'scientific_field' => $journal->scientificField ? [
                    'id' => $journal->scientificField->id,
                    'name' => $journal->scientificField->name,
                ] : null,
                'sinta_rank' => $journal->sinta_rank,
                'sinta_rank_label' => $journal->sinta_rank_label,
                'is_active' => $journal->is_active,
                'approval_status' => $journal->approval_status,
                'indexation_labels' => $journal->indexation_labels,
                'created_at' => $journal->created_at->format('Y-m-d'),
            ]);

        // Get filter options (with cache)
        $universities = Cache::remember('universities.active.list', 3600, function () {
            return University::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code']);
        });

        $scientificFields = ScientificField::select('id', 'name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $sintaRanks = collect(Journal::getSintaRankOptions())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        $statusOptions = collect([
            ['value' => 'draft', 'label' => 'Draft'],
            ['value' => 'submitted', 'label' => 'Submitted'],
            ['value' => 'reviewed', 'label' => 'Reviewed'],
        ]);

        $indexationOptions = collect(Journal::getIndexationPlatforms())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        return Inertia::render('Admin/Journals/Index', [
            'journals' => $journals,
            'filters' => $request->only(['search', 'university_id', 'status', 'sinta_rank', 'scientific_field_id', 'indexation']),
            'universities' => $universities,
            'scientificFields' => $scientificFields,
            'sintaRanks' => $sintaRanks,
            'statusOptions' => $statusOptions,
            'indexationOptions' => $indexationOptions,
        ]);
    }

    /**
     * Show form to create a journal for Super Admin.
     */
    public function create(): Response
    {
        $this->authorize('create', Journal::class);

        $universities = University::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'short_name']);
        $users = User::orderBy('name')->get(['id', 'name', 'email', 'university_id']);
        $scientificFields = ScientificField::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        $sintaRanks = collect(Journal::getSintaRankOptions())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        return Inertia::render('Admin/Journals/Create', [
            'universities' => $universities,
            'users' => $users,
            'scientificFields' => $scientificFields,
            'sintaRanks' => $sintaRanks,
        ]);
    }

    /**
     * Store a newly created journal by Super Admin.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Journal::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'university_id' => 'required|exists:universities,id',
            'user_id' => 'required|exists:users,id',
            'scientific_field_id' => 'required|exists:scientific_fields,id',
            'e_issn' => 'required|string|max:20|regex:/^\d{4}-\d{3}[\dX]$/i|unique:journals,e_issn',
            'url' => 'required|url|max:255',
            'editorial_team_url' => 'nullable|url|max:255',
            'sinta_rank' => 'required|string|max:255',
            'frequency' => 'required|string|max:255',
            'oai_urls' => 'required|array|min:1',
            'oai_urls.*' => 'required|url|max:255',
        ], [
            'e_issn.regex' => 'Format E-ISSN harus xxxx-xxxx (karakter terakhir boleh \'X\').',
            'e_issn.unique' => 'E-ISSN sudah terdaftar.',
        ]);

        $validated['approval_status'] = 'approved';
        $validated['is_active'] = true;

        $journal = Journal::create($validated);

        return redirect()->route('admin.journals.show', $journal)
            ->with('success', 'Jurnal berhasil dibuat.');
    }

    /**
     * Display the specified journal with its assessments.
     *
     * @route GET /admin/journals/{journal}
     *
     * @features View journal details, view all assessments (read-only)
     */
    public function show(Journal $journal): Response
    {
        $this->authorize('view', $journal);

        // Eager load relationships
        $journal->load([
            'university',
            'user',
            'scientificField',
            'assessments' => function ($query) {
                $query->with(['user'])
                    ->orderBy('assessment_date', 'desc');
            },
        ]);

        $articlesCount = $journal->articles()->count();
        $articles = $journal->articles()
            ->orderBy('publication_date', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($article) => [
                'id' => $article->id,
                'title' => $article->title,
                'authors' => $article->authors,
                'publication_date' => $article->publication_date?->format('Y-m-d'),
                'abstract' => $article->abstract,
                'doi' => $article->doi,
                'url' => $article->article_url,
            ]);

        $importLogs = $journal->articleImportLogs()
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Admin/Journals/Show', [
            'journal' => [
                'id' => $journal->id,
                'title' => $journal->title,
                'issn' => $journal->issn,
                'e_issn' => $journal->e_issn,
                'url' => $journal->url,
                'publisher' => $journal->publisher,
                'frequency' => $journal->frequency,
                'frequency_label' => $journal->frequency_label,
                'first_published_year' => $journal->first_published_year,
                'editor_in_chief' => $journal->editor_in_chief,
                'email' => $journal->email,

                // SINTA
                'sinta_rank' => $journal->sinta_rank,
                'sinta_rank_label' => $journal->sinta_rank_label,

                // Accreditation (merged)
                'accreditation_label' => $journal->accreditation_label,
                'accreditation_start_year' => $journal->accreditation_start_year,
                'accreditation_end_year' => $journal->accreditation_end_year,
                'accreditation_sk_number' => $journal->accreditation_sk_number,
                'accreditation_sk_date' => $journal->accreditation_sk_date?->format('Y-m-d'),
                'accreditation_expiry_status' => $journal->accreditation_expiry_status,

                // Indexations
                'indexations' => $journal->indexations,
                'indexation_labels' => $journal->indexation_labels,

                // OAI-PMH
                'oai_urls' => $journal->oai_urls,

                'is_active' => $journal->is_active,
                'created_at' => $journal->created_at->format('Y-m-d H:i'),
                'updated_at' => $journal->updated_at->format('Y-m-d H:i'),
                'university' => [
                    'id' => $journal->university->id,
                    'name' => $journal->university->name,
                    'code' => $journal->university->code,
                ],
                'user' => [
                    'id' => $journal->user->id,
                    'name' => $journal->user->name,
                    'email' => $journal->user->email,
                ],
                'scientific_field' => $journal->scientificField ? [
                    'id' => $journal->scientificField->id,
                    'name' => $journal->scientificField->name,
                ] : null,
                'assessments' => $journal->assessments->map(fn ($assessment) => [
                    'id' => $assessment->id,
                    'assessment_date' => $assessment->assessment_date,
                    'period' => $assessment->period,
                    'status' => $assessment->status,
                    'status_label' => $assessment->status_label,
                    'status_color' => $assessment->status_color,
                    'total_score' => $assessment->total_score,
                    'max_score' => $assessment->max_score,
                    'percentage' => $assessment->percentage,
                    'grade' => $assessment->grade,
                    'submitted_at' => $assessment->submitted_at?->format('Y-m-d H:i'),
                    'reviewed_at' => $assessment->reviewed_at?->format('Y-m-d H:i'),
                    'user' => [
                        'id' => $assessment->user->id,
                        'name' => $assessment->user->name,
                    ],
                ]),
            ],
            'articles' => $articles,
            'articlesCount' => $articlesCount,
            'harvestLogs' => DB::table('oai_harvesting_logs')
                ->where('journal_id', $journal->id)
                ->orderByDesc('harvested_at')
                ->get(),
            'importLogs' => $importLogs,
            'isHarvestPending' => DB::table('jobs')
                ->where('queue', 'harvesting')
                ->where('payload', 'like', '%"journal_id":'.$journal->id.'%')
                ->exists(),
        ]);
    }

    /**
     * @route POST /admin/journals/{journal}/harvest
     *
     * @features Dispatch background job to harvest articles from OAI-PMH endpoint.
     */
    public function harvest(Request $request, Journal $journal): RedirectResponse
    {
        $this->authorize('update', $journal);

        if (empty($journal->oai_urls)) {
            return redirect()
                ->route('admin.journals.show', $journal)
                ->with('error', 'Jurnal ini belum memiliki OAI-PMH URL.');
        }

        $clearExisting = (bool) $request->input('force', false);
        HarvestJournalArticlesJob::dispatch($journal, null, $clearExisting)->onQueue('harvesting');

        $message = $clearExisting
            ? 'Permintaan force sync OAI telah dikirim.'
            : 'Permintaan sinkronisasi OAI telah dikirim.';

        return redirect()
            ->back()
            ->with('success', $message);
    }

    /**
     * @route PATCH /admin/journals/{journal}/oai-urls
     */
    public function updateOaiUrls(Request $request, Journal $journal): RedirectResponse
    {
        $this->authorize('update', $journal);

        $validated = $request->validate([
            'oai_urls' => 'required|array|min:1',
            'oai_urls.*' => 'required|url|max:255',
        ]);

        $journal->update(['oai_urls' => $validated['oai_urls']]);

        return redirect()->back()->with('success', 'OAI-PMH URLs berhasil diperbarui.');
    }

    /**
     * Show the journal import form.
     */
    public function import(): Response
    {
        $this->authorize('create', Journal::class);

        $universities = University::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        $users = User::orderBy('name')
            ->get(['id', 'name', 'email', 'university_id']);

        $csvImports = CsvImport::with(['user:id,name', 'university:id,name'])
            ->latest()
            ->take(15)
            ->get();

        return Inertia::render('Admin/Journals/Import', [
            'universities' => $universities,
            'users' => $users,
            'csvImports' => $csvImports,
        ]);
    }

    /**
     * Process the CSV import.
     */
    public function processImport(Request $request): RedirectResponse
    {
        $this->authorize('create', Journal::class);

        $validated = $request->validate([
            'university_id' => 'required|exists:universities,id',
            'user_id' => 'required|exists:users,id',
            'csv_file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        try {
            $file = $request->file('csv_file');
            $originalName = $file->getClientOriginalName();
            $filePath = $file->store('imports');

            $csvImport = CsvImport::create([
                'user_id' => (int) $validated['user_id'],
                'university_id' => (int) $validated['university_id'],
                'filename' => $originalName,
                'filepath' => $filePath,
                'status' => 'pending',
            ]);

            ProcessCsvImportJob::dispatch($csvImport->id);

        } catch (\Exception $e) {
            return redirect()->route('admin.journals.import')
                ->with('error', 'Terjadi kesalahan saat mengunggah file CSV: '.$e->getMessage());
        }

        return redirect()->route('admin.journals.import')
            ->with('success', 'File CSV berhasil diunggah dan sedang diproses di background.');
    }

    /**
     * Download CSV template for journal import.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="template_import_jurnal.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');

            // Write CSV headers
            fputcsv($file, [
                'title',
                'publisher',
                'issn',
                'e_issn',
                'publication_year',
                'sinta_rank',
                'url',
                'oai_url',
                'email',
                'phone',
            ]);

            // Write a sample row
            fputcsv($file, [
                'Jurnal Pendidikan dan Kebudayaan',
                'Universitas Negeri Kebangsaan',
                '2085-0001',
                '2085-0002',
                '2024',
                'sinta_2',
                'https://jurnal.negerikebangsaan.ac.id/index.php/jpk',
                'https://jurnal.negerikebangsaan.ac.id/index.php/jpk/oai',
                'jpk@negerikebangsaan.ac.id',
                '081234567890',
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function importXml(Request $request, Journal $journal)
    {
        if (auth()->user()->cannot('update', $journal)) {
            abort(403);
        }

        $request->validate([
            'xml_file' => 'required|file|mimes:xml|max:10240',
            'duplicate_strategy' => 'required|in:skip,update',
        ], [
            'xml_file.required' => 'Pilih file XML untuk diimport.',
            'xml_file.mimes' => 'Format file harus berupa XML.',
            'xml_file.max' => 'Ukuran file XML maksimal adalah 10MB.',
            'duplicate_strategy.required' => 'Pilih strategi penanganan duplikat.',
        ]);

        $file = $request->file('xml_file');
        $filename = $file->getClientOriginalName();
        $storedPath = $file->store('xml_imports');

        if ($storedPath === false) {
            return redirect()->back()->with('error', 'Gagal menyimpan file XML yang diunggah. Pastikan folder storage memiliki izin menulis.');
        }

        $log = ArticleImportLog::create([
            'journal_id' => $journal->id,
            'filename' => $filename,
            'duplicate_strategy' => $request->input('duplicate_strategy'),
            'status' => 'pending',
        ]);

        ImportArticlesXmlJob::dispatch($journal, $storedPath, $request->input('duplicate_strategy'), $log)->onQueue('harvesting');

        return redirect()->back()->with('success', 'File XML berhasil diunggah dan sedang diproses di background.');
    }

    public function export(Request $request, string $format)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        return response()->streamDownload(function () use ($format) {
            $writer = SimpleExcelWriter::create('php://output', $format);

            $journals = Journal::with(['university', 'user', 'scientificField'])
                ->orderBy('title')
                ->cursor();

            foreach ($journals as $journal) {
                $writer->addRow([
                    'ID' => $journal->id,
                    'Judul Jurnal' => $journal->title,
                    'ISSN' => $journal->issn,
                    'E-ISSN' => $journal->e_issn,
                    'URL Jurnal' => $journal->url,
                    'Editorial Team URL' => $journal->editorial_team_url,
                    'Publisher' => $journal->publisher,
                    'Frekuensi' => $journal->frequency,
                    'Tahun Terbit Pertama' => $journal->first_published_year,
                    'Universitas' => $journal->university?->name,
                    'Pengelola Jurnal' => $journal->user ? $journal->user->name . ' (' . $journal->user->email . ')' : '',
                    'Bidang Ilmu' => $journal->scientificField?->name,
                    'SINTA Rank' => $journal->sinta_rank,
                    'Mulai Akreditasi' => $journal->accreditation_start_year,
                    'Selesai Akreditasi' => $journal->accreditation_end_year,
                    'Nomor SK Akreditasi' => $journal->accreditation_sk_number,
                    'Tanggal SK Akreditasi' => $journal->accreditation_sk_date?->format('Y-m-d'),
                    'Indeksasi' => is_array($journal->indexations) ? implode(', ', $journal->indexations) : '',
                    'Status Aktif' => $journal->is_active ? 'Aktif' : 'Tidak Aktif',
                    'Status Persetujuan' => $journal->approval_status,
                    'Tanggal Dibuat' => $journal->created_at?->format('Y-m-d H:i:s'),
                ]);
            }

            $writer->close();
        }, "journals_all.{$format}");
    }
}
