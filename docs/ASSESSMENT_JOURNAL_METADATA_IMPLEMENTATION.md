# Assessment Journal Metadata Implementation Summary
**Date**: 03 Februari 2026  
**Status**: ✅ Backend Complete, ⏳ Frontend Integration Pending

---

## 📊 Implementation Overview

This document summarizes the implementation of **Journal Metadata fields** for assessments, based on stakeholder requirements from the meeting on 02 Feb 2026.

---

## ✅ Completed: Backend Implementation

### 1. **Database Schema**

#### Migration 1: `add_journal_metadata_fields_to_assessments_table`
Added 7 aggregate fields to `journal_assessments` table:

```sql
kategori_diusulkan VARCHAR(50) NULL
jumlah_editor INT UNSIGNED NULL
jumlah_reviewer INT UNSIGNED NULL
jumlah_author INT UNSIGNED NULL
jumlah_institusi_editor INT UNSIGNED NULL
jumlah_institusi_reviewer INT UNSIGNED NULL
jumlah_institusi_author INT UNSIGNED NULL
```

**Purpose**: Store aggregate counts at assessment level for cross-validation

#### Migration 2: `create_assessment_journal_metadata_table`
New table for repeatable journal issue data:

```sql
CREATE TABLE assessment_journal_metadata (
    id BIGINT UNSIGNED PRIMARY KEY,
    journal_assessment_id FK CASCADE DELETE,
    volume VARCHAR(20),
    number VARCHAR(20),
    year YEAR,
    month TINYINT (1-12),
    url_issue VARCHAR(500) NULL,
    jumlah_negara_editor INT DEFAULT 0,
    jumlah_institusi_editor INT DEFAULT 0,
    jumlah_negara_reviewer INT DEFAULT 0,
    jumlah_institusi_reviewer INT DEFAULT 0,
    jumlah_negara_author INT NULL,
    jumlah_institusi_author INT NULL,
    display_order INT DEFAULT 0,
    timestamps
);
```

**Purpose**: Track multiple journal issues per assessment (Vol 5 No 2, Vol 5 No 3, etc.)

---

### 2. **Models & Relationships**

#### `AssessmentJournalMetadata` Model
**File**: `app/Models/AssessmentJournalMetadata.php`

**Features**:
- Full `$fillable` array for mass assignment
- `$casts` for type safety (integers, dates)
- `assessment()` BelongsTo relationship
- `scopeOrdered()` for sorting by display_order
- `scopeByYear()` for filtering
- Computed attributes:
  - `month_name` - Human-readable month
  - `issue_identifier` - "Vol. 5 No. 2 (2025)"

#### `JournalAssessment` Model Updates
**File**: `app/Models/JournalAssessment.php`

**Changes**:
1. Added 7 new fields to `$fillable`
2. Added `$casts` for new integer fields
3. New relationship: `journalMetadata()` HasMany

---

### 3. **TypeScript Interfaces**

#### `AssessmentJournalMetadata` Interface
**File**: `resources/js/types/index.d.ts`

```typescript
export interface AssessmentJournalMetadata {
    id: number;
    journal_assessment_id: number;
    volume: string;
    number: string;
    year: number;
    month: number;
    url_issue?: string;
    jumlah_negara_editor: number;
    jumlah_institusi_editor: number;
    jumlah_negara_reviewer: number;
    jumlah_institusi_reviewer: number;
    jumlah_negara_author?: number;
    jumlah_institusi_author?: number;
    display_order: number;
    created_at: string;
    updated_at: string;
    // Computed
    month_name?: string;
    issue_identifier?: string;
}
```

#### `JournalAssessment` Interface Updates
Added fields:
- `kategori_diusulkan?: string`
- `jumlah_editor?: number`
- `jumlah_reviewer?: number`
- `jumlah_author?: number`
- `jumlah_institusi_editor?: number`
- `jumlah_institusi_reviewer?: number`
- `jumlah_institusi_author?: number`
- `journalMetadata?: AssessmentJournalMetadata[]`

---

### 4. **React Components**

#### `JournalMetadataManager.tsx`
**File**: `resources/js/components/JournalMetadataManager.tsx`

**Purpose**: Main component for managing multiple journal issues

**Features**:
- Add/Edit/Delete journal metadata entries
- Pass `onChange` callback to parent form
- Read-only mode for display
- Accept `aggregateCounts` prop for cross-validation
- Empty state with call-to-action
- Display total count

**Props**:
```typescript
interface JournalMetadataManagerProps {
    metadata: AssessmentJournalMetadata[];
    onChange: (metadata: AssessmentJournalMetadata[]) => void;
    readOnly?: boolean;
    aggregateCounts?: {
        jumlah_editor?: number;
        jumlah_reviewer?: number;
        // ... other counts
    };
}
```

