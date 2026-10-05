<?php

namespace App\Providers;

use App\Events\Doi\PaymentProofRejected;
use App\Events\Doi\PaymentProofUploaded;
use App\Events\Doi\SubscriptionActivated;
use App\Listeners\Doi\SendPaymentProofRejectedNotification;
use App\Listeners\Doi\SendPaymentProofUploadedNotification;
use App\Listeners\Doi\SendSubscriptionActivatedNotification;
use App\Models\AccreditationTemplate;
use App\Models\EssayQuestion;
use App\Models\EvaluationCategory;
use App\Models\EvaluationIndicator;
use App\Models\EvaluationSubCategory;
use App\Models\Journal;
use App\Models\JournalAssessment;
use App\Models\University;
use App\Models\User;
use App\Policies\AccreditationTemplatePolicy;
use App\Policies\EssayQuestionPolicy;
use App\Policies\EvaluationCategoryPolicy;
use App\Policies\EvaluationIndicatorPolicy;
use App\Policies\EvaluationSubCategoryPolicy;
use App\Policies\JournalAssessmentPolicy;
use App\Policies\JournalPolicy;
use App\Policies\UniversityPolicy;
use App\Policies\UserPolicy;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Passport\Passport;

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
        Passport::tokensExpireIn(now()->addHours(1));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));
        Passport::authorizationView('vendor.passport.authorize');

        Route::matched(function (RouteMatched $event) {
            if ($event->route->getName() === 'passport.authorizations.authorize') {
                $event->route->middleware('auth');
            }
        });

        Vite::useHotFile(base_path('public/hot'));

        // Enforce strong password complexity defaults across registration & resets
        Password::defaults(function () {
            $rule = Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers();

            return app()->isProduction()
                ? $rule->symbols()->uncompromised()
                : $rule;
        });

        // Register policies
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Journal::class, JournalPolicy::class);
        Gate::policy(JournalAssessment::class, JournalAssessmentPolicy::class);
        Gate::policy(University::class, UniversityPolicy::class);

        // NEW v1.1: Hierarchical Borang Policies (Super Admin only)
        Gate::policy(AccreditationTemplate::class, AccreditationTemplatePolicy::class);
        Gate::policy(EvaluationCategory::class, EvaluationCategoryPolicy::class);
        Gate::policy(EvaluationSubCategory::class, EvaluationSubCategoryPolicy::class);
        Gate::policy(EvaluationIndicator::class, EvaluationIndicatorPolicy::class);
        Gate::policy(EssayQuestion::class, EssayQuestionPolicy::class);

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

        // DOI Event Listeners
        Event::listen(
            PaymentProofUploaded::class,
            SendPaymentProofUploadedNotification::class
        );
        Event::listen(
            SubscriptionActivated::class,
            SendSubscriptionActivatedNotification::class
        );
        Event::listen(
            PaymentProofRejected::class,
            SendPaymentProofRejectedNotification::class
        );
    }
}
