<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicArticleSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_articles_browse_page_accessible_and_renders_inertia()
    {
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
        $response->assertInertia(fn ($page) => $page
            ->component('Browse/Articles')
            ->has('articles.data', 1)
            ->where('articles.data.0.title', 'Advanced Machine Learning Search')
            ->has('facets.subjects')
            ->has('facets.journals')
            ->has('facets.years')
        );
    }

    public function test_articles_browse_filters_by_specific_field()
    {
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
        $response->assertInertia(fn ($page) => $page
            ->has('articles.data', 1)
            ->where('articles.data.0.title', 'Specific Target Title')
        );

        // Filter by abstract only
        $response = $this->get('/browse/articles?q=Target&field=abstract');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('articles.data', 1)
            ->where('articles.data.0.title', 'Other Title')
        );
    }
}
