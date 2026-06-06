# Design Spec: XML Article Import (Fallback for OAI-PMH)

**Date:** 2026-06-06  
**Topic:** Fallback XML Article Import from OJS 2 and OJS 3  
**Status:** Approved by User  

---

## 1. Goal Description
The objective is to implement a fallback manual article import feature. If the OAI-PMH endpoint is offline or failing, users can upload a CrossRef XML deposit file (generated from OJS 2 or OJS 3) containing article metadata. The system will process the XML in the background, match articles by DOI/title, handle duplicates based on user preference (skip or update), and log the results for auditing.

---

## 2. Proposed Changes

### 2.1 Database & Models

#### Migration: `create_article_import_logs_table`
Create a new migration to track XML imports:
```php
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
```

#### Model: `App\Models\ArticleImportLog`
Define the model:
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleImportLog extends Model
{
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

#### Model: `App\Models\Journal`
Add the relationship:
```php
public function articleImportLogs()
{
    return $this->hasMany(ArticleImportLog::class)->orderBy('created_at', 'desc');
}
```

---

### 2.2 Backend Importer & Queue Job

#### Service: `App\Services\CrossrefXmlImporter`
Create a dedicated service to parse the CrossRef XML deposit format.
- Parse the XML using PHP's `SimpleXMLElement`.
- Extract article details:
  - **Title**: `journal_article/titles/title`
  - **Abstract**: `journal_article/jats:abstract/jats:p` or `abstract/jats:p`
  - **Authors**: Array of strings extracted from `journal_article/contributors/person_name[@contributor_role="author"]` (combine `given_name` and `surname`).
  - **DOI**: `journal_article/doi_data/doi`
  - **Publication Date**: `journal_article/publication_date` (parse year, month, day) or parent `journal_issue/publication_date` if article-level is missing.
  - **Volume / Issue**: `journal_issue/journal_volume/volume` and `journal_issue/issue`
  - **Pages**: `journal_article/pages/first_page` and `last_page` / `other_pages`
  - **URLs**:
    - Article: `journal_article/doi_data/resource`
    - PDF: `journal_article/doi_data/collection[@property="text-mining"]/item/resource`
  - **OAI Identifier**: Deterministic `xml:[doi]` or `xml:[journal_id]-[hash(title)]` to satisfy the unique database index constraints on `articles.oai_identifier`.
- Duplicate strategy logic:
  - Search existing article in database by `oai_identifier` or `doi` (if DOI present).
  - If found:
    - If `duplicate_strategy === 'update'`, update the fields.
    - If `duplicate_strategy === 'skip'`, skip import.
  - If not found: create a new Article.

#### Job: `App\Jobs\ImportArticlesXmlJob`
Define background processing job for XML file import:
- Class `ImportArticlesXmlJob` implements `ShouldQueue` on the `harvesting` queue.
- Constructor accepts `Journal $journal`, `string $filePath` (path to stored XML in local disk), `string $strategy`, and `ArticleImportLog $log`.
- `handle()` logic:
  - Transition `$log->status` to `processing`.
  - Invoke `CrossrefXmlImporter` parsing.
  - Increment statistics: `records_found`, `records_imported`, `records_updated`.
  - Delete temporary XML file from disk.
  - Transition status to `success` or `failed` (capturing exception error messages).

---

### 2.3 Controllers & Routing

#### Route Additions in `routes/web.php`
- User role: `Route::post('journals/{journal}/import-xml', [UserJournalController::class, 'importXml'])->name('journals.import-xml');`
- AdminKampus role: `Route::post('journals/{journal}/import-xml', [AdminKampusJournalController::class, 'importXml'])->name('journals.import-xml');`
- Admin role: `Route::post('journals/{journal}/import-xml', [AdminJournalController::class, 'importXml'])->name('journals.import-xml');`

#### Controller Actions
Add `importXml(Request $request, Journal $journal)` method to:
- `App\Http\Controllers\User\JournalController`
- `App\Http\Controllers\AdminKampus\JournalController`
- `App\Http\Controllers\Admin\JournalController`

Validation rules:
- `xml_file`: `required|file|mimes:xml|max:10240` (max 10MB)
- `duplicate_strategy`: `required|in:skip,update`

Logic:
- Store uploaded XML file in `storage/app/xml_imports/`.
- Insert `ArticleImportLog` with status `pending`.
- Dispatch `ImportArticlesXmlJob` with the stored file path and log instance.
- Redirect back with success flash message.

Modify the `show()` actions of the controllers to include `importLogs` in the Inertia response:
- Load `$journal->articleImportLogs()->take(10)->get()`.

---

### 2.4 Frontend UI (Inertia / React)

#### Component: `resources/js/components/ImportXmlDialog.tsx`
Create a reusable Dialog:
- Triggered by "Import XML" button.
- Drag-and-drop file input or selector for XML files.
- Select/radio buttons for `duplicate_strategy` options.
- Progress/loading indicator during submission.
- Uses `@inertiajs/react` `useForm` hook to handle processing and file uploads.

#### Page Integration
Inject `ImportXmlDialog` and list history in:
- `resources/js/Pages/User/Journals/Show.tsx`
- `resources/js/Pages/AdminKampus/Journals/Show.tsx`
- `resources/js/Pages/Admin/Journals/Show.tsx`

Add "Import XML" button in the "Artikel OAI-PMH" header.
Render a new tab or table showing "Riwayat Import XML" (XML Import History) with column attributes:
- Date
- Filename
- Strategy (Skip vs Update)
- Status (Pending, Processing, Success, Failed)
- Found / Imported / Updated counts
- Error message tooltips

---

## 3. Verification Plan

### 3.1 Automated Tests
Create Pest feature tests in `tests/Feature/XmlArticleImportTest.php`:
- Verify validation rules fail on wrong files (non-xml, too large).
- Mock the queue/jobs and verify job dispatching on successful upload.
- Verify XML parsing logic imports OJS 2 format (`storage/app/public/OJS_2.xml`) and OJS 3 format (`storage/app/public/OJS_3.xml`) successfully.
- Verify duplicate strategy is respected (skips or updates existing entries).

### 3.2 Manual Verification
- Upload `OJS_2.xml` and `OJS_3.xml` files manually.
- Confirm they queue correctly and import background status shows successfully.
- Check imported articles in the browse UI (authors, dates, DOIs, abstract are correct).
- Test duplicate handling by importing the same file twice (once with `skip`, once with `update`).
