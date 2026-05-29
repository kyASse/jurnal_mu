# Journal Import Audit & UI/UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align Excel journal import validation with manual form requests, fix pending approval controller query bugs, and modernize frontend import UI/UX with client-side validation and drag-and-drop.

**Architecture:** 
- Align validation regex in `JournalsImport.php` with manual requests (`StoreJournalRequest`).
- Add robust `sinta_rank` string/integer mapper.
- Add strict header validation on backend (`JournalsImport.php`) and client-side (`Import.tsx`).
- Replace standard HTML file input with custom drag-and-drop zone using React state and Tailwind CSS.
- Fix SQL/PHP bugs on pending approvals search, approve, reject actions by substituting `name` with `title`.

**Tech Stack:** PHP, Laravel, Pest (testing), React, TypeScript, Inertia.js, PapaParse, Tailwind CSS.

---

### Task 1: Backend Controller Bug Fixes

**Files:**
- Modify: `app/Http/Controllers/AdminKampus/JournalApprovalController.php:37,94,139`
- Modify: `app/Http/Controllers/AdminKampus/JournalController.php:935`

- [ ] **Step 1: Fix query and attributes in JournalApprovalController.php**
  Replace search query using `name` with `title`, and redirect success flash messages using `$journal->name` with `$journal->title`.
  Modify `app/Http/Controllers/AdminKampus/JournalApprovalController.php`:
  ```php
  // line 37:
  $q->where('title', 'like', "%{$search}%")
  // line 94:
  ->with('success', "Jurnal \"{$journal->title}\" berhasil disetujui dan sekarang terlihat di platform.");
  // line 139:
  ->with('success', "Jurnal \"{$journal->title}\" ditolak. Pengelola jurnal telah diberi notifikasi.");
  ```

