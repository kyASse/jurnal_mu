<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'display_name' => 'Super Administrator',
                'description' => 'Memiliki akses penuh ke seluruh sistem. Dapat mengelola semua PTM, Admin Kampus, dan melihat seluruh data jurnal.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Admin Kampus',
                'display_name' => 'Administrator Kampus',
                'description' => 'Bertanggung jawab mengelola data jurnal di tingkat kampus. Dapat meninjau, menyetujui, atau menolak jurnal yang diajukan oleh PTM di kampusnya.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'User',
                'display_name' => 'Pengelola Jurnal',
                'description' => 'Mengelola jurnal yang ditugaskan. Dapat melakukan self-assessment dan mengajukan pembinaan.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('roles')->insert($roles);

        $this->command->info('Roles seeded successfully.');
    }
}
