# XML Article Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement manual CrossRef XML article import for OJS 2 & 3 as a fallback when OAI-PMH fails.

**Architecture:** Create a database migration for `article_import_logs`, a Parser Service `CrossrefXmlImporter` using PHP's SimpleXML, an asynchronous queue job `ImportArticlesXmlJob`, controller endpoints for User, Admin, AdminKampus, and Inertia React UI components on the journal show page.

**Tech Stack:** Laravel, PHP SimpleXML, React (Inertia + TypeScript), shadcn/ui components.

---

### Task 1: Database Migration & Models

**Files:**
- Create: `database/migrations/2026_06_06_100000_create_article_import_logs_table.php`
- Create: `app/Models/ArticleImportLog.php`
- Modify: `app/Models/Journal.php`

- [ ] **Step 1: Create the migration file**
  Create the migration at `database/migrations/2026_06_06_100000_create_article_import_logs_table.php` with columns:
  ```php
  <?php

  use Illuminate\Database\Migrations\Migration;
  use Illuminate\Database\Schema\Blueprint;
  use Illuminate\Support\Facades\Schema;

  return new class extends Migration
  {
      public function up(): void
      {
          Schema::create('article_import_logs', function (Blueprint $table) {
              $table->id();
              $table->foreignId('journal_id')->constrained()->onDelete('cascade');
              $table->string('filename');
              $table->enum('duplicate_strategy', ['skip', 'update']);
              $table->integer('records_found')->default(0);
              $table->integer('records_imported')->default(0);
              $table->integer('records_updated')->default(0);
              $table->enum('status', ['pending', 'processing', 'success', 'failed'])->default('pending');
              $table->text('error_message')->nullable();
              $table->timestamps();
          });
      }

      public function down(): void
      {
          Schema::dropIfExists('article_import_logs');
      }
  };
  ```

- [ ] **Step 2: Run migration command**
  Run: `docker exec -it jurnal-mu-app php artisan migrate`
  Expected: Migration succeeds.

- [ ] **Step 3: Create the ArticleImportLog model**
  Write model code to `app/Models/ArticleImportLog.php`:
  ```php
  <?php

  namespace App\Models;

  use Illuminate\Database\Eloquent\Factories\HasFactory;
  use Illuminate\Database\Eloquent\Model;

  class ArticleImportLog extends Model
  {
      use HasFactory;

      protected $fillable = [
          'journal_id',
          'filename',
          'duplicate_strategy',
          'records_found',
          'records_imported',
          'records_updated',
          'status',
          'error_message',
      ];

      public function journal()
      {
          return $this->belongsTo(Journal::class);
      }
  }
  ```

- [ ] **Step 4: Update Journal relationship**
  Add `articleImportLogs()` relationship inside `app/Models/Journal.php` after `public function articles()`:
  ```php
  public function articleImportLogs()
  {
      return $this->hasMany(ArticleImportLog::class)->orderBy('created_at', 'desc');
  }
  ```

- [ ] **Step 5: Run tests**
  Run: `docker exec -it jurnal-mu-app php artisan test --filter=JournalTest` or similar model test.
  Expected: PASS

- [ ] **Step 6: Commit**
  ```bash
  git add database/migrations/2026_06_06_100000_create_article_import_logs_table.php app/Models/ArticleImportLog.php app/Models/Journal.php
  git commit -m "feat: add article_import_logs migration and models"
  ```

---

### Task 2: Importer Service & Parsing XML

**Files:**
- Create: `app/Services/CrossrefXmlImporter.php`
- Create: `tests/Feature/CrossrefXmlImporterTest.php`

