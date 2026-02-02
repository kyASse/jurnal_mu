# 📋 Assessment Implementation Plan
**Project**: JurnalMU  
**Feature**: User Assessment Module (Enhanced)  
**Created**: 2 Februari 2026  
**Status**: Planning Phase

---

## 🎯 Overview

Dokumen ini merupakan rencana implementasi lengkap untuk enhancement fitur Assessment berdasarkan requirements dari:
- [MEETING_NOTES_30_JAN_2026.md](MEETING_NOTES_30_JAN_2026.md)
- [MEETING_NOTES_16_JAN_2026.md](MEETING_NOTES_16_JAN_2026.md)
- [jurnal_mu MVP v1.1 - UPDATED.md](jurnal_mu MVP v1.1 - UPDATED.md)

---

## 📊 Current State Analysis

### ✅ Already Implemented (v1.0)
1. **Basic Assessment Submission**
   - User can create assessment (draft state)
   - User can submit assessment (submitted state)
   - Assessment linked to journal
   - Assessment responses stored in `assessment_responses` table
   - File attachments supported via `assessment_attachments` table

2. **Database Structure**
   - `journal_assessments` table with fields:
     - `status` (draft, submitted, reviewed)
     - `admin_notes` (TEXT)
     - `reviewed_by` (FK to users)
     - `reviewed_at` (TIMESTAMP)
   - `assessment_responses` table
   - `assessment_attachments` table
   - `evaluation_indicators` table (seeded data)

3. **Basic Authorization**
   - User can only see/edit their own assessments
   - Admin Kampus can view assessments from their university

### ❌ Missing Features (To Be Implemented)
1. **Multiple Issues per Assessment**
   - Currently: Assessment has single description field
   - Required: User can log multiple issues/problems during assessment

2. **Save Draft Functionality**
   - Currently: Draft status exists but no explicit "Save Draft" feature
   - Required: User can save progress and return later

3. **Reviewer Feedback Display**
   - Currently: `admin_notes` exists but not displayed to user
   - Required: User can see reviewer feedback after review

4. **Assessment Review UI**
   - Currently: No UI for admin to review assessments
   - Required: Admin Kampus can approve/reject with feedback

5. **Assessment as Part of Pembinaan**
   - Currently: Assessment is standalone
   - Required: Assessment linked to coaching/pembinaan flow

---

## 🏗️ Architecture Design

### Entity Relationship Overview

```
Pembinaan (Coaching Program)
    ├── PembinaanRegistration (User enrolls journal)
    │   ├── JournalAssessment (User fills assessment)
    │   │   ├── AssessmentIssue (Multiple issues) 🆕
    │   │   ├── AssessmentResponse (Answers to indicators)
    │   │   └── AssessmentAttachment (Supporting files)
    │   └── PembinaanReview (Reviewer feedback) 🆕
    └── AccreditationTemplate (Borang structure)
        └── EvaluationIndicator (Questions)
```

### User Flow Diagram

```
1. User enrolls in Pembinaan (Akreditasi/Indeksasi)
   ├── Status: pending
   └── Admin Kampus approves enrollment
   
2. User fills Assessment
   ├── Add multiple issues 🆕
   ├── Answer evaluation indicators
   ├── Save Draft (partial progress) 🆕
   └── Submit for review
   
3. Admin Kampus reviews Assessment
   ├── View submission
   ├── Add reviewer notes 🆕
   └── Approve or Request Revision
   
4. If Approved → User can request Coaching
   If Revision → User can re-edit and re-submit
   
5. Reviewer provides coaching feedback 🆕
   └── User sees feedback in assessment detail
```

---

## 📝 Requirements Breakdown

### REQ-1: Multiple Issues Tracking 🆕

**Priority**: High  
**Complexity**: Medium  
**Story**: *"Sebagai User, saya ingin mencatat lebih dari satu issue/masalah saat mengisi assessment, sehingga semua kelemahan jurnal terdokumentasi dengan baik."*

#### Acceptance Criteria
- [ ] User can add unlimited issues during assessment
- [ ] Each issue has:
  - Title (max 200 chars)
  - Description (textarea, max 1000 chars)
  - Category (dropdown: Editorial, Technical, Content Quality, Management)
  - Priority (dropdown: High, Medium, Low)
  - Created timestamp
- [ ] User can edit/delete issues before submitting assessment
- [ ] Issues displayed in card/list format with visual hierarchy
- [ ] Issues are preserved when saving draft
- [ ] Reviewer can see all issues when reviewing assessment

