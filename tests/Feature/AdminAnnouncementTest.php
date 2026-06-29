<?php

use App\Models\Announcement;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $roleSuperAdmin = Role::where('name', Role::SUPER_ADMIN)->first() ?? Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super Admin']);
    $this->admin = User::factory()->create(['role_id' => $roleSuperAdmin->id, 'is_active' => true]);
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
    $response->assertRedirect();

    expect($announcement->refresh()->is_active)->toBeFalse();
});

it('allows super admin to update announcement and replaces attachment', function () {
    $oldFile = UploadedFile::fake()->create('old_document.pdf', 100);
    $oldPath = $oldFile->store('announcements', 'local');

    $announcement = Announcement::create([
        'title' => 'Old Title',
        'slug' => 'old-title',
        'body' => 'Old Body',
        'target_audience' => 'public',
        'is_active' => true,
        'is_pinned' => false,
        'attachment_path' => $oldPath,
        'attachment_name' => 'old_document.pdf',
        'author_id' => $this->admin->id,
        'published_at' => now(),
    ]);

    Storage::disk('local')->assertExists($oldPath);

    $newFile = UploadedFile::fake()->create('new_document.pdf', 200);

    $response = $this->actingAs($this->admin)->put(route('admin.announcements.update', $announcement->id), [
        'title' => 'New Title',
        'body' => '<p>New Body</p>',
        'target_audience' => 'user',
        'is_active' => true,
        'is_pinned' => true,
        'tags_input' => 'NewTag',
        'attachment' => $newFile,
    ]);

    $response->assertRedirect(route('admin.announcements.index'));

    $announcement->refresh();
    expect($announcement->title)->toBe('New Title')
        ->and($announcement->target_audience)->toBe('user')
        ->and($announcement->is_pinned)->toBeTrue()
        ->and($announcement->tags)->toEqual(['NewTag'])
        ->and($announcement->attachment_name)->toBe('new_document.pdf');

    Storage::disk('local')->assertMissing($oldPath);
    Storage::disk('local')->assertExists($announcement->attachment_path);
});

it('allows super admin to destroy announcement and deletes attachment', function () {
    $file = UploadedFile::fake()->create('to_be_deleted.pdf', 100);
    $path = $file->store('announcements', 'local');

    $announcement = Announcement::create([
        'title' => 'Delete Me',
        'slug' => 'delete-me',
        'body' => 'Body',
        'target_audience' => 'public',
        'attachment_path' => $path,
        'attachment_name' => 'to_be_deleted.pdf',
        'author_id' => $this->admin->id,
    ]);

    Storage::disk('local')->assertExists($path);

    $response = $this->actingAs($this->admin)->delete(route('admin.announcements.destroy', $announcement->id));
    $response->assertRedirect(route('admin.announcements.index'));

    expect(Announcement::find($announcement->id))->toBeNull();
    Storage::disk('local')->assertMissing($path);
});

it('allows super admin to toggle pinned status', function () {
    $announcement = Announcement::create([
        'title' => 'Test Post Pinned',
        'slug' => 'test-post-pinned',
        'body' => 'Body',
        'author_id' => $this->admin->id,
        'is_pinned' => false,
    ]);

    $response = $this->actingAs($this->admin)->post(route('admin.announcements.toggle-pinned', $announcement->id));
    $response->assertRedirect();

    expect($announcement->refresh()->is_pinned)->toBeTrue();
});

it('blocks non-admin users from announcement admin operations', function () {
    $roleUser = Role::where('name', Role::USER)->first() ?? Role::create(['name' => Role::USER, 'display_name' => 'User']);
    $user = User::factory()->create(['role_id' => $roleUser->id, 'is_active' => true]);

    $announcement = Announcement::create([
        'title' => 'Some Post',
        'slug' => 'some-post',
        'body' => 'Body',
        'author_id' => $this->admin->id,
    ]);

    // 1. Try to index
    $response = $this->actingAs($user)->get(route('admin.announcements.index'));
    $response->assertStatus(403);

    // 2. Try to create
    $response = $this->actingAs($user)->post(route('admin.announcements.store'), [
        'title' => 'Illegal Post',
        'body' => 'Body',
        'target_audience' => 'public',
    ]);
    $response->assertStatus(403);

    // 3. Try to toggle active
    $response = $this->actingAs($user)->post(route('admin.announcements.toggle-active', $announcement->id));
    $response->assertStatus(403);

    // 4. Try to destroy
    $response = $this->actingAs($user)->delete(route('admin.announcements.destroy', $announcement->id));
    $response->assertStatus(403);
});

it('allows super admin to update announcement and unset published_at', function () {
    $announcement = Announcement::create([
        'title' => 'Title',
        'slug' => 'title',
        'body' => 'Body',
        'target_audience' => 'public',
        'is_active' => true,
        'is_pinned' => false,
        'author_id' => $this->admin->id,
        'published_at' => now(),
    ]);

    $response = $this->actingAs($this->admin)->put(route('admin.announcements.update', $announcement->id), [
        'title' => 'Updated Title',
        'body' => '<p>Updated Body</p>',
        'target_audience' => 'public',
        'is_active' => true,
        'is_pinned' => false,
        'published_at' => null,
    ]);

    $response->assertRedirect(route('admin.announcements.index'));

    $announcement->refresh();
    expect($announcement->published_at)->toBeNull();
});
