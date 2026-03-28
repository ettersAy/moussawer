<?php

namespace App\Services;

use App\Models\ContactSubmission;

class ContactService
{
    /**
     * SRP: All contact business logic lives here, not in the controller.
     */
    public function store(array $validatedData): ContactSubmission
    {
        return ContactSubmission::create($validatedData);
    }

    /**
     * Retrieve all submissions (for Admin use).
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function all()
    {
        return ContactSubmission::latest()->get();
    }
}
