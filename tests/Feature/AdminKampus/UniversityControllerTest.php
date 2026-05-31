<?php

use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    $this->adminKampusRoleId = Role::where('name', Role::ADMIN_KAMPUS)->value('id');

    $this->university = University::factory()->create([
        'name' => 'Original University Name',
        'code' => 'ORIG',
        'ptm_code' => 'PTM123',
        'city' => 'Jakarta',
        'province' => 'DKI Jakarta',
        'logo_url' => null,
    ]);

    $this->adminKampus = clone User::factory()->make([
        'role_id' => $this->adminKampusRoleId,
        'university_id' => $this->university->id,
    ]);
    $this->adminKampus->save();
});

it('allows admin kampus to view their university edit profile page', function () {
    $response = $this->actingAs($this->adminKampus)
        ->get(route('admin-kampus.university.edit'));

    $response->assertStatus(200);
});

it('allows admin kampus to update non-restricted fields directly', function () {
    Storage::fake('public');
    $file = UploadedFile::fake()->create('logo_kampus.png', 100, 'image/png');

    $payload = [
        'short_name' => 'NEW SHORT',
        'profile_description' => 'Updated profile description',
        'website' => 'https://newuniv.ac.id',
        'email' => 'new@univ.ac.id',
        'phone' => '021-9999999',
        'address' => 'Jl. Baru No. 20',
        'city' => 'Bandung',
        'province' => 'Jawa Barat',
        'postal_code' => '40111',
        'accreditation_status' => 'Unggul',
        'cluster' => 'Mandiri',
        'logo_file' => $file,
    ];

    $response = $this->actingAs($this->adminKampus)
        ->put(route('admin-kampus.university.update'), $payload);

    $response->assertRedirect();

    $this->university->refresh();

    // Check directly updated fields
    expect($this->university->short_name)->toBe('NEW SHORT');
    expect($this->university->city)->toBe('Bandung');
    expect($this->university->province)->toBe('Jawa Barat');
    expect($this->university->postal_code)->toBe('40111');
    expect($this->university->accreditation_status)->toBe('Unggul');
    expect($this->university->cluster)->toBe('Mandiri');
    expect($this->university->logo_url)->not->toBeNull();

    // Restricted fields should remain unchanged
    expect($this->university->name)->toBe('Original University Name');
    expect($this->university->code)->toBe('ORIG');
    expect($this->university->ptm_code)->toBe('PTM123');

    // pending_updates should be empty
    expect($this->university->pending_updates)->toBeEmpty();
});

it('puts restricted fields in pending_updates when updated by admin kampus', function () {
    $payload = [
        'name' => 'Proposed University Name',
        'code' => 'PROP',
        'ptm_code' => 'PTM999',
        'short_name' => 'NEW SHORT',
    ];

    $response = $this->actingAs($this->adminKampus)
        ->put(route('admin-kampus.university.update'), $payload);

    $response->assertRedirect();

    $this->university->refresh();

    // Restricted fields should NOT change immediately
    expect($this->university->name)->toBe('Original University Name');
    expect($this->university->code)->toBe('ORIG');
    expect($this->university->ptm_code)->toBe('PTM123');

    // Non-restricted fields should change immediately
    expect($this->university->short_name)->toBe('NEW SHORT');

    // pending_updates should contain the restricted fields changes
    expect($this->university->pending_updates)->toHaveKey('name', 'Proposed University Name');
    expect($this->university->pending_updates)->toHaveKey('code', 'PROP');
    expect($this->university->pending_updates)->toHaveKey('ptm_code', 'PTM999');
});

