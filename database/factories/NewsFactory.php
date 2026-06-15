<?php

namespace Database\Factories;

use App\Models\News;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<News>
 */
class NewsFactory extends Factory
{
    protected $model = News::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(6),
            'slug' => $this->faker->unique()->slug(),
            'subtitle' => $this->faker->sentence(10),
            'body' => $this->faker->paragraphs(3, true),
            'thumbnail' => null,
            'image' => null,
            'tags' => ['Laravel', 'React', 'PHP'],
            'views' => 0,
            'is_active' => true,
            'author_id' => User::factory(),
            'published_at' => now(),
        ];
    }
}
