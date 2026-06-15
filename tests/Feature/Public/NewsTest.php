<?php

use App\Models\News;
use App\Models\User;

it('displays active published news and increments views on detail page', function () {
    $author = User::factory()->create();

    // Active published news
    $news = News::create([
        'title' => 'React Setup Seminar',
        'slug' => 'react-setup-seminar',
        'body' => 'React setup detailed tutorial.',
        'author_id' => $author->id,
        'is_active' => true,
        'published_at' => now()->subDay(),
    ]);

    // Inactive news
    News::create([
        'title' => 'Draft News',
        'slug' => 'draft-news',
        'body' => 'Secret news draft.',
        'author_id' => $author->id,
        'is_active' => false,
        'published_at' => now()->subDay(),
    ]);

    // Future news
    News::create([
        'title' => 'Future News',
        'slug' => 'future-news',
        'body' => 'News for next week.',
        'author_id' => $author->id,
        'is_active' => true,
        'published_at' => now()->addWeek(),
    ]);

    // List page check
    $response = $this->get(route('news.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/News/Index')
        ->has('news.data', 1)
        ->where('news.data.0.title', 'React Setup Seminar')
    );

    // Detail page check
    $detailResponse = $this->get(route('news.show', $news->slug));
    $detailResponse->assertOk();
    $detailResponse->assertInertia(fn ($page) => $page
        ->component('Public/News/Show')
        ->where('news.title', 'React Setup Seminar')
    );

    // Verify views incremented
    expect($news->fresh()->views)->toBe(1);
});

it('excludes news with null published_at', function () {
    $author = User::factory()->create();

    $news = News::create([
        'title' => 'Draft News Without Date',
        'slug' => 'draft-news-without-date',
        'body' => 'Should not be visible to public.',
        'author_id' => $author->id,
        'is_active' => true,
        'published_at' => null,
    ]);

    // Index page check - should not display the news
    $response = $this->get(route('news.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/News/Index')
        ->has('news.data', 0)
    );

    // Detail page check - should fail with 404
    $detailResponse = $this->get(route('news.show', $news->slug));
    $detailResponse->assertNotFound();
});
