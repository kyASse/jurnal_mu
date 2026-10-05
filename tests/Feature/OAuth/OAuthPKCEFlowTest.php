<?php

use App\Models\User;
use Laravel\Passport\Client;

test('full oauth pkce flow from authorization to token exchange and user fetch', function () {
    $user = User::factory()->create(['name' => 'Prof. Ahmad']);

    $client = Client::factory()->create([
        'name' => 'ASKUI Global Data Hub',
        'secret' => 'askui-secret-key-1234567890123456',
        'redirect_uris' => ['https://askui.test/auth/callback'],
        'grant_types' => ['authorization_code', 'refresh_token'],
    ]);

    // 1. Generate PKCE pair
    $codeVerifier = bin2hex(random_bytes(32));
    $codeChallenge = rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');
    $state = 'csrf-state-123';
    $redirectUri = $client->redirect_uris[0];

    // 2. Request authorization (Consent screen) to set up authorization request session
    $consentResponse = $this->actingAs($user, 'web')->get('/oauth/authorize?'.http_build_query([
        'client_id' => $client->id,
        'redirect_uri' => $redirectUri,
        'response_type' => 'code',
        'scope' => '',
        'state' => $state,
        'code_challenge' => $codeChallenge,
        'code_challenge_method' => 'S256',
    ]));

    $consentResponse->assertStatus(200);
    $authToken = session('authToken');

    // 3. Authorize Approve
    $authResponse = $this->actingAs($user, 'web')->post('/oauth/authorize', [
        'state' => $state,
        'client_id' => $client->id,
        'auth_token' => $authToken,
    ]);

    // Follow redirect to obtain auth code
    $redirectUrl = $authResponse->headers->get('Location');
    parse_str(parse_url($redirectUrl, PHP_URL_QUERY), $queryParams);
    $authCode = $queryParams['code'] ?? null;

    expect($authCode)->not->toBeNull();

    // 4. Exchange code for access token via POST /oauth/token
    $tokenResponse = $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => $client->id,
        'client_secret' => 'askui-secret-key-1234567890123456',
        'redirect_uri' => $redirectUri,
        'code_verifier' => $codeVerifier,
        'code' => $authCode,
    ]);

    $tokenResponse->assertStatus(200)
        ->assertJsonStructure(['token_type', 'expires_in', 'access_token', 'refresh_token']);

    $accessToken = $tokenResponse->json('access_token');

    // 5. Fetch user profile with the token
    $userResponse = $this->withHeader('Authorization', 'Bearer '.$accessToken)
        ->getJson('/api/sso/user');

    $userResponse->assertStatus(200)
        ->assertJsonPath('name', 'Prof. Ahmad');
});
