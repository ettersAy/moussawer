<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PhotographerService;
use Illuminate\Http\JsonResponse;

class PhotographerController extends Controller {
    protected PhotographerService $photographerService;

    /**
     * Dependency Inversion Principle (DIP):
     * We depend on the PhotographerService class, which Laravel's Container 
     * automatically injects for us. We don't "new up" the service here.
     */
    public function __construct(PhotographerService $service) {
        $this->photographerService = $service;
    }

    /**
     * SRP: Controller only handles the Request/Response cycle.
     */
    public function index(): JsonResponse {
        $photographers = $this->photographerService->getRecommendations();
        return response()->json($photographers);
    }
}
