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
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Hero Header Section */}
            <div className="bg-hero-gradient pt-14 pb-24 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-accent ring-1 ring-white/20 backdrop-blur-sm mb-4">
                        Benchmark Institusi PTMA
                    </div>
                    <h1
                        className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
                        style={{ fontFamily: '"El Messiri", serif' }}
                    >
                        Peringkat Riset <span className="text-accent">SINTA PTMA</span>
                    </h1>
                    <p className="max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed">
                        Eksplorasi tolok ukur kinerja riset, publikasi internasional Scopus, jurnal nasional Garuda, dan luaran HKI seluruh Perguruan Tinggi Muhammadiyah &amp; 'Aisyiyah se-Indonesia berdasarkan data resmi Kemdikbudristek.
                    </p>
                </div>
            </div>

            {/* Content Overlap & Container Structure */}
            <div className="relative z-20 mx-auto -mt-14 max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
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
        </PublicLayout>
    );
}
