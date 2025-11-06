<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\SocialAuthController;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

// Get CSRF Token (wajib dipanggil sebelum login/register dari SPA)
Route::get('/csrf-cookie', [AuthController::class, 'csrf']);

// Authentication
Route::prefix('auth')->group(function () {
    // Email/Password Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Google OAuth
    Route::get('/google', [SocialAuthController::class, 'redirectToGoogle']);
    Route::get('/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
    
    // Microsoft OAuth (optional)
    // Route::get('/microsoft', [SocialAuthController::class, 'redirectToMicrosoft']);
    // Route::get('/microsoft/callback', [SocialAuthController::class, 'handleMicrosoftCallback']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Authentication Required)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    // Auth User Info & Logout
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // TODO: Add other protected routes here
    // Route::apiResource('journals', JournalController::class);
    // Route::apiResource('universities', UniversityController::class);
});