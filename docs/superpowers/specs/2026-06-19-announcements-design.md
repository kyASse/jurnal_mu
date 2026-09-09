# Announcement Feature Design

This document outlines the design and implementation details for the Public Announcement (Pengumuman) feature, including the Super Admin management dashboard and role-based dashboard widgets.

---

## Database Schema & Models

### 1. Database Migration: `create_announcements_table`
Table Name: `announcements`

Columns:
- `id`: unsignedBigInteger, primary key
- `title`: string (Max 255)
- `slug`: string, unique
- `summary`: text, nullable (Short preview description)
- `body`: longText (Rich HTML body text)
- `attachment_path`: string, nullable (Path to PDF/doc file in storage)
- `attachment_name`: string, nullable (Original user-uploaded filename)
- `target_audience`: string, default `'public'` (Enum values: `'public'`, `'user'`, `'reviewer'`, `'pengelola_jurnal'`, `'admin_kampus'`)
- `tags`: json, nullable (For categorization tags like `['Call for Papers', 'Sinta', 'System Update']`)
- `is_pinned`: boolean, default `false` (If true, pinned to the top of list)
- `is_active`: boolean, default `true` (Active status for visibility)
- `views`: unsignedInteger, default `0` (Hits counter)
- `author_id`: foreignId constrained to `users` table, cascade on delete
- `published_at`: timestamp, nullable (Scheduled publish date)
- `timestamps` (created_at, updated_at)

Indexes:
- Index on `['is_active', 'published_at', 'is_pinned']` to optimize queries.

### 2. Eloquent Model: `App\Models\Announcement`
* **Attributes & Casts**:
  * `$fillable`: `['title', 'slug', 'summary', 'body', 'attachment_path', 'attachment_name', 'target_audience', 'tags', 'is_pinned', 'is_active', 'author_id', 'published_at']`
  * `$casts`: `tags` => `'array'`, `is_pinned` => `'boolean'`, `is_active` => `'boolean'`, `published_at` => `'datetime'`
* **Eloquent Scopes**:
  * `scopePublished($query)`: Filters announcements where `is_active = true` and `published_at <= now()`.
  * `scopeForAudience($query, $audience)`: Filters announcements where `target_audience = $audience` or `target_audience = 'public'`.
* **Relationships**:
  * `author`: `belongsTo(User::class, 'author_id')`

---

## Routing

### Public Routes (`routes/web.php`)
- `Route::get('/announcements', [PublicAnnouncementController::class, 'index'])->name('announcements.index')`
- `Route::get('/announcements/{slug}', [PublicAnnouncementController::class, 'show'])->name('announcements.show')`
- `Route::get('/announcements/{announcement}/download', [PublicAnnouncementController::class, 'downloadAttachment'])->name('announcements.download')`

### Admin Routes (`routes/web.php` under `admin` prefix and Super Admin role middleware)
- `Route::resource('announcements', App\Http\Controllers\Admin\AnnouncementController::class)`
- `Route::post('announcements/{announcement}/toggle-active', [App\Http\Controllers\Admin\AnnouncementController::class, 'toggleActive'])->name('announcements.toggle-active')`
- `Route::post('announcements/{announcement}/toggle-pinned', [App\Http\Controllers\Admin\AnnouncementController::class, 'togglePinned'])->name('announcements.toggle-pinned')`

---

## Controllers

### 1. `App\Http\Controllers\PublicAnnouncementController`
* **`index(Request)`**:
  * Query only active, published announcements targeting `'public'`.
  * Sort order: `is_pinned desc`, `published_at desc`.
  * Filters:
    * Search query matching `title`, `summary`, or `body`.
    * Tag selection matching `tags` JSON field.
  * Return Inertia page `'Public/Announcements/Index'` with paginated announcements.
* **`show($slug)`**:
  * Find announcement matching `$slug`.
  * **Access Control Check**: If `target_audience` is not `'public'`, check if user is logged in and role matches (or user is Super Admin). Abort 403 if unauthorized.
  * Increment `views` counter.
  * Return Inertia page `'Public/Announcements/Show'`.
