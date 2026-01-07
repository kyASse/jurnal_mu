<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Journal>
 */
class JournalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'university_id' => \App\Models\University::factory(),
            'user_id' => \App\Models\User::factory(),
            'title' => $this->faker->sentence(4),
            'issn' => $this->faker->numerify('####-####'),
            'e_issn' => $this->faker->numerify('####-####'),
            'publisher' => $this->faker->company(),
            'is_active' => true,
        ];
    }
}
