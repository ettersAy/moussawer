<?php

namespace Tests\Feature\Client;

use App\Enums\UserRole;
use App\Models\AvailabilitySlot;
use App\Models\Client;
use App\Models\Photographer;
use App\Models\PhotographerService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientBookingRequestTest extends TestCase
{
    use RefreshDatabase;

    private User $clientUser;
    private Photographer $photographer;
    private PhotographerService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->clientUser = User::factory()->create(['role' => UserRole::Client]);
        Client::factory()->create(['user_id' => $this->clientUser->id]);

        $photographerUser = User::factory()->create(['role' => UserRole::Photographer]);
        $this->photographer = Photographer::factory()->create([
            'user_id' => $photographerUser->id,
            'availability_status' => 'available',
        ]);

        $this->service = PhotographerService::factory()->create([
            'photographer_id' => $this->photographer->id,
            'price' => 500.00,
            'duration_minutes' => 120,
            'is_active' => true,
        ]);

        AvailabilitySlot::factory()->create([
            'photographer_id' => $this->photographer->id,
            'date' => now()->addDays(5)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '17:00',
            'status' => 'available',
        ]);
    }

    public function test_client_can_submit_booking_request(): void
    {
        $response = $this->actingAs($this->clientUser)->postJson('/api/client/bookings', [
            'photographer_id' => $this->photographer->id,
            'photographer_service_id' => $this->service->id,
            'scheduled_date' => now()->addDays(5)->format('Y-m-d 10:00'),
            'location' => 'Test Venue, City',
            'notes' => 'Test notes',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.client_id', $this->clientUser->id)
            ->assertJsonPath('data.photographer_id', $this->photographer->id)
            ->assertJsonPath('data.photographer_service_id', $this->service->id)
            ->assertJsonPath('data.location', 'Test Venue, City')
            ->assertJsonStructure(['data' => ['id', 'duration_minutes', 'client', 'photographer', 'service']]);
    }

    public function test_booking_creates_availability_slot(): void
    {
        $response = $this->actingAs($this->clientUser)->postJson('/api/client/bookings', [
            'photographer_id' => $this->photographer->id,
            'photographer_service_id' => $this->service->id,
            'scheduled_date' => now()->addDays(5)->format('Y-m-d 10:00'),
            'location' => 'Test Venue',
        ]);

        $response->assertStatus(201);

        $bookingId = $response->json('data.id');
        $this->assertDatabaseHas('availability_slots', [
            'photographer_id' => $this->photographer->id,
            'booking_id' => $bookingId,
            'status' => 'booked',
        ]);
    }

    public function test_service_must_belong_to_photographer(): void
    {
        $otherPhotographer = Photographer::factory()->create();
        $otherService = PhotographerService::factory()->create([
            'photographer_id' => $otherPhotographer->id,
        ]);

        $response = $this->actingAs($this->clientUser)->postJson('/api/client/bookings', [
            'photographer_id' => $this->photographer->id,
            'photographer_service_id' => $otherService->id,
            'scheduled_date' => now()->addDays(5)->format('Y-m-d H:i'),
            'location' => 'Test',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photographer_service_id']);
    }

    public function test_booking_rejected_when_no_available_slot(): void
    {
        AvailabilitySlot::where('photographer_id', $this->photographer->id)->delete();

        $response = $this->actingAs($this->clientUser)->postJson('/api/client/bookings', [
            'photographer_id' => $this->photographer->id,
            'photographer_service_id' => $this->service->id,
            'scheduled_date' => now()->addDays(5)->format('Y-m-d H:i'),
            'location' => 'Test',
        ]);

        $response->assertStatus(409);
    }

    public function test_booking_rejected_for_unavailable_photographer(): void
    {
        $this->photographer->update(['availability_status' => 'unavailable']);

        $response = $this->actingAs($this->clientUser)->postJson('/api/client/bookings', [
            'photographer_id' => $this->photographer->id,
            'photographer_service_id' => $this->service->id,
            'scheduled_date' => now()->addDays(5)->format('Y-m-d H:i'),
            'location' => 'Test',
        ]);

        $response->assertStatus(409);
    }

    public function test_unauthenticated_cannot_submit_booking(): void
    {
        $response = $this->postJson('/api/client/bookings', [
            'photographer_id' => $this->photographer->id,
            'photographer_service_id' => $this->service->id,
            'scheduled_date' => now()->addDays(5)->format('Y-m-d H:i'),
            'location' => 'Test',
        ]);

        $response->assertStatus(401);
    }

    public function test_validation_requires_all_fields(): void
    {
        $response = $this->actingAs($this->clientUser)->postJson('/api/client/bookings', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'photographer_id',
                'photographer_service_id',
                'scheduled_date',
                'location',
            ]);
    }

    public function test_booking_rejected_when_slot_time_insufficient(): void
    {
        $response = $this->actingAs($this->clientUser)->postJson('/api/client/bookings', [
            'photographer_id' => $this->photographer->id,
            'photographer_service_id' => $this->service->id,
            'scheduled_date' => now()->addDays(5)->format('Y-m-d 15:00'),
            'duration_minutes' => 180,
            'location' => 'Test',
        ]);

        $response->assertStatus(409);
    }
}
