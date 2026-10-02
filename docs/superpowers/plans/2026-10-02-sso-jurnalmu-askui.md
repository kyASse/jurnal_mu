# SSO JurnalMu (IdP) & ASKUI Global Data Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementasi SSO Identity Provider (IdP) berbasis OAuth 2.0 PKCE di JurnalMu untuk integrasi dengan ASKUI Global Data Hub tanpa mengganggu data user existing PTMA.

**Architecture:** Menggunakan `laravel/passport` untuk mengelola otorisasi OAuth 2.0 PKCE (`/oauth/authorize`, `/oauth/token`). Autentikasi web/session Inertia tetap berjalan di `web` guard, sedangkan SSO API berjalan di `auth:api` guard. Pengguna disajikan Consent Screen sebelum data profil dan peran PTMA dibagikan via endpoint `/api/sso/user`.

**Tech Stack:** Laravel 12, Laravel Passport (^12.0), Pest PHP 3, Blade/Tailwind CSS, MySQL/Docker.

**Spec:** `docs/superpowers/specs/2026-10-02-sso-jurnalmu-askui-design.md`

## Global Constraints

- Semua artisan command dijalankan di container docker: `docker exec -it jurnal-mu-app php artisan <command>`.
- Dilarang mengubah skema tabel `users`, `roles`, atau mereset password hashing existing.
- Guard `web` tetap menangani sesi browser JurnalMu; Guard `api` menggunakan driver `passport`.
- PKCE (Proof Key for Code Exchange) wajib didukung untuk semua authorization code grant.

---

### Task 1: Setup & Konfigurasi Laravel Passport

**Files:**
- Modify: `composer.json`
- Modify: `config/auth.php:40-46`
- Modify: `app/Providers/AppServiceProvider.php`
- Test: `tests/Feature/OAuth/PassportConfigTest.php`

**Interfaces:**
- Consumes: Database schema JurnalMu existing.
- Produces: Guard `api` dengan driver `passport`, route `/oauth/*` terdaftar, tabel OAuth (`oauth_*`).

- [ ] **Step 1: Write failing test**

Buat file `tests/Feature/OAuth/PassportConfigTest.php`:
```php
<?php

use Laravel\Passport\Passport;

test('passport api guard is configured and oauth routes exist', function () {
    expect(config('auth.guards.api.driver'))->toBe('passport');
    expect(config('auth.guards.api.provider'))->toBe('users');

    $response = $this->get('/oauth/authorize');
    // Guest should be redirected to login
    $response->assertRedirect('/login');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
docker exec -it jurnal-mu-app php artisan test tests/Feature/OAuth/PassportConfigTest.php
```
Expected: FAIL dengan `null does not match expected 'passport'` atau route tidak ditemukan.

- [ ] **Step 3: Implement minimal code**

1. Install Passport via composer di container:
```bash
docker exec -it jurnal-mu-app composer require laravel/passport
```
2. Jalankan migrasi dan install passport:
```bash
docker exec -it jurnal-mu-app php artisan migrate
docker exec -it jurnal-mu-app php artisan passport:install
```
3. Update `config/auth.php`:
```php
    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        'api' => [
            'driver' => 'passport',
            'provider' => 'users',
        ],
    ],
```
4. Tambahkan konfigurasi token di `app/Providers/AppServiceProvider.php`:
```php
use Laravel\Passport\Passport;

public function boot(): void
{
    Passport::tokensExpireIn(now()->addHours(1));
    Passport::refreshTokensExpireIn(now()->addDays(30));
    Passport::personalAccessTokensExpireIn(now()->addMonths(6));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
docker exec -it jurnal-mu-app php artisan test tests/Feature/OAuth/PassportConfigTest.php
```
Expected: PASS (1 test, assertions pass).

- [ ] **Step 5: Commit**

```bash
git add composer.json composer.lock config/auth.php app/Providers/AppServiceProvider.php tests/Feature/OAuth/PassportConfigTest.php
git commit -m "feat(oauth): install and configure laravel passport"
```

---

### Task 2: Model User Integration dengan Passport

**Files:**
- Modify: `app/Models/User.php:1-25`
- Test: `tests/Feature/OAuth/UserModelOAuthTest.php`

**Interfaces:**
- Consumes: `App\Models\User`
- Produces: `User::tokens()`, `User::createToken()` via `Laravel\Passport\HasApiTokens`.

