<?php

namespace App\Http\Controllers;

use App\Models\Province;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function provinces(): JsonResponse
    {
        return response()->json(
            Province::orderBy('name')->get(['id', 'name'])
        );
    }

    public function cities(Province $province): JsonResponse
    {
        return response()->json(
            $province->cities()->orderBy('name')->get(['id', 'name'])
        );
    }
}
