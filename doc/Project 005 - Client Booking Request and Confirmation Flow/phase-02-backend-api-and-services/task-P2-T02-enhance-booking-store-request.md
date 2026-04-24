# Task P2-T02: Enhance `StoreBookingRequest` with Event Details and Pre-Submission Validation

## Context
The current `Client\StoreBookingRequest` validates: `photographer_id`, `photographer_service_id`, `scheduled_date`, `location`, `notes`. The booking flow needs additional field validation, and the **service-layer** (`BookingService`) needs to verify the selected service belongs to the photographer and handle availability before saving.

## Changes

### A. Update `Client\StoreBookingRequest`
Add `duration_minutes` to validation rules. Also add existence checks to ensure the service belongs to the photographer:

```php
public function rules(): array
{
    return [
        'photographer_id' => ['required', 'integer', 'exists:photographers,id'],
        'photographer_service_id' => [
            'required',
            'integer',
            'exists:photographer_services,id',
        ],
        'scheduled_date' => ['required', 'date', 'date_format:Y-m-d H:i', 'after:now'],
        'location' => ['required', 'string', 'max:255'],
        'duration_minutes' => ['nullable', 'integer', 'min:30', 'max:1440'],
        'notes' => ['nullable', 'string', 'max:1000'],
    ];
}
```

Add `withValidator()` for cross-field validation:
```php
public function withValidator($validator)
{
    $validator->after(function ($validator) {
        $service = \App\Models\PhotographerService::find($this->photographer_service_id);
        
        if ($service && $service->photographer_id != $this->photographer_id) {
            $validator->errors()->add(
                'photographer_service_id',
                'The selected service does not belong to this photographer.'
            );
        }
    });
}
```

### B. Update `App\Services\BookingService`
The `createBooking()` method should:
1. Verify the service belongs to the photographer
2. Run the availability check via `AvailabilityService`
3. Auto-populate `duration_minutes` from service if not provided
4. Create the `Booking` and the linked `AvailabilitySlot` (mark as `booked`)

```php
<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\AvailabilitySlot;
use App\Enums\AvailabilityStatus;
use Illuminate\Support\Facades\DB;

class BookingService
{
    public function __construct(
        protected AvailabilityService $availabilityService
    ) {}

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
                    validator([], []), // bypass
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
            $requestedDate = \Carbon\Carbon::parse($data['scheduled_date']);
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
```

### C. Remove Duplicate Controller
The `Client\BookingRequestController` currently calls `BookingService::createBooking()`. The `Booking\BookingController::store()` does the same thing manually. The client route `POST /api/client/bookings` (which the `BookingRequestView.vue` calls) should remain as the authoritative client-facing endpoint.

No route changes needed — the existing `POST /api/client/bookings` route stays.

## Validation
- A `POST /api/client/bookings` with mismatched photographer-service returns 422.
- A booking on an unavailable slot returns 409.
- A valid booking creates both a `Booking` and an `AvailabilitySlot` with status `booked`.
- `duration_minutes` defaults from the service if omitted.

## Files Modified
- `app/Http/Requests/Client/StoreBookingRequest.php`
- `app/Services/BookingService.php`
