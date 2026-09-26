# Authentication & User Registration Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate user account enumeration, enforce brute-force rate limiting on API login and registration, implement strong password policies, and protect against password inspect / memory exposure on frontend forms.

**Architecture:** 
1. Remove `exists:users,email` from `LoginRequest` and standardize `auth.failed` responses to prevent username harvesting.
2. Add `RateLimiter` to `AuthenticatedSessionController::login` and `throttle:10,1` middleware to registration.
3. Configure `Password::defaults()` in `AppServiceProvider`.
4. Build a reusable `PasswordInput` component with accessible toggle and wipe password state from Inertia memory using `onFinish: () => reset('password')`.
5. Verify via comprehensive automated feature tests and update formal pentest documentation.

**Tech Stack:** Laravel 12 (PHP 8.2+), Inertia.js, React 18, TypeScript, Tailwind CSS, Lucide React, Pest/PHPUnit.

**Spec:** [`docs/superpowers/specs/2026-09-26-auth-security-and-hardening-design.md`](file:///c:/xampp/htdocs/jurnal_mu/docs/superpowers/specs/2026-09-26-auth-security-and-hardening-design.md)

## Global Constraints
- Target branch: `security/pentest-audit`
- Compatible with Docker Apache container and Hostinger shared hosting environment
- All artisan commands executed via `docker exec -it jurnal-mu-app php artisan ...` (or standard container exec)
- Zero regression across existing security test suites (`tests/Feature/Security/*`)
- TypeScript build (`npm run build`) must succeed with 0 errors

---

### Task 1: Backend Anti-Enumeration & Password Complexity

**Files:**
- Create: `tests/Feature/Security/AuthSecurityTest.php`
- Modify: `app/Http/Controllers/Auth/LoginRequest.php`
- Modify: `app/Providers/AppServiceProvider.php`

**Interfaces:**
- Consumes: User model, Laravel validation rules
- Produces: Anti-enumeration login validation, system-wide password complexity default

- [ ] **Step 1: Write the failing tests in `tests/Feature/Security/AuthSecurityTest.php`**

```php
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
```

- [ ] **Step 2: Run test to verify initial failure**

Run: `docker exec jurnal-mu-app php artisan test tests/Feature/Security/AuthSecurityTest.php`
Expected: `test_login_does_not_reveal_user_existence_on_invalid_email` FAILS (returns validation error "The selected email is invalid.").

- [ ] **Step 3: Remove `exists:users,email` from `app/Http/Controllers/Auth/LoginRequest.php`**

In `app/Http/Controllers/Auth/LoginRequest.php:31`:
Replace:
```php
        return [
            'email' => ['required', 'string', 'email', 'max:255', 'exists:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
        ];
```
With:
```php
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ];
```

- [ ] **Step 4: Configure `Password::defaults()` in `app/Providers/AppServiceProvider.php`**

In `app/Providers/AppServiceProvider.php`:
Add import:
```php
use Illuminate\Validation\Rules\Password;
```
In `boot()` method, add:
```php
        // Enforce strong password complexity defaults across registration & resets
        Password::defaults(function () {
            $rule = Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers();

            return app()->isProduction()
                ? $rule->symbols()->uncompromised()
                : $rule;
        });
```

- [ ] **Step 5: Run tests and verify they pass**

Run: `docker exec jurnal-mu-app php artisan test tests/Feature/Security/AuthSecurityTest.php`
Expected: All 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Auth/LoginRequest.php app/Providers/AppServiceProvider.php tests/Feature/Security/AuthSecurityTest.php
git commit -m "fix(security): eliminate user account enumeration on login and enforce password complexity"
```

---

### Task 2: Backend Rate Limiting (API Login & Registration)

**Files:**
- Modify: `tests/Feature/Security/AuthSecurityTest.php`
- Modify: `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
- Modify: `routes/auth.php`

**Interfaces:**
- Consumes: `Illuminate\Support\Facades\RateLimiter`, route middleware
- Produces: Throttled `/api/login` and throttled `Route::post('register')`

- [ ] **Step 1: Add rate limiting tests to `tests/Feature/Security/AuthSecurityTest.php`**

Add tests:
```php
    public function test_api_login_is_throttled_after_5_failed_attempts(): void
    {
        $university = University::factory()->create();
        $userRole = Role::where('name', Role::USER)->first();

        User::factory()->create([
            'email' => 'api_victim@domain.edu',
            'password' => bcrypt('CorrectPassword123!'),
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/login', [
                'email' => 'api_victim@domain.edu',
                'password' => 'WrongPassword!',
            ]);
            $response->assertStatus(422);
        }

        // 6th attempt must be locked out
        $response = $this->postJson('/api/login', [
            'email' => 'api_victim@domain.edu',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('Too many login attempts', $response->json('message') ?? $response->json('errors.email.0'));
    }

    public function test_registration_is_rate_limited_after_10_attempts(): void
    {
        $university = University::factory()->create();

        for ($i = 0; $i < 10; $i++) {
            $this->post(route('register'), [
                'name' => 'Spam User',
                'email' => "spam_{$i}_" . uniqid() . '@domain.edu',
                'password' => 'SpamP@ssw0rd123',
                'password_confirmation' => 'SpamP@ssw0rd123',
                'university_id' => $university->id,
                'role_type' => 'user',
            ]);
        }

        // 11th attempt must be throttled with HTTP 429
        $response = $this->post(route('register'), [
            'name' => 'Spam User 11',
            'email' => 'spam_11_' . uniqid() . '@domain.edu',
            'password' => 'SpamP@ssw0rd123',
            'password_confirmation' => 'SpamP@ssw0rd123',
            'university_id' => $university->id,
            'role_type' => 'user',
        ]);

        $response->assertStatus(429);
    }
```

- [ ] **Step 2: Run tests to verify failure**

Run: `docker exec jurnal-mu-app php artisan test tests/Feature/Security/AuthSecurityTest.php`
Expected: `test_api_login_is_throttled_after_5_failed_attempts` and `test_registration_is_rate_limited_after_10_attempts` FAIL.

- [ ] **Step 3: Implement rate limiting in `AuthenticatedSessionController.php`**

In `app/Http/Controllers/Auth/AuthenticatedSessionController.php`:
Add imports:
```php
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
```
In `login(Request $request)` method:
```php
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $throttleKey = Str::transliterate(Str::lower($request->email).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        $user = User::where('email', $request->email)->first();

        // check if user exists
        if (!$user) {
            RateLimiter::hit($throttleKey, 60);
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        // check password
        if (!Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        // check if user is active
        if (!$user->is_active) {
            RateLimiter::hit($throttleKey, 60);
            throw ValidationException::withMessages([
                'email' => 'Your account is inactive. Please contact the administrator.',
            ]);
        }

        RateLimiter::clear($throttleKey);

        // Login
        Auth::login($user, $request->boolean('remember'));

        // Regenerate session to prevent fixation
        $request->session()->regenerate();

        // Update last login
        $user->update(['last_login_at' => now()]);

        return redirect()->route('dashboard')->with('success', 'Login successful! Welcome back to Jurnal MU.');
    }
```

- [ ] **Step 4: Attach `throttle:10,1` to registration route in `routes/auth.php`**

In `routes/auth.php:17`:
Replace:
```php
    Route::post('register', [RegisteredUserController::class, 'store']);
```
With:
```php
    Route::post('register', [RegisteredUserController::class, 'store'])
        ->middleware('throttle:10,1');
```

- [ ] **Step 5: Run tests and verify they pass**

Run: `docker exec jurnal-mu-app php artisan test tests/Feature/Security/AuthSecurityTest.php`
Expected: All 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Auth/AuthenticatedSessionController.php routes/auth.php tests/Feature/Security/AuthSecurityTest.php
git commit -m "fix(security): enforce rate limiting on API login and registration routes"
```

---

### Task 3: Frontend Reusable `PasswordInput` & State Sanitization

**Files:**
- Create: `resources/js/components/ui/password-input.tsx`
- Modify: `resources/js/pages/auth/login.tsx`
- Modify: `resources/js/pages/auth/register.tsx`

**Interfaces:**
- Consumes: `@/components/ui/input`, `lucide-react` Eye/EyeOff icons
- Produces: `PasswordInput` component; cleared React form memory on submit finish

- [ ] **Step 1: Create `resources/js/components/ui/password-input.tsx`**

```tsx
import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PasswordInputProps
  extends React.ComponentProps<'input'> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, autoComplete = 'current-password', ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-0 top-0 flex h-full items-center px-3 text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
```

- [ ] **Step 2: Update `resources/js/pages/auth/login.tsx`**

1. Import `PasswordInput`:
```tsx
import { PasswordInput } from '@/components/ui/password-input';
```
2. Destructure `reset` from `useForm`:
```tsx
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });
```
3. Update `submit` to wipe password on finish:
```tsx
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };
```
4. Replace password `<Input ... />` with:
```tsx
    <Label htmlFor="password">Password</Label>
    <PasswordInput
        id="password"
        name="password"
        value={data.password}
        onChange={(e) => setData('password', e.target.value)}
        required
        autoComplete="current-password"
        className="mt-2"
    />
