import { Award, BookOpen, FileCheck, Layers, Sparkles } from 'lucide-react';
import React from 'react';

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
        <section className="relative w-full pt-0 pb-6 font-['Geist',sans-serif] md:pb-8">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                {/* Spotlight #1 Leaderboard (Double-Bezel Architecture) */}
                <div className="group relative lg:col-span-5">
                    {/* Outer Shell: Doppelrand Container */}
                    <div className="h-full rounded-[2rem] bg-gradient-to-br from-primary/15 via-muted/60 to-muted/30 p-2 shadow-sm ring-1 ring-primary/25 transition-all duration-300">
                        {/* Inner Core: Backdrop blur & content canvas */}
                        <div className="flex h-full min-h-[300px] flex-col justify-between rounded-[calc(2rem-0.5rem)] border border-border bg-card/95 p-6 shadow-xs backdrop-blur-xl md:p-8">
                            {/* Header Badges */}
                            <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-primary uppercase ring-1 ring-primary/25">
                                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                                    Top PTMA Nasional
                                </span>
                                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs font-bold tracking-tight text-muted-foreground">
                                    Peringkat #1
                                </span>
                            </div>

                            {/* Center Identity */}
                            <div className="my-6">
                                <div className="mb-3 flex items-center gap-3">
                                    {topUniv?.logo_url ? (
                                        <img
                                            src={topUniv.logo_url}
                                            alt={topUniv.name}
                                            className="h-12 w-12 rounded-xl bg-muted object-contain p-1 ring-1 ring-border"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary ring-1 ring-primary/25">
                                            {topUniv?.short_name || topUniv?.name?.substring(0, 3).toUpperCase() || 'PTM'}
                                        </div>
                                    )}
                                    <div>
                                        {topUniv?.accreditation_status && (
                                            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-primary uppercase ring-1 ring-primary/20">
                                                Akreditasi {topUniv.accreditation_status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="line-clamp-2 text-2xl leading-snug font-bold tracking-tight text-card-foreground md:text-3xl">
                                    {topUniv?.name ?? 'Universitas Muhammadiyah'}
                                </h3>
                                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <span>{topUniv?.city ?? 'Indonesia'}</span>
                                    {topUniv?.province && (
                                        <>
                                            <span className="text-muted-foreground/40">•</span>
                                            <span>{topUniv.province}</span>
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* Footer Metric */}
                            <div className="flex items-baseline justify-between border-t border-border pt-4">
                                <div>
                                    <span className="font-['Geist_Mono',monospace] font-mono text-3xl font-extrabold tracking-tight text-primary tabular-nums md:text-4xl">
                                        {numberFormatter.format(Math.round(stats.top_university_score))}
                                    </span>
                                    <span className="mt-0.5 block text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                        Skor SINTA Overall
                                    </span>
                                </div>
                                <span className="font-mono text-xs text-muted-foreground">Kemdikbudristek</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Macro Power Grid (2x2) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
                    {/* Card 1: Total PTMA Terindeks */}
                    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/30 md:p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Total PTMA Terindeks</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <Layers className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="my-3">
                            <span className="font-['Geist_Mono',monospace] font-mono text-3xl font-extrabold text-card-foreground tabular-nums md:text-4xl">
                                {numberFormatter.format(stats.total_ptma_indexed)}
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">Perguruan Tinggi Muhammadiyah & 'Aisyiyah</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-full rounded-full bg-primary/60" />
                        </div>
                    </div>

                    {/* Card 2: Publikasi Scopus Kolektif */}
                    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/30 md:p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-primary uppercase">Publikasi Scopus Kolektif</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <BookOpen className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="my-3">
                            <span className="font-['Geist_Mono',monospace] font-mono text-3xl font-extrabold text-card-foreground tabular-nums md:text-4xl">
                                {numberFormatter.format(stats.collective_scopus_docs)}
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">Dokumen Internasional Bereputasi</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-full rounded-full bg-primary" />
                        </div>
                    </div>

                    {/* Card 3: Publikasi Garuda Kolektif */}
                    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-secondary/30 md:p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-secondary uppercase">Publikasi Garuda Kolektif</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                                <FileCheck className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="my-3">
                            <span className="font-['Geist_Mono',monospace] font-mono text-3xl font-extrabold text-card-foreground tabular-nums md:text-4xl">
                                {numberFormatter.format(stats.collective_garuda_docs)}
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">Publikasi Terakreditasi Nasional</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-full rounded-full bg-secondary" />
                        </div>
                    </div>

                    {/* Card 4: Paten / HKI Kolektif */}
                    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-accent/40 md:p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Paten & HKI Kolektif</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-foreground">
                                <Award className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="my-3">
                            <span className="font-['Geist_Mono',monospace] font-mono text-3xl font-extrabold text-card-foreground tabular-nums md:text-4xl">
                                {numberFormatter.format(stats.collective_ipr_count)}
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">Hak Kekayaan Intelektual Terdaftar</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-full rounded-full bg-muted-foreground" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
