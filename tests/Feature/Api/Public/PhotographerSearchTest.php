<?php

namespace Tests\Feature\Api\Public;

use App\Models\Photographer;
use App\Models\PhotographerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhotographerSearchTest extends TestCase
{
    use RefreshDatabase;

    // =========================================================================
    // 1.1 Photographer Search (GET /api/photographers)
    // =========================================================================

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

    public function test_it_combines_multiple_filters()
    {
        $p1 = Photographer::factory()->create([
            'bio' => 'Based in Paris',
            'hourly_rate' => 150,
            'availability_status' => 'available',
        ]);
        $p2 = Photographer::factory()->create([
            'bio' => 'Based in London',
            'hourly_rate' => 50,
            'availability_status' => 'available',
        ]);

        PhotographerService::factory()->create([
            'photographer_id' => $p1->id,
            'name' => 'Wedding Photography',
            'is_active' => true,
        ]);
        PhotographerService::factory()->create([
            'photographer_id' => $p2->id,
            'name' => 'Wedding Photography',
            'is_active' => true,
        ]);

        // Combined: location=Paris & category=Wedding & min_price=100
        $response = $this->getJson('/api/photographers?location=Paris&category=Wedding&min_price=100');

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

    public function test_it_returns_pagination_metadata()
    {
        Photographer::factory()->count(20)->create(['availability_status' => 'available']);

        $response = $this->getJson('/api/photographers?per_page=5');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ])
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonPath('meta.total', 20);
    }

    public function test_it_returns_empty_results_when_no_match()
    {
        Photographer::factory()->create(['bio' => 'Based in Paris', 'availability_status' => 'available']);

        $response = $this->getJson('/api/photographers?location=Tokyo');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_it_handles_invalid_parameters_gracefully()
    {
        Photographer::factory()->create(['hourly_rate' => 50, 'availability_status' => 'available']);

        // Negative price should not break the query
        $response = $this->getJson('/api/photographers?min_price=-100');

        $response->assertStatus(200);
    }

    public function test_it_is_publicly_accessible()
    {
        Photographer::factory()->create(['availability_status' => 'available']);

        // No auth token needed
        $response = $this->getJson('/api/photographers');

        $response->assertStatus(200);
    }

    // =========================================================================
    // 1.2 Photographer Profile (GET /api/photographers/{id})
    // =========================================================================

    public function test_it_shows_photographer_profile()
    {
        $photographer = Photographer::factory()->create(['availability_status' => 'available']);

        $response = $this->getJson("/api/photographers/{$photographer->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $photographer->id)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'bio',
                    'hourly_rate',
                    'availability_status',
                    'user',
                    'services',
                ],
            ]);
    }

    public function test_it_shows_photographer_profile_with_services()
    {
        $photographer = Photographer::factory()->create(['availability_status' => 'available']);
        PhotographerService::factory()->count(2)->create([
            'photographer_id' => $photographer->id,
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/photographers/{$photographer->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.services');
    }

    public function test_it_returns_404_for_non_existent_photographer()
    {
        $response = $this->getJson('/api/photographers/99999');

        $response->assertStatus(404);
    }

    public function test_profile_is_publicly_accessible()
    {
        $photographer = Photographer::factory()->create(['availability_status' => 'available']);

        // No auth token needed
        $response = $this->getJson("/api/photographers/{$photographer->id}");

        $response->assertStatus(200);
    }
}
