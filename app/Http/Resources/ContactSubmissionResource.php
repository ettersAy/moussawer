<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactSubmissionResource extends JsonResource
{
    /**
     * Transform the model into a clean, safe JSON response.
     * Never expose raw DB models — shape the data here.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'message' => $this->message,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
