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

    /**
     * Returns valid status transitions from this status.
     *
     * @return array<int, AvailabilityStatus>
     */
    public function canTransitionTo(): array
    {
        return match ($this) {
            AvailabilityStatus::Available => [
                AvailabilityStatus::Unavailable,
                AvailabilityStatus::Booked,
            ],
            AvailabilityStatus::Unavailable => [
                AvailabilityStatus::Available,
            ],
            AvailabilityStatus::Booked => [
                AvailabilityStatus::Available,
            ],
        };
    }
}
