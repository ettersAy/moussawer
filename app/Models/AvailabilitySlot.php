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
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'start_time' => 'string',
            'end_time' => 'string',
            'status' => 'string',
        ];
    }

    // --- Relationships ---

    public function photographer(): BelongsTo
    {
        return $this->belongsTo(Photographer::class);
    }
}
