# 🚀 JurnalMu MVP v1.1 - Feature Specification (EXPANDED SCOPE)

## 📋 Document Information

**Version:** 1.1 (Full Hierarchical Management)  
**Release Date:** Q2 2026 (Estimated)  
**Development Duration:** 17 weeks (Extended from 14 weeks)  
**Prerequisites:** MVP v1.0 must be deployed and stable  
**Last Updated:** January 15, 2026

**⚠️ SCOPE CHANGE**: Added full 4-level hierarchical management for Borang Indikator based on stakeholder requirements:
- Template Borang Akreditasi
- Manajemen Unsur Evaluasi (Level 1)
- Manajemen Sub Unsur (Level 2)
- Manajemen Indikator Penilaian (Level 3)

---

## 🎯 V1.1 Vision & Objectives

### **Vision Statement**
*"Extend JurnalMu from a static data management system to a dynamic coaching platform with fully hierarchical accreditation structure that actively improves journal quality through expert guidance and feedback."*

### **Core Objectives**

1. **Enable Quality Improvement Workflow**
   - Journals can request expert coaching/pembinaan
   - Reviewers provide structured feedback
   - Track improvement progress over time

2. **Empower Admins with Full Hierarchical Configuration**
   - Super Admin can manage 4-level accreditation hierarchy (Template → Unsur → Sub Unsur → Indikator)
   - Support multiple accreditation standards (BAN-PT, internal PTM, etc.)
   - Drag-and-drop reordering with visual tree view
   - Clone templates for new versions without data loss

3. **Complete the Assessment Lifecycle**
   - User submits → Admin reviews → User improves → Request coaching
   - Close the feedback loop from v1.0

---

## 📊 V1.0 Recap: What's Already Built

### **✅ Completed in v1.0 (Foundation)**

#### **Authentication & Authorization**
- Email/password + Google SSO
- 3 roles: Super Admin, Admin Kampus, User
- Policy-based authorization with university_id scoping

#### **Super Admin Features**
- CRUD Universities (PTM management)
- CRUD Admin Kampus (university PIC management)
- View all journals (cross-university monitoring)
- View all assessments (read-only)

#### **Admin Kampus Features**
- CRUD Users within their university
- View journals from their university
- View assessments from their university

#### **User Features**
- Profile management
- CRUD Journals
- Self-assessment submission (draft → submitted workflow)

#### **Database (9 Tables)**
- `users`, `roles`, `universities`, `scientific_fields`
- `journals`, `journal_assessments`, `assessment_responses`, `assessment_attachments`
- `evaluation_indicators` (seeded data, no CRUD)

### **🔧 What Needs Improvement (Addressed in v1.1)**

1. ❌ No admin review layer for assessments (data goes from 'submitted' → nowhere)
2. ❌ Evaluation indicators hardcoded via seeder (requires code deployment to update)
3. ❌ No hierarchical structure for accreditation standards
4. ❌ No coaching/pembinaan workflow (assessment ends at submission)
5. ❌ No reviewer assignment mechanism
6. ❌ Super Admin can't manage reference data (scientific fields, accreditation templates)

---

## 🚀 V1.1 Features Overview

| # | Feature | User Role | Priority | Complexity | Dependencies |
|---|---------|-----------|----------|------------|--------------|
| **1** | Assessment Review Workflow | Admin Kampus | High | Low | None (uses existing tables) |
| **2** | Full Hierarchical Borang Management | Super Admin | High | **High** | None |
| **3** | Pembinaan (Coaching) Request Module | User → Admin Kampus → Reviewer | High | Medium | Feature #1 (assessments must be reviewed first) |
| **4** | Reviewer Management | Admin Kampus | Medium | Low | Feature #3 (coaches need to exist) |
| **5** | Data Master Management | Super Admin | Low | Low | None |

**Development Timeline**: 17 weeks (4 sprints)

---

## 1️⃣ Assessment Review Workflow

### **User Story**
*"Sebagai Admin Kampus, saya ingin me-review hasil self-assessment jurnal di kampus saya agar bisa memberikan feedback dan validasi sebelum direkomendasi untuk pembinaan."*

### **Problem Statement**
Currently, users submit assessments but there's no admin validation layer. The `journal_assessments` table has `status` field with 'reviewed' option and `admin_notes` field, but no UI to use them.

