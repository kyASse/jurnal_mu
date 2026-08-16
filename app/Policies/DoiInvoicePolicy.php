<?php

namespace App\Policies;

use App\Models\DoiInvoice;
use App\Models\User;

class DoiInvoicePolicy
{
    /**
     * Determine whether the user can view any invoices.
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can view the invoice.
     */
    public function view(User $user, DoiInvoice $invoice): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (! $user->is_active) {
            return false;
        }

        return ($user->university_id !== null && $user->university_id === $invoice->university_id)
            || $user->id === $invoice->user_id;
    }

    /**
     * Determine whether the user can create invoices.
     */
    public function create(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can update the invoice.
     */
    public function update(User $user, DoiInvoice $invoice): bool
    {
        return $user->is_active && $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can delete the invoice.
     */
    public function delete(User $user, DoiInvoice $invoice): bool
    {
        return $user->is_active && $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can upload payment proof for the invoice.
     */
    public function uploadProof(User $user, DoiInvoice $invoice): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (! $user->is_active) {
            return false;
        }

        return ($user->university_id !== null && $user->university_id === $invoice->university_id)
            || $user->id === $invoice->user_id;
    }
}
