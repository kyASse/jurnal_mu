# Announcements Public Page & Management Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a clean announcement feature with a public feed list and detail views, restricted target audience filtering for dashboards, and a Super Admin CRUD management dashboard.

**Architecture:** Create an `Announcement` model and database migration. Write controllers for public views, admin views, and dashboard integration. Build React frontend components using Inertia.js with full accessibility, error handling, and test coverage using Pest.

**Tech Stack:** Laravel, Inertia.js, React, TypeScript, Tailwind CSS, Lucide icons, Pest (testing).

---

## Plan Structure

- **Task 1:** Database Schema, Model & Model Unit Tests
- **Task 2:** Public Controller & Feature Tests (with Access Protection)
- **Task 3:** Admin CRUD Controller & Feature Tests
- **Task 4:** Dashboard Controller Integration & Testing
- **Task 5:** Public React Frontends (Index Feed, Show details)
- **Task 6:** Admin React Frontends (CRUD Pages & Dashboard Widget)

---

### Task 1: Database Schema, Model & Model Unit Tests

**Files:**
- Create: `database/migrations/2026_06_19_000000_create_announcements_table.php`
- Create: `app/Models/Announcement.php`
- Create: `tests/Unit/AnnouncementTest.php`

- [ ] **Step 1: Write a failing unit test for Announcement model casts and scopes**

Create file `tests/Unit/AnnouncementTest.php`:
```php
<?php

use App\Models\Announcement;
use App\Models\User;

it('casts fields correctly and belongs to an author', function () {
    $author = User::factory()->create();
    $announcement = Announcement::create([
        'title' => 'Important Update',
        'slug' => 'important-update',
        'summary' => 'This is a summary text.',
        'body' => 'Full body detail description of the announcement.',
        'attachment_path' => 'announcements/doc.pdf',
        'attachment_name' => 'doc.pdf',
        'target_audience' => 'reviewer',
        'tags' => ['Update', 'Reviewer'],
        'is_pinned' => true,
        'is_active' => true,
        'author_id' => $author->id,
        'published_at' => now(),
    ]);

    expect($announcement->tags)->toBeArray()
        ->and($announcement->tags)->toEqual(['Update', 'Reviewer'])
        ->and($announcement->is_pinned)->toBeTrue()
        ->and($announcement->is_active)->toBeTrue()
        ->and($announcement->author->id)->toBe($author->id);
});

it('applies published and audience scopes correctly', function () {
    $author = User::factory()->create();
    
    // Future announcement
    Announcement::create([
        'title' => 'Future Post',
        'slug' => 'future-post',
        'body' => 'Content',
        'target_audience' => 'public',
        'is_active' => true,
        'author_id' => $author->id,
        'published_at' => now()->addDays(1),
    ]);

    // Active announcement
    $active = Announcement::create([
        'title' => 'Active Post',
        'slug' => 'active-post',
        'body' => 'Content',
        'target_audience' => 'reviewer',
        'is_active' => true,
        'author_id' => $author->id,
        'published_at' => now()->subMinutes(5),
    ]);

    // Inactive announcement
    Announcement::create([
        'title' => 'Inactive Post',
        'slug' => 'inactive-post',
        'body' => 'Content',
        'target_audience' => 'public',
        'is_active' => false,
        'author_id' => $author->id,
        'published_at' => now()->subMinutes(5),
    ]);

    $published = Announcement::published()->get();
    expect($published->count())->toBe(1)
        ->and($published->first()->id)->toBe($active->id);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run command: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Unit/AnnouncementTest.php`
Expected output: FAIL with `Class App\Models\Announcement not found`.

- [ ] **Step 3: Create migration and model**

Create migration file `database/migrations/2026_06_19_000000_create_announcements_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->longText('body');
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->string('target_audience')->default('public');
            $table->json('tags')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('views')->default(0);
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'published_at', 'is_pinned']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
```

Create model file `app/Models/Announcement.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    use HasFactory;

    protected $table = 'announcements';

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'body',
        'attachment_path',
        'attachment_name',
        'target_audience',
        'tags',
        'is_pinned',
        'is_active',
        'views',
        'author_id',
        'published_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_pinned' => 'boolean',
        'is_active' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_active', true)
            ->where('published_at', '<=', now());
    }

    public function scopeForAudience($query, string $audience)
    {
        return $query->where(function ($q) use ($audience) {
            $q->where('target_audience', $audience)
              ->orWhere('target_audience', 'public');
        });
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
```

- [ ] **Step 4: Run migration and verify tests pass**

Run: `docker exec -it jurnal-mu-app php artisan migrate`
Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Unit/AnnouncementTest.php`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add database/migrations/2026_06_19_000000_create_announcements_table.php app/Models/Announcement.php tests/Unit/AnnouncementTest.php
git commit -m "feat: add Announcement model, migration and unit tests"
```

---

### Task 2: Public Controller & Feature Tests (with Access Protection)