#### `JournalMetadataCard.tsx`
**File**: `resources/js/components/JournalMetadataCard.tsx`

**Purpose**: Display individual journal issue with metrics

**UI Structure**:
- Header: Vol. X No. Y (Year) + Month badge
- URL link (if provided)
- Metrics grid:
  - Editor: country count, institution count
  - Reviewer: country count, institution count
  - Author: country count, institution count (optional)
- Edit/Delete buttons (if not readOnly)

#### `JournalMetadataFormDialog.tsx`
**File**: `resources/js/components/JournalMetadataFormDialog.tsx`

**Purpose**: Add/edit dialog with validation

**Form Sections**:
1. Basic Info: Volume, Number, Year, Month (dropdown)
2. URL Issue (optional)
3. Editor Metrics (bordered section)
4. Reviewer Metrics (bordered section)
5. Author Metrics (optional, muted background)

**Validation**:
- Required fields: volume, number, year, month
- Year range: 1900 to current year
- Month range: 1-12
- Cross-validation: Per-issue counts ≤ aggregate counts
- URL format validation

---

### 5. **Controller Updates**

#### `AssessmentController@saveDraft`
**File**: `app/Http/Controllers/User/AssessmentController.php`

**New Validation Rules**:
```php
// Aggregate fields (nullable for drafts)
'kategori_diusulkan' => 'nullable|string|max:50',
'jumlah_editor' => 'nullable|integer|min:0',
'jumlah_reviewer' => 'nullable|integer|min:0',
// ... other aggregate fields

// Journal metadata (repeatable)
'journal_metadata' => 'nullable|array',
'journal_metadata.*.volume' => 'required|string|max:20',
'journal_metadata.*.number' => 'required|string|max:20',
'journal_metadata.*.year' => 'required|integer|min:1900|max:' . date('Y'),
'journal_metadata.*.month' => 'required|integer|min:1|max:12',
// ... other metadata fields
```

**Save Logic**:
1. Update assessment aggregate fields
2. Save responses (existing logic)
3. Save issues (existing logic)
4. **NEW**: Delete + recreate journal metadata entries

#### `AssessmentController@edit`
**Changes**:
- Added `journalMetadata` to eager loading
- Added `pembinaanRegistration.pembinaan` for dynamic options

---

## ⏳ Pending: Frontend Integration

### 1. **Update Create.tsx/Edit.tsx**

#### Add to Form Data Structure:
```typescript
const { data, setData } = useForm({
    // Existing fields
    journal_id: '',
    assessment_date: '',
    period: '',
    notes: '',
    responses: [],
    
    // NEW: Aggregate fields
    kategori_diusulkan: '',
    jumlah_editor: 0,
    jumlah_reviewer: 0,
    jumlah_author: 0,
    jumlah_institusi_editor: 0,
    jumlah_institusi_reviewer: 0,
    jumlah_institusi_author: 0,
    
    // NEW: Journal metadata array
    journal_metadata: [] as AssessmentJournalMetadata[],
});
```

#### Add UI Sections (After "Informasi Dasar" Card):

**Section 1: Kategori Diusulkan**
```tsx
<Card>
    <CardHeader>
        <CardTitle>Kategori yang Diusulkan</CardTitle>
    </CardHeader>
    <CardContent>
        <Select 
            value={data.kategori_diusulkan}
            onValueChange={(value) => setData('kategori_diusulkan', value)}
        >
            <SelectTrigger>
                <SelectValue placeholder="Pilih kategori..." />
            </SelectTrigger>
            <SelectContent>
                {/* Dynamic options based on pembinaan category */}
                {assessment?.pembinaanRegistration?.pembinaan?.category === 'akreditasi' ? (
                    <>
                        <SelectItem value="Sinta 1">Sinta 1</SelectItem>
                        <SelectItem value="Sinta 2">Sinta 2</SelectItem>
                        <SelectItem value="Sinta 3">Sinta 3</SelectItem>
                        <SelectItem value="Sinta 4">Sinta 4</SelectItem>
                        <SelectItem value="Sinta 5">Sinta 5</SelectItem>
                        <SelectItem value="Sinta 6">Sinta 6</SelectItem>
                    </>
                ) : (
                    <>
                        <SelectItem value="Scopus">Scopus</SelectItem>
                        <SelectItem value="Web of Science">Web of Science</SelectItem>
                        <SelectItem value="DOAJ">DOAJ</SelectItem>
                        <SelectItem value="Other International">Other International</SelectItem>
                    </>
                )}
            </SelectContent>
        </Select>
    </CardContent>
</Card>
```

