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
        $university = \App\Models\University::factory()->create();
        $user = \App\Models\User::factory()->user($university->id)->create();

        return [
            'university_id' => $university->id,
            'user_id' => $user->id,
            'title' => $this->faker->sentence(4),
            'issn' => $this->faker->numerify('####-####'),
            'e_issn' => $this->faker->numerify('####-####'),
            'publisher' => $this->faker->company(),
            'is_active' => true,
        ];
    }
}
