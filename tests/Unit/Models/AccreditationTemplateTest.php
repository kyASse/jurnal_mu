<?php

use App\Models\AccreditationTemplate;
use App\Models\EvaluationCategory;
use App\Models\EvaluationIndicator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    // Seed basic data
    $this->template = AccreditationTemplate::create([
        'name' => 'BAN-PT 2024 - Akreditasi',
        'description' => 'Template untuk akreditasi BAN-PT',
        'version' => '1.0',
        'type' => 'akreditasi',
        'is_active' => true,
        'effective_date' => now(),
    ]);
});

test('accreditation template can be created', function () {
    expect($this->template)->toBeInstanceOf(AccreditationTemplate::class)
        ->and($this->template->name)->toBe('BAN-PT 2024 - Akreditasi')
        ->and($this->template->type)->toBe('akreditasi')
        ->and($this->template->is_active)->toBeTrue();
});

test('accreditation template has correct fillable attributes', function () {
    $fillable = (new AccreditationTemplate())->getFillable();
    
    expect($fillable)->toContain('name')
        ->and($fillable)->toContain('description')
        ->and($fillable)->toContain('version')
        ->and($fillable)->toContain('type')
        ->and($fillable)->toContain('is_active')
        ->and($fillable)->toContain('effective_date');
});

test('accreditation template has categories relationship', function () {
    $category = $this->template->categories()->create([
        'code' => 'A',
        'name' => 'Visi Misi',
        'weight' => 10.00,
        'display_order' => 1,
    ]);
    
    expect($this->template->categories)->toHaveCount(1)
        ->and($this->template->categories->first())->toBeInstanceOf(EvaluationCategory::class)
        ->and($this->template->categories->first()->name)->toBe('Visi Misi');
});

test('active scope filters only active templates', function () {
    AccreditationTemplate::create([
        'name' => 'Inactive Template',
        'type' => 'indeksasi',
        'is_active' => false,
        'effective_date' => now(),
    ]);
    
    $activeTemplates = AccreditationTemplate::active()->get();
    
    expect($activeTemplates)->toHaveCount(1)
        ->and($activeTemplates->first()->is_active)->toBeTrue();
});

test('by type scope filters templates by type', function () {
    AccreditationTemplate::create([
        'name' => 'Scopus Template',
        'type' => 'indeksasi',
        'is_active' => true,
        'effective_date' => now(),
    ]);
    
    $akreditasiTemplates = AccreditationTemplate::byType('akreditasi')->get();
    $indeksasiTemplates = AccreditationTemplate::byType('indeksasi')->get();
    
    expect($akreditasiTemplates)->toHaveCount(1)
        ->and($indeksasiTemplates)->toHaveCount(1);
});

test('get total weight calculates sum of category weights', function () {
    $this->template->categories()->create([
        'code' => 'A',
        'name' => 'Category A',
        'weight' => 30.00,
        'display_order' => 1,
    ]);
    
    $this->template->categories()->create([
        'code' => 'B',
        'name' => 'Category B',
        'weight' => 40.00,
        'display_order' => 2,
    ]);
    
    expect($this->template->getTotalWeight())->toBe(70.0);
});

test('can be deleted returns false if only active template of type', function () {
    expect($this->template->canBeDeleted())->toBeFalse();
});

test('can be deleted returns true if multiple active templates exist', function () {
    AccreditationTemplate::create([
        'name' => 'BAN-PT 2025',
        'type' => 'akreditasi',
        'is_active' => true,
        'effective_date' => now(),
    ]);
    
    expect($this->template->canBeDeleted())->toBeTrue();
});

test('clone template creates deep copy', function () {
    $category = $this->template->categories()->create([
        'code' => 'A',
        'name' => 'Original Category',
        'weight' => 50.00,
        'display_order' => 1,
    ]);
    
    $clone = $this->template->cloneTemplate('Cloned Template');
    
    expect($clone)->toBeInstanceOf(AccreditationTemplate::class)
        ->and($clone->name)->toBe('Cloned Template')
        ->and($clone->is_active)->toBeFalse()
        ->and($clone->id)->not->toBe($this->template->id)
        ->and($clone->categories)->toHaveCount(1)
        ->and($clone->categories->first()->name)->toBe('Original Category');
});

test('soft delete works correctly', function () {
    $id = $this->template->id;
    $this->template->delete();
    
    expect(AccreditationTemplate::find($id))->toBeNull()
        ->and(AccreditationTemplate::withTrashed()->find($id))->not->toBeNull();
});
