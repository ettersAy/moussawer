# Task P2-T01: Create `AvailabilityService` for Real-Time Availability Checks

## Context
Currently, availability checking is scattered between `BookingController::store()` (checks slot existence by date) and `AvailabilitySlotController::publicAvailability()`. We need a dedicated **public-facing** endpoint that validates a specific slot against the photographer's `AvailabilitySlot` records — **not** the photographer's `availability_status` flag (which is a high-level toggle).

## Changes

### A. New Service: `App\Services\AvailabilityService`
Located at `app/Services/AvailabilityService.php`, following `BookingService` pattern (constructor DI, typed return).

```php
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
```

### B. New Controller: `App\Http\Controllers\Api\Public\AvailabilityCheckController`
Located at `app/Http/Controllers/Api/Public/AvailabilityCheckController.php`.

```php
<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\AvailabilitySlotResource;
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
```

### C. Register Routes in `routes/api.php`
```php
// Public availability check (no auth required — client sees before logging in or while browsing)
Route::get('/photographers/{photographer}/availability/check', [AvailabilityCheckController::class, 'check']);
Route::get('/photographers/{photographer}/availability/slots', [AvailabilityCheckController::class, 'slots']);
```

## Why This Approach
- **Separation of concerns**: The existing `publicAvailability` method on `AvailabilitySlotController` is a photographer-management endpoint. We need a **public consumer** endpoint.
- **Real-time validation**: The `check` endpoint accepts a specific datetime + duration, matching the frontend's `SchedulePicker` selection.
- **Pattern consistency**: Follows `BookingService` constructor DI, returns JSON responses consistent with existing resource patterns.

## Validation
- New endpoint returns `{available: true/false, message?: string}`.
- Existing `publicAvailability` route remains unchanged.
- Unauthenticated users can call these routes (they're in the public section).

## Files Modified/Created
- `app/Services/AvailabilityService.php` (NEW)
- `app/Http/Controllers/Api/Public/AvailabilityCheckController.php` (NEW)
- `routes/api.php`
