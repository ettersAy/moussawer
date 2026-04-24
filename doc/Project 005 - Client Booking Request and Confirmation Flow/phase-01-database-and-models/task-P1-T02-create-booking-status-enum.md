# Task P1-T02: Create a Formal `BookingStatus` Enum

## Context
The current `bookings.status` column uses raw strings (`'pending'`, `'confirmed'`, `'completed'`, `'cancelled'`). Following the codebase pattern in `App\Enums\AvailabilityStatus` and `App\Enums\UserRole` (both are backed string enums with `label()` methods), we need a dedicated `BookingStatus` enum to centralize status logic.

## Changes

### A. New Enum: `App\Enums\BookingStatus`
Located at `app/Enums/BookingStatus.php` following the same pattern:
```php
<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Confirmed => 'Confirmed',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Valid transitions FROM this status.
     */
    public function canTransitionTo(): array
    {
        return match ($this) {
            self::Pending => [self::Confirmed, self::Cancelled],
            self::Confirmed => [self::Completed, self::Cancelled],
            self::Completed => [],
            self::Cancelled => [],
        };
    }
}
```

### B. Update `Booking` Model cast
In `Booking.php`, change the `status` cast from `'string'` to `BookingStatus::class`.

### C. Update `StoreBookingRequest` to enforce `photographer_service_id`
Already required. No change needed but verify the existing `Client\StoreBookingRequest` already requires `photographer_service_id`.

### D. Update `UpdateBookingStatusRequest` validation
Replace the hardcoded `'in:pending,confirmed,completed,cancelled'` with:
```php
return [
    'status' => ['required', 'string', new Enum(BookingStatus::class)],
];
```
This uses Laravel's built-in `Illuminate\Validation\Rules\Enum` rule.

### E. Refactor `BookingController` status transition check
Replace the hardcoded `$validTransitions` array with `BookingStatus` enum usage:
```php
$currentStatus = BookingStatus::from($booking->status);
$newStatus = BookingStatus::from($request->status);

if (!in_array($newStatus, $currentStatus->canTransitionTo())) {
    return response()->json([
        'message' => "Cannot transition from {$booking->status} to {$request->status}.",
    ])->setStatusCode(422);
}
```

## Validation
- `BookingStatus` enum works correctly.
- Existing status transition tests continue passing.
- `php artisan tinker` can instantiate enum.

## Files Modified/Created
- `app/Enums/BookingStatus.php` (NEW)
- `app/Models/Booking.php` (cast update)
- `app/Http/Requests/Booking/UpdateBookingStatusRequest.php`
- `app/Http/Controllers/Api/Booking/BookingController.php` (transition logic)
