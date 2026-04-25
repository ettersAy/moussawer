<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class BookingRequestController extends Controller
{
    public function __construct(
        protected BookingService $bookingService
    ) {}

    /**
     * Store a newly created booking request.
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['client_id'] = $request->user()->id;

        try {
            $booking = $this->bookingService->createBooking($data);

            return (new BookingResource($booking))->response()->setStatusCode(201);
        } catch (ValidationException $e) {
            return $e->getResponse();
        }
    }
}
