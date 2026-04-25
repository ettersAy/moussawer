<?php

namespace Tests\Feature\Api\Client;

use App\Enums\UserRole;
use App\Models\AvailabilitySlot;
use App\Models\Photographer;
use App\Models\PhotographerService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingRequestTest extends TestCase
{
    use RefreshDatabase;

    private function createSlot(Photographer $photographer, string $dateTime, int $duration = 120): void
    {
        $start = \Carbon\Carbon::parse($dateTime);
        $end = $start->copy()->addMinutes($duration);
        AvailabilitySlot::factory()->available()->create([
            'photographer_id' => $photographer->id,
            'date' => $start->format('Y-m-d'),
            'start_time' => $start->format('H:i'),
            'end_time' => $end->addHours(2)->format('H:i'), // Give enough buffer
        ]);
    }

    public function test_client_can_create_a_booking_request(): void
    {
        $client = User::factory()->create(['role' => UserRole::Client]);
        $photographerUser = User::factory()->create(['role' => UserRole::Photographer]);
        $photographer = Photographer::factory()->create([
            'user_id' => $photographerUser->id,
            'availability_status' => 'available',
        ]);
        $service = PhotographerService::factory()->create([
            'photographer_id' => $photographer->id,
            'duration_minutes' => 120,
        ]);

        $scheduledDate = now()->addDays(7)->format('Y-m-d 10:00');
        $this->createSlot($photographer, $scheduledDate);

        $bookingData = [
            'photographer_id' => $photographer->id,
            'photographer_service_id' => $service->id,
            'scheduled_date' => $scheduledDate,
            'location' => '123 Test St, Montreal',
            'notes' => 'Looking forward to the shoot!',
        ];

        $response = $this->actingAs($client)
            ->postJson('/api/client/bookings', $bookingData);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.location', $bookingData['location']);

        $this->assertDatabaseHas('bookings', [
            'client_id' => $client->id,
            'photographer_id' => $photographer->id,
            'photographer_service_id' => $service->id,
            'location' => $bookingData['location'],
            'status' => 'pending',
        ]);
    }

    public function test_booking_request_requires_valid_data(): void
    {
        $client = User::factory()->create(['role' => UserRole::Client]);

        $response = $this->actingAs($client)
            ->postJson('/api/client/bookings', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photographer_id', 'photographer_service_id', 'scheduled_date', 'location']);
    }

    public function test_cannot_book_with_past_date(): void
    {
        $client = User::factory()->create(['role' => UserRole::Client]);
        $photographerUser = User::factory()->create(['role' => UserRole::Photographer]);
        $photographer = Photographer::factory()->create(['user_id' => $photographerUser->id]);
        $service = PhotographerService::factory()->create(['photographer_id' => $photographer->id]);

        $bookingData = [
            'photographer_id' => $photographer->id,
            'photographer_service_id' => $service->id,
            'scheduled_date' => now()->subDay()->format('Y-m-d H:i'),
            'location' => '123 Test St, Montreal',
        ];

        $response = $this->actingAs($client)
            ->postJson('/api/client/bookings', $bookingData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['scheduled_date']);
    }
}
