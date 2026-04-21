<?php

namespace Database\Factories;

use App\Models\Photographer;
use App\Models\PhotographerService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PhotographerService>
 */
class PhotographerServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'photographer_id' => Photographer::factory(),
            'name' => $this->faker->word().' Session',
            'description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 50, 500),
            'duration_minutes' => $this->faker->randomElement([30, 60, 90, 120]),
            'minimum_hours' => $this->faker->numberBetween(1, 4),
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
