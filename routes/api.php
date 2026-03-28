<?php

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

// --- Protected Routes (auth:sanctum) — to be implemented ---
// Route::middleware('auth:sanctum')->group(function () {
//     Route::prefix('admin')->group(function () {
//         // Admin routes here
//     });
//     Route::prefix('photographer')->group(function () {
//         // Photographer routes here
//     });
//     Route::prefix('client')->group(function () {
//         // Client routes here
//     });
// });
