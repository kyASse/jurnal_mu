# Design Spec: Journal Import Notifications & Partial Failure Handling

**Date:** 2026-05-28  
**Topic:** Journal Import Toasts, Notifications, and Partial Failure Redirects  
**Status:** Approved by User  

---

## 1. Goal Description
Ensure a better UX by:
1. Redirecting users back to the import form (instead of the index page) during a partial failure (warning state) so they can view row-level validation errors.
2. Integrating Sonner toasts for instant feedback during upload transitions, client-side validation failures, and server flash responses.
3. Adding a new Pest feature test to cover the partial failure scenario.

---

## 2. Proposed Changes

### 2.1 Backend Redirects & Test Case

#### [JournalController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/AdminKampus/JournalController.php)
- Update `processImport` to redirect back to `admin-kampus.journals.import` (rather than `admin-kampus.journals.index`) when `$summary['error_count'] > 0` (partial failure / warning state).

#### [JournalImportTest.php](file:///C:/xampp/htdocs/jurnal_mu/tests/Feature/AdminKampus/JournalImportTest.php)
- Add a new test case `import_jurnal_dengan_peringatan_jika_sebagian_baris_gagal`:
  - Upload a CSV containing one valid row and one invalid row (invalid ISSN format).
  - Verify that the response redirects to the import page.
  - Verify that the session has a `warning` message and `import_errors`.
  - Verify that the valid row is stored in the database, while the invalid row is not.

---

### 2.2 Frontend Toasts & Polish

#### [Import.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/AdminKampus/Journals/Import.tsx)
- Import `toast` from `'sonner'`.
- Add a `React.useEffect` hook that listens to changes in `flash` and `errors` props:
  - Trigger `toast.success` for `flash.success`.
  - Trigger `toast.warning` for `flash.warning` (partial success).
  - Trigger `toast.error` for `flash.error` (total failure).
  - Trigger `toast.error` for `errors.csv_file` (upload validation failure).
- In the client-side CSV header validation (inside `Papa.parse` callback):
  - Trigger `toast.error` with the specific missing required columns list if the validation fails.
- Polish the import error display area to make it cleaner and easier to read.

---

## 3. Verification Plan

### 3.1 Automated Tests
Run Laravel Pest feature tests:
`docker exec jurnal-mu-app php artisan test tests/Feature/AdminKampus/JournalImportTest.php`

### 3.2 Manual Verification
- Upload a CSV with one valid row and one invalid row. Check that you are kept on the import page, a warning toast appears, and the row-level error log is displayed.
- Select a file missing a required column (e.g. `url`). Check that a red Sonner toast displays the missing column error immediately.
