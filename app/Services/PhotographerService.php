<?php

namespace App\Services;

class PhotographerService
{
    /**
     * Business logic for photographer operations.
     */
    public function getRecommendations()
    {
        // Here we could calculate ratings, proximity, and availability
        // For now, returning dummy data
        return [
            ['id' => 1, 'name' => 'Alex Studio', 'specialty' => 'Weddings'],
            ['id' => 2, 'name' => 'Sara Lens', 'specialty' => 'Portraits'],
        ];
    }

    /**
     * SRP: Calculation Logic lives here, NOT in the Controller.
     */
    public function calculateEarnings($totalFees, $commissionRate = 0.15)
    {
        return $totalFees * (1 - $commissionRate);
    }
}
