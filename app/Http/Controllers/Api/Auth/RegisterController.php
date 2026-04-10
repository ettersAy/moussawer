<?php

namespace App\Http\Controllers\Api\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Mail\RegistrationWelcome;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class RegisterController extends Controller
{
    /**
     * Handle user registration and issue Sanctum token.
     */
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password, // Automatically hashed by User model
            'role' => UserRole::from($request->role), // Cast string to enum
        ]);

        // Send welcome email asynchronously
        Mail::queue(new RegistrationWelcome($user));

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => UserResource::make($user),
            'token' => $token,
        ], 201);
    }
}
