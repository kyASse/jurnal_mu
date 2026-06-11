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
