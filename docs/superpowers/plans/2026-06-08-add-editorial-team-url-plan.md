# Add Editorial Team URL Feature Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `editorial_team_url` column to the `journals` table, expose it via model fillable, forms requests, controllers, and render it conditionally in the public journal detail sidebar.

**Architecture:** Database schema migration, backend request validation updates, React form updates (shared component and Super Admin create view), and conditionally rendering it on the public journal detail page.

**Tech Stack:** PHP, Laravel, React, InertiaJS, TypeScript.

---

### Task 1: Database Migration and Model Updates

**Files:**
- Modify: `database/migrations/2026_06_08_143745_add_editorial_team_url_to_journals_table.php`
- Modify: `app/Models/Journal.php`

- [ ] **Step 1: Write migration logic**
  Update `up()` to add `editorial_team_url` (nullable string, length 500) after `url`. Update `down()` to drop the column.
  
- [ ] **Step 2: Add to Model fillable**
  Add `'editorial_team_url'` to `$fillable` array in `app/Models/Journal.php`.

- [ ] **Step 3: Run migration**
  Run: `docker exec -i jurnal-mu-app php artisan migrate`
  Expected: Migration succeeds.

- [ ] **Step 4: Commit changes**
  Commit migration and model files.

---

### Task 2: Backend Controller and Form Request Updates

**Files:**
- Modify: `app/Http/Requests/StoreJournalRequest.php`
- Modify: `app/Http/Requests/UpdateJournalRequest.php`
- Modify: `app/Http/Controllers/Admin/JournalController.php`
- Modify: `app/Http/Controllers/PublicJournalController.php`

- [ ] **Step 1: Update form request validation**
  Add `'editorial_team_url' => 'nullable|url|max:500',` to validation rules in both `StoreJournalRequest.php` and `UpdateJournalRequest.php`.

- [ ] **Step 2: Update Admin JournalController**
  Add `'editorial_team_url' => 'nullable|url|max:255',` to `$request->validate()` in `store()` method of `app/Http/Controllers/Admin/JournalController.php`.

- [ ] **Step 3: Update PublicJournalController**
  Pass `'editorial_team_url' => $journal->editorial_team_url,` in `show()` Inertia rendering in `app/Http/Controllers/PublicJournalController.php`.

- [ ] **Step 4: Commit changes**
  Commit request and controller files.

---

### Task 3: Frontend Form Components Updates

**Files:**
- Modify: `resources/js/components/JournalForm.tsx`
- Modify: `resources/js/pages/Admin/Journals/Create.tsx`

- [ ] **Step 1: Update shared JournalForm.tsx**
  Add `editorial_team_url: string;` to `JournalFormData` type.
  Initialize state in hook: `editorial_team_url: initialData?.editorial_team_url || '',`.
  Render the Input element for Editorial Team URL directly under the Journal URL field.

- [ ] **Step 2: Update Admin Create.tsx**
  Add `editorial_team_url: ''` to form hook initialization.
  Render the Input element for Editorial Team URL under the Journal URL input field.

- [ ] **Step 3: Commit changes**
  Commit form changes.

---

### Task 4: Public Journal Detail Sidebar & Verification

**Files:**
- Modify: `resources/js/pages/Journals/Show.tsx`

- [ ] **Step 1: Conditionally render link**
  In `resources/js/pages/Journals/Show.tsx`, update the left sidebar menu to render the "Editorial Team" link only when `journal.editorial_team_url` is present:
  ```tsx
  {journal.editorial_team_url && (
      <a
          href={journal.editorial_team_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 border-b border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary dark:border-border dark:hover:bg-muted"
      >
          <ChevronRight className="h-4 w-4" /> Editorial Team
      </a>
  )}
  ```

- [ ] **Step 2: Verify TypeScript and compilation**
  Run: `npm run types`
  Run: `npm run lint`
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 3: Run backend test suite**
  Run: `docker exec -i jurnal-mu-app php artisan test`
  Expected: PASS

- [ ] **Step 4: Commit changes**
  Commit page and test updates.
