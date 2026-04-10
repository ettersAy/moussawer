<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Http\Resources\ContactSubmissionResource;
use App\Mail\ContactSubmissionConfirmation;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ContactSubmissionController extends Controller
{
    public function __construct(private readonly ContactService $contactService) {}

    /**
     * Store a new contact submission.
     * Uses: StoreContactRequest (validation), ContactService (logic), ContactSubmissionResource (response shaping).
     */
    public function store(StoreContactRequest $request): JsonResponse
    {
        $submission = $this->contactService->store($request->validated());

        // Send confirmation email to the submitter
        Mail::queue(new ContactSubmissionConfirmation($submission));

        return (new ContactSubmissionResource($submission))
            ->response()
            ->setStatusCode(201);
    }
}
