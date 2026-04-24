# Task P1-T01: Add Event Duration & Status Enum to Bookings Table

## Context
The current `bookings` table stores `scheduled_date` as datetime, `location`, `notes`, and `status` (string enum). The existing `StoreBookingRequest` already requires `photographer_service_id` but the booking flow needs richer event detail capture — specifically duration.

## Changes

### A. Create Migration: Add `duration_minutes` to `bookings`
```php
// database/migrations/YYYY_MM_DD_HHMMSS_add_duration_minutes_to_bookings_table.php
Schema::table('bookings', function (Blueprint $table) {
    $table->integer('duration_minutes')->nullable()->after('notes')
        ->comment('Actual event duration in minutes');
});
```

**Why nullable?** During initial booking request, the service's `duration_minutes` auto-fills it. Allow overrides.

### B. Update `Booking` Model fillable + casts
```php
protected $fillable = [
    'client_id',
    'photographer_id',
    'photographer_service_id',
    'scheduled_date',
    'location',
    'duration_minutes',  // NEW
    'status',
    'notes',
];

protected function casts(): array
{
    return [
        'scheduled_date' => 'datetime',
        'status' => 'string',
        'duration_minutes' => 'integer',  // NEW
    ];
}
```

### C. Update `BookingResource` to include `duration_minutes`
Add to the main resource array:
```php
'duration_minutes' => $this->duration_minutes,
```

## Validation
- Migration runs without errors.
- `Booking::factory()` includes `duration_minutes => fake()->numberBetween(60, 480)`.
- Existing tests pass (`sail artisan test --compact`).

## Files Modified
- `database/migrations/` - New migration file
- `app/Models/Booking.php`
- `app/Http/Resources/BookingResource.php`
- `database/factories/BookingFactory.php` (if exists)
