<?php

use Laravel\Passport\Passport;

test('passport api guard is configured and oauth routes exist', function () {
    expect(config('auth.guards.api.driver'))->toBe('passport');
    expect(config('auth.guards.api.provider'))->toBe('users');

    $response = $this->get('/oauth/authorize');
    // Guest should be redirected to login
    $response->assertRedirect('/login');
});
