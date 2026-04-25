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

        $datetime = now()->addDays(3)->format('Y-m-d') . ' 10:00';
        $response = $this->getJson("/api/photographers/{$this->photographer->id}/availability/check?datetime={$datetime}&duration_minutes=120");

        $response->assertOk()
            ->assertJsonPath('available', true);
    }

    public function test_check_returns_unavailable_for_missing_slot(): void
    {
        $datetime = now()->addDays(3)->format('Y-m-d') . ' 10:00';
        $response = $this->getJson("/api/photographers/{$this->photographer->id}/availability/check?datetime={$datetime}&duration_minutes=120");

        $response->assertOk()
            ->assertJsonPath('available', false);
    }

    public function test_slots_endpoint_returns_available_slots(): void
    {
        AvailabilitySlot::factory()
            ->count(3)
            ->available()
            ->sequence(
                ['date' => now()->addDays(1)->format('Y-m-d')],
                ['date' => now()->addDays(2)->format('Y-m-d')],
                ['date' => now()->addDays(3)->format('Y-m-d')],
            )
            ->create([
                'photographer_id' => $this->photographer->id,
            ]);

        $from = now()->format('Y-m-d');
        $to = now()->addMonth()->format('Y-m-d');

        $response = $this->getJson("/api/photographers/{$this->photographer->id}/availability/slots?from={$from}&to={$to}");

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }
}
