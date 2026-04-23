<?php

namespace App\Http\Controllers\Api\Photographer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Photographer\StoreAvailabilitySlotRequest;
use App\Http\Requests\Photographer\UpdateAvailabilitySlotRequest;
use App\Http\Resources\AvailabilitySlotResource;
use App\Models\AvailabilitySlot;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilitySlotController extends Controller
{
    /**
     * Display a listing of availability slots for the authenticated photographer.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();
        $photographer = $user->photographer;

        if (! $photographer) {
            return response()->json(['data' => []]);
        }

        $query = AvailabilitySlot::where('photographer_id', $photographer->id);

        // Filter by month/year if provided
        if ($request->filled('month') && $request->filled('year')) {
            $month = (int) $request->month;
            $year = (int) $request->year;
            $query->whereYear('date', $year)->whereMonth('date', $month);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $slots = $query->orderBy('date')->orderBy('start_time')->get();

        return response()->json([
            'data' => AvailabilitySlotResource::collection($slots),
        ]);
    }

    /**
     * Store a newly created availability slot.
     */
    public function store(StoreAvailabilitySlotRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();
        $photographer = $user->photographer;

        if (! $photographer) {
            return response()->json(['message' => 'Please complete your photographer profile first.'], 400);
        }

        $slot = AvailabilitySlot::create([
            'photographer_id' => $photographer->id,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => $request->input('status', 'available'),
            'notes' => $request->notes,
        ]);

        return response()->json([
            'data' => new AvailabilitySlotResource($slot),
            'message' => 'Availability slot created successfully.',
        ], 201);
    }

    /**
     * Display the specified availability slot.
     */
    public function show(AvailabilitySlot $availabilitySlot): JsonResponse
    {
        $this->authorize('view', $availabilitySlot);

        return response()->json([
            'data' => new AvailabilitySlotResource($availabilitySlot),
        ]);
    }

    /**
     * Update the specified availability slot.
     */
    public function update(UpdateAvailabilitySlotRequest $request, AvailabilitySlot $availabilitySlot): JsonResponse
    {
        $this->authorize('update', $availabilitySlot);

        $availabilitySlot->update($request->validated());

        return response()->json([
            'data' => new AvailabilitySlotResource($availabilitySlot->fresh()),
            'message' => 'Availability slot updated successfully.',
        ]);
    }

    /**
     * Remove the specified availability slot.
     */
    public function destroy(AvailabilitySlot $availabilitySlot): JsonResponse
    {
        $this->authorize('delete', $availabilitySlot);

        $availabilitySlot->delete();

        return response()->json(['message' => 'Availability slot deleted successfully.']);
    }

    /**
     * Bulk update availability slots (e.g., mark multiple dates as unavailable).
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();
        $photographer = $user->photographer;

        if (! $photographer) {
            return response()->json(['message' => 'Please complete your photographer profile first.'], 400);
        }

        $validated = $request->validate([
            'dates' => ['required', 'array', 'min:1'],
            'dates.*' => ['required', 'date', 'after_or_equal:today'],
            'status' => ['required', 'string', 'in:available,unavailable,booked'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i', 'after:start_time'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $created = [];
        foreach ($validated['dates'] as $date) {
            $slot = AvailabilitySlot::updateOrCreate(
                [
                    'photographer_id' => $photographer->id,
                    'date' => $date,
                    'start_time' => $validated['start_time'] ?? '00:00',
                    'end_time' => $validated['end_time'] ?? '23:59',
                ],
                [
                    'status' => $validated['status'],
                    'notes' => $validated['notes'] ?? null,
                ]
            );
            $created[] = new AvailabilitySlotResource($slot);
        }

        return response()->json([
            'data' => $created,
            'message' => count($created).' availability slot(s) updated successfully.',
        ]);
    }
}
