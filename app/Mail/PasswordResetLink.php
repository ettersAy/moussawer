<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetLink extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public string $email,
        public string $token,
        public string $userName,
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            to: $this->email,
            subject: 'Reset Your Moussawer Password',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.password-reset-link',
            with: [
                'userName' => $this->userName,
                'resetUrl' => $this->resetUrl(),
                'expiryMinutes' => config('auth.passwords.users.expire', 60),
            ],
        );
    }

    /**
     * Build the password reset URL.
     */
    protected function resetUrl(): string
    {
        $appUrl = config('app.url', 'http://localhost');
        $frontendUrl = config('app.frontend_url', $appUrl);

        return rtrim($frontendUrl, '/').'/reset-password?token='.$this->token.'&email='.urlencode($this->email);
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
