<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\AdminKampus\DoiSubscriptionController as BaseController;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoiSubscriptionController extends BaseController
{
    /**
     * Display the DOI & Similarity Check subscription dashboard for Journal Managers.
     */
    public function index(Request $request): Response
    {
        $response = parent::index($request);
        $props = $response->toResponse($request)->getOriginalContent()['page']['props'];

        return Inertia::render('User/Doi/Dashboard', $props);
    }
}
