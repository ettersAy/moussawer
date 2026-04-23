<?php

namespace Tests\Feature\Client;

use App\Enums\UserRole;
use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private User $client;

    private User $photographer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a client user
        $this->client = User::create([
            'name' => 'Jane Client',
            'email' => 'client@example.com',
            'password' => bcrypt('password123'),
            'role' => UserRole::Client,
        ]);

        // Create a photographer user for testing authorization
        $this->photographer = User::create([
            'name' => 'John Photographer',
            'email' => 'photographer@example.com',
            'password' => bcrypt('password123'),
            'role' => UserRole::Photographer,
        ]);
    }

    /**
     * Test that client can create a profile.
     */
    public function test_client_can_create_profile(): void
    {
        $response = $this->actingAs($this->client)->postJson('/api/client/profile', [
            'phone' => '+14155552671',
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'H1H 1H1',
            'preferred_contact' => 'email',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.phone', '+14155552671')
            ->assertJsonPath('data.city', 'Montreal')
            ->assertJsonPath('data.preferred_contact', 'email');

        $this->assertDatabaseHas('clients', [
            'user_id' => $this->client->id,
            'phone' => '+14155552671',
        ]);
    }

    /**
     * Test that non-client cannot create client profile.
     */
    public function test_non_client_cannot_create_profile(): void
    {
        $response = $this->actingAs($this->photographer)->postJson('/api/client/profile', [
            'phone' => '+14155552671',
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'H1H 1H1',
            'preferred_contact' => 'email',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Only clients can create client profiles.');
    }

    /**
     * Test that unauthenticated user cannot create profile.
     */
    public function test_unauthenticated_cannot_create_profile(): void
    {
        $response = $this->postJson('/api/client/profile', [
            'phone' => '+14155552671',
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'H1H 1H1',
            'preferred_contact' => 'email',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test that client cannot create duplicate profile.
     */
    public function test_client_cannot_create_duplicate_profile(): void
    {
        // Create first profile
        $this->actingAs($this->client)->postJson('/api/client/profile', [
            'phone' => '+14155552671',
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'H1H 1H1',
            'preferred_contact' => 'email',
        ]);

        // Try to create another
        $response = $this->actingAs($this->client)->postJson('/api/client/profile', [
            'phone' => '+14155552672',
            'address' => '456 Oak Avenue',
            'city' => 'Toronto',
            'province' => 'ON',
            'postal_code' => 'M5V 3A8',
            'preferred_contact' => 'phone',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('message', 'Client profile already exists. Use PUT to update.');
    }

    /**
     * Test that client can fetch their profile.
     */
    public function test_client_can_fetch_profile(): void
    {
        // Create profile
        Client::create([
            'user_id' => $this->client->id,
            'phone' => '+14155552671',
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'H1H 1H1',
            'preferred_contact' => 'email',
        ]);

        $response = $this->actingAs($this->client)->getJson('/api/client/profile');

        $response->assertStatus(200)
            ->assertJsonPath('data.phone', '+14155552671')
            ->assertJsonPath('data.city', 'Montreal')
            ->assertJsonPath('data.preferred_contact', 'email');
    }

    /**
     * Test that client gets null data when no profile exists.
     */
    public function test_client_gets_null_data_when_no_profile(): void
    {
        $response = $this->actingAs($this->client)->getJson('/api/client/profile');

        $response->assertStatus(200)
            ->assertJsonPath('data', null)
            ->assertJsonPath('message', 'Client profile not found. Please create one.');
    }

    /**
     * Test that client can update their profile.
     */
    public function test_client_can_update_profile(): void
    {
        // Create profile
        Client::create([
            'user_id' => $this->client->id,
            'phone' => '+14155552671',
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'H1H 1H1',
            'preferred_contact' => 'email',
        ]);

        $response = $this->actingAs($this->client)->putJson('/api/client/profile', [
            'phone' => '+14155552672',
            'city' => 'Toronto',
            'preferred_contact' => 'phone',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.phone', '+14155552672')
            ->assertJsonPath('data.city', 'Toronto')
            ->assertJsonPath('data.preferred_contact', 'phone');

        $this->assertDatabaseHas('clients', [
            'user_id' => $this->client->id,
            'phone' => '+14155552672',
            'city' => 'Toronto',
        ]);
    }

    /**
     * Test that client can partially update profile.
     */
    public function test_client_can_partially_update_profile(): void
    {
        // Create profile
        Client::create([
            'user_id' => $this->client->id,
            'phone' => '+14155552671',
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'H1H 1H1',
            'preferred_contact' => 'email',
        ]);

        // Update only phone
        $response = $this->actingAs($this->client)->putJson('/api/client/profile', [
            'phone' => '+14155552999',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.address', '123 Main Street') // Should remain unchanged
            ->assertJsonPath('data.phone', '+14155552999');
    }

    /**
     * Test that client can delete their profile.
     */
    public function test_client_can_delete_profile(): void
    {
        // Create profile
        Client::create([
            'user_id' => $this->client->id,
            'phone' => '+14155552671',
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'H1H 1H1',
            'preferred_contact' => 'email',
        ]);

        $response = $this->actingAs($this->client)->deleteJson('/api/client/profile');

        $response->assertStatus(204);

        // Verify deletion
        $this->assertDatabaseMissing('clients', [
            'user_id' => $this->client->id,
        ]);
    }

    /**
     * Test profile validation - invalid phone number.
     */
    public function test_profile_validation_phone(): void
    {
        $response = $this->actingAs($this->client)->postJson('/api/client/profile', [
            'phone' => 'not-a-phone', // Invalid: doesn't match E.164 format
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'H1H 1H1',
            'preferred_contact' => 'email',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    /**
     * Test profile validation - invalid postal code.
     */
    public function test_profile_validation_postal_code(): void
    {
        $response = $this->actingAs($this->client)->postJson('/api/client/profile', [
            'phone' => '+14155552671',
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'INVALID', // Invalid: not matching Canadian postal code format
            'preferred_contact' => 'email',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['postal_code']);
    }

    /**
     * Test profile validation - invalid preferred contact.
     */
    public function test_profile_validation_preferred_contact(): void
    {
        $response = $this->actingAs($this->client)->postJson('/api/client/profile', [
            'phone' => '+14155552671',
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'H1H 1H1',
            'preferred_contact' => 'telegram', // Invalid: not in allowed values
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['preferred_contact']);
    }

    /**
     * Test profile requires phone on creation.
     */
    public function test_profile_requires_phone_on_creation(): void
    {
        $response = $this->actingAs($this->client)->postJson('/api/client/profile', [
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'H1H 1H1',
            'preferred_contact' => 'email',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    /**
     * Test profile allows nullable fields on update.
     */
    public function test_profile_allows_nullable_fields_on_update(): void
    {
        // Create profile
        Client::create([
            'user_id' => $this->client->id,
            'phone' => '+14155552671',
            'address' => '123 Main Street',
            'city' => 'Montreal',
            'province' => 'QC',
            'postal_code' => 'H1H 1H1',
            'preferred_contact' => 'email',
        ]);

        // Update with empty phone (should work because nullable in update)
        $response = $this->actingAs($this->client)->putJson('/api/client/profile', [
            'phone' => null,
        ]);

        $response->assertStatus(200);
    }
}
