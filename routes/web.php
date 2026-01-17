<?php

use App\Http\Controllers\Admin\AccreditationTemplateController;
use App\Http\Controllers\Admin\AdminKampusController;
use App\Http\Controllers\Admin\AssessmentController as AdminAssessmentController;
use App\Http\Controllers\Admin\BorangIndikatorController;
use App\Http\Controllers\Admin\DataMasterController;
use App\Http\Controllers\Admin\EssayQuestionController;
use App\Http\Controllers\Admin\EvaluationCategoryController;
use App\Http\Controllers\Admin\EvaluationIndicatorController;
use App\Http\Controllers\Admin\EvaluationSubCategoryController;
use App\Http\Controllers\Admin\UniversityController;
use App\Http\Controllers\AdminKampus\AssessmentController as AdminKampusAssessmentController;
use App\Http\Controllers\AdminKampus\PembinaanController as AdminKampusPembinaanController;
use App\Http\Controllers\AdminKampus\ReviewerController;
use App\Http\Controllers\AdminKampus\UserController as AdminKampusUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ResourcesController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\User\AssessmentController;
use App\Http\Controllers\User\JournalController as UserJournalController;
use App\Http\Controllers\User\JurnalController;
use App\Http\Controllers\User\PembinaanController as UserPembinaanController;
use App\Http\Controllers\User\ProfilController;
use App\Models\Role;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

//  Laman Page
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

/*
|--------------------------------------------------------------------------
| Public Journals Routes
|--------------------------------------------------------------------------
*/

// Public access to view journals
Route::get('/journals', [\App\Http\Controllers\PublicJournalController::class, 'index'])
    ->name('journals.index');
Route::get('/journals/{journal}', [\App\Http\Controllers\PublicJournalController::class, 'show'])
    ->name('journals.show');

