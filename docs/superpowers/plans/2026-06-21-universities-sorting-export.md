# Universities Sorting and Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement sorting in super admin universities management page and add total journals/users to export.

**Architecture:** Use Approach 1 (Single Select filter) for sorting. The controller accepts a `sort` request parameter, performs Eloquent ordering, and returns it to the frontend via Inertia. The export route loads count relations and prints them.

**Tech Stack:** Laravel, React, Inertia, SimpleExcelWriter.

---

### Task 1: Backend Sorting in Controller

**Files:**
- Modify: `app/Http/Controllers/Admin/UniversityController.php`

- [ ] **Step 1: Update `index` method to support sorting**
  Add sorting query handling:
  ```php
  // Apply sorting filter
  $sort = $request->get('sort', 'name_asc');
  
  $allowedSorts = [
      'name_asc' => ['name', 'asc'],
      'name_desc' => ['name', 'desc'],
      'code_asc' => ['code', 'asc'],
      'code_desc' => ['code', 'desc'],
      'users_desc' => ['users_count', 'desc'],
      'journals_desc' => ['journals_count', 'desc'],
  ];

  $sortParams = $allowedSorts[$sort] ?? ['name', 'asc'];
  ```
  And change:
  ```php
  // Get universities with counts
  $universities = $query
      ->withCount(['users', 'journals'])
      ->orderBy($sortParams[0], $sortParams[1])
      ->when($sortParams[0] !== 'name', function ($q) {
          return $q->orderBy('name', 'asc');
      })
      ->paginate(10)
      ...
  ```
  Pass `sort` inside `filters` back to the Inertia page:
  ```php
  'filters' => $request->only(['search', 'is_active', 'accreditation_status', 'cluster', 'sort']),
  ```

- [ ] **Step 2: Verify code syntax by running test**
  Run: `docker exec jurnal-mu-app php artisan test tests/Feature/Admin/UniversityControllerTest.php`
  Expected: PASS

---

### Task 2: Backend Export Counts

**Files:**
- Modify: `app/Http/Controllers/Admin/UniversityController.php`

- [ ] **Step 1: Update `export` method**
  In the `export` method, retrieve counts and add to CSV/XLSX:
  ```php
  foreach (University::withCount(['users', 'journals'])->orderBy('name')->cursor() as $university) {
      $writer->addRow([
          'ID' => $university->id,
          'Kode PTM' => $university->code,
          'Kode NIDN' => $university->ptm_code,
          'Nama Universitas' => $university->name,
          'Nama Singkat' => $university->short_name,
          'Alamat' => $university->address,
          'Kota' => $university->city,
          'Provinsi' => $university->province,
          'Kode Pos' => $university->postal_code,
          'Telepon' => $university->phone,
          'Email' => $university->email,
          'Website' => $university->website,
          'Status Akreditasi' => $university->accreditation_status,
          'Klaster' => $university->cluster,
          'Status Aktif' => $university->is_active ? 'Aktif' : 'Tidak Aktif',
          'Jumlah Jurnal' => $university->journals_count,
          'Jumlah User' => $university->users_count,
          'Tanggal Terdaftar' => $university->created_at?->format('Y-m-d H:i:s'),
      ]);
  }
  ```

- [ ] **Step 2: Run export tests**
  Run: `docker exec jurnal-mu-app php artisan test tests/Feature/Admin/UniversityExportTest.php`
  Expected: PASS

---

### Task 3: Frontend Sorting Dropdown UI

**Files:**
- Modify: `resources/js/Pages/Admin/Universities/Index.tsx`

- [ ] **Step 1: Declare sorting filter parameters**
  Add state and read the `sort` filter prop:
  ```typescript
  interface Props {
      ...
      filters: {
          search: string;
          is_active: string;
          accreditation_status: string;
          cluster: string;
          sort?: string;
      };
      ...
  }
  ```
  Initialize `sortFilter` state inside `UniversitiesIndex`:
  ```typescript
  const [sortFilter, setSortFilter] = useState(filters.sort || 'name_asc');
  ```

- [ ] **Step 2: Update `handleSearch` and search reset**
  Update `handleSearch` function to submit the `sort` value:
  ```typescript
  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      router.get(
          route('admin.universities.index'),
          {
              search,
              is_active: isActiveFilter === 'all' ? '' : isActiveFilter,
              accreditation_status: accreditationFilter === 'all' ? '' : accreditationFilter,
              cluster: clusterFilter === 'all' ? '' : clusterFilter,
              sort: sortFilter,
          },
          { preserveState: true },
      );
  };
  ```
  Update "Clear" button click handler to reset `sort`:
  ```typescript
  setSortFilter('name_asc');
  ```
  Add sorting select dropdown to form filters UI. Place it after `clusterFilter` dropdown:
  ```typescript
  <Select value={sortFilter} onValueChange={(value) => setSortFilter(value)}>
      <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Sort By" />
      </SelectTrigger>
      <SelectContent>
          <SelectItem value="name_asc">Name (A-Z)</SelectItem>
          <SelectItem value="name_desc">Name (Z-A)</SelectItem>
          <SelectItem value="code_asc">Code (A-Z)</SelectItem>
          <SelectItem value="code_desc">Code (Z-A)</SelectItem>
          <SelectItem value="users_desc">Most Users</SelectItem>
          <SelectItem value="journals_desc">Most Journals</SelectItem>
      </SelectContent>
  </Select>
  ```
  Also update the `useEffect` or state updates when `sortFilter` changes so changing sorting automatically triggers a search without having to click "Search":
  ```typescript
  useEffect(() => {
      router.get(
          route('admin.universities.index'),
          {
              search,
              is_active: isActiveFilter === 'all' ? '' : isActiveFilter,
              accreditation_status: accreditationFilter === 'all' ? '' : accreditationFilter,
              cluster: clusterFilter === 'all' ? '' : clusterFilter,
              sort: sortFilter,
          },
          { preserveState: true },
      );
  }, [sortFilter]);
  ```
  Wait! If we trigger search on `sortFilter` change, we should be careful about not triggering it on component mount. We can use an effect that skips initial render or check if the value changed. A simple:
  ```typescript
  const handleSortChange = (value: string) => {
      setSortFilter(value);
      router.get(
          route('admin.universities.index'),
          {
              search,
              is_active: isActiveFilter === 'all' ? '' : isActiveFilter,
              accreditation_status: accreditationFilter === 'all' ? '' : accreditationFilter,
              cluster: clusterFilter === 'all' ? '' : clusterFilter,
              sort: value,
          },
          { preserveState: true },
      );
  };
  ```
  And then use `onValueChange={handleSortChange}`. This is much cleaner and avoids unnecessary on-mount reload loops!

---

### Task 4: Automated Feature Tests

**Files:**
- Modify: `tests/Feature/Admin/UniversityControllerTest.php`
- Modify: `tests/Feature/Admin/UniversityExportTest.php`

- [ ] **Step 1: Write controller sorting test**
  Add assertions in `tests/Feature/Admin/UniversityControllerTest.php` verifying that universities are sorted by name, code, users count, and journals count correctly.
- [ ] **Step 2: Write export columns test**
  Add assertion in `tests/Feature/Admin/UniversityExportTest.php` to verify exported content contains `Jumlah Jurnal` and `Jumlah User`.
- [ ] **Step 3: Run all tests**
  Run: `docker exec jurnal-mu-app php artisan test tests/Feature/Admin`
  Expected: PASS
