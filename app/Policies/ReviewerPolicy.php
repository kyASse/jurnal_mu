<?php

namespace App\Policies;

use App\Models\User;

class ReviewerPolicy
{
    /**
     * Determine whether the user can view any reviewers.
     *
     * Rules:
     * - Super Admin: Can view all reviewers
     * - Admin Kampus: Can view reviewers in their university
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isAdminKampus();
    }

    /**
     * Determine whether the user can view the reviewer profile.
     *
     * Rules:
     * - Super Admin: Can view all reviewer profiles
     * - Admin Kampus: Can view reviewers in their university
     * - Reviewer: Can view own profile
     */
    public function view(User $authUser, User $reviewer): bool
    {
        if ($authUser->id === $reviewer->id) {
            return true;
        }

        if ($authUser->isSuperAdmin()) {
            return true;
        }

        if ($authUser->isAdminKampus()) {
            return $authUser->university_id === $reviewer->university_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create/toggle reviewer status.
     *
     * Rules:
     * - Super Admin: Can toggle any user to reviewer
     * - Admin Kampus: Can toggle users in their university to reviewer
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isAdminKampus();
    }

    /**
     * Determine whether the user can update reviewer profile.
     *
     * Rules:
     * - Super Admin: Can update any reviewer profile
     * - Admin Kampus: Can update reviewers in their university
     * - Reviewer: Can update own profile (expertise, bio)
     */
    public function update(User $authUser, User $reviewer): bool
    {
        if ($authUser->id === $reviewer->id && $authUser->isReviewer()) {
            return true;
        }

        if ($authUser->isSuperAdmin()) {
            return true;
        }

        if ($authUser->isAdminKampus()) {
            return $authUser->university_id === $reviewer->university_id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete/remove reviewer status.
     *
     * Rules:
     * - Super Admin: Can remove any reviewer status
     * - Admin Kampus: Can remove reviewer status from users in their university
     */
    public function delete(User $user, User $reviewer): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminKampus()) {
            return $user->university_id === $reviewer->university_id;
        }

        return false;
    }

    /**
     * Determine whether the user can view reviewer statistics.
     */
    public function viewStats(User $authUser, User $reviewer): bool
    {
        return $this->view($authUser, $reviewer);
    }
}
