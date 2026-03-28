<?php

namespace Tests\Feature\Api\Public;

use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ContactSubmissionControllerTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // POST /api/contact — store()
    // -------------------------------------------------------------------------

    #[Test]
    public function it_stores_a_valid_contact_submission(): void
    {
        $payload = [
            'email'   => 'hello@example.com',
            'message' => 'This is a valid test message.',
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('data.email', 'hello@example.com')
                 ->assertJsonPath('data.message', 'This is a valid test message.');

        $this->assertDatabaseHas('contact_submissions', [
            'email'   => 'hello@example.com',
            'message' => 'This is a valid test message.',
        ]);
    }

    #[Test]
    public function it_rejects_a_missing_email(): void
    {
        $response = $this->postJson('/api/contact', [
            'message' => 'A message without an email.',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function it_rejects_an_invalid_email_format(): void
    {
        $response = $this->postJson('/api/contact', [
            'email'   => 'not-a-valid-email',
            'message' => 'A message with a bad email.',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function it_rejects_a_missing_message(): void
    {
        $response = $this->postJson('/api/contact', [
            'email' => 'hello@example.com',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['message']);
    }

    #[Test]
    public function it_rejects_a_message_that_is_too_short(): void
    {
        $response = $this->postJson('/api/contact', [
            'email'   => 'hello@example.com',
            'message' => 'Too short',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['message']);
    }

    #[Test]
    public function it_rejects_a_message_that_is_too_long(): void
    {
        $response = $this->postJson('/api/contact', [
            'email'   => 'hello@example.com',
            'message' => str_repeat('a', 2001),
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['message']);
    }

    #[Test]
    public function it_returns_json_even_on_validation_failure(): void
    {
        $response = $this->postJson('/api/contact', []);

        $response->assertStatus(422)
                 ->assertHeader('Content-Type', 'application/json')
                 ->assertJsonStructure(['message', 'errors']);
    }

    #[Test]
    public function it_does_not_store_anything_on_validation_failure(): void
    {
        $this->postJson('/api/contact', ['email' => 'bad']);

        $this->assertDatabaseCount('contact_submissions', 0);
    }
}
