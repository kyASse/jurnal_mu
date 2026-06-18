<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Sync primary role_id to user_roles
        $usersWithRoles = DB::table('users')
            ->whereNotNull('role_id')
            ->select('id', 'role_id')
            ->get();

        foreach ($usersWithRoles as $user) {
            $exists = DB::table('user_roles')
                ->where('user_id', $user->id)
                ->where('role_id', $user->role_id)
                ->exists();

            if (! $exists) {
                DB::table('user_roles')->insert([
                    'user_id' => $user->id,
                    'role_id' => $user->role_id,
                    'assigned_at' => now(),
                    'assigned_by' => null,
                ]);
            }
        }

        // 2. Sync is_reviewer to user_roles Reviewer role
        $reviewerRole = DB::table('roles')->where('name', 'Reviewer')->first();
        if ($reviewerRole) {
            $reviewerUsers = DB::table('users')
                ->where('is_reviewer', true)
                ->select('id')
                ->get();

            foreach ($reviewerUsers as $user) {
                $exists = DB::table('user_roles')
                    ->where('user_id', $user->id)
                    ->where('role_id', $reviewerRole->id)
                    ->exists();

                if (! $exists) {
                    DB::table('user_roles')->insert([
                        'user_id' => $user->id,
                        'role_id' => $reviewerRole->id,
                        'assigned_at' => now(),
                        'assigned_by' => null,
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        // No-op to prevent destroying valid multi-role records
    }
};
