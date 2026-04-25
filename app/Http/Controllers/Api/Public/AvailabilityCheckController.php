<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\AvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilityCheckController extends Controller
{
    public function __construct(
        protected AvailabilityService $availabilityService
    ) {}

    /**
     * Quick availability check for a specific slot (used by the frontend scheduler).
     */
    public function check(Request $request, int $photographerId): JsonResponse
    {
        $request->validate([
            'datetime' => 'required|date_format:Y-m-d H:i|after:now',
            'duration_minutes' => 'required|integer|min:30|max:1440',
        ]);

        $result = $this->availabilityService->checkSlotAvailability(
            $photographerId,
            $request->datetime,
            (int) $request->duration_minutes
        );

        return response()->json($result);
    }

    /**
     * Get all available slots for a photographer in a date range.
     */
    public function slots(Request $request, int $photographerId): JsonResponse
    {
        $request->validate([
            'from' => 'required|date_format:Y-m-d',
            'to' => 'required|date_format:Y-m-d|after_or_equal:from',
        ]);

        $slots = $this->availabilityService->getAvailableSlots(
            $photographerId,
            $request->from,
            $request->to
        );

        return response()->json(['data' => $slots]);
    }
}
