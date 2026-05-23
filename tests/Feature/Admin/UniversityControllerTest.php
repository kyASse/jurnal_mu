<?php

use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    $this->superAdminRoleId = Role::where('name', Role::SUPER_ADMIN)->value('id');

    $this->superAdmin = clone User::factory()->make([
        'role_id' => $this->superAdminRoleId,
        'university_id' => null,
    ]);
    $this->superAdmin->save();

    $this->university = University::factory()->create([
        'name' => 'Original University Name',
        'code' => 'ORIG',
        'ptm_code' => 'PTM123',
        'logo_url' => null,
    ]);
});

it('allows super admin to update university details and upload a logo', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('univ_logo.png');

    $payload = [
        'name' => 'Updated University Name',
        'code' => 'UPDATED',
        'ptm_code' => 'PTM789',
        'short_name' => 'UPD',
        'address' => 'Jl. Baru No. 10',
        'city' => 'Bandung',
        'province' => 'Jawa Barat',
        'postal_code' => '40111',
        'phone' => '022-1234567',
        'email' => 'new@univ.ac.id',
        'website' => 'https://newuniv.ac.id',
        'accreditation_status' => 'Unggul',
        'cluster' => 'Mandiri',
        'profile_description' => 'New Description',
        'is_active' => true,
        'logo_file' => $file,
    ];

    $response = $this->actingAs($this->superAdmin)
        ->put(route('admin.universities.update', $this->university->id), $payload);

    $response->assertRedirect(route('admin.universities.index'));

    $this->university->refresh();

    expect($this->university->name)->toBe('Updated University Name');
    expect($this->university->code)->toBe('UPDATED');
    expect($this->university->ptm_code)->toBe('PTM789');
    expect($this->university->short_name)->toBe('UPD');
    expect($this->university->city)->toBe('Bandung');
    expect($this->university->logo_url)->not->toBeNull();
    expect($this->university->logo_url)->toStartWith('/storage/logos/');

    $storedPath = str_replace('/storage/', '', $this->university->logo_url);
    Storage::disk('public')->assertExists($storedPath);
});

it('deletes the old logo file when a new one is uploaded', function () {
    Storage::fake('public');

    // Store a fake file first
    $oldFilePath = Storage::disk('public')->putFile('logos', UploadedFile::fake()->image('old_logo.png'));
    $oldLogoUrl = '/storage/' . $oldFilePath;

    $this->university->update([
        'logo_url' => $oldLogoUrl,
    ]);

    Storage::disk('public')->assertExists($oldFilePath);

    $newFile = UploadedFile::fake()->image('new_logo.png');

    $payload = [
        'name' => $this->university->name,
        'code' => $this->university->code,
        'ptm_code' => $this->university->ptm_code,
        'short_name' => $this->university->short_name,
        'logo_file' => $newFile,
    ];

    $response = $this->actingAs($this->superAdmin)
        ->put(route('admin.universities.update', $this->university->id), $payload);

    $response->assertRedirect();

    $this->university->refresh();
    
    // Assert old file deleted
    Storage::disk('public')->assertMissing($oldFilePath);

    // Assert new file exists
    $newPath = str_replace('/storage/', '', $this->university->logo_url);
    Storage::disk('public')->assertExists($newPath);
});
