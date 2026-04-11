<?php

namespace Tests\Feature\Api\Public;

use App\Mail\ContactSubmissionConfirmation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
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
            'email' => 'hello@example.com',
            'message' => 'This is a valid test message.',
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.email', 'hello@example.com')
            ->assertJsonPath('data.message', 'This is a valid test message.');

        $this->assertDatabaseHas('contact_submissions', [
            'email' => 'hello@example.com',
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
            'email' => 'not-a-valid-email',
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
            'email' => 'hello@example.com',
            'message' => 'Too short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    #[Test]
    public function it_rejects_a_message_that_is_too_long(): void
    {
        $response = $this->postJson('/api/contact', [
            'email' => 'hello@example.com',
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

    // -------------------------------------------------------------------------
    // Mail Tests
    // -------------------------------------------------------------------------

    #[Test]
    public function it_sends_confirmation_email_on_submission(): void
    {
        Mail::fake();

        $this->postJson('/api/contact', [
            'email' => 'contact@example.com',
            'message' => 'This is a very important message that needs confirmation.',
        ]);

        Mail::assertQueued(ContactSubmissionConfirmation::class);
    }

    #[Test]
    public function it_sends_confirmation_email_to_submitter(): void
    {
        Mail::fake();

        $this->postJson('/api/contact', [
            'email' => 'submitter@example.com',
            'message' => 'Long enough message for confirmation email testing to pass validation.',
        ]);

        Mail::assertQueued(ContactSubmissionConfirmation::class, function ($mail) {
            return $mail->hasTo('submitter@example.com');
        });
    }

    #[Test]
    public function it_sends_confirmation_email_with_correct_subject(): void
    {
        Mail::fake();

        $this->postJson('/api/contact', [
            'email' => 'subject@example.com',
            'message' => 'This message is testing the email subject line for the confirmation email.',
        ]);

        Mail::assertQueued(ContactSubmissionConfirmation::class, function ($mail) {
            return $mail->envelope()->subject === 'We received your message - Moussawer';
        });
    }

    #[Test]
    public function it_does_not_send_email_on_validation_failure(): void
    {
        Mail::fake();

        $this->postJson('/api/contact', [
            'email' => 'invalid-email',
            'message' => 'Short',
        ]);

        Mail::assertNothingQueued();
    }
}
