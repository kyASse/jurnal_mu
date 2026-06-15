# News Public Page Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public news page feature with search/sort and continuous scrolling (load more), along with a dashboard news manager restricted to Super Admins.

**Architecture:** Create a `News` Eloquent model and migration, write feature tests for both public news reading and admin news management. Build controllers and requests in Laravel, and create Inertia React pages for the frontend list, detail, and admin dashboard views.

**Tech Stack:** Laravel, Inertia.js, React, TypeScript, Tailwind CSS, Lucide icons, Pest (testing).

---

## Plan Structure

- **Task 1:** Database Schema & News Model setup
- **Task 2:** News Public Controller & Feature Tests
- **Task 3:** News Admin Controller & Feature Tests
- **Task 4:** Frontend Routes, Navigation & Layout Updates
- **Task 5:** Public News Index and Show Components
- **Task 6:** Admin News Index and Create/Edit Components

---

### Task 1: Database Schema & News Model Setup

**Files:**
- Create: `database/migrations/2026_06_11_000000_create_news_table.php`
- Create: `app/Models/News.php`
- Test: `tests/Unit/NewsTest.php`

- [ ] **Step 1: Write a failing unit test for News model casts and author relationship**

Create file: `tests/Unit/NewsTest.php`
```php
<?php

use App\Models\News;
use App\Models\User;

it('casts fields correctly and belongs to an author', function () {
    $author = User::factory()->create();
    $news = News::create([
        'title' => 'Test News Title',
        'slug' => 'test-news-title',
        'subtitle' => 'Test News Subtitle',
        'body' => 'Test body paragraph.',
        'author_id' => $author->id,
        'tags' => ['React', 'Laravel'],
        'is_active' => true,
        'published_at' => now(),
    ]);

    expect($news->tags)->toBeArray()
        ->and($news->tags)->toEqual(['React', 'Laravel'])
        ->and($news->is_active)->toBeTrue()
        ->and($news->author->id)->toBe($author->id);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Unit/NewsTest.php`
Expected: FAIL with "Class App\Models\News not found"

- [ ] **Step 3: Create Model `app/Models/News.php` and migration file**

Create migration file: `database/migrations/2026_06_11_000000_create_news_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('subtitle')->nullable();
            $table->longText('body');
            $table->string('thumbnail')->nullable();
            $table->string('image')->nullable();
            $table->json('tags')->nullable();
            $table->integer('views')->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
```

Create model file: `app/Models/News.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class News extends Model
{
    use HasFactory;

    protected $table = 'news';

    protected $fillable = [
        'title',
        'slug',
        'subtitle',
        'body',
        'thumbnail',
        'image',
        'tags',
        'views',
        'is_active',
        'author_id',
        'published_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_active' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
```

- [ ] **Step 4: Run migration and run test to verify it passes**

Run command: `docker exec -it jurnal-mu-app php artisan migrate`
Run command: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Unit/NewsTest.php`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add database/migrations/2026_06_11_000000_create_news_table.php app/Models/News.php tests/Unit/NewsTest.php
git commit -m "feat: add News model, migration, and unit test"
```

---

### Task 2: News Public Controller & Feature Tests

**Files:**
- Create: `app/Http/Controllers/PublicNewsController.php`
- Create: `tests/Feature/Public/NewsTest.php`

- [ ] **Step 1: Write failing feature test for public list and detail pages**

Create file: `tests/Feature/Public/NewsTest.php`
```php
<?php

use App\Models\News;
use App\Models\User;

it('displays active published news and increments views on detail page', function () {
    $author = User::factory()->create();
    
    // Active published news
    $news = News::create([
        'title' => 'React Setup Seminar',
        'slug' => 'react-setup-seminar',
        'body' => 'React setup detailed tutorial.',
        'author_id' => $author->id,
        'is_active' => true,
        'published_at' => now()->subDay(),
    ]);

    // Inactive news
    News::create([
        'title' => 'Draft News',
        'slug' => 'draft-news',
        'body' => 'Secret news draft.',
        'author_id' => $author->id,
        'is_active' => false,
        'published_at' => now()->subDay(),
    ]);

    // Future news
    News::create([
        'title' => 'Future News',
        'slug' => 'future-news',
        'body' => 'News for next week.',
        'author_id' => $author->id,
        'is_active' => true,
        'published_at' => now()->addWeek(),
    ]);

    // List page check
    $response = $this->get(route('news.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/News/Index')
        ->has('news.data', 1)
        ->where('news.data.0.title', 'React Setup Seminar')
    );

    // Detail page check
    $detailResponse = $this->get(route('news.show', $news->slug));
    $detailResponse->assertOk();
    $detailResponse->assertInertia(fn ($page) => $page
        ->component('Public/News/Show')
        ->where('news.title', 'React Setup Seminar')
    );

    // Verify views incremented
    expect($news->fresh()->views)->toBe(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/Public/NewsTest.php`
