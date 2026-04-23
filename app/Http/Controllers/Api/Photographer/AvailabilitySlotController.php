<?php

namespace App\Http\Controllers\Api\Photographer;

use App\Enums\AvailabilityStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\AvailabilitySlot\StoreAvailabilitySlotRequest;
use App\Http\Requests\AvailabilitySlot\UpdateAvailabilitySlotRequest;
use App\Http\Resources\AvailabilitySlotResource;
use App\Models\AvailabilitySlot;
use Illuminate\Http\Request;

class AvailabilitySlotController extends Controller
{
    /**
     * Display a listing of availability slots for a date range.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', AvailabilitySlot::class);

        $photographer = $request->user()->photographer;

        if (! $photographer) {
            return response()->json(['message' => 'Photographer profile not found.'], 404);
        }

        $query = AvailabilitySlot::where('photographer_id', $photographer->id);

        // Filter by date range
        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $slots = $query->orderBy('date')->orderBy('start_time')->get();

        return AvailabilitySlotResource::collection($slots);
    }

    /**
     * Store one or multiple availability slots.
     */
    public function store(StoreAvailabilitySlotRequest $request)
    {
        $this->authorize('create', AvailabilitySlot::class);

        $photographer = $request->user()->photographer;

        if (! $photographer) {
            return response()->json(['message' => 'Photographer profile not found.'], 404);
        }

        $createdSlots = [];

        foreach ($request->slots as $slotData) {
            // Check for overlapping slots
            $overlapQuery = AvailabilitySlot::where('photographer_id', $photographer->id)
                ->whereDate('date', $slotData['date']);

            if (! empty($slotData['start_time']) && ! empty($slotData['end_time'])) {
                // Time-specific slot: check for overlapping time ranges
                $overlapQuery->where(function ($q) use ($slotData) {
                    $q->where(function ($q) use ($slotData) {
                        $q->where('start_time', '<=', $slotData['start_time'])
                            ->where('end_time', '>', $slotData['start_time']);
                    })->orWhere(function ($q) use ($slotData) {
                        $q->where('start_time', '<', $slotData['end_time'])
                            ->where('end_time', '>=', $slotData['end_time']);
                    })->orWhere(function ($q) use ($slotData) {
                        $q->where('start_time', '>=', $slotData['start_time'])
                            ->where('end_time', '<=', $slotData['end_time']);
                    });
                });
            } else {
                // Full-day slot: check if any slot exists for this date
                $overlapQuery->whereNull('start_time')->whereNull('end_time');
            }

            if ($overlapQuery->exists()) {
                return response()->json([
                    'message' => 'Slot overlaps with an existing slot on '.$slotData['date'].'.',
                ], 409);
            }

            $slot = AvailabilitySlot::create([
                'photographer_id' => $photographer->id,
                'date' => $slotData['date'],
                'start_time' => $slotData['start_time'] ?? null,
                'end_time' => $slotData['end_time'] ?? null,
                'status' => $slotData['status'] ?? 'available',
            ]);

            $createdSlots[] = $slot;
        }

        return AvailabilitySlotResource::collection(collect($createdSlots))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update the status of an availability slot.
     */
    public function update(UpdateAvailabilitySlotRequest $request, AvailabilitySlot $slot)
    {
        $this->authorize('update', $slot);

        $photographer = $request->user()->photographer;

        if (! $photographer) {
            return response()->json(['message' => 'Photographer profile not found.'], 404);
        }

        // Ensure the slot belongs to the authenticated photographer
        if ($slot->photographer_id !== $photographer->id) {
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        }

        $newStatus = $request->status;

        // Validate status transition
        $currentStatus = AvailabilityStatus::from($slot->status);
        $newStatusEnum = AvailabilityStatus::from($newStatus);

        if (! in_array($newStatusEnum, $currentStatus->canTransitionTo())) {
            return response()->json([
                'message' => "Cannot transition from {$slot->status} to {$newStatus}.",
            ], 422);
        }

        // If marking as booked, check no conflict with existing bookings
        if ($newStatus === 'booked') {
            $conflict = AvailabilitySlot::where('photographer_id', $photographer->id)
                ->whereDate('date', $slot->date)
                ->where('status', 'booked')
                ->where('id', '!=', $slot->id)
                ->exists();

            if ($conflict) {
                return response()->json([
                    'message' => 'A booked slot already exists for this date/time.',
                ], 409);
            }
        }

        $slot->update(['status' => $newStatus]);

        return new AvailabilitySlotResource($slot);
    }

    /**
     * Remove the specified availability slot.
     */
    public function destroy(AvailabilitySlot $slot)
    {
        $this->authorize('delete', $slot);

        $photographer = request()->user()->photographer;

        if (! $photographer) {
            return response()->json(['message' => 'Photographer profile not found.'], 404);
        }

        // Ensure the slot belongs to the authenticated photographer
        if ($slot->photographer_id !== $photographer->id) {
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        }

        $slot->delete();

        return response()->noContent();
    }

    /**
     * Get monthly calendar view with counts of available/unavailable/booked days.
     */
    public function calendar(Request $request)
    {
        $this->authorize('viewAny', AvailabilitySlot::class);

        $photographer = $request->user()->photographer;

        if (! $photographer) {
            return response()->json(['message' => 'Photographer profile not found.'], 404);
        }

        $month = $request->input('month', now()->format('Y-m'));

        // Parse month (format: Y-m)
        $parts = explode('-', $month);
        $year = (int) ($parts[0] ?? now()->year);
        $monthNum = (int) ($parts[1] ?? now()->month);

        $startDate = now()->setDate($year, $monthNum, 1)->startOfDay();
        $endDate = (clone $startDate)->endOfMonth();

        $slots = AvailabilitySlot::where('photographer_id', $photographer->id)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->get();

        // Group by date and status
        $calendarData = [];
        $current = clone $startDate;

        while ($current <= $endDate) {
            $dateStr = $current->format('Y-m-d');
            $daySlots = $slots->filter(fn ($slot) => $slot->date->format('Y-m-d') === $dateStr);

            $calendarData[$dateStr] = [
                'date' => $dateStr,
                'day_of_week' => $current->dayOfWeek,
                'is_today' => $current->isToday(),
                'is_past' => $current->isPast(),
                'total_slots' => $daySlots->count(),
                'available' => $daySlots->where('status', 'available')->count(),
                'unavailable' => $daySlots->where('status', 'unavailable')->count(),
                'booked' => $daySlots->where('status', 'booked')->count(),
                'has_slots' => $daySlots->isNotEmpty(),
            ];

            $current->addDay();
        }

        return response()->json([
            'year' => $year,
            'month' => $monthNum,
            'days' => array_values($calendarData),
        ]);
    }

    /**
     * Get available slots for a photographer (public route).
     */
    public function publicAvailability($photographerId)
    {
        $slots = AvailabilitySlot::where('photographer_id', $photographerId)
            ->available()
            ->whereDate('date', '>=', now()->format('Y-m-d'))
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return AvailabilitySlotResource::collection($slots);
    }
}