- [ ] **Step 1: Write failing test**

Buat file `tests/Feature/OAuth/UserModelOAuthTest.php`:
```php
<?php

use App\Models\User;
use Laravel\Passport\HasApiTokens;

test('user model uses passport has api tokens trait', function () {
    $user = new User();
    expect(in_array(HasApiTokens::class, class_uses_recursive($user)))->toBeTrue();
    expect(method_exists($user, 'tokens'))->toBeTrue();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
docker exec -it jurnal-mu-app php artisan test tests/Feature/OAuth/UserModelOAuthTest.php
```
Expected: FAIL dengan `Failed asserting that false is true`.

- [ ] **Step 3: Implement minimal code**

Ubah `app/Models/User.php`:
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
docker exec -it jurnal-mu-app php artisan test tests/Feature/OAuth/UserModelOAuthTest.php
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Models/User.php tests/Feature/OAuth/UserModelOAuthTest.php
git commit -m "feat(oauth): integrate HasApiTokens trait on User model"
```

---

### Task 3: Endpoint User Profile SSO (`/api/sso/user`)

**Files:**
- Create: `app/Http/Controllers/Api/SSOUserController.php`
- Modify: `routes/api.php`
- Test: `tests/Feature/OAuth/SSOUserInfoTest.php`

**Interfaces:**
- Consumes: Bearer Token dengan scope valid via `auth:api`.
- Produces: JSON profil user dengan peran dan afiliasi PTMA.

- [ ] **Step 1: Write failing test**

Buat file `tests/Feature/OAuth/SSOUserInfoTest.php`:
```php
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
        'status' => 'approved',
    ]);

    $role = Role::firstOrCreate(['name' => 'Author'], ['slug' => 'author', 'description' => 'Author role']);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
docker exec -it jurnal-mu-app php artisan test tests/Feature/OAuth/SSOUserInfoTest.php
```
Expected: FAIL dengan `404 Not Found` (route belum ada).

- [ ] **Step 3: Implement minimal code**

1. Buat controller `app/Http/Controllers/Api/SSOUserController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SSOUserController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $roles = $user->roles()->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug ?? strtolower(str_replace(' ', '_', $role->name)),
            ];
        });

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified' => !is_null($user->email_verified_at),
            'avatar' => $user->avatar_url ?? null,
            'status' => $user->status ?? 'approved',
            'roles' => $roles,
            'primary_role' => $user->role?->name ?? ($roles->first()['name'] ?? 'User'),
            'affiliation' => [
                'ptma_name' => $user->university?->name ?? $user->institution ?? null,
                'faculty' => $user->faculty ?? null,
                'department' => $user->department ?? null,
            ],
        ]);
    }
}
```

2. Daftarkan route di `routes/api.php`:
```php
use App\Http\Controllers\Api\SSOUserController;

