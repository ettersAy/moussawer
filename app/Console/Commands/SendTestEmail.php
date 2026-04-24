<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTestEmail extends Command
{
    protected $signature = 'email:test
                            {email? : The email address to send the test to (defaults to MAIL_FROM_ADDRESS)}';

    protected $description = 'Send a test email to verify mail configuration';

    public function handle(): int
    {
        $recipient = $this->argument('email') ?: config('mail.from.address');

        if (! $recipient) {
            $this->error('No recipient email provided and MAIL_FROM_ADDRESS is not set.');

            return self::FAILURE;
        }

        $this->info("Sending test email to: {$recipient}...");

        try {
            Mail::raw(
                'This is a test email from Moussawer to verify that the mail configuration is working correctly.'."\n\n"
                .'Sent at: '.now()->toDateTimeString(),
                function ($message) use ($recipient) {
                    $message->to($recipient)
                        ->subject('Moussawer - Test Email ('.now()->format('Y-m-d H:i:s').')');
                }
            );

            $this->info('Test email sent successfully!');

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Failed to send test email: '.$e->getMessage());

            return self::FAILURE;
        }
    }
}