**Files:**
- Create: `app/Http/Controllers/PublicAnnouncementController.php`
- Create: `tests/Feature/PublicAnnouncementTest.php`
- Modify: `routes/web.php`

- [ ] **Step 1: Write feature tests for public announcements routes**

Create `tests/Feature/PublicAnnouncementTest.php`:
```php
<?php

use App\Models\Announcement;
use App\Models\User;
use App\Models\Role;

beforeEach(function () {
    $this->author = User::factory()->create();
});

it('lists active public announcements', function () {
    $publicPost = Announcement::create([
        'title' => 'Public Notice',
        'slug' => 'public-notice',
        'body' => 'This is public notice body.',
        'target_audience' => 'public',
        'is_active' => true,
        'author_id' => $this->author->id,
        'published_at' => now(),
    ]);

    $privatePost = Announcement::create([
        'title' => 'Reviewer Notice',
        'slug' => 'reviewer-notice',
        'body' => 'This is reviewer notice body.',
        'target_audience' => 'reviewer',
        'is_active' => true,
        'author_id' => $this->author->id,
        'published_at' => now(),
    ]);

    $response = $this->get(route('announcements.index'));
    $response->assertStatus(200);
    
    $inertiaData = $response->original->getData()['page']['props']['announcements']['data'];
    $titles = collect($inertiaData)->pluck('title');
    
    expect($titles)->toContain('Public Notice')
        ->and($titles)->not->toContain('Reviewer Notice');
});

it('blocks unauthorized access to restricted announcements', function () {
    $reviewerPost = Announcement::create([
        'title' => 'Reviewer Secret Info',
        'slug' => 'reviewer-secret-info',
        'body' => 'Reviewers only content.',
        'target_audience' => 'reviewer',
        'is_active' => true,
        'author_id' => $this->author->id,
        'published_at' => now(),
    ]);

    // Guests blocked
    $response = $this->get(route('announcements.show', 'reviewer-secret-info'));
    $response->assertStatus(403);

    // Regular users blocked
    $roleUser = Role::where('name', Role::USER)->first() ?? Role::create(['name' => Role::USER, 'display_name' => 'User']);
    $user = User::factory()->create(['role_id' => $roleUser->id]);
    
    $response = $this->actingAs($user)->get(route('announcements.show', 'reviewer-secret-info'));
    $response->assertStatus(403);

    // Reviewer allowed
    $roleReviewer = Role::where('name', Role::REVIEWER)->first() ?? Role::create(['name' => Role::REVIEWER, 'display_name' => 'Reviewer']);
    $reviewer = User::factory()->create(['role_id' => $roleReviewer->id]);
    
    $response = $this->actingAs($reviewer)->get(route('announcements.show', 'reviewer-secret-info'));
    $response->assertStatus(200);
});
```

- [ ] **Step 2: Run tests to verify it fails**

Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/PublicAnnouncementTest.php`
Expected: FAIL due to missing controller and routes.

- [ ] **Step 3: Add routes and create PublicAnnouncementController**

Modify `routes/web.php` around line 116 (under public routes section):
```php
// Public access to view announcements
Route::get('/announcements', [App\Http\Controllers\PublicAnnouncementController::class, 'index'])->name('announcements.index');
Route::get('/announcements/{slug}', [App\Http\Controllers\PublicAnnouncementController::class, 'show'])->name('announcements.show');
Route::get('/announcements/{announcement}/download', [App\Http\Controllers\PublicAnnouncementController::class, 'downloadAttachment'])->name('announcements.download');
```

Create file `app/Http/Controllers/PublicAnnouncementController.php`:
```php
<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class PublicAnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $sort = $request->input('sort', 'new');
        $tag = $request->input('tag');

        $query = Announcement::query()->published()->where('target_audience', 'public');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        if ($tag) {
            $query->whereJsonContains('tags', $tag);
        }

        if ($sort === 'old') {
            $query->orderBy('is_pinned', 'desc')->orderBy('published_at', 'asc');
        } elseif ($sort === 'A to Z') {
            $query->orderBy('is_pinned', 'desc')->orderBy('title', 'asc');
        } else {
            $query->orderBy('is_pinned', 'desc')->orderBy('published_at', 'desc');
        }

        $announcements = $query->paginate(6)->withQueryString();

        return Inertia::render('Public/Announcements/Index', [
            'announcements' => $announcements,
            'filters' => $request->only(['search', 'sort', 'tag']),
        ]);
    }

    public function show(string $slug)
    {
        $announcement = Announcement::where('slug', $slug)->firstOrFail();

        $this->authorizeAccess($announcement);

        $announcement->increment('views');

        return Inertia::render('Public/Announcements/Show', [
            'announcement' => $announcement,
        ]);
    }

    public function downloadAttachment(Announcement $announcement)
    {
        $this->authorizeAccess($announcement);

        if (!$announcement->attachment_path || !Storage::exists($announcement->attachment_path)) {
            abort(404, 'File not found');
        }

        return Storage::download($announcement->attachment_path, $announcement->attachment_name);
    }

    private function authorizeAccess(Announcement $announcement): void
    {
        if ($announcement->target_audience === 'public') {
            return;
        }

        $user = auth()->user();
        if (!$user) {
            abort(403, 'Unauthorized access to this announcement.');
        }

        // Super Admin has bypass access
        if ($user->role?->name === Role::SUPER_ADMIN) {
            return;
        }

        $mappedAudience = $this->mapRoleToAudience($user->role?->name);
        if ($announcement->target_audience !== $mappedAudience) {
            abort(403, 'Unauthorized access to this announcement.');
        }
    }

    private function mapRoleToAudience(?string $roleName): string
    {
        return match ($roleName) {
            Role::SUPER_ADMIN => 'super_admin',
            Role::ADMIN_KAMPUS => 'admin_kampus',
            Role::PENGELOLA_JURNAL => 'pengelola_jurnal',
            Role::REVIEWER => 'reviewer',
            Role::USER => 'user',
            default => 'public',
        };
    }
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/PublicAnnouncementTest.php`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add routes/web.php app/Http/Controllers/PublicAnnouncementController.php tests/Feature/PublicAnnouncementTest.php
git commit -m "feat: implement public announcements index and show logic with audience auth check"
```

