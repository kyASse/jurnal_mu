<?php

use App\Models\Article;
use App\Models\Journal;
use App\Models\University;
use Inertia\Testing\AssertableInertia;

it('loads public universities listing successfully with filters', function () {
    $uniA = University::factory()->create([
        'name' => 'Universitas Muhammadiyah A',
        'code' => '051001',
        'is_active' => true,
        'accreditation_status' => 'Unggul',
    ]);
    Journal::factory()->create([
        'university_id' => $uniA->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    $uniB = University::factory()->create([
        'name' => 'Universitas Muhammadiyah B',
        'code' => '051002',
        'is_active' => true,
        'accreditation_status' => 'A',
    ]);
    Journal::factory()->create([
        'university_id' => $uniB->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    // Create a university with NO approved journals (should be filtered out)
    $uniC = University::factory()->create([
        'name' => 'Universitas Muhammadiyah C',
        'code' => '051003',
        'is_active' => true,
        'accreditation_status' => 'B',
    ]);

    // Request listing page
    $response = $this->get(route('browse.universities'));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/Universities')
        ->has('universityStats.data', 2)
        ->has('universities', 2)
        ->has('accreditationOptions')
    );
});

it('loads specific active university profile details successfully', function () {
    $university = University::factory()->create([
        'name' => 'Test University',
        'is_active' => true,
        'accreditation_status' => 'Unggul',
    ]);

    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'title' => 'Test Journal',
        'is_active' => true,
        'approval_status' => 'approved',
        'sinta_rank' => 'sinta_2',
    ]);

    Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'Test Article Title',
        'authors' => ['Author A', 'Author B'],
        'publication_date' => '2026-05-15',
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

it('allows filtering public universities by search, accreditation, and sort', function () {
    $uniA = University::factory()->create([
        'name' => 'Universitas Ahmad Dahlan',
        'code' => 'UAD',
        'is_active' => true,
        'accreditation_status' => 'Unggul',
    ]);
    Journal::factory()->create([
        'university_id' => $uniA->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    $uniB = University::factory()->create([
        'name' => 'Universitas Muhammadiyah Yogyakarta',
        'code' => 'UMY',
        'is_active' => true,
        'accreditation_status' => 'A',
    ]);
    Journal::factory()->create([
        'university_id' => $uniB->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    // Test Search Filter
    $response = $this->get(route('browse.universities', ['search' => 'Ahmad']));
    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/Universities')
        ->has('universityStats.data', 1)
        ->where('universityStats.data.0.code', 'UAD')
    );

    // Test Accreditation Filter
    $response = $this->get(route('browse.universities', ['accreditation' => 'A']));
    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/Universities')
        ->has('universityStats.data', 1)
        ->where('universityStats.data.0.code', 'UMY')
    );
});

it('returns 404 for university profile without approved journals', function () {
    $university = University::factory()->create([
        'name' => 'University Without Approved Journals',
        'is_active' => true,
    ]);

    $response = $this->get(route('browse.universities.show', $university->id));
    $response->assertStatus(404);
});

it('passes correct chartData to public university profile view', function () {
    $university = University::factory()->create([
        'name' => 'Chart Test University',
        'is_active' => true,
    ]);

    $journal1 = Journal::factory()->create([
        'university_id' => $university->id,
        'title' => 'Journal 1',
        'is_active' => true,
        'approval_status' => 'approved',
        'first_published_year' => 2022,
    ]);

    $journal2 = Journal::factory()->create([
        'university_id' => $university->id,
        'title' => 'Journal 2',
        'is_active' => true,
        'approval_status' => 'approved',
        'first_published_year' => null, // fallback to article
    ]);

    Article::factory()->create([
        'journal_id' => $journal2->id,
        'publication_date' => '2024-06-15',
    ]);

    Article::factory()->create([
        'journal_id' => $journal1->id,
        'publication_date' => '2024-08-20',
    ]);

    Article::factory()->create([
        'journal_id' => $journal1->id,
        'publication_date' => '2025-01-10',
    ]);

    $response = $this->get(route('browse.universities.show', $university->id));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/UniversityProfile')
        ->has('chartData')
        ->where('chartData.years', [2022, 2023, 2024, 2025, 2026])
        ->where('chartData.journals', [1, 1, 2, 2, 2])
        ->where('chartData.articles', [0, 0, 2, 1, 0])
    );
});
