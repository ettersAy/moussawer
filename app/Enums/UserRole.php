<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin        = 'admin';
    case Photographer = 'photographer';
    case Client       = 'client';

    /**
     * Returns a human-readable label for the role.
     */
    public function label(): string
    {
        return match($this) {
            UserRole::Admin        => 'Administrator',
            UserRole::Photographer => 'Photographer',
            UserRole::Client       => 'Client',
        };
    }
}
