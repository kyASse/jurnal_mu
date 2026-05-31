<?php

namespace App\Http\Controllers;

use App\Models\Province;
use App\Models\City;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function provinces(): JsonResponse
    {
        return response()->json(
            Province::orderBy('name')->get(['id', 'name'])
        );
    }

    public function cities(int $provinceId): JsonResponse
    {
        return response()->json(
            City::where('province_id', $provinceId)->orderBy('name')->get(['id', 'name'])
        );
    }
}