#### Technical Specifications

**Database Schema**:
```sql
CREATE TABLE assessment_issues (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    journal_assessment_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('editorial', 'technical', 'content_quality', 'management') NOT NULL,
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    display_order INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (journal_assessment_id) REFERENCES journal_assessments(id) ON DELETE CASCADE,
    INDEX idx_assessment (journal_assessment_id),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Laravel Model**:
```php
// app/Models/AssessmentIssue.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentIssue extends Model
{
    protected $fillable = [
        'journal_assessment_id',
        'title',
        'description',
        'category',
        'priority',
        'display_order',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(JournalAssessment::class, 'journal_assessment_id');
    }

    // Scopes
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('created_at');
    }
}
```

**Update JournalAssessment Model**:
```php
// app/Models/JournalAssessment.php
public function issues(): HasMany
{
    return $this->hasMany(AssessmentIssue::class, 'journal_assessment_id')
                ->orderBy('display_order')
                ->orderBy('created_at');
}
```

**Frontend Component** (React):
```tsx
// resources/js/components/AssessmentIssueManager.tsx
interface AssessmentIssue {
  id?: number;
  title: string;
  description: string;
  category: 'editorial' | 'technical' | 'content_quality' | 'management';
  priority: 'high' | 'medium' | 'low';
}

export default function AssessmentIssueManager({
  assessmentId,
  existingIssues = [],
  onUpdate,
}: {
  assessmentId: number;
  existingIssues: AssessmentIssue[];
  onUpdate: (issues: AssessmentIssue[]) => void;
}) {
  const [issues, setIssues] = useState<AssessmentIssue[]>(existingIssues);
  const [isAddingIssue, setIsAddingIssue] = useState(false);

  const addIssue = (issue: AssessmentIssue) => {
    const newIssues = [...issues, issue];
    setIssues(newIssues);
    onUpdate(newIssues);
  };

  const editIssue = (index: number, updatedIssue: AssessmentIssue) => {
    const newIssues = [...issues];
    newIssues[index] = updatedIssue;
    setIssues(newIssues);
    onUpdate(newIssues);
  };

  const deleteIssue = (index: number) => {
    const newIssues = issues.filter((_, i) => i !== index);
    setIssues(newIssues);
    onUpdate(newIssues);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Catatan Masalah</h3>
        <Button onClick={() => setIsAddingIssue(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Masalah
        </Button>
      </div>

      {/* Issue List */}
      {issues.length === 0 ? (
        <EmptyState message="Belum ada masalah yang dicatat" />
      ) : (
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <IssueCard
              key={index}
              issue={issue}
              onEdit={() => editIssue(index, issue)}
              onDelete={() => deleteIssue(index)}
            />
          ))}
        </div>
      )}

      {/* Add Issue Dialog */}
      {isAddingIssue && (
        <IssueFormDialog
          onSave={addIssue}
          onCancel={() => setIsAddingIssue(false)}
        />
      )}
    </div>
  );
}
```

**API Endpoints**:
```php
// routes/web.php (atau api.php)
Route::middleware(['auth'])->group(function () {
    Route::prefix('assessments/{assessment}/issues')->group(function () {
        Route::post('/', [AssessmentIssueController::class, 'store'])
            ->name('assessment-issues.store');
        Route::put('/{issue}', [AssessmentIssueController::class, 'update'])
            ->name('assessment-issues.update');
        Route::delete('/{issue}', [AssessmentIssueController::class, 'destroy'])
            ->name('assessment-issues.destroy');
        Route::post('/reorder', [AssessmentIssueController::class, 'reorder'])
            ->name('assessment-issues.reorder');
    });
});
```

---

### REQ-2: Save Draft Functionality 🆕

**Priority**: High  
**Complexity**: Low  
**Story**: *"Sebagai User, saya ingin menyimpan progress assessment sebagai draft, sehingga saya bisa melanjutkan pengisian di lain waktu tanpa kehilangan data."*

#### Acceptance Criteria
- [ ] "Save Draft" button visible on assessment form
- [ ] Draft saves all form data:
  - Evaluation indicator responses
  - Assessment issues
  - Attachments
  - Partial progress state
- [ ] User can return to draft and continue editing
- [ ] Visual indicator showing last saved time
- [ ] Auto-save every 30 seconds (optional enhancement)
- [ ] Draft indicator badge on assessment list

#### Technical Specifications

**Controller Method**:
```php
// app/Http/Controllers/User/JournalAssessmentController.php

