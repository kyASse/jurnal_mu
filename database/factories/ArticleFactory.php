<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Journal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'journal_id' => Journal::factory(),
            'oai_identifier' => 'oai:jurnalmu.test:' . $this->faker->uuid(),
            'oai_datestamp' => now(),
            'title' => $this->faker->sentence(6),
            'abstract' => $this->faker->paragraph(),
            'authors' => [$this->faker->name(), $this->faker->name()],
            'keywords' => [$this->faker->word(), $this->faker->word()],
            'publication_date' => $this->faker->date(),
            'volume' => (string) $this->faker->numberBetween(1, 20),
            'issue' => (string) $this->faker->numberBetween(1, 4),
            'pages' => $this->faker->numberBetween(1, 10) . '-' . $this->faker->numberBetween(11, 20),
            'article_url' => $this->faker->url(),
            'pdf_url' => $this->faker->url(),
        ];
    }
}
