<?php

namespace App\Http\Requests\Client;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'photographer_id' => ['required', 'integer', 'exists:photographers,id'],
            'photographer_service_id' => [
                'required',
                'integer',
                'exists:photographer_services,id',
            ],
            'scheduled_date' => ['required', 'date', 'date_format:Y-m-d H:i', 'after:now'],
            'location' => ['required', 'string', 'max:255'],
            'duration_minutes' => ['nullable', 'integer', 'min:30', 'max:1440'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Cross-field validation after main rules pass.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $service = \App\Models\PhotographerService::find($this->photographer_service_id);

            if ($service && $service->photographer_id != $this->photographer_id) {
                $validator->errors()->add(
                    'photographer_service_id',
                    'The selected service does not belong to this photographer.'
                );
            }
        });
    }
}
