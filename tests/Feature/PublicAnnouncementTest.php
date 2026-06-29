<?php

use App\Models\Announcement;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

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

it('shows targeted announcements to logged in users based on their active roles', function () {
    $publicPost = Announcement::create([
        'title' => 'Public Notice',
        'slug' => 'public-notice',
        'body' => 'Public content.',
        'target_audience' => 'public',
        'is_active' => true,
        'author_id' => $this->author->id,
        'published_at' => now(),
    ]);

    $reviewerPost = Announcement::create([
        'title' => 'Reviewer Notice',
        'slug' => 'reviewer-notice',
        'body' => 'Reviewer content.',
        'target_audience' => 'reviewer',
        'is_active' => true,
        'author_id' => $this->author->id,
        'published_at' => now(),
    ]);

    $adminPost = Announcement::create([
        'title' => 'Admin Notice',
        'slug' => 'admin-notice',
        'body' => 'Admin content.',
        'target_audience' => 'admin_kampus',
        'is_active' => true,
        'author_id' => $this->author->id,
        'published_at' => now(),
    ]);

    // Guest sees only public notice
    $response = $this->get(route('announcements.index'));
    $response->assertStatus(200);
    $titles = collect($response->original->getData()['page']['props']['announcements']['data'])->pluck('title');
    expect($titles)->toContain('Public Notice')
        ->and($titles)->not->toContain('Reviewer Notice')
        ->and($titles)->not->toContain('Admin Notice');

    // Reviewer sees public + reviewer notice
    $roleReviewer = Role::where('name', Role::REVIEWER)->first() ?? Role::create(['name' => Role::REVIEWER, 'display_name' => 'Reviewer']);
    $reviewer = User::factory()->create(['role_id' => $roleReviewer->id]);

    $response = $this->actingAs($reviewer)->get(route('announcements.index'));
    $titles = collect($response->original->getData()['page']['props']['announcements']['data'])->pluck('title');
    expect($titles)->toContain('Public Notice')
        ->and($titles)->toContain('Reviewer Notice')
        ->and($titles)->not->toContain('Admin Notice');

    // Multi-role user (Reviewer + Admin Kampus) sees all
    $roleAdminKampus = Role::where('name', Role::ADMIN_KAMPUS)->first() ?? Role::create(['name' => Role::ADMIN_KAMPUS, 'display_name' => 'Admin Kampus']);
    $reviewer->roles()->attach($roleAdminKampus->id, ['assigned_at' => now()]);

    $response = $this->actingAs($reviewer)->get(route('announcements.index'));
    $titles = collect($response->original->getData()['page']['props']['announcements']['data'])->pluck('title');
    expect($titles)->toContain('Public Notice')
        ->and($titles)->toContain('Reviewer Notice')
        ->and($titles)->toContain('Admin Notice');
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

it('supports multi-role access verification', function () {
    $reviewerPost = Announcement::create([
        'title' => 'Reviewer Notice',
        'slug' => 'reviewer-notice',
        'body' => 'Reviewer info.',
        'target_audience' => 'reviewer',
        'is_active' => true,
        'author_id' => $this->author->id,
        'published_at' => now(),
    ]);

    $adminPost = Announcement::create([
        'title' => 'Admin Kampus Notice',
        'slug' => 'admin-kampus-notice',
        'body' => 'Admin Kampus info.',
        'target_audience' => 'admin_kampus',
        'is_active' => true,
        'author_id' => $this->author->id,
        'published_at' => now(),
    ]);

    $roleUser = Role::where('name', Role::USER)->first() ?? Role::create(['name' => Role::USER, 'display_name' => 'User']);
    $roleReviewer = Role::where('name', Role::REVIEWER)->first() ?? Role::create(['name' => Role::REVIEWER, 'display_name' => 'Reviewer']);
    $roleAdminKampus = Role::where('name', Role::ADMIN_KAMPUS)->first() ?? Role::create(['name' => Role::ADMIN_KAMPUS, 'display_name' => 'Admin Kampus']);

    $user = User::factory()->create(['role_id' => $roleUser->id]);

    // Initially, user cannot access reviewer or admin announcements
    $this->actingAs($user)->get(route('announcements.show', 'reviewer-notice'))->assertStatus(403);
    $this->actingAs($user)->get(route('announcements.show', 'admin-kampus-notice'))->assertStatus(403);

    // Assign reviewer role via user_roles relation
    $user->roles()->attach($roleReviewer->id, ['assigned_at' => now()]);

    // User can now access reviewer notice, but still blocked from admin notice
    $this->actingAs($user)->get(route('announcements.show', 'reviewer-notice'))->assertStatus(200);
    $this->actingAs($user)->get(route('announcements.show', 'admin-kampus-notice'))->assertStatus(403);

    // Assign admin_kampus role as well (multi-role)
    $user->roles()->attach($roleAdminKampus->id, ['assigned_at' => now()]);

    // User can now access both
    $this->actingAs($user)->get(route('announcements.show', 'reviewer-notice'))->assertStatus(200);
    $this->actingAs($user)->get(route('announcements.show', 'admin-kampus-notice'))->assertStatus(200);
});

it('allows authorized users to download attachment and blocks unauthorized', function () {
    Storage::fake('local');

    // Create attachment file
    $filePath = 'announcements/test-file.pdf';
    Storage::disk('local')->put($filePath, 'dummy content');

    $reviewerPost = Announcement::create([
        'title' => 'Reviewer Guide',
        'slug' => 'reviewer-guide',
        'body' => 'Reviewers only content.',
        'target_audience' => 'reviewer',
        'is_active' => true,
        'author_id' => $this->author->id,
        'published_at' => now(),
        'attachment_path' => $filePath,
        'attachment_name' => 'guide.pdf',
    ]);

    // Guest blocked
    $response = $this->get(route('announcements.download', $reviewerPost->id));
    $response->assertStatus(403);

    // Regular user blocked
    $roleUser = Role::where('name', Role::USER)->first() ?? Role::create(['name' => Role::USER, 'display_name' => 'User']);
    $user = User::factory()->create(['role_id' => $roleUser->id]);
    $response = $this->actingAs($user)->get(route('announcements.download', $reviewerPost->id));
    $response->assertStatus(403);

    // Reviewer allowed
    $roleReviewer = Role::where('name', Role::REVIEWER)->first() ?? Role::create(['name' => Role::REVIEWER, 'display_name' => 'Reviewer']);
    $reviewer = User::factory()->create(['role_id' => $roleReviewer->id]);
    $response = $this->actingAs($reviewer)->get(route('announcements.download', $reviewerPost->id));
    $response->assertStatus(200);

    $response->assertHeader('Content-Disposition', 'attachment; filename=guide.pdf');
});
