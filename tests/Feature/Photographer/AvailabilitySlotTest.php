<?php

namespace Tests\Feature\Photographer;

use App\Enums\UserRole;
use App\Models\AvailabilitySlot;
use App\Models\Booking;
use App\Models\Photographer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AvailabilitySlotTest extends TestCase
{
    use RefreshDatabase;

    private User $photographerUser;

    private Photographer $photographer;

    private User $clientUser;

    private User $anotherPhotographerUser;

    private Photographer $anotherPhotographer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create photographer
        $this->photographerUser = User::factory()->create(['role' => UserRole::Photographer]);
        $this->photographer = Photographer::factory()->create([
            'user_id' => $this->photographerUser->id,
            'availability_status' => 'available',
        ]);

        // Create another photographer
        $this->anotherPhotographerUser = User::factory()->create(['role' => UserRole::Photographer]);
        $this->anotherPhotographer = Photographer::factory()->create([
            'user_id' => $this->anotherPhotographerUser->id,
            'availability_status' => 'available',
        ]);

        // Create a client
        $this->clientUser = User::factory()->create(['role' => UserRole::Client]);
    }

    // --- Authorization Tests ---

    public function test_photographer_can_list_their_slots(): void
    {
        AvailabilitySlot::factory(3)->create([
            'photographer_id' => $this->photographer->id,
        ]);
        AvailabilitySlot::factory(2)->create([
            'photographer_id' => $this->anotherPhotographer->id,
        ]);

        $response = $this->actingAs($this->photographerUser)
            ->getJson('/api/photographer/availability');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_client_cannot_list_slots(): void
    {
        $response = $this->actingAs($this->clientUser)
            ->getJson('/api/photographer/availability');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_list_slots(): void
    {
        $response = $this->getJson('/api/photographer/availability');

        $response->assertStatus(401);
    }

    // --- Create Tests ---

    public function test_photographer_can_create_slot(): void
    {
        $response = $this->actingAs($this->photographerUser)
            ->postJson('/api/photographer/availability', [
                'slots' => [
                    [
                        'date' => now()->addDays(1)->format('Y-m-d'),
                        'start_time' => '09:00',
                        'end_time' => '17:00',
                        'status' => 'available',
                    ],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.photographer_id', $this->photographer->id)
            ->assertJsonPath('data.0.status', 'available');

        $this->assertDatabaseHas('availability_slots', [
            'photographer_id' => $this->photographer->id,
            'status' => 'available',
        ]);
    }

    public function test_photographer_can_create_multiple_slots(): void
    {
        $response = $this->actingAs($this->photographerUser)
            ->postJson('/api/photographer/availability', [
                'slots' => [
                    [
                        'date' => now()->addDays(1)->format('Y-m-d'),
                        'start_time' => '09:00',
                        'end_time' => '12:00',
                        'status' => 'available',
                    ],
                    [
                        'date' => now()->addDays(1)->format('Y-m-d'),
                        'start_time' => '14:00',
                        'end_time' => '17:00',
                        'status' => 'available',
                    ],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonCount(2, 'data');
    }

    public function test_photographer_can_create_full_day_slot(): void
    {
        $response = $this->actingAs($this->photographerUser)
            ->postJson('/api/photographer/availability', [
                'slots' => [
                    [
                        'date' => now()->addDays(1)->format('Y-m-d'),
                        'status' => 'unavailable',
                    ],
                ],
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('availability_slots', [
            'photographer_id' => $this->photographer->id,
            'start_time' => null,
            'end_time' => null,
            'status' => 'unavailable',
        ]);
    }

    public function test_client_cannot_create_slot(): void
    {
        $response = $this->actingAs($this->clientUser)
            ->postJson('/api/photographer/availability', [
                'slots' => [
                    [
                        'date' => now()->addDays(1)->format('Y-m-d'),
                        'status' => 'available',
                    ],
                ],
            ]);

        $response->assertStatus(403);
    }

    public function test_cannot_create_slot_with_past_date(): void
    {
        $response = $this->actingAs($this->photographerUser)
            ->postJson('/api/photographer/availability', [
                'slots' => [
                    [
                        'date' => now()->subDays(1)->format('Y-m-d'),
                        'status' => 'available',
                    ],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slots.0.date']);
    }

    public function test_cannot_create_overlapping_time_slot(): void
    {
        // Create first slot
        AvailabilitySlot::factory()->create([
            'photographer_id' => $this->photographer->id,
            'date' => now()->addDays(1)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '12:00',
            'status' => 'available',
        ]);

        // Try to create overlapping slot
        $response = $this->actingAs($this->photographerUser)
            ->postJson('/api/photographer/availability', [
                'slots' => [
                    [
                        'date' => now()->addDays(1)->format('Y-m-d'),
                        'start_time' => '10:00',
                        'end_time' => '11:00',
                        'status' => 'available',
                    ],
                ],
            ]);

        $response->assertStatus(409);
    }

    public function test_cannot_create_overlapping_full_day_slot(): void
    {
        // Create a full-day slot
        AvailabilitySlot::factory()->fullDay()->create([
            'photographer_id' => $this->photographer->id,
            'date' => now()->addDays(1)->format('Y-m-d'),
            'status' => 'unavailable',
        ]);

        // Try to create another full-day slot on same date
        $response = $this->actingAs($this->photographerUser)
            ->postJson('/api/photographer/availability', [
                'slots' => [
                    [
                        'date' => now()->addDays(1)->format('Y-m-d'),
                        'status' => 'available',
                    ],
                ],
            ]);

        $response->assertStatus(409);
    }

    public function test_different_photographers_can_have_overlapping_slots(): void
    {
        // Create slot for first photographer
        AvailabilitySlot::factory()->create([
            'photographer_id' => $this->photographer->id,
            'date' => now()->addDays(1)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '12:00',
            'status' => 'available',
        ]);

        // Second photographer can create overlapping slot on same date/time
        $response = $this->actingAs($this->anotherPhotographerUser)
            ->postJson('/api/photographer/availability', [
                'slots' => [
                    [
                        'date' => now()->addDays(1)->format('Y-m-d'),
                        'start_time' => '09:00',
                        'end_time' => '12:00',
                        'status' => 'available',
                    ],
                ],
            ]);

        $response->assertStatus(201);
    }

    // --- List with Filters ---

    public function test_can_list_slots_filtered_by_date_range(): void
    {
        $today = now()->format('Y-m-d');
        $nextWeek = now()->addWeek()->format('Y-m-d');
        $nextMonth = now()->addMonth()->format('Y-m-d');

        AvailabilitySlot::factory()->create([
            'photographer_id' => $this->photographer->id,
            'date' => $nextWeek,
        ]);
        AvailabilitySlot::factory()->create([
            'photographer_id' => $this->photographer->id,
            'date' => $nextMonth,
        ]);

        $response = $this->actingAs($this->photographerUser)
            ->getJson("/api/photographer/availability?from={$today}&to={$nextWeek}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_can_list_slots_filtered_by_status(): void
    {
        AvailabilitySlot::factory()->available()->create([
            'photographer_id' => $this->photographer->id,
        ]);
        AvailabilitySlot::factory()->unavailable()->create([
            'photographer_id' => $this->photographer->id,
        ]);

        $response = $this->actingAs($this->photographerUser)
            ->getJson('/api/photographer/availability?status=available');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'available');
    }

    // --- Update Tests ---

    public function test_photographer_can_update_slot_status(): void
    {
        $slot = AvailabilitySlot::factory()->available()->create([
            'photographer_id' => $this->photographer->id,
        ]);

        $response = $this->actingAs($this->photographerUser)
            ->putJson("/api/photographer/availability/{$slot->id}", [
                'status' => 'unavailable',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'unavailable');

        $this->assertDatabaseHas('availability_slots', [
            'id' => $slot->id,
            'status' => 'unavailable',
        ]);
    }

    public function test_cannot_update_other_photographers_slot(): void
    {
        $slot = AvailabilitySlot::factory()->available()->create([
            'photographer_id' => $this->anotherPhotographer->id,
        ]);

        $response = $this->actingAs($this->photographerUser)
            ->putJson("/api/photographer/availability/{$slot->id}", [
                'status' => 'unavailable',
            ]);

        $response->assertStatus(403);
    }

    public function test_cannot_transition_booked_to_unavailable(): void
    {
        $slot = AvailabilitySlot::factory()->booked()->create([
            'photographer_id' => $this->photographer->id,
        ]);

        $response = $this->actingAs($this->photographerUser)
            ->putJson("/api/photographer/availability/{$slot->id}", [
                'status' => 'unavailable',
            ]);

        $response->assertStatus(422);
    }

    public function test_can_transition_booked_to_available(): void
    {
        $slot = AvailabilitySlot::factory()->booked()->create([
            'photographer_id' => $this->photographer->id,
        ]);

        $response = $this->actingAs($this->photographerUser)
            ->putJson("/api/photographer/availability/{$slot->id}", [
                'status' => 'available',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'available');
    }

    public function test_can_transition_available_to_booked(): void
    {
        $slot = AvailabilitySlot::factory()->available()->create([
            'photographer_id' => $this->photographer->id,
        ]);

        $response = $this->actingAs($this->photographerUser)
            ->putJson("/api/photographer/availability/{$slot->id}", [
                'status' => 'booked',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'booked');
    }

    // --- Delete Tests ---

    public function test_photographer_can_delete_own_slot(): void
    {
        $slot = AvailabilitySlot::factory()->create([
            'photographer_id' => $this->photographer->id,
        ]);

        $response = $this->actingAs($this->photographerUser)
            ->deleteJson("/api/photographer/availability/{$slot->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('availability_slots', ['id' => $slot->id]);
    }

    public function test_cannot_delete_other_photographers_slot(): void
    {
        $slot = AvailabilitySlot::factory()->create([
            'photographer_id' => $this->anotherPhotographer->id,
        ]);

        $response = $this->actingAs($this->photographerUser)
            ->deleteJson("/api/photographer/availability/{$slot->id}");

        $response->assertStatus(403);
    }

    // --- Calendar Tests ---

    public function test_photographer_can_view_calendar(): void
    {
        $currentMonth = now()->format('Y-m');

        AvailabilitySlot::factory()->available()->create([
            'photographer_id' => $this->photographer->id,
            'date' => now()->format('Y-m-d'),
        ]);

        $response = $this->actingAs($this->photographerUser)
            ->getJson("/api/photographer/availability/calendar?month={$currentMonth}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'year',
                'month',
                'days' => [
                    '*' => [
                        'date',
                        'day_of_week',
                        'is_today',
                        'is_past',
                        'total_slots',
                        'available',
                        'unavailable',
                        'booked',
                        'has_slots',
                    ],
                ],
            ]);
    }

    public function test_calendar_shows_correct_counts(): void
    {
        $targetDate = now()->addDays(1)->format('Y-m-d');
        $currentMonth = now()->format('Y-m');

        // Create 2 available and 1 unavailable slot for tomorrow
        AvailabilitySlot::factory()->available()->create([
            'photographer_id' => $this->photographer->id,
            'date' => $targetDate,
            'start_time' => '09:00',
            'end_time' => '12:00',
        ]);
        AvailabilitySlot::factory()->available()->create([
            'photographer_id' => $this->photographer->id,
            'date' => $targetDate,
            'start_time' => '14:00',
            'end_time' => '17:00',
        ]);
        AvailabilitySlot::factory()->unavailable()->create([
            'photographer_id' => $this->photographer->id,
            'date' => $targetDate,
            'start_time' => null,
            'end_time' => null,
        ]);

        $response = $this->actingAs($this->photographerUser)
            ->getJson("/api/photographer/availability/calendar?month={$currentMonth}");

        $response->assertStatus(200);

        $targetData = collect($response->json('days'))->firstWhere('date', $targetDate);

        $this->assertNotNull($targetData);
        $this->assertEquals(3, $targetData['total_slots']);
        $this->assertEquals(2, $targetData['available']);
        $this->assertEquals(1, $targetData['unavailable']);
        $this->assertEquals(0, $targetData['booked']);
        $this->assertTrue($targetData['has_slots']);
    }

    // --- Public Availability Tests ---

    public function test_public_can_view_photographer_availability(): void
    {
        AvailabilitySlot::factory()->available()->create([
            'photographer_id' => $this->photographer->id,
            'date' => now()->addDays(1)->format('Y-m-d'),
        ]);
        AvailabilitySlot::factory()->unavailable()->create([
            'photographer_id' => $this->photographer->id,
            'date' => now()->addDays(1)->format('Y-m-d'),
        ]);

        $response = $this->getJson("/api/photographers/{$this->photographer->id}/availability");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data') // Only available slots
            ->assertJsonPath('data.0.status', 'available');
    }

    public function test_public_availability_only_returns_future_slots(): void
    {
        AvailabilitySlot::factory()->available()->create([
            'photographer_id' => $this->photographer->id,
            'date' => now()->subDays(1)->format('Y-m-d'), // Past
        ]);
        AvailabilitySlot::factory()->available()->create([
            'photographer_id' => $this->photographer->id,
            'date' => now()->addDays(1)->format('Y-m-d'), // Future
        ]);

        $response = $this->getJson("/api/photographers/{$this->photographer->id}/availability");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    // --- Booking Integration Tests ---

    public function test_booking_creates_availability_slot(): void
    {
        $response = $this->actingAs($this->clientUser)
            ->postJson('/api/bookings', [
                'photographer_id' => $this->photographer->id,
                'scheduled_date' => now()->addDays(5)->toDateTimeString(),
                'notes' => 'Test booking',
            ]);

        $response->assertStatus(201);

        $bookingId = $response->json('data.id');

        $this->assertDatabaseHas('availability_slots', [
            'photographer_id' => $this->photographer->id,
            'booking_id' => $bookingId,
            'status' => 'booked',
        ]);
    }

    public function test_cancelled_booking_frees_availability_slot(): void
    {
        // Create a booking first
        $response = $this->actingAs($this->clientUser)
            ->postJson('/api/bookings', [
                'photographer_id' => $this->photographer->id,
                'scheduled_date' => now()->addDays(5)->toDateTimeString(),
                'notes' => 'Test booking',
            ]);

        $bookingId = $response->json('data.id');

        // Cancel the booking as the photographer (who has permission)
        $this->actingAs($this->photographerUser)
            ->patchJson("/api/bookings/{$bookingId}/status", [
                'status' => 'cancelled',
            ]);

        // The slot should now be available with no booking_id
        $this->assertDatabaseHas('availability_slots', [
            'photographer_id' => $this->photographer->id,
            'booking_id' => null,
            'status' => 'available',
        ]);
    }

    public function test_cannot_book_when_existing_booked_slot_exists(): void
    {
        $targetDate = now()->addDays(5)->format('Y-m-d');

        // Create a booked slot for this photographer on a future date
        AvailabilitySlot::factory()->booked()->create([
            'photographer_id' => $this->photographer->id,
            'date' => $targetDate,
        ]);

        // Try to create a booking on the same date
        $response = $this->actingAs($this->clientUser)
            ->postJson('/api/bookings', [
                'photographer_id' => $this->photographer->id,
                'scheduled_date' => $targetDate,
                'notes' => 'Double booking attempt',
            ]);

        $response->assertStatus(409);
    }

    // --- Edge Cases ---

    public function test_photographer_without_profile_cannot_manage_slots(): void
    {
        $userWithoutProfile = User::factory()->create(['role' => UserRole::Photographer]);

        $response = $this->actingAs($userWithoutProfile)
            ->getJson('/api/photographer/availability');

        $response->assertStatus(404);
    }

    public function test_empty_slots_array_validation(): void
    {
        $response = $this->actingAs($this->photographerUser)
            ->postJson('/api/photographer/availability', [
                'slots' => [],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slots']);
    }

    public function test_invalid_status_validation(): void
    {
        $response = $this->actingAs($this->photographerUser)
            ->postJson('/api/photographer/availability', [
                'slots' => [
                    [
                        'date' => now()->addDays(1)->format('Y-m-d'),
                        'status' => 'invalid_status',
                    ],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slots.0.status']);
    }
}
