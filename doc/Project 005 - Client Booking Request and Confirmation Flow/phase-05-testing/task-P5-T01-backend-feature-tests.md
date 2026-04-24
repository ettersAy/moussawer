# Task P5-T01: Backend Feature Tests for Booking Flow

## Context
The existing `BookingTest.php` covers CRUD operations on `/api/bookings`. We need tests for the new client-specific flow via `POST /api/client/bookings` (the `BookingRequestController` + `BookingService` flow), plus the new `AvailabilityService` and `AvailabilityCheckController`.

## Changes

### A. New Test: `tests/Feature/Client/ClientBookingRequestTest.php`
Tests the **client-facing** booking flow end-to-end.

```php
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

        // Create an available slot for the photographer
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
            'scheduled_date' => now()->addDays(5)->format('Y-m-d H:i'),
            'location' => 'Test Venue, City',
            'notes' => 'Test notes',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.client_id', $this->clientUser->id)
            ->assertJsonPath('data.photographer_id', $this->photographer->id)
            ->assertJsonPath('data.photographer_service_id', $this->service->id)
            ->assertJsonPath('data.location', 'Test Venue, City')
            ->assertJsonPath('data.duration_minutes', 120) // defaults from service
            ->assertJsonStructure(['data' => ['id', 'client', 'photographer', 'service']]);
    }

    public function test_booking_creates_availability_slot(): void
    {
        $response = $this->actingAs($this->clientUser)->postJson('/api/client/bookings', [
            'photographer_id' => $this->photographer->id,
            'photographer_service_id' => $this->service->id,
            'scheduled_date' => now()->addDays(5)->format('Y-m-d H:i'),
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
        // Delete the available slot
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
}
```

### B. New Test: `tests/Feature/Api/Public/AvailabilityCheckTest.php`
Tests the new public availability check endpoint.

```php
<?php

namespace Tests\Feature\Api\Public;

use App\Models\AvailabilitySlot;
use App\Models\Photographer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AvailabilityCheckTest extends TestCase
{
    use RefreshDatabase;

    private Photographer $photographer;

    protected function setUp(): void
    {
        parent::setUp();
        $user = User::factory()->create();
        $this->photographer = Photographer::factory()->create([
            'user_id' => $user->id,
            'availability_status' => 'available',
        ]);
    }

    public function test_check_returns_available_for_valid_slot(): void
    {
        AvailabilitySlot::factory()->create([
            'photographer_id' => $this->photographer->id,
            'date' => now()->addDays(3)->format('Y-m-d'),
            'start_time' => '10:00',
            'end_time' => '16:00',
            'status' => 'available',
        ]);

        $response = $this->getJson("/api/photographers/{$this->photographer->id}/availability/check", [
            'datetime' => now()->addDays(3)->format('Y-m-d') . ' 10:00',
            'duration_minutes' => 120,
        ]);

        $response->assertOk()
            ->assertJsonPath('available', true);
    }

    public function test_check_returns_unavailable_for_missing_slot(): void
    {
        $response = $this->getJson("/api/photographers/{$this->photographer->id}/availability/check", [
            'datetime' => now()->addDays(3)->format('Y-m-d') . ' 10:00',
            'duration_minutes' => 120,
        ]);

        $response->assertOk()
            ->assertJsonPath('available', false);
    }

    public function test_slots_endpoint_returns_available_slots(): void
    {
        AvailabilitySlot::factory()->count(3)->create([
            'photographer_id' => $this->photographer->id,
            'status' => 'available',
        ]);

        $from = now()->format('Y-m-d');
        $to = now()->addMonth()->format('Y-m-d');

        $response = $this->getJson("/api/photographers/{$this->photographer->id}/availability/slots", [
            'from' => $from,
            'to' => $to,
        ]);

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }
}
```

### C. Add `AvailabilitySlot` factory (if not existing)
```php
// database/factories/AvailabilitySlotFactory.php
public function definition(): array
{
    return [
        'photographer_id' => Photographer::factory(),
        'date' => fake()->dateTimeBetween('+1 week', '+1 month')->format('Y-m-d'),
        'start_time' => fake()->randomElement(['09:00', '10:00', '11:00']),
        'end_time' => fake()->randomElement(['12:00', '14:00', '17:00']),
        'status' => 'available',
    ];
}
```

### D. Update `BookingServiceTest` (if separate)
If `tests/Feature/Api/Client/` already exists, add a test for `BookingService` directly.

## Validation
- All new tests pass: `sail artisan test --filter=ClientBookingRequest --compact`
- All existing tests still pass.
- Coverage includes: success path, validation errors, auth guard, service mismatch, availability rejection, slot creation.

## Files Created/Modified
- `tests/Feature/Client/ClientBookingRequestTest.php` (NEW)
- `tests/Feature/Api/Public/AvailabilityCheckTest.php` (NEW)
- `database/factories/AvailabilitySlotFactory.php` (if missing)
