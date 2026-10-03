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
                    <div className="h-full rounded-[2rem] p-2 bg-gradient-to-br from-primary/15 via-muted/60 to-muted/30 ring-1 ring-primary/25 shadow-sm transition-all duration-300">
                        {/* Inner Core: Backdrop blur & content canvas */}
                        <div className="h-full rounded-[calc(2rem-0.5rem)] p-6 md:p-8 bg-card/95 backdrop-blur-xl border border-border shadow-xs flex flex-col justify-between min-h-[300px]">
                            {/* Header Badges */}
                            <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-primary/10 text-primary ring-1 ring-primary/25">
                                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                                    Top PTMA Nasional
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-tight text-muted-foreground bg-muted">
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
                                            className="w-12 h-12 rounded-xl object-contain bg-muted p-1 ring-1 ring-border"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 ring-1 ring-primary/25 flex items-center justify-center font-bold text-primary text-sm">
                                            {topUniv?.short_name || topUniv?.name?.substring(0, 3).toUpperCase() || 'PTM'}
                                        </div>
                                    )}
                                    <div>
                                        {topUniv?.accreditation_status && (
                                            <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md ring-1 ring-primary/20">
                                                Akreditasi {topUniv.accreditation_status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-card-foreground leading-snug line-clamp-2">
                                    {topUniv?.name ?? 'Universitas Muhammadiyah'}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
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
                            <div className="pt-4 border-t border-border flex items-baseline justify-between">
                                <div>
                                    <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums font-['Geist_Mono',monospace] text-primary tracking-tight">
                                        {numberFormatter.format(Math.round(stats.top_university_score))}
                                    </span>
                                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mt-0.5">
                                        Skor SINTA Overall
                                    </span>
                                </div>
                                <span className="text-xs font-mono text-muted-foreground">
                                    Kemdikbudristek
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Macro Power Grid (2x2) */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card 1: Total PTMA Terindeks */}
                    <div className="rounded-2xl p-5 md:p-6 bg-card border border-border flex flex-col justify-between hover:border-primary/30 transition-colors shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total PTMA Terindeks
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="my-3">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums font-['Geist_Mono',monospace] text-card-foreground">
                                {numberFormatter.format(stats.total_ptma_indexed)}
                            </span>
                            <span className="text-xs text-muted-foreground block mt-1">
                                Perguruan Tinggi Muhammadiyah & 'Aisyiyah
                            </span>
                        </div>
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary/60 rounded-full w-full" />
                        </div>
                    </div>

                    {/* Card 2: Publikasi Scopus Kolektif */}
                    <div className="rounded-2xl p-5 md:p-6 bg-card border border-border flex flex-col justify-between hover:border-primary/30 transition-colors shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                Publikasi Scopus Kolektif
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <BookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="my-3">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums font-['Geist_Mono',monospace] text-card-foreground">
                                {numberFormatter.format(stats.collective_scopus_docs)}
                            </span>
                            <span className="text-xs text-muted-foreground block mt-1">
                                Dokumen Internasional Bereputasi
                            </span>
                        </div>
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full w-full" />
                        </div>
                    </div>

                    {/* Card 3: Publikasi Garuda Kolektif */}
                    <div className="rounded-2xl p-5 md:p-6 bg-card border border-border flex flex-col justify-between hover:border-secondary/30 transition-colors shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                                Publikasi Garuda Kolektif
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                <FileCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="my-3">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums font-['Geist_Mono',monospace] text-card-foreground">
                                {numberFormatter.format(stats.collective_garuda_docs)}
                            </span>
                            <span className="text-xs text-muted-foreground block mt-1">
                                Publikasi Terakreditasi Nasional
                            </span>
                        </div>
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-secondary rounded-full w-full" />
                        </div>
                    </div>

                    {/* Card 4: Paten / HKI Kolektif */}
                    <div className="rounded-2xl p-5 md:p-6 bg-card border border-border flex flex-col justify-between hover:border-accent/40 transition-colors shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Paten & HKI Kolektif
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-foreground">
                                <Award className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="my-3">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums font-['Geist_Mono',monospace] text-card-foreground">
                                {numberFormatter.format(stats.collective_ipr_count)}
                            </span>
                            <span className="text-xs text-muted-foreground block mt-1">
                                Hak Kekayaan Intelektual Terdaftar
                            </span>
                        </div>
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-muted-foreground rounded-full w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
