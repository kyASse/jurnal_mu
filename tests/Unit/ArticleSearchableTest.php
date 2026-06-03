<?php

namespace Tests\Unit;

use App\Models\Article;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleSearchableTest extends TestCase
{
    use RefreshDatabase;

    public function test_to_searchable_array_returns_correct_keys_for_database_driver()
    {
        config(['scout.driver' => 'database']);
        
        $university = University::factory()->create();
        $field = ScientificField::factory()->create(['name' => 'Computer Science']);
        $journal = Journal::factory()->create([
            'university_id' => $university->id,
            'scientific_field_id' => $field->id,
        ]);
        
        $article = Article::factory()->create([
            'journal_id' => $journal->id,
            'title' => 'Test Article Title',
            'abstract' => 'Test Abstract',
            'authors' => ['Author A'],
            'keywords' => ['AI'],
        ]);

        $searchableArray = $article->toSearchableArray();

        $this->assertArrayHasKey('id', $searchableArray);
        $this->assertArrayHasKey('title', $searchableArray);
        $this->assertArrayHasKey('abstract', $searchableArray);
        $this->assertArrayHasKey('authors', $searchableArray);
        $this->assertArrayHasKey('keywords', $searchableArray);
        
        $this->assertArrayNotHasKey('journal_title', $searchableArray);
        $this->assertArrayNotHasKey('scientific_field_name', $searchableArray);
    }
}
