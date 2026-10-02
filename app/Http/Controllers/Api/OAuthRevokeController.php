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
