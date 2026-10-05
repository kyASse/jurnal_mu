<?php

use App\Models\User;
use Laravel\Passport\HasApiTokens;

test('user model uses passport has api tokens trait', function () {
    $user = new User;
    expect(in_array(HasApiTokens::class, class_uses_recursive($user)))->toBeTrue();
    expect(method_exists($user, 'tokens'))->toBeTrue();
});
