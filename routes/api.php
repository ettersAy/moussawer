<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\MeController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Booking\BookingController;
use App\Http\Controllers\Api\Client\ProfileController as ClientProfileController;
use App\Http\Controllers\Api\Photographer\ProfileController as PhotographerProfileController;
use App\Http\Controllers\Api\Public\ContactSubmissionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All routes here return JSON. Authentication will be handled via Sanctum.
| Prefix: /api (applied automatically by Laravel)
|
*/

// --- Public Routes (no auth required) ---
Route::post('/contact', [ContactSubmissionController::class, 'store'])
    ->middleware('throttle:contact');

Route::post('/login', LoginController::class)
    ->middleware('throttle:auth');

Route::post('/register', RegisterController::class)
    ->middleware('throttle:register');

// --- Protected Routes (auth:sanctum) ---
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::post('/logout', LogoutController::class)
        ->middleware('throttle:auth');
    Route::get('/user', MeController::class);

    Route::prefix('admin')->group(function () {
        // Admin routes here
    });

    Route::prefix('photographer')->group(function () {
        // Photographer profile routes
        Route::post('/profile', [PhotographerProfileController::class, 'store']);
        Route::get('/profile', [PhotographerProfileController::class, 'show']);
        Route::put('/profile', [PhotographerProfileController::class, 'update']);
        Route::delete('/profile', [PhotographerProfileController::class, 'destroy']);
    });

    Route::prefix('client')->group(function () {
        // Client profile routes
        Route::post('/profile', [ClientProfileController::class, 'store']);
        Route::get('/profile', [ClientProfileController::class, 'show']);
        Route::put('/profile', [ClientProfileController::class, 'update']);
        Route::delete('/profile', [ClientProfileController::class, 'destroy']);
    });

    // Booking routes
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
    Route::delete('/bookings/{booking}', [BookingController::class, 'destroy']);
});
