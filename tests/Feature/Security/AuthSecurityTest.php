<?php

namespace Tests\Feature\Security;

use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }

    public function test_login_does_not_reveal_user_existence_on_invalid_email(): void
    {
        $response = $this->from(route('login'))->post(route('login'), [
            'email' => 'nonexistent_account@domain.edu',
            'password' => 'WrongPassword123!',
        ]);

        $response->assertRedirect(route('login'));
        $response->assertSessionHasErrors('email');

        $errorMessage = session('errors')->first('email');
        $this->assertEquals(trans('auth.failed'), $errorMessage);
        $this->assertStringNotContainsString('selected email is invalid', strtolower($errorMessage));
    }

    public function test_login_returns_identical_error_for_valid_email_wrong_password(): void
    {
        $university = University::factory()->create();
        $userRole = Role::where('name', Role::USER)->first();

        User::factory()->create([
            'email' => 'valid_user@domain.edu',
            'password' => bcrypt('CorrectPassword123!'),
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        // Attempt with wrong password
        $response = $this->from(route('login'))->post(route('login'), [
            'email' => 'valid_user@domain.edu',
            'password' => 'WrongPassword123!',
        ]);

        $response->assertRedirect(route('login'));
        $response->assertSessionHasErrors('email');

        $validUserError = session('errors')->first('email');
        $this->assertEquals(trans('auth.failed'), $validUserError);
    }

    public function test_registration_rejects_weak_passwords(): void
    {
        $university = University::factory()->create();

        $weakPasswords = [
            '12345678',     // Numbers only
            'password',     // Lowercase only
            'PASSWORD12',   // Missing lowercase
            'Password',     // Missing numbers
        ];

        foreach ($weakPasswords as $weakPassword) {
            $response = $this->post(route('register'), [
                'name' => 'Test User',
                'email' => 'test_' . uniqid() . '@domain.edu',
                'password' => $weakPassword,
                'password_confirmation' => $weakPassword,
                'university_id' => $university->id,
                'role_type' => 'user',
            ]);

            $response->assertSessionHasErrors('password');
        }
    }

    public function test_registration_accepts_compliant_password(): void
    {
        $university = University::factory()->create();

        $response = $this->post(route('register'), [
            'name' => 'Valid User',
            'email' => 'strong_pass_user@domain.edu',
            'password' => 'StrongP@ssw0rd2026',
            'password_confirmation' => 'StrongP@ssw0rd2026',
            'university_id' => $university->id,
            'role_type' => 'user',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('users', [
            'email' => 'strong_pass_user@domain.edu',
        ]);
    }
}
