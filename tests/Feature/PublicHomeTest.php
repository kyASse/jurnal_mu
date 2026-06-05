<?php

use App\Models\Journal;
use App\Models\University;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia;

it('loads the welcome page with correct inertia components and props', function () {
    // Setup test data
    $university = University::factory()->create(['is_active' => true]);

    // Create SINTA 1 & 2 journals (Featured)
    Journal::factory()->count(2)->create([
        'university_id' => $university->id,
        'sinta_rank' => 'sinta_1',
        'is_active' => true,
    ]);
    Journal::factory()->count(2)->create([
        'university_id' => $university->id,
        'sinta_rank' => 'sinta_2',
        'is_active' => true,
    ]);

    // Non-featured journal
    Journal::factory()->create([
        'university_id' => $university->id,
        'sinta_rank' => 'sinta_3',
        'is_active' => true,
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('welcome')
        ->has('featuredJournals', 4)
        ->has('totalUniversities')
        ->has('totalJournals')
        ->has('totalArticles')
        ->has('scientificFields')
        ->has('recentArticles')
        ->has('topUniversities')
    );
});

it('caches the featured journals output', function () {
    $university = University::factory()->create(['is_active' => true]);
    Journal::factory()->create([
        'university_id' => $university->id,
        'sinta_rank' => 'sinta_1',
        'is_active' => true,
    ]);

    // Initial load builds the cache
    expect(Cache::has('featured_journals_welcome'))->toBeFalse();
    $this->get('/');
    expect(Cache::has('featured_journals_welcome'))->toBeTrue();
});

it('can refresh the featured journals cache via artisan command', function () {
    // Put dummy data into the cache
    Cache::put('featured_journals_welcome', collect(['dummy data']), now()->addDay());
    expect(Cache::get('featured_journals_welcome')->first())->toBe('dummy data');

    // Run the command
    $this->artisan('journals:refresh-featured')
        ->expectsOutput('Refreshing featured journals cache...')
        ->expectsOutput('Featured journals cache refreshed successfully!')
        ->assertExitCode(0);

    // Assert cache was refreshed (dummy data replaced by valid collection)
    expect(Cache::get('featured_journals_welcome')->first())->not->toBe('dummy data');
});

it('caches the recent articles output', function () {
    $university = University::factory()->create(['is_active' => true]);
    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'is_active' => true,
    ]);
    \App\Models\Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'Test Article',
        'publication_date' => now(),
    ]);

    expect(Cache::has('home_recent_articles'))->toBeFalse();
    $this->get('/');
    expect(Cache::has('home_recent_articles'))->toBeTrue();
    expect(Cache::get('home_recent_articles')->first()['title'])->toBe('Test Article');
});

it('caches the top universities output', function () {
    $university = University::factory()->create(['is_active' => true]);
    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    expect(Cache::has('home_top_universities'))->toBeFalse();
    $this->get('/');
    expect(Cache::has('home_top_universities'))->toBeTrue();
    expect(Cache::get('home_top_universities')->first()['name'])->toBe($university->name);
});

