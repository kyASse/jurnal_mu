<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ProfilController extends Controller
{
    /**
     * Display the user profile page.
     * 
     * This is a placeholder page for the Profil feature
     * which is currently under development.
     */
    public function index(): Response
    {
        return Inertia::render('User/Profil/Index');
    }
}