- [ ] **Step 1: Write the importer service**
  Implement parser in `app/Services/CrossrefXmlImporter.php`:
  ```php
  <?php

  namespace App\Services;

  use App\Models\Article;
  use App\Models\Journal;
  use Illuminate\Support\Facades\Log;

  class CrossrefXmlImporter
  {
      public function import(Journal $journal, string $filePath, string $strategy): array
      {
          $stats = [
              'records_found' => 0,
              'records_imported' => 0,
              'records_updated' => 0,
          ];

          $xmlContent = file_get_contents($filePath);
          $cleanXml = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $xmlContent);
          
          $xml = simplexml_load_string($cleanXml);
          if ($xml === false) {
              throw new \Exception("Gagal memproses file XML. Format tidak valid.");
          }

          $xml->registerXPathNamespace('cr', 'http://www.crossref.org/schema/4.3.6');
          $xml->registerXPathNamespace('jats', 'http://www.ncbi.nlm.nih.gov/JATS1');
          $xml->registerXPathNamespace('ai', 'http://www.crossref.org/AccessIndicators.xsd');

          $journalNodes = $xml->xpath('//cr:journal') ?: $xml->xpath('//journal');
          if (empty($journalNodes)) {
              throw new \Exception("File XML tidak mengandung elemen <journal>.");
          }

          foreach ($journalNodes as $journalNode) {
              $volumeNode = $journalNode->xpath('.//cr:journal_volume/cr:volume') ?: $journalNode->xpath('.//journal_volume/volume');
              $issueNode = $journalNode->xpath('.//cr:journal_issue/cr:issue') ?: $journalNode->xpath('.//journal_issue/issue');
              $volume = $volumeNode ? trim((string)$volumeNode[0]) : null;
              $issue = $issueNode ? trim((string)$issueNode[0]) : null;

              $issueDateNode = $journalNode->xpath('.//cr:journal_issue/cr:publication_date') ?: $journalNode->xpath('.//journal_issue/publication_date');
              $issuePubDate = $this->parseDateNode($issueDateNode[0] ?? null);

              $articleNodes = $journalNode->xpath('.//cr:journal_article') ?: $journalNode->xpath('.//journal_article');
              $stats['records_found'] += count($articleNodes);

              foreach ($articleNodes as $articleNode) {
                  $titleNode = $articleNode->xpath('.//cr:titles/cr:title') ?: $articleNode->xpath('.//titles/title');
                  $title = $titleNode ? trim((string)$titleNode[0]) : null;
                  if (!$title) {
                      continue;
                  }

                  $abstractNode = $articleNode->xpath('.//jats:abstract/jats:p') ?: $articleNode->xpath('.//abstract/jats:p') ?: $articleNode->xpath('.//cr:abstract/cr:p') ?: $articleNode->xpath('.//abstract');
                  $abstract = null;
                  if ($abstractNode) {
                      $abstract = trim(strip_tags((string)$abstractNode[0]));
                  }

                  $authorNodes = $articleNode->xpath('.//cr:contributors/cr:person_name[@contributor_role="author"]') ?: $articleNode->xpath('.//contributors/person_name[@contributor_role="author"]');
                  $authors = [];
                  if ($authorNodes) {
                      foreach ($authorNodes as $authorNode) {
                          $given = trim((string)($authorNode->xpath('.//cr:given_name') ?: $authorNode->xpath('.//given_name'))[0] ?? '');
                          $surname = trim((string)($authorNode->xpath('.//cr:surname') ?: $authorNode->xpath('.//surname'))[0] ?? '');
                          $fullName = trim("{$given} {$surname}");
                          if ($fullName !== '') {
                              $authors[] = $fullName;
                          }
                      }
                  }

                  $doiNode = $articleNode->xpath('.//cr:doi_data/cr:doi') ?: $articleNode->xpath('.//doi_data/doi');
                  $doi = $doiNode ? trim((string)$doiNode[0]) : null;

                  $urlNode = $articleNode->xpath('.//cr:doi_data/cr:resource') ?: $articleNode->xpath('.//doi_data/resource');
                  $articleUrl = $urlNode ? trim((string)$urlNode[0]) : null;

                  $pdfNode = $articleNode->xpath('.//cr:doi_data/cr:collection[@property="text-mining"]/cr:item/cr:resource') ?:
                             $articleNode->xpath('.//doi_data/collection[@property="text-mining"]/item/resource') ?:
                             $articleNode->xpath('.//cr:doi_data/cr:collection/cr:item/cr:resource') ?:
                             $articleNode->xpath('.//doi_data/collection/item/resource');
                  $pdfUrl = $pdfNode ? trim((string)$pdfNode[0]) : null;

                  $firstPageNode = $articleNode->xpath('.//cr:pages/cr:first_page') ?: $articleNode->xpath('.//pages/first_page');
                  $lastPageNode = $articleNode->xpath('.//cr:pages/cr:last_page') ?: $articleNode->xpath('.//pages/last_page');
                  $otherPagesNode = $articleNode->xpath('.//cr:pages/cr:other_pages') ?: $articleNode->xpath('.//pages/other_pages');
                  $pages = null;
                  if ($firstPageNode) {
                      $first = trim((string)$firstPageNode[0]);
                      $last = $lastPageNode ? trim((string)$lastPageNode[0]) : '';
                      $pages = $last !== '' ? "{$first}-{$last}" : $first;
                  } elseif ($otherPagesNode) {
                      $pages = trim((string)$otherPagesNode[0]);
                  }

                  $articleDateNode = $articleNode->xpath('.//cr:publication_date') ?: $articleNode->xpath('.//publication_date');
                  $pubDate = $this->parseDateNode($articleDateNode[0] ?? null) ?: $issuePubDate ?: now()->toDateString();

                  $oaiIdentifier = $doi ? "xml:{$doi}" : "xml:{$journal->id}-" . md5($title);

                  $existing = null;
                  if ($doi) {
                      $existing = Article::where('journal_id', $journal->id)
                          ->where(function ($query) use ($doi, $oaiIdentifier) {
                              $query->where('doi', $doi)
                                    ->orWhere('oai_identifier', $oaiIdentifier);
                          })->first();
                  } else {
                      $existing = Article::where('journal_id', $journal->id)
                          ->where('oai_identifier', $oaiIdentifier)
                          ->first();
                  }

                  $articleData = [
                      'journal_id' => $journal->id,
                      'oai_identifier' => $oaiIdentifier,
                      'title' => $title,
                      'abstract' => $abstract,
                      'authors' => $authors,
                      'doi' => $doi,
                      'publication_date' => $pubDate,
                      'volume' => $volume,
                      'issue' => $issue,
                      'pages' => $pages,
                      'article_url' => $articleUrl,
                      'pdf_url' => $pdfUrl,
                      'last_harvested_at' => now(),
                  ];

                  if ($existing) {
                      if ($strategy === 'update') {
                          $existing->update($articleData);
                          $stats['records_updated']++;
                      }
                  } else {
                      Article::create($articleData);
                      $stats['records_imported']++;
                  }
              }
          }

          return $stats;
      }

      private function parseDateNode($dateNode): ?string
      {
          if (!$dateNode) {
              return null;
          }
          $yearNode = $dateNode->xpath('.//cr:year') ?: $dateNode->xpath('.//year');
          $monthNode = $dateNode->xpath('.//cr:month') ?: $dateNode->xpath('.//month');
          $dayNode = $dateNode->xpath('.//cr:day') ?: $dateNode->xpath('.//day');

          $year = $yearNode ? trim((string)$yearNode[0]) : null;
          $month = $monthNode ? str_pad(trim((string)$monthNode[0]), 2, '0', STR_PAD_LEFT) : '01';
          $day = $dayNode ? str_pad(trim((string)$dayNode[0]), 2, '0', STR_PAD_LEFT) : '01';

          if ($year) {
              return "{$year}-{$month}-{$day}";
          }
          return null;
      }
  }
  ```

