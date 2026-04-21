<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class UserController extends Controller
{
    public function __construct(private UserService $userService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        abort_if(! auth()->user() || ! auth()->user()->isAdmin(), 403);
        $users = $this->userService->getAllPaginated(
            perPage: (int) request('per_page', 15),
            search: request('search'),
            role: request('role'),
            status: request('status'),
            hasPortfolio: request()->filled('has_portfolio') ? filter_var(request('has_portfolio'), FILTER_VALIDATE_BOOLEAN) : null,
            minPortfolioSize: request('min_portfolio_size') !== null ? (int) request('min_portfolio_size') : null,
            minBookingCount: request('min_booking_count') !== null ? (int) request('min_booking_count') : null,
            sortBy: request('sort_by', 'created_at'),
            sortDirection: request('sort_direction', 'desc')
        );

        return UserResource::collection($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): UserResource
    {
        $user = $this->userService->createUser($request->validated());

        return new UserResource($user);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): UserResource
    {
        abort_if(! auth()->user() || ! auth()->user()->isAdmin(), 403);

        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $updatedUser = $this->userService->updateUser($user, $request->validated());

        return new UserResource($updatedUser);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): Response
    {
        abort_if(! auth()->user() || ! auth()->user()->isAdmin(), 403);
        $this->userService->deleteUser($user);

        return response()->noContent();
    }
}
