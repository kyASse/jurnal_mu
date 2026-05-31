<?php

use App\Models\Province;
use App\Models\City;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('province can be created and has correct fillable attributes', function () {
    $province = Province::create([
        'name' => 'Jawa Barat',
        'extra_field' => 'should be ignored',
    ]);

    expect($province)->toBeInstanceOf(Province::class)
        ->and($province->name)->toBe('Jawa Barat')
        ->and($province->extra_field)->toBeNull();
});

test('city can be created and has correct fillable attributes', function () {
    $province = Province::create(['name' => 'Jawa Barat']);

    $city = City::create([
        'province_id' => $province->id,
        'name' => 'Bandung',
        'extra_field' => 'should be ignored',
    ]);

    expect($city)->toBeInstanceOf(City::class)
        ->and($city->province_id)->toBe($province->id)
        ->and($city->name)->toBe('Bandung')
        ->and($city->extra_field)->toBeNull();
});

test('province has many cities relationship', function () {
    $province = Province::create(['name' => 'Jawa Barat']);
    $city1 = $province->cities()->create(['name' => 'Bandung']);
    $city2 = $province->cities()->create(['name' => 'Bekasi']);

    expect($province->cities)->toHaveCount(2)
        ->and($province->cities->pluck('name')->toArray())->toEqualCanonicalizing(['Bandung', 'Bekasi']);
});

test('city belongs to province relationship', function () {
    $province = Province::create(['name' => 'Jawa Barat']);
    $city = City::create([
        'province_id' => $province->id,
        'name' => 'Bandung',
    ]);

    expect($city->province)->toBeInstanceOf(Province::class)
        ->and($city->province->name)->toBe('Jawa Barat');
});