- [ ] **Step 2: Create parser test**
  Write tests in `tests/Feature/CrossrefXmlImporterTest.php`:
  ```php
  <?php

  namespace Tests\Feature;

  use App\Models\Journal;
  use App\Models\Article;
  use App\Services\CrossrefXmlImporter;
  use Illuminate\Foundation\Testing\RefreshDatabase;
  use Tests\TestCase;

  class CrossrefXmlImporterTest extends TestCase
  {
      use RefreshDatabase;

      public function test_can_parse_ojs2_and_ojs3_xml()
      {
          $journal = Journal::factory()->create();
          $importer = new CrossrefXmlImporter();

          // OJS 2 import
          $result2 = $importer->import($journal, storage_path('app/public/OJS_2.xml'), 'skip');
          $this->assertEquals(2, $result2['records_found']);
          $this->assertEquals(2, $result2['records_imported']);

          // OJS 3 import
          $result3 = $importer->import($journal, storage_path('app/public/OJS_3.xml'), 'skip');
          $this->assertEquals(2, $result3['records_found']);
          $this->assertEquals(2, $result3['records_imported']);

          $this->assertDatabaseHas('articles', [
              'title' => 'Predict customer churn in the banking sector: a machine learning approach with imbalanced data handling techniques',
              'journal_id' => $journal->id,
          ]);
      }
  }
  ```