### **Acceptance Criteria**

#### **For Admin Kampus**
- [ ] Can see list of assessments with status 'submitted' (pending review)
- [ ] Can click "Review" button on submitted assessment
- [ ] Opens modal/page with:
  - Assessment details (read-only)
  - All responses and scores
  - Uploaded documents (can download)
  - Form to add admin notes (rich text editor)
  - Action buttons: "Approve" or "Request Revision"
- [ ] On "Approve":
  - Status changes to 'reviewed'
  - `reviewed_by` set to current admin's ID
  - `reviewed_at` timestamp saved
  - User receives notification (in-app + email optional)
- [ ] On "Request Revision":
  - Status changes back to 'draft'
  - Admin notes visible to user
  - User can re-edit and re-submit

#### **For Super Admin**
- [ ] Same features as Admin Kampus but can review all assessments (cross-university)

#### **For User**
- [ ] Can see assessment status on dashboard
- [ ] When status is 'reviewed', can view admin notes
- [ ] When status is 'draft' (after revision request), can edit assessment again

### **Database Changes**
No new tables needed. Use existing fields:
- `journal_assessments.status` - Already has 'draft', 'submitted', 'reviewed'
- `journal_assessments.admin_notes` - Already exists (TEXT)
- `journal_assessments.reviewed_by` - Already exists (FK to users)
- `journal_assessments.reviewed_at` - Already exists (TIMESTAMP)

### **UI Components Needed**
- Assessment review modal/page
- Rich text editor for admin notes (TinyMCE or Tiptap)
- Status badges with color coding (draft=yellow, submitted=blue, reviewed=green)
- Timeline view showing submission → review history

### **Routes**
```php
// Admin Kampus & Super Admin
GET  /admin-kampus/assessments/{id}/review
POST /admin-kampus/assessments/{id}/approve
POST /admin-kampus/assessments/{id}/request-revision
```

### **Success Metrics**
- 80% of submitted assessments reviewed within 7 days
- Average review time < 48 hours
- < 10% assessments require multiple revisions

---

## 2️⃣ Full Hierarchical Borang Indikator Management 🆕

### **User Story**
*"Sebagai Super Admin, saya ingin mengelola struktur akreditasi lengkap dengan 4 tingkat hierarki (Template → Unsur → Sub Unsur → Indikator) agar bisa mendukung multiple standar akreditasi dan update criteria tanpa developer."*

### **Problem Statement**
Saat ini:
- Evaluation indicators di-seed dari migration dengan struktur flat (hanya category/sub_category string)
- Tidak ada dukungan untuk multiple accreditation standards (BAN-PT vs internal PTM)
- Tidak ada visual hierarchy management
- Update criteria requires code deployment
- Tidak ada template cloning untuk create new versions

**Stakeholder Requirements**:
1. **Manajemen Template Borang Akreditasi** - Multiple standards support
2. **Manajemen Unsur Evaluasi** - Level 1 categories with weights
3. **Manajemen Sub Unsur** - Level 2 subcategories
4. **Manajemen Indikator Penilaian** - Level 3 assessment items with ordering

### **Architecture Overview**

```
Template Borang Akreditasi (e.g., "BAN-PT 2024")
│
├── Unsur Evaluasi 1 (e.g., "Visi Misi")
│   ├── Sub Unsur 1.1 (e.g., "Kejelasan Visi")
│   │   ├── Indikator 1.1.1 (question)
│   │   ├── Indikator 1.1.2 (question)
│   │   └── Indikator 1.1.3 (question)
│   └── Sub Unsur 1.2 (e.g., "Implementasi Visi")
│       ├── Indikator 1.2.1
│       └── Indikator 1.2.2
│
├── Unsur Evaluasi 2 (e.g., "Tata Kelola")
│   ├── Sub Unsur 2.1
│   │   ├── Indikator 2.1.1
│   │   └── Indikator 2.1.2
│   └── Sub Unsur 2.2
│       └── Indikator 2.2.1
```

### **Feature 2A: Manajemen Template Borang Akreditasi**

