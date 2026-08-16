<?php

namespace App\Policies;

use App\Models\DoiPaymentProof;
use App\Models\User;

class DoiPaymentProofPolicy
{
    /**
     * Determine whether the user can view any payment proofs.
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can view the payment proof.
     */
    public function view(User $user, DoiPaymentProof $proof): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (! $user->is_active) {
            return false;
        }

        if ($user->id === $proof->user_id) {
            return true;
        }

        $invoice = $proof->invoice;
        if ($invoice && $user->university_id !== null && $user->university_id === $invoice->university_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create payment proofs.
     */
    public function create(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can verify the payment proof.
     * Verification is strictly restricted to Super Admin.
     */
    public function verify(User $user, ?DoiPaymentProof $proof = null): bool
    {
        return $user->is_active && $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can delete the payment proof.
     */
    public function delete(User $user, DoiPaymentProof $proof): bool
    {
        return $user->is_active && $user->isSuperAdmin();
    }
}
