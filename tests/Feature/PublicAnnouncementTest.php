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
