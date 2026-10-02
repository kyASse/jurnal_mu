<?php

namespace App\Http\Controllers\Sinta;

use App\Http\Controllers\Controller;
use App\Services\Sinta\PtmaRankingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PtmaRankingController extends Controller
{
    public function __construct(
        protected PtmaRankingService $rankingService
    ) {}

    /**
     * Display the public PTMA ranking leaderboard.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['sort', 'dir', 'q', 'accreditation']);
        $perPage = (int) $request->input('per_page', 25);

        $rankings = $this->rankingService->getRankings($filters, $perPage);
        $stats = $this->rankingService->getSummaryStats();

        return Inertia::render('Public/PtmaRanking/Index', [
            'rankings' => $rankings,
            'stats' => $stats,
            'filters' => $filters,
        ]);
    }
}
