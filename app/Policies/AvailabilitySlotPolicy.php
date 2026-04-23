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
        return $user->role === UserRole::Photographer;
    }

    /**
     * Determine whether the user can view the availability slot.
     */
    public function view(User $user, AvailabilitySlot $availabilitySlot): bool
    {
        return $this->isOwnSlot($user, $availabilitySlot);
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
    public function update(User $user, AvailabilitySlot $availabilitySlot): bool
    {
        return $this->isOwnSlot($user, $availabilitySlot);
    }

    /**
     * Determine whether the user can delete the availability slot.
     */
    public function delete(User $user, AvailabilitySlot $availabilitySlot): bool
    {
        return $this->isOwnSlot($user, $availabilitySlot);
    }

    /**
     * Check if the slot belongs to the authenticated photographer.
     */
    private function isOwnSlot(User $user, AvailabilitySlot $availabilitySlot): bool
    {
        $photographer = $user->photographer;

        return $photographer !== null && $availabilitySlot->photographer_id === $photographer->id;
    }
}
