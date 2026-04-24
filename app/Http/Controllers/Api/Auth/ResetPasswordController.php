<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ResetPasswordController extends Controller
{
    /**
     * Handle an incoming password reset request.
     *
     * Validates the token, updates the user's password, and deletes the used token.
     */
    public function __invoke(ResetPasswordRequest $request): JsonResponse
    {
        // Retrieve the stored token record
        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        // Verify the token exists and matches
        if (! $record || ! Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => 'This password reset token is invalid or has expired.',
            ], 400);
        }

        // Check token expiration (default: 60 minutes from config)
        $expiresIn = config('auth.passwords.users.expire', 60);
        $createdAt = $record->created_at;

        // Parse the created_at as a Carbon instance to handle both string and object
        $createdAt = $createdAt instanceof Carbon ? $createdAt : Carbon::parse($createdAt);

        if ($createdAt->diffInMinutes(now()) > $expiresIn) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json([
                'message' => 'This password reset token has expired. Please request a new one.',
            ], 400);
        }

        // Update the user's password
        $user = User::where('email', $request->email)->firstOrFail();
        $user->update([
            'password' => $request->password,
        ]);

        // Delete the used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Optionally revoke all existing tokens for security
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Your password has been reset successfully.',
        ], 200);
    }
}
