<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Photographer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Photographer>
 */
class PhotographerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->create(['role' => UserRole::Photographer])->id,
            'bio' => $this->faker->paragraph(),
            'hourly_rate' => $this->faker->randomFloat(2, 25, 500),
            'availability_status' => $this->faker->randomElement(['available', 'unavailable', 'booked']),
        ];
    }
}
