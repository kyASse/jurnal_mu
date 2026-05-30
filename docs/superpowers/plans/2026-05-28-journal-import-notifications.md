# Journal Import Notifications & Partial Failure Handling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redirect users back to the import page during a partial import failure (warning state) so they see errors, and display interactive Sonner toast notifications for all import states.

**Architecture:**
- Redirect partial failures to `admin-kampus.journals.import` in `JournalController.php`.
- Add a Pest feature test for partial failures inside `JournalImportTest.php`.
- Use a `useEffect` hook in `Import.tsx` to handle `flash` and `errors` property changes, calling `toast.success`, `toast.warning`, or `toast.error` from `'sonner'`.

**Tech Stack:** PHP, Laravel, Pest, React, TypeScript, Sonner Toasts.

---

### Task 1: Backend Redirect & Test Case

**Files:**
- Modify: `app/Http/Controllers/AdminKampus/JournalController.php:795`
- Modify: `tests/Feature/AdminKampus/JournalImportTest.php:77`

- [ ] **Step 1: Redirect partial failures to the import page**
  Modify `processImport` in `app/Http/Controllers/AdminKampus/JournalController.php` (around line 795):
  ```php
  // Replace:
  if ($summary['error_count'] > 0) {
      return redirect()->route('admin-kampus.journals.index')
  // With:
  if ($summary['error_count'] > 0) {
      return redirect()->route('admin-kampus.journals.import')
  ```

- [ ] **Step 2: Add Pest test case for partial failures**
  Add the following test case at the end of `tests/Feature/AdminKampus/JournalImportTest.php`:
  ```php
  test('import_jurnal_dengan_peringatan_jika_sebagian_baris_gagal', function () {
      $university = University::factory()->create();
      $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

      $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
      $row1 = "Jurnal Sukses,Penerbit A,1234-5678,9876-5432,2025,2,https://example.com/a,https://example.com/a/oai,,\n";
      $row2 = "Jurnal Gagal,Penerbit B,invalid-issn,3333-4444,2024,,https://example.com/b,https://example.com/b/oai,,\n";

      $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row1 . $row2);

      $this->actingAs($adminKampus)
          ->post(route('admin-kampus.journals.import.process'), [
              'csv_file' => $file,
          ])
          ->assertRedirect(route('admin-kampus.journals.import'))
          ->assertSessionHas('warning')
          ->assertSessionHas('import_errors');

      $this->assertDatabaseHas('journals', ['title' => 'Jurnal Sukses']);
      $this->assertDatabaseMissing('journals', ['title' => 'Jurnal Gagal']);
  });
  ```

- [ ] **Step 3: Run tests to verify**
  Run inside Docker container:
  `docker exec jurnal-mu-app php artisan test tests/Feature/AdminKampus/JournalImportTest.php`
  Expected: All tests pass.

- [ ] **Step 4: Commit Task 1**
  Run:
  ```bash
  git add app/Http/Controllers/AdminKampus/JournalController.php tests/Feature/AdminKampus/JournalImportTest.php
  git commit -m "feat(backend): redirect partial failures to import page and add test coverage"
  ```

---

### Task 2: Frontend Sonner Toasts & Notification UI

**Files:**
- Modify: `resources/js/pages/AdminKampus/Journals/Import.tsx`

- [ ] **Step 1: Import toast and add useEffect listener**
  Import `toast` from `'sonner'` and add `useEffect` inside `Import` component to listen to `flash` and `errors` prop changes.
  Modify `resources/js/pages/AdminKampus/Journals/Import.tsx`:
  - Import `useEffect`:
    ```typescript
    import { FormEventHandler, useEffect, useRef, useState } from 'react';
    import { toast } from 'sonner';
    ```
  - Inside `Import` component:
    ```typescript
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (errors?.csv_file) {
            toast.error(errors.csv_file);
        }
    }, [flash, errors]);
    ```

- [ ] **Step 2: Display toast for client-side header validation failures**
  Trigger `toast.error` when Papa.parse validation fails on file load.
  Modify `resources/js/pages/AdminKampus/Journals/Import.tsx` inside Papa.parse `complete` callback:
  ```typescript
  if (missing.length > 0) {
      const errorMsg = `Kolom wajib tidak ditemukan: ${missing.join(', ')}. Silakan download template.`;
      setFileError(errorMsg);
      toast.error(errorMsg);
      setSelectedFile(null);
      setPreviewData([]);
  }
  ```

- [ ] **Step 3: Polish layout of import errors block**
  Style the validation errors list in `Import.tsx` to render more cleanly using visual card boundaries and distinct bold colors.

- [ ] **Step 4: Verify frontend build**
  Run: `npm run build`
  Run: `npm run types`
  Expected: Success without errors.

- [ ] **Step 5: Commit Task 2**
  Run:
  ```bash
  git add resources/js/pages/AdminKampus/Journals/Import.tsx
  git commit -m "feat(frontend): integrate sonner toasts and improve import error details layout"
  ```