public function saveDraft(Request $request, JournalAssessment $assessment)
{
    // Authorize
    $this->authorize('update', $assessment);

    // Validate
    $validated = $request->validate([
        'responses' => 'nullable|array',
        'responses.*' => 'nullable|string',
        'issues' => 'nullable|array',
        'issues.*.title' => 'required|string|max:200',
        'issues.*.description' => 'required|string|max:1000',
        'issues.*.category' => 'required|in:editorial,technical,content_quality,management',
        'issues.*.priority' => 'required|in:high,medium,low',
    ]);

    DB::beginTransaction();
    try {
        // Update assessment (keep status as draft)
        $assessment->update([
            'status' => 'draft',
            'updated_at' => now(),
        ]);

        // Save responses
        if (!empty($validated['responses'])) {
            foreach ($validated['responses'] as $indicatorId => $response) {
                AssessmentResponse::updateOrCreate(
                    [
                        'journal_assessment_id' => $assessment->id,
                        'evaluation_indicator_id' => $indicatorId,
                    ],
                    [
                        'response' => $response,
                    ]
                );
            }
        }

        // Save issues
        if (!empty($validated['issues'])) {
            // Delete existing issues
            $assessment->issues()->delete();
            
            // Create new issues
            foreach ($validated['issues'] as $index => $issueData) {
                $assessment->issues()->create([
                    'title' => $issueData['title'],
                    'description' => $issueData['description'],
                    'category' => $issueData['category'],
                    'priority' => $issueData['priority'],
                    'display_order' => $index,
                ]);
            }
        }

        DB::commit();

        return back()->with('success', 'Draft berhasil disimpan pada ' . now()->format('H:i:s'));
    } catch (\Exception $e) {
        DB::rollBack();
        return back()->with('error', 'Gagal menyimpan draft: ' . $e->getMessage());
    }
}
```

**Frontend Component** (React):
```tsx
// resources/js/pages/User/Assessments/Edit.tsx

