<?php

namespace App\Http\Controllers;

use App\Models\University;
use App\Models\Journal;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PublicUniversityController extends Controller
{
    // Skeleton methods to be implemented next
    public function index(Request $request): Response
    {
        return Inertia::render('Browse/Universities', []);
    }

    public function show(University $university, Request $request): Response
    {
        return Inertia::render('Browse/UniversityProfile', []);
    }
}
