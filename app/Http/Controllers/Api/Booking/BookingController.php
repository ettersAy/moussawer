<?php

namespace App\Http\Controllers\Api\Booking;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Requests\Booking\UpdateBookingStatusRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Photographer;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * Store a newly created booking in storage.
     */
    public function store(StoreBookingRequest $request)
    {
        $photographer = Photographer::findOrFail($request->photographer_id);

        // Check photographer availability
        if ($photographer->availability_status !== 'available') {
            return response()->json([
                'message' => 'Photographer is not available for booking.',
            ])->setStatusCode(409);
        }

        // Create booking
        $booking = Booking::create([
            'client_id' => auth()->id(),
            'photographer_id' => $request->photographer_id,
            'scheduled_date' => $request->scheduled_date,
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        return (new BookingResource($booking))->response()->setStatusCode(201);
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Booking::class);

        $query = Booking::with(['client', 'photographer.user']);

        // Filter by role
        if (auth()->user()->role === UserRole::Client) {
            $query->where('client_id', auth()->id());
        } elseif (auth()->user()->role === UserRole::Photographer) {
            $photographer = auth()->user()->photographer;
            if ($photographer) {
                $query->where('photographer_id', $photographer->id);
            } else {
                $query->whereRaw('1 = 0'); // Return empty if no profile
            }
        }
        // Admin sees all bookings

        // Filter by status if provided
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'scheduled_date');
        $sortDirection = $request->input('sort_direction', 'desc');

        $allowedSorts = ['scheduled_date', 'created_at', 'status'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->latest();
        }

        $bookings = $query->paginate(15);

        return BookingResource::collection($bookings);
    }

    /**
     * Display the specified booking.
     */
    public function show(Booking $booking)
    {
        $this->authorize('view', $booking);

        return new BookingResource($booking);
    }

    /**
     * Update the booking status.
     */
    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking)
    {
        $this->authorize('updateStatus', $booking);

        // Validate status transitions
        $validTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['completed', 'cancelled'],
            'completed' => [],
            'cancelled' => [],
        ];

        if (! in_array($request->status, $validTransitions[$booking->status] ?? [])) {
            return response()->json([
                'message' => "Cannot transition from {$booking->status} to {$request->status}.",
            ])->setStatusCode(422);
        }

        $booking->update(['status' => $request->status]);

        return new BookingResource($booking);
    }

    /**
     * Delete the specified booking.
     */
    public function destroy(Booking $booking)
    {
        $this->authorize('delete', $booking);

        $booking->delete();

        return response()->noContent();
    }
}
