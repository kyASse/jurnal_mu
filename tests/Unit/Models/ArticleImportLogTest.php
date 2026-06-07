<?php

use App\Models\ArticleImportLog;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seedRoles();

    // Create test university, user, and scientific field for journal creation
    $this->university = University::factory()->create(['name' => 'Test University']);
    $this->user = User::factory()->user()->create(['university_id' => $this->university->id]);
    $this->scientificField = ScientificField::factory()->create(['name' => 'Test Field']);

    $this->journal = Journal::factory()->create([
        'user_id' => $this->user->id,
        'university_id' => $this->university->id,
        'scientific_field_id' => $this->scientificField->id,
    ]);
});

test('article import log can be created and has correct fillable attributes', function () {
    ArticleImportLog::reguard();

    $log = new ArticleImportLog;
    $log->fill([
        'journal_id' => $this->journal->id,
        'filename' => 'articles.xml',
        'duplicate_strategy' => 'skip',
        'records_found' => 10,
        'records_imported' => 8,
        'records_updated' => 2,
        'status' => 'success',
        'error_message' => 'Some error',
        'extra_field' => 'should be ignored',
    ]);
    $log->save();

    expect($log)->toBeInstanceOf(ArticleImportLog::class)
        ->and($log->journal_id)->toBe($this->journal->id)
        ->and($log->filename)->toBe('articles.xml')
        ->and($log->duplicate_strategy)->toBe('skip')
        ->and($log->records_found)->toBe(10)
        ->and($log->records_imported)->toBe(8)
        ->and($log->records_updated)->toBe(2)
        ->and($log->status)->toBe('success')
        ->and($log->error_message)->toBe('Some error')
        ->and($log->extra_field)->toBeNull();
});

test('article import log belongs to journal relationship', function () {
    $log = ArticleImportLog::create([
        'journal_id' => $this->journal->id,
        'filename' => 'import.xml',
        'duplicate_strategy' => 'update',
        'records_found' => 5,
        'records_imported' => 5,
        'records_updated' => 0,
        'status' => 'success',
    ]);

    expect($log->journal)->toBeInstanceOf(Journal::class)
        ->and($log->journal->id)->toBe($this->journal->id);
});

test('journal has many article import logs relationship ordered by created_at desc', function () {
    $log1 = ArticleImportLog::create([
        'journal_id' => $this->journal->id,
        'filename' => 'old_import.xml',
        'duplicate_strategy' => 'skip',
        'status' => 'success',
    ]);
    $log1->created_at = now()->subDays(2);
    $log1->save();

    $log2 = ArticleImportLog::create([
        'journal_id' => $this->journal->id,
        'filename' => 'new_import.xml',
        'duplicate_strategy' => 'skip',
        'status' => 'success',
    ]);
    $log2->created_at = now();
    $log2->save();

    $logs = $this->journal->articleImportLogs;

    expect($logs)->toHaveCount(2)
        ->and($logs->first()->id)->toBe($log2->id)
        ->and($logs->last()->id)->toBe($log1->id);
});
