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

    public function test_to_searchable_array_returns_all_keys_for_non_database_driver()
    {
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

        config(['scout.driver' => 'algolia']); // or any non-database driver
        
        $searchableArray = $article->toSearchableArray();

        $this->assertArrayHasKey('id', $searchableArray);
        $this->assertArrayHasKey('title', $searchableArray);
        $this->assertArrayHasKey('abstract', $searchableArray);
        $this->assertArrayHasKey('authors', $searchableArray);
        $this->assertArrayHasKey('keywords', $searchableArray);
        
        $this->assertArrayHasKey('journal_title', $searchableArray);
        $this->assertArrayHasKey('scientific_field_name', $searchableArray);
        
        $this->assertEquals($journal->title, $searchableArray['journal_title']);
        $this->assertEquals($field->name, $searchableArray['scientific_field_name']);
    }

    public function test_title_accessor_formats_uppercase_title_to_title_case()
    {
        $article1 = Article::factory()->make([
            'title' => 'DEEP LEARNING MODELS FOR TRAFFIC SIGN RECOGNITION',
        ]);
        
        $article2 = Article::factory()->make([
            'title' => 'Deep Learning Models for Traffic Sign Recognition',
        ]);

        $this->assertEquals('Deep Learning Models For Traffic Sign Recognition', $article1->title);
        $this->assertEquals('Deep Learning Models for Traffic Sign Recognition', $article2->title);
    }
}