- [ ] **Step 3: Run the test**
  Run: `docker exec -it jurnal-mu-app php artisan test --filter=CrossrefXmlImporterTest`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add app/Services/CrossrefXmlImporter.php tests/Feature/CrossrefXmlImporterTest.php
  git commit -m "feat: implement CrossrefXmlImporter service and unit tests"
  ```

---

### Task 3: Background Job for XML Import

**Files:**
- Create: `app/Jobs/ImportArticlesXmlJob.php`
- Modify: `tests/Feature/CrossrefXmlImporterTest.php` (add job integration test)

- [ ] **Step 1: Write the queue job**
  Write code to `app/Jobs/ImportArticlesXmlJob.php`:
  ```php
  <?php

  namespace App\Jobs;

  use App\Models\ArticleImportLog;
  use App\Models\Journal;
  use App\Services\CrossrefXmlImporter;
  use Illuminate\Bus\Queueable;
  use Illuminate\Contracts\Queue\ShouldQueue;
  use Illuminate\Foundation\Bus\Dispatchable;
  use Illuminate\Queue\InteractsWithQueue;
  use Illuminate\Queue\SerializesModels;
  use Illuminate\Support\Facades\Storage;

  class ImportArticlesXmlJob implements ShouldQueue
  {
      use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

      protected $journal;
      protected $filePath;
      protected $strategy;
      protected $log;

      public function __construct(Journal $journal, string $filePath, string $strategy, ArticleImportLog $log)
      {
          $this->journal = $journal;
          $this->filePath = $filePath;
          $this->strategy = $strategy;
          $this->log = $log;
      }

      public function handle(CrossrefXmlImporter $importer): void
      {
          $this->log->update(['status' => 'processing']);

          try {
              $absolutePath = Storage::path($this->filePath);
              $stats = $importer->import($this->journal, $absolutePath, $this->strategy);

              $this->log->update([
                  'records_found' => $stats['records_found'],
                  'records_imported' => $stats['records_imported'],
                  'records_updated' => $stats['records_updated'],
                  'status' => 'success',
              ]);
          } catch (\Exception $e) {
              $this->log->update([
                  'status' => 'failed',
                  'error_message' => mb_substr($e->getMessage(), 0, 500),
              ]);
          } finally {
              if (Storage::exists($this->filePath)) {
                  Storage::delete($this->filePath);
              }
          }
      }
  }
  ```

- [ ] **Step 2: Add job test cases**
  Add job integration test inside `tests/Feature/CrossrefXmlImporterTest.php`:
  ```php
      public function test_import_job_execution()
      {
          \Illuminate\Support\Facades\Storage::fake('local');
          $journal = Journal::factory()->create();

          $tempPath = 'xml_imports/test.xml';
          \Illuminate\Support\Facades\Storage::put($tempPath, file_get_contents(storage_path('app/public/OJS_2.xml')));

          $log = \App\Models\ArticleImportLog::create([
              'journal_id' => $journal->id,
              'filename' => 'OJS_2.xml',
              'duplicate_strategy' => 'skip',
              'status' => 'pending',
          ]);

          $job = new \App\Jobs\ImportArticlesXmlJob($journal, $tempPath, 'skip', $log);
          $job->handle(new CrossrefXmlImporter());

          $log->refresh();
          $this->assertEquals('success', $log->status);
          $this->assertEquals(2, $log->records_imported);
          $this->assertFalse(\Illuminate\Support\Facades\Storage::exists($tempPath));
      }
  ```

- [ ] **Step 3: Run tests**
  Run: `docker exec -it jurnal-mu-app php artisan test --filter=CrossrefXmlImporterTest`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add app/Jobs/ImportArticlesXmlJob.php tests/Feature/CrossrefXmlImporterTest.php
  git commit -m "feat: add ImportArticlesXmlJob queue class and integration tests"
  ```

---

### Task 4: Routes & Controller Endpoints

**Files:**
- Modify: `routes/web.php`
- Modify: `app/Http/Controllers/User/JournalController.php`
- Modify: `app/Http/Controllers/AdminKampus/JournalController.php`
- Modify: `app/Http/Controllers/Admin/JournalController.php`
- Create: `tests/Feature/XmlArticleImportControllerTest.php`

