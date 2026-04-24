<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Mail\PasswordResetLink;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    /**
     * Handle an incoming forgot password request.
     *
     * Generates a password reset token, stores it, and sends the reset link via email.
     */
    public function __invoke(ForgotPasswordRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->firstOrFail();

        // Generate a secure random token
        $token = Str::random(64);

        // Store/update the token in the password_reset_tokens table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'email' => $user->email,
                'token' => bcrypt($token),
                'created_at' => now(),
            ],
        );

        // Send the reset link email asynchronously
        Mail::queue(new PasswordResetLink(
            email: $user->email,
            token: $token,
            userName: $user->name,
        ));

        return response()->json([
            'message' => 'We have emailed your password reset link.',
        ], 200);
    }
}
