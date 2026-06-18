<?php

namespace Tests\Feature\User;

use App\Models\Role;
use App\Models\User;
use App\Models\University;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure roles exist
        Role::updateOrCreate(['name' => Role::USER], ['display_name' => 'User']);
        Role::updateOrCreate(['name' => Role::ADMIN_KAMPUS], ['display_name' => 'Admin Kampus']);
        Role::updateOrCreate(['name' => Role::REVIEWER], ['display_name' => 'Reviewer']);
    }

    public function test_user_creation_syncs_primary_role_to_pivot()
    {
        $role = Role::where('name', Role::USER)->first();
        $university = University::factory()->create();

        $user = User::create([
            'name' => 'Test User',
            'email' => 'sync-test@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        $this->assertTrue($user->roles()->where('role_id', $role->id)->exists());
    }

    public function test_updating_user_role_id_updates_pivot()
    {
        $roleUser = Role::where('name', Role::USER)->first();
        $roleAdmin = Role::where('name', Role::ADMIN_KAMPUS)->first();
        $university = University::factory()->create();

        $user = User::create([
            'name' => 'Test User 2',
            'email' => 'sync-test2@example.com',
            'password' => bcrypt('password'),
            'role_id' => $roleUser->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        $this->assertTrue($user->roles()->where('role_id', $roleUser->id)->exists());

        $user->update(['role_id' => $roleAdmin->id]);

        $this->assertFalse($user->roles()->where('role_id', $roleUser->id)->exists());
        $this->assertTrue($user->roles()->where('role_id', $roleAdmin->id)->exists());
    }

    public function test_is_reviewer_syncs_reviewer_role_to_pivot()
    {
        $roleUser = Role::where('name', Role::USER)->first();
        $roleReviewer = Role::where('name', Role::REVIEWER)->first();
        $university = University::factory()->create();

        $user = User::create([
            'name' => 'Test Reviewer',
            'email' => 'sync-reviewer@example.com',
            'password' => bcrypt('password'),
            'role_id' => $roleUser->id,
            'university_id' => $university->id,
            'is_active' => true,
            'is_reviewer' => true,
        ]);

        $this->assertTrue($user->roles()->where('role_id', $roleUser->id)->exists());
        $this->assertTrue($user->roles()->where('role_id', $roleReviewer->id)->exists());

        $user->update(['is_reviewer' => false]);
        $this->assertFalse($user->roles()->where('role_id', $roleReviewer->id)->exists());
    }
}
