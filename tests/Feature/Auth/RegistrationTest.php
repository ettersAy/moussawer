<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // POST /api/register — store()
    // -------------------------------------------------------------------------

    #[Test]
    public function it_registers_a_new_client_successfully(): void
    {
        $payload = [
            'name'                  => 'Jane Client',
            'email'                 => 'jane@example.com',
            'password'              => 'SecurePassword123',
            'password_confirmation' => 'SecurePassword123',
            'role'                  => 'client',
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'user' => ['id', 'name', 'email', 'role'],
                     'token',
                 ])
                 ->assertJsonPath('user.email', 'jane@example.com')
                 ->assertJsonPath('user.role', 'client');

        $this->assertDatabaseHas('users', [
            'email' => 'jane@example.com',
            'name'  => 'Jane Client',
        ]);
    }

    #[Test]
    public function it_registers_a_new_photographer_successfully(): void
    {
        $payload = [
            'name'                  => 'John Photographer',
            'email'                 => 'john@example.com',
            'password'              => 'PhotoPassword456',
            'password_confirmation' => 'PhotoPassword456',
            'role'                  => 'photographer',
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('user.role', 'photographer');

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'role'  => 'photographer',
        ]);
    }

    #[Test]
    public function it_returns_token_on_successful_registration(): void
    {
        $payload = [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'TestPassword789',
            'password_confirmation' => 'TestPassword789',
            'role'                  => 'client',
        ];

        $response = $this->postJson('/api/register', $payload);

        $this->assertNotNull($response->json('token'));
        $this->assertIsString($response->json('token'));
    }

    #[Test]
    public function it_hashes_the_password(): void
    {
        $payload = [
            'name'                  => 'Hash Test',
            'email'                 => 'hash@example.com',
            'password'              => 'PlainPassword123',
            'password_confirmation' => 'PlainPassword123',
            'role'                  => 'client',
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201);

        $user = User::where('email', 'hash@example.com')->first();
        $this->assertNotEquals('PlainPassword123', $user->password);
    }

    #[Test]
    public function it_rejects_registration_with_missing_name(): void
    {
        $response = $this->postJson('/api/register', [
            'email'                 => 'notype@example.com',
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
            'role'                  => 'client',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name']);
    }

    #[Test]
    public function it_rejects_registration_with_missing_email(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'No Email User',
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
            'role'                  => 'client',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function it_rejects_registration_with_invalid_email_format(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Bad Email User',
            'email'                 => 'not-a-valid-email',
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
            'role'                  => 'client',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function it_rejects_registration_with_duplicate_email(): void
    {
        // Create existing user
        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $response = $this->postJson('/api/register', [
            'name'                  => 'Duplicate Email',
            'email'                 => 'existing@example.com',
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
            'role'                  => 'client',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function it_rejects_registration_with_missing_password(): void
    {
        $response = $this->postJson('/api/register', [
            'name'  => 'No Password User',
            'email' => 'nopass@example.com',
            'role'  => 'client',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function it_rejects_registration_with_short_password(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Short Password',
            'email'                 => 'short@example.com',
            'password'              => 'Short1',
            'password_confirmation' => 'Short1',
            'role'                  => 'client',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function it_rejects_registration_with_mismatched_passwords(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Mismatch Test',
            'email'                 => 'mismatch@example.com',
            'password'              => 'Password123',
            'password_confirmation' => 'DifferentPassword456',
            'role'                  => 'client',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function it_rejects_registration_with_missing_password_confirmation(): void
    {
        $response = $this->postJson('/api/register', [
            'name'     => 'No Confirm',
            'email'    => 'noconfirm@example.com',
            'password' => 'Password123',
            'role'     => 'client',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password_confirmation']);
    }

    #[Test]
    public function it_rejects_registration_with_missing_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'No Role User',
            'email'                 => 'norole@example.com',
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['role']);
    }

    #[Test]
    public function it_rejects_registration_with_invalid_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Invalid Role User',
            'email'                 => 'invalidrole@example.com',
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
            'role'                  => 'admin', // Only client/photographer allowed
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['role']);
    }

    #[Test]
    public function it_sets_correct_user_role_as_client(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Role Client',
            'email'                 => 'roleclient@example.com',
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
            'role'                  => 'client',
        ]);

        $response->assertStatus(201);
        $user = User::where('email', 'roleclient@example.com')->first();
        $this->assertEquals(UserRole::Client, $user->role);
    }

    #[Test]
    public function it_sets_correct_user_role_as_photographer(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Role Photographer',
            'email'                 => 'rolephotographer@example.com',
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
            'role'                  => 'photographer',
        ]);

        $response->assertStatus(201);
        $user = User::where('email', 'rolephotographer@example.com')->first();
        $this->assertEquals(UserRole::Photographer, $user->role);
    }
}
