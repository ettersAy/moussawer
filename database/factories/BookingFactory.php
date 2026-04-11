<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Photographer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => User::factory()->create(['role' => UserRole::Client])->id,
            'photographer_id' => Photographer::factory(),
            'scheduled_date' => $this->faker->dateTimeBetween('+1 week', '+3 months'),
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'completed', 'cancelled']),
            'notes' => $this->faker->paragraph(),
        ];
    }
}
