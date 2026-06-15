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

it('does not allow views to be mass assigned', function () {
    $author = User::factory()->create();
    $news = News::create([
        'title' => 'Test News Title',
        'slug' => 'test-news-title-2',
        'subtitle' => 'Test News Subtitle',
        'body' => 'Test body paragraph.',
        'author_id' => $author->id,
        'views' => 100,
    ]);

    expect($news->refresh()->views)->toBe(0);
});
