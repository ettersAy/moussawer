<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'amount',
        'currency',
        'status',
        'payment_type',
        'external_id',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => 'string',
            'payment_type' => 'string',
        ];
    }

    // --- Relationships ---

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
