# Super Admin Journal CSV Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement CSV journal import for Super Admin role with target university and manager user selection dropdowns.

**Architecture:** Create new backend routes and controller actions in Super Admin's `JournalController`. Create a new frontend Inertia page incorporating `UniversityCombobox` and `UserCombobox` components. Implement a test suite using Pest to cover authorization, validation, success, partial failure, and duplicate handling.

**Tech Stack:** Laravel, Inertia, React, Tailwind CSS, PapaParse, Pest

---

### Task 1: Backend Routes

**Files:**
- Modify: `routes/web.php`

- [ ] **Step 1: Write routes for Super Admin journal import**
  Insert the following routes inside the `'admin'` middleware/prefix group in `routes/web.php`, immediately before the `Route::get('journals/{journal}', ...)` route (around line 260):

  ```php
          // Import journals from CSV
          Route::get('journals/import/template', [JournalController::class, 'downloadTemplate'])
              ->name('journals.import.template');
          Route::get('journals/import/form', [JournalController::class, 'import'])
              ->name('journals.import');
          Route::post('journals/import/process', [JournalController::class, 'processImport'])
              ->name('journals.import.process');
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add routes/web.php
  git commit -m "feat(routes): add routes for superadmin journal csv import"
  ```

---

### Task 2: Backend Controller Implementation

**Files:**
- Modify: `app/Http/Controllers/Admin/JournalController.php`
- Modify: `app/Http/Requests/ImportJournalRequest.php`

- [ ] **Step 1: Update authorization in `ImportJournalRequest`**
  Modify `authorize()` method in `app/Http/Requests/ImportJournalRequest.php` to allow both Admin Kampus and Super Admin:

  ```php
      public function authorize(): bool
      {
          $user = $this->user();
          return ($user->isAdminKampus() || $user->isSuperAdmin()) && $user->is_active;
      }
  ```

- [ ] **Step 2: Implement import methods in `JournalController`**
  Add the following imports and methods to `app/Http/Controllers/Admin/JournalController.php` (at the bottom before the closing class brace):

  ```php
  use App\Imports\JournalsImport;
  use Symfony\Component\HttpFoundation\StreamedResponse;

      /**
       * Show the journal import form.
       */
      public function import(): Response
      {
          $this->authorize('create', Journal::class);

          $universities = University::where('is_active', true)
              ->orderBy('name')
              ->get(['id', 'name', 'code']);

          $users = User::orderBy('name')
              ->get(['id', 'name', 'email', 'university_id']);

          return Inertia::render('Admin/Journals/Import', [
              'universities' => $universities,
              'users' => $users,
          ]);
      }

      /**
       * Process the CSV import.
       */
      public function processImport(Request $request): RedirectResponse
      {
          $this->authorize('create', Journal::class);

          $validated = $request->validate([
              'university_id' => 'required|exists:universities,id',
              'user_id' => 'required|exists:users,id',
              'csv_file' => 'required|file|mimes:csv,txt|max:5120',
          ]);

          try {
              DB::beginTransaction();

              $file = $request->file('csv_file');
              $filePath = $file->getRealPath();

              $import = new JournalsImport((int)$validated['university_id'], (int)$validated['user_id']);
              $import->import($filePath);

              $summary = $import->getSummary();

              DB::commit();

              if ($summary['success_count'] === 0 && $summary['error_count'] > 0) {
                  $allAreDuplicates = true;
                  foreach ($summary['errors'] as $rowError) {
                      foreach ($rowError['errors'] as $errorMsg) {
                          if (stripos($errorMsg, 'sudah terdaftar') === false && stripos($errorMsg, 'duplikat') === false) {
                              $allAreDuplicates = false;
                              break 2;
                          }
                      }
                  }

                  $errorMessage = $allAreDuplicates 
                      ? 'Semua data gagal diimport karena jurnal/ISSN sudah terdaftar.'
                      : 'Semua data gagal diimport. Silakan periksa isi dan format CSV Anda.';

                  return redirect()->route('admin.journals.import')
                      ->with('error', $errorMessage)
                      ->with('import_errors', $summary['errors']);
              }

              if ($summary['error_count'] > 0) {
                  return redirect()->route('admin.journals.import')
                      ->with('warning', "Import selesai dengan peringatan: {$summary['success_count']} jurnal berhasil diimport, {$summary['error_count']} baris gagal.")
                      ->with('import_errors', $summary['errors']);
              }

          } catch (\Exception $e) {
              DB::rollBack();

              return redirect()->route('admin.journals.import')
                  ->with('error', 'Terjadi kesalahan saat memproses file CSV: '.$e->getMessage());
          }

          return redirect()->route('admin.journals.index')
              ->with('success', "Import berhasil! {$summary['success_count']} jurnal telah ditambahkan.");
      }

      /**
       * Download CSV template for journal import.
       */
      public function downloadTemplate(): StreamedResponse
      {
          $headers = [
              'Content-Type' => 'text/csv; charset=utf-8',
              'Content-Disposition' => 'attachment; filename="template_import_jurnal.csv"',
              'Pragma' => 'no-cache',
              'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
              'Expires' => '0',
          ];

          $callback = function () {
              $file = fopen('php://output', 'w');
              
              // Write CSV headers
              fputcsv($file, [
                  'title',
                  'publisher',
                  'issn',
                  'e_issn',
                  'publication_year',
                  'sinta_rank',
                  'url',
                  'oai_url',
                  'email',
                  'phone'
              ]);
              
              // Write a sample row
              fputcsv($file, [
                  'Jurnal Pendidikan dan Kebudayaan',
                  'Universitas Negeri Kebangsaan',
                  '2085-0001',
                  '2085-0002',
                  '2024',
                  'sinta_2',
                  'https://jurnal.negerikebangsaan.ac.id/index.php/jpk',
                  'https://jurnal.negerikebangsaan.ac.id/index.php/jpk/oai',
                  'jpk@negerikebangsaan.ac.id',
                  '081234567890'
              ]);
              
              fclose($file);
          };

          return response()->stream($callback, 200, $headers);
      }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add app/Http/Controllers/Admin/JournalController.php app/Http/Requests/ImportJournalRequest.php
  git commit -m "feat(backend): implement import, processImport, and downloadTemplate in superadmin controller"
  ```

