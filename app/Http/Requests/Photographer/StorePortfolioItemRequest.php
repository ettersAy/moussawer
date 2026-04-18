<?php

namespace App\Http\Requests\Photographer;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePortfolioItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->isPhotographer();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // Max 5MB
            'category' => ['nullable', 'string', 'max:100'],
            'tags' => ['nullable', 'string'], // Expected to be JSON string from FormData
        ];
    }
}