Route::middleware(['auth:api'])->prefix('sso')->group(function () {
    Route::get('/user', [SSOUserController::class, 'show']);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
docker exec -it jurnal-mu-app php artisan test tests/Feature/OAuth/SSOUserInfoTest.php
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/Api/SSOUserController.php routes/api.php tests/Feature/OAuth/SSOUserInfoTest.php
git commit -m "feat(oauth): add /api/sso/user profile endpoint"
```

---

### Task 4: Consent Screen UI (Passport Authorize View)

**Files:**
- Create: `resources/views/vendor/passport/authorize.blade.php`
- Test: `tests/Feature/OAuth/ConsentScreenTest.php`

**Interfaces:**
- Consumes: Data client, scopes, dan authToken dari `Laravel\Passport\Http\Controllers\AuthorizationController`.
- Produces: Form persetujuan (Approve) dan penolakan (Deny) dengan style konsisten JurnalMu.

- [ ] **Step 1: Write failing test**

Buat file `tests/Feature/OAuth/ConsentScreenTest.php`:
```php
<?php

use App\Models\User;
use Laravel\Passport\Client;

test('authenticated user sees custom consent screen with client info', function () {
    $user = User::factory()->create();

    $client = Client::create([
        'user_id' => null,
        'name' => 'ASKUI Global Data Hub',
        'secret' => 'askui-secret-key-1234567890123456',
        'provider' => 'users',
        'redirect' => 'https://askui.test/auth/callback',
        'personal_access_client' => 0,
        'password_client' => 0,
        'revoked' => 0,
    ]);

    $state = 'random-state-123';
    $codeVerifier = bin2hex(random_bytes(32));
    $codeChallenge = rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');

    $response = $this->actingAs($user, 'web')->get('/oauth/authorize?' . http_build_query([
        'client_id' => $client->id,
        'redirect_uri' => $client->redirect,
        'response_type' => 'code',
        'scope' => '',
        'state' => $state,
        'code_challenge' => $codeChallenge,
        'code_challenge_method' => 'S256',
    ]));

    $response->assertStatus(200);
    $response->assertSee('ASKUI Global Data Hub');
    $response->assertSee('Izinkan Akses');
    $response->assertSee('Tolak');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
docker exec -it jurnal-mu-app php artisan test tests/Feature/OAuth/ConsentScreenTest.php
```
Expected: FAIL jika view custom belum memuat string `Izinkan Akses` / `Tolak`.

- [ ] **Step 3: Implement minimal code**

Buat file `resources/views/vendor/passport/authorize.blade.php`:
```blade
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Otorisasi Aplikasi - {{ config('app.name', 'Journal MU') }}</title>
    @vite(['resources/css/app.css'])
</head>
<body class="bg-slate-50 text-slate-800 flex items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div class="text-center mb-6">
            <h1 class="text-xl font-bold text-slate-900">Permintaan Otorisasi Akun</h1>
            <p class="text-sm text-slate-500 mt-1">Single Sign-On JurnalMu</p>
        </div>

        <div class="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 mb-6">
            <p class="text-sm text-indigo-900 leading-relaxed">
                Aplikasi <strong class="font-semibold text-indigo-950">{{ $client->name }}</strong> meminta izin untuk mengakses informasi profil akun JurnalMu Anda.
            </p>
        </div>

        <div class="space-y-3 mb-8">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Informasi yang akan dibagikan:</p>
            <ul class="text-sm text-slate-600 space-y-2">
                <li class="flex items-center gap-2">
                    <span class="text-emerald-500 font-bold">✓</span> Identitas Profil (Nama, Email, Foto)
                </li>
                <li class="flex items-center gap-2">
                    <span class="text-emerald-500 font-bold">✓</span> Status dan Peran (Role) di JurnalMu
                </li>
                <li class="flex items-center gap-2">
                    <span class="text-emerald-500 font-bold">✓</span> Afiliasi Perguruan Tinggi (PTMA)
                </li>
            </ul>
        </div>

        <div class="flex items-center gap-3">
            {{-- Deny Form --}}
            <form method="post" action="{{ route('passport.authorizations.deny') }}" class="w-1/2">
                @csrf
                @method('DELETE')
                <input type="hidden" name="state" value="{{ $request->state }}">
                <input type="hidden" name="client_id" value="{{ $client->id }}">
                <input type="hidden" name="auth_token" value="{{ $authToken }}">
                <button type="submit" class="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition">
                    Tolak
                </button>
            </form>

            {{-- Approve Form --}}
            <form method="post" action="{{ route('passport.authorizations.approve') }}" class="w-1/2">
                @csrf
                <input type="hidden" name="state" value="{{ $request->state }}">
                <input type="hidden" name="client_id" value="{{ $client->id }}">
                <input type="hidden" name="auth_token" value="{{ $authToken }}">
                <button type="submit" class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-100 transition">
                    Izinkan Akses
                </button>
            </form>
        </div>
    </div>
</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
docker exec -it jurnal-mu-app php artisan test tests/Feature/OAuth/ConsentScreenTest.php
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add resources/views/vendor/passport/authorize.blade.php tests/Feature/OAuth/ConsentScreenTest.php
git commit -m "feat(oauth): add custom consent screen UI with Tailwind"
```

---

### Task 5: Endpoint Token Revocation (`/api/oauth/revoke-token`)

**Files:**
- Create: `app/Http/Controllers/Api/OAuthRevokeController.php`
- Modify: `routes/api.php`
- Test: `tests/Feature/OAuth/TokenRevokeTest.php`

**Interfaces:**
- Consumes: Active Passport Bearer token via request.
- Produces: Status 200 OK dan mencabut token aktif dari database (`revoked = 1`).

- [ ] **Step 1: Write failing test**

Buat file `tests/Feature/OAuth/TokenRevokeTest.php`:
```php
<?php

use App\Models\User;
use Laravel\Passport\Passport;

test('authenticated user can revoke current access token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('TestToken');

    $response = $this->withHeader('Authorization', 'Bearer ' . $token->accessToken)
        ->postJson('/api/oauth/revoke-token');

    $response->assertStatus(200)
        ->assertJson(['message' => 'Token successfully revoked']);

    expect($token->token->fresh()->revoked)->toBeTrue();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
docker exec -it jurnal-mu-app php artisan test tests/Feature/OAuth/TokenRevokeTest.php
```
Expected: FAIL (404 route not found).

- [ ] **Step 3: Implement minimal code**

1. Buat `app/Http/Controllers/Api/OAuthRevokeController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OAuthRevokeController extends Controller
{
    public function revoke(Request $request): JsonResponse
    {
        $token = $request->user()->token();
        if ($token) {
            $token->revoke();
        }

        return response()->json([
            'message' => 'Token successfully revoked',
        ]);
    }
}
```

2. Tambahkan route di `routes/api.php`:
```php
use App\Http\Controllers\Api\OAuthRevokeController;

Route::middleware(['auth:api'])->prefix('oauth')->group(function () {
    Route::post('/revoke-token', [OAuthRevokeController::class, 'revoke']);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
docker exec -it jurnal-mu-app php artisan test tests/Feature/OAuth/TokenRevokeTest.php
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/Api/OAuthRevokeController.php routes/api.php tests/Feature/OAuth/TokenRevokeTest.php
git commit -m "feat(oauth): add token revocation endpoint"
```

---

### Task 6: End-to-End OAuth 2.0 PKCE Flow Test

**Files:**
- Create: `tests/Feature/OAuth/OAuthPKCEFlowTest.php`

**Interfaces:**
- Consumes: Seluruh modul OAuth Passport (`/oauth/authorize`, `/oauth/token`, `/api/sso/user`).
- Produces: Verifikasi alur penuh end-to-end tanpa mock eksternal.

- [ ] **Step 1: Write comprehensive end-to-end test**

Buat file `tests/Feature/OAuth/OAuthPKCEFlowTest.php`:
```php
<?php

use App\Models\User;
use Laravel\Passport\Client;

test('full oauth pkce flow from authorization to token exchange and user fetch', function () {
    $user = User::factory()->create(['name' => 'Prof. Ahmad']);

    $client = Client::create([
        'user_id' => null,
        'name' => 'ASKUI Global Data Hub',
        'secret' => 'askui-secret-key-1234567890123456',
        'provider' => 'users',
        'redirect' => 'https://askui.test/auth/callback',
        'personal_access_client' => 0,
        'password_client' => 0,
        'revoked' => 0,
    ]);

    // 1. Generate PKCE pair
    $codeVerifier = bin2hex(random_bytes(32));
    $codeChallenge = rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');
    $state = 'csrf-state-123';

    // 2. Authorize Approve
    $authResponse = $this->actingAs($user, 'web')->post('/oauth/authorize', [
        'state' => $state,
        'client_id' => $client->id,
        'auth_token' => '', // Diisi otomatis oleh controller atau session
    ]);

    // Follow redirect to obtain auth code
    $redirectUrl = $authResponse->headers->get('Location');
    parse_str(parse_url($redirectUrl, PHP_URL_QUERY), $queryParams);
    $authCode = $queryParams['code'] ?? null;

    expect($authCode)->not->toBeNull();

    // 3. Exchange code for access token via POST /oauth/token
    $tokenResponse = $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => $client->id,
        'client_secret' => $client->secret,
        'redirect_uri' => $client->redirect,
        'code_verifier' => $codeVerifier,
        'code' => $authCode,
    ]);

    $tokenResponse->assertStatus(200)
        ->assertJsonStructure(['token_type', 'expires_in', 'access_token', 'refresh_token']);

    $accessToken = $tokenResponse->json('access_token');

    // 4. Fetch user profile with the token
    $userResponse = $this->withHeader('Authorization', 'Bearer ' . $accessToken)
        ->getJson('/api/sso/user');

    $userResponse->assertStatus(200)
        ->assertJsonPath('name', 'Prof. Ahmad');
});
```

- [ ] **Step 2: Run test to verify it passes**

Run:
```bash
docker exec -it jurnal-mu-app php artisan test tests/Feature/OAuth/OAuthPKCEFlowTest.php
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/Feature/OAuth/OAuthPKCEFlowTest.php
git commit -m "test(oauth): add full e2e PKCE flow verification test"
```
