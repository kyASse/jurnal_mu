<?php

use App\Models\News;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(RoleSeeder::class);

    $superAdminRole = Role::where('name', Role::SUPER_ADMIN)->first();
    $this->superAdmin = User::factory()->create(['role_id' => $superAdminRole->id]);

    $userRole = Role::where('name', Role::USER)->first();
    $this->regularUser = User::factory()->create(['role_id' => $userRole->id]);
});

it('restricts regular users from news administration', function () {
    $news = News::factory()->create([
        'author_id' => $this->superAdmin->id,
    ]);

    $this->actingAs($this->regularUser)
        ->get(route('admin.news.index'))
        ->assertForbidden();

    $this->actingAs($this->regularUser)
        ->get(route('admin.news.create'))
        ->assertForbidden();

    $this->actingAs($this->regularUser)
        ->post(route('admin.news.store'), [])
        ->assertForbidden();

    $this->actingAs($this->regularUser)
        ->get(route('admin.news.edit', $news))
        ->assertForbidden();

    $this->actingAs($this->regularUser)
        ->put(route('admin.news.update', $news), [])
        ->assertForbidden();

    $this->actingAs($this->regularUser)
        ->delete(route('admin.news.destroy', $news))
        ->assertForbidden();

    $this->actingAs($this->regularUser)
        ->post(route('admin.news.toggle-active', $news->id))
        ->assertForbidden();
});

it('allows super admin to view news index', function () {
    $this->actingAs($this->superAdmin)
        ->get(route('admin.news.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/News/Index'));
});

it('allows super admin to view news create page', function () {
    $this->actingAs($this->superAdmin)
        ->get(route('admin.news.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/News/Create'));
});

it('allows super admin to create news with thumbnail and image', function () {
    Storage::fake('public');

    $thumbnail = UploadedFile::fake()->create('thumb.png', 100, 'image/png');
    $image = UploadedFile::fake()->create('main.png', 100, 'image/png');

    $response = $this->actingAs($this->superAdmin)
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
    expect($news)->not->toBeNull()
        ->and($news->thumbnail)->not->toBeNull()
        ->and($news->image)->not->toBeNull();

    Storage::disk('public')->assertExists($news->thumbnail);
    Storage::disk('public')->assertExists($news->image);
});

it('allows super admin to edit news details and view edit page', function () {
    $news = News::factory()->create([
        'author_id' => $this->superAdmin->id,
    ]);

    $this->actingAs($this->superAdmin)
        ->get(route('admin.news.edit', $news))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/News/Edit')
            ->where('news.id', $news->id)
        );
});

it('allows super admin to update news and replaces files correctly', function () {
    Storage::fake('public');

    $news = News::factory()->create([
        'author_id' => $this->superAdmin->id,
        'thumbnail' => 'news/thumbnails/old_thumb.png',
        'image' => 'news/images/old_main.png',
    ]);

    // Store fake old files
    Storage::disk('public')->put('news/thumbnails/old_thumb.png', 'old thumbnail content');
    Storage::disk('public')->put('news/images/old_main.png', 'old image content');

    $newThumbnail = UploadedFile::fake()->create('new_thumb.png', 100, 'image/png');
    $newImage = UploadedFile::fake()->create('new_main.png', 100, 'image/png');

    $response = $this->actingAs($this->superAdmin)
        ->put(route('admin.news.update', $news), [
            'title' => 'Updated Title',
            'slug' => 'updated-title',
            'subtitle' => 'Updated subtitle',
            'body' => '<p>Updated rich content</p>',
            'tags' => ['Laravel', 'React'],
            'is_active' => false,
            'published_at' => now()->toDateTimeString(),
            'thumbnail' => $newThumbnail,
            'image' => $newImage,
        ]);

    $response->assertRedirect(route('admin.news.index'));

    $news->refresh();
    expect($news->title)->toBe('Updated Title')
        ->and($news->slug)->toBe('updated-title')
        ->and($news->is_active)->toBeFalse();

    Storage::disk('public')->assertMissing('news/thumbnails/old_thumb.png');
    Storage::disk('public')->assertMissing('news/images/old_main.png');
    Storage::disk('public')->assertExists($news->thumbnail);
    Storage::disk('public')->assertExists($news->image);
});

it('allows super admin to delete news along with stored files', function () {
    Storage::fake('public');

    $news = News::factory()->create([
        'author_id' => $this->superAdmin->id,
        'thumbnail' => 'news/thumbnails/old_thumb.png',
        'image' => 'news/images/old_main.png',
    ]);

    Storage::disk('public')->put('news/thumbnails/old_thumb.png', 'old thumbnail content');
    Storage::disk('public')->put('news/images/old_main.png', 'old image content');

    $response = $this->actingAs($this->superAdmin)
        ->delete(route('admin.news.destroy', $news));

    $response->assertRedirect(route('admin.news.index'));
    $this->assertDatabaseMissing('news', ['id' => $news->id]);

    Storage::disk('public')->assertMissing('news/thumbnails/old_thumb.png');
    Storage::disk('public')->assertMissing('news/images/old_main.png');
});

it('allows super admin to toggle active status', function () {
    $news = News::factory()->create([
        'author_id' => $this->superAdmin->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->superAdmin)
        ->post(route('admin.news.toggle-active', $news->id));

    $response->assertRedirect();
    $news->refresh();
    expect($news->is_active)->toBeFalse();

    $response = $this->actingAs($this->superAdmin)
        ->post(route('admin.news.toggle-active', $news->id));

    $news->refresh();
    expect($news->is_active)->toBeTrue();
});
