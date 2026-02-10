<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the dashboard page with statistics.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load(['role', 'university']);

        // Initialize stats
        $stats = [
            'total_journals' => 0,
            'total_assessments' => 0,
            'average_score' => 0.0,
        ];

        // Get stats based on user role
        if ($user->role->name === 'Super Admin') {
            // Super Admin sees all data
            $stats['total_journals'] = DB::table('journals')->count();
            $stats['total_assessments'] = DB::table('journal_assessments')->count();

            $avgScore = DB::table('journal_assessments')
                ->whereNotNull('total_score')
                ->avg('total_score');
            $stats['average_score'] = $avgScore ? round($avgScore, 2) : 0.0;

            // Add pending LPPM Admin registrations count
            $stats['pending_lppm_count'] = DB::table('users')
                ->whereNull('role_id')
                ->where('approval_status', 'pending')
                ->count();

        } elseif ($user->role->name === 'Admin Kampus') {
            // Admin Kampus sees only their university data
            $stats['total_journals'] = DB::table('journals')
                ->where('university_id', $user->university_id)
                ->count();

            $stats['total_assessments'] = DB::table('journal_assessments')
                ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
                ->where('journals.university_id', $user->university_id)
                ->count();

            $avgScore = DB::table('journal_assessments')
                ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
                ->where('journals.university_id', $user->university_id)
                ->whereNotNull('journal_assessments.total_score')
                ->avg('journal_assessments.total_score');
            $stats['average_score'] = $avgScore ? round($avgScore, 2) : 0.0;

        } else {
            // Regular user (Pengelola Jurnal) sees only their own journals
            $stats['total_journals'] = DB::table('journals')
                ->where('user_id', $user->id)
                ->count();

            $stats['total_assessments'] = DB::table('journal_assessments')
                ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
                ->where('journals.user_id', $user->id)
                ->count();

            $avgScore = DB::table('journal_assessments')
                ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
                ->where('journals.user_id', $user->id)
                ->whereNotNull('journal_assessments.total_score')
                ->avg('journal_assessments.total_score');
            $stats['average_score'] = $avgScore ? round($avgScore, 2) : 0.0;
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }
}
