import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { PtmaHeroBento, PtmaHeroStats } from './components/PtmaHeroBento';
import { VariableSegmentedNav } from './components/VariableSegmentedNav';
import { FilterControlBar } from './components/FilterControlBar';
import { LeaderboardTable } from './components/LeaderboardTable';
import { PtmaDetailDrawer } from './components/PtmaDetailDrawer';
import { PaginatedMetrics, PtmaMetric } from './types';

export interface PtmaRankingIndexProps {
    rankings: PaginatedMetrics;
    stats: PtmaHeroStats;
    filters?: {
        sort?: string;
        dir?: string;
        q?: string;
        accreditation?: string;
        [key: string]: any;
    };
}

export default function PtmaRankingIndex({
    rankings,
    stats,
    filters = {},
}: PtmaRankingIndexProps) {
    const [selectedMetric, setSelectedMetric] = useState<PtmaMetric | null>(null);
    const safeFilters = filters && !Array.isArray(filters) && typeof filters === 'object' ? filters : {};
    const activeSort =
        typeof safeFilters.sort === 'string' && safeFilters.sort.trim() !== ''
            ? safeFilters.sort
            : 'sinta_overall';

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const urlParams = new URLSearchParams(window.location.search);
        const campus = urlParams.get('campus');
        if (campus && rankings?.data) {
            const match = rankings.data.find(
                (m) =>
                    m.university?.code?.toLowerCase() === campus.toLowerCase() ||
                    String(m.university?.id) === campus ||
                    m.university?.ptm_code === campus ||
                    m.ptm_code === campus
            );
            if (match) {
                setSelectedMetric(match);
            }
        }
    }, [rankings]);

    return (
        <PublicLayout>
            <Head>
                <title>Papan Peringkat SINTA PTMA — JurnalMu</title>
                <meta
                    name="description"
                    content="Papan peringkat interaktif metrik SINTA untuk seluruh kampus Perguruan Tinggi Muhammadiyah dan 'Aisyiyah (PTMA) di Indonesia."
                />
            </Head>

            <div className="w-full bg-white dark:bg-zinc-950 font-['Geist',sans-serif] text-zinc-900 dark:text-zinc-100 min-h-[calc(100vh-4rem)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* Page Header */}
                    <div className="mb-6 md:mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20 mb-3">
                            Benchmark Institusi PTMA
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Peringkat Riset SINTA PTMA
                        </h1>
                        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mt-2.5 max-w-3xl leading-relaxed">
                            Eksplorasi tolok ukur kinerja riset, publikasi internasional Scopus, jurnal nasional Garuda, dan luaran HKI seluruh Perguruan Tinggi Muhammadiyah & 'Aisyiyah se-Indonesia berdasarkan data resmi Kemdikbudristek.
                        </p>
                    </div>

                    {/* Bento Hero */}
                    <PtmaHeroBento stats={stats} />

                    {/* Variable Segmented Nav */}
                    <VariableSegmentedNav currentSort={activeSort} filters={safeFilters} />

                    {/* Search & Filter Bar */}
                    <FilterControlBar filters={safeFilters} />

                    {/* Leaderboard Table */}
                    <LeaderboardTable
                        metrics={rankings?.data ?? []}
                        pagination={rankings}
                        currentSort={activeSort}
                        onSelectDetail={setSelectedMetric}
                    />

                    {/* Drawer Detail */}
                    <PtmaDetailDrawer
                        metric={selectedMetric}
                        onClose={() => setSelectedMetric(null)}
                    />
                </div>
            </div>
        </PublicLayout>
    );
}
