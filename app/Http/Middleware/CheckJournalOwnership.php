<?php

namespace App\Http\Middleware;

use App\Models\Journal;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckJournalOwnership
{
    /**
     * Handle an incoming request.
     *
     * Middleware ini memastikan:
     * - Super Admin: bypass (bisa akses semua)
     * - Admin Kampus: hanya journal dari university mereka
     * - User: hanya journal milik mereka sendiri
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user is authenticated
        if (!$user) {
            return redirect()->route('login');
        }

        // Super Admin bypass
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Resolve journal route parameter safely whether model or raw ID
        try {
            $routeParam = $request->route('journal');
        } catch (\Throwable) {
            $routeParam = null;
        }

        // If no journal in route, continue (will be handled by controller)
        if (!$routeParam) {
            return $next($request);
        }

        if ($routeParam instanceof Journal) {
            $journal = $routeParam;
        } elseif (is_numeric($routeParam) || is_string($routeParam)) {
            $journal = Journal::find($routeParam);
            if (!$journal) {
                abort(404, 'Journal not found.');
            }
        } elseif (is_object($routeParam) && isset($routeParam->id)) {
            $journal = Journal::find($routeParam->id);
            if (!$journal) {
                abort(404, 'Journal not found.');
            }
        } else {
            abort(403, 'Invalid journal parameter.');
        }

        // Admin Kampus: check if journal belongs to their university
        if ($user->isAdminKampus()) {
            if (!$user->university_id || (int) $journal->university_id !== (int) $user->university_id) {
                abort(403, 'You do not have permission to access this journal.');
            }

            return $next($request);
        }

        // User: check if they own this journal
        if ($user->isUser()) {
            if (!$journal->user_id || (int) $journal->user_id !== (int) $user->id) {
                abort(403, 'You do not have permission to access this journal.');
            }

            return $next($request);
        }

        abort(403, 'Unauthorized access.');
    }
}