---

### Task 3: Backend Integration Tests

**Files:**
- Create: `tests/Feature/Admin/JournalImportTest.php`

- [ ] **Step 1: Write Pest tests for Super Admin CSV Import**
  Create the test file `tests/Feature/Admin/JournalImportTest.php` with the following content:

  ```php
  <?php

  use App\Models\Journal;
  use App\Models\University;
  use App\Models\User;
  use Illuminate\Http\UploadedFile;

  beforeEach(function () {
      $this->seedRoles();
  });

  test('super_admin_dapat_mengakses_halaman_import_jurnal', function () {
      $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);

      $this->actingAs($superAdmin)
          ->get(route('admin.journals.import'))
          ->assertOk();
  });

  test('super_admin_gagal_import_jika_header_csv_tidak_sesuai', function () {
      $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);
      $university = University::factory()->create();
      $user = User::factory()->create(['university_id' => $university->id]);

      $header = "title,publisher,issn\n"; // missing required headers
      $row = "Jurnal A,Penerbit A,1234-5678\n";
      $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row);

      $this->actingAs($superAdmin)
          ->post(route('admin.journals.import.process'), [
              'university_id' => $university->id,
              'user_id' => $user->id,
              'csv_file' => $file,
          ])
          ->assertRedirect()
          ->assertSessionHas('error');
  });

  test('super_admin_berhasil_import_jurnal_dengan_format_valid', function () {
      $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);
      $university = University::factory()->create();
      $user = User::factory()->create(['university_id' => $university->id]);

      $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
      $row = "Jurnal A,Penerbit A,1234-5678,9876-5432,2025,2,https://example.com/a,https://example.com/a/oai,a@example.com,0812\n";
      $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row);

      $this->actingAs($superAdmin)
          ->post(route('admin.journals.import.process'), [
              'university_id' => $university->id,
              'user_id' => $user->id,
              'csv_file' => $file,
          ])
          ->assertRedirect(route('admin.journals.index'))
          ->assertSessionHas('success');

      $this->assertDatabaseHas('journals', [
          'title' => 'Jurnal A',
          'issn' => '1234-5678',
          'e_issn' => '9876-5432',
          'university_id' => $university->id,
          'user_id' => $user->id,
      ]);
  });

  test('super_admin_import_jurnal_dengan_peringatan_jika_sebagian_baris_gagal', function () {
      $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);
      $university = University::factory()->create();
      $user = User::factory()->create(['university_id' => $university->id]);

      $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
      $row1 = "Jurnal Sukses,Penerbit A,1234-5678,9876-5432,2025,2,https://example.com/a,https://example.com/a/oai,,\n";
      $row2 = "Jurnal Gagal,Penerbit B,invalid-issn,3333-4444,2024,,https://example.com/b,https://example.com/b/oai,,\n";
      $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row1 . $row2);

      $this->actingAs($superAdmin)
          ->post(route('admin.journals.import.process'), [
              'university_id' => $university->id,
              'user_id' => $user->id,
              'csv_file' => $file,
          ])
          ->assertRedirect(route('admin.journals.import'))
          ->assertSessionHas('warning')
          ->assertSessionHas('import_errors');

      $this->assertDatabaseHas('journals', ['title' => 'Jurnal Sukses']);
      $this->assertDatabaseMissing('journals', ['title' => 'Jurnal Gagal']);
  });

  test('super_admin_import_gagal_jika_issn_duplikat', function () {
      $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);
      $university = University::factory()->create();
      $user = User::factory()->create(['university_id' => $university->id]);

      Journal::create([
          'university_id' => $university->id,
          'user_id' => $user->id,
          'title' => 'Duplicate Journal',
          'issn' => '1234-5678',
          'e_issn' => '9876-5432',
          'url' => 'https://example.com/a',
          'oai_urls' => ['https://example.com/a/oai'],
          'approval_status' => 'approved',
      ]);

      $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
      $row = "Duplicate Journal,Penerbit A,1234-5678,9876-5432,2025,2,https://example.com/a,https://example.com/a/oai,,\n";
      $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row);

      $this->actingAs($superAdmin)
          ->post(route('admin.journals.import.process'), [
              'university_id' => $university->id,
              'user_id' => $user->id,
              'csv_file' => $file,
          ])
          ->assertRedirect(route('admin.journals.import'))
          ->assertSessionHas('error', 'Semua data gagal diimport karena jurnal/ISSN sudah terdaftar.')
          ->assertSessionHas('import_errors');
  });
  ```

