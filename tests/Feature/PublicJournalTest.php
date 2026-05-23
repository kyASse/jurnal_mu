<?php

use App\Models\Journal;
use App\Models\University;
use Inertia\Testing\AssertableInertia;

it('loads the public journals index with required statistics properties', function () {
    // Create necessary data
    $university = University::factory()->create(['is_active' => true]);

    Journal::factory()->count(2)->create([
        'university_id' => $university->id,
        'sinta_rank' => 'sinta_2',
        'is_active' => true,
        'indexations' => [
            'Scopus' => ['status' => true],
            'DOAJ' => ['status' => true],
        ],
    ]);

    $response = $this->get(route('journals.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Journals/Index')
        ->has('journals')
        ->has('sintaStats')
        ->has('indexationStats')
        ->has('universities')
        ->has('scientificFields')
        ->has('sintaRanks')
        ->has('indexationOptions')
    );
});

it('filters journals by indexation including names with spaces', function () {
    $university = University::factory()->create(['is_active' => true]);

    // Create one Scopus and one Web of Science journal
    Journal::factory()->create([
        'title' => 'Scopus Journal',
        'university_id' => $university->id,
        'indexations' => ['Scopus' => ['status' => true]],
        'is_active' => true,
    ]);

    Journal::factory()->create([
        'title' => 'WOS Journal',
        'university_id' => $university->id,
        'indexations' => ['Web of Science' => ['status' => true]],
        'is_active' => true,
    ]);

    // Test filtering by 'Web of Science' (has spaces)
    $response = $this->get(route('journals.index', ['indexation' => 'Web of Science']));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Journals/Index')
        ->has('journals.data', 1)
        ->where('journals.data.0.title', 'WOS Journal')
    );

    // Test filtering by 'Scopus'
    $response = $this->get(route('journals.index', ['indexation' => 'Scopus']));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Journals/Index')
        ->has('journals.data', 1)
        ->where('journals.data.0.title', 'Scopus Journal')
    );
});

it('loads the public browse universities page with paginated stats and journals', function () {
    $university = University::factory()->create([
        'name' => 'Universitas Muhammadiyah Yogyakarta',
        'is_active' => true,
        'logo_url' => '/storage/logos/umy.png',
    ]);

    $journal = Journal::factory()->create([
        'title' => 'Journal of Technology',
        'university_id' => $university->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    // Request browse universities page
    $response = $this->get(route('browse.universities'));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/Universities')
        ->has('universityStats.data', 1)
        ->where('universityStats.data.0.name', 'Universitas Muhammadiyah Yogyakarta')
        ->where('universityStats.data.0.logo_url', '/storage/logos/umy.png')
        ->where('universityStats.data.0.journals_count', 1)
        ->where('selectedUniversity', null)
        ->where('journals', null)
    );

    // Request with specific university
    $response = $this->get(route('browse.universities', ['university_id' => $university->id]));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/Universities')
        ->has('universityStats.data', 1)
        ->where('selectedUniversity.name', 'Universitas Muhammadiyah Yogyakarta')
        ->where('selectedUniversity.logo_url', '/storage/logos/umy.png')
        ->has('journals.data', 1)
        ->where('journals.data.0.title', 'Journal of Technology')
    );
});