---

### Task 3: Admin CRUD Controller & Feature Tests

**Files:**
- Create: `app/Http/Controllers/Admin/AnnouncementController.php`
- Create: `tests/Feature/AdminAnnouncementTest.php`
- Modify: `routes/web.php`

- [ ] **Step 1: Write feature tests for Super Admin CRUD operations**

Create `tests/Feature/AdminAnnouncementTest.php`:
```php
<?php

use App\Models\Announcement;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $roleSuperAdmin = Role::where('name', Role::SUPER_ADMIN)->first() ?? Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super Admin']);
    $this->admin = User::factory()->create(['role_id' => $roleSuperAdmin->id]);
    Storage::fake('local');
});

it('allows super admin to create announcement with attachment', function () {
    $file = UploadedFile::fake()->create('document.pdf', 100);

    $response = $this->actingAs($this->admin)->post(route('admin.announcements.store'), [
        'title' => 'Official Announcement',
        'body' => '<p>Announcing some info.</p>',
        'target_audience' => 'public',
        'is_active' => true,
        'is_pinned' => false,
        'tags_input' => 'Policy, Update',
        'published_at' => now()->format('Y-m-d\TH:i'),
        'attachment' => $file,
    ]);

    $response->assertRedirect(route('admin.announcements.index'));
    
    $announcement = Announcement::first();
    expect($announcement->title)->toBe('Official Announcement')
        ->and($announcement->tags)->toEqual(['Policy', 'Update'])
        ->and($announcement->attachment_name)->toBe('document.pdf');
        
    Storage::disk('local')->assertExists($announcement->attachment_path);
});

it('allows super admin to toggle active status', function () {
    $announcement = Announcement::create([
        'title' => 'Test Post',
        'slug' => 'test-post',
        'body' => 'Body',
        'author_id' => $this->admin->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->admin)->post(route('admin.announcements.toggle-active', $announcement->id));
    $response->assertStatus(200);

    expect($announcement->refresh()->is_active)->toBeFalse();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/AdminAnnouncementTest.php`
Expected: FAIL due to missing routes & controller actions.

- [ ] **Step 3: Add admin routes and create Controller**

Modify `routes/web.php` around line 343 (inside Super Admin prefix group):
```php
        // Announcement Management
        Route::resource('announcements', AnnouncementController::class);
        Route::post('announcements/{announcement}/toggle-active', [AnnouncementController::class, 'toggleActive'])->name('announcements.toggle-active');
        Route::post('announcements/{announcement}/toggle-pinned', [AnnouncementController::class, 'togglePinned'])->name('announcements.toggle-pinned');
```
Make sure `use App\Http\Controllers\Admin\AnnouncementController;` is imported at the top of `routes/web.php`.

