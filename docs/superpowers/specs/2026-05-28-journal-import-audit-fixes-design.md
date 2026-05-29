# Design Spec: Journal Import Audit & UI/UX Improvements

**Date:** 2026-05-28  
**Topic:** Journal Import Excel/CSV Audit and Fixes  
**Status:** Approved by User  

---

## 1. Goal Description
The objective is to fix database mapping bugs, align CSV import validation rules with manual creation/edit requests, correction of CSV template guidelines, and modernizing the frontend UI/UX with client-side header validation and a drag-and-drop interface.

---

## 2. Proposed Changes

### 2.1 Backend Bugs & Alignment

#### [JournalApprovalController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/AdminKampus/JournalApprovalController.php)
- Fix the search query which crashes due to checking `name` instead of `title` in the database.
- Fix redirects and messages referencing the non-existent `$journal->name` attribute, changing it to `$journal->title`.

#### [JournalController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/AdminKampus/JournalController.php)
- Fix reassign success redirect message referencing `$journal->name`, changing it to `$journal->title`.

#### [JournalsImport.php](file:///C:/xampp/htdocs/jurnal_mu/app/Imports/JournalsImport.php)
- Add header validation in `import()`:
  - If any required header (`title`, `e_issn`, `url`, `oai_url`) is missing from the parsed CSV header row, abort early with a clear exception message.
- Align validation rules with `StoreJournalRequest` and `UpdateJournalRequest`:
  - `url`: change from `nullable` to `required|url|max:500`.
  - `oai_url`: change from `nullable` to `required|url|max:500`.
  - `publisher`: change from `required` to `nullable|string|max:500`.
  - `issn` and `e_issn` regex: change from `/^\d{4}-\d{4}$/` to `/^\d{4}-\d{3}[\dX]$/i` (supports 'X' suffix).
  - `sinta_rank`: allow flexibility (`nullable|string|in:1,2,3,4,5,6,sinta_1,sinta_2,sinta_3,sinta_4,sinta_5,sinta_6,non_sinta`).
- Update `mapSintaRank($value)`:
  - Match case-insensitively.
  - Correctly map integers `1..6` to `sinta_1..sinta_6`.
  - Map `non_sinta` to `non_sinta`.
  - Map `sinta_1`..`sinta_6` directly.

---

### 2.2 Frontend UI/UX Enhancements

#### [Import.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/AdminKampus/Journals/Import.tsx)
- **Drag-and-Drop Dropzone**:
  - Replace default `<Input type="file" />` with a styled drop zone using a dashed border, hover transitions, and a upload icon.
  - Support `onDragOver`, `onDragLeave`, and `onDrop` events to capture files.
  - Display a styled "File Card" when a file is selected containing the file name, size, and a remove/reset button.
- **Client-side Header Validation**:
  - Configure `Papa.parse` to use `transformHeader: (h) => h.trim().toLowerCase()`.
  - In `handleFileChange`, validate the parsed header keys. If required columns (`title`, `e_issn`, `url`, `oai_url`) are missing, reject the file, show an error alert, and reset the file input.
- **Guidelines Corrections**:
  - Move `url` and `oai_url` under required columns.
  - Move `publisher` under optional columns.
  - Remove the misleading `Tanggal: YYYY-MM-DD` note.
  - Add `Tahun Terbit: YYYY (contoh: 2026)` under formatting notes.

---

## 3. Verification Plan

### 3.1 Automated Tests
Run Laravel phpunit/pest feature tests for journal import and verify validation and mapping changes pass:
`php artisan test`

### 3.2 Manual Verification
- Attempt to upload a CSV with a trailing 'X' ISSN (e.g. `1234-567X`). Verify it is imported successfully.
- Attempt to upload a CSV with missing required columns (e.g. missing `url`). Verify frontend rejects the file immediately, showing the missing headers.
- Search pending approvals and assign a journal to verify name-related bugs are resolved.
- Verify download template structure is correct.
