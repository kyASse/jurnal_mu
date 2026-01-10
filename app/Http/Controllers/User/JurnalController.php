<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class JurnalController extends Controller
{
    /**
     * Display the jurnal management page.
     * 
     * This is a placeholder page for the Jurnal feature
     * which is currently under development.
     */
    public function index(): Response
    {
        return Inertia::render('User/Jurnal/Index');
    }
}
