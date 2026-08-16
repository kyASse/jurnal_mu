<?php

namespace App\Policies;

use App\Models\DoiSubscription;
use App\Models\User;

class DoiSubscriptionPolicy
{
    /**
     * Determine whether the user can view any subscriptions.
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can view the subscription.
     */
    public function view(User $user, DoiSubscription $subscription): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (! $user->is_active) {
            return false;
        }

        return $user->university_id !== null && $user->university_id === $subscription->university_id;
    }

    /**
     * Determine whether the user can create subscriptions.
     */
    public function create(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can update the subscription.
     */
    public function update(User $user, DoiSubscription $subscription): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (! $user->is_active) {
            return false;
        }

        return $user->university_id !== null && $user->university_id === $subscription->university_id;
    }

    /**
     * Determine whether the user can renew the subscription.
     */
    public function renew(User $user, DoiSubscription $subscription): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (! $user->is_active) {
            return false;
        }

        return $user->university_id !== null && $user->university_id === $subscription->university_id;
    }

    /**
     * Determine whether the user can delete the subscription.
     */
    public function delete(User $user, DoiSubscription $subscription): bool
    {
        return $user->is_active && $user->isSuperAdmin();
    }
}
