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

    $file = UploadedFile::fake()->create('univ_logo.png', 100, 'image/png');

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
    $oldFilePath = Storage::disk('public')->putFile('logos', UploadedFile::fake()->create('old_logo.png', 100, 'image/png'));
    $oldLogoUrl = '/storage/'.$oldFilePath;

    $this->university->update([
        'logo_url' => $oldLogoUrl,
    ]);

    Storage::disk('public')->assertExists($oldFilePath);

    $newFile = UploadedFile::fake()->create('new_logo.png', 100, 'image/png');

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

it('allows super admin to approve pending university updates', function () {
    $this->university->update([
        'pending_updates' => [
            'name' => 'Pending Approved Name',
            'code' => 'PAPP',
            'ptm_code' => 'PTM999',
        ],
    ]);

    $response = $this->actingAs($this->superAdmin)
        ->post(route('admin.universities.handle-pending-updates', $this->university->id), [
            'action' => 'approve',
        ]);

    $response->assertRedirect();
    $this->university->refresh();

    expect($this->university->name)->toBe('Pending Approved Name');
    expect($this->university->code)->toBe('PAPP');
    expect($this->university->ptm_code)->toBe('PTM999');
    expect($this->university->pending_updates)->toBeNull();
});

it('allows super admin to reject pending university updates', function () {
    $this->university->update([
        'pending_updates' => [
            'name' => 'Pending Rejected Name',
            'code' => 'PREJ',
            'ptm_code' => 'PTM888',
        ],
    ]);

    $response = $this->actingAs($this->superAdmin)
        ->post(route('admin.universities.handle-pending-updates', $this->university->id), [
            'action' => 'reject',
        ]);

    $response->assertRedirect();
    $this->university->refresh();

    expect($this->university->name)->toBe('Original University Name');
    expect($this->university->code)->toBe('ORIG');
    expect($this->university->ptm_code)->toBe('PTM123');
    expect($this->university->pending_updates)->toBeNull();
});

it('passes pending universities list to super admin', function () {
    $this->university->update([
        'pending_updates' => [
            'name' => 'Pending Name',
        ],
    ]);

    $response = $this->actingAs($this->superAdmin)
        ->get(route('admin.universities.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->has('pendingUniversities', 1)
    );
});

it('does not allow non-super admins to access universities index', function () {
    $nonSuperAdmin = User::factory()->create([
        'role_id' => Role::where('name', Role::ADMIN_KAMPUS)->value('id'),
        'university_id' => $this->university->id,
    ]);

    $response = $this->actingAs($nonSuperAdmin)
        ->get(route('admin.universities.index'));

    $response->assertStatus(403);
});

it('allows sorting by name_desc, users_desc, and journals_desc', function () {
    // Clean up
    \App\Models\Journal::query()->delete();
    User::where('id', '!=', $this->superAdmin->id)->delete();
    University::query()->delete();

    $roleId = Role::where('name', Role::USER)->value('id');

    // Create 3 universities
    $univA = University::factory()->create(['name' => 'A University']);
    $univB = University::factory()->create(['name' => 'B University']);
    $univC = University::factory()->create(['name' => 'C University']);

    // Users: A=3, B=1, C=2
    $usersA = User::factory()->count(3)->create(['university_id' => $univA->id, 'role_id' => $roleId]);
    $usersB = User::factory()->count(1)->create(['university_id' => $univB->id, 'role_id' => $roleId]);
    $usersC = User::factory()->count(2)->create(['university_id' => $univC->id, 'role_id' => $roleId]);

    // Journals: A=1, B=3, C=2
    \App\Models\Journal::factory()->count(1)->create(['university_id' => $univA->id, 'user_id' => $usersA->first()->id]);
    \App\Models\Journal::factory()->count(3)->create(['university_id' => $univB->id, 'user_id' => $usersB->first()->id]);
    \App\Models\Journal::factory()->count(2)->create(['university_id' => $univC->id, 'user_id' => $usersC->first()->id]);

    // Force delete side-effect universities and users created by factories
    University::whereNotIn('id', [$univA->id, $univB->id, $univC->id])->forceDelete();
    User::whereNotIn('id', [$this->superAdmin->id])
        ->whereNotIn('university_id', [$univA->id, $univB->id, $univC->id])
        ->forceDelete();

    // Test sort = name_desc (C, B, A)
    $response = $this->actingAs($this->superAdmin)
        ->get(route('admin.universities.index', ['sort' => 'name_desc']));
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->where('universities.data.0.id', $univC->id)
        ->where('universities.data.1.id', $univB->id)
        ->where('universities.data.2.id', $univA->id)
    );



    // Test sort = users_desc (A, C, B)
    $response = $this->actingAs($this->superAdmin)
        ->get(route('admin.universities.index', ['sort' => 'users_desc']));
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->where('universities.data.0.id', $univA->id)
        ->where('universities.data.1.id', $univC->id)
        ->where('universities.data.2.id', $univB->id)
    );

    // Test sort = journals_desc (B, C, A)
    $response = $this->actingAs($this->superAdmin)
        ->get(route('admin.universities.index', ['sort' => 'journals_desc']));
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->where('universities.data.0.id', $univB->id)
        ->where('universities.data.1.id', $univC->id)
        ->where('universities.data.2.id', $univA->id)
    );
});