#### **User Stories**
1. **Sebagai Super Admin**, saya ingin membuat template borang akreditasi baru (e.g., "BAN-PT 2024", "Akreditasi Internal PTM v2"), sehingga bisa mendukung multiple standar akreditasi.
2. **Sebagai Super Admin**, saya ingin mengaktifkan/nonaktifkan template tertentu, sehingga hanya template yang relevan yang muncul di jurnal assessment.
3. **Sebagai Super Admin**, saya ingin melihat preview struktur lengkap template (Unsur → Sub Unsur → Indikator), sehingga bisa validasi kelengkapan sebelum dipublikasi.
4. **Sebagai Super Admin**, saya ingin clone template existing untuk membuat versi baru, sehingga tidak perlu input ulang semua struktur.

#### **Acceptance Criteria**
- [ ] **List Templates Page** (`/admin/borang-indikator/templates`)
  - Table with columns: Name, Version, Status (Active/Inactive), Effective Date, Counts (Unsur/Sub Unsur/Indikator)
  - Actions: View Tree, Edit, Clone, Toggle Active, Delete
  - Create New Template button

- [ ] **Create/Edit Template Modal**
  - Fields: name (required, unique), description, version, effective_date
  - Validation: Name max 255 chars, effective_date must be future date
  - Save button creates new `accreditation_templates` record

- [ ] **Clone Template Feature**
  - "Clone" button opens modal: "Clone [Template Name]?"
  - Auto-append " (Copy)" to name
  - Deep clone: Template + ALL Unsur + Sub Unsur + Indikator
  - Transaction-based: Rollback if any step fails
  - Success message: "Template cloned successfully. X Unsur, Y Sub Unsur, Z Indikator copied."

- [ ] **Toggle Active Feature**
  - Switch toggle on table row
  - Validation: At least 1 template must remain active
  - Warning modal if template used by journals: "X journals using this template. Continue?"

- [ ] **Tree View** (see Feature 2E)

#### **Database Schema**

