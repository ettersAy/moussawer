<?php

namespace App\Policies;

use App\Enums\BookingStatus;
use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    /**
     * Determine whether the user can view any bookings.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::Client || $user->role === UserRole::Photographer || $user->role === UserRole::Admin;
    }

    /**
     * Determine whether the user can view the booking.
     */
    public function view(User $user, Booking $booking): bool
    {
        // Client can view their own bookings
        if ($user->role === UserRole::Client && $booking->client_id === $user->id) {
            return true;
        }

        // Photographer can view their own bookings
        if ($user->role === UserRole::Photographer && $booking->photographer_id === $user->photographer->id) {
            return true;
        }

        // Admin can view any booking
        return $user->role === UserRole::Admin;
    }

    /**
     * Determine whether the user can create bookings.
     */
    public function create(User $user): bool
    {
        return $user->role === UserRole::Client;
    }

    /**
     * Determine whether the user can update the booking status.
     */
    public function updateStatus(User $user, Booking $booking): bool
    {
        // Photographer can update their own bookings
        if ($user->role === UserRole::Photographer && $booking->photographer_id === $user->photographer->id) {
            return true;
        }

        // Admin can update any booking
        return $user->role === UserRole::Admin;
    }

    /**
     * Determine whether the user can delete the booking.
     */
    public function delete(User $user, Booking $booking): bool
    {
        // Client can delete their own pending bookings
        if ($user->role === UserRole::Client && $booking->client_id === $user->id && $booking->status === BookingStatus::Pending) {
            return true;
        }

        // Admin can delete any booking
        return $user->role === UserRole::Admin;
    }
}
