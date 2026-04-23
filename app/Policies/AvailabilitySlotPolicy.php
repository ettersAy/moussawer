<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\AvailabilitySlot;
use App\Models\User;

class AvailabilitySlotPolicy
{
    /**
     * Determine whether the user can view any availability slots.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::Photographer || $user->role === UserRole::Admin;
    }

    /**
     * Determine whether the user can view the availability slot.
     */
    public function view(User $user, AvailabilitySlot $slot): bool
    {
        // Photographer can view their own slots
        if ($user->role === UserRole::Photographer && $slot->photographer_id === $user->photographer?->id) {
            return true;
        }

        // Admin can view any slot
        return $user->role === UserRole::Admin;
    }

    /**
     * Determine whether the user can create availability slots.
     */
    public function create(User $user): bool
    {
        return $user->role === UserRole::Photographer;
    }

    /**
     * Determine whether the user can update the availability slot.
     */
    public function update(User $user, AvailabilitySlot $slot): bool
    {
        // Photographer can update their own slots
        if ($user->role === UserRole::Photographer && $slot->photographer_id === $user->photographer?->id) {
            return true;
        }

        // Admin can update any slot
        return $user->role === UserRole::Admin;
    }

    /**
     * Determine whether the user can delete the availability slot.
     */
    public function delete(User $user, AvailabilitySlot $slot): bool
    {
        // Photographer can delete their own slots
        if ($user->role === UserRole::Photographer && $slot->photographer_id === $user->photographer?->id) {
            return true;
        }

        // Admin can delete any slot
        return $user->role === UserRole::Admin;
    }
}
