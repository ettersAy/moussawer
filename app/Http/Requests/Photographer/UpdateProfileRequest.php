<?php

namespace App\Http\Requests\Photographer;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'bio' => 'nullable|string|max:1000',
            'portfolio_url' => 'nullable|url',
            'hourly_rate' => 'nullable|numeric|min:0.01',
            'availability_status' => 'nullable|in:available,unavailable,booked',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'hourly_rate' => 'hourly rate',
            'availability_status' => 'availability status',
            'portfolio_url' => 'portfolio URL',
        ];
    }
}
