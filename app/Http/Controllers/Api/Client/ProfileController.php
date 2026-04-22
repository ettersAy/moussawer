<?php

namespace App\Http\Controllers\Api\Client;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreProfileRequest;
use App\Http\Requests\Client\UpdateProfileRequest;
use App\Http\Resources\ClientProfileResource;
use App\Models\Client;
use Illuminate\Http\Response;

class ProfileController extends Controller
{
    /**
     * Store a newly created client profile.
     */
    public function store(StoreProfileRequest $request)
    {
        // Verify user is a client
        if (auth()->user()->role !== UserRole::Client) {
            return response()->json([
                'message' => 'Only clients can create client profiles.',
            ], Response::HTTP_FORBIDDEN);
        }

        // Check if profile already exists
        $existingProfile = Client::where('user_id', auth()->id())->first();
        if ($existingProfile) {
            return response()->json([
                'message' => 'Client profile already exists. Use PUT to update.',
            ], Response::HTTP_CONFLICT);
        }

        // Create profile
        $client = Client::create([
            'user_id' => auth()->id(),
            ...$request->validated(),
        ]);

        return (new ClientProfileResource($client))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Display the authenticated client's profile.
     */
    public function show()
    {
        $client = Client::with('user')->where('user_id', auth()->id())->firstOrFail();

        return (new ClientProfileResource($client))->response();
    }

    /**
     * Update the authenticated client's profile.
     */
    public function update(UpdateProfileRequest $request)
    {
        $client = Client::where('user_id', auth()->id())->firstOrFail();

        // Update only provided fields
        $client->update($request->validated());

        // Reload with user relationship for response
        $client->load('user');

        return (new ClientProfileResource($client))->response();
    }

    /**
     * Delete the authenticated client's profile.
     */
    public function destroy()
    {
        $client = Client::where('user_id', auth()->id())->firstOrFail();

        $client->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