Expected: FAIL (routes do not exist)

- [ ] **Step 3: Register web public routes and write PublicNewsController**

Modify `routes/web.php` by adding the following routes:
```php
Route::get('/news', [App\Http\Controllers\PublicNewsController::class, 'index'])->name('news.index');
Route::get('/news/{slug}', [App\Http\Controllers\PublicNewsController::class, 'show'])->name('news.show');
```

Create file `app/Http/Controllers/PublicNewsController.php`:
```php
<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicNewsController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $sort = $request->input('sort', 'new');

        $query = News::where('is_active', true)
            ->where(function($q) {
                $q->whereNull('published_at')
                  ->orWhere('published_at', '<=', now());
            });

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        if ($sort === 'old') {
            $query->orderBy('published_at', 'asc');
        } elseif ($sort === 'A to Z') {
            $query->orderBy('title', 'asc');
        } else {
            $query->orderBy('published_at', 'desc');
        }

        $news = $query->with('author:id,name')
            ->paginate(6)
            ->withQueryString();

        return Inertia::render('Public/News/Index', [
            'news' => $news,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
            ]
        ]);
    }

    public function show(string $slug): Response
    {
        $news = News::where('slug', $slug)
            ->where('is_active', true)
            ->where(function($q) {
                $q->whereNull('published_at')
                  ->orWhere('published_at', '<=', now());
            })
            ->with('author:id,name')
            ->firstOrFail();

        $news->increment('views');

        return Inertia::render('Public/News/Show', [
            'news' => $news
        ]);
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/Public/NewsTest.php`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add routes/web.php app/Http/Controllers/PublicNewsController.php tests/Feature/Public/NewsTest.php
git commit -m "feat: implement PublicNewsController, register routes, and add feature tests"
```

---

### Task 3: News Admin Controller & Feature Tests

**Files:**
- Create: `app/Http/Controllers/Admin/NewsController.php`
- Create: `tests/Feature/Admin/NewsControllerTest.php`

- [ ] **Step 1: Write failing feature test for Super Admin news management**

Create file: `tests/Feature/Admin/NewsControllerTest.php`
```php
<?php