**Section 2: Aggregate Counts**
```tsx
<Card>
    <CardHeader>
        <CardTitle>Jumlah Total</CardTitle>
        <CardDescription>
            Total keseluruhan editor, reviewer, dan author di semua terbitan
        </CardDescription>
    </CardHeader>
    <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label>Jumlah Editor</Label>
                <Input 
                    type="number" 
                    min="0"
                    value={data.jumlah_editor || ''}
                    onChange={(e) => setData('jumlah_editor', parseInt(e.target.value) || 0)}
                />
            </div>
            {/* Repeat for other fields */}
        </div>
    </CardContent>
</Card>
```

**Section 3: Journal Metadata Manager**
```tsx
<JournalMetadataManager
    metadata={data.journal_metadata}
    onChange={(metadata) => setData('journal_metadata', metadata)}
    readOnly={assessment?.status !== 'draft'}
    aggregateCounts={{
        jumlah_editor: data.jumlah_editor,
        jumlah_reviewer: data.jumlah_reviewer,
        jumlah_author: data.jumlah_author,
        jumlah_institusi_editor: data.jumlah_institusi_editor,
        jumlah_institusi_reviewer: data.jumlah_institusi_reviewer,
        jumlah_institusi_author: data.jumlah_institusi_author,
    }}
/>
```

**Import Statement**:
```typescript
import JournalMetadataManager from '@/components/JournalMetadataManager';
import { AssessmentJournalMetadata } from '@/types';
```

---

### 2. **Update Show.tsx**

#### Display Aggregate Counts:
Add card after basic info showing aggregate counts with icons

#### Display Journal Metadata:
Use `JournalMetadataManager` in read-only mode to display all journal issues

#### Handle Null Values:
```tsx
{assessment.jumlah_editor === null ? (
    <Badge variant="secondary">Data not provided</Badge>
) : (
    <span>{assessment.jumlah_editor}</span>
)}
```

---

### 3. **Update Admin Kampus Views**

#### `AdminKampus/Assessments/Show.tsx`:
- Show aggregate counts in summary
- Display journal metadata in dedicated section
- Read-only mode

---

## 🧪 Testing Checklist

### Database & Models:
- [x] Migrations run successfully
- [x] Models have correct fillable fields
- [x] Relationships work correctly
- [ ] Seeder updated with sample data

### Backend:
- [x] Controller validation rules implemented
- [x] Save/update logic handles new fields
- [x] Cross-validation works (country ≤ total)
- [ ] Test with null values (existing assessments)

### Frontend:
- [x] Components render without errors
- [x] TypeScript interfaces match backend
- [ ] Form submission includes new fields
- [ ] Dynamic kategori_diusulkan options work
- [ ] Add/edit/delete journal metadata works
- [ ] Cross-validation UX (error messages)
- [ ] Read-only mode displays correctly

### Integration:
- [ ] Create new assessment with metadata
- [ ] Edit existing assessment (nullable handling)
- [ ] Save draft with partial data
- [ ] Submit with validation
- [ ] Display in Show pages (User, Admin)

---

## 📝 Key Implementation Decisions

### 1. **Why Separate Table for Metadata?**
- User requirement: "isian bisa beberapa" = multiple journal issues
- Each assessment can track multiple volumes/issues
- Normalized data structure prevents repetition

### 2. **Why Nullable Aggregate Fields?**
- **Backward compatibility**: Existing assessments don't have this data
- **Draft flexibility**: Users can save progress without filling all fields
- **Gradual adoption**: New assessments gradually populate data

### 3. **Why Cross-Validation on Submit Only?**
- **User experience**: Don't block draft saves with validation errors
- **Flexibility**: User may fill metadata before aggregate counts
- **Final check**: Validation ensures data consistency on submit

### 4. **Month Storage: INT vs VARCHAR?**
- **Chosen**: INT (1-12)
- **Reason**: 
  - Database efficient for queries/sorting
  - Frontend can format to "Januari" etc via mapping
  - Standardized for date filtering

---

## 📚 Related Documentation

- [MEETING_NOTES_02_FEB_2026.md](MEETING_NOTES_02_FEB_2026.md) - Original requirements
- [ERD Database.md](ERD Database.md) - Database schema
- [ASSESSMENT_QUICK_REFERENCE.md](ASSESSMENT_QUICK_REFERENCE.md) - Assessment flow

---

## 🚀 Next Steps

1. **Frontend Integration** (High Priority):
   - Update Create.tsx with new form fields
   - Integrate JournalMetadataManager component
   - Test form submission

2. **UI/UX Polish** (Medium Priority):
   - Add loading states
   - Improve error messages
   - Add tooltips for help text

3. **Testing** (High Priority):
   - Unit tests for validation logic
   - Integration tests for full flow
   - Browser tests for UI interactions

4. **Documentation** (Low Priority):
   - Update user guide
   - Add screenshots
   - Create admin training materials

---

**Implementation by**: GitHub Copilot  
**Date**: 03 Februari 2026
