<?php

use App\Models\City;
use App\Models\Province;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guest or non-admin-kampus cannot access location endpoints', function () {
    $province = Province::create(['name' => 'Jawa Barat']);

    // Guest returns unauthorized
    $this->getJson('/admin-kampus/locations/provinces')->assertStatus(401);
    $this->getJson("/admin-kampus/locations/provinces/{$province->id}/cities")->assertStatus(401);

    // Regular user returns forbidden
    $this->seedRoles();
    $user = User::factory()->user()->create();
    $this->actingAs($user);

    $this->get('/admin-kampus/locations/provinces')->assertStatus(403);
    $this->get("/admin-kampus/locations/provinces/{$province->id}/cities")->assertStatus(403);
});

test('admin-kampus can list provinces ordered by name', function () {
    $this->seedRoles();
    $admin = User::factory()->adminKampus()->create();
    $this->actingAs($admin);

    Province::create(['name' => 'Jawa Timur']);
    Province::create(['name' => 'DKI Jakarta']);
    Province::create(['name' => 'Jawa Barat']);

    $response = $this->getJson('/admin-kampus/locations/provinces');

    $response->assertOk()
        ->assertJsonCount(3)
        ->assertJson([
            ['name' => 'DKI Jakarta'],
            ['name' => 'Jawa Barat'],
            ['name' => 'Jawa Timur']
        ]);
});

test('admin-kampus can list cities of a province ordered by name', function () {
    $this->seedRoles();
    $admin = User::factory()->adminKampus()->create();
    $this->actingAs($admin);

    $province1 = Province::create(['name' => 'Jawa Barat']);
    $province2 = Province::create(['name' => 'Jawa Tengah']);

    City::create(['province_id' => $province1->id, 'name' => 'Bogor']);
    City::create(['province_id' => $province1->id, 'name' => 'Bandung']);
    City::create(['province_id' => $province2->id, 'name' => 'Semarang']);

    $response = $this->getJson("/admin-kampus/locations/provinces/{$province1->id}/cities");

    $response->assertOk()
        ->assertJsonCount(2)
        ->assertJson([
            ['name' => 'Bandung'],
            ['name' => 'Bogor']
        ]);
});

test('returns 404 when province does not exist or has invalid type', function () {
    $this->seedRoles();
    $admin = User::factory()->adminKampus()->create();
    $this->actingAs($admin);

    // Numeric ID that doesn't exist
    $this->getJson('/admin-kampus/locations/provinces/99999/cities')
        ->assertStatus(404);

    // Non-numeric/invalid string ID
    $this->getJson('/admin-kampus/locations/provinces/invalid-string/cities')
        ->assertStatus(404);
});
