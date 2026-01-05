<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\JournalAssessment;
use App\Models\EvaluationIndicator;
use App\Models\AssessmentResponse;
use App\Models\AssessmentAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssessmentController extends Controller
{
    /**
     * Display a listing of user's assessments
     * 
     * @route GET /user/assessments
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Get assessments for user's journals
        $assessments = JournalAssessment::query()
            ->with(['journal:id,title,issn,user_id', 'user:id,name'])
            ->select([
                'id',
                'journal_id',
                'user_id',
                'assessment_date',
                'period',
                'status',
                'total_score',
                'max_score',
                'percentage',
                'created_at',
                'updated_at',
            ])
            ->whereHas('journal', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->search, function ($query, $search) {
                $query->whereHas('journal', function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%");
                });
            })
            ->latest('assessment_date')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($assessment) {
                // Append accessor attributes for each item
                $assessment->append(['status_label', 'status_color', 'grade']);
                return $assessment;
            });

        return Inertia::render('User/Assessments/Index', [
            'assessments' => $assessments,
            'filters' => [
                'status' => $request->status,
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new assessment
     * 
     * @route GET /user/assessments/create
     */
    public function create(Request $request)
    {
        $user = $request->user();

        // Get user's journals
        $journals = Journal::where('user_id', $user->id)
            ->where('is_active', true)
            ->select('id', 'title', 'issn')
            ->get();

        // Get evaluation indicators grouped by category
        $indicators = EvaluationIndicator::active()
            ->ordered()
            ->get()
            ->groupBy('category');

        return Inertia::render('User/Assessments/Create', [
            'journals' => $journals,
            'indicators' => $indicators,
        ]);
    }

    /**
     * Store a newly created assessment in storage
     * 
     * @route POST /user/assessments
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'journal_id' => 'required|exists:journals,id',
            'assessment_date' => 'required|date',
            'period' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
            'responses' => 'required|array',
            'responses.*.evaluation_indicator_id' => 'required|exists:evaluation_indicators,id',
            'responses.*.answer_boolean' => 'nullable|boolean',
            'responses.*.answer_scale' => 'nullable|integer|min:1|max:5',
            'responses.*.answer_text' => 'nullable|string',
            'responses.*.notes' => 'nullable|string',
            'responses.*.attachments' => 'nullable|array',
            'responses.*.attachments.*' => 'file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
        ]);

        // Verify journal belongs to user
        $journal = Journal::findOrFail($validated['journal_id']);
        $this->authorize('update', $journal);

        DB::beginTransaction();
        try {
            // Create assessment
            $assessment = JournalAssessment::create([
                'journal_id' => $validated['journal_id'],
                'user_id' => $user->id,
                'assessment_date' => $validated['assessment_date'],
                'period' => $validated['period'] ?? null,
                'status' => 'draft',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create responses
            foreach ($validated['responses'] as $responseData) {
                $indicator = EvaluationIndicator::findOrFail($responseData['evaluation_indicator_id']);

                // Calculate score based on answer type
                $score = $this->calculateScore($indicator, $responseData);

                $response = AssessmentResponse::create([
                    'journal_assessment_id' => $assessment->id,
                    'evaluation_indicator_id' => $responseData['evaluation_indicator_id'],
                    'answer_boolean' => $responseData['answer_boolean'] ?? null,
                    'answer_scale' => $responseData['answer_scale'] ?? null,
                    'answer_text' => $responseData['answer_text'] ?? null,
                    'score' => $score,
                    'notes' => $responseData['notes'] ?? null,
                ]);

                // Handle file attachments
                if (isset($responseData['attachments']) && is_array($responseData['attachments'])) {
                    foreach ($responseData['attachments'] as $file) {
                        if ($file instanceof \Illuminate\Http\UploadedFile) {
                            $this->storeAttachment($response, $file, $user->id);
                        }
                    }
                }
            }

            // Calculate total score
            $assessment->calculateTotalScore();

            DB::commit();

            return redirect()->route('user.assessments.show', $assessment->id)
                ->with('success', 'Assessment berhasil disimpan sebagai draft.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan assessment: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified assessment
     * 
     * @route GET /user/assessments/{assessment}
     */
    public function show(Request $request, JournalAssessment $assessment)
    {
        // Authorization
        $this->authorize('view', $assessment);

        $assessment->load([
            'journal',
            'user',
            'responses.evaluationIndicator',
            'responses.attachments.uploader',
        ]);

        // Group responses by category
        $responsesByCategory = $assessment->responses->groupBy(function ($response) {
            return $response->evaluationIndicator->category;
        });

        return Inertia::render('User/Assessments/Show', [
            'assessment' => $assessment,
            'responsesByCategory' => $responsesByCategory,
        ]);
    }

    /**
     * Show the form for editing the specified assessment
     * 
     * @route GET /user/assessments/{assessment}/edit
     */
    public function edit(Request $request, JournalAssessment $assessment)
    {
        // Authorization
        $this->authorize('update', $assessment);

        // Only draft assessments can be edited
        if (!$assessment->isEditable()) {
            return redirect()->route('user.assessments.show', $assessment->id)
                ->withErrors(['error' => 'Assessment yang sudah disubmit tidak dapat diedit.']);
        }

        $assessment->load([
            'journal',
            'responses.evaluationIndicator',
            'responses.attachments',
        ]);

        // Get evaluation indicators grouped by category
        $indicators = EvaluationIndicator::active()
            ->ordered()
            ->get()
            ->groupBy('category');

        return Inertia::render('User/Assessments/Edit', [
            'assessment' => $assessment,
            'indicators' => $indicators,
        ]);
    }

    /**
     * Update the specified assessment in storage
     * 
     * @route PUT /user/assessments/{assessment}
     */
    public function update(Request $request, JournalAssessment $assessment)
    {
        // Authorization
        $this->authorize('update', $assessment);

        // Only draft assessments can be updated
        if (!$assessment->isEditable()) {
            return redirect()->route('user.assessments.show', $assessment->id)
                ->withErrors(['error' => 'Assessment yang sudah disubmit tidak dapat diedit.']);
        }

        $validated = $request->validate([
            'assessment_date' => 'required|date',
            'period' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
            'responses' => 'required|array',
            'responses.*.evaluation_indicator_id' => 'required|exists:evaluation_indicators,id',
            'responses.*.answer_boolean' => 'nullable|boolean',
            'responses.*.answer_scale' => 'nullable|integer|min:1|max:5',
            'responses.*.answer_text' => 'nullable|string',
            'responses.*.notes' => 'nullable|string',
            'responses.*.attachments' => 'nullable|array',
            'responses.*.attachments.*' => 'file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        DB::beginTransaction();
        try {
            // Update assessment
            $assessment->update([
                'assessment_date' => $validated['assessment_date'],
                'period' => $validated['period'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Delete existing responses and create new ones
            $assessment->responses()->delete();

            // Create new responses
            foreach ($validated['responses'] as $responseData) {
                $indicator = EvaluationIndicator::findOrFail($responseData['evaluation_indicator_id']);
                $score = $this->calculateScore($indicator, $responseData);

                $response = AssessmentResponse::create([
                    'journal_assessment_id' => $assessment->id,
                    'evaluation_indicator_id' => $responseData['evaluation_indicator_id'],
                    'answer_boolean' => $responseData['answer_boolean'] ?? null,
                    'answer_scale' => $responseData['answer_scale'] ?? null,
                    'answer_text' => $responseData['answer_text'] ?? null,
                    'score' => $score,
                    'notes' => $responseData['notes'] ?? null,
                ]);

                // Handle file attachments
                if (isset($responseData['attachments']) && is_array($responseData['attachments'])) {
                    foreach ($responseData['attachments'] as $file) {
                        if ($file instanceof \Illuminate\Http\UploadedFile) {
                            $this->storeAttachment($response, $file, $request->user()->id);
                        }
                    }
                }
            }

            // Recalculate total score
            $assessment->calculateTotalScore();

            DB::commit();

            return redirect()->route('user.assessments.show', $assessment->id)
                ->with('success', 'Assessment berhasil diperbarui.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memperbarui assessment: ' . $e->getMessage()]);
        }
    }

    /**
     * Submit the assessment (change status from draft to submitted)
     * 
     * @route POST /user/assessments/{assessment}/submit
     */
    public function submit(Request $request, JournalAssessment $assessment)
    {
        // Authorization
        $this->authorize('update', $assessment);

        if (!$assessment->isEditable()) {
            return back()->withErrors(['error' => 'Assessment sudah disubmit sebelumnya.']);
        }

        try {
            $assessment->submit();

            return redirect()->route('user.assessments.show', $assessment->id)
                ->with('success', 'Assessment berhasil disubmit!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal submit assessment: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified assessment from storage
     * 
     * @route DELETE /user/assessments/{assessment}
     */
    public function destroy(Request $request, JournalAssessment $assessment)
    {
        // Authorization
        $this->authorize('delete', $assessment);

        // Only draft assessments can be deleted
        if (!$assessment->isEditable()) {
            return back()->withErrors(['error' => 'Assessment yang sudah disubmit tidak dapat dihapus.']);
        }

        try {
            // Delete all attachments from storage
            foreach ($assessment->responses as $response) {
                foreach ($response->attachments as $attachment) {
                    Storage::disk('public')->delete($attachment->file_path);
                }
            }

            $assessment->delete();

            return redirect()->route('user.assessments.index')
                ->with('success', 'Assessment berhasil dihapus.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghapus assessment: ' . $e->getMessage()]);
        }
    }

    /**
     * Download attachment file
     * 
     * @route GET /user/assessments/attachments/{attachment}
     */
    public function downloadAttachment(AssessmentAttachment $attachment)
    {
        // Check authorization (user must own the assessment or be admin)
        $this->authorize('view', $attachment->assessmentResponse->journalAssessment);

        if (!Storage::disk('public')->exists($attachment->file_path)) {
            abort(404, 'File tidak ditemukan.');
        }

        return Storage::disk('public')->download(
            $attachment->file_path,
            $attachment->original_filename
        );
    }

    /**
     * Calculate score based on indicator and answer
     * 
     * @param EvaluationIndicator $indicator
     * @param array $responseData
     * @return float
     */
    private function calculateScore(EvaluationIndicator $indicator, array $responseData): float
    {
        $weight = (float) $indicator->weight;

        return match($indicator->answer_type) {
            'boolean' => ($responseData['answer_boolean'] ?? false) ? $weight : 0.00,
            'scale' => $weight * (($responseData['answer_scale'] ?? 0) / 5),
            'text' => $weight, // Full weight for text answers (manual review needed)
            default => 0.00,
        };
    }

    /**
     * Store attachment file
     * 
     * @param AssessmentResponse $response
     * @param \Illuminate\Http\UploadedFile $file
     * @param int $userId
     * @return AssessmentAttachment
     */
    private function storeAttachment(AssessmentResponse $response, $file, int $userId): AssessmentAttachment
    {
        $originalFilename = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $storedFilename = time() . '_' . uniqid() . '.' . $extension;
        
        $path = $file->storeAs(
            'assessments/' . $response->journal_assessment_id,
            $storedFilename,
            'public'
        );

        return AssessmentAttachment::create([
            'assessment_response_id' => $response->id,
            'original_filename' => $originalFilename,
            'stored_filename' => $storedFilename,
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => $userId,
        ]);
    }
}