- [ ] **Step 1: Add routes to web.php**
  Open `routes/web.php` and look for `/user/journals`, `/admin-kampus/journals`, and `/admin/journals` blocks.
  Add route definitions:
  - Inside user prefix:
    `Route::post('journals/{journal}/import-xml', [UserJournalController::class, 'importXml'])->name('journals.import-xml');`
  - Inside admin-kampus prefix:
    `Route::post('journals/{journal}/import-xml', [App\Http\Controllers\AdminKampus\JournalController::class, 'importXml'])->name('journals.import');`
  - Inside admin prefix:
    `Route::post('journals/{journal}/import-xml', [App\Http\Controllers\Admin\JournalController::class, 'importXml'])->name('journals.import-xml');`

- [ ] **Step 2: Add controller methods**
  Implement the action in `User/JournalController.php`, `AdminKampus/JournalController.php`, and `Admin/JournalController.php`:
  ```php
  use App\Models\ArticleImportLog;
  use App\Jobs\ImportArticlesXmlJob;

  public function importXml(Request $request, Journal $journal)
  {
      if (auth()->user()->cannot('update', $journal)) {
          abort(403);
      }

      $request->validate([
          'xml_file' => 'required|file|mimes:xml|max:10240',
          'duplicate_strategy' => 'required|in:skip,update',
      ], [
          'xml_file.required' => 'Pilih file XML untuk diimport.',
          'xml_file.mimes' => 'Format file harus berupa XML.',
          'xml_file.max' => 'Ukuran file XML maksimal adalah 10MB.',
          'duplicate_strategy.required' => 'Pilih strategi penanganan duplikat.',
      ]);

      $file = $request->file('xml_file');
      $filename = $file->getClientOriginalName();
      $storedPath = $file->store('xml_imports');

      $log = ArticleImportLog::create([
          'journal_id' => $journal->id,
          'filename' => $filename,
          'duplicate_strategy' => $request->input('duplicate_strategy'),
          'status' => 'pending',
      ]);

      ImportArticlesXmlJob::dispatch($journal, $storedPath, $request->input('duplicate_strategy'), $log)->onQueue('harvesting');

      return redirect()->back()->with('success', 'File XML berhasil diunggah dan sedang diproses di background.');
  }
  ```

- [ ] **Step 3: Inject logs to show action**
  Update the `show` method inside `User/JournalController.php`, `AdminKampus/JournalController.php`, and `Admin/JournalController.php` to fetch and pass `importLogs` to Inertia render view:
  ```php
  $importLogs = $journal->articleImportLogs()
      ->take(10)
      ->get();
  ```
  Include `importLogs` key inside the Inertia response data structure.

- [ ] **Step 4: Create controller feature test**
  Write tests in `tests/Feature/XmlArticleImportControllerTest.php`:
  ```php
  <?php

  namespace Tests\Feature;

  use App\Models\Journal;
  use App\Models\User;
  use Illuminate\Foundation\Testing\RefreshDatabase;
  use Illuminate\Http\UploadedFile;
  use Illuminate\Support\Facades\Queue;
  use Tests\TestCase;

  class XmlArticleImportControllerTest extends TestCase
  {
      use RefreshDatabase;

      public function test_user_can_upload_xml()
      {
          Queue::fake();
          
          $user = User::factory()->create();
          $journal = Journal::factory()->create(['user_id' => $user->id]);

          $file = UploadedFile::fake()->create('import.xml', 100, 'text/xml');

          $response = $this->actingAs($user)
              ->post(route('user.journals.import-xml', $journal->id), [
                  'xml_file' => $file,
                  'duplicate_strategy' => 'skip',
              ]);

          $response->assertRedirect();
          $this->assertDatabaseHas('article_import_logs', [
              'journal_id' => $journal->id,
              'filename' => 'import.xml',
              'status' => 'pending',
          ]);
          Queue::assertPushed(\App\Jobs\ImportArticlesXmlJob::class);
      }
  }
  ```

- [ ] **Step 5: Run tests**
  Run: `docker exec -it jurnal-mu-app php artisan test --filter=XmlArticleImportControllerTest`
  Expected: PASS

- [ ] **Step 6: Commit**
  ```bash
  git add routes/web.php app/Http/Controllers/User/JournalController.php app/Http/Controllers/AdminKampus/JournalController.php app/Http/Controllers/Admin/JournalController.php tests/Feature/XmlArticleImportControllerTest.php
  git commit -m "feat: add controller methods, routing and endpoint tests"
  ```

---

### Task 5: Import XML Dialog UI Component

**Files:**
- Create: `resources/js/components/ImportXmlDialog.tsx`

