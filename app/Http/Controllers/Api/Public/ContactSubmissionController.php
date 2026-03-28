<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Http\Resources\ContactSubmissionResource;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ContactSubmissionController extends Controller
{
    public function __construct(private readonly ContactService $contactService)
    {
    }

    /**
     * Store a new contact submission.
     * Uses: StoreContactRequest (validation), ContactService (logic), ContactSubmissionResource (response shaping).
     */
    public function store(StoreContactRequest $request): JsonResponse
    {
        $submission = $this->contactService->store($request->validated());

        return (new ContactSubmissionResource($submission))
            ->response()
            ->setStatusCode(201);
    }
}
