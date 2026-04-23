<?php

namespace Database\Factories;

use App\Models\AvailabilitySlot;
use App\Models\Photographer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AvailabilitySlot>
 */
class AvailabilitySlotFactory extends Factory
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
            'date' => $this->faker->dateTimeBetween('today', '+2 months')->format('Y-m-d'),
            'start_time' => $this->faker->randomElement(['09:00', '10:00', '11:00', '14:00']),
            'end_time' => $this->faker->randomElement(['10:00', '11:00', '12:00', '15:00']),
            'status' => $this->faker->randomElement(['available', 'unavailable', 'booked']),
        ];
    }

    /**
     * Indicate that the slot is available.
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'available',
        ]);
    }

    /**
     * Indicate that the slot is unavailable.
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'unavailable',
        ]);
    }

    /**
     * Indicate that the slot is booked.
     */
    public function booked(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'booked',
        ]);
    }

    /**
     * Indicate a full-day slot (no time range).
     */
    public function fullDay(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_time' => null,
            'end_time' => null,
        ]);
    }
}
