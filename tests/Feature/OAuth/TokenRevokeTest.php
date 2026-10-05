<?php

use App\Models\User;
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

beforeEach(function () {
    Client::factory()->asPersonalAccessTokenClient()->create();
});

test('unauthenticated request to revoke token is rejected', function () {
    $response = $this->postJson('/api/oauth/revoke-token');
    $response->assertStatus(401);
});

test('authenticated user can revoke current access token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('TestToken');

    $response = $this->withHeader('Authorization', 'Bearer ' . $token->accessToken)
        ->postJson('/api/oauth/revoke-token');

    $response->assertStatus(200)
        ->assertJson(['message' => 'Token successfully revoked']);

    expect($token->token->fresh()->revoked)->toBeTrue();
});
