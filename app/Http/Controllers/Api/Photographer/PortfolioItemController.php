<?php

namespace App\Http\Controllers\Api\Photographer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Photographer\StorePortfolioItemRequest;
use App\Models\PortfolioItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PortfolioItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        abort_if(! $user->isPhotographer(), 403, 'Only photographers have portfolios.');

        $photographer = $user->photographerProfile;

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

        return response()->json(['data' => $items]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePortfolioItemRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();
        $photographer = $user->photographerProfile;

        if (! $photographer) {
            return response()->json(['message' => 'Please complete your photographer profile first.'], 400);
        }

        $path = $request->file('image')->store('portfolios', 'public');

        $item = $photographer->portfolioItems()->create([
            'title' => $request->title,
            'description' => $request->description,
            'image_url' => $path,
        ]);

        $item->image_full_url = asset('storage/'.$item->image_url);

        return response()->json(['data' => $item, 'message' => 'Portfolio item added successfully!'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PortfolioItem $portfolio): JsonResponse
    {
        // Add authorization check if needed
        return response()->json(['data' => $portfolio]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PortfolioItem $portfolio): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        if ($portfolio->photographer->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        if ($portfolio->image_url && ! str_starts_with($portfolio->image_url, 'http')) {
            Storage::disk('public')->delete($portfolio->image_url);
        }

        $portfolio->delete();

        return response()->json(['message' => 'Portfolio item deleted successfully.']);
    }
}
