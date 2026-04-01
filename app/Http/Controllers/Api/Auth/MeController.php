<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    /**
     * Return the authenticated user.
     */
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([
            'user' => UserResource::make($request->user()),
        ], 200);
    }
}
