<?php

use App\Models\Announcement;
use App\Models\User;
use App\Models\Role;

it('passes relevant announcements to user dashboard based on multi-role mapping', function () {
    $roleReviewer = Role::where('name', Role::REVIEWER)->first() ?? Role::create(['name' => Role::REVIEWER, 'display_name' => 'Reviewer']);
    $roleUser = Role::where('name', Role::USER)->first() ?? Role::create(['name' => Role::USER, 'display_name' => 'User']);
    
    $user = User::factory()->create();
    // Sync multiple roles
    $user->roles()->sync([$roleReviewer->id, $roleUser->id]);

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

    // Announcement for Admin Kampus
    Announcement::create([
        'title' => 'Kampus Admin Alert',
        'slug' => 'kampus-admin-alert',
        'body' => 'Alert.',
        'target_audience' => 'admin_kampus',
        'is_active' => true,
        'author_id' => $author->id,
        'published_at' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));
    $response->assertStatus(200);

    $announcements = $response->original->getData()['page']['props']['announcements'];
    $titles = collect($announcements)->pluck('title');

    expect($titles)->toContain('Reviewer Guidelines')
        ->and($titles)->toContain('Author Submission Tips')
        ->and($titles)->not->toContain('Kampus Admin Alert');
});
