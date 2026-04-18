<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PortfolioItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    /**
     * Display a listing of the user's portfolio items.
     */
    public function index(User $user): JsonResponse
    {
        abort_if(! auth()->user() || ! auth()->user()->isAdmin(), 403);

        if (! $user->isPhotographer()) {
            return response()->json(['message' => 'User is not a photographer.'], 400);
        }

        $photographer = $user->photographer;

        if (! $photographer) {
            return response()->json(['data' => []]);
        }

        $items = $photographer->portfolioItems()->latest()->get();

        // Append full URLs to the items
        $items->transform(function ($item) {
            $item->image_full_url = str_starts_with($item->image_url, 'http')
                ? $item->image_url
                : asset('storage/'.$item->image_url);

            return $item;
        });

        return response()->json(['data' => $items, 'user' => $user->only(['id', 'name', 'email'])]);
    }

    /**
     * Remove the specified portfolio item from storage.
     */
    public function destroy(User $user, PortfolioItem $portfolio): JsonResponse
    {
        abort_if(! auth()->user() || ! auth()->user()->isAdmin(), 403);

        if ($portfolio->photographer->user_id !== $user->id) {
            return response()->json(['message' => 'Portfolio item does not belong to this user.'], 400);
        }

        if ($portfolio->image_url && ! str_starts_with($portfolio->image_url, 'http')) {
            Storage::disk('public')->delete($portfolio->image_url);
        }

        $portfolio->delete();

        return response()->json(['message' => 'Portfolio item deleted successfully by admin.']);
    }
}
