<?php

use App\Models\University;
use App\Models\Journal;
use App\Models\Article;
use Inertia\Testing\AssertableInertia;

it('loads public universities listing successfully with filters', function () {
    University::factory()->create([
        'name' => 'Universitas Muhammadiyah A',
        'code' => '051001',
        'is_active' => true,
        'accreditation_status' => 'Unggul'
    ]);

    University::factory()->create([
        'name' => 'Universitas Muhammadiyah B',
        'code' => '051002',
        'is_active' => true,
        'accreditation_status' => 'A'
    ]);

    // Request listing page
    $response = $this->get(route('browse.universities'));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/Universities')
        ->has('universities.data', 2)
        ->has('accreditationOptions')
    );
});

it('loads specific active university profile details successfully', function () {
    $university = University::factory()->create([
        'name' => 'Test University',
        'is_active' => true,
        'accreditation_status' => 'Unggul'
    ]);

    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'title' => 'Test Journal',
        'is_active' => true,
        'approval_status' => 'approved',
        'sinta_rank' => 'sinta_2'
    ]);

    Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'Test Article Title',
        'authors' => ['Author A', 'Author B'],
        'publication_date' => '2026-05-15'
    ]);

    $response = $this->get(route('browse.universities.show', $university->id));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/UniversityProfile')
        ->where('university.name', 'Test University')
        ->where('stats.total_journals', 1)
        ->where('stats.total_articles', 1)
        ->has('articles.data', 1)
    );
});
