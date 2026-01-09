<?php

use App\Http\Controllers\Admin\AdminKampusController;
use App\Http\Controllers\Admin\UniversityController;
use App\Http\Controllers\AdminKampus\UserController as AdminKampusUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\User\AssessmentController;
use App\Http\Controllers\User\JournalController;
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
        // Route::get('journals/{journal}', [\App\Http\Controllers\Admin\JournalController::class, 'show'])
        //     ->name('journals.show'); // TODO: Implement detail view in next iteration

        // View all assessments (read-only for monitoring) - TODO: Create AssessmentController
        // Route::get('assessments', [AssessmentController::class, 'adminIndex'])
        //     ->name('assessments.index');
        // Route::get('assessments/{assessment}', [AssessmentController::class, 'adminShow'])
        //     ->name('assessments.show');

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
        // Route::get('journals/{journal}', [\App\Http\Controllers\AdminKampus\JournalController::class, 'show'])
        //     ->name('journals.show'); // TODO: Implement detail view in next iteration

        // Review assessments from their university - TODO: Create AssessmentController methods
        // Route::get('assessments', [AssessmentController::class, 'adminKampusIndex'])
        //     ->name('assessments.index');
        // Route::get('assessments/{assessment}', [AssessmentController::class, 'adminKampusShow'])
        //     ->name('assessments.show');
        // Route::post('assessments/{assessment}/review', [AssessmentController::class, 'review'])
        //     ->name('assessments.review');
    });

    /*
    |--------------------------------------------------------------------------
    | User (Pengelola Jurnal) Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::USER])->prefix('user')->name('user.')->group(function () {

        // Journals Management
        Route::resource('journals', JournalController::class);

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
    });

    /*
    |--------------------------------------------------------------------------
    | Shared Routes (All Roles) - TODO: Create ProfileController
    |--------------------------------------------------------------------------
    */

    // Profile Management
    // Route::prefix('profile')->name('profile.')->group(function () {
    //     Route::get('/', [ProfileController::class, 'edit'])->name('edit');
    //     Route::patch('/', [ProfileController::class, 'update'])->name('update');
    //     Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    // });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
