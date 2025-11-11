<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any users.
     * 
     * Rules:
     * - Super Andmin: Can view all users.
     * - Admin: Can view all users except Super Admins.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isAdminKampus();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $authUser, User $targetUser): bool
    {
        if ($authUser->id === $targetUser->id) {
            return true;
        }

        if ($authUser->isSuperAdmin()) {
            return true;
        }

        if ($authUser->isAdminKampus()) {
            return $authUser->university_id === $targetUser->university_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create users.
     * 
     * Rules:
     * - Super Admin: Can create Admin Kampus and User
     * - Admin Kampus: Can create User only within their university.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isAdminKampus();
    }

    /**
     * Determine whether the user can assign when creating.
     */
    public function canAssignRole(User $user, string $roleName): bool
    {
        // Suoer Admin can assign any role except Super Admin
        if ($user->isSuperAdmin()) {
            return in_array($roleName, ['Admin Kampus', 'User']);
        }

        // Admin kampus can only assign User role
        if ($user->isAdminKampus()) {
            return $roleName === 'User';
        }

        return false;
    }

    /**
     * Determine what unveristy the user can assign.
     */
    public function canAssignUniversity(User $user, int $universityId): bool
    {
        // Super Admin can assign any university
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can only assign their own university
        if ($user->isAdminKampus()) {
            return $user->university_id === $universityId;
        }

        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $authUser, User $targetUser): bool
    {
        // User can update their own profile (limited fields)
        if ($authUser->id === $targetUser->id) {
            return true;
        }

        // Super Admin can update any user
        if ($authUser->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can update users within their university except Super Admins
        if ($authUser->isAdminKampus()) {
            return $authUser->university_id === $targetUser->university_id
                && !$targetUser->isSuperAdmin();
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $authUser, User $targetUser): bool
    {
        // User cannot delete their own profile
        if ($authUser->id === $targetUser->id) {
            return false;
        }

        // Super Admin can delete Admin Kampus and User
        if ($authUser->isSuperAdmin()) {
            return !$targetUser->isSuperAdmin();
        }

        // Admin Kampus can delete users within their university except Super Admins
        if ($authUser->isAdminKampus()) {
            return $authUser->university_id === $targetUser->university_id
                && $targetUser->isUser();
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $authUser, User $targetUser): bool
    {
        // Super Admin can restore all users
        if ($authUser->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can restore users within their university except Super Admins
        if ($authUser->isAdminKampus()) {
            return $authUser->university_id === $targetUser->university_id
            && $targetUser->isUser();
        }

        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $authUser, User $targetUser): bool
    {
        // Only Super Admin can force delete 
        return $authUser->isSuperAdmin() && !$targetUser->isSuperAdmin();
    }

    /**
     * Determine if the user can toggle active status
     */
    public function toggleActiveStatus(User $authUser, User $targetUser): bool
    {
        // User cannot toggle their own status
        if ($authUser->id === $targetUser->id) {
            return false;
        }

        // Super Admin can toggle any user except Super Admins
        if ($authUser->isSuperAdmin()) {
            return !$targetUser->isSuperAdmin();
        }

        // Admin Kampus can toggle users within their university except Super Admins
        if ($authUser->isAdminKampus()) {
            return $authUser->university_id === $targetUser->university_id
                && $targetUser->isUser();
        }

        return false;
    }
}
