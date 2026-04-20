<?php

namespace App\Http\Controllers\Api\Photographer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Photographer\StoreServiceRequest;
use App\Http\Requests\Photographer\UpdateServiceRequest;
use App\Models\PhotographerService;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        abort_if(! $user->isPhotographer(), 403, 'Only photographers can manage services.');

        $photographer = $user->photographer;

        if (! $photographer) {
            return response()->json(['data' => []]);
        }

        $services = $photographer->services()->orderBy('sort_order')->get();

        return response()->json(['data' => $services]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreServiceRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();
        $photographer = $user->photographer;

        if (! $photographer) {
            return response()->json(['message' => 'Please complete your photographer profile first.'], 400);
        }

        $service = $photographer->services()->create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'duration_minutes' => $request->duration_minutes,
            'minimum_hours' => $request->minimum_hours,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return response()->json(['data' => $service, 'message' => 'Service created successfully!'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PhotographerService $service): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        if ($service->photographer->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        return response()->json(['data' => $service]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateServiceRequest $request, PhotographerService $service): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        if ($service->photographer->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $service->update([
            'name' => $request->name ?? $service->name,
            'description' => $request->has('description') ? $request->description : $service->description,
            'price' => $request->price ?? $service->price,
            'duration_minutes' => $request->has('duration_minutes') ? $request->duration_minutes : $service->duration_minutes,
            'minimum_hours' => $request->minimum_hours ?? $service->minimum_hours,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $service->is_active,
            'sort_order' => $request->sort_order ?? $service->sort_order,
        ]);

        return response()->json(['data' => $service, 'message' => 'Service updated successfully.']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PhotographerService $service): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        if ($service->photographer->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $service->delete();

        return response()->json(['message' => 'Service deleted successfully.']);
    }
}
