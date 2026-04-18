<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService
{
    /**
     * Get paginated layout of users.
     */
    public function getAllPaginated(
        int $perPage = 15,
        ?string $search = null,
        ?string $role = null,
        ?string $status = null,
        ?bool $hasPortfolio = null,
        ?int $minPortfolioSize = null,
        ?int $minBookingCount = null,
        ?string $sortBy = 'created_at',
        ?string $sortDirection = 'desc'
    ): LengthAwarePaginator {
        $query = User::query();

        // Include relationships with count
        $query->withCount([
            'photographer as portfolio_count' => function ($q) {
                $q->join('portfolio_items', 'photographers.id', '=', 'portfolio_items.photographer_id');
            },
            'photographer as photographer_bookings_count' => function ($q) {
                $q->join('bookings', 'photographers.id', '=', 'bookings.photographer_id');
            },
            'bookingsAsClient as client_bookings_count'
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if ($role) {
            $query->where('role', $role);
        }
        
        if ($status) {
            $query->where('status', $status);
        }
        
        // Photographers specific filters
        if ($hasPortfolio !== null) {
            if ($hasPortfolio) {
                $query->whereHas('photographer.portfolioItems');
            } else {
                $query->whereDoesntHave('photographer.portfolioItems');
            }
        }
        
        if ($minPortfolioSize !== null) {
            $query->has('photographer.portfolioItems', '>=', $minPortfolioSize);
        }

        if ($minBookingCount !== null) {
            $query->havingRaw('(IFNULL(photographer_bookings_count, 0) + IFNULL(client_bookings_count, 0)) >= ?', [$minBookingCount]);
        }

        $allowedSorts = ['name', 'created_at', 'portfolio_count', 'total_bookings'];
        $sortBy = in_array($sortBy, $allowedSorts) ? $sortBy : 'created_at';
        $sortDirection = strtolower($sortDirection) === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'total_bookings') {
            $query->orderByRaw('(IFNULL(photographer_bookings_count, 0) + IFNULL(client_bookings_count, 0)) ' . $sortDirection);
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new user.
     */
    public function createUser(array $data): User
    {
        $data['password'] = Hash::make($data['password']);

        return User::create($data);
    }

    /**
     * Update an existing user.
     */
    public function updateUser(User $user, array $data): User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return $user;
    }

    /**
     * Delete a user.
     */
    public function deleteUser(User $user): void
    {
        $user->delete();
    }
}