- [ ] **Step 2: Fix reassign success redirect message in JournalController.php**
  Replace redirect success flash message referencing `$journal->name` with `$journal->title`.
  Modify `app/Http/Controllers/AdminKampus/JournalController.php` (line 935):
  ```php
  return back()->with('success', "Jurnal \"{$journal->title}\" berhasil di-reassign dari {$oldUser->name} ke {$newUser->name}.");
  ```

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add app/Http/Controllers/AdminKampus/JournalApprovalController.php app/Http/Controllers/AdminKampus/JournalController.php
  git commit -m "fix(backend): align controller name references with journal title column"
  ```

---

### Task 2: Create Journal Import Feature Tests

**Files:**
- Create: `tests/Feature/AdminKampus/JournalImportTest.php`

- [ ] **Step 1: Write feature tests for journal import**
  Create the test file `tests/Feature/AdminKampus/JournalImportTest.php`:
  ```php
  <?php

  use App\Models\Journal;
  use App\Models\ScientificField;
  use App\Models\University;
  use App\Models\User;
  use Illuminate\Http\UploadedFile;

  beforeEach(function () {
      $this->seedRoles();
  });

  test('admin_kampus_dapat_mengakses_halaman_import_jurnal', function () {
      $university = University::factory()->create();
      $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

      $this->actingAs($adminKampus)
          ->get(route('admin-kampus.journals.import'))
          ->assertOk();
  });

  test('tamu_tidak_dapat_mengakses_halaman_import_jurnal', function () {
      $this->get(route('admin-kampus.journals.import'))
          ->assertRedirect(route('login'));
  });

  test('gagal_import_jika_header_csv_tidak_sesuai', function () {
      $university = University::factory()->create();
      $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

      $header = "title,publisher,issn\n"; // missing e_issn, url, oai_url
      $row = "Jurnal A,Penerbit A,1234-5678\n";
      $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row);

      $this->actingAs($adminKampus)
          ->post(route('admin-kampus.journals.import.process'), [
              'csv_file' => $file,
          ])
          ->assertRedirect()
          ->assertSessionHas('error');
  });

  test('berhasil_import_jurnal_dengan_format_valid', function () {
      $university = University::factory()->create();
      $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

      $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
      // Row 1: standard, Row 2: ISSN ending in 'X', SINTA Rank string
      $row1 = "Jurnal A,Penerbit A,1234-5678,9876-5432,2025,2,https://example.com/a,https://example.com/a/oai,a@example.com,0812\n";
      $row2 = "Jurnal B,Penerbit B,1111-222X,3333-444X,2024,sinta_4,https://example.com/b,https://example.com/b/oai,,\n";

      $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row1 . $row2);

      $this->actingAs($adminKampus)
          ->post(route('admin-kampus.journals.import.process'), [
              'csv_file' => $file,
          ])
          ->assertRedirect(route('admin-kampus.journals.index'))
          ->assertSessionHas('success');

      $this->assertDatabaseHas('journals', [
          'title' => 'Jurnal A',
          'issn' => '1234-5678',
          'e_issn' => '9876-5432',
          'sinta_rank' => 'sinta_2',
          'url' => 'https://example.com/a',
      ]);

      $this->assertDatabaseHas('journals', [
          'title' => 'Jurnal B',
          'issn' => '1111-222X',
          'e_issn' => '3333-444X',
          'sinta_rank' => 'sinta_4',
          'url' => 'https://example.com/b',
      ]);
  });
  ```

- [ ] **Step 2: Run tests to verify they fail**
  Run: `php -d variables_order=EGPCS artisan test tests/Feature/AdminKampus/JournalImportTest.php`
  Expected: Failures on CSV header mismatch and format parsing (regex / missing required columns).

- [ ] **Step 3: Commit tests**
  Run:
  ```bash
  git add tests/Feature/AdminKampus/JournalImportTest.php
  git commit -m "test(backend): add feature tests for journal import validation and mapping"
  ```

---

### Task 3: Backend CSV Import Validation Fixes

**Files:**
- Modify: `app/Imports/JournalsImport.php`

- [ ] **Step 1: Implement CSV header validation and exceptions**
  Update `import()` in `app/Imports/JournalsImport.php` to throw an exception if required headers are missing.
  Modify `app/Imports/JournalsImport.php` (line 48-65):
  ```php
          // Read header row
          $headers = fgetcsv($file);

          if (! $headers) {
              fclose($file);
              throw new \Exception('CSV file is empty or invalid');
          }

          // Normalize headers (trim and lowercase, strip BOM)
          $headers = array_map(function ($h) {
              $h = trim($h);
              // Remove BOM if present
              $h = preg_replace('/^\xEF\xBB\xBF/', '', $h);

              return strtolower($h);
          }, $headers);

          // Validate required headers
          $requiredHeaders = ['title', 'e_issn', 'url', 'oai_url'];
          $missingHeaders = array_diff($requiredHeaders, $headers);
          if (! empty($missingHeaders)) {
              fclose($file);
              throw new \Exception('Kolom wajib berikut tidak ditemukan dalam file CSV: ' . implode(', ', $missingHeaders));
          }
  ```

- [ ] **Step 2: Update validation rules and error messages**
  Update `rules()` and `messages()` in `app/Imports/JournalsImport.php`:
  - Make `url` and `oai_url` required.
  - Make `publisher` nullable.
  - Update ISSN/E-ISSN regex to `/^\d{4}-\d{3}[\dX]$/i`.
  - Update `sinta_rank` to string enum values validation.
  Modify `app/Imports/JournalsImport.php` (line 192-235):
  ```php
      protected function rules(): array
      {
          return [
              'title' => 'required|string|max:255',
              'publisher' => 'nullable|string|max:500',
              'issn' => [
                  'nullable',
                  'string',
                  'max:20',
                  'regex:/^\d{4}-\d{3}[\dX]$/i',
              ],
              'e_issn' => [
                  'required',
                  'string',
                  'max:20',
                  'regex:/^\d{4}-\d{3}[\dX]$/i',
              ],
              'publication_year' => 'nullable|integer|min:1900|max:'.(now()->year + 1),
              'sinta_rank' => 'nullable|string|in:1,2,3,4,5,6,sinta_1,sinta_2,sinta_3,sinta_4,sinta_5,sinta_6,non_sinta',
              'url' => 'required|url|max:500',
              'oai_url' => 'required|url|max:500',
              'email' => 'nullable|email|max:255',
              'phone' => 'nullable|string|max:50',
          ];
      }

      protected function messages(): array
      {
          return [
              'title.required' => 'Judul jurnal wajib diisi.',
              'url.required' => 'URL jurnal wajib diisi.',
              'oai_url.required' => 'URL OAI-PMH wajib diisi.',
              'e_issn.required' => 'E-ISSN wajib diisi.',
              'issn.regex' => 'Format ISSN harus: 1234-5678 (karakter terakhir boleh \'X\').',
              'e_issn.regex' => 'Format E-ISSN harus: 1234-5678 (karakter terakhir boleh \'X\').',
              'publication_year.integer' => 'Tahun terbit harus berupa angka.',
              'sinta_rank.in' => 'Ranking SINTA tidak valid.',
              'url.url' => 'URL tidak valid.',
              'oai_url.url' => 'URL OAI-PMH tidak valid.',
              'email.email' => 'Format email tidak valid.',
          ];
      }
  ```

- [ ] **Step 3: Update mapSintaRank method**
  Make SINTA rank mapping robust for both string prefixes (`sinta_1..sinta_6`), raw integers (`1..6`), and `non_sinta` string values.
  Modify `app/Imports/JournalsImport.php` (line 174-187):
  ```php
      protected function mapSintaRank($value): string
      {
          if (empty($value)) {
              return 'non_sinta';
          }

          $value = strtolower(trim($value));

          if ($value === 'non_sinta') {
              return 'non_sinta';
          }

          if (preg_match('/^sinta_([1-6])$/', $value, $matches)) {
              return $value;
          }

          if (preg_match('/^sinta\s*([1-6])$/', $value, $matches)) {
              return 'sinta_' . $matches[1];
          }

          $intVal = (int) $value;
          if ($intVal >= 1 && $intVal <= 6) {
              return 'sinta_' . $intVal;
          }

          return 'non_sinta';
      }
  ```

- [ ] **Step 4: Verify tests pass**
  Run: `php -d variables_order=EGPCS artisan test tests/Feature/AdminKampus/JournalImportTest.php`
  Expected: All tests pass.

- [ ] **Step 5: Commit backend fixes**
  Run:
  ```bash
  git add app/Imports/JournalsImport.php
  git commit -m "feat(backend): align import validation with manual form & add CSV header validation"
  ```

---

### Task 4: Frontend UI/UX Improvements

**Files:**
- Modify: `resources/js/pages/AdminKampus/Journals/Import.tsx`

- [ ] **Step 1: Implement Drag-and-Drop Dropzone UI and File Card**
  Add dropzone state handlers (`isDragging`) and custom JSX for a clean upload area with a dashed green or gray border.
  Modify `resources/js/pages/AdminKampus/Journals/Import.tsx` to handle file drops and show a styled card for the selected file.
  Make sure to implement:
  - Drag handlers: `handleDragOver`, `handleDragLeave`, `handleDrop`.
  - Visual indicators: highlight borders when dragging over.
  - File status card: display name, size (formatted), and a reset button (`Batal` / `Remove`).

- [ ] **Step 2: Add client-side CSV header validation**
  Implement validation check inside the Papa.parse callback:
  ```typescript
  // In handleFileChange/handleDrop:
  Papa.parse(file, {
      header: true,
      preview: 1, // We only need the headers from the first row
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
          const fields = results.meta.fields || [];
          const required = ['title', 'e_issn', 'url', 'oai_url'];
          const missing = required.filter(col => !fields.includes(col));
          
          if (missing.length > 0) {
              setFileError(`Kolom wajib tidak ditemukan: ${missing.join(', ')}. Silakan download template.`);
              setSelectedFile(null);
              setPreviewData([]);
          } else {
              setFileError('');
              setSelectedFile(file);
              // Read first 5 rows for actual preview
              Papa.parse(file, {
                  header: true,
                  preview: 5,
                  skipEmptyLines: true,
                  complete: (previewResults) => {
                      setPreviewData(previewResults.data as CsvRow[]);
                  }
              });
          }
      }
  });
  ```

- [ ] **Step 3: Update UI guidelines and notes**
  - Change `requiredColumns` to `['title', 'e_issn', 'url', 'oai_url']`.
  - Change `optionalColumns` to `['publisher', 'issn', 'publication_year', 'sinta_rank', 'email', 'phone']`.
  - Update formatting notes Card (remove misleading date, add publication year format example).

- [ ] **Step 4: Verify frontend build**
  Run: `npm run build`
  Run: `npm run types`
  Expected: Successful compilation without errors or warnings.

- [ ] **Step 5: Commit frontend changes**
  Run:
  ```bash
  git add resources/js/pages/AdminKampus/Journals/Import.tsx
  git commit -m "feat(frontend): add drag-and-drop upload zone, guidelines correction, and client-side CSV validation"
  ```
