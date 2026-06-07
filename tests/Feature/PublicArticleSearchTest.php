<?php

use App\Models\Article;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

it('loads the public articles browse page with required properties', function () {
    $university = University::factory()->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true, 'name' => 'Computer Science']);
    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'scientific_field_id' => $field->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'Advanced Machine Learning Search',
        'abstract' => 'This is a test abstract.',
        'authors' => ['Jane Doe', 'John Smith'],
        'keywords' => ['AI', 'Search'],
        'publication_date' => '2026-01-15',
    ]);

    $response = $this->get('/browse/articles');

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/Articles')
        ->has('articles.data', 1)
        ->where('articles.data.0.title', 'Advanced Machine Learning Search')
        ->has('facets.subjects', 1)
        ->where('facets.subjects.0.id', $field->id)
        ->where('facets.subjects.0.count', 1)
        ->has('facets.journals', 1)
        ->where('facets.journals.0.id', $journal->id)
        ->where('facets.journals.0.count', 1)
        ->has('facets.years', 1)
        ->where('facets.years.0.year', 2026)
        ->where('facets.years.0.count', 1)
    );
});

it('searches articles across all fields using scout', function () {
    config(['scout.driver' => 'database']);

    $university = University::factory()->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);
    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'scientific_field_id' => $field->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'Scout Deep Learning Target',
        'abstract' => 'Unrelated abstract content',
        'authors' => ['Author X'],
        'publication_date' => '2026-02-10',
    ]);

    Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'Completely Unrelated Book',
        'abstract' => 'Nothing here',
        'authors' => ['Author Y'],
        'publication_date' => '2026-03-12',
    ]);

    $response = $this->get('/browse/articles?q=Target&field=all');

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->has('articles.data', 1)
        ->where('articles.data.0.title', 'Scout Deep Learning Target')
    );
});

it('filters articles by specific fields', function () {
    $university = University::factory()->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true, 'name' => 'Physics']);
    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'scientific_field_id' => $field->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'Specific Target Title',
        'abstract' => 'Unrelated abstract content',
        'authors' => ['Author One'],
        'publication_date' => '2026-02-10',
    ]);

    Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'Other Title',
        'abstract' => 'Target term in abstract',
        'authors' => ['Author Two'],
        'publication_date' => '2026-03-12',
    ]);

    // Filter by title only
    $response = $this->get('/browse/articles?q=Target&field=title');
    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->has('articles.data', 1)
        ->where('articles.data.0.title', 'Specific Target Title')
    );

    // Filter by abstract only
    $response = $this->get('/browse/articles?q=Target&field=abstract');
    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->has('articles.data', 1)
        ->where('articles.data.0.title', 'Other Title')
    );

    // Filter by author
    $response = $this->get('/browse/articles?q=One&field=author');
    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->has('articles.data', 1)
        ->where('articles.data.0.title', 'Specific Target Title')
    );

    // Filter by subject
    $response = $this->get('/browse/articles?q=Physics&field=subject');
    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->has('articles.data', 2)
    );
});

it('filters articles by sidebar facets', function () {
    $university = University::factory()->create(['is_active' => true]);

    $fieldA = ScientificField::factory()->create(['is_active' => true, 'name' => 'Field A']);
    $fieldB = ScientificField::factory()->create(['is_active' => true, 'name' => 'Field B']);

    $journalA = Journal::factory()->create([
        'university_id' => $university->id,
        'scientific_field_id' => $fieldA->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);
    $journalB = Journal::factory()->create([
        'university_id' => $university->id,
        'scientific_field_id' => $fieldB->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    Article::factory()->create([
        'journal_id' => $journalA->id,
        'title' => 'Article in Journal A',
        'publication_date' => '2025-01-10',
    ]);

    Article::factory()->create([
        'journal_id' => $journalB->id,
        'title' => 'Article in Journal B',
        'publication_date' => '2026-03-20',
    ]);

    // Filter by subject
    $response = $this->get('/browse/articles?subjects[]='.$fieldA->id);
    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->has('articles.data', 1)
        ->where('articles.data.0.title', 'Article in Journal A')
    );

    // Filter by journal
    $response = $this->get('/browse/articles?journals[]='.$journalB->id);
    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->has('articles.data', 1)
        ->where('articles.data.0.title', 'Article in Journal B')
    );

    // Filter by year
    $response = $this->get('/browse/articles?years[]=2025');
    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->has('articles.data', 1)
        ->where('articles.data.0.title', 'Article in Journal A')
    );
});

it('searches articles using multiple keywords in query', function () {
    config(['scout.driver' => 'database']);

    $university = University::factory()->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);
    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'scientific_field_id' => $field->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'Advanced Machine Learning and Deep Neural Networks',
        'abstract' => 'This paper explores advanced algorithms in neural networks.',
        'authors' => ['Jane Doe'],
        'publication_date' => '2026-01-15',
    ]);

    Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'Simple Regression Models',
        'abstract' => 'An introductory text on linear modeling.',
        'authors' => ['John Smith'],
        'publication_date' => '2026-02-15',
    ]);

    // Test with multiple keywords in the search query
    $response = $this->get('/browse/articles?q=Machine Learning&field=all');

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->has('articles.data', 1)
        ->where('articles.data.0.title', 'Advanced Machine Learning and Deep Neural Networks')
    );
});

it('searches articles using non-contiguous multiple words in query', function () {
    config(['scout.driver' => 'database']);

    $university = University::factory()->create(['is_active' => true]);
    $field = ScientificField::factory()->create(['is_active' => true]);
    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'scientific_field_id' => $field->id,
        'is_active' => true,
        'approval_status' => 'approved',
    ]);

    Article::factory()->create([
        'journal_id' => $journal->id,
        'title' => 'Advanced Machine Learning and Deep Neural Networks',
        'abstract' => 'This paper explores advanced algorithms in neural networks.',
        'authors' => ['Jane Doe'],
        'publication_date' => '2026-01-15',
    ]);

    // Test with non-contiguous multiple keywords
    $response = $this->get('/browse/articles?q=Machine Neural&field=all');

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->has('articles.data', 1)
        ->where('articles.data.0.title', 'Advanced Machine Learning and Deep Neural Networks')
    );
});
