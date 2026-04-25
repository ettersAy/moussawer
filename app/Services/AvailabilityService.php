<?php

namespace App\Services;

use App\Enums\AvailabilityStatus as SlotStatus;
use App\Models\AvailabilitySlot;
use App\Models\Photographer;
use Carbon\Carbon;

class AvailabilityService
{
    /**
     * Check if a photographer is available for a specific date/time.
     *
     * @param int $photographerId
     * @param string $dateTime ISO datetime string
     * @param int $durationMinutes Required duration in minutes
     * @return array{available: bool, message?: string}
     */
    public function checkSlotAvailability(
        int $photographerId,
        string $dateTime,
        int $durationMinutes
    ): array {
        $photographer = Photographer::find($photographerId);
        if (!$photographer || $photographer->availability_status !== 'available') {
            return [
                'available' => false,
                'message' => 'Photographer is currently not accepting bookings.',
            ];
        }

        $requestedDate = Carbon::parse($dateTime)->format('Y-m-d');
        $requestedTime = Carbon::parse($dateTime)->format('H:i');

        // Find a matching available slot on that date
        $slot = AvailabilitySlot::where('photographer_id', $photographerId)
            ->whereDate('date', $requestedDate)
            ->where('status', SlotStatus::Available)
            ->where('start_time', '<=', $requestedTime)
            ->where('end_time', '>=', Carbon::parse($dateTime)->addMinutes($durationMinutes)->format('H:i'))
            ->first();

        if (!$slot) {
            return [
                'available' => false,
                'message' => 'No available slot matches the requested date and duration.',
            ];
        }

        return ['available' => true];
    }

    /**
     * Get available date-time ranges for a photographer within a date range.
     */
    public function getAvailableSlots(int $photographerId, string $from, string $to): array
    {
        return AvailabilitySlot::where('photographer_id', $photographerId)
            ->available()
            ->whereBetween('date', [$from, $to])
            ->whereDate('date', '>=', now()->format('Y-m-d'))
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->toArray();
    }
}
