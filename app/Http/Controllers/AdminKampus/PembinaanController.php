<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PembinaanController extends Controller
{
    /**
     * Display the Pembinaan page.
     *
     * This is a placeholder page for the Pembinaan feature
     * which is currently under development.
     */
    public function index(): Response
    {
        return Inertia::render('AdminKampus/Pembinaan/Index');
    }
}
