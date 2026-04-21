<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PhotographerResource extends JsonResource
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
            'bio' => $this->bio,
            'hourly_rate' => (float) $this->hourly_rate,
            'availability_status' => $this->availability_status,
            'user' => new UserResource($this->whenLoaded('user')),
            'services' => PhotographerServiceResource::collection($this->whenLoaded('services')),
            // Add other fields needed for the discovery page
            'portfolio_url' => $this->getValidPortfolioUrl(),
            'rating' => 5.0, // Placeholder for now, could be calculated from reviews
        ];
    }

    /**
     * Filter out obviously fake/mock URLs from seeders to prevent console errors.
     */
    protected function getValidPortfolioUrl(): ?string
    {
        if (! $this->portfolio_url) {
            return null;
        }

        // List of domains commonly used by Faker that are often broken/slow
        $mockDomains = [
            'howe.com',
            'mayert.biz',
            'carroll.com',
            'schuppe.com',
            'example.com',
            'example.org',
            'example.net',
        ];

        foreach ($mockDomains as $domain) {
            if (str_contains($this->portfolio_url, $domain)) {
                return null;
            }
        }

        return $this->portfolio_url;
    }
}
