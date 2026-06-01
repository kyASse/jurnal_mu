<?php

use App\Models\Province;
use App\Models\City;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Province::unguard();
    City::unguard();
});

afterEach(function () {
    Province::reguard();
    City::reguard();
});

test('province can be created and has correct fillable attributes', function () {
    Province::reguard();

    $province = new Province();
    $province->id = 1;
    $province->fill([
        'name' => 'Jawa Barat',
        'extra_field' => 'should be ignored',
    ]);
    $province->save();

    expect($province)->toBeInstanceOf(Province::class)
        ->and($province->name)->toBe('Jawa Barat')
        ->and($province->extra_field)->toBeNull();
});

test('city can be created and has correct fillable attributes', function () {
    $province = Province::create([
        'id' => 1,
        'name' => 'Jawa Barat',
    ]);

    City::reguard();

    $city = new City();
    $city->id = 10;
    $city->fill([
        'province_id' => $province->id,
        'name' => 'Bandung',
        'extra_field' => 'should be ignored',
    ]);
    $city->save();

    expect($city)->toBeInstanceOf(City::class)
        ->and($city->province_id)->toBe($province->id)
        ->and($city->name)->toBe('Bandung')
        ->and($city->extra_field)->toBeNull();
});

test('province has many cities relationship', function () {
    $province = Province::create([
        'id' => 1,
        'name' => 'Jawa Barat',
    ]);
    $city1 = $province->cities()->create([
        'id' => 10,
        'name' => 'Bandung',
    ]);
    $city2 = $province->cities()->create([
        'id' => 11,
        'name' => 'Bekasi',
    ]);

    expect($province->cities)->toHaveCount(2)
        ->and($province->cities->pluck('name')->toArray())->toEqualCanonicalizing(['Bandung', 'Bekasi']);
});

test('city belongs to province relationship', function () {
    $province = Province::create([
        'id' => 1,
        'name' => 'Jawa Barat',
    ]);
    $city = City::create([
        'id' => 10,
        'province_id' => $province->id,
        'name' => 'Bandung',
    ]);

    expect($city->province)->toBeInstanceOf(Province::class)
        ->and($city->province->name)->toBe('Jawa Barat');
});