- [ ] **Step 1: Write the dialog component**
  Write the React component to `resources/js/components/ImportXmlDialog.tsx`:
  ```tsx
  import { Button } from '@/components/ui/button';
  import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Label } from '@/components/ui/label';
  import { useForm } from '@inertiajs/react';
  import { AlertCircle, FileUp } from 'lucide-react';
  import { useState } from 'react';

  interface ImportXmlDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      journalId: number;
      uploadRoute: string;
  }

  export function ImportXmlDialog({ open, onOpenChange, journalId, uploadRoute }: ImportXmlDialogProps) {
      const { data, setData, post, processing, errors, reset } = useForm({
          xml_file: null as File | null,
          duplicate_strategy: 'skip',
      });
      const [fileName, setFileName] = useState('');

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              setData('xml_file', file);
              setFileName(file.name);
          }
      };

      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          post(route(uploadRoute, journalId), {
              onSuccess: () => {
                  onOpenChange(false);
                  reset();
                  setFileName('');
              },
              preserveScroll: true,
          });
      };

      return (
          <Dialog open={open} onOpenChange={(val) => {
              onOpenChange(val);
              if (!val) {
                  reset();
                  setFileName('');
              }
          }}>
              <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handleSubmit}>
                      <DialogHeader>
                          <DialogTitle>Import Artikel via XML</DialogTitle>
                          <DialogDescription>
                              Pilih file XML deposit CrossRef (OJS 2 / OJS 3) untuk memproses data artikel jurnal ini.
                          </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-6 py-4">
                          <div className="space-y-2">
                              <Label htmlFor="xml_file" className="text-sm font-medium">File XML CrossRef <span className="text-red-500">*</span></Label>
                              <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg p-6 hover:bg-accent/10 cursor-pointer relative">
                                  <input
                                      id="xml_file"
                                      type="file"
                                      accept=".xml"
                                      onChange={handleFileChange}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      required
                                  />
                                  <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                                  <span className="text-sm font-medium text-foreground">
                                      {fileName || "Seret file ke sini atau klik untuk memilih"}
                                  </span>
                                  <span className="text-xs text-muted-foreground mt-1">Hanya file .xml maksimal 10MB</span>
                              </div>
                              {errors.xml_file && (
                                  <p className="text-sm text-red-500 mt-1">{errors.xml_file}</p>
                              )}
                          </div>

                          <div className="space-y-3">
                              <Label className="text-sm font-medium">Penanganan Artikel Duplikat <span className="text-red-500">*</span></Label>
                              <div className="grid grid-cols-2 gap-4">
                                  <label className="flex items-center gap-2 border rounded-md p-3 cursor-pointer hover:bg-accent/10">
                                      <input
                                          type="radio"
                                          name="duplicate_strategy"
                                          value="skip"
                                          checked={data.duplicate_strategy === 'skip'}
                                          onChange={(e) => setData('duplicate_strategy', e.target.value)}
                                          className="text-primary focus:ring-primary h-4 w-4"
                                      />
                                      <div className="flex flex-col">
                                          <span className="text-sm font-medium">Lewati Duplikat</span>
                                          <span className="text-xs text-muted-foreground">Skip jika data ada</span>
                                      </div>
                                  </label>
                                  <label className="flex items-center gap-2 border rounded-md p-3 cursor-pointer hover:bg-accent/10">
                                      <input
                                          type="radio"
                                          name="duplicate_strategy"
                                          value="update"
                                          checked={data.duplicate_strategy === 'update'}
                                          onChange={(e) => setData('duplicate_strategy', e.target.value)}
                                          className="text-primary focus:ring-primary h-4 w-4"
                                      />
                                      <div className="flex flex-col">
                                          <span className="text-sm font-medium">Perbarui Data</span>
                                          <span className="text-xs text-muted-foreground">Overwrite data lama</span>
                                      </div>
                                  </label>
                              </div>
                              {errors.duplicate_strategy && (
                                  <p className="text-sm text-red-500 mt-1">{errors.duplicate_strategy}</p>
                              )}
                          </div>
                      </div>

                      <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                              Batal
                          </Button>
                          <Button type="submit" disabled={processing || !data.xml_file}>
                              {processing ? 'Memproses...' : 'Mulai Import'}
                          </Button>
                      </DialogFooter>
                  </form>
              </DialogContent>
          </Dialog>
      );
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add resources/js/components/ImportXmlDialog.tsx
  git commit -m "feat: create ImportXmlDialog component for manual uploads"
  ```

