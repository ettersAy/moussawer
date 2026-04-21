<?php

namespace App\Services;

use App\Models\Photographer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class PhotographerService
{
    /**
     * Search for photographers based on filters.
     *
     * @param  array<string, mixed>  $filters
     */
    public function search(array $filters): LengthAwarePaginator
    {
        $query = Photographer::query()->with(['user', 'services']);

        $this->applyFilters($query, $filters);

        return $query->paginate(request()->integer('per_page', 15));
    }

    /**
     * Apply search filters to the photographer query.
     */
    protected function applyFilters(Builder $query, array $filters): void
    {
        // Filter by location (bio search for now or user address if available)
        if (! empty($filters['location'])) {
            $query->where('bio', 'like', '%'.$filters['location'].'%');
        }

        // Filter by category (service name)
        if (! empty($filters['category'])) {
            $query->whereHas('services', function (Builder $q) use ($filters) {
                $q->where('name', 'like', '%'.$filters['category'].'%');
            });
        }

        // Filter by price range (hourly_rate)
        if (! empty($filters['min_price'])) {
            $query->where('hourly_rate', '>=', $filters['min_price']);
        }

        if (! empty($filters['max_price'])) {
            $query->where('hourly_rate', '<=', $filters['max_price']);
        }

        // Ensure photographer is available
        $query->where('availability_status', 'available');
    }
}
