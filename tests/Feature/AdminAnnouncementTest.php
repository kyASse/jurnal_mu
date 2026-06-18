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
