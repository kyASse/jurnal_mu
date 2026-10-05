<?php

use App\Models\User;
use Laravel\Passport\Client;

test('authenticated user sees custom consent screen with client info', function () {
    $user = User::factory()->create();

    $client = Client::factory()->create([
        'name' => 'ASKUI Global Data Hub',
        'redirect_uris' => ['https://askui.test/auth/callback'],
    ]);

    $state = 'random-state-123';
    $codeVerifier = bin2hex(random_bytes(32));
    $codeChallenge = rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');

    $response = $this->actingAs($user, 'web')->get('/oauth/authorize?'.http_build_query([
        'client_id' => $client->id,
        'redirect_uri' => 'https://askui.test/auth/callback',
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
