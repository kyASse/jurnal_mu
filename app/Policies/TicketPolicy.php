<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * View any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * View the model.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        if ($user->isSuperAdmin()) return true;
        return $user->id === $ticket->user_id;
    }

    /**
     * Create models.
     */
    public function create(User $user): bool
    {
        return true; // Any authenticated user can create a ticket
    }

    /**
     * Update the model.
     */
    public function update(User $user, Ticket $ticket): bool
    {
        // Only super admin can change status. A user can't update.
        return $user->isSuperAdmin();
    }

    /**
     * Delete the model.
     */
    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Provide a reply to the ticket
     */
    public function reply(User $user, Ticket $ticket): bool
    {
        if ($user->isSuperAdmin()) return true;
        return $user->id === $ticket->user_id;
    }
}
