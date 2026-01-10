<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting Database Seeding...');
        $this->command->info('');

        // Order matters! Sesuaikan dengan foreign key dependencies
        $this->call([
            RoleSeeder::class,              // 1. Roles (no dependencies)
            ScientificFieldSeeder::class,   // 2. Scientific Fields (no dependencies)
            UniversitySeeder::class,        // 3. Universities (no dependencies)
            UserSeeder::class,              // 4. Users (depends on: roles, universities)
            EvaluationIndicatorSeeder::class, // 5. Evaluation Indicators (no dependencies)
            JournalSeeder::class,           // 6. Journals (depends on: universities, users, scientific_fields)
        ]);

        $this->command->info('');
        $this->command->info('✨ Database seeding completed successfully!');
        $this->command->info('');
        $this->command->info('🔐 You can now login with:');
        $this->command->info('   Email: superadmin@ajm.ac.id');
        $this->command->info('   Password: password123');
    }
}