* **`downloadAttachment(Announcement)`**:
  * **Access Control Check**: If announcement is restricted, authorize authenticated user role first.
  * Return `Storage::download($announcement->attachment_path, $announcement->attachment_name)`.

### 2. `App\Http\Controllers\Admin\AnnouncementController`
* Standard resource controller logic:
  * **`index`**: Paginated datatable of all announcements for Super Admin.
  * **`create`**: Form view.
  * **`store`**: Validate inputs. If attachment is uploaded, store it securely in local folder (e.g. `announcements/`) and save paths. Redirect with success message.
  * **`edit`**: Form view populated with current data.
  * **`update`**: Validate inputs. If new file uploaded, delete old file and save new one. Redirect.
  * **`destroy`**: Delete record and delete file from storage.
  * **`toggleActive`**: Inline ajax request to flip `is_active` boolean.
  * **`togglePinned`**: Inline ajax request to flip `is_pinned` boolean.

---

## Dashboard Integration

### `App\Http\Controllers\DashboardController`
* Determine the current user's role mapping:
  * `'Super Admin'` => `'public'` (or sees all stats)
  * `'Admin Kampus'` => `'admin_kampus'`
  * `'Pengelola Jurnal'` => `'pengelola_jurnal'`
  * `'Reviewer'` => `'reviewer'`
  * `'User'` => `'user'` (representing Author)
* Query latest 5 published announcements that match the mapped role or `'public'`.
* Pass the `announcements` list to Inertia.

---

## Frontend Pages (React + Inertia)

### 1. `resources/js/pages/Public/Announcements/Index.tsx`
* **Layout**: Clean Feed List.
* **Header**: Hero section matching the green-to-teal gradient design. Contains search input and sort/category selectors.
* **List Cards**:
  * Pinned announcements styled with high-contrast highlighted borders and "Pinned" icon/badge.
  * Display elements: Category badge, published date, views, bold title link, summary text (or 150-char fallback snippet from body), and a clean link: "Read Full Announcement →".
* **Pagination**: Standard pagination navigation buttons.

### 2. `resources/js/pages/Public/Announcements/Show.tsx`
* Clean, single-column article structure.
* Back button link to list page.
* Metadata headers (Date, Views, Target Audience badge if logged-in).
* Markdown/HTML parsed body content centered with readable line length (`max-w-3xl`).
* **Attachment Section**: At the bottom of the page, show a distinct card: "Attachment Document". Contains a paperclip icon, the original filename, and a prominent "Download Attachment" button.

### 3. Dashboard Widget in `resources/js/pages/dashboard.tsx`
* A clean container widget inside the dashboard grid: "Latest Announcements".
* Shows simple list of matching announcements with date, title, and target category badge.
* Clickable title links directly to `/announcements/{slug}` to view details.

### 4. Admin Announcement Pages (`Admin/Announcements/*`)
* **`Index.tsx`**:
  * Clean UI table with Columns: Title, Audience, Pinned, Active, Published At, Views.
  * Active and Pinned toggle buttons.
  * Create/Edit buttons.
* **`Create.tsx` / `Edit.tsx`**:
  * Fields: Title, Subtitle, Body (RichTextEditor), Target Audience, Tags (comma separated), Published At, Attachment file.
  * Slug generated automatically from Title change.

---

## Edge Cases & Security Checks

1. **Restricted URLs**: Controller validates role matches if `target_audience !== 'public'` when viewing/downloading.
2. **File Validation**: Validate files strictly: `pdf`, `doc`, `docx`, `xls`, `xlsx`, `zip` only. Max 5MB size limit.
3. **Future Schedule**: Filter out announcements where `published_at > now()`.
4. **Cleanup Orphaned Files**: Deleting or updating an announcement deletes the old file from `Storage` disk.
5. **No Summary Snippet**: Use stripped HTML body snippet if summary field is omitted.