Create file `app/Http/Controllers/Admin/AnnouncementController.php`:
```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = Announcement::query()->with('author:id,name');

        if ($search) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('target_audience', 'like', "%{$search}%");
        }

        $announcements = $query->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Announcements/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'body' => 'required|string',
            'target_audience' => 'required|string|in:public,user,reviewer,pengelola_jurnal,admin_kampus',
            'tags_input' => 'nullable|string',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,zip,png,jpg,jpeg|max:5120', // 5MB max
        ]);

        $tagsArray = $validated['tags_input']
            ? array_filter(array_map('trim', explode(',', $validated['tags_input'])))
            : [];

        $data = [
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::random(5),
            'summary' => $validated['summary'] ?: $this->makeExcerpt($validated['body']),
            'body' => $validated['body'],
            'target_audience' => $validated['target_audience'],
            'tags' => $tagsArray,
            'is_pinned' => $request->boolean('is_pinned'),
            'is_active' => $request->boolean('is_active'),
            'published_at' => $validated['published_at'] ?: now(),
            'author_id' => auth()->id(),
        ];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('announcements', 'local');
            $data['attachment_path'] = $path;
            $data['attachment_name'] = $file->getClientOriginalName();
        }

        Announcement::create($data);

        return redirect()->route('admin.announcements.index')->with('success', 'Announcement created successfully.');
    }

    public function edit(Announcement $announcement)
    {
        return Inertia::render('Admin/Announcements/Edit', [
            'announcement' => $announcement,
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'body' => 'required|string',
            'target_audience' => 'required|string|in:public,user,reviewer,pengelola_jurnal,admin_kampus',
            'tags_input' => 'nullable|string',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,zip,png,jpg,jpeg|max:5120',
        ]);

        $tagsArray = $validated['tags_input']
            ? array_filter(array_map('trim', explode(',', $validated['tags_input'])))
            : [];

        $announcement->title = $validated['title'];
        $announcement->summary = $validated['summary'] ?: $this->makeExcerpt($validated['body']);
        $announcement->body = $validated['body'];
        $announcement->target_audience = $validated['target_audience'];
        $announcement->tags = $tagsArray;
        $announcement->is_pinned = $request->boolean('is_pinned');
        $announcement->is_active = $request->boolean('is_active');
        $announcement->published_at = $validated['published_at'] ?: $announcement->published_at;

        if ($request->hasFile('attachment')) {
            // Delete old file
            if ($announcement->attachment_path) {
                Storage::delete($announcement->attachment_path);
            }
            $file = $request->file('attachment');
            $path = $file->store('announcements', 'local');
            $announcement->attachment_path = $path;
            $announcement->attachment_name = $file->getClientOriginalName();
        }

        $announcement->save();

        return redirect()->route('admin.announcements.index')->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Announcement $announcement)
    {
        if ($announcement->attachment_path) {
            Storage::delete($announcement->attachment_path);
        }
        $announcement->delete();

        return redirect()->route('admin.announcements.index')->with('success', 'Announcement deleted successfully.');
    }

    public function toggleActive(Announcement $announcement)
    {
        $announcement->is_active = !$announcement->is_active;
        $announcement->save();

        return response()->json(['success' => true, 'is_active' => $announcement->is_active]);
    }

    public function togglePinned(Announcement $announcement)
    {
        $announcement->is_pinned = !$announcement->is_pinned;
        $announcement->save();

        return response()->json(['success' => true, 'is_pinned' => $announcement->is_pinned]);
    }

    private function makeExcerpt(string $body): string
    {
        $plain = strip_tags($body);
        return Str::limit($plain, 150, '...');
    }
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/AdminAnnouncementTest.php`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add routes/web.php app/Http/Controllers/Admin/AnnouncementController.php tests/Feature/AdminAnnouncementTest.php
git commit -m "feat: add admin announcements CRUD controller with attachment support and tests"
```

---

### Task 4: Dashboard Controller Integration & Testing

**Files:**
- Modify: `app/Http/Controllers/DashboardController.php`
- Modify: `tests/Feature/DashboardTest.php` (or verify dashboard functionality via a new test)

- [ ] **Step 1: Write tests for role-restricted announcements on the Dashboard**

Create `tests/Feature/DashboardAnnouncementsTest.php`:
```php
<?php

use App\Models\Announcement;
use App\Models\User;
use App\Models\Role;

it('passes relevant announcements to user dashboard based on role', function () {
    $roleReviewer = Role::where('name', Role::REVIEWER)->first() ?? Role::create(['name' => Role::REVIEWER, 'display_name' => 'Reviewer']);
    $reviewer = User::factory()->create(['role_id' => $roleReviewer->id]);

    $author = User::factory()->create();

    // Announcement for Reviewer
    Announcement::create([
        'title' => 'Reviewer Guidelines',
        'slug' => 'reviewer-guidelines',
        'body' => 'Guide.',
        'target_audience' => 'reviewer',
        'is_active' => true,
        'author_id' => $author->id,
        'published_at' => now(),
    ]);

    // Announcement for Author (User)
    Announcement::create([
        'title' => 'Author Submission Tips',
        'slug' => 'author-submission-tips',
        'body' => 'Tips.',
        'target_audience' => 'user',
        'is_active' => true,
        'author_id' => $author->id,
        'published_at' => now(),
    ]);

    $response = $this->actingAs($reviewer)->get(route('dashboard'));
    $response->assertStatus(200);

    $announcements = $response->original->getData()['page']['props']['announcements'];
    $titles = collect($announcements)->pluck('title');

    expect($titles)->toContain('Reviewer Guidelines')
        ->and($titles)->not->toContain('Author Submission Tips');
});
```

- [ ] **Step 2: Run tests to verify it fails**

Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/DashboardAnnouncementsTest.php`
Expected: FAIL due to missing dashboard prop injection.

- [ ] **Step 3: Modify DashboardController**

