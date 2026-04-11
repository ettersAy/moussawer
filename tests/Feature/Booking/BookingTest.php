<?php

namespace Tests\Feature\Booking;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Photographer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    private User $clientUser;

    private User $photographerUser;

    private Photographer $photographer;

    private User $anotherClientUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create client
        $this->clientUser = User::factory()->create(['role' => UserRole::Client]);

        // Create photographer
        $this->photographerUser = User::factory()->create(['role' => UserRole::Photographer]);
        $this->photographer = Photographer::factory()->create([
            'user_id' => $this->photographerUser->id,
            'availability_status' => 'available',
        ]);

        // Create another client
        $this->anotherClientUser = User::factory()->create(['role' => UserRole::Client]);
    }

    /**
     * Test client can create booking
     */
    public function test_client_can_create_booking(): void
    {
        $response = $this->actingAs($this->clientUser)->postJson('/api/bookings', [
            'photographer_id' => $this->photographer->id,
            'scheduled_date' => now()->addDays(5)->toDateTimeString(),
            'notes' => 'Family portrait session',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.client_id', $this->clientUser->id)
            ->assertJsonPath('data.photographer_id', $this->photographer->id)
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('bookings', [
            'client_id' => $this->clientUser->id,
            'photographer_id' => $this->photographer->id,
            'status' => 'pending',
        ]);
    }

    /**
     * Test non-client cannot create booking
     */
    public function test_non_client_cannot_create_booking(): void
    {
        $response = $this->actingAs($this->photographerUser)->postJson('/api/bookings', [
            'photographer_id' => $this->photographer->id,
            'scheduled_date' => now()->addDays(5)->toDateTimeString(),
            'notes' => 'Try to book',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test unauthenticated cannot create booking
     */
    public function test_unauthenticated_cannot_create_booking(): void
    {
        $response = $this->postJson('/api/bookings', [
            'photographer_id' => $this->photographer->id,
            'scheduled_date' => now()->addDays(5)->toDateTimeString(),
            'notes' => 'Try to book',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test cannot create booking when photographer is not available
     */
    public function test_cannot_create_booking_when_photographer_not_available(): void
    {
        $this->photographer->update(['availability_status' => 'booked']);

        $response = $this->actingAs($this->clientUser)->postJson('/api/bookings', [
            'photographer_id' => $this->photographer->id,
            'scheduled_date' => now()->addDays(5)->toDateTimeString(),
            'notes' => 'Try to book',
        ]);

        $response->assertStatus(409);
    }

    /**
     * Test cannot create booking with past date
     */
    public function test_cannot_create_booking_with_past_date(): void
    {
        $response = $this->actingAs($this->clientUser)->postJson('/api/bookings', [
            'photographer_id' => $this->photographer->id,
            'scheduled_date' => now()->subDays(1)->toDateTimeString(),
            'notes' => 'Past date booking',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['scheduled_date']);
    }

    /**
     * Test cannot create booking with invalid photographer_id
     */
    public function test_cannot_create_booking_with_invalid_photographer_id(): void
    {
        $response = $this->actingAs($this->clientUser)->postJson('/api/bookings', [
            'photographer_id' => 9999,
            'scheduled_date' => now()->addDays(5)->toDateTimeString(),
            'notes' => 'Invalid photographer',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photographer_id']);
    }

    /**
     * Test client can list their bookings
     */
    public function test_client_can_list_their_bookings(): void
    {
        // Create bookings for this client
        Booking::factory(3)->create(['client_id' => $this->clientUser->id]);

        // Create bookings for another client
        Booking::factory(2)->create(['client_id' => $this->anotherClientUser->id]);

        $response = $this->actingAs($this->clientUser)->getJson('/api/bookings');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /**
     * Test photographer can list their bookings
     */
    public function test_photographer_can_list_their_bookings(): void
    {
        // Create bookings for this photographer
        Booking::factory(3)->create(['photographer_id' => $this->photographer->id]);

        // Create another photographer with bookings
        $anotherPhotographer = Photographer::factory()->create();
        Booking::factory(2)->create(['photographer_id' => $anotherPhotographer->id]);

        $response = $this->actingAs($this->photographerUser)->getJson('/api/bookings');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /**
     * Test can list bookings filtered by status
     */
    public function test_can_list_bookings_filtered_by_status(): void
    {
        Booking::factory(2)->create(['client_id' => $this->clientUser->id, 'status' => 'pending']);
        Booking::factory(1)->create(['client_id' => $this->clientUser->id, 'status' => 'confirmed']);

        $response = $this->actingAs($this->clientUser)->getJson('/api/bookings?status=pending');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test client can view their booking
     */
    public function test_client_can_view_their_booking(): void
    {
        $booking = Booking::factory()->create(['client_id' => $this->clientUser->id]);

        $response = $this->actingAs($this->clientUser)->getJson("/api/bookings/{$booking->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $booking->id)
            ->assertJsonPath('data.client_id', $this->clientUser->id);
    }

    /**
     * Test photographer can view their booking
     */
    public function test_photographer_can_view_their_booking(): void
    {
        $booking = Booking::factory()->create(['photographer_id' => $this->photographer->id]);

        $response = $this->actingAs($this->photographerUser)->getJson("/api/bookings/{$booking->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $booking->id);
    }

    /**
     * Test cannot view other's booking
     */
    public function test_cannot_view_others_booking(): void
    {
        $booking = Booking::factory()->create(['client_id' => $this->anotherClientUser->id]);

        $response = $this->actingAs($this->clientUser)->getJson("/api/bookings/{$booking->id}");

        $response->assertStatus(403);
    }

    /**
     * Test cannot view non-existent booking
     */
    public function test_cannot_view_non_existent_booking(): void
    {
        $response = $this->actingAs($this->clientUser)->getJson('/api/bookings/9999');

        $response->assertStatus(404);
    }

    /**
     * Test photographer can confirm pending booking
     */
    public function test_photographer_can_confirm_pending_booking(): void
    {
        $booking = Booking::factory()->create([
            'photographer_id' => $this->photographer->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->photographerUser)->patchJson(
            "/api/bookings/{$booking->id}/status",
            ['status' => 'confirmed']
        );

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
        ]);
    }

    /**
     * Test photographer can complete confirmed booking
     */
    public function test_photographer_can_complete_confirmed_booking(): void
    {
        $booking = Booking::factory()->create([
            'photographer_id' => $this->photographer->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->photographerUser)->patchJson(
            "/api/bookings/{$booking->id}/status",
            ['status' => 'completed']
        );

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');
    }

    /**
     * Test photographer can cancel pending booking
     */
    public function test_photographer_can_cancel_pending_booking(): void
    {
        $booking = Booking::factory()->create([
            'photographer_id' => $this->photographer->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->photographerUser)->patchJson(
            "/api/bookings/{$booking->id}/status",
            ['status' => 'cancelled']
        );

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled');
    }

    /**
     * Test invalid status transition is rejected
     */
    public function test_invalid_status_transition_is_rejected(): void
    {
        $booking = Booking::factory()->create([
            'photographer_id' => $this->photographer->id,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->photographerUser)->patchJson(
            "/api/bookings/{$booking->id}/status",
            ['status' => 'pending']
        );

        $response->assertStatus(422);
    }

    /**
     * Test client cannot update booking status
     */
    public function test_client_cannot_update_booking_status(): void
    {
        $booking = Booking::factory()->create([
            'client_id' => $this->clientUser->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->clientUser)->patchJson(
            "/api/bookings/{$booking->id}/status",
            ['status' => 'confirmed']
        );

        $response->assertStatus(403);
    }

    /**
     * Test cannot update status of non-existent booking
     */
    public function test_cannot_update_status_of_non_existent_booking(): void
    {
        $response = $this->actingAs($this->photographerUser)->patchJson(
            '/api/bookings/9999/status',
            ['status' => 'confirmed']
        );

        $response->assertStatus(404);
    }

    /**
     * Test client can delete their pending booking
     */
    public function test_client_can_delete_their_pending_booking(): void
    {
        $booking = Booking::factory()->create([
            'client_id' => $this->clientUser->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->clientUser)->deleteJson("/api/bookings/{$booking->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('bookings', ['id' => $booking->id]);
    }

    /**
     * Test client cannot delete confirmed booking
     */
    public function test_client_cannot_delete_confirmed_booking(): void
    {
        $booking = Booking::factory()->create([
            'client_id' => $this->clientUser->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->clientUser)->deleteJson("/api/bookings/{$booking->id}");

        $response->assertStatus(403);
    }

    /**
     * Test photographer cannot delete booking
     */
    public function test_photographer_cannot_delete_booking(): void
    {
        $booking = Booking::factory()->create([
            'photographer_id' => $this->photographer->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->photographerUser)->deleteJson("/api/bookings/{$booking->id}");

        $response->assertStatus(403);
    }

    /**
     * Test booking response includes relationships
     */
    public function test_booking_response_includes_relationships(): void
    {
        $booking = Booking::factory()->create([
            'client_id' => $this->clientUser->id,
            'photographer_id' => $this->photographer->id,
        ]);

        $response = $this->actingAs($this->clientUser)->getJson("/api/bookings/{$booking->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.client.id', $this->clientUser->id)
            ->assertJsonPath('data.client.name', $this->clientUser->name)
            ->assertJsonPath('data.photographer.id', $this->photographer->id)
            ->assertJsonPath('data.photographer.user.name', $this->photographerUser->name);
    }
}
