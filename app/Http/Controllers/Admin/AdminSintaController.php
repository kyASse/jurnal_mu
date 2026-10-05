<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SyncUniversitySintaMetricJob;
use App\Models\University;
use App\Models\UniversitySintaMetric;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSintaController extends Controller
{
    /**
     * Display the admin SINTA sync monitor dashboard.
     */
    public function index(): Response
    {
        $metrics = UniversitySintaMetric::with('university:id,name,short_name,code,ptm_code')
            ->orderByDesc('last_synced_at')
            ->paginate(30);

        $summary = [
            'total_ptma' => University::whereNotNull('ptm_code')->where('is_active', true)->count(),
            'synced_success' => UniversitySintaMetric::where('sync_status', 'success')->count(),
            'synced_failed' => UniversitySintaMetric::where('sync_status', 'failed')->count(),
            'mock_mode' => (bool) config('sinta.mock_mode'),
        ];

        return Inertia::render('Admin/Sinta/Index', [
            'metrics' => $metrics,
            'summary' => $summary,
        ]);
    }

    /**
     * Dispatch SINTA sync jobs for all active PTMA universities.
     */
    public function syncAll(Request $request): RedirectResponse
    {
        $universities = University::whereNotNull('ptm_code')
            ->where('is_active', true)
            ->get();

        foreach ($universities as $university) {
            SyncUniversitySintaMetricJob::dispatch($university);
        }

        return back()->with('success', "Dispatched SINTA sync jobs for {$universities->count()} universities.");
    }
}
