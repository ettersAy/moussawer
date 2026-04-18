<?php

namespace App\Http\Requests\Photographer;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePortfolioItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->isPhotographer() && $this->portfolio_item->photographer_id === auth()->user()->photographer->id;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'tags' => ['nullable', 'string'],
        ];
    }
}
