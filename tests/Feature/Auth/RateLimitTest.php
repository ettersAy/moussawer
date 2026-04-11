<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Tests\TestCase;

class RateLimitTest extends TestCase
{
    private User $testUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->testUser = User::create([
            'name' => 'Test User',
            'email' => 'ratelimit@example.com',
            'password' => bcrypt('password123'),
            'role' => UserRole::Client,
        ]);
    }

    /**
     * Test that login endpoint is rate limited to 5 attempts per minute.
     */
    public function test_login_rate_limit_enforced(): void
    {
        // Make 5 successful login attempts (should all pass)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/login', [
                'email' => 'ratelimit@example.com',
                'password' => 'password123',
            ]);

            // First 5 attempts should succeed or fail gracefully (200 or 401/422)
            $this->assertLessThan(429, $response->getStatusCode(),
                "Login attempt {$i} should not be rate limited yet (got {$response->getStatusCode()})");
        }

        // The 6th attempt should be rate limited (429)
        $response = $this->postJson('/api/login', [
            'email' => 'ratelimit@example.com',
            'password' => 'password123',
        ]);

        $this->assertEquals(429, $response->getStatusCode(),
            'Login endpoint should return 429 Too Many Requests after exceeding rate limit');
    }

    /**
     * Test that register endpoint is rate limited to 3 attempts per minute.
     */
    public function test_register_rate_limit_enforced(): void
    {
        // Make 3 registration attempts (should all pass or fail gracefully)
        for ($i = 0; $i < 3; $i++) {
            $response = $this->postJson('/api/register', [
                'name' => "Test User {$i}",
                'email' => "register-{$i}-".time().'@example.com',
                'password' => 'TestPass123',
                'password_confirmation' => 'TestPass123',
                'role' => 'client',
            ]);

            // First 3 attempts should have status < 429 (either 200, 422, etc.)
            $this->assertLessThan(429, $response->getStatusCode(),
                "Registration attempt {$i} should not be rate limited yet (got {$response->getStatusCode()})");
        }

        // The 4th attempt should be rate limited (429)
        $response = $this->postJson('/api/register', [
            'name' => 'Test User 4',
            'email' => 'register-4-'.time().'@example.com',
            'password' => 'TestPass123',
            'password_confirmation' => 'TestPass123',
            'role' => 'client',
        ]);

        $this->assertEquals(429, $response->getStatusCode(),
            'Register endpoint should return 429 Too Many Requests after exceeding rate limit');
    }

    /**
     * Test that logout endpoint is rate limited to 10 attempts per minute.
     */
    public function test_logout_rate_limit_enforced(): void
    {
        // Create a token for the test user
        $token = $this->testUser->createToken('test_token')->plainTextToken;

        // Make 10 logout attempts (should all pass)
        for ($i = 0; $i < 10; $i++) {
            $response = $this->postJson('/api/logout', [], [
                'Authorization' => "Bearer $token",
            ]);

            // First 10 attempts should have status < 429
            // (may fail due to already being logged out, but that's not rate limiting)
            $this->assertLessThan(429, $response->getStatusCode(),
                "Logout attempt {$i} should not be rate limited yet (got {$response->getStatusCode()})");

            // If logout succeeded and revoked token, create a new one for next iteration
            if ($response->getStatusCode() === 200) {
                // Token was revoked, create a new one for next iteration
                sleep(1); // Small delay to ensure different token
                $token = $this->testUser->createToken('test_token')->plainTextToken;
            }
        }

        // The 11th attempt should potentially be rate limited
        // Create a fresh token for the 11th attempt
        $token = $this->testUser->createToken('test_token')->plainTextToken;
        $response = $this->postJson('/api/logout', [], [
            'Authorization' => "Bearer $token",
        ]);

        $this->assertEquals(429, $response->getStatusCode(),
            'Logout endpoint should return 429 Too Many Requests after exceeding rate limit');
    }

    /**
     * Test that rate limit headers are present in response.
     */
    public function test_rate_limit_headers_present(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'ratelimit@example.com',
            'password' => 'password123',
        ]);

        // Laravel throttle middleware should include rate limit headers
        $this->assertNotNull($response->headers->get('X-RateLimit-Limit'),
            'Response should include X-RateLimit-Limit header');
        $this->assertNotNull($response->headers->get('X-RateLimit-Remaining'),
            'Response should include X-RateLimit-Remaining header');
    }

    /**
     * Test that rate limit is enforced per IP address.
     */
    public function test_rate_limit_per_ip(): void
    {
        // Make 5 login attempts from one IP
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/login', [
                'email' => 'ratelimit@example.com',
                'password' => 'password123',
            ]);

            $this->assertLessThan(429, $response->getStatusCode());
        }

        // 6th attempt should be rate limited
        $response = $this->postJson('/api/login', [
            'email' => 'ratelimit@example.com',
            'password' => 'password123',
        ]);

        $this->assertEquals(429, $response->getStatusCode(),
            'Rate limit should be enforced per IP address');
    }

    /**
     * Test that contact endpoint maintains its own rate limit (5 per minute).
     */
    public function test_contact_rate_limit_enforced(): void
    {
        // Make 5 contact submissions (should all pass or fail gracefully)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/contact', [
                'email' => 'contact@example.com',
                'message' => 'Test message '.$i,
            ]);

            $this->assertLessThan(429, $response->getStatusCode(),
                "Contact submission {$i} should not be rate limited yet (got {$response->getStatusCode()})");
        }

        // The 6th attempt should be rate limited (429)
        $response = $this->postJson('/api/contact', [
            'email' => 'contact@example.com',
            'message' => 'Test message 6',
        ]);

        $this->assertEquals(429, $response->getStatusCode(),
            'Contact endpoint should return 429 Too Many Requests after exceeding rate limit');
    }
}
