import React from 'react';
import { Award, BookOpen, FileCheck, Layers, Sparkles } from 'lucide-react';

export interface PtmaHeroStats {
    total_ptma_indexed: number;
    collective_scopus_docs: number;
    collective_garuda_docs: number;
    collective_ipr_count: number;
    collective_research_count?: number;
    collective_authors_count?: number;
    top_university_overall?: {
        id?: number;
        name: string;
        short_name?: string | null;
        logo_url?: string | null;
        city?: string | null;
        province?: string | null;
        code?: string | null;
        ptm_code?: string | null;
        accreditation_status?: string | null;
    } | null;
    top_university_score: number;
}

interface PtmaHeroBentoProps {
    stats: PtmaHeroStats;
}

export const PtmaHeroBento: React.FC<PtmaHeroBentoProps> = ({ stats }) => {
    const numberFormatter = new Intl.NumberFormat('id-ID');
    const topUniv = stats.top_university_overall;

    return (
        <section className="relative w-full pt-0 pb-6 md:pb-8 font-['Geist',sans-serif]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Spotlight #1 Leaderboard (Double-Bezel Architecture) */}
                <div className="lg:col-span-5 relative group">
                    {/* Outer Shell: Doppelrand Container */}
                    <div className="h-full rounded-[2rem] p-2 bg-gradient-to-br from-emerald-500/20 via-zinc-200/60 to-zinc-100/40 dark:from-emerald-900/30 dark:via-zinc-800/50 dark:to-zinc-900/40 ring-1 ring-emerald-500/30 dark:ring-emerald-500/20 shadow-sm transition-all duration-300">
                        {/* Inner Core: Backdrop blur & content canvas */}
                        <div className="h-full rounded-[calc(2rem-0.5rem)] p-6 md:p-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/60 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between min-h-[300px]">
                            {/* Header Badges */}
                            <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/25">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    Top PTMA Nasional
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-tight text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                                    Peringkat #1
                                </span>
                            </div>

                            {/* Center Identity */}
                            <div className="my-6">
                                <div className="flex items-center gap-3 mb-3">
                                    {topUniv?.logo_url ? (
                                        <img
                                            src={topUniv.logo_url}
                                            alt={topUniv.name}
                                            className="w-12 h-12 rounded-xl object-contain bg-zinc-50 dark:bg-zinc-800 p-1 ring-1 ring-zinc-200 dark:ring-zinc-700"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 ring-1 ring-emerald-500/30 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                                            {topUniv?.short_name || topUniv?.name?.substring(0, 3).toUpperCase() || 'PTM'}
                                        </div>
                                    )}
                                    <div>
                                        {topUniv?.accreditation_status && (
                                            <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-md">
                                                Akreditasi {topUniv.accreditation_status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2">
                                    {topUniv?.name ?? 'Universitas Muhammadiyah'}
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1.5">
                                    <span>{topUniv?.city ?? 'Indonesia'}</span>
                                    {topUniv?.province && (
                                        <>
                                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                            <span>{topUniv.province}</span>
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* Footer Metric */}
                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-baseline justify-between">
                                <div>
                                    <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums font-['Geist_Mono',monospace] text-emerald-600 dark:text-emerald-400 tracking-tight">
                                        {numberFormatter.format(Math.round(stats.top_university_score))}
                                    </span>
                                    <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mt-0.5">
                                        Skor SINTA Overall
                                    </span>
                                </div>
                                <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                                    Kemdikbudristek
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Macro Power Grid (2x2) */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card 1: Total PTMA Terindeks */}
                    <div className="rounded-2xl p-5 md:p-6 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between hover:border-emerald-500/30 transition-colors shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Total PTMA Terindeks
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="my-3">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums font-['Geist_Mono',monospace] text-zinc-900 dark:text-zinc-50">
                                {numberFormatter.format(stats.total_ptma_indexed)}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-1">
                                Perguruan Tinggi Muhammadiyah & 'Aisyiyah
                            </span>
                        </div>
                        <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-500 rounded-full w-full" />
                        </div>
                    </div>

                    {/* Card 2: Publikasi Scopus Kolektif */}
                    <div className="rounded-2xl p-5 md:p-6 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between hover:border-emerald-500/30 transition-colors shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                Publikasi Scopus Kolektif
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                                <BookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="my-3">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums font-['Geist_Mono',monospace] text-zinc-900 dark:text-zinc-50">
                                {numberFormatter.format(stats.collective_scopus_docs)}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-1">
                                Dokumen Internasional Bereputasi
                            </span>
                        </div>
                        <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full w-full" />
                        </div>
                    </div>

                    {/* Card 3: Publikasi Garuda Kolektif */}
                    <div className="rounded-2xl p-5 md:p-6 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between hover:border-emerald-500/30 transition-colors shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                Publikasi Garuda Kolektif
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                                <FileCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="my-3">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums font-['Geist_Mono',monospace] text-zinc-900 dark:text-zinc-50">
                                {numberFormatter.format(stats.collective_garuda_docs)}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-1">
                                Publikasi Terakreditasi Nasional
                            </span>
                        </div>
                        <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-700 dark:bg-zinc-400 rounded-full w-full" />
                        </div>
                    </div>

                    {/* Card 4: Paten / HKI Kolektif */}
                    <div className="rounded-2xl p-5 md:p-6 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between hover:border-emerald-500/30 transition-colors shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                Paten & HKI Kolektif
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                                <Award className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="my-3">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums font-['Geist_Mono',monospace] text-zinc-900 dark:text-zinc-50">
                                {numberFormatter.format(stats.collective_ipr_count)}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-1">
                                Hak Kekayaan Intelektual Terdaftar
                            </span>
                        </div>
                        <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-700 dark:bg-zinc-400 rounded-full w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
