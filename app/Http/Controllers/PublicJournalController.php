<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PublicJournalController
 *
 * Manages public journal viewing operations.
 * No authentication required.
 */
class PublicJournalController extends Controller
{
    /**
     * Display a publicly accessible listing of journals.
     *
     * @route GET /journals
     *
     * @features List all active journals, search, filter by university/SINTA/scientific field, pagination
     */
    public function index(Request $request): Response
    {
        // Base query - only show active journals
        $query = Journal::query()
            ->with(['university', 'scientificField'])
            ->where('is_active', true);

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply university filter
        if ($request->filled('university_id')) {
            $query->where('university_id', $request->university_id);
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

        // Apply Dikti accreditation filter
        if ($request->filled('accreditation_grade')) {
            $query->byAccreditationGrade($request->accreditation_grade);
        }

        // Paginate results
        $journals = $query
            ->orderBy('title')
            ->paginate(12)
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
                'scientific_field' => $journal->scientificField ? [
                    'id' => $journal->scientificField->id,
                    'name' => $journal->scientificField->name,
                ] : null,
                'sinta_rank' => $journal->sinta_rank,
                'sinta_rank_label' => $journal->sinta_rank_label,
            ]);

        // Get filter options
        $universities = University::select('id', 'name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $scientificFields = ScientificField::select('id', 'name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $sintaRanks = collect([
            ['value' => 1, 'label' => 'SINTA 1'],
            ['value' => 2, 'label' => 'SINTA 2'],
            ['value' => 3, 'label' => 'SINTA 3'],
            ['value' => 4, 'label' => 'SINTA 4'],
            ['value' => 5, 'label' => 'SINTA 5'],
            ['value' => 6, 'label' => 'SINTA 6'],
        ]);

        $indexationOptions = collect(Journal::getIndexationPlatforms())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        $accreditationGradeOptions = collect(Journal::getAccreditationGrades())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values();

        return Inertia::render('Journals/Index', [
            'journals' => $journals,
            'filters' => $request->only(['search', 'university_id', 'sinta_rank', 'scientific_field_id', 'indexation', 'accreditation_grade']),
            'universities' => $universities,
            'scientificFields' => $scientificFields,
            'sintaRanks' => $sintaRanks,
            'indexationOptions' => $indexationOptions,
            'accreditationGradeOptions' => $accreditationGradeOptions,
        ]);
    }

    /**
     * Display the specified journal.
     *
     * @route GET /journals/{journal}
     *
     * @features View public journal details
     */
    public function show(Journal $journal): Response
    {
        // Only show active journals to public
        if (! $journal->is_active) {
            abort(404);
        }

        // Eager load relationships
        $journal->load([
            'university',
            'scientificField',
        ]);

        return Inertia::render('Journals/Show', [
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
                'sinta_rank' => $journal->sinta_rank,
                'sinta_rank_label' => $journal->sinta_rank_label,
                'accreditation_status' => $journal->accreditation_status,
                'accreditation_status_label' => $journal->accreditation_status_label,
                'accreditation_grade' => $journal->accreditation_grade,
                'university' => [
                    'id' => $journal->university->id,
                    'name' => $journal->university->name,
                    'code' => $journal->university->code,
                ],
                'scientific_field' => $journal->scientificField ? [
                    'id' => $journal->scientificField->id,
                    'name' => $journal->scientificField->name,
                ] : null,
            ],
        ]);
    }
}
