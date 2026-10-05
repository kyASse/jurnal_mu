import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FilterControlBar } from './components/FilterControlBar';
import { LeaderboardTable } from './components/LeaderboardTable';
import { PtmaDetailDrawer } from './components/PtmaDetailDrawer';
import { PtmaHeroBento, PtmaHeroStats } from './components/PtmaHeroBento';
import { PtmaStatisticsChart } from './components/PtmaStatisticsChart';
import { VariableSegmentedNav } from './components/VariableSegmentedNav';
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

export default function PtmaRankingIndex({ rankings, stats, filters = {} }: PtmaRankingIndexProps) {
    const [selectedMetric, setSelectedMetric] = useState<PtmaMetric | null>(null);
    const safeFilters = filters && !Array.isArray(filters) && typeof filters === 'object' ? filters : {};
    const activeSort = typeof safeFilters.sort === 'string' && safeFilters.sort.trim() !== '' ? safeFilters.sort : 'sinta_overall';

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
                    m.ptm_code === campus,
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
            <div className="bg-hero-gradient pt-14 pb-12 text-white sm:pb-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wider text-accent uppercase ring-1 ring-white/20 backdrop-blur-sm">
                        Benchmark Institusi PTMA
                    </div>
                    <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: '"El Messiri", serif' }}>
                        Peringkat Riset <span className="text-accent">SINTA PTMA</span>
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                        Eksplorasi tolok ukur kinerja riset, publikasi internasional Scopus, jurnal nasional Garuda, dan luaran HKI seluruh Perguruan
                        Tinggi Muhammadiyah &amp; 'Aisyiyah se-Indonesia berdasarkan data resmi Kemdikbudristek.
                    </p>
                </div>
            </div>

            {/* Content Container Structure */}
            <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
                {/* Bento Hero */}
                <PtmaHeroBento stats={stats} />

                {/* Variable Segmented Nav */}
                <VariableSegmentedNav currentSort={activeSort} filters={safeFilters} />

                {/* Statistics Chart (Rendered on primary page 1) */}
                {(rankings?.current_page ?? 1) === 1 && <PtmaStatisticsChart metrics={rankings?.data ?? []} currentSort={activeSort} />}

                {/* Search & Filter Bar */}
                <FilterControlBar filters={safeFilters} />

                {/* Leaderboard Table */}
                <LeaderboardTable metrics={rankings?.data ?? []} pagination={rankings} currentSort={activeSort} onSelectDetail={setSelectedMetric} />

                {/* Drawer Detail */}
                <PtmaDetailDrawer metric={selectedMetric} onClose={() => setSelectedMetric(null)} />
            </div>
        </PublicLayout>
    );
}
