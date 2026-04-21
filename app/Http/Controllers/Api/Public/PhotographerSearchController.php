<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PhotographerResource;
use App\Services\PhotographerService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PhotographerSearchController extends Controller
{
    public function __construct(
        protected PhotographerService $photographerService
    ) {}

    /**
     * Display a listing of photographers based on search criteria.
     */
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['location', 'category', 'min_price', 'max_price']);

        $photographers = $this->photographerService->search($filters);

        return PhotographerResource::collection($photographers);
    }
}