it('preserves existing pending_updates when updating non-restricted fields', function () {
    // Set initial pending_updates
    $this->university->update([
        'pending_updates' => [
            'name' => 'Proposed University Name',
            'code' => 'PROP',
        ],
    ]);

    // Send payload with the pending values (since frontend initializes form with pending values if they exist)
    $payload = [
        'name' => 'Proposed University Name',
        'code' => 'PROP',
        'short_name' => 'NEW SHORT',
    ];

    $response = $this->actingAs($this->adminKampus)
        ->put(route('admin-kampus.university.update'), $payload);

    $response->assertRedirect();

    $this->university->refresh();

    // Check directly updated fields
    expect($this->university->short_name)->toBe('NEW SHORT');

    // pending_updates should be preserved
    expect($this->university->pending_updates)->toHaveKey('name', 'Proposed University Name');
    expect($this->university->pending_updates)->toHaveKey('code', 'PROP');
});

it('clears pending_updates when restricted fields are changed back to original database values', function () {
    // Set initial pending_updates
    $this->university->update([
        'pending_updates' => [
            'name' => 'Proposed University Name',
        ],
    ]);

    // Send payload where name is changed back to the database value
    $payload = [
        'name' => 'Original University Name',
        'short_name' => 'NEW SHORT',
    ];

    $response = $this->actingAs($this->adminKampus)
        ->put(route('admin-kampus.university.update'), $payload);

    $response->assertRedirect();

    $this->university->refresh();

    // Check directly updated fields
    expect($this->university->short_name)->toBe('NEW SHORT');

    // pending_updates should be empty or null because name was changed back to original
    expect($this->university->pending_updates)->toBeEmpty();
});

it('tracks clearing a restricted field as a pending update of null', function () {
    // Database has ptm_code = 'PTM123'
    // Payload sets ptm_code = null (cleared)
    $payload = [
        'ptm_code' => null,
        'short_name' => 'NEW SHORT',
    ];

    $response = $this->actingAs($this->adminKampus)
        ->put(route('admin-kampus.university.update'), $payload);

    $response->assertRedirect();

    $this->university->refresh();

    // Check directly updated fields
    expect($this->university->short_name)->toBe('NEW SHORT');

    // pending_updates should contain the cleared ptm_code (null value)
    expect($this->university->pending_updates)->toHaveKey('ptm_code', null);
});

it('fails validation when fields exceed database limits', function () {
    $payload = [
        'name' => str_repeat('A', 151), // limit 150
        'short_name' => str_repeat('B', 21), // limit 20
        'ptm_code' => str_repeat('C', 11), // limit 10
        'profile_description' => str_repeat('D', 251), // limit 250
        'phone' => str_repeat('1', 21), // limit 20
    ];

    $response = $this->actingAs($this->adminKampus)
        ->from(route('admin-kampus.university.edit'))
        ->put(route('admin-kampus.university.update'), $payload);

    $response->assertSessionHasErrors([
        'name',
        'short_name',
        'ptm_code',
        'profile_description',
        'phone',
    ]);
});

it('fails validation when accreditation or cluster have invalid values', function () {
    $payload = [
        'accreditation_status' => 'Sangat Luar Biasa', // invalid enum option
        'cluster' => 'Super Unggul', // invalid enum option
    ];

    $response = $this->actingAs($this->adminKampus)
        ->from(route('admin-kampus.university.edit'))
        ->put(route('admin-kampus.university.update'), $payload);

    $response->assertSessionHasErrors([
        'accreditation_status',
        'cluster',
    ]);
});

it('allows updating profile when university has legacy or pending accreditation status', function ($status) {
    $this->university->update([
        'accreditation_status' => $status,
    ]);

    $payload = [
        'short_name' => 'NEW SHORT',
        'accreditation_status' => $status,
    ];

    $response = $this->actingAs($this->adminKampus)
        ->put(route('admin-kampus.university.update'), $payload);

    $response->assertRedirect();
    $this->university->refresh();
    expect($this->university->short_name)->toBe('NEW SHORT');
    expect($this->university->accreditation_status)->toBe($status);
})->with(['A', 'B', 'C', '-', 'Unggul', 'Baik Sekali', 'Baik', 'Cukup']);

