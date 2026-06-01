<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FetchIndonesianRegionsCommand extends Command
{
    protected $signature = 'regions:fetch';
    protected $description = 'Fetch Indonesian provinces and cities from BPS API and save to JSON dataset';

    private const BASE_URL = 'https://api-regional-indonesia.vercel.app/api';

    public function handle(): int
    {
        $this->info('Fetching provinces...');

        $provincesRaw = $this->fetchJson(self::BASE_URL . '/provinces?sort=name');
        if ($provincesRaw === null) {
            $this->error('Failed to fetch provinces. Aborting.');
            return self::FAILURE;
        }

        $regions = [];

        foreach ($provincesRaw as $province) {
            $provinceId = $province['id'];
            $provinceName = $province['name'];

            $this->info("Fetching cities for {$provinceName}...");

            $citiesRaw = $this->fetchJson(self::BASE_URL . "/cities/{$provinceId}?sort=name");
            if ($citiesRaw === null) {
                $this->error("Failed to fetch cities for province {$provinceName} (ID: {$provinceId}). Aborting.");
                return self::FAILURE;
            }

            $cities = array_map(function (array $city): array {
                return [
                    'id'   => $city['id'],
                    'name' => $this->stripCityPrefix($city['name']),
                ];
            }, $citiesRaw);

            $this->line("  → {$provinceName}: " . count($cities) . ' cities');

            $regions[] = [
                'id'     => $provinceId,
                'name'   => $provinceName,
                'cities' => $cities,
            ];
        }

        $outputPath = database_path('data/indonesian_regions.json');
        file_put_contents($outputPath, json_encode($regions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $totalCities = array_sum(array_map(fn ($r) => count($r['cities']), $regions));
        $this->info('Done! Saved ' . count($regions) . " provinces and {$totalCities} cities to {$outputPath}");

        return self::SUCCESS;
    }

    private function fetchJson(string $url): ?array
    {
        $context = stream_context_create(['http' => ['timeout' => 15]]);
        $raw = @file_get_contents($url, false, $context);

        if ($raw === false) {
            return null;
        }

        $decoded = json_decode($raw, true);

        if (!isset($decoded['data']) || !is_array($decoded['data'])) {
            return null;
        }

        return $decoded['data'];
    }

    private function stripCityPrefix(string $name): string
    {
        if (str_starts_with($name, 'Kabupaten ')) {
            return substr($name, strlen('Kabupaten '));
        }

        if (str_starts_with($name, 'Kota ')) {
            return substr($name, strlen('Kota '));
        }

        return $name;
    }
}
