<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $photographer;

    private User $client;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);

        $this->photographer = User::factory()->create([
            'role' => UserRole::Photographer,
        ]);

        $this->client = User::factory()->create([
            'role' => UserRole::Client,
        ]);
    }

    public function test_admin_can_list_users(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'meta', 'links']);
    }

    public function test_admin_can_create_user(): void
    {
        $payload = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Client->value,
            'status' => 'active',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/admin/users', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.email', 'newuser@example.com')
            ->assertJsonPath('data.role', UserRole::Client->value);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
        ]);
    }

    public function test_admin_can_update_user(): void
    {
        $payload = [
            'name' => 'Updated Name',
            'role' => UserRole::Photographer->value,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/admin/users/{$this->client->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('users', [
            'id' => $this->client->id,
            'name' => 'Updated Name',
            'role' => UserRole::Photographer->value,
        ]);
    }

    public function test_admin_can_delete_user(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/users/{$this->client->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('users', [
            'id' => $this->client->id,
        ]);
    }

    public function test_non_admin_cannot_access_user_crud(): void
    {
        // Photographer trying to list users
        $response1 = $this->actingAs($this->photographer, 'sanctum')->getJson('/api/admin/users');
        $response1->assertStatus(403);

        // Client trying to create a user
        $response2 = $this->actingAs($this->client, 'sanctum')->postJson('/api/admin/users', [
            'name' => 'Should fail',
            'email' => 'fail@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => UserRole::Client->value,
        ]);
        $response2->assertStatus(403);
    }
}
