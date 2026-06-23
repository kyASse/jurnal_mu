# Universities Sorting and Export Design

Implement sorting filter in Universities management dashboard and add journals/users counts to export.

## Proposed Changes

### Backend

#### [MODIFY] [UniversityController.php](file:///c:/xampp/htdocs/jurnal_mu/app/Http/Controllers/Admin/UniversityController.php)

- **`index` method**:
  - Read `sort` parameter (default: `name_asc`).
  - Validate and map to Eloquent query:
    - `name_asc` => `orderBy('name', 'asc')`
    - `name_desc` => `orderBy('name', 'desc')`
    - `code_asc` => `orderBy('code', 'asc')`
    - `code_desc` => `orderBy('code', 'desc')`
    - `users_desc` => `orderBy('users_count', 'desc')`
    - `journals_desc` => `orderBy('journals_count', 'desc')`
  - Pass `sort` inside `filters` array to Inertia view.

- **`export` method**:
  - Eager load counts: `University::withCount(['users', 'journals'])->orderBy('name')->cursor()`
  - Add sheet columns: `'Jumlah Jurnal'` and `'Jumlah User'`.

### Frontend

#### [MODIFY] [Index.tsx](file:///c:/xampp/htdocs/jurnal_mu/resources/js/Pages/Admin/Universities/Index.tsx)

- Add state `sortFilter` initialized by `filters.sort || 'name_asc'`.
- Add `<Select>` UI element in filters area.
- Options:
  - Name (A-Z) -> `name_asc`
  - Name (Z-A) -> `name_desc`
  - Code (A-Z) -> `code_asc`
  - Code (Z-A) -> `code_desc`
  - Most Users -> `users_desc`
  - Most Journals -> `journals_desc`
- Include `sort` in `router.get` parameters inside search form submit and clear button handlers.
