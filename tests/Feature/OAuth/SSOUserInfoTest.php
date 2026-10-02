<?php

use App\Models\Role;
use App\Models\User;
use Laravel\Passport\Passport;

test('unauthenticated request to sso user info is rejected', function () {
    $response = $this->getJson('/api/sso/user');
    $response->assertStatus(401);
});

test('authenticated request with passport token returns formatted profile', function () {
    $user = User::factory()->create([
        'name' => 'Dr. Dahlan',
        'email' => 'dahlan@ptma.ac.id',
        'approval_status' => 'approved',
    ]);

    $role = Role::firstOrCreate(
        ['name' => 'Author'],
        ['display_name' => 'Author', 'description' => 'Author role']
    );
    $user->roles()->attach($role->id, ['assigned_at' => now()]);

    Passport::actingAs($user, ['*'], 'api');

    $response = $this->getJson('/api/sso/user');

    $response->assertStatus(200)
        ->assertJson([
            'id' => $user->id,
            'name' => 'Dr. Dahlan',
            'email' => 'dahlan@ptma.ac.id',
            'status' => 'approved',
        ])
        ->assertJsonStructure([
            'id',
            'name',
            'email',
            'status',
            'roles',
            'primary_role',
            'affiliation',
        ]);
});
