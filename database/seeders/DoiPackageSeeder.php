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
                'name' => 'Paket Mandiri Jurnal',
                'slug' => Str::slug('Paket Mandiri Jurnal'),
                'code' => 'DOI-JOURNAL-SINGLE',
                'description' => 'Paket berlangganan DOI mandiri untuk pengelola jurnal tunggal dengan kuota uji similaritas 50 dokumen/tahun.',
                'price_annual' => 1500000,
                'prefix_included' => true,
                'similarity_quota_included' => 50,
                'features' => [
                    'Prefix Resmi Crossref Atas Nama Institusi',
                    'Deposit DOI Tanpa Batas untuk 1 Jurnal',
                    'Alokasi Kuota Uji Plagiasi 50 Dokumen / Tahun',
                    'Integrasi Metadata Otomatis OJS (OAI-PMH)',
                    'Dukungan Teknis Melalui Email & Tiket Bantuan',
                ],
                'is_featured' => false,
                'badge_text' => null,
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Paket Institusi Basic',
                'slug' => Str::slug('Paket Institusi Basic'),
                'code' => 'DOI-INST-BASIC',
                'description' => 'Paket berlangganan DOI untuk institusi skala dasar dengan alokasi kuota uji similaritas 100 dokumen/tahun.',
                'price_annual' => 3500000,
                'prefix_included' => true,
                'similarity_quota_included' => 100,
                'features' => [
                    'Prefix Resmi Crossref Atas Nama Institusi',
                    'Deposit DOI Tanpa Batas untuk Seluruh Jurnal Terdaftar',
                    'Alokasi Kuota Uji Plagiasi 100 Dokumen / Tahun',
                    'Integrasi Metadata Otomatis Melalui OAI-PMH',
                    'Laporan Statistik & Dashboard Sentralisasi Kampus',
                    'Dukungan Teknis Majelis Diktilitbang PPM',
                ],
                'is_featured' => false,
                'badge_text' => null,
                'sort_order' => 2,
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
                'features' => [
                    'Prefix Resmi Crossref Atas Nama Institusi',
                    'Deposit DOI Tanpa Batas untuk Seluruh Jurnal Terdaftar',
                    'Alokasi Kuota Uji Plagiasi 250 Dokumen / Tahun',
                    'Integrasi Metadata Otomatis Melalui OAI-PMH',
                    'Laporan Statistik & Dashboard Sentralisasi Kampus',
                    'Dukungan Teknis Prioritas Majelis Diktilitbang PPM',
                    'Pemeliharaan Tahunan & Notifikasi Masa Berakhir Otomatis',
                ],
                'is_featured' => true,
                'badge_text' => 'Populer',
                'sort_order' => 3,
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
                'features' => [
                    'Prefix Resmi Crossref Atas Nama Institusi',
                    'Deposit DOI Tanpa Batas untuk Seluruh Jurnal Terdaftar',
                    'Alokasi Kuota Uji Plagiasi 500 Dokumen / Tahun',
                    'Integrasi Metadata Otomatis Melalui OAI-PMH',
                    'Laporan Statistik & Dashboard Sentralisasi Kampus',
                    'Dukungan Teknis VIP & Konsultasi Akreditasi SINTA',
                    'Pendampingan Teknis OJS & Migrasi DOI',
                ],
                'is_featured' => false,
                'badge_text' => 'Eksklusif',
                'sort_order' => 4,
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