use App\Models\News;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('allows only super admin to manage news', function () {
    Storage::fake('public');

    $superAdminRole = Role::where('name', Role::SUPER_ADMIN)->first();
    $superAdmin = User::factory()->create(['role_id' => $superAdminRole->id]);

    $userRole = Role::where('name', Role::USER)->first();
    $regularUser = User::factory()->create(['role_id' => $userRole->id]);

    // Unauthorized access check
    $this->actingAs($regularUser)
        ->get(route('admin.news.index'))
        ->assertForbidden();

    // Super admin index check
    $this->actingAs($superAdmin)
        ->get(route('admin.news.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/News/Index'));

    // Super admin create news check
    $thumbnail = UploadedFile::fake()->image('thumb.jpg');
    $image = UploadedFile::fake()->image('main.jpg');

    $response = $this->actingAs($superAdmin)
        ->post(route('admin.news.store'), [
            'title' => 'New Super Admin News Item',
            'slug' => 'new-super-admin-news-item',
            'subtitle' => 'Subtitle text here',
            'body' => '<p>Rich content here</p>',
            'tags' => ['Laravel', 'Inertia'],
            'is_active' => true,
            'published_at' => now()->toDateTimeString(),
            'thumbnail' => $thumbnail,
            'image' => $image,
        ]);

    $response->assertRedirect(route('admin.news.index'));

    $news = News::where('slug', 'new-super-admin-news-item')->first();
    expect($news)->not->toBeNull();
    expect($news->thumbnail)->not->toBeNull();
    expect($news->image)->not->toBeNull();

    Storage::disk('public')->assertExists($news->thumbnail);
    Storage::disk('public')->assertExists($news->image);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/Admin/NewsControllerTest.php`
Expected: FAIL (route/controller not found)

- [ ] **Step 3: Define routes under admin middleware group & write controller**

Modify `routes/web.php` inside the Super Admin prefix group:
```diff
    Route::middleware(['role:'.Role::SUPER_ADMIN])->prefix('admin')->name('admin.')->group(function () {
        // ... existing routes
+       Route::resource('news', App\Http\Controllers\Admin\NewsController::class);
+       Route::post('news/{id}/toggle-active', [App\Http\Controllers\Admin\NewsController::class, 'toggleActive'])->name('news.toggle-active');
    });
```

Create file `app/Http/Controllers/Admin/NewsController.php`:
```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $query = News::query();

        if ($search) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
        }

        $news = $query->with('author:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/News/Index', [
            'news' => $news,
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/News/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:news,slug',
            'subtitle' => 'nullable|string|max:255',
            'body' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
            'thumbnail' => 'nullable|image|max:2048',
            'image' => 'nullable|image|max:4096',
        ]);

        $validated['author_id'] = auth()->id();

        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('news/thumbnails', 'public');
        }

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('news/images', 'public');
        }

        News::create($validated);

        return redirect()->route('admin.news.index')->with('success', 'News created successfully.');
    }

    public function edit(News $news): Response
    {
        return Inertia::render('Admin/News/Edit', [
            'news' => $news
        ]);
    }

    public function update(Request $request, News $news)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:news,slug,' . $news->id,
            'subtitle' => 'nullable|string|max:255',
            'body' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
            'thumbnail' => 'nullable|image|max:2048',
            'image' => 'nullable|image|max:4096',
        ]);

        if ($request->hasFile('thumbnail')) {
            if ($news->thumbnail) {
                Storage::disk('public')->delete($news->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('news/thumbnails', 'public');
        }

        if ($request->hasFile('image')) {
            if ($news->image) {
                Storage::disk('public')->delete($news->image);
            }
            $validated['image'] = $request->file('image')->store('news/images', 'public');
        }

        $news->update($validated);

        return redirect()->route('admin.news.index')->with('success', 'News updated successfully.');
    }

    public function destroy(News $news)
    {
        if ($news->thumbnail) {
            Storage::disk('public')->delete($news->thumbnail);
        }
        if ($news->image) {
            Storage::disk('public')->delete($news->image);
        }

        $news->delete();

        return redirect()->route('admin.news.index')->with('success', 'News deleted successfully.');
    }

    public function toggleActive(int $id)
    {
        $news = News::findOrFail($id);
        $news->update([
            'is_active' => !$news->is_active
        ]);

        return back()->with('success', 'News status updated.');
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/Admin/NewsControllerTest.php`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add routes/web.php app/Http/Controllers/Admin/NewsController.php tests/Feature/Admin/NewsControllerTest.php
git commit -m "feat: implement NewsAdminController with store, update, destroy and tests"
```

---

### Task 4: Frontend Routes, Navigation & Layout Updates

**Files:**
- Modify: `resources/js/components/public-navbar.tsx`
- Modify: `resources/js/components/app-sidebar.tsx`

- [ ] **Step 1: Add link to Navbar**

In `resources/js/components/public-navbar.tsx` modify to add `News` navigation link:
```diff
                        <Link href={route('browse.universities')} className="font-semibold text-white/90 transition-colors hover:text-white">
                            Universities
                        </Link>
+                       <Link href={route('news.index')} className="font-semibold text-white/90 transition-colors hover:text-white">
+                           News
+                       </Link>
                        <Link href={route('events.index')} className="font-semibold text-white/90 transition-colors hover:text-white">
                            Events
                        </Link>
```

- [ ] **Step 2: Add News Management to Super Admin Sidebar**

In `resources/js/components/app-sidebar.tsx`, import `Newspaper` icon from `'lucide-react'` and modify Super Admin navigation items:
```diff
 import {
     Award,
     BookOpen,
     BookType,
     Box,
     Building2,
     CalendarDays,
     ClipboardList,
     LayoutGrid,
     Library,
     LifeBuoy,
+    Newspaper,
     UserCheck,
     Users,
 } from 'lucide-react';
```
```diff
             {
                 title: 'Agendas & Events',
                 href: route('admin.events.index'),
                 icon: CalendarDays,
             },
+            {
+                title: 'News Management',
+                href: route('admin.news.index'),
+                icon: Newspaper,
+            },
             {
                 title: 'Reviewer Assignment',
                 href: route('dikti.assessments.index'),
                 icon: UserCheck,
             },
```

- [ ] **Step 3: Commit changes**

```bash
git add resources/js/components/public-navbar.tsx resources/js/components/app-sidebar.tsx
git commit -m "feat: update public navbar and admin sidebar to support news links"
```

---

### Task 5: Public News Index and Show Components

**Files:**
- Create: `resources/js/pages/Public/News/Index.tsx`
- Create: `resources/js/pages/Public/News/Show.tsx`

- [ ] **Step 1: Implement News Index Component**

Create `resources/js/pages/Public/News/Index.tsx`:
```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PublicLayout from '@/layouts/public-layout';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, Search, Newspaper } from 'lucide-react';
import { FormEvent, useState, useEffect } from 'react';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    body: string;
    thumbnail: string | null;
    tags: string[] | null;
    views: number;
    published_at: string | null;
    author: { id: number; name: string } | null;
}

interface PaginatedData {
    data: NewsItem[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
}

interface Props {
    news: PaginatedData;
    filters?: { search?: string; sort?: string };
}

export default function Index({ news, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [sort, setSort] = useState(filters?.sort || 'new');
    const [newsList, setNewsList] = useState<NewsItem[]>(news.data);
    const [currentPage, setCurrentPage] = useState(news.current_page);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        setNewsList(news.data);
        setCurrentPage(news.current_page);
    }, [news.data]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('news.index'),
            { search, sort },
            { preserveState: true }
        );
    };

    const handleSortChange = (value: string) => {
        setSort(value);
        router.get(
            route('news.index'),
            { search, sort: value },
            { preserveState: true }
        );
    };

    const loadMore = async () => {
        if (!news.next_page_url || loadingMore) return;
        setLoadingMore(true);

        try {
            const url = new URL(news.next_page_url, window.location.origin);
            url.searchParams.set('search', search);
            url.searchParams.set('sort', sort);

            const res = await fetch(url.toString(), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });

            if (res.ok) {
                const responseData = await res.json();
                const fetchedNews: PaginatedData = responseData.news;
                setNewsList(prev => [...prev, ...fetchedNews.data]);
                setCurrentPage(fetchedNews.current_page);
                news.next_page_url = fetchedNews.next_page_url;
            }
        } catch (err) {
            console.error('Error loading more news:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    const stripHtml = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    return (
        <PublicLayout>
            <Head title="News & Press" />

            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#079C4E] to-[#10816F] py-16 text-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#FCEE1F] opacity-10 mix-blend-overlay blur-3xl"></div>
                    <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#1A2A75] opacity-20 mix-blend-multiply blur-3xl"></div>
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
                    ></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-12 text-center sm:px-6 lg:px-8">
                    <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: '"El Messiri", serif' }}>
                        Latest <span className="text-[#FCEE1F]">News & Updates</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-emerald-50">
                        Stay informed about network announcements, publications, achievements, and structural activities.
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="relative z-20 mx-auto -mt-8 mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                    <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search news by title or content..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 rounded-full pl-12 text-base"
                            />
                        </div>
                        <div className="w-full sm:w-[250px]">
                            <Select value={sort} onValueChange={handleSortChange}>
                                <SelectTrigger className="h-12 rounded-full">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">Newest</SelectItem>
                                    <SelectItem value="old">Oldest</SelectItem>
                                    <SelectItem value="A to Z">A to Z</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            className="h-12 w-full rounded-full bg-[#079C4E] px-8 font-semibold hover:bg-[#068A44] sm:w-auto"
                        >
                            Search
                        </Button>
                    </form>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                {newsList.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-muted/20 py-16 text-center">
                        <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">No news found</h3>
                        <p className="mt-2 text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
                        {(search || sort !== 'new') && (
                            <Button
                                variant="link"
                                onClick={() => {
                                    setSearch('');
                                    setSort('new');
                                    router.get(route('news.index'));
                                }}
                                className="mt-4"
                            >
                                Clear all filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                            {newsList.map((item) => (
                                <article key={item.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="aspect-video w-full overflow-hidden bg-muted relative">
                                        {item.thumbnail ? (
                                            <img
                                                src={`/storage/${item.thumbnail}`}
                                                alt={item.title}
                                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-emerald-50 dark:bg-emerald-950/20">
                                                <Newspaper className="h-12 w-12 text-emerald-600/30 dark:text-emerald-400/20" />
                                            </div>
                                        )}
                                        {item.tags && item.tags.length > 0 && (
                                            <span className="absolute top-4 left-4 rounded-full bg-[#079C4E] px-3 py-1 text-xs font-bold text-white shadow-md">
                                                {item.tags[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                            <CalendarDays className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                            <span>{item.published_at ? new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft'}</span>
                                            {item.views > 0 && (
                                                <>
                                                    <span>&bull;</span>
                                                    <span>{item.views} views</span>
                                                </>
                                            )}
                                        </div>
                                        <h3 className="font-heading text-xl font-bold leading-snug text-foreground hover:text-[#079C4E] dark:hover:text-[#079C4E] transition-colors mb-2 line-clamp-2">
                                            <a href={route('news.show', item.slug)}>{item.title}</a>
                                        </h3>
                                        {item.subtitle && (
                                            <p className="text-sm font-semibold text-muted-foreground line-clamp-1 mb-2">
                                                {item.subtitle}
                                            </p>
                                        )}
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                                            {stripHtml(item.body)}
                                        </p>
                                        <div className="pt-4 border-t dark:border-zinc-800">
                                            <a
                                                href={route('news.show', item.slug)}
                                                className="text-[#079C4E] text-sm font-bold hover:underline inline-flex items-center gap-1"
                                            >
                                                Read Full Article &rarr;
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {news.next_page_url && (
                            <div className="mt-12 flex justify-center">
                                <Button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    size="lg"
                                    className="rounded-full bg-[#079C4E] hover:bg-[#068A44] px-8 font-semibold"
                                >
                                    {loadingMore ? 'Loading...' : 'Load More News'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PublicLayout>
    );
}
```

- [ ] **Step 2: Implement News Show Component**

Create `resources/js/pages/Public/News/Show.tsx`:
```tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Eye, Link2, Share2, Facebook, Twitter } from 'lucide-react';
import { useState } from 'react';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    body: string;
    image: string | null;
    tags: string[] | null;
    views: number;
    published_at: string | null;
    author: { id: number; name: string } | null;
}

interface Props {
    news: NewsItem;
}

export default function Show({ news }: Props) {
    const [copied, setCopied] = useState(false);

    const shareUrl = window.location.href;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(news.title + ' ' + shareUrl)}`, '_blank');
    };

    const shareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    const shareTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    return (
        <PublicLayout>
            <Head title={news.title} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="mb-6 flex text-sm text-muted-foreground">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <a href={route('home')} className="hover:text-foreground">Home</a>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="mx-2 text-zinc-400">/</span>
                                <a href={route('news.index')} className="hover:text-foreground">News</a>
                            </div>
                        </li>
                        <li className="hidden sm:block">
                            <div className="flex items-center">
                                <span className="mx-2 text-zinc-400">/</span>
                                <span className="text-foreground line-clamp-1">{news.title}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <a href={route('news.index')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#079C4E] hover:underline mb-8">
                    <ArrowLeft className="h-4 w-4" /> Back to all news
                </a>

                <article className="mx-auto">
                    {/* Header: Title, Subtitle, and Metadata */}
                    <div className="text-center mb-8">
                        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl mb-4 leading-tight max-w-4xl mx-auto" style={{ fontFamily: '"El Messiri", serif' }}>
                            {news.title}
                        </h1>
                        {news.subtitle && (
                            <p className="text-xl text-muted-foreground font-medium max-w-3xl mx-auto mb-6">
                                {news.subtitle}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground border-y py-4 dark:border-zinc-800">
                            <div className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span>{news.published_at ? new Date(news.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Draft'}</span>
                            </div>
                            <span>&bull;</span>
                            <div>
                                <span>By: </span>
                                <span className="font-semibold text-foreground">{news.author?.name || 'Super Admin'}</span>
                            </div>
                            <span>&bull;</span>
                            <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span>{news.views} views</span>
                            </div>
                        </div>
                    </div>

                    {/* Share Buttons & Main Image */}
                    <div className="relative mb-10">
                        {/* Share Overlay floating bar */}
                        <div className="flex justify-center gap-2 mb-6 sm:absolute sm:top-4 sm:right-4 sm:mb-0 sm:flex-col sm:bg-white/90 sm:p-2 sm:rounded-2xl sm:shadow-lg sm:backdrop-blur-sm dark:sm:bg-zinc-900/90">
                            <Button onClick={copyToClipboard} size="icon" variant="outline" className="rounded-full" title="Copy Link">
                                <Link2 className="h-4 w-4" />
                            </Button>
                            <Button onClick={shareWhatsApp} size="icon" variant="outline" className="rounded-full hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20" title="Share WhatsApp">
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button onClick={shareFacebook} size="icon" variant="outline" className="rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/20" title="Share Facebook">
                                <Facebook className="h-4 w-4" />
                            </Button>
                            <Button onClick={shareTwitter} size="icon" variant="outline" className="rounded-full hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-sky-950/20" title="Share Twitter">
                                <Twitter className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Main Media Image */}
                        <div className="aspect-video w-full overflow-hidden rounded-3xl bg-muted shadow-lg">
                            {news.image ? (
                                <img
                                    src={`/storage/${news.image}`}
                                    alt={news.title}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-emerald-50 dark:bg-emerald-950/20">
                                    <Newspaper className="h-24 w-24 text-emerald-600/20 dark:text-emerald-400/10" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Body Text */}
                    <div className="mx-auto max-w-2xl px-2 sm:px-6">
                        <div
                            className="prose prose-lg dark:prose-invert prose-emerald max-w-none text-[#242420] dark:text-[#E8E8E6] leading-relaxed font-sans"
                            dangerouslySetInnerHTML={{ __html: news.body }}
                            style={{ fontSize: '1.125rem' }}
                        />

                        {/* Tags Badges */}
                        {news.tags && news.tags.length > 0 && (
                            <div className="mt-12 border-t pt-6 dark:border-zinc-800">
                                <span className="text-sm font-semibold text-muted-foreground mr-3 block sm:inline mb-2 sm:mb-0">Tags:</span>
                                <div className="inline-flex flex-wrap gap-2">
                                    {news.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="px-3 py-1 text-xs hover:bg-[#079C4E] hover:text-white transition-colors cursor-pointer">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </article>
            </div>
        </PublicLayout>
    );
}
```

- [ ] **Step 3: Commit changes**

```bash
git add resources/js/pages/Public/News/Index.tsx resources/js/pages/Public/News/Show.tsx
git commit -m "feat: implement public news list page and news show detail page"
```

---

### Task 6: Admin News Index and Create/Edit Components

**Files:**
- Create: `resources/js/pages/Admin/News/Index.tsx`
- Create: `resources/js/pages/Admin/News/Create.tsx`
- Create: `resources/js/pages/Admin/News/Edit.tsx`

- [ ] **Step 1: Implement Admin News Index Page**

Create `resources/js/pages/Admin/News/Index.tsx`:
```tsx
import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Search, Trash2, Edit2, Newspaper, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    views: number;
    is_active: boolean;
    published_at: string | null;
}

interface PaginationData {
    data: NewsItem[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    news: PaginationData;
    filters?: { search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'News Management', href: '/admin/news' },
];

export default function Index({ news, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<NewsItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.news.index'), { search }, { preserveState: true });
    };

    const handleDelete = (item: NewsItem) => {
        setDeletingItem(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deletingItem) return;
        router.delete(route('admin.news.destroy', deletingItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setDeletingItem(null);
            },
        });
    };

    const toggleActive = (id: number) => {
        router.post(route('admin.news.toggle-active', id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="News Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                <Newspaper className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                News Management
                            </h1>
                            <p className="mt-1 text-muted-foreground">Publish, edit and manage public news updates</p>
                        </div>
                        <Link href={route('admin.news.create')}>
                            <Button className="bg-[#079C4E] hover:bg-[#068A44]">
                                <Plus className="mr-2 h-4 w-4" /> Create News
                            </Button>
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by news title..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Views</TableHead>
                                    <TableHead>Published Date</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {news.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                            No news found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    news.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium max-w-sm truncate">
                                                {item.title}
                                            </TableCell>
                                            <TableCell>{item.views} views</TableCell>
                                            <TableCell>{item.published_at ? new Date(item.published_at).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="sm" onClick={() => toggleActive(item.id)}>
                                                    {item.is_active ? (
                                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Draft</Badge>
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={route('admin.news.edit', item.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit2 className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {news.data.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">No news found.</CardContent>
                            </Card>
                        ) : (
                            news.data.map((item) => (
                                <Card key={item.id}>
                                    <div className="space-y-4 p-4">
                                        <div>
                                            <h3 className="text-lg font-semibold truncate">{item.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {item.views} views &bull; {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Draft'}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Button variant="ghost" size="sm" className="px-0" onClick={() => toggleActive(item.id)}>
                                                {item.is_active ? (
                                                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Draft</Badge>
                                                )}
                                            </Button>
                                            <div className="flex gap-2">
                                                <Link href={route('admin.news.edit', item.id)}>
                                                    <Button size="sm" variant="outline">Edit</Button>
                                                </Link>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Delete Confirm Dialog */}
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete News Article</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete "{deletingItem?.title}"? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete}>
                                    Delete Article
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 2: Implement Admin News Create Page**

Create `resources/js/pages/Admin/News/Create.tsx`:
```tsx
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'News Management', href: '/admin/news' },
    { title: 'Create News', href: '/admin/news/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        subtitle: '',
        body: '',
        tags_input: '',
        is_active: true,
        published_at: '',
        thumbnail: null as File | null,
        image: null as File | null,
    });

    const handleTitleBlur = () => {
        if (!data.slug) {
            const generatedSlug = data.title
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            setData('slug', generatedSlug);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const tagsArray = data.tags_input
            ? data.tags_input.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : [];

        post(route('admin.news.store'), {
            // Include tags array inside payload
            // In Inertia we can merge or transform data or pass it as regular key
            ...data,
            // @ts-ignore
            tags: tagsArray
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create News" />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <a href={route('admin.news.index')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#079C4E] hover:underline">
                        <ArrowLeft className="h-4 w-4" /> Back to List
                    </a>
                </div>

                <div className="rounded-xl border border-sidebar-border bg-white p-6 shadow-sm dark:bg-neutral-950">
                    <h2 className="text-2xl font-bold mb-6 text-foreground">Create News Article</h2>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                onBlur={handleTitleBlur}
                                required
                                className="mt-1"
                            />
                            {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
                        </div>

                        <div>
                            <Label htmlFor="slug">Slug *</Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={e => setData('slug', e.target.value)}
                                required
                                className="mt-1"
                            />
                            {errors.slug && <span className="text-sm text-red-500">{errors.slug}</span>}
                        </div>

                        <div>
                            <Label htmlFor="subtitle">Subtitle</Label>
                            <Input
                                id="subtitle"
                                value={data.subtitle}
                                onChange={e => setData('subtitle', e.target.value)}
                                className="mt-1"
                            />
                            {errors.subtitle && <span className="text-sm text-red-500">{errors.subtitle}</span>}
                        </div>

                        <div>
                            <Label htmlFor="body">Body (HTML allowed) *</Label>
                            <Textarea
                                id="body"
                                rows={10}
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                required
                                className="mt-1 font-mono"
                                placeholder="Enter article body HTML here..."
                            />
                            {errors.body && <span className="text-sm text-red-500">{errors.body}</span>}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="thumbnail">Thumbnail Image (2MB max)</Label>
                                <Input
                                    id="thumbnail"
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setData('thumbnail', e.target.files ? e.target.files[0] : null)}
                                    className="mt-1"
                                />
                                {errors.thumbnail && <span className="text-sm text-red-500">{errors.thumbnail}</span>}
                            </div>

                            <div>
                                <Label htmlFor="image">Main High-Res Image (4MB max)</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setData('image', e.target.files ? e.target.files[0] : null)}
                                    className="mt-1"
                                />
                                {errors.image && <span className="text-sm text-red-500">{errors.image}</span>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tags_input">Tags (comma separated)</Label>
                            <Input
                                id="tags_input"
                                value={data.tags_input}
                                onChange={e => setData('tags_input', e.target.value)}
                                placeholder="e.g. Announcement, Event, Workshop"
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="published_at">Publish Date/Time</Label>
                                <Input
                                    id="published_at"
                                    type="datetime-local"
                                    value={data.published_at}
                                    onChange={e => setData('published_at', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.published_at && <span className="text-sm text-red-500">{errors.published_at}</span>}
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <Label htmlFor="is_active">Publish Status (Active)</Label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 border-t pt-6">
                            <a href={route('admin.news.index')}>
                                <Button variant="outline" type="button">Cancel</Button>
                            </a>
                            <Button type="submit" disabled={processing} className="bg-[#079C4E] hover:bg-[#068A44]">
                                <Save className="mr-2 h-4 w-4" /> Save Article
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 3: Implement Admin News Edit Page**

Create `resources/js/pages/Admin/News/Edit.tsx`:
```tsx
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    body: string;
    tags: string[] | null;
    is_active: boolean;
    published_at: string | null;
    thumbnail: string | null;
    image: string | null;
}

interface Props {
    news: NewsItem;
}

const breadcrumbs = (id: number): BreadcrumbItem[] => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'News Management', href: '/admin/news' },
    { title: 'Edit News', href: `/admin/news/${id}/edit` },
];

export default function Edit({ news }: Props) {
    const formatDateTime = (dateTimeString: string | null) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        // format to YYYY-MM-DDTHH:MM
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // standard Laravel spoofing for file uploads in PUT/PATCH requests
        title: news.title,
        slug: news.slug,
        subtitle: news.subtitle || '',
        body: news.body,
        tags_input: news.tags ? news.tags.join(', ') : '',
        is_active: news.is_active,
        published_at: formatDateTime(news.published_at),
        thumbnail: null as File | null,
        image: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const tagsArray = data.tags_input
            ? data.tags_input.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : [];

        // Note: files upload in Laravel requires using POST with _method=PUT
        post(route('admin.news.update', news.id), {
            // @ts-ignore
            tags: tagsArray
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(news.id)}>
            <Head title="Edit News" />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <a href={route('admin.news.index')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#079C4E] hover:underline">
                        <ArrowLeft className="h-4 w-4" /> Back to List
                    </a>
                </div>

                <div className="rounded-xl border border-sidebar-border bg-white p-6 shadow-sm dark:bg-neutral-950">
                    <h2 className="text-2xl font-bold mb-6 text-foreground">Edit News Article</h2>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                required
                                className="mt-1"
                            />
                            {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
                        </div>

                        <div>
                            <Label htmlFor="slug">Slug *</Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={e => setData('slug', e.target.value)}
                                required
                                className="mt-1"
                            />
                            {errors.slug && <span className="text-sm text-red-500">{errors.slug}</span>}
                        </div>

                        <div>
                            <Label htmlFor="subtitle">Subtitle</Label>
                            <Input
                                id="subtitle"
                                value={data.subtitle}
                                onChange={e => setData('subtitle', e.target.value)}
                                className="mt-1"
                            />
                            {errors.subtitle && <span className="text-sm text-red-500">{errors.subtitle}</span>}
                        </div>

                        <div>
                            <Label htmlFor="body">Body (HTML allowed) *</Label>
                            <Textarea
                                id="body"
                                rows={10}
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                required
                                className="mt-1 font-mono"
                            />
                            {errors.body && <span className="text-sm text-red-500">{errors.body}</span>}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="thumbnail">Thumbnail Image (leave empty to keep current)</Label>
                                <Input
                                    id="thumbnail"
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setData('thumbnail', e.target.files ? e.target.files[0] : null)}
                                    className="mt-1"
                                />
                                {news.thumbnail && (
                                    <p className="mt-1 text-xs text-muted-foreground">Current: {news.thumbnail}</p>
                                )}
                                {errors.thumbnail && <span className="text-sm text-red-500">{errors.thumbnail}</span>}
                            </div>

                            <div>
                                <Label htmlFor="image">Main High-Res Image (leave empty to keep current)</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setData('image', e.target.files ? e.target.files[0] : null)}
                                    className="mt-1"
                                />
                                {news.image && (
                                    <p className="mt-1 text-xs text-muted-foreground">Current: {news.image}</p>
                                )}
                                {errors.image && <span className="text-sm text-red-500">{errors.image}</span>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tags_input">Tags (comma separated)</Label>
                            <Input
                                id="tags_input"
                                value={data.tags_input}
                                onChange={e => setData('tags_input', e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="published_at">Publish Date/Time</Label>
                                <Input
                                    id="published_at"
                                    type="datetime-local"
                                    value={data.published_at}
                                    onChange={e => setData('published_at', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.published_at && <span className="text-sm text-red-500">{errors.published_at}</span>}
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <Label htmlFor="is_active">Publish Status (Active)</Label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 border-t pt-6">
                            <a href={route('admin.news.index')}>
                                <Button variant="outline" type="button">Cancel</Button>
                            </a>
                            <Button type="submit" disabled={processing} className="bg-[#079C4E] hover:bg-[#068A44]">
                                <Save className="mr-2 h-4 w-4" /> Save Article
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 4: Commit changes**

```bash
git add resources/js/pages/Admin/News/Index.tsx resources/js/pages/Admin/News/Create.tsx resources/js/pages/Admin/News/Edit.tsx
git commit -m "feat: implement news admin dashboard views index, create and edit"
```
