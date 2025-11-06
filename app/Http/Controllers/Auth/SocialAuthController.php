<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    /**
     * Handle the callback from Google.
     */
    public function handleGoogleCallback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Find or create user
            $user = User::where('google_id', $googleUser->id)
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                // Upadte Google ID if not set
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->id,
                        'avatar_url' => $googleUser->avatar,
                    ]);
                }

                // Update last login
                $user->update(['last_login_at' => now()]);
            } else {
                // create new 'user' role
                $userRoleId = \DB::table('roles')->where('name', 'user')->value('id');

                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'avatar_url' => $googleUser->avatar,
                    'email_verified_at' => now(),
                    'role_id' => $userRoleId,
                    'is_active' => true,
                    'password' => null, // No password since using Google OAuth
                ]);
            }

            // Check if user is active
            if (!$user->is_active) {
                return redirect(env('FRONTEND_URL') . '/login?error=account_deactivated')->withErrors(['msg' => 'Your account is inactive. Please contact the administrator.']);
            }

            // Login user
            Auth::login($user);

            //  Redirect to Frontend dashboard with success
            return redirect(env('FRONTEND_URL') . '/auth/callback?success=true');


        } catch (\Exception $e) {
            \Log::error('Google OAuth Error: ' . $e->getMessage());
            
            return redirect(env('FRONTEND_URL') . '/login?error=oauth_failed');
        }
    }
}