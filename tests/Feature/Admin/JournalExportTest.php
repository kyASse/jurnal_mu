<?php

use App\Models\Journal;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->seedRoles();

    $this->superAdmin = User::factory()->superAdmin()->create([
        'is_active' => true,
    ]);

    $this->journal = Journal::factory()->create([
        'title' => 'Original Journal Title',
    ]);
});

it('allows super admin to export journals to xlsx', function () {
    $response = $this->actingAs($this->superAdmin)
        ->get(route('admin.journals.export', 'xlsx'));

    $response->assertStatus(200);

    $contentDisposition = $response->headers->get('content-disposition');
    expect($contentDisposition)->not->toBeNull();
    expect($contentDisposition)->toContain('journals_all.xlsx');
});

it('allows super admin to export journals to csv', function () {
    $response = $this->actingAs($this->superAdmin)
        ->get(route('admin.journals.export', 'csv'));

    $response->assertStatus(200);

    $contentDisposition = $response->headers->get('content-disposition');
    expect($contentDisposition)->not->toBeNull();
    expect($contentDisposition)->toContain('journals_all.csv');
    
    expect($response->streamedContent())->toContain('Original Journal Title');
});

it('denies access to export journals for admin kampus', function () {
    $adminKampus = User::factory()->adminKampus()->create([
        'is_active' => true,
    ]);

    $response = $this->actingAs($adminKampus)
        ->get(route('admin.journals.export', 'xlsx'));

    $response->assertStatus(403);
});
