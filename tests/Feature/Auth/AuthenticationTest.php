<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Enums\UserRole;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    private User $testUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->testUser = User::create([
            'name' => 'Test User',
            'email' => 'auth@example.com',
            'password' => bcrypt('password123'),
            'role' => UserRole::Client,
        ]);
    }

    /**
     * Test successful login returns 200 with user and token.
     */
    public function test_login_success(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'auth@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role',
                ],
                'token',
            ])
            ->assertJsonPath('user.email', 'auth@example.com')
            ->assertJsonPath('user.role', 'client');

        $this->assertNotNull($response->json('token'));
    }

    /**
     * Test login with invalid credentials returns 401.
     */
    public function test_login_invalid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'auth@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('message', 'Invalid credentials.');
    }

    /**
     * Test login with invalid email returns 401.
     */
    public function test_login_invalid_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('message', 'Invalid credentials.');
    }

    /**
     * Test get user without token returns 401.
     */
    public function test_get_user_without_token(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    /**
     * Test get user with valid token returns 200 with user data.
     */
    public function test_get_user_with_token(): void
    {
        $token = $this->testUser->createToken('test_token')->plainTextToken;

        $response = $this->getJson('/api/user', [
            'Authorization' => "Bearer $token",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role',
                ],
            ])
            ->assertJsonPath('user.email', 'auth@example.com');
    }

    /**
     * Test logout invalidates token.
     */
    public function test_logout_revokes_token(): void
    {
        $user = User::find($this->testUser->id);
        $token = $user->createToken('test_token')->plainTextToken;

        // Verify token works before logout
        $response = $this->getJson('/api/user', [
            'Authorization' => "Bearer $token",
        ]);
        $response->assertStatus(200);

        // Logout
        $response = $this->postJson('/api/logout', [], [
            'Authorization' => "Bearer $token",
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Logged out successfully.');

        // Verify token was deleted from database
        $tokensAfter = \Laravel\Sanctum\PersonalAccessToken::where('tokenable_id', $user->id)->count();
        $this->assertEquals(0, $tokensAfter, 'Token should be deleted after logout');
    }

    /**
     * Test login validation.
     */
    public function test_login_validation(): void
    {
        // Missing email
        $response = $this->postJson('/api/login', [
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // Missing password
        $response = $this->postJson('/api/login', [
            'email' => 'auth@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Invalid email format
        $response = $this->postJson('/api/login', [
            'email' => 'invalid-email',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
