<?php

namespace App\Http\Controllers\Api\Photographer;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Photographer\StoreProfileRequest;
use App\Http\Requests\Photographer\UpdateProfileRequest;
use App\Http\Resources\PhotographerProfileResource;
use App\Models\Photographer;
use Illuminate\Http\Response;

class ProfileController extends Controller
{
    /**
     * Store a newly created photographer profile.
     */
    public function store(StoreProfileRequest $request)
    {
        // Verify user is a photographer
        if (auth()->user()->role !== UserRole::Photographer) {
            return response()->json([
                'message' => 'Only photographers can create photographer profiles.',
            ], Response::HTTP_FORBIDDEN);
        }

        // Check if profile already exists
        $existingProfile = Photographer::where('user_id', auth()->id())->first();
        if ($existingProfile) {
            return response()->json([
                'message' => 'Photographer profile already exists. Use PUT to update.',
            ], Response::HTTP_CONFLICT);
        }

        // Create profile
        $photographer = Photographer::create([
            'user_id' => auth()->id(),
            ...$request->validated(),
        ]);

        return (new PhotographerProfileResource($photographer))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Display the authenticated photographer's profile.
     */
    public function show()
    {
        $photographer = Photographer::where('user_id', auth()->id())->firstOrFail();

        return (new PhotographerProfileResource($photographer))->response();
    }

    /**
     * Update the authenticated photographer's profile.
     */
    public function update(UpdateProfileRequest $request)
    {
        $photographer = Photographer::where('user_id', auth()->id())->firstOrFail();

        // Update only provided fields
        $photographer->update($request->validated());

        return (new PhotographerProfileResource($photographer))->response();
    }

    /**
     * Delete the authenticated photographer's profile.
     */
    public function destroy()
    {
        $photographer = Photographer::where('user_id', auth()->id())->firstOrFail();

        $photographer->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
