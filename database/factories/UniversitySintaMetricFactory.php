<?php

namespace Database\Factories;

use App\Models\University;
use App\Models\UniversitySintaMetric;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UniversitySintaMetric>
 */
class UniversitySintaMetricFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = UniversitySintaMetric::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $scopus = $this->faker->numberBetween(50, 1800);
        $garuda = $this->faker->numberBetween(200, 4500);
        $wos = $this->faker->numberBetween(20, 600);
        $google = $this->faker->numberBetween(500, 12000);
        $research = $this->faker->numberBetween(30, 450);
        $service = $this->faker->numberBetween(20, 300);
        $ipr = $this->faker->numberBetween(10, 250);
        $book = $this->faker->numberBetween(15, 350);

        $scoreOverall = ($scopus * 40) + ($garuda * 15) + ($wos * 35) + ($research * 25) + ($ipr * 30);
        $score3Yr = $scoreOverall * 0.42;

        return [
            'university_id' => University::factory(),
            'sinta_id' => 'SINTA-' . $this->faker->numerify('#####'),
            'ptm_code' => $this->faker->numerify('051###'),
            'sinta_score_overall' => round($scoreOverall, 2),
            'sinta_score_3yr' => round($score3Yr, 2),
            'national_rank_overall' => $this->faker->numberBetween(1, 450),
            'national_rank_3yr' => $this->faker->numberBetween(1, 450),
            'scopus_docs' => $scopus,
            'scopus_citations' => $scopus * $this->faker->numberBetween(3, 8),
            'wos_docs' => $wos,
            'wos_citations' => $wos * $this->faker->numberBetween(2, 6),
            'garuda_docs' => $garuda,
            'garuda_citations' => $garuda * $this->faker->numberBetween(1, 4),
            'google_docs' => $google,
            'google_citations' => $google * $this->faker->numberBetween(4, 12),
            'research_count' => $research,
            'service_count' => $service,
            'ipr_count' => $ipr,
            'book_count' => $book,
            'authors_count' => $this->faker->numberBetween(40, 850),
            'departments_count' => $this->faker->numberBetween(12, 65),
            'journals_count' => $this->faker->numberBetween(3, 35),
            'raw_payload' => ['mock' => true],
            'sync_status' => 'success',
            'sync_error' => null,
            'last_synced_at' => now(),
        ];
    }
}
