<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Province;
use Illuminate\Database\Seeder;

class IndonesianRegionsSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/indonesian_regions.json');

        if (! file_exists($jsonPath)) {
            $this->command->error("JSON file not found at: {$jsonPath}");
            return;
        }

        $regions = json_decode(file_get_contents($jsonPath), true);

        foreach ($regions as $provinceData) {
            $province = Province::updateOrCreate(
                ['id' => $provinceData['id']],
                ['name' => $provinceData['name']]
            );

            foreach ($provinceData['cities'] as $cityData) {
                City::updateOrCreate(
                    ['id' => $cityData['id']],
                    [
                        'province_id' => $province->id,
                        'name' => $cityData['name'],
                    ]
                );
            }
        }
    }
}
