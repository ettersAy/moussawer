<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\ContactSubmission;
use App\Models\User;

class ContactSubmissionPolicy
{
    /**
     * Only admins can view the list of all contact submissions.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }

    /**
     * Only admins can view a single contact submission.
     */
    public function view(User $user, ContactSubmission $submission): bool
    {
        return $user->role === UserRole::Admin;
    }

    /**
     * Anyone can create a contact submission (no auth required).
     * This is handled at the controller/request level, not here.
     */
    public function create(?User $user): bool
    {
        return true;
    }

    /**
     * Only admins can delete submissions.
     */
    public function delete(User $user, ContactSubmission $submission): bool
    {
        return $user->role === UserRole::Admin;
    }
}
