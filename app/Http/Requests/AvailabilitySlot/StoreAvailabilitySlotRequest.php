<?php

namespace App\Http\Requests\AvailabilitySlot;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAvailabilitySlotRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === UserRole::Photographer;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'slots' => 'required|array|min:1',
            'slots.*.date' => [
                'required',
                'date',
                'after_or_equal:today',
            ],
            'slots.*.start_time' => [
                'nullable',
                'date_format:H:i',
                'required_with:slots.*.end_time',
            ],
            'slots.*.end_time' => [
                'nullable',
                'date_format:H:i',
                'required_with:slots.*.start_time',
                'after:slots.*.start_time',
            ],
            'slots.*.status' => [
                'required',
                'string',
                Rule::in(['available', 'unavailable', 'booked']),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slots.required' => 'At least one slot is required.',
            'slots.*.date.after_or_equal' => 'Slot date must be today or a future date.',
            'slots.*.start_time.required_with' => 'Start time is required when end time is provided.',
            'slots.*.end_time.required_with' => 'End time is required when start time is provided.',
            'slots.*.end_time.after' => 'End time must be after start time.',
        ];
    }
}