---

### Task 6: UI Integration on Journal Show Pages

**Files:**
- Modify: `resources/js/Pages/User/Journals/Show.tsx`
- Modify: `resources/js/Pages/AdminKampus/Journals/Show.tsx`
- Modify: `resources/js/Pages/Admin/Journals/Show.tsx`

- [ ] **Step 1: Update interface Props**
  Add `importLogs` to properties interface in all 3 Show components:
  ```typescript
  interface ArticleImportLog {
      id: number;
      filename: string;
      duplicate_strategy: 'skip' | 'update';
      records_found: number;
      records_imported: number;
      records_updated: number;
      status: 'pending' | 'processing' | 'success' | 'failed';
      error_message: string | null;
      created_at: string;
  }

  // Under Props interface:
  importLogs?: ArticleImportLog[];
  ```

- [ ] **Step 2: Add Dialog State and Button**
  Mount `ImportXmlDialog` state:
  ```typescript
  const [showImportXmlModal, setShowImportXmlModal] = useState(false);
  ```
  Add the dialog markup to JSX tree:
  ```tsx
  <ImportXmlDialog
      open={showImportXmlModal}
      onOpenChange={setShowImportXmlModal}
      journalId={journal.id}
      uploadRoute={/* user: "user.journals.import-xml", admin-kampus: "admin-kampus.journals.import", admin: "admin.journals.import-xml" */}
  />
  ```
  Add "Import XML" button alongside the OAI Sync buttons:
  ```tsx
  <Button
      onClick={() => setShowImportXmlModal(true)}
      size="sm"
      variant="outline"
      className="gap-2"
  >
      <FileUp className="h-4 w-4" />
      Import XML
  </Button>
  ```

- [ ] **Step 3: Display XML Import Logs History**
  Beside/below OAI harvest history logs table, render XML Import Logs:
  ```tsx
  {importLogs && importLogs.length > 0 && (
      <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-foreground">Riwayat Import XML</p>
          <div className="rounded-md border">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>File</TableHead>
                          <TableHead>Strategi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Hasil (Ditemukan/Diimpor/Diupdate)</TableHead>
                          <TableHead>Keterangan</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {importLogs.map((log) => (
                          <TableRow key={log.id}>
                              <TableCell className="whitespace-nowrap">
                                  {new Date(log.created_at).toLocaleString('id-ID', {
                                      dateStyle: 'medium',
                                      timeStyle: 'short',
                                  })}
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate" title={log.filename}>
                                  {log.filename}
                              </TableCell>
                              <TableCell>
                                  {log.duplicate_strategy === 'skip' ? 'Lewati Duplikat' : 'Perbarui'}
                              </TableCell>
                              <TableCell>
                                  <Badge
                                      variant={
                                          log.status === 'success'
                                              ? 'outline'
                                              : log.status === 'processing' || log.status === 'pending'
                                                ? 'default'
                                                : 'destructive'
                                      }
                                      className={
                                          log.status === 'success' ? 'border-green-300 text-green-700 dark:text-green-400' : ''
                                      }
                                  >
                                      {log.status === 'success' ? 'Berhasil' : log.status === 'failed' ? 'Gagal' : 'Proses'}
                                  </Badge>
                              </TableCell>
                              <TableCell>
                                  {log.records_found} / {log.records_imported} / {log.records_updated}
                              </TableCell>
                              <TableCell className="max-w-xs truncate" title={log.error_message || '-'}>
                                  {log.error_message ? (
                                      <span className="text-red-600 dark:text-red-400">{log.error_message}</span>
                                  ) : (
                                      <span className="text-muted-foreground">-</span>
                                  )}
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>
      </div>
  )}
  ```

- [ ] **Step 4: Verify the page compile**
  Run compilation: `npm run build` or inspect local browser to ensure no TypeScript compilation errors.
  Expected: Success without errors.

- [ ] **Step 5: Commit**
  ```bash
  git add resources/js/Pages/User/Journals/Show.tsx resources/js/Pages/AdminKampus/Journals/Show.tsx resources/js/Pages/Admin/Journals/Show.tsx
  git commit -m "feat: integrate ImportXmlDialog and render history logs on Journal Show pages"
  ```
