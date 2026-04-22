<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    // --- Role helpers ---

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isPhotographer(): bool
    {
        return $this->role === UserRole::Photographer;
    }

    public function isClient(): bool
    {
        return $this->role === UserRole::Client;
    }

    // --- Relationships ---

    public function photographer()
    {
        return $this->hasOne(Photographer::class);
    }

    public function bookingsAsClient()
    {
        return $this->hasMany(Booking::class, 'client_id');
    }

    public function reviewsAsClient()
    {
        return $this->hasMany(Review::class, 'client_id');
    }

    public function reviewsAsPhotographer()
    {
        return $this->hasMany(Review::class, 'photographer_id');
    }

    public function client(): HasOne
    {
        return $this->hasOne(Client::class);
    }
}
