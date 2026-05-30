# Design Spec: Asynchronous Journal CSV Import via Queue

**Date:** 2026-05-29  
**Topic:** Asynchronous Journal CSV Import via Queue  
**Status:** Approved by User  

---

## 1. Goal Description
Resolve client-side connection timeout (ECONNABORTED) during CSV journal imports by shifting the import processing to a background Queue Job. Introduce a `csv_imports` tracking table and display an "Import History" panel with a progress/error modal in the frontend UI for both Admin and Admin Kampus roles.

---

## 2. Proposed Changes

### 2.1 Database & Model Setup

#### Migration: `create_csv_imports_table`
Create a migration file `database/migrations/2026_05_29_000000_create_csv_imports_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('csv_imports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->string('filename');
            $table->string('filepath');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->integer('total_rows')->default(0);
            $table->integer('processed_rows')->default(0);
            $table->integer('success_count')->default(0);
            $table->integer('error_count')->default(0);
            $table->json('errors')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('csv_imports');
    }
};
```

#### Model: `app/Models/CsvImport.php`
Create `app/Models/CsvImport.php` representing the imports:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CsvImport extends Model
{
    protected $fillable = [
        'user_id',
        'university_id',
        'filename',
        'filepath',
        'status',
        'total_rows',
        'processed_rows',
        'success_count',
        'error_count',
        'errors',
    ];

    protected $casts = [
        'errors' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }
}
```

---

### 2.2 Queue Job Implementation

#### Job: `app/Jobs/ProcessCsvImportJob.php`
Create the background processing job:
```php
<?php

namespace App\Jobs;

use App\Imports\JournalsImport;
use App\Models\CsvImport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProcessCsvImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $csvImportId;

    public function __construct(int $csvImportId)
    {
        $this->csvImportId = $csvImportId;
    }

    public function handle(): void
    {
        $csvImport = CsvImport::find($this->csvImportId);
        if (!$csvImport) {
            return;
        }

        $csvImport->update(['status' => 'processing']);

        try {
            $absolutePath = storage_path('app/' . $csvImport->filepath);
            if (!file_exists($absolutePath)) {
                throw new \Exception("File CSV tidak ditemukan di storage.");
            }

            // Estimate total rows (excluding header)
            $file = fopen($absolutePath, 'r');
            $lineCount = 0;
            if ($file) {
                fgetcsv($file); // skip header
                while (fgetcsv($file) !== false) {
                    $lineCount++;
                }
                fclose($file);
            }
            $csvImport->update(['total_rows' => $lineCount]);

            DB::beginTransaction();

            $import = new JournalsImport((int)$csvImport->university_id, (int)$csvImport->user_id);
            $import->import($absolutePath);

            $summary = $import->getSummary();

            DB::commit();

            $csvImport->update([
                'status' => 'completed',
                'success_count' => $summary['success_count'],
                'error_count' => $summary['error_count'],
                'processed_rows' => $summary['success_count'] + $summary['error_count'],
                'errors' => $summary['errors'],
            ]);

            // Clean up temporary file
            if (Storage::exists($csvImport->filepath)) {
                Storage::delete($csvImport->filepath);
            }

        } catch (\Exception $e) {
            DB::rollBack();

            $csvImport->update([
                'status' => 'failed',
                'errors' => [['row' => 0, 'errors' => [$e->getMessage()]]],
            ]);

            if (Storage::exists($csvImport->filepath)) {
                Storage::delete($csvImport->filepath);
            }
        }
    }
}
```

---

### 2.3 Backend Controller Updates

#### [JournalController.php (Admin Kampus)](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/AdminKampus/JournalController.php)
- Update `import()` to fetch and pass `csvImports` history:
  ```php
  $csvImports = CsvImport::where('university_id', $authUser->university_id)
      ->with('user:id,name')
      ->latest()
      ->take(10)
      ->get();
  ```
- Update `processImport()`:
  - Securely save the file to `imports/` using `Storage::putFile()`.
  - Create a new `CsvImport` record.
  - Dispatch `ProcessCsvImportJob`.
  - Redirect back with success flash message: `"File CSV berhasil diunggah dan sedang diproses di background."`

#### [JournalController.php (Super Admin)](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/Admin/JournalController.php)
- Update `import()` to fetch and pass `csvImports` history across all universities:
  ```php
  $csvImports = CsvImport::with(['user:id,name', 'university:id,name'])
      ->latest()
      ->take(15)
      ->get();
  ```
- Update `processImport()`:
  - Securely save file, create `CsvImport` record, dispatch `ProcessCsvImportJob`.
  - Redirect back with success flash message.

---

### 2.4 Frontend UI Improvements

#### [Import.tsx (Admin Kampus)](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/AdminKampus/Journals/Import.tsx) & [Import.tsx (Super Admin)](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/Admin/Journals/Import.tsx)
- Define `CsvImport` type interface.
- Add `csvImports` to page component props.
- Add an "Import History" panel displaying a table of past imports:
  - Col: Filename, University (Super Admin only), User (Uploader), Total Rows, Success, Errors, Date, Status Badge.
  - If status is `completed` and errors exist, or if status is `failed`, render a "Detail" button.
- Create a Modal overlay to display the detail list of row-level errors from the selected import record.

---

## 3. Verification Plan

### 3.1 Automated Tests
Add new Pest tests in:
- `tests/Feature/AdminKampus/JournalImportTest.php`
- `tests/Feature/Admin/JournalImportTest.php`
These tests will mock the queue dispatching using `Queue::fake()`, verify that the file is uploaded, a record is created in `csv_imports` table, and the job is dispatched.

Run test command:
`docker exec jurnal-mu-app ./vendor/bin/pest`

### 3.2 Manual Verification
- Start the queue worker inside the docker container:
  `docker exec jurnal-mu-app php artisan queue:work --once` (or run in background)
- Upload CSV file and check if page immediately redirects back with success message.
- Monitor the "Import History" section: check status changes from `pending` -> `processing` -> `completed`.
- Verify the modal lists correct errors for files with duplicates or formatting issues.

---

## 4. Deployment & Queue Configuration (Hostinger Cron Jobs)

To process the asynchronous CSV imports in the Hostinger shared hosting environment, the queue worker must run periodically. The import tasks are dispatched to the `default` queue.

### 4.1 Combined Queue Worker (Recommended)
To optimize server resources and conform to Hostinger's cron job limits, run a single combined cron job that handles both the `default` (CSV import) and `harvesting` (article synchronizations) queues. Passing the queue names separated by comma defines their priority (left-to-right):

**Cron Job Command:**
```bash
/usr/bin/php /home/u347029080/domains/journalmu.org/public_html/artisan queue:work database --queue=default,harvesting --stop-when-empty --tries=3 --max-time=55
```

### 4.2 Separate Queue Worker (Alternative)
If you prefer to execute the CSV import queue independently:

**Cron Job Command:**
```bash
/usr/bin/php /home/u347029080/domains/journalmu.org/public_html/artisan queue:work database --queue=default --stop-when-empty --tries=3 --max-time=55
```

### 4.3 Schedule Settings
- **Interval:** Run every **1 minute** (`* * * * *`).
- **Options:** The `--stop-when-empty` and `--max-time=55` options ensure the process gracefully exits when no jobs are left or after 55 seconds, preventing memory leaks and process pileup on Hostinger shared hosting.
