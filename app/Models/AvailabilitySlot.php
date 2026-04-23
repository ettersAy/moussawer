<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvailabilitySlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'photographer_id',
        'date',
        'start_time',
        'end_time',
        'status',
        'booking_id',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
            'status' => 'string',
        ];
    }

    // --- Relationships ---

    public function photographer(): BelongsTo
    {
        return $this->belongsTo(Photographer::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    // --- Scopes ---

    /**
     * Scope to only available slots.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope to slots on a specific date.
     */
    public function scopeOnDate($query, string $date)
    {
        return $query->whereDate('date', $date);
    }

    /**
     * Scope to slots within a date range.
     */
    public function scopeInRange($query, string $from, string $to)
    {
        return $query->whereBetween('date', [$from, $to]);
    }
}