Edit `app/Http/Controllers/DashboardController.php` around line 117 (inside the `index` method, before returning Inertia view):
Insert fetching announcements:
```php
        // Fetch announcements matching role
        $mappedAudience = 'public';
        if ($user->role) {
            $mappedAudience = match ($user->role->name) {
                'Super Admin' => 'super_admin',
                'Admin Kampus' => 'admin_kampus',
                'Pengelola Jurnal' => 'pengelola_jurnal',
                'Reviewer' => 'reviewer',
                'User' => 'user',
                default => 'public',
            };
        }

        $announcements = \App\Models\Announcement::query()
            ->published()
            ->where(function ($q) use ($mappedAudience) {
                $q->where('target_audience', $mappedAudience);
                if ($mappedAudience !== 'super_admin') {
                    $q->orWhere('target_audience', 'public');
                }
            })
            ->orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc')
            ->limit(5)
            ->get();
```
Add `'announcements' => $announcements,` to Inertia render parameters.

Let's double check if we need to modify lines 117-121 in `app/Http/Controllers/DashboardController.php`.
```php
        return Inertia::render('dashboard', [
            'stats' => $stats,
            'statistics' => $statistics,
            'announcements' => $announcements,
        ]);
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `docker exec -it jurnal-mu-app ./vendor/bin/pest tests/Feature/DashboardAnnouncementsTest.php`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add app/Http/Controllers/DashboardController.php tests/Feature/DashboardAnnouncementsTest.php
git commit -m "feat: inject role-matched announcements into dashboard view"
```

---

### Task 5: Public React Frontends (Index Feed, Show details)

**Files:**
- Create: `resources/js/pages/Public/Announcements/Index.tsx`
- Create: `resources/js/pages/Public/Announcements/Show.tsx`
- Modify: `resources/js/layouts/public-layout.tsx` (Add navigation links if footer/navbar need it)

- [ ] **Step 1: Create Index Feed view**