```

- [ ] **Step 3: Update `resources/js/pages/auth/register.tsx`**

1. Import `PasswordInput`:
```tsx
import { PasswordInput } from '@/components/ui/password-input';
```
2. Destructure `reset` from `useForm`:
```tsx
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
```
3. Update `submit` to wipe passwords on finish:
```tsx
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };
```
4. Replace password inputs with `PasswordInput`:
```tsx
    {/* Password */}
    <div>
        <Label htmlFor="password">Password *</Label>
        <PasswordInput
            id="password"
            name="password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            required
            autoComplete="new-password"
            className="mt-2"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
    </div>

    {/* Password Confirmation */}
    <div>
        <Label htmlFor="password_confirmation">Konfirmasi Password *</Label>
        <PasswordInput
            id="password_confirmation"
            name="password_confirmation"
            value={data.password_confirmation}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            required
            autoComplete="new-password"
            className="mt-2"
        />
        {errors.password_confirmation && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
        )}
    </div>
```

- [ ] **Step 4: Build assets with Vite to verify TypeScript compilation**

Run: `npm run build`
Expected: Successful build with 0 TypeScript / JSX syntax errors.

- [ ] **Step 5: Commit**

```bash
git add resources/js/components/ui/password-input.tsx resources/js/pages/auth/login.tsx resources/js/pages/auth/register.tsx
git commit -m "fix(security): introduce PasswordInput with visibility toggle and purge password state on finish"
```

---

### Task 4: Full Security Test Regression & Pentest Documentation Update

**Files:**
- Modify: `docs/security/2026-09-25-pentest-report.md`
- Modify: `docs/security/2026-09-25-pentest-report-id.md`

**Interfaces:**
- Consumes: Test results from all test suites
- Produces: Updated pentest reports documenting VULN-07 (User Enumeration) and VULN-08 (Auth Rate Limiting & Password Exposure)

- [ ] **Step 1: Execute full security regression test suite**

Run: `docker exec jurnal-mu-app php artisan test tests/Feature/Security/`
Expected: 100% pass across all security suites (Perimeter, AccessControl, Storage, SsrfAndXml, AuthSecurity). Total 25 tests, 70+ assertions.

- [ ] **Step 2: Update English report `docs/security/2026-09-25-pentest-report.md`**

Append:
- VULN-07: User Account Enumeration via Login Validation Discrepancy (CVSS 5.3 Medium - Resolved)
- VULN-08: Authentication Brute-Force Exposure & Client-Side Password Retention (CVSS 6.8 Medium - Resolved)
- Update total test pass statistics to reflect 25 passed tests.

- [ ] **Step 3: Update Indonesian report `docs/security/2026-09-25-pentest-report-id.md`**

Append Indonesian sections for VULN-07 and VULN-08 and updated test metrics.

- [ ] **Step 4: Commit**

```bash
git add docs/security/
git commit -m "docs(security): document authentication hardening and anti-enumeration fixes in pentest reports"
```
