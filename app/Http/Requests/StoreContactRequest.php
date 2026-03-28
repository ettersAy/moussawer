<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    /**
     * Anyone can submit the contact form (no auth required).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules — input is sanitized here before reaching the controller.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'email'   => ['required', 'email:rfc', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }

    /**
     * Custom error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required'   => 'An email address is required.',
            'email.email'      => 'Please provide a valid email address.',
            'message.required' => 'A message is required.',
            'message.min'      => 'Your message must be at least 10 characters.',
            'message.max'      => 'Your message may not exceed 2000 characters.',
        ];
    }
}
