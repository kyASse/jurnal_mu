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
    $roleId = Role::where('name', Role::USER)->value('id');
    $user = User::factory()->create([
        'university_id' => $this->university->id,
        'role_id' => $roleId,
    ]);

    \App\Models\Journal::factory()->create([
        'university_id' => $this->university->id,
        'user_id' => $user->id,
    ]);

    // Force delete any side-effect universities created by the journal factory
    University::whereNotIn('id', [$this->university->id])->forceDelete();

    $this->university->update([
        'address' => 'Test Address 123',
        'profile_description' => 'Test Profile Description',
    ]);

    $response = $this->actingAs($this->superAdmin)
        ->get(route('admin.universities.export', 'csv'));

    $response->assertStatus(200);

    $contentDisposition = $response->headers->get('content-disposition');
    expect($contentDisposition)->not->toBeNull();
    expect($contentDisposition)->toContain('universities.csv');

    $csvContent = $response->streamedContent();

    expect($csvContent)->toContain('Jumlah Jurnal');
    expect($csvContent)->toContain('Jumlah User');
    expect($csvContent)->toContain('Original University Name');
    expect($csvContent)->toContain('ORIG');

    $lines = explode("\n", str_replace("\r", "", $csvContent));
    $univRow = collect($lines)->first(fn ($line) => str_contains($line, 'Original University Name'));
    expect($univRow)->not->toBeNull();

    $data = str_getcsv($univRow);
    $headerRow = str_getcsv($lines[0]);
    $jurnalIndex = array_search('Jumlah Jurnal', $headerRow);
    $userIndex = array_search('Jumlah User', $headerRow);

    expect($jurnalIndex)->not->toBeFalse();
    expect($userIndex)->not->toBeFalse();

    expect($data[$jurnalIndex])->toBe('1');
    expect($data[$userIndex])->toBe('1');
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
