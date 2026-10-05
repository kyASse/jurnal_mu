<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SSOUserController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $roles = $user->roles()->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug ?? strtolower(str_replace(' ', '_', $role->name)),
            ];
        });

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified' => !is_null($user->email_verified_at),
            'avatar' => $user->avatar_url ?? null,
            'status' => $user->approval_status ?? $user->status ?? 'approved',
            'roles' => $roles,
            'primary_role' => $user->role?->name ?? ($roles->first()['name'] ?? 'User'),
            'affiliation' => [
                'ptma_name' => $user->university?->name ?? $user->institution ?? null,
                'faculty' => $user->faculty ?? null,
                'department' => $user->department ?? null,
            ],
        ]);
    }
}
