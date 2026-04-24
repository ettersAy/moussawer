<?php

namespace Tests\Feature\Auth;

use App\Mail\PasswordResetLink;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'email' => 'jane@example.com',
            'password' => bcrypt('OldPassword123'),
        ]);
    }

    // -------------------------------------------------------------------------
    // POST /api/forgot-password
    // -------------------------------------------------------------------------

    #[Test]
    public function it_sends_password_reset_link_for_valid_email(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'jane@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'We have emailed your password reset link.');

        // Assert that the mail was queued
        Mail::assertQueued(PasswordResetLink::class, function ($mail) {
            return $mail->hasTo('jane@example.com');
        });
    }

    #[Test]
    public function it_generates_a_token_in_the_database(): void
    {
        $this->postJson('/api/forgot-password', [
            'email' => 'jane@example.com',
        ]);

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'jane@example.com',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', 'jane@example.com')
            ->first();

        $this->assertNotNull($record->token);
        $this->assertNotNull($record->created_at);
    }

    #[Test]
    public function it_hashes_the_token_in_database(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'jane@example.com',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', 'jane@example.com')
            ->first();

        // The token stored should be a bcrypt hash, not a plain string
        // A bcrypt hash starts with $2y$ and is 60 chars long
        $this->assertStringStartsWith('$2y$', $record->token);
        $this->assertEquals(60, strlen($record->token));
    }

    #[Test]
    public function it_rejects_forgot_password_with_missing_email(): void
    {
        $response = $this->postJson('/api/forgot-password', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function it_rejects_forgot_password_with_invalid_email_format(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'not-a-valid-email',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function it_rejects_forgot_password_with_non_existent_email(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function it_updates_existing_token_on_repeated_request(): void
    {
        // First request
        $this->postJson('/api/forgot-password', [
            'email' => 'jane@example.com',
        ]);

        $firstRecord = DB::table('password_reset_tokens')
            ->where('email', 'jane@example.com')
            ->first();

        // Wait a tiny bit so created_at might differ
        usleep(1000);

        // Second request
        $this->postJson('/api/forgot-password', [
            'email' => 'jane@example.com',
        ]);

        $secondRecord = DB::table('password_reset_tokens')
            ->where('email', 'jane@example.com')
            ->first();

        // Should still only be one record
        $this->assertEquals(1, DB::table('password_reset_tokens')
            ->where('email', 'jane@example.com')
            ->count()
        );

        // Token should be different
        $this->assertNotEquals($firstRecord->token, $secondRecord->token);
    }

    #[Test]
    public function it_sends_email_with_correct_subject(): void
    {
        Mail::fake();

        $this->postJson('/api/forgot-password', [
            'email' => 'jane@example.com',
        ]);

        Mail::assertQueued(PasswordResetLink::class, function ($mail) {
            return $mail->envelope()->subject === 'Reset Your Moussawer Password';
        });
    }

    // -------------------------------------------------------------------------
    // POST /api/reset-password
    // -------------------------------------------------------------------------

    #[Test]
    public function it_resets_password_with_valid_token(): void
    {
        // Use a known token to test the full reset flow end-to-end
        $plainToken = 'test-token-value-12345';
        DB::table('password_reset_tokens')->insert([
            'email' => 'jane@example.com',
            'token' => bcrypt($plainToken),
            'created_at' => now(),
        ]);

        // Step 3: Reset the password
        $response = $this->postJson('/api/reset-password', [
            'email' => 'jane@example.com',
            'token' => $plainToken,
            'password' => 'NewSecurePassword456',
            'password_confirmation' => 'NewSecurePassword456',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Your password has been reset successfully.');

        // Step 4: Verify password was updated
        $this->user->refresh();
        $this->assertTrue(Hash::check('NewSecurePassword456', $this->user->password));

        // Step 5: Verify old password no longer works
        $this->assertFalse(Hash::check('OldPassword123', $this->user->password));

        // Step 6: Verify token was deleted
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'jane@example.com',
        ]);
    }

    #[Test]
    public function it_rejects_reset_with_invalid_token(): void
    {
        // Pre-populate a token record
        DB::table('password_reset_tokens')->insert([
            'email' => 'jane@example.com',
            'token' => bcrypt('real-token'),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/reset-password', [
            'email' => 'jane@example.com',
            'token' => 'fake-token',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('message', 'This password reset token is invalid or has expired.');
    }

    #[Test]
    public function it_rejects_reset_with_expired_token(): void
    {
        // Pre-populate a token record that's too old
        DB::table('password_reset_tokens')->insert([
            'email' => 'jane@example.com',
            'token' => bcrypt('expired-token'),
            'created_at' => now()->subHours(2), // 2 hours ago (expire is 60 min)
        ]);

        $response = $this->postJson('/api/reset-password', [
            'email' => 'jane@example.com',
            'token' => 'expired-token',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('message', 'This password reset token has expired. Please request a new one.');

        // Token should have been cleaned up
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'jane@example.com',
        ]);
    }

    #[Test]
    public function it_rejects_reset_with_missing_email(): void
    {
        $response = $this->postJson('/api/reset-password', [
            'token' => 'some-token',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function it_rejects_reset_with_missing_token(): void
    {
        $response = $this->postJson('/api/reset-password', [
            'email' => 'jane@example.com',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['token']);
    }

    #[Test]
    public function it_rejects_reset_with_missing_password(): void
    {
        $response = $this->postJson('/api/reset-password', [
            'email' => 'jane@example.com',
            'token' => 'some-token',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function it_rejects_reset_with_short_password(): void
    {
        $response = $this->postJson('/api/reset-password', [
            'email' => 'jane@example.com',
            'token' => 'some-token',
            'password' => 'Short1',
            'password_confirmation' => 'Short1',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function it_rejects_reset_with_mismatched_passwords(): void
    {
        $response = $this->postJson('/api/reset-password', [
            'email' => 'jane@example.com',
            'token' => 'some-token',
            'password' => 'NewPassword123',
            'password_confirmation' => 'DifferentPassword456',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function it_revokes_all_tokens_after_password_reset(): void
    {
        // Create some Sanctum tokens for the user
        $this->user->createToken('token-1');
        $this->user->createToken('token-2');

        $this->assertGreaterThan(0, $this->user->tokens()->count());

        // Pre-populate a token record
        $plainToken = 'valid-reset-token';
        DB::table('password_reset_tokens')->insert([
            'email' => 'jane@example.com',
            'token' => bcrypt($plainToken),
            'created_at' => now(),
        ]);

        // Reset the password
        $this->postJson('/api/reset-password', [
            'email' => 'jane@example.com',
            'token' => $plainToken,
            'password' => 'BrandNewPassword789',
            'password_confirmation' => 'BrandNewPassword789',
        ]);

        // All Sanctum tokens should be revoked
        $this->assertEquals(0, $this->user->tokens()->count());
    }

    #[Test]
    public function it_allows_login_with_new_password_after_reset(): void
    {
        // Pre-populate a token record
        $plainToken = 'login-test-token';
        DB::table('password_reset_tokens')->insert([
            'email' => 'jane@example.com',
            'token' => bcrypt($plainToken),
            'created_at' => now(),
        ]);

        // Reset password
        $this->postJson('/api/reset-password', [
            'email' => 'jane@example.com',
            'token' => $plainToken,
            'password' => 'NewLoginPassword456',
            'password_confirmation' => 'NewLoginPassword456',
        ]);

        // Login with new password
        $response = $this->postJson('/api/login', [
            'email' => 'jane@example.com',
            'password' => 'NewLoginPassword456',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }

    #[Test]
    public function it_rejects_login_with_old_password_after_reset(): void
    {
        // Pre-populate a token record
        $plainToken = 'old-password-test-token';
        DB::table('password_reset_tokens')->insert([
            'email' => 'jane@example.com',
            'token' => bcrypt($plainToken),
            'created_at' => now(),
        ]);

        // Reset password
        $this->postJson('/api/reset-password', [
            'email' => 'jane@example.com',
            'token' => $plainToken,
            'password' => 'NewPasswordAfterReset789',
            'password_confirmation' => 'NewPasswordAfterReset789',
        ]);

        // Login with old password should fail
        $response = $this->postJson('/api/login', [
            'email' => 'jane@example.com',
            'password' => 'OldPassword123',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('message', 'Invalid credentials.');
    }

    #[Test]
    public function it_rejects_reset_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/reset-password', [
            'email' => 'nobody@example.com',
            'token' => 'some-token',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        // No token exists for this email, so it should be invalid
        $response->assertStatus(400)
            ->assertJsonPath('message', 'This password reset token is invalid or has expired.');
    }

    #[Test]
    public function it_uses_same_token_only_once(): void
    {
        $plainToken = 'single-use-token';
        DB::table('password_reset_tokens')->insert([
            'email' => 'jane@example.com',
            'token' => bcrypt($plainToken),
            'created_at' => now(),
        ]);

        // First use - should succeed
        $this->postJson('/api/reset-password', [
            'email' => 'jane@example.com',
            'token' => $plainToken,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ])->assertStatus(200);

        // Second use - should fail (token was deleted)
        $response = $this->postJson('/api/reset-password', [
            'email' => 'jane@example.com',
            'token' => $plainToken,
            'password' => 'AnotherPassword456',
            'password_confirmation' => 'AnotherPassword456',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('message', 'This password reset token is invalid or has expired.');
    }
}
