# Export Universities and Journals Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement export features for universities and journals in both XLSX and CSV formats with role-based restriction (Super Admin for universities; Super Admin and Admin Kampus for journals).

**Architecture:** Use route parameters to define export format. Handle queries inside the respective controllers using Spatie Simple Excel's `SimpleExcelWriter::streamDownload` utility, stream responses directly to save memory. Render custom dropdown export buttons on list views.

**Tech Stack:** Laravel, Spatie Simple Excel, Inertia, React, Lucide icons, Tailwind CSS, Pest (testing).

---

### Task 1: Add Routes for Exporting

**Files:**
- Modify: `routes/web.php`

- [ ] **Step 1: Define export routes**
  Add routes for exporting universities and journals in [routes/web.php](file:///C:/xampp/htdocs/jurnal_mu/routes/web.php).

  Insert universities export route inside the super admin prefix ('admin') group:
  ```php
  Route::get('universities/export/{format}', [UniversityController::class, 'export'])
      ->name('universities.export');
  ```
  Insert journals export route inside the super admin prefix ('admin') group:
  ```php
  Route::get('journals/export/{format}', [JournalController::class, 'export'])
      ->name('journals.export');
  ```
  Insert journals export route inside the admin-kampus prefix ('admin-kampus') group:
  ```php
  Route::get('journals/export/{format}', [App\Http\Controllers\AdminKampus\JournalController::class, 'export'])
      ->name('journals.export');
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add routes/web.php
  git commit -m "feat: add export routes for universities and journals"
  ```

---

### Task 2: Implement University Export for Super Admin

**Files:**
- Modify: `app/Http/Controllers/Admin/UniversityController.php`
- Create: `tests/Feature/Admin/UniversityExportTest.php`

- [ ] **Step 1: Implement export method**
  Add the `export` method in [UniversityController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/Admin/UniversityController.php).
  ```php
  use Spatie\SimpleExcel\SimpleExcelWriter;

  public function export(string $format)
  {
      $format = strtolower($format);
      abort_unless(in_array($format, ['xlsx', 'csv']), 400, 'Format tidak didukung');

      $universities = University::orderBy('name')->get();

      $writer = SimpleExcelWriter::streamDownload("universities.{$format}");

      foreach ($universities as $uni) {
          $writer->addRow([
              'ID' => $uni->id,
              'Kode PTM' => $uni->code,
              'Kode NIDN' => $uni->ptm_code,
              'Nama Universitas' => $uni->name,
              'Nama Singkat' => $uni->short_name,
              'Alamat' => $uni->address,
              'Kota' => $uni->city,
              'Provinsi' => $uni->province,
              'Kode Pos' => $uni->postal_code,
              'Telepon' => $uni->phone,
              'Email' => $uni->email,
              'Website' => $uni->website,
              'Status Akreditasi' => $uni->accreditation_status,
              'Klaster' => $uni->cluster,
              'Status Aktif' => $uni->is_active ? 'Aktif' : 'Tidak Aktif',
              'Tanggal Terdaftar' => $uni->created_at?->format('Y-m-d H:i:s'),
          ]);
      }

      return $writer->toBrowser();
  }
  ```

- [ ] **Step 2: Write feature test**
  Create [tests/Feature/Admin/UniversityExportTest.php](file:///C:/xampp/htdocs/jurnal_mu/tests/Feature/Admin/UniversityExportTest.php):
  ```php
  <?php

  use App\Models\Role;
  use App\Models\University;
  use App\Models\User;
  use Database\Seeders\RoleSeeder;

  beforeEach(function () {
      $this->seed(RoleSeeder::class);
      $this->superAdmin = User::factory()->create([
          'role_id' => Role::where('name', Role::SUPER_ADMIN)->value('id'),
      ]);
      $this->adminKampus = User::factory()->create([
          'role_id' => Role::where('name', Role::ADMIN_KAMPUS)->value('id'),
      ]);
      University::factory()->count(3)->create();
  });

  it('allows super admin to export universities to xlsx', function () {
      $response = $this->actingAs($this->superAdmin)
          ->get(route('admin.universities.export', 'xlsx'));

      $response->assertStatus(200);
      $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  it('allows super admin to export universities to csv', function () {
      $response = $this->actingAs($this->superAdmin)
          ->get(route('admin.universities.export', 'csv'));

      $response->assertStatus(200);
      $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
  });

  it('denies university export for admin kampus', function () {
      $response = $this->actingAs($this->adminKampus)
          ->get(route('admin.universities.export', 'xlsx'));

      $response->assertStatus(403);
  });
  ```

- [ ] **Step 3: Run test to verify it passes**
  Run command inside docker container:
  `docker exec -it jurnal-mu-app php artisan test tests/Feature/Admin/UniversityExportTest.php`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add app/Http/Controllers/Admin/UniversityController.php tests/Feature/Admin/UniversityExportTest.php
  git commit -m "feat: implement universities export for Super Admin with tests"
  ```

---

### Task 3: Implement Journal Export for Super Admin

**Files:**
- Modify: `app/Http/Controllers/Admin/JournalController.php`
- Create: `tests/Feature/Admin/JournalExportTest.php`

- [ ] **Step 1: Implement export method**
  Add the `export` method in [JournalController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/Admin/JournalController.php).
  ```php
  use Spatie\SimpleExcel\SimpleExcelWriter;

  public function export(string $format)
  {
      $format = strtolower($format);
      abort_unless(in_array($format, ['xlsx', 'csv']), 400, 'Format tidak didukung');

      $journals = Journal::with(['university', 'user', 'scientificField'])
          ->orderBy('title')
          ->get();

      $writer = SimpleExcelWriter::streamDownload("journals_all.{$format}");

      foreach ($journals as $journal) {
          $writer->addRow([
              'ID' => $journal->id,
              'Judul Jurnal' => $journal->title,
              'ISSN' => $journal->issn,
              'E-ISSN' => $journal->e_issn,
              'URL Jurnal' => $journal->url,
              'Editorial Team URL' => $journal->editorial_team_url,
              'Publisher' => $journal->publisher,
              'Frekuensi' => $journal->frequency,
              'Tahun Terbit Pertama' => $journal->first_published_year,
              'Universitas' => $journal->university?->name,
              'Pengelola Jurnal' => $journal->user?->name . ' (' . $journal->user?->email . ')',
              'Bidang Ilmu' => $journal->scientificField?->name,
              'SINTA Rank' => $journal->sinta_rank,
              'Mulai Akreditasi' => $journal->accreditation_start_year,
              'Selesai Akreditasi' => $journal->accreditation_end_year,
              'Nomor SK Akreditasi' => $journal->accreditation_sk_number,
              'Tanggal SK Akreditasi' => $journal->accreditation_sk_date?->format('Y-m-d'),
              'Indeksasi' => is_array($journal->indexations) ? implode(', ', $journal->indexations) : '',
              'Status Aktif' => $journal->is_active ? 'Aktif' : 'Tidak Aktif',
              'Status Persetujuan' => $journal->approval_status,
              'Tanggal Dibuat' => $journal->created_at?->format('Y-m-d H:i:s'),
          ]);
      }

      return $writer->toBrowser();
  }
  ```

- [ ] **Step 2: Write feature test**
  Create [tests/Feature/Admin/JournalExportTest.php](file:///C:/xampp/htdocs/jurnal_mu/tests/Feature/Admin/JournalExportTest.php):
  ```php
  <?php

  use App\Models\Journal;
  use App\Models\Role;
  use App\Models\User;
  use Database\Seeders\RoleSeeder;

  beforeEach(function () {
      $this->seed(RoleSeeder::class);
      $this->superAdmin = User::factory()->create([
          'role_id' => Role::where('name', Role::SUPER_ADMIN)->value('id'),
      ]);
      $this->adminKampus = User::factory()->create([
          'role_id' => Role::where('name', Role::ADMIN_KAMPUS)->value('id'),
      ]);
      Journal::factory()->count(3)->create();
  });

  it('allows super admin to export all journals to xlsx', function () {
      $response = $this->actingAs($this->superAdmin)
          ->get(route('admin.journals.export', 'xlsx'));

      $response->assertStatus(200);
      $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  it('allows super admin to export all journals to csv', function () {
      $response = $this->actingAs($this->superAdmin)
          ->get(route('admin.journals.export', 'csv'));

      $response->assertStatus(200);
      $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
  });
  ```

- [ ] **Step 3: Run test to verify it passes**
  Run command inside docker container:
  `docker exec -it jurnal-mu-app php artisan test tests/Feature/Admin/JournalExportTest.php`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add app/Http/Controllers/Admin/JournalController.php tests/Feature/Admin/JournalExportTest.php
  git commit -m "feat: implement all journals export for Super Admin with tests"
  ```

---

### Task 4: Implement Journal Export for Admin Kampus

**Files:**
- Modify: `app/Http/Controllers/AdminKampus/JournalController.php`
- Create: `tests/Feature/AdminKampus/JournalExportTest.php`

- [ ] **Step 1: Implement export method**
  Add the `export` method in [JournalController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/AdminKampus/JournalController.php).
  ```php
  use Spatie\SimpleExcel\SimpleExcelWriter;
  use Illuminate\Support\Str;

  public function export(string $format)
  {
      $format = strtolower($format);
      abort_unless(in_array($format, ['xlsx', 'csv']), 400, 'Format tidak didukung');

      $authUser = auth()->user();
      abort_if(
          is_null($authUser->university_id),
          403,
          'Akun Admin Kampus Anda belum terhubung ke universitas.'
      );

      $journals = Journal::with(['university', 'user', 'scientificField'])
          ->forUniversity($authUser->university_id)
          ->orderBy('title')
          ->get();

      $uniSlug = Str::slug($authUser->university?->name ?? 'kampus');
      $writer = SimpleExcelWriter::streamDownload("journals_{$uniSlug}.{$format}");

      foreach ($journals as $journal) {
          $writer->addRow([
              'ID' => $journal->id,
              'Judul Jurnal' => $journal->title,
              'ISSN' => $journal->issn,
              'E-ISSN' => $journal->e_issn,
              'URL Jurnal' => $journal->url,
              'Editorial Team URL' => $journal->editorial_team_url,
              'Publisher' => $journal->publisher,
              'Frekuensi' => $journal->frequency,
              'Tahun Terbit Pertama' => $journal->first_published_year,
              'Universitas' => $journal->university?->name,
              'Pengelola Jurnal' => $journal->user?->name . ' (' . $journal->user?->email . ')',
              'Bidang Ilmu' => $journal->scientificField?->name,
              'SINTA Rank' => $journal->sinta_rank,
              'Mulai Akreditasi' => $journal->accreditation_start_year,
              'Selesai Akreditasi' => $journal->accreditation_end_year,
              'Nomor SK Akreditasi' => $journal->accreditation_sk_number,
              'Tanggal SK Akreditasi' => $journal->accreditation_sk_date?->format('Y-m-d'),
              'Indeksasi' => is_array($journal->indexations) ? implode(', ', $journal->indexations) : '',
              'Status Aktif' => $journal->is_active ? 'Aktif' : 'Tidak Aktif',
              'Status Persetujuan' => $journal->approval_status,
              'Tanggal Dibuat' => $journal->created_at?->format('Y-m-d H:i:s'),
          ]);
      }

      return $writer->toBrowser();
  }
  ```

- [ ] **Step 2: Write feature test**
  Create [tests/Feature/AdminKampus/JournalExportTest.php](file:///C:/xampp/htdocs/jurnal_mu/tests/Feature/AdminKampus/JournalExportTest.php):
  ```php
  <?php

  use App\Models\Journal;
  use App\Models\Role;
  use App\Models\University;
  use App\Models\User;
  use Database\Seeders\RoleSeeder;

  beforeEach(function () {
      $this->seed(RoleSeeder::class);
      
      $this->university1 = University::factory()->create(['name' => 'Univ A']);
      $this->university2 = University::factory()->create(['name' => 'Univ B']);

      $this->adminKampus = User::factory()->create([
          'role_id' => Role::where('name', Role::ADMIN_KAMPUS)->value('id'),
          'university_id' => $this->university1->id,
      ]);

      // Create journals in Univ A (should be exported)
      Journal::factory()->count(2)->create([
          'university_id' => $this->university1->id,
      ]);

      // Create journals in Univ B (should NOT be exported)
      Journal::factory()->count(1)->create([
          'university_id' => $this->university2->id,
      ]);
  });

  it('allows admin kampus to export their own university journals to xlsx', function () {
      $response = $this->actingAs($this->adminKampus)
          ->get(route('admin-kampus.journals.export', 'xlsx'));

      $response->assertStatus(200);
      $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  it('allows admin kampus to export their own university journals to csv', function () {
      $response = $this->actingAs($this->adminKampus)
          ->get(route('admin-kampus.journals.export', 'csv'));

      $response->assertStatus(200);
      $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
  });
  ```

- [ ] **Step 3: Run test to verify it passes**
  Run command inside docker container:
  `docker exec -it jurnal-mu-app php artisan test tests/Feature/AdminKampus/JournalExportTest.php`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add app/Http/Controllers/AdminKampus/JournalController.php tests/Feature/AdminKampus/JournalExportTest.php
  git commit -m "feat: implement journals export for Admin Kampus with tests"
  ```

---

### Task 5: Integrate Export Button in Super Admin Universities View

**Files:**
- Modify: `resources/js/Pages/Admin/Universities/Index.tsx`

- [ ] **Step 1: Add Dropdown Menu imports and render**
  Modify [Index.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/Pages/Admin/Universities/Index.tsx).
  Import components and icons:
  ```typescript
  import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import {
      // existing imports...
      Download,
      FileSpreadsheet,
      FileText,
  } from 'lucide-react';
  ```

  Insert the Export dropdown next to the "Add University" link/button in the header:
  ```tsx
  <div className="flex flex-col gap-2 sm:flex-row w-full md:w-auto">
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Download className="h-4 w-4" />
                  Export
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(route('admin.universities.export', 'xlsx'), '_blank')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                  Export as XLSX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(route('admin.universities.export', 'csv'), '_blank')}>
                  <FileText className="mr-2 h-4 w-4 text-blue-600" />
                  Export as CSV
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>

      {can.create && (
          <Link href={route('admin.universities.create')}>
              <Button className="flex w-full items-center gap-2 md:w-auto">
                  <Plus className="h-4 w-4" />
                  Add University
              </Button>
          </Link>
      )}
  </div>
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add resources/js/Pages/Admin/Universities/Index.tsx
  git commit -m "feat: integrate export dropdown button in Super Admin Universities list"
  ```

---

### Task 6: Integrate Export Button in Super Admin Journals View

**Files:**
- Modify: `resources/js/Pages/Admin/Journals/Index.tsx`

- [ ] **Step 1: Add Dropdown Menu imports and render**
  Modify [Index.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/Pages/Admin/Journals/Index.tsx).
  Import components and icons:
  ```typescript
  import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import {
      // existing imports...
      Download,
      FileSpreadsheet,
      FileText,
  } from 'lucide-react';
  ```

  Insert the Export dropdown next to the "Add Journal" button/link in the header:
  ```tsx
  <div className="flex flex-col gap-2 sm:flex-row w-full md:w-auto">
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Download className="h-4 w-4" />
                  Export
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(route('admin.journals.export', 'xlsx'), '_blank')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                  Export as XLSX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(route('admin.journals.export', 'csv'), '_blank')}>
                  <FileText className="mr-2 h-4 w-4 text-blue-600" />
                  Export as CSV
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>

      <Link href={route('admin.journals.create')}>
          <Button className="flex w-full items-center gap-2 md:w-auto">
              <Plus className="h-4 w-4" />
              Add Journal
          </Button>
      </Link>
  </div>
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add resources/js/Pages/Admin/Journals/Index.tsx
  git commit -m "feat: integrate export dropdown button in Super Admin Journals list"
  ```

---

### Task 7: Integrate Export Button in Admin Kampus Journals View

**Files:**
- Modify: `resources/js/Pages/AdminKampus/Journals/Index.tsx`

- [ ] **Step 1: Add Dropdown Menu imports and render**
  Modify [Index.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/Pages/AdminKampus/Journals/Index.tsx).
  Import components and icons:
  ```typescript
  import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import {
      // existing imports...
      Download,
      FileSpreadsheet,
      FileText,
  } from 'lucide-react';
  ```

  Insert the Export dropdown next to the "Add Journal" button/link in the header:
  ```tsx
  <div className="flex flex-col gap-2 sm:flex-row w-full md:w-auto">
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Download className="h-4 w-4" />
                  Export
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(route('admin-kampus.journals.export', 'xlsx'), '_blank')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                  Export as XLSX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(route('admin-kampus.journals.export', 'csv'), '_blank')}>
                  <FileText className="mr-2 h-4 w-4 text-blue-600" />
                  Export as CSV
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>

      <Link href={route('admin-kampus.journals.create')}>
          <Button className="flex w-full items-center gap-2 md:w-auto">
              <Plus className="h-4 w-4" />
              Add Journal
          </Button>
      </Link>
  </div>
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add resources/js/Pages/AdminKampus/Journals/Index.tsx
  git commit -m "feat: integrate export dropdown button in Admin Kampus Journals list"
  ```