Create file `resources/js/pages/Public/Announcements/Index.tsx`:
```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PublicLayout from '@/layouts/public-layout';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, Megaphone, Search, Pin, FileDown } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface AnnouncementItem {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    body: string;
    attachment_name: string | null;
    tags: string[] | null;
    views: number;
    is_pinned: boolean;
    published_at: string;
}

interface PaginatedData {
    data: AnnouncementItem[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    announcements: PaginatedData;
    filters?: { search?: string; sort?: string; tag?: string };
}

export default function Index({ announcements, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [sort, setSort] = useState(filters?.sort || 'new');
    const [activeTag, setActiveTag] = useState(filters?.tag || '');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('announcements.index'), { search, sort, tag: activeTag }, { preserveState: true });
    };

    const handleSortChange = (value: string) => {
        setSort(value);
        router.get(route('announcements.index'), { search, sort: value, tag: activeTag }, { preserveState: true });
    };

    const handleTagClick = (tag: string) => {
        const nextTag = activeTag === tag ? '' : tag;
        setActiveTag(nextTag);
        router.get(route('announcements.index'), { search, sort, tag: nextTag }, { preserveState: true });
    };

    // Extract all unique tags from current data
    const allTags = Array.from(
        new Set(announcements.data.flatMap((item) => item.tags || []))
    );

    return (
        <PublicLayout>
            <Head title="Announcements" />

            {/* Header / Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#079C4E] to-[#10816F] py-16 text-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#FCEE1F] opacity-10 mix-blend-overlay blur-3xl"></div>
                    <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#1A2A75] opacity-20 mix-blend-multiply blur-3xl"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-12 text-center sm:px-6 lg:px-8">
                    <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: '"El Messiri", serif' }}>
                        Official <span className="text-[#FCEE1F]">Announcements</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-emerald-50">
                        Stay updated with call for papers, official notifications, and system updates.
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
                                placeholder="Search announcements by title or content..."
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

                    {allTags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-semibold text-muted-foreground">Filter by tag:</span>
                            {allTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagClick(tag)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                        activeTag === tag
                                            ? 'bg-[#079C4E] border-[#079C4E] text-white'
                                            : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* List Section */}
            <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
                {announcements.data.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-muted/20 py-16 text-center">
                        <Megaphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">No announcements found</h3>
                        <p className="mt-2 text-muted-foreground">Check back later for news and calls for papers.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {announcements.data.map((item) => (
                            <article
                                key={item.id}
                                className={`group relative flex flex-col p-6 rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 ${
                                    item.is_pinned ? 'border-l-4 border-l-[#079C4E] bg-emerald-50/20' : ''
                                }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>
                                            {new Date(item.published_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                        <span>&bull;</span>
                                        <span>{item.views} views</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {item.is_pinned && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                <Pin className="h-3 w-3 fill-current" /> Pinned
                                            </span>
                                        )}
                                        {item.tags && item.tags.map(tag => (
                                            <span key={tag} className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-[#079C4E]">
                                    <a href={route('announcements.show', item.slug)}>{item.title}</a>
                                </h2>

                                <p className="mb-4 text-muted-foreground text-sm leading-relaxed">{item.summary}</p>

                                <div className="flex items-center justify-between border-t pt-4 dark:border-zinc-800">
                                    <a
                                        href={route('announcements.show', item.slug)}
                                        className="inline-flex items-center text-sm font-bold text-[#079C4E] hover:underline"
                                    >
                                        Read Announcement &rarr;
                                    </a>
                                    {item.attachment_name && (
                                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <FileDown className="h-4 w-4 text-emerald-600" /> {item.attachment_name}
                                        </span>
                                    )}
                                </div>
                            </article>
                        ))}
                        
                        {/* Pagination Links */}
                        {announcements.last_page > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                {announcements.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => router.visit(link.url!)}
                                        className={`px-3.5 py-2 rounded-lg text-sm border font-medium transition-all ${
                                            link.active
                                                ? 'bg-[#079C4E] border-[#079C4E] text-white'
                                                : !link.url
                                                  ? 'opacity-40 cursor-not-allowed border-transparent'
                                                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
```

- [ ] **Step 2: Create Detail Show view**

Create file `resources/js/pages/Public/Announcements/Show.tsx`:
```tsx
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Eye, FileDown, Megaphone } from 'lucide-react';

interface AnnouncementItem {
    id: number;
    title: string;
    slug: string;
    body: string;
    attachment_name: string | null;
    tags: string[] | null;
    views: number;
    published_at: string;
}

interface Props {
    announcement: AnnouncementItem;
}

export default function Show({ announcement }: Props) {
    return (
        <PublicLayout>
            <Head title={announcement.title} />

            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Back Link */}
                <div className="mb-6">
                    <a
                        href={route('announcements.index')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#079C4E] hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Announcements
                    </a>
                </div>

                <article className="rounded-2xl border bg-card p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
                    {/* Header */}
                    <div className="border-b pb-6 dark:border-zinc-800">
                        <div className="flex flex-wrap gap-2 mb-3">
                            {announcement.tags && announcement.tags.map((tag) => (
                                <span key={tag} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="font-heading mb-4 text-3xl font-extrabold text-foreground sm:text-4xl">
                            {announcement.title}
                        </h1>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4 text-emerald-600" />
                                {new Date(announcement.published_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4 text-emerald-600" />
                                {announcement.views} views
                            </span>
                        </div>
                    </div>

                    {/* Rich HTML Body */}
                    <div
                        className="prose prose-emerald dark:prose-invert max-w-none py-8 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: announcement.body }}
                    />

                    {/* Attachment Section */}
                    {announcement.attachment_name && (
                        <div className="mt-8 rounded-xl border bg-muted/30 p-5 dark:border-zinc-800">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-emerald-100 p-2.5 dark:bg-emerald-950/40">
                                        <Megaphone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground">Attached Document</h4>
                                        <p className="text-xs text-muted-foreground">{announcement.attachment_name}</p>
                                    </div>
                                </div>
                                <a href={route('announcements.download', announcement.id)} className="block">
                                    <Button className="w-full bg-[#079C4E] hover:bg-[#068A44] font-semibold flex items-center justify-center gap-2">
                                        <FileDown className="h-4 w-4" /> Download Document
                                    </Button>
                                </a>
                            </div>
                        </div>
                    )}
                </article>
            </div>
        </PublicLayout>
    );
}
```

- [ ] **Step 3: Commit changes**

```bash
git add resources/js/pages/Public/Announcements/Index.tsx resources/js/pages/Public/Announcements/Show.tsx
git commit -m "feat: build public announcements index feed and details show page"
```

---

### Task 6: Admin React Frontends (CRUD Pages & Dashboard Widget)

**Files:**
- Create: `resources/js/pages/Admin/Announcements/Index.tsx`
- Create: `resources/js/pages/Admin/Announcements/Create.tsx`
- Create: `resources/js/pages/Admin/Announcements/Edit.tsx`
- Modify: `resources/js/pages/dashboard.tsx`

- [ ] **Step 1: Create Admin index table view**

Create `resources/js/pages/Admin/Announcements/Index.tsx`:
```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { Edit2, Megaphone, Plus, Search, Trash2, Pin, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Announcement Management', href: '/admin/announcements' },
];

interface AnnouncementItem {
    id: number;
    title: string;
    target_audience: string;
    is_pinned: boolean;
    is_active: boolean;
    views: number;
    published_at: string;
}

interface Props {
    announcements: {
        data: AnnouncementItem[];
        links: any[];
    };
    filters?: { search?: string };
}

export default function Index({ announcements, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.announcements.index'), { search }, { preserveState: true });
    };

    const toggleActive = (id: number) => {
        router.post(route('admin.announcements.toggle-active', id), {}, { preserveScroll: true });
    };

    const togglePinned = (id: number) => {
        router.post(route('admin.announcements.toggle-pinned', id), {}, { preserveScroll: true });
    };

    const deleteAnnouncement = (id: number) => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            router.delete(route('admin.announcements.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcement Management" />

            <div className="mx-auto max-w-7xl p-6">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <h2 className="text-2xl font-bold text-foreground">Announcement Management</h2>
                    <Link href={route('admin.announcements.create')}>
                        <Button className="bg-[#079C4E] hover:bg-[#068A44]">
                            <Plus className="mr-2 h-4 w-4" /> Create Announcement
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl border bg-white p-4 dark:bg-neutral-950">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search announcements..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" variant="outline">
                            Search
                        </Button>
                    </form>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-white overflow-hidden dark:bg-neutral-950">
                    {announcements.data.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Megaphone className="mx-auto mb-4 h-12 w-12 opacity-30" />
                            No announcements found.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/40 text-sm font-semibold">
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Audience</th>
                                    <th className="p-4 text-center">Pinned</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4">Publish Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.data.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/10 text-sm">
                                        <td className="p-4 font-medium">{item.title}</td>
                                        <td className="p-4 capitalize">{item.target_audience.replace('_', ' ')}</td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => togglePinned(item.id)} className="focus:outline-none">
                                                <Pin className={`mx-auto h-4 w-4 ${item.is_pinned ? 'text-amber-500 fill-current' : 'text-gray-300 dark:text-zinc-700'}`} />
                                            </button>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => toggleActive(item.id)} className="focus:outline-none">
                                                {item.is_active ? (
                                                    <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
                                                ) : (
                                                    <XCircle className="mx-auto h-5 w-5 text-red-500" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            {new Date(item.published_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('admin.announcements.edit', item.id)}>
                                                    <Button variant="ghost" size="icon">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(item.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 2: Create Create Form view**

Create `resources/js/pages/Admin/Announcements/Create.tsx`:
```tsx
import RichTextEditor from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Announcement Management', href: '/admin/announcements' },
    { title: 'Create', href: '/admin/announcements/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        summary: '',
        body: '',
        target_audience: 'public',
        tags_input: '',
        is_pinned: false,
        is_active: true,
        published_at: '',
        attachment: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.announcements.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Announcement" />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <a href={route('admin.announcements.index')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#079C4E] hover:underline">
                        <ArrowLeft className="h-4 w-4" /> Back to List
                    </a>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-950">
                    <h2 className="mb-6 text-2xl font-bold">Create Announcement</h2>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required className="mt-1" />
                            {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
                        </div>

                        <div>
                            <Label htmlFor="summary">Summary (Optional snippet)</Label>
                            <Textarea id="summary" value={data.summary} onChange={(e) => setData('summary', e.target.value)} placeholder="Short excerpt. Will auto-generate from body if left empty." className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="body">Body Content *</Label>
                            <RichTextEditor value={data.body} onChange={(val) => setData('body', val)} className="mt-1" />
                            {errors.body && <span className="text-sm text-red-500">{errors.body}</span>}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="target_audience">Target Audience *</Label>
                                <select
                                    id="target_audience"
                                    value={data.target_audience}
                                    onChange={(e) => setData('target_audience', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-zinc-200 bg-white p-2 text-sm dark:border-zinc-800 dark:bg-neutral-900"
                                >
                                    <option value="public">Public (Everyone)</option>
                                    <option value="user">Author (Regular User)</option>
                                    <option value="reviewer">Reviewer</option>
                                    <option value="pengelola_jurnal">Pengelola Jurnal</option>
                                    <option value="admin_kampus">Admin Kampus</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="attachment">Document Attachment (PDF/Doc/Zip, max 5MB)</Label>
                                <Input id="attachment" type="file" onChange={(e) => setData('attachment', e.target.files ? e.target.files[0] : null)} className="mt-1" />
                                {errors.attachment && <span className="text-sm text-red-500">{errors.attachment}</span>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tags_input">Tags (comma separated)</Label>
                            <Input id="tags_input" value={data.tags_input} onChange={(e) => setData('tags_input', e.target.value)} placeholder="e.g. Call for Papers, Sinta, Maintenance" className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="published_at">Schedule Publish Date</Label>
                                <Input id="published_at" type="datetime-local" value={data.published_at} onChange={(e) => setData('published_at', e.target.value)} className="mt-1" />
                            </div>

                            <div className="flex items-center gap-6 pt-6">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={data.is_pinned} onChange={(e) => setData('is_pinned', e.target.checked)} className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm">Pin to Top</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm">Published Status (Active)</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 border-t pt-6">
                            <a href={route('admin.announcements.index')}>
                                <Button variant="outline" type="button">Cancel</Button>
                            </a>
                            <Button type="submit" disabled={processing} className="bg-[#079C4E] hover:bg-[#068A44]">
                                <Save className="mr-2 h-4 w-4" /> Save Announcement
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 3: Create Edit Form view**

Create `resources/js/pages/Admin/Announcements/Edit.tsx`:
```tsx
import RichTextEditor from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Announcement Management', href: '/admin/announcements' },
    { title: 'Edit', href: '/admin/announcements/edit' },
];

interface Props {
    announcement: {
        id: number;
        title: string;
        summary: string | null;
        body: string;
        target_audience: string;
        tags: string[] | null;
        is_pinned: boolean;
        is_active: boolean;
        published_at: string | null;
        attachment_name: string | null;
    };
}

export default function Edit({ announcement }: Props) {
    const formatDateTime = (dtStr: string | null) => {
        if (!dtStr) return '';
        const d = new Date(dtStr);
        return d.toISOString().slice(0, 16);
    };

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: announcement.title,
        summary: announcement.summary || '',
        body: announcement.body,
        target_audience: announcement.target_audience,
        tags_input: announcement.tags ? announcement.tags.join(', ') : '',
        is_pinned: announcement.is_pinned,
        is_active: announcement.is_active,
        published_at: formatDateTime(announcement.published_at),
        attachment: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since Laravel has issues with PUT requests containing files, we spoof it via POST with _method
        post(route('admin.announcements.update', announcement.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Announcement" />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <a href={route('admin.announcements.index')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#079C4E] hover:underline">
                        <ArrowLeft className="h-4 w-4" /> Back to List
                    </a>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-950">
                    <h2 className="mb-6 text-2xl font-bold">Edit Announcement</h2>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required className="mt-1" />
                            {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
                        </div>

                        <div>
                            <Label htmlFor="summary">Summary (Optional snippet)</Label>
                            <Textarea id="summary" value={data.summary} onChange={(e) => setData('summary', e.target.value)} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="body">Body Content *</Label>
                            <RichTextEditor value={data.body} onChange={(val) => setData('body', val)} className="mt-1" />
                            {errors.body && <span className="text-sm text-red-500">{errors.body}</span>}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="target_audience">Target Audience *</Label>
                                <select
                                    id="target_audience"
                                    value={data.target_audience}
                                    onChange={(e) => setData('target_audience', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-zinc-200 bg-white p-2 text-sm dark:border-zinc-800 dark:bg-neutral-900"
                                >
                                    <option value="public">Public (Everyone)</option>
                                    <option value="user">Author (Regular User)</option>
                                    <option value="reviewer">Reviewer</option>
                                    <option value="pengelola_jurnal">Pengelola Jurnal</option>
                                    <option value="admin_kampus">Admin Kampus</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="attachment">Document Attachment (Upload to replace. Max 5MB)</Label>
                                <Input id="attachment" type="file" onChange={(e) => setData('attachment', e.target.files ? e.target.files[0] : null)} className="mt-1" />
                                {announcement.attachment_name && (
                                    <span className="text-xs text-muted-foreground block mt-1">Current: {announcement.attachment_name}</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tags_input">Tags (comma separated)</Label>
                            <Input id="tags_input" value={data.tags_input} onChange={(e) => setData('tags_input', e.target.value)} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="published_at">Schedule Publish Date</Label>
                                <Input id="published_at" type="datetime-local" value={data.published_at} onChange={(e) => setData('published_at', e.target.value)} className="mt-1" />
                            </div>

                            <div className="flex items-center gap-6 pt-6">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={data.is_pinned} onChange={(e) => setData('is_pinned', e.target.checked)} className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm">Pin to Top</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm">Published Status (Active)</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 border-t pt-6">
                            <a href={route('admin.announcements.index')}>
                                <Button variant="outline" type="button">Cancel</Button>
                            </a>
                            <Button type="submit" disabled={processing} className="bg-[#079C4E] hover:bg-[#068A44]">
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 4: Update the Dashboard (`dashboard.tsx`) widget**

Add Announcements interface:
```typescript
interface AnnouncementItem {
    id: number;
    title: string;
    slug: string;
    summary: string;
    target_audience: string;
    published_at: string;
    is_pinned: boolean;
}
```

Add `announcements: AnnouncementItem[]` to the `DashboardProps` interface.

Inside `Dashboard` function, render the Announcements widget list on the right sidebar or as a section:
```tsx
                {/* Announcements Widget */}
                {announcements && announcements.length > 0 && (
                    <div className="mt-6 rounded-xl border border-sidebar-border bg-white p-6 dark:bg-neutral-950">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Megaphone className="h-5 w-5 text-emerald-600" />
                                Latest Announcements
                            </h3>
                            <Link href={route('announcements.index')} className="text-xs text-[#079C4E] hover:underline font-semibold">
                                View All
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {announcements.map((item) => (
                                <div key={item.id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0 dark:border-zinc-800">
                                    <div>
                                        <Link href={route('announcements.show', item.slug)} className="font-semibold text-sm hover:text-[#079C4E] block">
                                            {item.is_pinned && <Pin className="inline h-3 w-3 mr-1 text-amber-500 fill-current" />}
                                            {item.title}
                                        </Link>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.summary}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap ml-4">
                                        {new Date(item.published_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
```

- [ ] **Step 5: Commit changes**

```bash
git add resources/js/pages/Admin/Announcements/Index.tsx resources/js/pages/Admin/Announcements/Create.tsx resources/js/pages/Admin/Announcements/Edit.tsx resources/js/pages/dashboard.tsx
git commit -m "feat: complete admin announcements interface, forms and dashboard widget"
```
