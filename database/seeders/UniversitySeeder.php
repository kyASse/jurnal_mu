<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UniversitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $universities = [
            [
                'code' => 'UAD',
                'ptm_code' => '02104',
                'name' => 'Universitas Ahmad Dahlan',
                'short_name' => 'UAD',
                'address' => 'Jl. Kapas No.9, Semaki, Kec. Umbulharjo',
                'city' => 'Yogyakarta',
                'province' => 'DI Yogyakarta',
                'postal_code' => '55166',
                'phone' => '0274-563515',
                'email' => 'info@uad.ac.id',
                'website' => 'https://uad.ac.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/id/thumb/f/f8/Logo_Universitas_Ahmad_Dahlan.svg/1200px-Logo_Universitas_Ahmad_Dahlan.svg.png',
                'accreditation_status' => 'Unggul',
                'cluster' => 'Utama',
                'profile_description' => 'Universitas Ahmad Dahlan adalah perguruan tinggi swasta di Yogyakarta yang berdiri sejak 1960 dibawah naungan Persyarikatan Muhammadiyah.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'UMY',
                'ptm_code' => '02108',
                'name' => 'Universitas Muhammadiyah Yogyakarta',
                'short_name' => 'UMY',
                'address' => 'Jl. Brawijaya, Tamantirto, Kasihan',
                'city' => 'Bantul',
                'province' => 'DI Yogyakarta',
                'postal_code' => '55183',
                'phone' => '0274-387656',
                'email' => 'info@umy.ac.id',
                'website' => 'https://umy.ac.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/id/thumb/d/dd/Universitas_Muhammadiyah_Yogyakarta_logo.png/1200px-Universitas_Muhammadiyah_Yogyakarta_logo.png',
                'accreditation_status' => 'Baik Sekali',
                'cluster' => 'Utama',
                'profile_description' => 'Universitas Muhammadiyah Yogyakarta adalah perguruan tinggi swasta yang terletak di Bantul, Yogyakarta dengan kampus yang luas dan modern.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'UMS',
                'ptm_code' => '02305',
                'name' => 'Universitas Muhammadiyah Surakarta',
                'short_name' => 'UMS',
                'address' => 'Jl. A. Yani Tromol Pos 1 Pabelan',
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'postal_code' => '57162',
                'phone' => '0271-717417',
                'email' => 'info@ums.ac.id',
                'website' => 'https://ums.ac.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/id/thumb/c/ce/Universitas_Muhammadiyah_Surakarta_logo.png/1200px-Universitas_Muhammadiyah_Surakarta_logo.png',
                'accreditation_status' => 'Unggul',
                'cluster' => 'Utama',
                'profile_description' => 'Universitas Muhammadiyah Surakarta adalah salah satu universitas terkemuka di Jawa Tengah dengan berbagai program studi unggulan.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'UMM',
                'ptm_code' => '03405',
                'name' => 'Universitas Muhammadiyah Malang',
                'short_name' => 'UMM',
                'address' => 'Jl. Raya Tlogomas No.246',
                'city' => 'Malang',
                'province' => 'Jawa Timur',
                'postal_code' => '65144',
                'phone' => '0341-464318',
                'email' => 'info@umm.ac.id',
                'website' => 'https://umm.ac.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/id/thumb/9/91/Universitas_Muhammadiyah_Malang_logo.png/1200px-Universitas_Muhammadiyah_Malang_logo.png',
                'accreditation_status' => 'Unggul',
                'cluster' => 'Mandiri',
                'profile_description' => 'Universitas Muhammadiyah Malang merupakan salah satu universitas swasta terbesar di Indonesia dengan fasilitas lengkap dan modern.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'UNISMUH',
                'ptm_code' => '08106',
                'name' => 'Universitas Muhammadiyah Makassar',
                'short_name' => 'UNISMUH Makassar',
                'address' => 'Jl. Sultan Alauddin No.259',
                'city' => 'Makassar',
                'province' => 'Sulawesi Selatan',
                'postal_code' => '90221',
                'phone' => '0411-866972',
                'email' => 'info@unismuh.ac.id',
                'website' => 'https://unismuh.ac.id',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/id/thumb/5/5f/Universitas_Muhammadiyah_Makassar_logo.png/1200px-Universitas_Muhammadiyah_Makassar_logo.png',
                'accreditation_status' => 'Baik',
                'cluster' => 'Madya',
                'profile_description' => 'Universitas Muhammadiyah Makassar adalah perguruan tinggi terkemuka di Sulawesi Selatan dengan komitmen kuat pada pendidikan berkualitas.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('universities')->insert($universities);

        $this->command->info(count($universities).' Universities seeded successfully.');
    }
}
