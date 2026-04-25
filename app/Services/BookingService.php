<?php

namespace App\Services;

use App\Enums\AvailabilityStatus;
use App\Models\AvailabilitySlot;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BookingService
{
    public function __construct(
        protected AvailabilityService $availabilityService
    ) {}

    /**
     * Create a new booking request with availability validation.
     *
     * @param array{
     *     client_id: int,
     *     photographer_id: int,
     *     photographer_service_id: int,
     *     scheduled_date: string,
     *     location: string,
     *     duration_minutes?: ?int,
     *     notes: ?string
     * } $data
     */
    public function createBooking(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            // If duration not provided, default from service
            if (empty($data['duration_minutes'])) {
                $service = \App\Models\PhotographerService::findOrFail($data['photographer_service_id']);
                $data['duration_minutes'] = $service->duration_minutes ?? 60;
            }

            // Run availability check — throws validation if not available
            $availability = $this->availabilityService->checkSlotAvailability(
                $data['photographer_id'],
                $data['scheduled_date'],
                $data['duration_minutes']
            );

            if (!$availability['available']) {
                throw new \Illuminate\Validation\ValidationException(
                    validator([], []),
                    response()->json([
                        'message' => $availability['message'] ?? 'Requested time is not available.',
                        'errors' => ['scheduled_date' => [$availability['message'] ?? 'Not available.']],
                    ], 409)
                );
            }

            $booking = Booking::create([
                'client_id' => $data['client_id'],
                'photographer_id' => $data['photographer_id'],
                'photographer_service_id' => $data['photographer_service_id'],
                'scheduled_date' => $data['scheduled_date'],
                'location' => $data['location'],
                'duration_minutes' => $data['duration_minutes'],
                'notes' => $data['notes'] ?? null,
                'status' => 'pending',
            ]);

            // Create booked availability slot
            $requestedDate = Carbon::parse($data['scheduled_date']);
            $endTime = $requestedDate->copy()->addMinutes($data['duration_minutes']);

            AvailabilitySlot::create([
                'photographer_id' => $data['photographer_id'],
                'date' => $requestedDate->format('Y-m-d'),
                'start_time' => $requestedDate->format('H:i'),
                'end_time' => $endTime->format('H:i'),
                'status' => AvailabilityStatus::Booked,
                'booking_id' => $booking->id,
            ]);

            return $booking;
        });
    }
}

