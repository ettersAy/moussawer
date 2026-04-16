<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e) {
            // Check if request expects JSON
            if (request()->expectsJson()) {
                // Handle validation exceptions
                if ($e instanceof ValidationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation failed',
                        'errors' => $e->errors(),
                    ], 422);
                }

                // Handle authentication exceptions
                if ($e instanceof AuthenticationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthenticated',
                    ], 401);
                }

                // Handle authorization exceptions
                if ($e instanceof AuthorizationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This action is unauthorized',
                    ], 403);
                }

                // Handle model not found
                if ($e instanceof ModelNotFoundException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Resource not found',
                    ], 404);
                }

                // Handle HTTP exceptions
                if ($e instanceof HttpException) {
                    $response = [
                        'success' => false,
                        'message' => $e->getMessage() ?: 'An error occurred',
                    ];

                    // Include stack trace in development
                    if (config('app.debug')) {
                        $response['error'] = $e->getMessage();
                    }

                    return response()->json($response, $e->getStatusCode());
                }

                // Handle generic exceptions
                $response = [
                    'success' => false,
                    'message' => 'A server error occurred',
                ];

                // Include error details in development mode only
                if (config('app.debug')) {
                    $response['error'] = $e->getMessage();
                    $response['exception'] = class_basename($e);
                }

                return response()->json($response, 500);
            }
        });
    })->create();