```sql
CREATE TABLE accreditation_templates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    version VARCHAR(50) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    effective_date DATE NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    INDEX idx_active (is_active),
    INDEX idx_effective_date (effective_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### **Feature 2B: Manajemen Unsur Evaluasi**

#### **User Stories**
5. **Sebagai Super Admin**, saya ingin membuat/edit/hapus Unsur Evaluasi dalam template tertentu dengan urutan/bobot, sehingga struktur penilaian bisa disesuaikan.
6. **Sebagai Super Admin**, saya ingin men-drag-and-drop untuk reorder Unsur, sehingga borang tampil sesuai urutan standar.

#### **Acceptance Criteria**
- [ ] **CRUD Unsur Evaluasi** (nested under template tree view or separate page)
  - Fields: code (e.g., "A", "1"), name (e.g., "Visi Misi"), description, weight (0-100), display_order
  - Parent: template_id (dropdown atau auto-filled jika dari tree view)
  - Validation: code unique within template, weight max 100

- [ ] **Drag-and-Drop Reordering**
  - Visual drag handle icon on each Unsur row
  - Drop updates `display_order` field
  - API endpoint: `POST /api/admin/evaluation-categories/reorder`
  - Optimistic UI update (show new order immediately, rollback if API fails)

- [ ] **Deletion Constraints**
  - Cannot delete Unsur if has active Sub Unsur (show error: "Delete all Sub Unsur first")
  - Soft delete to preserve historical data
  - Warning modal: "Delete Unsur [Name]? This will also delete X Sub Unsur and Y Indikator."

#### **Database Schema**

```sql
CREATE TABLE evaluation_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    template_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    weight DECIMAL(5,2) DEFAULT 0.00,
    display_order INT UNSIGNED DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (template_id) REFERENCES accreditation_templates(id) ON DELETE CASCADE,
    INDEX idx_template_order (template_id, display_order),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_template_code (template_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### **Feature 2C: Manajemen Sub Unsur**

#### **User Stories**
7. **Sebagai Super Admin**, saya ingin membuat/edit/hapus Sub Unsur di bawah Unsur tertentu, sehingga kategori bisa dipecah lebih detail.
8. **Sebagai Super Admin**, saya ingin memindahkan Sub Unsur dari satu Unsur ke Unsur lain, sehingga reorganisasi struktur bisa dilakukan tanpa data loss.

#### **Acceptance Criteria**
- [ ] **CRUD Sub Unsur** (nested under Unsur in tree view)
  - Fields: code (e.g., "A.1", "1.2"), name, description, display_order
  - Parent: category_id (dropdown of Unsur dalam template yang sama)
  - Validation: code unique within parent Unsur

- [ ] **Move to Different Unsur**
  - Edit modal has "Parent Unsur" dropdown
  - Warning modal: "Move Sub Unsur to different Unsur? X Indikator will be affected."
  - Update all child indicators' parent reference

- [ ] **Reordering within Unsur**
  - Drag-and-drop reorder Sub Unsur under same parent
  - Similar to Unsur reordering logic

#### **Database Schema**

```sql
CREATE TABLE evaluation_sub_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    display_order INT UNSIGNED DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES evaluation_categories(id) ON DELETE CASCADE,
    INDEX idx_category_order (category_id, display_order),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_category_code (category_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### **Feature 2D: Manajemen Indikator Penilaian**

#### **User Stories**
9. **Sebagai Super Admin**, saya ingin menambah indikator penilaian baru di bawah Sub Unsur tertentu, sehingga assessment bisa mencakup aspek baru.
10. **Sebagai Super Admin**, saya ingin menonaktifkan indikator yang sudah tidak relevan tanpa menghapus data historis, sehingga assessment lama tetap valid.
11. **Sebagai Super Admin**, saya ingin reorder indikator dalam Sub Unsur, sehingga pertanyaan muncul sesuai flow logic.

#### **Acceptance Criteria**
- [ ] **CRUD Indikator** (nested under Sub Unsur in tree view or separate filtered page)
  - Fields: code (e.g., "1.1.1", "A.2.5"), question (textarea, max 500 chars), response_type (text/number/file), is_required (checkbox), is_active (checkbox), display_order
  - Parent: sub_category_id (dropdown of Sub Unsur)
  - Validation: question required, code unique within Sub Unsur

- [ ] **Soft Delete with Historical Preservation**
  - Delete button marks `is_active = false` instead of hard delete
  - Indikator used in submitted assessments cannot be hard deleted (show error)
  - Filter toggle: "Show inactive indicators" (default off)

- [ ] **Reordering within Sub Unsur**
  - Drag-and-drop logic same as Unsur/Sub Unsur levels

- [ ] **Bulk Actions**
  - Select multiple indicators → Activate/Deactivate all at once

#### **Modified evaluation_indicators Table**

```sql
ALTER TABLE evaluation_indicators
    ADD COLUMN sub_category_id BIGINT UNSIGNED NULL AFTER id,
    ADD COLUMN code VARCHAR(50) NULL AFTER sub_category_id,
    ADD COLUMN display_order INT UNSIGNED DEFAULT 0 AFTER question,
    ADD COLUMN is_required BOOLEAN DEFAULT TRUE AFTER display_order,
    ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER is_required,
    ADD FOREIGN KEY fk_indicators_subcategory (sub_category_id) 
        REFERENCES evaluation_sub_categories(id) ON DELETE SET NULL,
    ADD INDEX idx_subcategory_order (sub_category_id, display_order),
    ADD INDEX idx_active (is_active);

-- Keep old category/sub_category columns for backward compatibility
-- New indicators will use sub_category_id relationship
```

---

### **Feature 2E: Tree View & Audit Trail**

#### **Acceptance Criteria**
- [ ] **Hierarchical Tree View** (`/admin/borang-indikator/templates/{id}/tree`)
  - Expandable/collapsible nodes using Accordion or TreeView component
  - Display counts: "5 Unsur, 12 Sub Unsur, 45 Indikator"
  - Visual indentation for hierarchy levels
  - Color-coded status: Active (green), Inactive (gray)
  - Actions per node: Edit (pencil icon), Add child (plus icon), Delete (trash icon), Reorder (drag handle)

- [ ] **Breadcrumb Navigation**
  - `Admin → Borang Indikator → [Template Name] → Tree View`

- [ ] **Audit Trail** (for all 4 levels)
  - Create `hierarchy_audit_logs` table (polymorphic)
  - Observer on Template, Category, SubCategory, Indicator models
  - Log: action (created/updated/deleted), changes (JSON diff), user_id, timestamp
  - Audit log viewer: Modal/page showing history per item

#### **API Endpoints**

```php
// Templates
GET    /api/admin/accreditation-templates
POST   /api/admin/accreditation-templates
GET    /api/admin/accreditation-templates/{id}
PUT    /api/admin/accreditation-templates/{id}
DELETE /api/admin/accreditation-templates/{id}
POST   /api/admin/accreditation-templates/{id}/clone
PATCH  /api/admin/accreditation-templates/{id}/toggle-active
GET    /api/admin/accreditation-templates/{id}/tree  // Nested structure

// Unsur Evaluasi
GET    /api/admin/evaluation-categories?template_id={id}
POST   /api/admin/evaluation-categories
PUT    /api/admin/evaluation-categories/{id}
DELETE /api/admin/evaluation-categories/{id}
POST   /api/admin/evaluation-categories/reorder

// Sub Unsur
GET    /api/admin/evaluation-sub-categories?category_id={id}
POST   /api/admin/evaluation-sub-categories
PUT    /api/admin/evaluation-sub-categories/{id}
DELETE /api/admin/evaluation-sub-categories/{id}

// Indikator
GET    /api/admin/evaluation-indicators?sub_category_id={id}
POST   /api/admin/evaluation-indicators
PUT    /api/admin/evaluation-indicators/{id}
DELETE /api/admin/evaluation-indicators/{id}
POST   /api/admin/evaluation-indicators/reorder
```

### **Success Metrics**
- Super Admin can create new template in < 30 minutes (vs weeks waiting for developer)
- Clone template feature reduces new version setup time by 90%
- Drag-and-drop reordering perceived as intuitive (user testing)
- Audit trail provides full traceability (regulatory compliance)

### **Technical Notes**
- Use **dnd-kit** or **react-beautiful-dnd** for drag-and-drop
- Tree view: shadcn/ui Accordion or custom TreeView with recursive component
- Optimistic UI updates for reordering (improve perceived performance)
- Transaction-based operations for clone feature (atomic all-or-nothing)
- Eager loading for tree view to avoid N+1 queries (`with(['categories.subCategories.indicators'])`)

---

## 3️⃣ Pembinaan (Coaching) Module

(Content from original v1.1 document - no changes needed for coaching module)

### **3A. Request Pembinaan (User)**

#### **User Story**
*"Sebagai User, saya ingin request pembinaan untuk jurnal saya yang sudah di-review agar bisa mendapat coaching dari reviewer ahli."*

#### **Acceptance Criteria**
- [ ] User can see "Request Pembinaan" button on journal detail page
- [ ] Only journals with completed assessment (status=reviewed) can request pembinaan
- [ ] Form fields:
  - Journal (auto-filled if coming from journal page, or dropdown)
  - Request type (dropdown: Akreditasi, Indeksasi, Editorial, Technical)
  - Priority (dropdown: Low, Medium, High)
  - Description (textarea, max 1000 chars - explain what help is needed)
  - Attachment (optional, PDF/DOCX, max 10MB - e.g., rejection letter)
- [ ] On submit:
  - Status = 'pending'
  - Email notification sent to Admin Kampus
  - User redirected to "My Coaching Requests" page

#### **Database Schema**

```sql
CREATE TABLE coaching_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    journal_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    request_type ENUM('akreditasi', 'indeksasi', 'editorial', 'technical') NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    description TEXT NOT NULL,
    attachment_path VARCHAR(255) NULL,
    status ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_journal (journal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### **3B. Manage Coaching Requests (Admin Kampus)**

#### **User Story**
*"Sebagai Admin Kampus, saya ingin melihat dan mengelola request pembinaan dari user di kampus saya, termasuk assign ke reviewer yang sesuai."*

#### **Acceptance Criteria**
- [ ] List all coaching requests from their university
- [ ] Filter by status, type, priority
- [ ] View request details with journal info
- [ ] Assign reviewer from dropdown (filtered by expertise)
- [ ] Reassign or unassign reviewer
- [ ] Email notifications on status changes

#### **Database Schema**

```sql
CREATE TABLE coaching_assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coaching_request_id BIGINT UNSIGNED NOT NULL,
    reviewer_id BIGINT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    admin_notes TEXT NULL,
    status ENUM('assigned', 'in_progress', 'completed') DEFAULT 'assigned',
    FOREIGN KEY (coaching_request_id) REFERENCES coaching_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reviewer (reviewer_id),
    INDEX idx_request (coaching_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### **3C. Provide Feedback (Reviewer)**

#### **User Story**
*"Sebagai Reviewer, saya ingin memberikan feedback terstruktur untuk coaching request yang di-assign ke saya."*

#### **Acceptance Criteria**
- [ ] View assigned coaching requests dashboard
- [ ] Mark request as "In Progress"
- [ ] Submit feedback form with:
  - Feedback notes (rich text, min 100 chars)
  - Recommendations (bullet points or structured)
  - Attachments (optional, PDF/DOCX, max 10MB)
  - Rating (1-5 scale, how achievable are recommendations)
- [ ] Mark as "Completed"
- [ ] User receives notification on completion

#### **Database Schema**

```sql
CREATE TABLE coaching_feedback (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coaching_assignment_id BIGINT UNSIGNED NOT NULL,
    feedback_text TEXT NOT NULL,
    recommendations TEXT NULL,
    attachment_path VARCHAR(255) NULL,
    rating TINYINT UNSIGNED NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (coaching_assignment_id) REFERENCES coaching_assignments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4️⃣ Reviewer Management

(Content from original v1.1 document - no changes needed)

### **User Story**
*"Sebagai Admin Kampus, saya ingin mengelola profil reviewer (expertise, availability) agar bisa assign coaching requests secara optimal."*

### **Acceptance Criteria**
- [ ] List all users with `is_reviewer = true` in their university
- [ ] Edit reviewer profile: Toggle `is_reviewer` flag, Edit `reviewer_expertise` JSON, Set `max_assignments` limit
- [ ] View reviewer dashboard: Current assignments count, Availability status, Expertise tags
- [ ] Load balancing: System suggests reviewer with lowest `current_assignments`

### **Database Changes**

```sql
ALTER TABLE users 
    ADD COLUMN is_reviewer BOOLEAN DEFAULT FALSE AFTER is_active,
    ADD COLUMN reviewer_expertise JSON NULL AFTER is_reviewer,
    ADD COLUMN max_assignments INT UNSIGNED DEFAULT 5 AFTER reviewer_expertise,
    ADD COLUMN current_assignments INT UNSIGNED DEFAULT 0 AFTER max_assignments;

-- reviewer_expertise format: ["scientific_field_1", "scientific_field_2"]
```

---

## 5️⃣ Data Master Management

(Content from original v1.1 document - no changes needed)

### **User Story**
*"Sebagai Super Admin, saya ingin mengelola data master (universities, scientific fields) melalui UI agar tidak perlu developer untuk data reference updates."*

### **Acceptance Criteria**

#### **Universities Management**
- [ ] CRUD interface for `universities` table (already done in v1.0 but enhance UI)
- [ ] Fields: name, address, contact info, is_active
- [ ] Validation: Cannot delete university if has active users/journals

#### **Scientific Fields Management**
- [ ] CRUD interface for `scientific_fields` table
- [ ] Fields: name, description, is_active
- [ ] Bulk import from CSV (for large datasets)
- [ ] Validation: Cannot delete field if used by journals

---

## 📊 Success Metrics for v1.1

### **Feature Adoption**
- [ ] 90% of Admin Kampus use assessment review feature within first month
- [ ] Super Admin creates at least 2 accreditation templates (BAN-PT + internal)
- [ ] 50% of reviewed assessments result in coaching requests
- [ ] Average coaching request completion time < 14 days

### **System Usage**
- [ ] No code deployments needed for evaluation criteria updates (goal: 0 deployments for config changes)
- [ ] Audit trail captures 100% of hierarchy changes for compliance

### **User Satisfaction**
- [ ] Post-coaching survey: > 4.0/5.0 satisfaction rating from users
- [ ] Super Admin reports > 50% time savings on borang management vs v1.0

---

## 🚫 Out of Scope for v1.1

(Deferred to v1.2+)

1. **Advanced Analytics Dashboard** - Coaching success rates, trends over time
2. **Multi-Campus Collaboration** - Share coaching resources across universities
3. **Integration APIs** - Third-party accreditation platforms
4. **Mobile App** - Native iOS/Android (v1.1 remains web-only)
5. **Automated Recommendations** - AI-suggested coaching based on assessment scores
6. **Payment/Subscription Module** - v1.1 assumes free usage for all PTM
7. **Real-time Chat** - Between user and reviewer (use email/external chat for v1.1)

---

## 📦 Deliverables Summary

### **Code**
- [ ] 3 new database tables (accreditation_templates, evaluation_categories, evaluation_sub_categories)
- [ ] Modified evaluation_indicators table (add relational fields)
- [ ] 3 new database tables for coaching (coaching_requests, coaching_assignments, coaching_feedback)
- [ ] Modified users table (reviewer fields)
- [ ] 4 new controllers (AccreditationTemplateController, CategoryController, SubCategoryController, IndicatorController)
- [ ] 3 new controllers for coaching (CoachingRequestController, CoachingAssignmentController, CoachingFeedbackController)
- [ ] 8 new React pages for hierarchical management (Template CRUD, Tree View, Category/SubCategory/Indicator CRUD)
- [ ] 6 new React pages for coaching (Request form, My Requests, Admin Dashboard, Assign Modal, Reviewer Dashboard, Feedback Form)
- [ ] Drag-and-drop library integration (dnd-kit)
- [ ] TreeView component with Accordion
- [ ] Rich text editor integration (TinyMCE/Tiptap)
- [ ] Email notification templates (review approved, coaching assigned, coaching completed)
- [ ] Comprehensive test coverage (Feature tests, Policy tests, Browser tests)

### **Documentation**
- [ ] Updated ERD with v1.1 schema
- [ ] API documentation for new endpoints
- [ ] User manual for hierarchical borang management
- [ ] Admin guide for coaching workflow
- [ ] Migration guide (v1.0 → v1.1)

### **Testing**
- [ ] Unit tests for models and policies
- [ ] Feature tests for CRUD operations
- [ ] Integration tests for full workflows
- [ ] Browser tests (Dusk) for UI interactions
- [ ] Performance tests for tree view queries

---

## 🔄 Migration Strategy

### **Database Migration**
1. Run new table migrations (templates, categories, sub_categories)
2. Run ALTER migrations (evaluation_indicators, users)
3. Seed default accreditation template ("BAN-PT 2024")
4. **Backward Compatibility**: Keep old `category`/`sub_category` string columns in evaluation_indicators (mark as deprecated, remove in v1.2)

### **Data Migration**
- Extract unique categories from existing evaluation_indicators → Create evaluation_categories records
- Extract unique sub_categories → Create evaluation_sub_categories records
- Link existing indicators to new sub_category_id (gradual migration, not forced)

### **Feature Flags** (Optional for staged rollout)
- `ENABLE_HIERARCHICAL_BORANG` - Toggle new hierarchy management UI
- `ENABLE_COACHING_MODULE` - Toggle pembinaan features

---

## 📅 Development Timeline

**Estimated Duration**: 17 weeks (Solo Developer)  
**Timeline Extension Rationale**: +3 weeks added to accommodate full 4-level hierarchical management based on stakeholder requirements

### **Sprint Breakdown**
- **Sprint 1** (Weeks 1-7): Assessment Review + Full Hierarchical Borang Management
  - Phase A (Weeks 1-2): Assessment Review
  - Phase B (Weeks 3-7): Hierarchical Management (4 levels)
- **Sprint 2** (Weeks 8-12): Pembinaan Module (5 weeks)
- **Sprint 3** (Weeks 13-15): Reviewer Management (3 weeks)
- **Sprint 4** (Weeks 16-17): Data Master + Testing + Deployment (2 weeks)

**See detailed roadmap in `jurnal_mu roadmap v1.1.md`**

---

## 🎯 Definition of Done

A feature is considered "Done" when:

- [x] Code implemented and follows Laravel/React conventions
- [x] Policy tests pass (authorization correct for all roles)
- [x] Feature tests pass (happy path + edge cases)
- [x] Browser tests pass (E2E user workflows)
- [x] Code review completed (self-review using checklist)
- [x] No lint errors (Pint + ESLint)
- [x] Responsive design works on mobile/tablet/desktop
- [x] Documentation updated (inline comments, README, user guide)
- [x] Deployed to staging and manually tested
- [x] Stakeholder approval obtained

---

## 📞 Support & Feedback

**Development Lead**: [Your Name]  
**Stakeholder Contact**: [Stakeholder Email]  
**Project Repository**: [GitHub Link]  
**Documentation**: `/docs` folder in repo

---

**Last Updated**: January 15, 2026  
**Next Review**: After Sprint 1 completion (Week 7)
