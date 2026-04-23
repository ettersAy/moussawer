<?php

use App\Http\Controllers\Api\Admin\PortfolioController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\MeController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Booking\BookingController;
use App\Http\Controllers\Api\Client\BookingRequestController;
use App\Http\Controllers\Api\Client\ProfileController as ClientProfileController;
use App\Http\Controllers\Api\Photographer\AvailabilitySlotController;
use App\Http\Controllers\Api\Photographer\PortfolioItemController;
use App\Http\Controllers\Api\Photographer\ProfileController as PhotographerProfileController;
use App\Http\Controllers\Api\Photographer\ServiceController;
use App\Http\Controllers\Api\Public\ContactSubmissionController;
use App\Http\Controllers\Api\Public\PhotographerSearchController;
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
Route::get('/photographers', PhotographerSearchController::class);
Route::get('/photographers/{photographer}', App\Http\Controllers\Api\Public\PhotographerProfileController::class);
Route::get('/photographers/{photographer}/availability', [AvailabilitySlotController::class, 'publicAvailability']);

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
        Route::apiResource('users', UserController::class);

        // Admin user portfolio management
        Route::get('users/{user}/portfolios', [PortfolioController::class, 'index']);
        Route::delete('users/{user}/portfolios/{portfolio}', [PortfolioController::class, 'destroy']);
    });

    Route::prefix('photographer')->group(function () {
        // Photographer profile routes
        Route::post('/profile', [PhotographerProfileController::class, 'store']);
        Route::get('/profile', [PhotographerProfileController::class, 'show']);
        Route::put('/profile', [PhotographerProfileController::class, 'update']);
        Route::delete('/profile', [PhotographerProfileController::class, 'destroy']);
        Route::apiResource('portfolios', PortfolioItemController::class);
        Route::apiResource('services', ServiceController::class);

        // Availability routes
        Route::get('/availability/calendar', [AvailabilitySlotController::class, 'calendar']);
        Route::get('/availability', [AvailabilitySlotController::class, 'index']);
        Route::post('/availability', [AvailabilitySlotController::class, 'store']);
        Route::put('/availability/{slot}', [AvailabilitySlotController::class, 'update']);
        Route::delete('/availability/{slot}', [AvailabilitySlotController::class, 'destroy']);
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
    Route::post('/client/bookings', [BookingRequestController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/stats', [BookingController::class, 'stats']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
    Route::delete('/bookings/{booking}', [BookingController::class, 'destroy']);
});
