<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PhotographerResource;
use App\Models\Photographer;

class PhotographerProfileController extends Controller
{
    /**
     * Display the specified photographer profile.
     */
    public function __invoke(Photographer $photographer)
    {
        $photographer->load(['user', 'services']);

        return new PhotographerResource($photographer);
    }
}
