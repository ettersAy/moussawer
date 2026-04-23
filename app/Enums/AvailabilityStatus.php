<?php

namespace App\Enums;

enum AvailabilityStatus: string
{
    case Available = 'available';
    case Unavailable = 'unavailable';
    case Booked = 'booked';

    /**
     * Returns a human-readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            AvailabilityStatus::Available => 'Available',
            AvailabilityStatus::Unavailable => 'Unavailable',
            AvailabilityStatus::Booked => 'Booked',
        };
    }
}
