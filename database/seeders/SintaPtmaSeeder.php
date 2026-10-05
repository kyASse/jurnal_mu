<?php

namespace Database\Seeders;

use App\Models\University;
use App\Models\UniversitySintaMetric;
use App\Services\Sinta\SintaApiClient;
use Illuminate\Database\Seeder;

class SintaPtmaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeds SINTA metrics for PTMA universities using deterministic mock data.
     */
    public function run(): void
    {
        // Enforce mock mode to guarantee deterministic mock metrics without external API calls
        config(['sinta.mock_mode' => true]);

        $this->command->info('🌱 Seeding SINTA PTMA Metrics...');

        // Ensure universities with ptm_code exist; if empty, seed fallback well-known PTMA
        $universities = University::whereNotNull('ptm_code')
            ->where('ptm_code', '!=', '')
            ->where('is_active', true)
            ->get();

        if ($universities->isEmpty()) {
            $this->command->comment('No active universities with ptm_code found. Creating well-known PTMA institutions...');

            $fallbackUniversities = [
                [
                    'code' => 'UMY',
                    'ptm_code' => '051007',
                    'name' => 'Universitas Muhammadiyah Yogyakarta',
                    'short_name' => 'UMY',
                    'city' => 'Bantul',
                    'province' => 'DI Yogyakarta',
                    'accreditation_status' => 'Unggul',
                    'is_active' => true,
                ],
                [
                    'code' => 'UAD',
                    'ptm_code' => '051013',
                    'name' => 'Universitas Ahmad Dahlan',
                    'short_name' => 'UAD',
                    'city' => 'Yogyakarta',
                    'province' => 'DI Yogyakarta',
                    'accreditation_status' => 'Unggul',
                    'is_active' => true,
                ],
                [
                    'code' => 'UMS',
                    'ptm_code' => '061011',
                    'name' => 'Universitas Muhammadiyah Surakarta',
                    'short_name' => 'UMS',
                    'city' => 'Surakarta',
                    'province' => 'Jawa Tengah',
                    'accreditation_status' => 'Unggul',
                    'is_active' => true,
                ],
                [
                    'code' => 'UMM',
                    'ptm_code' => '071020',
                    'name' => 'Universitas Muhammadiyah Malang',
                    'short_name' => 'UMM',
                    'city' => 'Malang',
                    'province' => 'Jawa Timur',
                    'accreditation_status' => 'Unggul',
                    'is_active' => true,
                ],
                [
                    'code' => 'UNISA_YOGYA',
                    'ptm_code' => '051024',
                    'name' => "Universitas 'Aisyiyah Yogyakarta",
                    'short_name' => 'UNISA',
                    'city' => 'Sleman',
                    'province' => 'DI Yogyakarta',
                    'accreditation_status' => 'Unggul',
                    'is_active' => true,
                ],
            ];

            foreach ($fallbackUniversities as $data) {
                University::updateOrCreate(
                    ['code' => $data['code']],
                    $data
                );
            }

            $universities = University::whereNotNull('ptm_code')
                ->where('ptm_code', '!=', '')
                ->where('is_active', true)
                ->get();
        }

        $client = app(SintaApiClient::class);
        $seededCount = 0;

        $this->command->withProgressBar($universities, function ($university) use ($client, &$seededCount) {
            $metricData = $client->getAffiliationMetric($university->ptm_code);

            UniversitySintaMetric::updateOrCreate(
                ['university_id' => $university->id],
                array_merge($metricData, [
                    'ptm_code' => $university->ptm_code,
                    'sync_status' => 'success',
                    'sync_error' => null,
                    'last_synced_at' => now(),
                ])
            );

            $seededCount++;
        });

        $this->command->newLine(2);
        $this->command->info("✅ Successfully seeded SINTA metrics for {$seededCount} PTMA universities.");
    }
}
