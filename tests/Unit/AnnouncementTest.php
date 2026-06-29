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

it('applies audience scope correctly', function () {
    $author = User::factory()->create();

    // Public announcement
    $public = Announcement::create([
        'title' => 'Public Post',
        'slug' => 'public-post',
        'body' => 'Content',
        'target_audience' => 'public',
        'author_id' => $author->id,
    ]);

    // Reviewer announcement
    $reviewer = Announcement::create([
        'title' => 'Reviewer Post',
        'slug' => 'reviewer-post',
        'body' => 'Content',
        'target_audience' => 'reviewer',
        'author_id' => $author->id,
    ]);

    // Other/admin announcement
    $admin = Announcement::create([
        'title' => 'Admin Post',
        'slug' => 'admin-post',
        'body' => 'Content',
        'target_audience' => 'admin',
        'author_id' => $author->id,
    ]);

    $reviewerAudience = Announcement::forAudience('reviewer')->get();
    expect($reviewerAudience->count())->toBe(2)
        ->and($reviewerAudience->pluck('id'))->toContain($public->id, $reviewer->id)
        ->and($reviewerAudience->pluck('id'))->not->toContain($admin->id);
});

it('excludes announcements with null published_at from published scope', function () {
    $author = User::factory()->create();

    Announcement::create([
        'title' => 'Draft Announcement',
        'slug' => 'draft-announcement',
        'body' => 'Draft body',
        'is_active' => true,
        'author_id' => $author->id,
        'published_at' => null,
    ]);

    $published = Announcement::published()->get();
    expect($published->count())->toBe(0);
});

it('can be created using factory', function () {
    $announcement = Announcement::factory()->create();
    expect($announcement)->toBeInstanceOf(Announcement::class)
        ->and($announcement->author)->toBeInstanceOf(User::class);
});
