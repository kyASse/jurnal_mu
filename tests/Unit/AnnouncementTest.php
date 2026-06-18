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
