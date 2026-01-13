<?php

namespace Tests;

use App\Models\Role;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Seed roles for testing.
     * This is required because many tests use User::factory() which needs roles to exist.
     */
    protected function seedRoles(): void
    {
        Role::create([
            'name' => Role::SUPER_ADMIN,
            'display_name' => 'Super Administrator',
            'description' => 'Super Administrator with full access',
        ]);

        Role::create([
            'name' => Role::ADMIN_KAMPUS,
            'display_name' => 'Administrator Kampus',
            'description' => 'University Administrator',
        ]);

        Role::create([
            'name' => Role::USER,
            'display_name' => 'Pengelola Jurnal',
            'description' => 'Journal Manager',
        ]);
    }
}
