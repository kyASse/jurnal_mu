<?php

use App\Models\Article;
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
        ->has('featuredArticles')
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

it('caches the featured articles output', function () {
    $university = University::factory()->create(['is_active' => true]);
    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);
    Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'Test Article',
        'publication_date' => now(),
    ]);

    expect(Cache::has('home_featured_articles'))->toBeFalse();
    $this->get('/');
    expect(Cache::has('home_featured_articles'))->toBeTrue();
    expect(Cache::get('home_featured_articles')->first()['title'])->toBe('Test Article');
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

it('formats all-caps titles and returns citation fields', function () {
    $university = University::factory()->create(['is_active' => true]);
    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    // Article with ALL-CAPS title
    $articleCaps = Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'ANALISIS PENERAPAN ALGORITMA DAN STRUKTUR DATA PADA WEB',
        'publication_date' => now(),
        'doi' => '10.12345/test.doi.1',
        'volume' => '10',
        'issue' => '2',
        'pages' => '123-130',
        'authors' => ['John Doe', 'Jane Doe'],
        'abstract' => 'This is a test abstract.',
    ]);

    // Article with Mixed-Case title
    $articleMixed = Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'An Analysis of A* Search Algorithm in Gaming',
        'publication_date' => now(),
    ]);

    // Clear cache first to force reload
    Cache::forget('home_featured_articles');

    $this->get('/');

    $cachedArticles = Cache::get('home_featured_articles');

    $cachedCaps = $cachedArticles->firstWhere('id', $articleCaps->id);
    $cachedMixed = $cachedArticles->firstWhere('id', $articleMixed->id);

    // Assert Casing
    expect($cachedCaps['title'])->toBe('Analisis Penerapan Algoritma dan Struktur Data pada Web');
    expect($cachedMixed['title'])->toBe('An Analysis of A* Search Algorithm in Gaming');

    // Assert Extra Fields
    expect($cachedCaps)->toHaveKeys(['authors', 'volume', 'issue', 'pages', 'doi', 'doi_url', 'abstract']);
    expect($cachedCaps['doi'])->toBe('10.12345/test.doi.1');
    expect($cachedCaps['doi_url'])->toBe('https://doi.org/10.12345/test.doi.1');
    expect($cachedCaps['volume'])->toBe('10');
    expect($cachedCaps['issue'])->toBe('2');
    expect($cachedCaps['pages'])->toBe('123-130');
    expect($cachedCaps['authors'])->toBe(['John Doe', 'Jane Doe']);
    expect($cachedCaps['abstract'])->toBe('This is a test abstract.');
});