/*
|--------------------------------------------------------------------------
| Guest Routes (Redirect jika sudah login)
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    // Login
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    // Register
    Route::get('/register', [RegisteredUserController::class, 'create'])
        ->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);

    // Google OAuth
    Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle'])
        ->name('auth.google');
    Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback'])
        ->name('auth.google.callback');
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

// Protected routes (harus login)
Route::middleware(['auth'])->group(function () {
    // Logout
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Super Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::SUPER_ADMIN])->prefix('admin')->name('admin.')->group(function () {

        // Data Master (Placeholder)
        Route::get('data-master', [DataMasterController::class, 'index'])
            ->name('data-master.index');

        // Borang Indikator (Placeholder)
        Route::get('borang-indikator', [BorangIndikatorController::class, 'index'])
            ->name('borang-indikator.index');

        /*
        |--------------------------------------------------------------------------
        | v1.1 Hierarchical Assessment System (NEW)
        |--------------------------------------------------------------------------
        */

        // Accreditation Templates Management
        Route::resource('templates', AccreditationTemplateController::class);
        Route::post('templates/{template}/clone', [AccreditationTemplateController::class, 'clone'])
            ->name('templates.clone');
        Route::post('templates/{template}/toggle', [AccreditationTemplateController::class, 'toggleActive'])
            ->name('templates.toggle');
        Route::get('templates/{template}/tree', [AccreditationTemplateController::class, 'tree'])
            ->name('templates.tree');

        // Evaluation Categories Management (Level 1 - Unsur Evaluasi)
        Route::resource('categories', EvaluationCategoryController::class);
        Route::post('categories/reorder', [EvaluationCategoryController::class, 'reorder'])
            ->name('categories.reorder');

        // Evaluation Sub-Categories Management (Level 2 - Sub-Unsur)
        Route::resource('sub-categories', EvaluationSubCategoryController::class);
        Route::post('sub-categories/{subCategory}/move', [EvaluationSubCategoryController::class, 'move'])
            ->name('sub-categories.move');
        Route::post('sub-categories/reorder', [EvaluationSubCategoryController::class, 'reorder'])
            ->name('sub-categories.reorder');

        // Essay Questions Management (linked to Categories)
        Route::resource('essays', EssayQuestionController::class);
        Route::post('essays/{essay}/toggle', [EssayQuestionController::class, 'toggleActive'])
            ->name('essays.toggle');
        Route::post('essays/reorder', [EssayQuestionController::class, 'reorder'])
            ->name('essays.reorder');

        // Evaluation Indicators Management (v1.1 hierarchical + v1.0 legacy)
        Route::resource('indicators', EvaluationIndicatorController::class);
        Route::post('indicators/{indicator}/migrate', [EvaluationIndicatorController::class, 'migrate'])
            ->name('indicators.migrate');
        Route::post('indicators/reorder', [EvaluationIndicatorController::class, 'reorder'])
            ->name('indicators.reorder');

        /*
        |--------------------------------------------------------------------------
        | v1.0 Legacy Routes
        |--------------------------------------------------------------------------
        */

        // Universities Management
        Route::resource('universities', UniversityController::class);
        Route::post('universities/{university}/toggle-active', [UniversityController::class, 'toggleActive'])
            ->name('universities.toggle-active');

        // Admin Kampus Management
        Route::resource('admin-kampus', AdminKampusController::class);
        Route::post('admin-kampus/{admin_kampus}/toggle-active', [AdminKampusController::class, 'toggleActive'])
            ->name('admin-kampus.toggle-active');

        // View all journals (read-only for monitoring)
        Route::get('journals', [\App\Http\Controllers\Admin\JournalController::class, 'index'])
            ->name('journals.index');
        Route::get('journals/{journal}', [\App\Http\Controllers\Admin\JournalController::class, 'show'])
            ->name('journals.show');

        // View all assessments (read-only for monitoring)
        Route::get('assessments', [AdminAssessmentController::class, 'index'])
            ->name('assessments.index');

    });

    /*
    |--------------------------------------------------------------------------
    | Admin Kampus Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::ADMIN_KAMPUS])->prefix('admin-kampus')->name('admin-kampus.')->group(function () {

        // Users (Pengelola Jurnal) Management
        Route::resource('users', AdminKampusUserController::class);
        Route::post('users/{user}/toggle-active', [AdminKampusUserController::class, 'toggleActive'])
            ->name('users.toggle-active');

        // View journals from their university
        Route::get('journals', [\App\Http\Controllers\AdminKampus\JournalController::class, 'index'])
            ->name('journals.index');
        Route::get('journals/{journal}', [\App\Http\Controllers\AdminKampus\JournalController::class, 'show'])
            ->name('journals.show');

        // Reviewer Management (Placeholder)
        Route::get('reviewer', [ReviewerController::class, 'index'])
            ->name('reviewer.index');

        // Pembinaan (Placeholder)
        Route::get('pembinaan', [AdminKampusPembinaanController::class, 'index'])
            ->name('pembinaan.index');

        // Review assessments from their university
        Route::get('assessments', [AdminKampusAssessmentController::class, 'index'])
            ->name('assessments.index');

    });

    /*
    |--------------------------------------------------------------------------
    | User (Pengelola Jurnal) Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::USER])->prefix('user')->name('user.')->group(function () {

        // Profil (Placeholder)
        Route::get('profil', [ProfilController::class, 'index'])
            ->name('profil.index');

        // Jurnal (Placeholder)
        Route::get('jurnal', [JurnalController::class, 'index'])
            ->name('jurnal.index');

        // Journals Management (existing feature - keep for backward compatibility)
        Route::resource('journals', UserJournalController::class);

        // Assessments Management
        Route::prefix('assessments')->name('assessments.')->group(function () {
            Route::get('/', [AssessmentController::class, 'index'])
                ->name('index');
            Route::get('create', [AssessmentController::class, 'create'])
                ->name('create');
            Route::post('/', [AssessmentController::class, 'store'])
                ->name('store');
            Route::get('{assessment}', [AssessmentController::class, 'show'])
                ->name('show');
            Route::get('{assessment}/edit', [AssessmentController::class, 'edit'])
                ->name('edit');
            Route::put('{assessment}', [AssessmentController::class, 'update'])
                ->name('update');
            Route::delete('{assessment}', [AssessmentController::class, 'destroy'])
                ->name('destroy');
            Route::post('{assessment}/submit', [AssessmentController::class, 'submit'])
                ->name('submit');
            Route::get('attachments/{attachment}', [AssessmentController::class, 'downloadAttachment'])
                ->name('attachments.download');
        });

        // Pembinaan (Placeholder)
        Route::get('pembinaan', [UserPembinaanController::class, 'index'])
            ->name('pembinaan.index');
    });

    /*
    |--------------------------------------------------------------------------
    | Shared Routes (All Roles)
    |--------------------------------------------------------------------------
    */

    // Support (Placeholder)
    Route::get('/support', [SupportController::class, 'index'])
        ->name('support');

    // Resources (Placeholder)
    Route::get('/resources', [ResourcesController::class, 'index'])
        ->name('resources');

    // Profile Management
    // Route::prefix('profile')->name('profile.')->group(function () {
    //     Route::get('/', [ProfileController::class, 'edit'])->name('edit');
    //     Route::patch('/', [ProfileController::class, 'update'])->name('update');
    //     Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    // });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
