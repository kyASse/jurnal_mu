<?php

use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    $this->superAdminRoleId = Role::where('name', Role::SUPER_ADMIN)->value('id');

    $this->superAdmin = User::factory()->create([
        'role_id' => $this->superAdminRoleId,
        'university_id' => null,
    ]);

    $this->university = University::factory()->create([
        'name' => 'Original University Name',
        'code' => 'ORIG',
        'ptm_code' => 'PTM123',
    ]);
});

it('allows super admin to export universities to xlsx', function () {
    $response = $this->actingAs($this->superAdmin)
        ->get(route('admin.universities.export', 'xlsx'));

    $response->assertStatus(200);

    $contentDisposition = $response->headers->get('content-disposition');
    expect($contentDisposition)->not->toBeNull();
    expect($contentDisposition)->toContain('universities.xlsx');
});

it('allows super admin to export universities to csv', function () {
    $response = $this->actingAs($this->superAdmin)
        ->get(route('admin.universities.export', 'csv'));

    $response->assertStatus(200);

    $contentDisposition = $response->headers->get('content-disposition');
    expect($contentDisposition)->not->toBeNull();
    expect($contentDisposition)->toContain('universities.csv');
    
    expect($response->streamedContent())->toContain('Original University Name');
    expect($response->streamedContent())->toContain('ORIG');
});

it('denies access to export universities for admin kampus', function () {
    $adminKampus = User::factory()->create([
        'role_id' => Role::where('name', Role::ADMIN_KAMPUS)->value('id'),
        'university_id' => $this->university->id,
    ]);

    $response = $this->actingAs($adminKampus)
        ->get(route('admin.universities.export', 'xlsx'));

    $response->assertStatus(403);
});
