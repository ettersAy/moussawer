<?php

namespace Tests\Feature\Photographer;

use App\Enums\UserRole;
use App\Models\Photographer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private User $photographer;

    private User $client;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a photographer user
        $this->photographer = User::create([
            'name' => 'John Photographer',
            'email' => 'photographer@example.com',
            'password' => bcrypt('password123'),
            'role' => UserRole::Photographer,
        ]);

        // Create a client user for testing authorization
        $this->client = User::create([
            'name' => 'Jane Client',
            'email' => 'client@example.com',
            'password' => bcrypt('password123'),
            'role' => UserRole::Client,
        ]);
    }

    /**
     * Test that photographer can create a profile.
     */
    public function test_photographer_can_create_profile(): void
    {
        $response = $this->actingAs($this->photographer)->postJson('/api/photographer/profile', [
            'bio' => 'Professional portrait photographer with 10 years of experience',
            'portfolio_url' => 'https://example.com/portfolio',
            'hourly_rate' => 150.00,
            'availability_status' => 'available',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.bio', 'Professional portrait photographer with 10 years of experience')
            ->assertJsonPath('data.hourly_rate', 150)
            ->assertJsonPath('data.availability_status', 'available');

        $this->assertDatabaseHas('photographers', [
            'user_id' => $this->photographer->id,
            'bio' => 'Professional portrait photographer with 10 years of experience',
        ]);
    }

    /**
     * Test that non-photographer cannot create photographer profile.
     */
    public function test_non_photographer_cannot_create_profile(): void
    {
        $response = $this->actingAs($this->client)->postJson('/api/photographer/profile', [
            'bio' => 'Attempting to create photographer profile',
            'hourly_rate' => 150.00,
            'availability_status' => 'available',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Only photographers can create photographer profiles.');
    }

    /**
     * Test that unauthenticated user cannot create profile.
     */
    public function test_unauthenticated_cannot_create_profile(): void
    {
        $response = $this->postJson('/api/photographer/profile', [
            'bio' => 'Attempting without auth',
            'hourly_rate' => 150.00,
            'availability_status' => 'available',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test that photographer cannot create duplicate profile.
     */
    public function test_photographer_cannot_create_duplicate_profile(): void
    {
        // Create first profile
        $this->actingAs($this->photographer)->postJson('/api/photographer/profile', [
            'bio' => 'First profile',
            'hourly_rate' => 150.00,
            'availability_status' => 'available',
        ]);

        // Try to create another
        $response = $this->actingAs($this->photographer)->postJson('/api/photographer/profile', [
            'bio' => 'Second profile',
            'hourly_rate' => 200.00,
            'availability_status' => 'unavailable',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('message', 'Photographer profile already exists. Use PUT to update.');
    }

    /**
     * Test that photographer can fetch their profile.
     */
    public function test_photographer_can_fetch_profile(): void
    {
        // Create profile
        Photographer::create([
            'user_id' => $this->photographer->id,
            'bio' => 'Professional photographer',
            'portfolio_url' => 'https://example.com',
            'hourly_rate' => 150.00,
            'availability_status' => 'available',
        ]);

        $response = $this->actingAs($this->photographer)->getJson('/api/photographer/profile');

        $response->assertStatus(200)
            ->assertJsonPath('data.bio', 'Professional photographer')
            ->assertJsonPath('data.hourly_rate', 150)
            ->assertJsonPath('data.availability_status', 'available');
    }

    /**
     * Test that photographer cannot fetch non-existent profile (404).
     */
    public function test_photographer_cannot_fetch_non_existent_profile(): void
    {
        $response = $this->actingAs($this->photographer)->getJson('/api/photographer/profile');

        $response->assertStatus(404);
    }

    /**
     * Test that photographer can update their profile.
     */
    public function test_photographer_can_update_profile(): void
    {
        // Create profile
        Photographer::create([
            'user_id' => $this->photographer->id,
            'bio' => 'Original bio',
            'portfolio_url' => 'https://example.com',
            'hourly_rate' => 150.00,
            'availability_status' => 'available',
        ]);

        $response = $this->actingAs($this->photographer)->putJson('/api/photographer/profile', [
            'bio' => 'Updated bio',
            'hourly_rate' => 200.00,
            'availability_status' => 'booked',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.bio', 'Updated bio')
            ->assertJsonPath('data.hourly_rate', 200)
            ->assertJsonPath('data.availability_status', 'booked');

        $this->assertDatabaseHas('photographers', [
            'user_id' => $this->photographer->id,
            'bio' => 'Updated bio',
            'hourly_rate' => 200.00,
        ]);
    }

    /**
     * Test that photographer can partially update profile.
     */
    public function test_photographer_can_partially_update_profile(): void
    {
        // Create profile
        Photographer::create([
            'user_id' => $this->photographer->id,
            'bio' => 'Original bio',
            'portfolio_url' => 'https://example.com',
            'hourly_rate' => 150.00,
            'availability_status' => 'available',
        ]);

        // Update only hourly_rate
        $response = $this->actingAs($this->photographer)->putJson('/api/photographer/profile', [
            'hourly_rate' => 300.00,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.bio', 'Original bio') // Should remain unchanged
            ->assertJsonPath('data.hourly_rate', 300);
    }

    /**
     * Test that photographer can delete their profile.
     */
    public function test_photographer_can_delete_profile(): void
    {
        // Create profile
        Photographer::create([
            'user_id' => $this->photographer->id,
            'bio' => 'Profile to delete',
            'hourly_rate' => 150.00,
            'availability_status' => 'available',
        ]);

        $response = $this->actingAs($this->photographer)->deleteJson('/api/photographer/profile');

        $response->assertStatus(204);

        // Verify deletion
        $this->assertDatabaseMissing('photographers', [
            'user_id' => $this->photographer->id,
        ]);
    }

    /**
     * Test profile validation - invalid hourly rate.
     */
    public function test_profile_validation_hourly_rate(): void
    {
        $response = $this->actingAs($this->photographer)->postJson('/api/photographer/profile', [
            'hourly_rate' => -50, // Invalid: negative
            'availability_status' => 'available',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.hourly_rate.0', 'The hourly rate field must be at least 0.01.');
    }

    /**
     * Test profile validation - invalid availability status.
     */
    public function test_profile_validation_availability_status(): void
    {
        $response = $this->actingAs($this->photographer)->postJson('/api/photographer/profile', [
            'hourly_rate' => 150.00,
            'availability_status' => 'invalid_status',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['availability_status']);
    }

    /**
     * Test profile validation - invalid portfolio URL.
     */
    public function test_profile_validation_portfolio_url(): void
    {
        $response = $this->actingAs($this->photographer)->postJson('/api/photographer/profile', [
            'portfolio_url' => 'not-a-valid-url',
            'hourly_rate' => 150.00,
            'availability_status' => 'available',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['portfolio_url']);
    }

    /**
     * Test profile requires hourly_rate on creation.
     */
    public function test_profile_requires_hourly_rate_on_creation(): void
    {
        $response = $this->actingAs($this->photographer)->postJson('/api/photographer/profile', [
            'bio' => 'Missing hourly rate',
            'availability_status' => 'available',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['hourly_rate']);
    }

    /**
     * Test profile requires availability_status on creation.
     */
    public function test_profile_requires_availability_status_on_creation(): void
    {
        $response = $this->actingAs($this->photographer)->postJson('/api/photographer/profile', [
            'bio' => 'Missing availability status',
            'hourly_rate' => 150.00,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['availability_status']);
    }
}