- [ ] **Step 2: Run Pest tests to verify implementation**
  Run: `docker exec jurnal-mu-app ./vendor/bin/pest tests/Feature/Admin/JournalImportTest.php`
  Expected: PASS

- [ ] **Step 3: Commit**

  ```bash
  git add tests/Feature/Admin/JournalImportTest.php
  git commit -m "test(backend): add integration tests for superadmin journal csv import"
  ```

---

### Task 4: Frontend UI Page Implementation

**Files:**
- Create: `resources/js/pages/Admin/Journals/Import.tsx`

- [ ] **Step 1: Implement import page in Inertia + React**
  Create the file `resources/js/pages/Admin/Journals/Import.tsx` with the following content:

  ```tsx
  import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
  import { Button } from '@/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Label } from '@/components/ui/label';
  import { UniversityCombobox, type University } from '@/components/ui/university-combobox';
  import { UserCombobox, type User } from '@/components/ui/user-combobox';
  import AppLayout from '@/layouts/app-layout';
  import { BreadcrumbItem } from '@/types';
  import { Head, Link, router, usePage } from '@inertiajs/react';
  import { AlertCircle, ArrowLeft, CheckCircle2, Download, Info, Upload, X } from 'lucide-react';
  import Papa from 'papaparse';
  import React, { FormEventHandler, useEffect, useRef, useState } from 'react';
  import { toast } from 'sonner';

  const breadcrumbs: BreadcrumbItem[] = [
      { title: 'Dashboard', href: '/dashboard' },
      { title: 'Jurnal', href: '/admin/journals' },
      { title: 'Import Jurnal', href: '/admin/journals/import/form' },
  ];

  interface Props {
      universities: University[];
      users: User[];
      errors?: {
          university_id?: string;
          user_id?: string;
          csv_file?: string;
      };
      flash?: {
          success?: string;
          error?: string;
          warning?: string;
          import_errors?: Array<{
              row: number;
              errors: string[];
          }>;
      };
  }

  interface CsvRow {
      [key: string]: string;
  }

  export default function Import({ universities, users, errors, flash }: Props) {
      const [selectedUniversityId, setSelectedUniversityId] = useState<string>('');
      const [selectedUserId, setSelectedUserId] = useState<string>('');
      const [selectedFile, setSelectedFile] = useState<File | null>(null);
      const [previewData, setPreviewData] = useState<CsvRow[]>([]);
      const [isProcessing, setIsProcessing] = useState(false);
      const [fileError, setFileError] = useState<string>('');
      const [isDragging, setIsDragging] = useState(false);
      const fileInputRef = useRef<HTMLInputElement>(null);

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
          if (errors?.university_id) {
              toast.error(errors.university_id);
          }
          if (errors?.user_id) {
              toast.error(errors.user_id);
          }
      }, [flash, errors]);

      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      const ALLOWED_FILE_TYPES = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];

      const formatFileSize = (bytes: number) => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      const filteredUsers = selectedUniversityId 
          ? users.filter((u) => u.university_id?.toString() === selectedUniversityId) 
          : [];

      const handleUniversityChange = (val: string) => {
          setSelectedUniversityId(val);
          setSelectedUserId('');
      };

      const handleUserChange = (val: string) => {
          setSelectedUserId(val);
      };

      const processFile = (file: File) => {
          const isCsv = file.name.endsWith('.csv') || ALLOWED_FILE_TYPES.includes(file.type);
          if (!isCsv) {
              setFileError('File harus berformat CSV (.csv)');
              setSelectedFile(null);
              setPreviewData([]);
              if (fileInputRef.current) {
                  fileInputRef.current.value = '';
              }
              return;
          }

          if (file.size > MAX_FILE_SIZE) {
              setFileError('Ukuran file maksimal 5MB');
              setSelectedFile(null);
              setPreviewData([]);
              if (fileInputRef.current) {
                  fileInputRef.current.value = '';
              }
              return;
          }

          setFileError('');

          Papa.parse(file, {
              header: true,
              preview: 5,
              skipEmptyLines: true,
              transformHeader: (h) => h.trim().toLowerCase(),
              complete: (results) => {
                  const fields = results.meta.fields || [];
                  const requiredFields = ['title', 'e_issn', 'url', 'oai_url'];
                  const missingFields = requiredFields.filter((f) => !fields.includes(f));

                  if (missingFields.length > 0) {
                      const errorMsg = `Kolom CSV wajib tidak ditemukan: ${missingFields.join(', ')}`;
                      setFileError(errorMsg);
                      toast.error(errorMsg);
                      setSelectedFile(null);
                      setPreviewData([]);
                      if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                      }
                      return;
                  }

                  setSelectedFile(file);
                  setPreviewData(results.data as CsvRow[]);
              },
              error: (error) => {
                  setFileError('Gagal membaca file CSV: ' + error.message);
                  setSelectedFile(null);
                  setPreviewData([]);
                  if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                  }
              },
          });
      };

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) {
              handleClearFile();
              return;
          }
          processFile(file);
      };

      const handleClearFile = () => {
          setSelectedFile(null);
          setPreviewData([]);
          setFileError('');
          if (fileInputRef.current) {
              fileInputRef.current.value = '';
          }
      };

      const handleDownloadTemplate = () => {
          window.location.href = route('admin.journals.import.template');
      };

      const handleSubmit: FormEventHandler = (e) => {
          e.preventDefault();

          if (!selectedUniversityId) {
              toast.error('Silakan pilih Universitas terlebih dahulu');
              return;
          }

          if (!selectedUserId) {
              toast.error('Silakan pilih User Pengelola terlebih dahulu');
              return;
          }

          if (!selectedFile) {
              setFileError('File CSV harus diunggah');
              return;
          }

          setIsProcessing(true);

          const formData = new FormData();
          formData.append('university_id', selectedUniversityId);
          formData.append('user_id', selectedUserId);
          formData.append('csv_file', selectedFile);

          router.post(route('admin.journals.import.process'), formData, {
              forceFormData: true,
              onFinish: () => setIsProcessing(false),
              onError: () => setIsProcessing(false),
          });
      };

      return (
          <AppLayout breadcrumbs={breadcrumbs}>
              <Head title="Import Jurnal dari CSV" />

              <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                  <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                      <div className="mb-6">
                          <Link href={route('admin.journals.index')}>
                              <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                                  <ArrowLeft className="mr-2 h-4 w-4" />
                                  Kembali ke Daftar Jurnal
                              </Button>
                          </Link>
                          <h1 className="text-3xl font-bold text-foreground">Import Jurnal</h1>
                          <p className="mt-1 text-muted-foreground">Unggah file CSV untuk menambahkan data jurnal secara massal ke universitas terpilih.</p>
                      </div>

                      {/* Flash Messages */}
                      <div className="mb-6 space-y-4">
                          {flash?.success && (
                              <Alert className="border-green-200 bg-green-50">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <AlertTitle className="text-green-800">Berhasil</AlertTitle>
                                  <AlertDescription className="text-green-700">{flash.success}</AlertDescription>
                              </Alert>
                          )}

                          {flash?.error && (
                              <Alert variant="destructive">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle>Error</AlertTitle>
                                  <AlertDescription>{flash.error}</AlertDescription>
                              </Alert>
                          )}

                          {flash?.warning && (
                              <Alert className="border-yellow-200 bg-yellow-50">
                                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                                  <AlertTitle className="text-yellow-800">Peringatan</AlertTitle>
                                  <AlertDescription className="text-yellow-700">{flash.warning}</AlertDescription>
                              </Alert>
                          )}

                          {flash?.import_errors && flash.import_errors.length > 0 && (
                              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 dark:border-destructive/30 dark:bg-destructive/10">
                                  <div className="flex items-center gap-3 border-b border-destructive/10 pb-4 mb-4">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive dark:bg-destructive/20">
                                          <AlertCircle className="h-5 w-5" />
                                      </div>
                                      <div>
                                          <h3 className="text-lg font-semibold text-destructive dark:text-red-400">
                                              Detail Error Import
                                          </h3>
                                          <p className="text-sm text-muted-foreground mt-0.5">
                                              Ditemukan <span className="font-bold text-destructive dark:text-red-400">{flash.import_errors.length}</span> baris data yang memiliki kesalahan validasi.
                                          </p>
                                      </div>
                                  </div>
                                  <div className="max-h-80 overflow-y-auto pr-2 space-y-4">
                                      {flash.import_errors.map((error, index) => (
                                          <div key={index} className="flex flex-col sm:flex-row sm:gap-4 items-start border-b border-destructive/5 last:border-0 pb-3 last:pb-0">
                                              <span className="inline-flex items-center rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive dark:bg-destructive/20 dark:text-red-400 whitespace-nowrap mb-2 sm:mb-0">
                                                  Baris {error.row}
                                              </span>
                                              <ul className="list-disc pl-4 text-sm text-foreground space-y-1">
                                                  {error.errors.map((msg, idx) => (
                                                      <li key={idx} className="leading-relaxed">
                                                          {msg}
                                                      </li>
                                                  ))}
                                              </ul>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>

                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                          <div className="lg:col-span-2">
                              <Card>
                                  <CardContent className="pt-6">
                                      <form onSubmit={handleSubmit} className="space-y-6">
                                          {/* Select Target University */}
                                          <div className="space-y-2">
                                              <Label>Pilih Universitas Target <span className="text-destructive">*</span></Label>
                                              <UniversityCombobox
                                                  universities={universities}
                                                  value={selectedUniversityId}
                                                  onChange={handleUniversityChange}
                                              />
                                              {errors?.university_id && (
                                                  <p className="text-sm text-destructive">{errors.university_id}</p>
                                              )}
                                          </div>

                                          {/* Select User Manager */}
                                          <div className="space-y-2">
                                              <Label>Pilih User Pengelola <span className="text-destructive">*</span></Label>
                                              <UserCombobox
                                                  users={filteredUsers}
                                                  value={selectedUserId}
                                                  onChange={handleUserChange}
                                                  disabled={!selectedUniversityId}
                                                  placeholder={selectedUniversityId ? "Pilih Pengelola Jurnal..." : "Pilih Universitas Terlebih Dahulu"}
                                              />
                                              {errors?.user_id && (
                                                  <p className="text-sm text-destructive">{errors.user_id}</p>
                                              )}
                                          </div>

                                          {/* File Upload Dropzone */}
                                          <div className="space-y-4">
                                              <div className="flex items-center justify-between">
                                                  <Label htmlFor="csv_file">
                                                      File CSV <span className="text-destructive">*</span>
                                                  </Label>
                                                  <Button
                                                      type="button"
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={handleDownloadTemplate}
                                                      className="gap-2"
                                                  >
                                                      <Download className="h-4 w-4" />
                                                      Download Template
                                                  </Button>
                                              </div>

                                              <input
                                                  id="csv_file"
                                                  ref={fileInputRef}
                                                  type="file"
                                                  accept=".csv,text/csv"
                                                  onChange={handleFileChange}
                                                  className="hidden"
                                              />

                                              {!selectedFile ? (
                                                  <div
                                                      onDragOver={(e) => {
                                                          e.preventDefault();
                                                          setIsDragging(true);
                                                      }}
                                                      onDragLeave={(e) => {
                                                          e.preventDefault();
                                                          setIsDragging(false);
                                                      }}
                                                      onDrop={(e) => {
                                                          e.preventDefault();
                                                          setIsDragging(false);
                                                          const file = e.dataTransfer.files?.[0];
                                                          if (file) {
                                                              processFile(file);
                                                          }
                                                      }}
                                                      onClick={() => fileInputRef.current?.click()}
                                                      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                                                          isDragging
                                                              ? 'border-primary bg-primary/5 text-primary'
                                                              : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
                                                      } ${errors?.csv_file || fileError ? 'border-destructive/50 bg-destructive/5' : ''}`}
                                                  >
                                                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                                          <Upload className="h-6 w-6 text-muted-foreground" />
                                                      </div>
                                                      <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                                                          <span className="font-semibold text-primary hover:text-primary/80">Pilih file</span>
                                                          <span className="pl-1">atau seret dan lepas di sini</span>
                                                      </div>
                                                      <p className="mt-1 text-xs text-muted-foreground">Maksimal ukuran file 5MB, format CSV (.csv)</p>
                                                  </div>
                                              ) : (
                                                  <div className="flex items-center justify-between rounded-lg border border-sidebar-border bg-muted/30 p-4 dark:border-sidebar-border dark:bg-neutral-900">
                                                      <div className="flex items-center gap-3">
                                                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                              <Upload className="h-5 w-5" />
                                                          </div>
                                                          <div className="space-y-1">
                                                              <p className="text-sm font-medium text-foreground max-w-[200px] sm:max-w-xs md:max-w-md truncate">
                                                                  {selectedFile.name}
                                                              </p>
                                                              <p className="text-xs text-muted-foreground">
                                                                  {formatFileSize(selectedFile.size)}
                                                              </p>
                                                          </div>
                                                      </div>
                                                      <Button
                                                          type="button"
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={handleClearFile}
                                                          className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                                                      >
                                                          <X className="h-4 w-4" />
                                                          Batal
                                                      </Button>
                                                  </div>
                                              )}

                                              {(errors?.csv_file || fileError) && (
                                                  <p className="text-sm text-destructive font-medium">{errors?.csv_file || fileError}</p>
                                              )}
                                          </div>

                                          {/* CSV Preview */}
                                          {previewData.length > 0 && (
                                              <div className="space-y-2">
                                                  <Label>Preview Data (5 baris pertama)</Label>
                                                  <div className="overflow-x-auto rounded-md border">
                                                      <table className="w-full text-sm">
                                                          <thead className="bg-muted/50">
                                                              <tr>
                                                                  {Object.keys(previewData[0]).map((header) => (
                                                                      <th
                                                                          key={header}
                                                                          className="px-3 py-2 text-left font-medium text-muted-foreground"
                                                                      >
                                                                          {header}
                                                                      </th>
                                                                  ))}
                                                              </tr>
                                                          </thead>
                                                          <tbody>
                                                              {previewData.map((row, index) => (
                                                                  <tr key={index} className="border-t transition-colors hover:bg-muted/50">
                                                                      {Object.values(row).map((value, cellIndex) => (
                                                                          <td key={cellIndex} className="px-3 py-2">
                                                                              {value || '-'}
                                                                          </td>
                                                                      ))}
                                                                  </tr>
                                                              ))}
                                                          </tbody>
                                                      </table>
                                                  </div>
                                              </div>
                                          )}

                                          {/* Submit Button */}
                                          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                              <Button type="submit" disabled={!selectedFile || isProcessing} className="w-full min-w-[150px] sm:w-auto">
                                                  {isProcessing ? (
                                                      <>
                                                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                                          Memproses...
                                                      </>
                                                  ) : (
                                                      <>
                                                          <Upload className="mr-2 h-4 w-4" />
                                                          Import Jurnal
                                                      </>
                                                  )}
                                              </Button>
                                              <Button
                                                  type="button"
                                                  variant="outline"
                                                  onClick={() => router.visit(route('admin.journals.index'))}
                                                  disabled={isProcessing}
                                                  className="w-full sm:w-auto"
                                              >
                                                  Batal
                                              </Button>
                                          </div>
                                      </form>
                                  </CardContent>
                              </Card>
                          </div>

                          {/* Guidelines */}
                          <div className="space-y-6">
                              <Card>
                                  <CardHeader>
                                      <CardTitle className="flex items-center gap-2 text-base">
                                          <Info className="h-4 w-4" />
                                          Format CSV
                                      </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4 text-sm">
                                      <div>
                                          <h4 className="mb-2 font-medium">Kolom Wajib:</h4>
                                          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                                              <li>title</li>
                                              <li>e_issn</li>
                                              <li>url</li>
                                              <li>oai_url</li>
                                          </ul>
                                      </div>
                                      <div>
                                          <h4 className="mb-2 font-medium">Kolom Opsional:</h4>
                                          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                                              <li>publisher</li>
                                              <li>issn</li>
                                              <li>publication_year</li>
                                              <li>sinta_rank</li>
                                              <li>email</li>
                                              <li>phone</li>
                                          </ul>
                                      </div>
                                  </CardContent>
                              </Card>

                              <Card>
                                  <CardHeader>
                                      <CardTitle className="text-base">Catatan Penting</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                                      <div>
                                          <strong className="text-foreground">ISSN Format:</strong> 1234-5678
                                      </div>
                                      <div>
                                          <strong className="text-foreground">Tahun Terbit:</strong> YYYY (contoh: 2026)
                                      </div>
                                      <div>
                                          <strong className="text-foreground">SINTA Rank:</strong> angka 1-6 atau kosong (non_sinta)
                                      </div>
                                      <div>
                                          <strong className="text-foreground">Bidang Ilmu:</strong> Akan ditugaskan secara manual setelah import.
                                      </div>
                                  </CardContent>
                              </Card>
                          </div>
                      </div>
                  </div>
              </div>
          </AppLayout>
      );
  }
  ```

- [ ] **Step 2: Add Link to Import Form on superadmin Journals List page**
  Modify `resources/js/pages/Admin/Journals/Index.tsx` to add an "Import Jurnal" button near the "Tambah Jurnal" button:

  ```tsx
  // Around line 324 of Index.tsx, insert the link:
  <Link href={route('admin.journals.import')}>
      <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import Jurnal
      </Button>
  </Link>
  ```

- [ ] **Step 3: Verify build compiles and compiles types**
  Run: `npm run build`
  Run: `npm run types`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add resources/js/pages/Admin/Journals/Import.tsx resources/js/pages/Admin/Journals/Index.tsx
  git commit -m "feat(frontend): create superadmin import page and link it to journals index"
  ```
