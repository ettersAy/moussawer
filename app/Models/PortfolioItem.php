<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'photographer_id',
        'title',
        'description',
        'image_url',
        'category',
        'tags',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
        ];
    }

    // --- Relationships ---

    public function photographer(): BelongsTo
    {
        return $this->belongsTo(Photographer::class);
    }
}
