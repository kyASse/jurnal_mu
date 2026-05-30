# Design Spec: Super Admin Journal CSV Import

**Date:** 2026-05-29  
**Topic:** Super Admin Journal CSV Import  
**Status:** Approved by User  

---

## 1. Goal Description
Add CSV journal import feature to Super Admin role. Super Admin can select a target university and target user (manager) from dropdowns in the UI, and import journals in bulk for that university.

---

## 2. Proposed Changes

### 2.1 Backend Implementation

#### [web.php](file:///C:/xampp/htdocs/jurnal_mu/routes/web.php)
- Add new routes under the `admin` route group, placed before the wildcard `{journal}` route:
  - `GET /admin/journals/import/template` -> `JournalController@downloadTemplate` (Named: `admin.journals.import.template`)
  - `GET /admin/journals/import/form` -> `JournalController@import` (Named: `admin.journals.import`)
  - `POST /admin/journals/import/process` -> `JournalController@processImport` (Named: `admin.journals.import.process`)

#### [JournalController.php (Super Admin)](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/Admin/JournalController.php)
- Implement `import()`:
  - Fetch active universities: `University::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code'])`.
  - Fetch users (managers): `User::orderBy('name')->get(['id', 'name', 'email', 'university_id'])`.
  - Render Inertia page `Admin/Journals/Import`.
- Implement `processImport()`:
  - Authorize using `create` policy on `Journal`.
  - Validate request parameters:
    - `university_id`: required, exists in `universities` table.
    - `user_id`: required, exists in `users` table.
    - `csv_file`: required, file, max 5MB, csv/txt.
  - Process import using `JournalsImport`:
    - Instantiate `JournalsImport` using the selected `university_id` and `user_id` from the request.
    - Wrap execution in database transaction.
    - If all rows fail due to duplicates, return flash error `'Semua data gagal diimport karena jurnal/ISSN sudah terdaftar.'` along with row-level error arrays.
    - If partial failure occurs, redirect back to `admin.journals.import` with warning and error details.
    - If successful, redirect to `admin.journals.index` with success message.
- Implement `downloadTemplate()`:
  - Stream the same template CSV columns as Admin Kampus version.

---

### 2.2 Frontend Implementation

#### [Import.tsx (Super Admin)](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/Admin/Journals/Import.tsx)
- Create a new React component page under `resources/js/pages/Admin/Journals/Import.tsx`.
- The page includes:
  - Back button pointing to `admin.journals.index`.
  - `UniversityCombobox` for selecting target university.
  - `UserCombobox` for selecting target user, filtered client-side by selected `university_id`.
  - Drag-and-drop zone for uploading file, client-side CSV header validation (checks for `title`, `e_issn`, `url`, `oai_url`).
  - Table preview of the first 5 rows of the CSV.
  - Form submit logic using Inertia `useForm`.
  - Dynamic Sonner notifications listening to `flash` and `errors` page props.
  - Render of row-level CSV import errors at the top if present.

---

## 3. Verification Plan

### 3.1 Automated Tests
Create a new feature test `tests/Feature/Admin/JournalImportTest.php`:
- `super_admin_dapat_mengakses_halaman_import_jurnal`
- `super_admin_gagal_import_jika_header_csv_tidak_sesuai`
- `super_admin_berhasil_import_jurnal_dengan_format_valid`
- `super_admin_import_jurnal_dengan_peringatan_jika_sebagian_baris_gagal`
- `super_admin_import_gagal_jika_issn_duplikat`

Run test command:
`docker exec jurnal-mu-app ./vendor/bin/pest tests/Feature/Admin/JournalImportTest.php`

### 3.2 Manual Verification
- Log in as Super Admin.
- Navigate to `/admin/journals/import/form`.
- Test selecting a university and check that user dropdown changes to only show users of that university.
- Try importing duplicate data or files with wrong headers and check toast/error alerts.
