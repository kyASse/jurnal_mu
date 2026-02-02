<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\ScientificField;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * JournalController - Admin Kampus
 *
 * Manages journal viewing operations for Admin Kampus role.
 * Admin Kampus can only view journals from their own university.
 */
class JournalController extends Controller
{
    /**
     * Display a listing of journals for the Admin Kampus's university.
     *
     * @route GET /admin-kampus/journals
     *
     * @features List journals, search, filter by status/SINTA/scientific field, pagination
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Journal::class);

        $authUser = $request->user();

        // Base query - scoped to Admin Kampus's university
        $query = Journal::query()
            ->with(['university', 'user', 'scientificField', 'latestAssessment'])
            ->forUniversity($authUser->university_id);

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // // Deprecated: Status filter is no longer used
        // if ($request->filled('status')) {
        //     $query->byAssessmentStatus($request->status);
        // }

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

        // // Deprecated: Accreditation Dikti filter is no longer used
        // if ($request->filled('accreditation_grade')) {
        //     $query->byAccreditationGrade($request->accreditation_grade);
        // }

        // Apply pembinaan period filter (Phase 2)
        if ($request->filled('pembinaan_period')) {
            $query->byPembinaanPeriod($request->pembinaan_period);
        }

        // Apply pembinaan year filter (Phase 2)
        if ($request->filled('pembinaan_year')) {
            $query->byPembinaanYear($request->pembinaan_year);
        }

        // Apply participation filter (Phase 2)
        if ($request->filled('participation')) {
            $query->byParticipation($request->participation);
        }

        // Apply approval status filter (Phase 2)
        if ($request->filled('approval_status')) {
            $query->byApprovalStatus($request->approval_status);
        }

        // Calculate statistics for dashboard (before pagination)
        $statistics = $this->calculateJournalStatistics($authUser->university_id);

        // Paginate results
        $journals = $query
            ->orderBy('title')
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
                'assessment_status' => $journal->latestAssessment?->status ?? null,
                'assessment_status_label' => $journal->latestAssessment?->status_label ?? 'Belum Ada',
                'latest_score' => $journal->latestAssessment?->percentage ?? null,
                'created_at' => $journal->created_at->format('Y-m-d'),
            ]);

        // Get filter options
        $scientificFields = ScientificField::select('id', 'name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $sintaRanks = collect([
            ['value' => 'non_sinta', 'label' => 'Non Sinta'],
            ['value' => 1, 'label' => 'SINTA 1'],
            ['value' => 2, 'label' => 'SINTA 2'],
            ['value' => 3, 'label' => 'SINTA 3'],
            ['value' => 4, 'label' => 'SINTA 4'],
            ['value' => 5, 'label' => 'SINTA 5'],
            ['value' => 6, 'label' => 'SINTA 6'],
        ]);

        // Deprecated: Status filter is no longer used in Admin Kampus Journals
        // $statusOptions = collect([
        //     ['value' => 'draft', 'label' => 'Draft'],
        //     ['value' => 'submitted', 'label' => 'Submitted'],
        //     ['value' => 'reviewed', 'label' => 'Reviewed'],
        // ]);

        $indexationOptions = collect(Journal::getIndexationPlatforms())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        // Deprecated: Dikti Accreditation Grade filter is no longer used in Admin Kampus Journals
        // $accreditationGradeOptions = collect(Journal::getAccreditationGrades())
        //     ->map(fn($label, $value) => ['value' => $value, 'label' => $label])
        //     ->values();

        $indexationOptions = collect(Journal::getIndexationPlatforms())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        $accreditationGradeOptions = collect(Journal::getAccreditationGrades())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        // Phase 2: Get pembinaan periods and years for filters
        $pembinaanPeriods = \App\Models\Pembinaan::query()
            ->select('name')
            ->distinct()
            ->orderBy('name')
            ->pluck('name')
            ->map(fn ($name) => ['value' => $name, 'label' => $name])
            ->values();

        $pembinaanYears = \App\Models\PembinaanRegistration::query()
            ->selectRaw('YEAR(registered_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->map(fn ($year) => ['value' => (string) $year, 'label' => (string) $year])
            ->values();

        $participationOptions = collect([
            ['value' => 'sudah_ikut', 'label' => 'Sudah Ikut Pembinaan'],
            ['value' => 'belum_ikut', 'label' => 'Belum Ikut Pembinaan'],
        ]);

        $approvalStatusOptions = collect([
            ['value' => 'approved', 'label' => 'Sudah Di-Approve'],
            ['value' => 'pending', 'label' => 'Menunggu Approval'],
            ['value' => 'rejected', 'label' => 'Ditolak'],
        ]);

        return Inertia::render('AdminKampus/Journals/Index', [
            'journals' => $journals,
            'statistics' => $statistics,
            'filters' => $request->only([
                'search',
                'sinta_rank',
                'scientific_field_id',
                'indexation',
                'pembinaan_period',
                'pembinaan_year',
                'participation',
                'approval_status',
            ]),
            'scientificFields' => $scientificFields,
            'sintaRanks' => $sintaRanks,
            'indexationOptions' => $indexationOptions,
            'pembinaanPeriods' => $pembinaanPeriods,
            'pembinaanYears' => $pembinaanYears,
            'participationOptions' => $participationOptions,
            'approvalStatusOptions' => $approvalStatusOptions,
            // Deprecated filters - no longer passed to frontend
            // 'statusOptions' => $statusOptions,
            // 'accreditationGradeOptions' => $accreditationGradeOptions,
        ]);
    }

    /**
     * Calculate journal statistics for the dashboard.
     *
     * Aggregates data by indexation platforms, SINTA ranks, and scientific fields.
     */
    private function calculateJournalStatistics(int $universityId): array
    {
        // Get all journals for this university
        $journals = Journal::where('university_id', $universityId)
            ->with('scientificField')
            ->get();

        $totalJournals = $journals->count();

        // Calculate totals
        $indexedJournals = $journals->filter(fn ($j) => ! empty($j->indexations))->count();
        $sintaJournals = $journals->filter(fn ($j) => $j->sinta_rank !== null)->count();
        $nonSintaJournals = $totalJournals - $sintaJournals;

        // Aggregate by indexation
        $indexationCounts = [];
        foreach ($journals as $journal) {
            if ($journal->indexations && is_array($journal->indexations)) {
                foreach (array_keys($journal->indexations) as $platform) {
                    $indexationCounts[$platform] = ($indexationCounts[$platform] ?? 0) + 1;
                }
            }
        }

        $byIndexation = collect($indexationCounts)
            ->map(fn ($count, $name) => [
                'name' => $name,
                'count' => $count,
                'percentage' => $totalJournals > 0 ? round(($count / $totalJournals) * 100, 1) : 0,
            ])
            ->sortByDesc('count')
            ->values()
            ->toArray();

        // Aggregate by SINTA rank
        $sintaGroups = $journals->groupBy('sinta_rank');
        $byAccreditation = [];

        // Non-Sinta journals
        $byAccreditation[] = [
            'sinta_rank' => null,
            'label' => 'Non-Sinta',
            'count' => $nonSintaJournals,
            'percentage' => $totalJournals > 0 ? round(($nonSintaJournals / $totalJournals) * 100, 1) : 0,
        ];

        // SINTA 1-6
        for ($rank = 1; $rank <= 6; $rank++) {
            $count = $sintaGroups->get($rank)?->count() ?? 0;
            $byAccreditation[] = [
                'sinta_rank' => $rank,
                'label' => "SINTA {$rank}",
                'count' => $count,
                'percentage' => $totalJournals > 0 ? round(($count / $totalJournals) * 100, 1) : 0,
            ];
        }

        // Aggregate by scientific field
        $fieldGroups = $journals->filter(fn ($j) => $j->scientificField !== null)
            ->groupBy('scientific_field_id');

        $byScientificField = $fieldGroups->map(function ($group) use ($totalJournals) {
            $field = $group->first()->scientificField;
            $count = $group->count();

            return [
                'id' => $field->id,
                'name' => $field->name,
                'count' => $count,
                'percentage' => $totalJournals > 0 ? round(($count / $totalJournals) * 100, 1) : 0,
            ];
        })
            ->sortByDesc('count')
            ->values()
            ->toArray();

        return [
            'totals' => [
                'total_journals' => $totalJournals,
                'indexed_journals' => $indexedJournals,
                'sinta_journals' => $sintaJournals,
                'non_sinta_journals' => $nonSintaJournals,
            ],
            'by_indexation' => $byIndexation,
            'by_accreditation' => $byAccreditation,
            'by_scientific_field' => $byScientificField,
        ];
    }

    /**
     * Display the specified journal with its assessments.
     *
     * @route GET /admin-kampus/journals/{journal}
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

        return Inertia::render('AdminKampus/Journals/Show', [
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
                'sinta_indexed_date' => $journal->sinta_indexed_date?->format('Y-m-d'),

                // Dikti Accreditation
                'accreditation_status' => $journal->accreditation_status,
                'accreditation_status_label' => $journal->accreditation_status_label,
                'accreditation_grade' => $journal->accreditation_grade,
                'dikti_accreditation_number' => $journal->dikti_accreditation_number,
                'dikti_accreditation_label' => $journal->dikti_accreditation_label,
                'accreditation_issued_date' => $journal->accreditation_issued_date?->format('Y-m-d'),
                'accreditation_expiry_date' => $journal->accreditation_expiry_date?->format('Y-m-d'),
                'is_accreditation_expired' => $journal->is_accreditation_expired,
                'accreditation_expiry_status' => $journal->accreditation_expiry_status,

                // Indexations
                'indexations' => $journal->indexations,
                'indexation_labels' => $journal->indexation_labels,

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
        ]);
    }
}
