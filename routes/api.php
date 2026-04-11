<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\MeController;
use App\Http\Controllers\Api\Auth\RegisterController;
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
    ->middleware('throttle:5,1');

Route::post('/login', LoginController::class)
    ->middleware('throttle:5,1');

Route::post('/register', RegisterController::class)
    ->middleware('throttle:3,1');

// --- Protected Routes (auth:sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', LogoutController::class)
        ->middleware('throttle:10,1');
    Route::get('/user', MeController::class);

    Route::prefix('admin')->group(function () {
        // Admin routes here
    });
    Route::prefix('photographer')->group(function () {
        // Photographer routes here
    });
    Route::prefix('client')->group(function () {
        // Client routes here
    });
});
