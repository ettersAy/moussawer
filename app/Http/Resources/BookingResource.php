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
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'client' => [
                'id' => $this->client->id,
                'name' => $this->client->name,
                'email' => $this->client->email,
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
        ];
    }
}
