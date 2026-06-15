# News Public Page Feature Design

## Database Schema & Models

### 1. Database Migration: `create_news_table`
Table: `news`
Fields:
- `id`: unsignedBigInteger, primary key
- `title`: string
- `slug`: string, unique
- `subtitle`: string, nullable
- `body`: longText
- `thumbnail`: string, nullable (path in public disk)
- `image`: string, nullable (path in public disk)
- `tags`: json, nullable
- `views`: integer, default 0
- `is_active`: boolean, default true
- `published_at`: timestamp, nullable
- `timestamps`

### 2. Eloquent Model: `App\Models\News`
Properties & Casts:
- `$casts`: `tags` => `'array'`, `published_at` => `'datetime'`, `is_active` => `'boolean'`
- `$fillable`: `title`, `slug`, `subtitle`, `body`, `thumbnail`, `image`, `tags`, `is_active`, `published_at`
- Relationships:
  - `author`: BelongsTo `User`

---

## Routing

### Public Routes (`routes/web.php`)
- `Route::get('/news', [PublicNewsController::class, 'index'])->name('news.index')`
- `Route::get('/news/{slug}', [PublicNewsController::class, 'show'])->name('news.show')`

### Admin Routes (`routes/web.php` under `admin` prefix and `Role::SUPER_ADMIN` middleware)
- `Route::resource('news', App\Http\Controllers\Admin\NewsController::class)`
- `Route::post('news/{id}/toggle-active', [App\Http\Controllers\Admin\NewsController::class, 'toggleActive'])->name('news.toggle-active')`

---

## Controllers

### 1. `App\Http\Controllers\PublicNewsController`
- `index(Request)`:
  - Query active news where `is_active = true` and `published_at <= now()`.
  - Filter: search by title, subtitle, or body.
  - Sort:
    - `new`: `published_at desc` (default)
    - `old`: `published_at asc`
    - `A to Z`: `title asc`
  - Returns Inertia page `'Public/News/Index'` with paginated news.
- `show($slug)`:
  - Find active news.
  - Increment views count.
  - Returns Inertia page `'Public/News/Show'`.

### 2. `App\Http\Controllers\Admin\NewsController`
- Restricted to `Super Admin`.
- Standard resource actions:
  - `index`: Paginated list of all news with query parameters for filtering/searching.
  - `create`: Render news creation page.
  - `store`: Validate input, upload files to `public/news` disk, save record.
  - `edit`: Render edit form with news data.
  - `update`: Validate, upload files if provided (deleting old ones), update record.
  - `destroy`: Delete news record and associated files from storage.
  - `toggleActive`: Toggle the `is_active` status.

---

## Frontend Pages (React + Inertia)

### 1. `resources/js/pages/Public/News/Index.tsx`
- **Header**: Beautiful emerald gradient matching agenda pages. Search bar (text search) and Sorting Select input.
- **News List**: Grid of cards. Each card displays:
  - Image (`thumbnail` with fallback image).
  - Date.
  - Title.
  - Snippet (plain text excerpt of the body).
- **Load More**:
  - Store items in local state.
  - "Load More" fetches the next page in the background (using Inertia reload/fetch or `router.get` with partial reload).
  - Appends new items to state.

### 2. `resources/js/pages/Public/News/Show.tsx`
- **Breadcrumbs**: Home > News > Article Title
- **Headline**: Large news title and subtitle.
- **Metadata**: Published Date, Writer, Views.
- **Share Buttons**: Copy link (clipboard), WhatsApp, Facebook, Twitter.
- **Main Image**: Full-width featured image.
- **Body Content**: HTML/Markdown body. Width constrained to max 600-700px (e.g. class `max-w-2xl` or `max-w-3xl`) for premium reading experience.
- **Tags**: Badges at the bottom of the article.

### 3. `resources/js/pages/Admin/News/Index.tsx`
- Table of news articles showing Title, Status, Views, Date.
- Action buttons: edit, delete, toggle active.
- Search filter.

### 4. `resources/js/pages/Admin/News/Create.tsx` & `Edit.tsx`
- Form controls for news editing.
- Automatic slug generator based on Title input.
- File uploads for thumbnail and main image.
- Tags input field.
- Rich-text or clean text area for news body.
