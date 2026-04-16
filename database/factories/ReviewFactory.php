<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Photographer;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
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
            'booking_id' => Booking::factory(),
            'rating' => $this->faker->numberBetween(1, 5),
            'comment' => $this->faker->paragraph(),
        ];
    }
}
