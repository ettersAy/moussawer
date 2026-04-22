<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\DB;

class BookingService
{
    /**
     * Create a new booking request.
     *
     * @param array{
     *     client_id: int,
     *     photographer_id: int,
     *     photographer_service_id: int,
     *     scheduled_date: string,
     *     location: string,
     *     notes: ?string
     * } $data
     */
    public function createBooking(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            return Booking::create([
                'client_id' => $data['client_id'],
                'photographer_id' => $data['photographer_id'],
                'photographer_service_id' => $data['photographer_service_id'],
                'scheduled_date' => $data['scheduled_date'],
                'location' => $data['location'],
                'notes' => $data['notes'] ?? null,
                'status' => 'pending',
            ]);
        });
    }
}
