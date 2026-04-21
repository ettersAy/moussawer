<?php

namespace Tests\Feature\Api\Public;

use App\Models\Photographer;
use App\Models\PhotographerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhotographerSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_list_photographers()
    {
        Photographer::factory()->count(3)->create(['availability_status' => 'available']);

        $response = $this->getJson('/api/photographers');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_it_filters_photographers_by_location()
    {
        $p1 = Photographer::factory()->create(['bio' => 'Based in Paris', 'availability_status' => 'available']);
        $p2 = Photographer::factory()->create(['bio' => 'Based in London', 'availability_status' => 'available']);

        $response = $this->getJson('/api/photographers?location=Paris');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $p1->id);
    }

    public function test_it_filters_photographers_by_category()
    {
        $p1 = Photographer::factory()->create(['availability_status' => 'available']);
        $p2 = Photographer::factory()->create(['availability_status' => 'available']);

        PhotographerService::factory()->create([
            'photographer_id' => $p1->id,
            'name' => 'Wedding Photography',
            'is_active' => true,
        ]);

        PhotographerService::factory()->create([
            'photographer_id' => $p2->id,
            'name' => 'Portrait Photography',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/photographers?category=Wedding');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $p1->id);
    }

    public function test_it_filters_photographers_by_price_range()
    {
        $p1 = Photographer::factory()->create(['hourly_rate' => 50, 'availability_status' => 'available']);
        $p2 = Photographer::factory()->create(['hourly_rate' => 150, 'availability_status' => 'available']);

        $response = $this->getJson('/api/photographers?min_price=100');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $p2->id);

        $response = $this->getJson('/api/photographers?max_price=100');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $p1->id);
    }

    public function test_it_only_shows_available_photographers()
    {
        Photographer::factory()->create(['availability_status' => 'available']);
        Photographer::factory()->create(['availability_status' => 'unavailable']);

        $response = $this->getJson('/api/photographers');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }
}
