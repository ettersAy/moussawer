<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_id' => $this->client_id,
            'photographer_id' => $this->photographer_id,
            'photographer_service_id' => $this->photographer_service_id,
            'scheduled_date' => $this->scheduled_date,
            'location' => $this->location,
            'duration_minutes' => $this->duration_minutes,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'client' => [
                'id' => $this->client->id,
                'name' => $this->client->name,
                'email' => $this->client->email,
                'phone' => $this->client->phone,
            ],
            'photographer' => [
                'id' => $this->photographer->id,
                'hourly_rate' => $this->photographer->hourly_rate,
                'availability_status' => $this->photographer->availability_status,
                'user' => [
                    'id' => $this->photographer->user->id,
                    'name' => $this->photographer->user->name,
                    'email' => $this->photographer->user->email,
                ],
            ],
            'service' => $this->photographerService ? [
                'id' => $this->photographerService->id,
                'name' => $this->photographerService->name,
                'description' => $this->photographerService->description,
                'price' => $this->photographerService->price,
                'duration_minutes' => $this->photographerService->duration_minutes,
                'minimum_hours' => $this->photographerService->minimum_hours,
                'is_active' => $this->photographerService->is_active,
                'sort_order' => $this->photographerService->sort_order,
            ] : null,
            'payment' => $this->payment ? [
                'id' => $this->payment->id,
                'amount' => $this->payment->amount,
                'status' => $this->payment->status,
                'method' => $this->payment->method,
                'transaction_id' => $this->payment->transaction_id,
                'created_at' => $this->payment->created_at,
            ] : null,
            'review' => $this->review ? [
                'id' => $this->review->id,
                'rating' => $this->review->rating,
                'comment' => $this->review->comment,
                'created_at' => $this->review->created_at,
            ] : null,
        ];
    }
}
