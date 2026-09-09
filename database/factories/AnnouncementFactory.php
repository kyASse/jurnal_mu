<?php

namespace Database\Factories;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

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
            'summary' => $this->faker->sentence(10),
            'body' => $this->faker->paragraphs(3, true),
            'attachment_path' => null,
            'attachment_name' => null,
            'target_audience' => 'public',
            'tags' => [],
            'is_pinned' => false,
            'is_active' => true,
            'views' => 0,
            'author_id' => User::factory(),
            'published_at' => now(),
        ];
    }
}
