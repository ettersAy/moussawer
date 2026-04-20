<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PhotographerService extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'photographer_id',
        'name',
        'description',
        'price',
        'duration_minutes',
        'minimum_hours',
        'is_active',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'minimum_hours' => 'integer',
        'duration_minutes' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Get the photographer that owns the service.
     */
    public function photographer(): BelongsTo
    {
        return $this->belongsTo(Photographer::class);
    }
}
