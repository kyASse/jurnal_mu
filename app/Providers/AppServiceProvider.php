<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies
        Gate::policy(\App\Models\User::class, \App\Policies\UserPolicy::class);
        Gate::policy(\App\Models\Journal::class, \App\Policies\JournalPolicy::class);
        Gate::policy(\App\Models\JournalAssessment::class, \App\Policies\JournalAssessmentPolicy::class);
        Gate::policy(\App\Models\University::class, \App\Policies\UniversityPolicy::class);

        // Define additional gates if needed
        Gate::define('manage-universities', function ($user) {
            return $user->isSuperAdmin();
        });

        Gate::define('manage-admin-kampus', function ($user) {
            return $user->isSuperAdmin();
        });

        Gate::define('manage-users', function ($user) {
            return $user->isSuperAdmin() || $user->isAdminKampus();
        });

        Gate::define('view-all-journals', function ($user) {
            return $user->isSuperAdmin();
        });

        Gate::define('view-university-journals', function ($user) {
            return $user->isAdminKampus();
        });

        // Custom gates for role and university assignment
        Gate::define('assign-role', function ($user, $roleName) {
            if ($user->isSuperAdmin()) {
                return in_array($roleName, ['Admin Kampus', 'User']);
            }
            if ($user->isAdminKampus()) {
                return $roleName === 'User';
            }

            return false;
        });

        Gate::define('assign-university', function ($user, $universityId) {
            if ($user->isSuperAdmin()) {
                return true;
            }
            if ($user->isAdminKampus()) {
                return $user->university_id === $universityId;
            }

            return false;
        });
    }
}
