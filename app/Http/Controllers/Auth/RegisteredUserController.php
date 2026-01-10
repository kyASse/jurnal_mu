<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request (API).
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'university_id' => 'nullable|exists:universities,id',
            'position' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        // Get role_id for 'user' role
        $userRoleId = \DB::table('roles')->where('name', 'user')->value('id');

        // Fallback: if role not found, throw error
        if (! $userRoleId) {
            return response()->json([
                'message' => 'Role configuration error. Please run database seeder first.',
                'error' => 'User role not found in database',
            ], 500);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $userRoleId, // Assign 'user' role by default
            'university_id' => $request->university_id,
            'position' => $request->position,
            'phone' => $request->phone,
            'is_active' => true,
            'email_verified_at' => now(), // Auto verify for now
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Redirect to dashboard after successful registration
        return redirect()->route('dashboard')->with('success', 'Registration successful! Welcome to Jurnal MU.');
    }
}
