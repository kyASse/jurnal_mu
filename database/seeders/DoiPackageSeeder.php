<?php

namespace Database\Seeders;

use App\Models\DoiPackage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DoiPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Paket Institusi Basic',
                'slug' => Str::slug('Paket Institusi Basic'),
                'code' => 'DOI-INST-BASIC',
                'description' => 'Paket berlangganan DOI untuk institusi skala dasar dengan alokasi kuota uji similaritas 100 dokumen/tahun.',
                'price_annual' => 3500000,
                'prefix_included' => true,
                'similarity_quota_included' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Paket Institusi Standard',
                'slug' => Str::slug('Paket Institusi Standard'),
                'code' => 'DOI-INST-STD',
                'description' => 'Paket berlangganan DOI untuk institusi skala menengah dengan alokasi kuota uji similaritas 250 dokumen/tahun.',
                'price_annual' => 6000000,
                'prefix_included' => true,
                'similarity_quota_included' => 250,
                'is_active' => true,
            ],
            [
                'name' => 'Paket Institusi Premium',
                'slug' => Str::slug('Paket Institusi Premium'),
                'code' => 'DOI-INST-PREM',
                'description' => 'Paket berlangganan DOI untuk institusi skala besar dengan alokasi kuota uji similaritas 500 dokumen/tahun.',
                'price_annual' => 10000000,
                'prefix_included' => true,
                'similarity_quota_included' => 500,
                'is_active' => true,
            ],
            [
                'name' => 'Paket Mandiri Jurnal',
                'slug' => Str::slug('Paket Mandiri Jurnal'),
                'code' => 'DOI-JOURNAL-SINGLE',
                'description' => 'Paket berlangganan DOI mandiri untuk pengelola jurnal tunggal dengan kuota uji similaritas 50 dokumen/tahun.',
                'price_annual' => 1500000,
                'prefix_included' => true,
                'similarity_quota_included' => 50,
                'is_active' => true,
            ],
        ];

        foreach ($packages as $package) {
            DoiPackage::updateOrCreate(
                ['code' => $package['code']],
                $package
            );
        }
    }
}