export default function AssessmentEdit({ assessment, indicators, journal }) {
  const [formData, setFormData] = useState({
    responses: assessment.responses || {},
    issues: assessment.issues || [],
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveDraft = () => {
    setIsSaving(true);
    router.post(
      route('user.assessments.save-draft', assessment.id),
      formData,
      {
        preserveScroll: true,
        onSuccess: () => {
          setLastSaved(new Date());
          setIsSaving(false);
        },
        onError: () => {
          setIsSaving(false);
        },
      }
    );
  };

  // Auto-save every 30 seconds (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      if (assessment.status === 'draft') {
        saveDraft();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [formData]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with save status */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Assessment - {journal.name}</h1>
            {lastSaved && (
              <p className="text-sm text-muted-foreground">
                Terakhir disimpan: {lastSaved.toLocaleTimeString('id-ID')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveDraft}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Draft
                </>
              )}
            </Button>
            <Button onClick={submitAssessment}>
              Submit untuk Review
            </Button>
          </div>
        </div>

        {/* Assessment Form */}
        <AssessmentForm
          indicators={indicators}
          formData={formData}
          onChange={setFormData}
        />
      </div>
    </AppLayout>
  );
}
```

**Route**:
```php
// routes/web.php
Route::post('/assessments/{assessment}/save-draft', [JournalAssessmentController::class, 'saveDraft'])
    ->name('user.assessments.save-draft');
```

---

### REQ-3: Display Reviewer Feedback 🆕

**Priority**: High  
**Complexity**: Low  
**Story**: *"Sebagai User, saya ingin melihat catatan reviewer setelah assessment di-review, sehingga saya tahu apa yang perlu diperbaiki."*

#### Acceptance Criteria
- [ ] Reviewer feedback visible after assessment status = 'reviewed'
- [ ] Display reviewer notes in read-only format
- [ ] Show reviewer name and review date
- [ ] Highlight action items or recommendations
- [ ] Link to re-submit if revision requested
- [ ] Export feedback as PDF (optional)

#### Technical Specifications

**Frontend Component**:
```tsx
// resources/js/components/ReviewerFeedback.tsx

interface ReviewerFeedbackProps {
  assessment: JournalAssessment;
}

export default function ReviewerFeedback({ assessment }: ReviewerFeedbackProps) {
  if (assessment.status !== 'reviewed' || !assessment.admin_notes) {
    return null;
  }

  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Hasil Review</CardTitle>
            <CardDescription>
              Direview oleh {assessment.reviewed_by?.name} pada{' '}
              {new Date(assessment.reviewed_at).toLocaleString('id-ID')}
            </CardDescription>
          </div>
          <Badge variant={assessment.status === 'reviewed' ? 'success' : 'warning'}>
            {assessment.status === 'reviewed' ? 'Disetujui' : 'Perlu Revisi'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Catatan Reviewer:</h4>
            <div
              className="prose prose-sm max-w-none p-4 bg-muted rounded-md"
              dangerouslySetInnerHTML={{ __html: assessment.admin_notes }}
            />
          </div>

          {/* If has coaching feedback (from pembinaan module) */}
          {assessment.coaching_feedback && (
            <div>
              <h4 className="font-semibold mb-2">Rekomendasi Pembinaan:</h4>
              <ul className="list-disc list-inside space-y-1">
                {assessment.coaching_feedback.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => window.print()}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            {assessment.can_request_pembinaan && (
              <Button asChild>
                <Link href={route('user.pembinaan.request', assessment.journal_id)}>
                  Request Pembinaan
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Update Assessment Show Page**:
```tsx
// resources/js/pages/User/Assessments/Show.tsx

export default function AssessmentShow({ assessment, journal }) {
  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title={`Assessment - ${journal.name}`}
          description={`Status: ${assessment.status}`}
        />

        {/* Status Timeline */}
        <AssessmentTimeline assessment={assessment} />

        {/* Reviewer Feedback (if reviewed) */}
        <ReviewerFeedback assessment={assessment} />

        {/* Issues */}
        {assessment.issues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Masalah yang Ditemukan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessment.issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} readOnly />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Responses */}
        <Card>
          <CardHeader>
            <CardTitle>Hasil Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentResponsesView responses={assessment.responses} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
```

---

### REQ-4: Admin Review Interface 🆕

**Priority**: High  
**Complexity**: Medium  
**Story**: *"Sebagai Admin Kampus, saya ingin me-review assessment yang disubmit user dengan memberikan feedback terstruktur."*

#### Acceptance Criteria
- [ ] List assessments with status filter (pending, reviewed, draft)
- [ ] View assessment details in read-only mode
- [ ] Rich text editor for admin notes (with formatting)
- [ ] Action buttons: Approve or Request Revision
- [ ] On Approve:
  - Status → 'reviewed'
  - User receives notification
  - Can request pembinaan
- [ ] On Request Revision:
  - Status → 'draft'
  - User can re-edit
  - Email notification with feedback

#### Technical Specifications

**Controller**:
```php
// app/Http/Controllers/AdminKampus/AssessmentReviewController.php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\JournalAssessment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssessmentReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = JournalAssessment::query()
            ->whereHas('journal', function ($q) {
                $q->where('university_id', auth()->user()->university_id);
            })
            ->with(['journal', 'user', 'responses.indicator']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $assessments = $query->latest('submitted_at')->paginate(20);

        return inertia('AdminKampus/Assessments/Index', [
            'assessments' => $assessments,
            'filters' => $request->only('status'),
        ]);
    }

    public function show(JournalAssessment $assessment)
    {
        $this->authorize('view', $assessment);

        $assessment->load([
            'journal',
            'user',
            'responses.indicator',
            'issues',
            'attachments',
            'reviewedBy',
        ]);

        return inertia('AdminKampus/Assessments/Review', [
            'assessment' => $assessment,
        ]);
    }

    public function approve(Request $request, JournalAssessment $assessment)
    {
        $this->authorize('review', $assessment);

        $validated = $request->validate([
            'admin_notes' => 'required|string|min:50',
        ]);

        DB::beginTransaction();
        try {
            $assessment->update([
                'status' => 'reviewed',
                'admin_notes' => $validated['admin_notes'],
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            // Send notification to user
            $assessment->user->notify(new AssessmentApprovedNotification($assessment));

            DB::commit();

            return redirect()
                ->route('admin-kampus.assessments.index')
                ->with('success', 'Assessment berhasil disetujui');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menyetujui assessment: ' . $e->getMessage());
        }
    }

    public function requestRevision(Request $request, JournalAssessment $assessment)
    {
        $this->authorize('review', $assessment);

        $validated = $request->validate([
            'admin_notes' => 'required|string|min:50',
        ]);

        DB::beginTransaction();
        try {
            $assessment->update([
                'status' => 'draft',
                'admin_notes' => $validated['admin_notes'],
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            // Send notification to user
            $assessment->user->notify(new AssessmentRevisionRequestedNotification($assessment));

            DB::commit();

            return redirect()
                ->route('admin-kampus.assessments.index')
                ->with('success', 'Permintaan revisi berhasil dikirim');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mengirim permintaan revisi: ' . $e->getMessage());
        }
    }
}
```

**Policy**:
```php
// app/Policies/JournalAssessmentPolicy.php

public function review(User $user, JournalAssessment $assessment): bool
{
    // Super Admin can review all
    if ($user->isSuperAdmin()) {
        return true;
    }

    // Admin Kampus can review assessments from their university
    if ($user->isAdminKampus()) {
        return $assessment->journal->university_id === $user->university_id;
    }

    return false;
}
```

**Frontend Page**:
```tsx
// resources/js/pages/AdminKampus/Assessments/Review.tsx

export default function AssessmentReview({ assessment }) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [action, setAction] = useState<'approve' | 'revision' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const submitReview = () => {
    const route = action === 'approve'
      ? route('admin-kampus.assessments.approve', assessment.id)
      : route('admin-kampus.assessments.request-revision', assessment.id);

    router.post(route, {
      admin_notes: adminNotes,
    }, {
      onSuccess: () => {
        setIsReviewing(false);
      },
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={`Review Assessment - ${assessment.journal.name}`}
          description={`Disubmit oleh ${assessment.user.name} pada ${new Date(assessment.submitted_at).toLocaleString('id-ID')}`}
        />

        {/* Assessment Content (Read-Only) */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Issues */}
            {assessment.issues.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Masalah yang Ditemukan ({assessment.issues.length})</h3>
                <div className="space-y-2">
                  {assessment.issues.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} readOnly />
                  ))}
                </div>
              </div>
            )}

            {/* Responses */}
            <div>
              <h3 className="font-semibold mb-3">Jawaban Indikator</h3>
              <AssessmentResponsesView responses={assessment.responses} />
            </div>

            {/* Attachments */}
            {assessment.attachments.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Dokumen Pendukung</h3>
                <AttachmentList attachments={assessment.attachments} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Form */}
        {assessment.status === 'submitted' && (
          <Card>
            <CardHeader>
              <CardTitle>Berikan Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin_notes">Catatan Review *</Label>
                  <RichTextEditor
                    value={adminNotes}
                    onChange={setAdminNotes}
                    placeholder="Berikan feedback terstruktur untuk user. Minimal 50 karakter."
                    minHeight="200px"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimal 50 karakter. Gunakan formatting untuk highlight poin penting.
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      setAction('approve');
                      setIsReviewing(true);
                    }}
                    disabled={adminNotes.length < 50}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Setujui Assessment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAction('revision');
                      setIsReviewing(true);
                    }}
                    disabled={adminNotes.length < 50}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Minta Revisi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        {isReviewing && (
          <ConfirmDialog
            title={action === 'approve' ? 'Setujui Assessment?' : 'Minta Revisi?'}
            description={
              action === 'approve'
                ? 'Assessment akan disetujui dan user dapat melanjutkan ke pembinaan.'
                : 'Assessment akan dikembalikan ke status draft dan user dapat mengedit ulang.'
            }
            onConfirm={submitReview}
            onCancel={() => setIsReviewing(false)}
          />
        )}
      </div>
    </AppLayout>
  );
}
```

---

### REQ-5: Assessment Integration with Pembinaan 🆕

**Priority**: Medium (Phase 2)  
**Complexity**: High  
**Story**: *"Sebagai User, assessment saya harus terhubung dengan pembinaan yang saya ikuti, sehingga reviewer bisa lihat konteks lengkap."*

#### Acceptance Criteria
- [ ] Assessment linked to PembinaanRegistration (if user enrolled in pembinaan)
- [ ] User can only fill assessment after pembinaan enrollment approved
- [ ] Assessment uses borang template from pembinaan
- [ ] Reviewer assigned from pembinaan sees assessment automatically
- [ ] Assessment completion triggers pembinaan progress update

#### Technical Specifications

**Database Changes**:
```sql
-- Add foreign key to link assessment with pembinaan
ALTER TABLE journal_assessments
ADD COLUMN pembinaan_registration_id BIGINT UNSIGNED NULL AFTER journal_id,
ADD FOREIGN KEY (pembinaan_registration_id) REFERENCES pembinaan_registrations(id) ON DELETE SET NULL;

-- Index for faster queries
ALTER TABLE journal_assessments
ADD INDEX idx_pembinaan_registration (pembinaan_registration_id);
```

**Update Assessment Creation Flow**:
```php
// When user creates assessment from pembinaan context
public function createFromPembinaan(Request $request, PembinaanRegistration $registration)
{
    $this->authorize('createAssessment', $registration);

    // Validate registration is approved
    if ($registration->status !== 'approved') {
        return back()->with('error', 'Pembinaan belum disetujui');
    }

    // Check if assessment already exists
    if ($registration->assessment) {
        return redirect()->route('user.assessments.edit', $registration->assessment);
    }

    // Get template from pembinaan
    $template = $registration->pembinaan->accreditation_template;

    $assessment = JournalAssessment::create([
        'journal_id' => $registration->journal_id,
        'user_id' => auth()->id(),
        'pembinaan_registration_id' => $registration->id,
        'accreditation_template_id' => $template->id,
        'status' => 'draft',
    ]);

    return redirect()->route('user.assessments.edit', $assessment);
}
```

**Display Assessment in Pembinaan Context**:
```tsx
// resources/js/pages/User/Pembinaan/Show.tsx

export default function PembinaanShow({ registration, pembinaan, journal, assessment }) {
  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title={`Pembinaan: ${pembinaan.name}`}
          description={`Jurnal: ${journal.name}`}
        />

        {/* Registration Status */}
        <StatusCard status={registration.status} />

        {/* Assessment Section */}
        {registration.status === 'approved' && (
          <Card>
            <CardHeader>
              <CardTitle>Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {assessment ? (
                <div className="space-y-4">
                  <AssessmentStatusBadge status={assessment.status} />
                  {assessment.status === 'draft' && (
                    <Button asChild>
                      <Link href={route('user.assessments.edit', assessment.id)}>
                        Lanjutkan Assessment
                      </Link>
                    </Button>
                  )}
                  {assessment.status === 'reviewed' && (
                    <>
                      <ReviewerFeedback assessment={assessment} />
                      <Button asChild>
                        <Link href={route('user.assessments.show', assessment.id)}>
                          Lihat Hasil Review
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="mb-4">Belum ada assessment. Silakan mulai mengisi assessment.</p>
                  <Button asChild>
                    <Link href={route('user.pembinaan.create-assessment', registration.id)}>
                      Mulai Assessment
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
```

---

## 🗓️ Implementation Timeline

### **Phase 1: Core Assessment Features** (Week 1-2)
**Sprint Goal**: User can log issues, save drafts, and see workflow status

**Tasks**:
1. **Database & Migrations** (2 days)
   - [ ] Create `assessment_issues` table migration
   - [ ] Add indexes for performance
   - [ ] Seed sample issues for testing
   - [ ] Update factories for testing

2. **Backend - Multiple Issues** (3 days)
   - [ ] Create `AssessmentIssue` model
   - [ ] Update `JournalAssessment` model with issues relationship
   - [ ] Create `AssessmentIssueController` (CRUD)
   - [ ] Write unit tests for issue CRUD
   - [ ] Create policy for issue authorization

3. **Backend - Save Draft** (2 days)
   - [ ] Add `saveDraft()` method in `JournalAssessmentController`
   - [ ] Add draft validation rules
   - [ ] Test draft persistence (responses + issues)

4. **Frontend - Issue Manager Component** (3 days)
   - [ ] Create `AssessmentIssueManager.tsx` component
   - [ ] Create `IssueCard.tsx` component
   - [ ] Create `IssueFormDialog.tsx` component
   - [ ] Integrate with assessment form
   - [ ] Add drag-and-drop reordering (optional)

5. **Frontend - Save Draft UI** (2 days)
   - [ ] Add "Save Draft" button to assessment form
   - [ ] Show last saved timestamp
   - [ ] Implement auto-save (30s interval)
   - [ ] Add loading states and error handling

6. **Testing & QA** (2 days)
   - [ ] Feature tests for issue CRUD
   - [ ] Browser tests (Dusk) for draft workflow
   - [ ] Manual testing for edge cases

**Deliverables**:
- ✅ User can add/edit/delete multiple issues
- ✅ User can save draft at any time
- ✅ Draft includes all form data (responses + issues)

---

### **Phase 2: Admin Review Workflow** (Week 3-4)
**Sprint Goal**: Admin Kampus can review assessments with structured feedback

**Tasks**:
1. **Backend - Review Controller** (3 days)
   - [ ] Create `AssessmentReviewController` for Admin Kampus
   - [ ] Implement `approve()` method
   - [ ] Implement `requestRevision()` method
   - [ ] Add `review` authorization to `JournalAssessmentPolicy`
   - [ ] Write unit/feature tests

2. **Notifications** (2 days)
   - [ ] Create `AssessmentApprovedNotification`
   - [ ] Create `AssessmentRevisionRequestedNotification`
   - [ ] Configure email templates
   - [ ] Test notification delivery

3. **Frontend - Admin Review Page** (4 days)
   - [ ] Create `AdminKampus/Assessments/Index.tsx` (list page)
   - [ ] Create `AdminKampus/Assessments/Review.tsx` (review page)
   - [ ] Integrate rich text editor (TinyMCE/Tiptap)
   - [ ] Add status filters and search
   - [ ] Create confirmation dialogs

4. **Frontend - User Feedback Display** (2 days)
   - [ ] Create `ReviewerFeedback.tsx` component
   - [ ] Update `User/Assessments/Show.tsx` to show feedback
   - [ ] Add timeline component showing review history
   - [ ] Add "Re-submit" button for revised assessments

5. **Testing & QA** (3 days)
   - [ ] Feature tests for review workflow
   - [ ] Browser tests for approve/revision flow
   - [ ] Test notification triggers
   - [ ] Cross-browser testing

**Deliverables**:
- ✅ Admin can review and provide feedback
- ✅ User receives notifications on status changes
- ✅ User can see reviewer feedback
- ✅ User can re-edit after revision request

---

### **Phase 3: Pembinaan Integration** (Week 5-6)
**Sprint Goal**: Assessment linked to pembinaan workflow

**Tasks**:
1. **Database Schema Updates** (1 day)
   - [ ] Add `pembinaan_registration_id` to `journal_assessments`
   - [ ] Add foreign key constraint
   - [ ] Migration to update existing data (set NULL)

2. **Backend - Pembinaan-Assessment Link** (3 days)
   - [ ] Update `JournalAssessmentController` to accept pembinaan context
   - [ ] Create `createFromPembinaan()` method
   - [ ] Update policies to check pembinaan enrollment
   - [ ] Add validation: only approved registrations can create assessments

3. **Frontend - Pembinaan Context UI** (3 days)
   - [ ] Update `Pembinaan/Show.tsx` to show assessment section
   - [ ] Add "Start Assessment" button (if not exists)
   - [ ] Show assessment status in pembinaan context
   - [ ] Link to assessment details

4. **Reviewer Assignment Integration** (3 days)
   - [ ] Auto-assign reviewer from pembinaan to assessment
   - [ ] Reviewer dashboard shows assessments from pembinaan
   - [ ] Update `ReviewerFeedback` to include pembinaan context

5. **Testing & Documentation** (4 days)
   - [ ] End-to-end tests for pembinaan → assessment → review flow
   - [ ] Update user documentation
   - [ ] Create video tutorial (optional)
   - [ ] Smoke testing on staging

**Deliverables**:
- ✅ Assessment created from pembinaan enrollment
- ✅ Assessment uses correct borang template
- ✅ Reviewer sees pembinaan context
- ✅ Full workflow tested end-to-end

---

## 🧪 Testing Strategy

### Unit Tests (Pest)
```php
// tests/Unit/AssessmentIssueTest.php
it('can create assessment issue', function () {
    $assessment = JournalAssessment::factory()->create();
    
    $issue = AssessmentIssue::create([
        'journal_assessment_id' => $assessment->id,
        'title' => 'Editorial problem',
        'description' => 'Missing editorial board information',
        'category' => 'editorial',
        'priority' => 'high',
    ]);

    expect($issue)->toBeInstanceOf(AssessmentIssue::class);
    expect($issue->assessment->id)->toBe($assessment->id);
});

it('validates issue category', function () {
    $assessment = JournalAssessment::factory()->create();
    
    expect(fn() => AssessmentIssue::create([
        'journal_assessment_id' => $assessment->id,
        'title' => 'Test',
        'description' => 'Test description',
        'category' => 'invalid_category', // Should fail
        'priority' => 'high',
    ]))->toThrow(\Exception::class);
});
```

### Feature Tests
```php
// tests/Feature/AssessmentDraftTest.php
it('user can save assessment draft', function () {
    $user = User::factory()->create();
    $assessment = JournalAssessment::factory()->create(['user_id' => $user->id]);

    actingAs($user)
        ->post(route('user.assessments.save-draft', $assessment), [
            'responses' => [
                1 => 'Answer to indicator 1',
                2 => 'Answer to indicator 2',
            ],
            'issues' => [
                [
                    'title' => 'Issue 1',
                    'description' => 'Description',
                    'category' => 'editorial',
                    'priority' => 'high',
                ],
            ],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($assessment->fresh()->issues()->count())->toBe(1);
});
```

### Browser Tests (Dusk)
```php
// tests/Browser/AssessmentWorkflowTest.php
public function test_user_can_complete_assessment_workflow()
{
    $this->browse(function (Browser $browser) {
        $user = User::factory()->create();
        $assessment = JournalAssessment::factory()->create(['user_id' => $user->id]);

        $browser->loginAs($user)
            ->visit(route('user.assessments.edit', $assessment))
            
            // Add issue
            ->click('@add-issue-button')
            ->type('@issue-title', 'Test Issue')
            ->type('@issue-description', 'Test Description')
            ->select('@issue-category', 'editorial')
            ->select('@issue-priority', 'high')
            ->click('@save-issue-button')
            ->assertSee('Test Issue')
            
            // Save draft
            ->click('@save-draft-button')
            ->assertSee('Draft berhasil disimpan')
            
            // Submit assessment
            ->click('@submit-button')
            ->click('@confirm-submit')
            ->assertRouteIs('user.assessments.show', $assessment)
            ->assertSee('submitted');
    });
}
```

---

## 📊 Success Metrics

### Quantitative Metrics
- [ ] **User Adoption**: 80% of users with journals fill at least 1 assessment within 30 days
- [ ] **Draft Usage**: 60% of assessments saved as draft before submission
- [ ] **Issues Logged**: Average 3-5 issues per assessment
- [ ] **Review Time**: 90% of assessments reviewed within 7 days
- [ ] **Revision Rate**: < 30% of assessments require revision

### Qualitative Metrics
- [ ] **User Feedback**: Positive feedback on draft functionality (survey)
- [ ] **Admin Satisfaction**: Admins find review interface intuitive
- [ ] **Data Quality**: Improvement in assessment completeness (measured by filled indicators)

---

## 🚀 Deployment Plan

### Pre-Deployment Checklist
- [ ] All unit tests passing
- [ ] All feature tests passing
- [ ] Browser tests passing
- [ ] Code review completed
- [ ] Database migration tested on staging
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### Deployment Steps
1. **Database Migration** (Downtime: 2-3 minutes)
   ```bash
   php artisan down
   php artisan migrate
   php artisan optimize:clear
   php artisan up
   ```

2. **Asset Compilation**
   ```bash
   npm run build
   ```

3. **Cache Warming**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

4. **Smoke Testing**
   - Login as each role
   - Test assessment creation
   - Test draft save
   - Test issue CRUD
   - Test admin review

### Rollback Plan
If critical issues arise:
```bash
php artisan down
php artisan migrate:rollback --step=1
git revert HEAD
php artisan optimize:clear
php artisan up
```

---

## 📚 Documentation Updates

### User Documentation
- [ ] Create "Mengisi Assessment" guide with screenshots
- [ ] Create "Mengelola Issues" tutorial
- [ ] Create "Me-review Assessment" guide for Admin Kampus
- [ ] Update FAQ with assessment workflow questions

### Developer Documentation
- [ ] Update API documentation (Swagger/OpenAPI)
- [ ] Document new database tables
- [ ] Update architecture diagram
- [ ] Create sequence diagram for assessment workflow

---

## 🔗 Related Documents

- [MEETING_NOTES_30_JAN_2026.md](MEETING_NOTES_30_JAN_2026.md) - Requirements source
- [MEETING_NOTES_16_JAN_2026.md](MEETING_NOTES_16_JAN_2026.md) - Assessment context in pembinaan
- [jurnal_mu MVP v1.1 - UPDATED.md](jurnal_mu MVP v1.1 - UPDATED.md) - Full feature spec
- [ERD Database.md](ERD Database.md) - Database schema reference

---

## 📝 Notes & Decisions

### Technical Decisions
1. **Rich Text Editor**: Use **Tiptap** over TinyMCE for better React integration
2. **Auto-save**: Implement with 30-second debounce to avoid excessive API calls
3. **Issue Storage**: Store as separate rows (normalized) rather than JSON for better queryability
4. **Notification Channel**: Use database + email (configurable per user)

### Open Questions
- [ ] Should assessment be editable after submission (before review)? **Decision: No, locked on submit**
- [ ] Should draft auto-save be enabled by default? **Decision: Yes, with user preference toggle**
- [ ] Should we track edit history for assessments? **Decision: Phase 2 feature**

---

**Prepared by**: GitHub Copilot  
**Last Updated**: 2 Februari 2026  
**Status**: Ready for Implementation 🚀
