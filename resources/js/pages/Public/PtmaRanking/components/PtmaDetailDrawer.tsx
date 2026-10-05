import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import {
    Award,
    BookOpen,
    Check,
    Compass,
    Copy,
    FileCheck,
    FileText,
    FlaskConical,
    Globe,
    GraduationCap,
    Handshake,
    Library,
    Quote,
    ShieldCheck,
    X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { PtmaMetric } from '../types';

export interface PtmaDetailDrawerProps {
    metric: PtmaMetric | null;
    onClose: () => void;
}

export const PtmaDetailDrawer: React.FC<PtmaDetailDrawerProps> = ({ metric, onClose }) => {
    const [copied, setCopied] = useState(false);

    // ESC key listener & body scroll lock
    useEffect(() => {
        if (!metric) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [metric, onClose]);

    const chartConfig: ChartConfig = useMemo(
        () => ({
            score: {
                label: 'Capaian',
                color: 'var(--chart-1)',
            },
        }),
        [],
    );

    const radarData = useMemo(() => {
        if (!metric) return [];

        const rawValues = [
            metric.scopus_docs || 0,
            metric.garuda_docs || 0,
            metric.wos_docs || 0,
            metric.ipr_count || 0,
            metric.research_count || 0,
            metric.service_count || 0,
        ];
        const maxVal = Math.max(...rawValues, 1);

        const calcScore = (val: number) => {
            if (!val || val <= 0 || maxVal <= 0) return 0;
            return Math.min(100, Math.max(0, Math.round((val / maxVal) * 100)));
        };

        return [
            {
                subject: 'Scopus',
                score: calcScore(metric.scopus_docs || 0),
                raw: metric.scopus_docs || 0,
                fullMark: 100,
            },
            {
                subject: 'Garuda',
                score: calcScore(metric.garuda_docs || 0),
                raw: metric.garuda_docs || 0,
                fullMark: 100,
            },
            {
                subject: 'WoS',
                score: calcScore(metric.wos_docs || 0),
                raw: metric.wos_docs || 0,
                fullMark: 100,
            },
            {
                subject: 'HKI',
                score: calcScore(metric.ipr_count || 0),
                raw: metric.ipr_count || 0,
                fullMark: 100,
            },
            {
                subject: 'Riset',
                score: calcScore(metric.research_count || 0),
                raw: metric.research_count || 0,
                fullMark: 100,
            },
            {
                subject: 'Pengabdian',
                score: calcScore(metric.service_count || 0),
                raw: metric.service_count || 0,
                fullMark: 100,
            },
        ];
    }, [metric]);

    if (!metric) return null;

    const univ = metric.university;
    const numberFormatter = new Intl.NumberFormat('id-ID');

    const handleCopyLink = () => {
        const campusKey = encodeURIComponent(String(univ?.code || univ?.id || ''));
        const url = new URL(window.location.href);
        url.searchParams.set('campus', campusKey);
        navigator.clipboard
            .writeText(url.toString())
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {
                // Ignore clipboard denial in restricted/non-secure contexts
            });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden font-['Geist',sans-serif]" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-foreground/50 backdrop-blur-xs transition-opacity duration-300" onClick={onClose} aria-hidden="true" />

            {/* Slide-over panel container */}
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-6 md:pl-10">
                <div className="flex h-full w-screen max-w-lg flex-col justify-between overflow-hidden border-l border-border bg-card text-card-foreground shadow-2xl">
                    {/* Sticky Glassmorphism Header */}
                    <div className="z-10 shrink-0 border-b border-border bg-card/95 p-5 backdrop-blur-md sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-primary uppercase ring-1 ring-primary/20">
                                    Scorecard Kampus
                                </span>
                                <span className="font-mono text-xs font-medium text-muted-foreground">PTMA Rank #{metric.ranking_position}</span>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label="Tutup panel"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* University Branding (Doppelrand Logo + Metadata) */}
                        <div className="mt-4 flex items-start gap-3.5">
                            <div className="relative shrink-0 rounded-2xl bg-muted/40 p-1 ring-1 ring-border/50">
                                {univ.logo_url ? (
                                    <img
                                        src={univ.logo_url}
                                        alt={univ.name}
                                        className="h-12 w-12 rounded-xl bg-background object-contain p-1 ring-1 ring-border/40"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary ring-1 ring-primary/20">
                                        {univ.short_name || univ.code || (univ.name ? univ.name.substring(0, 3).toUpperCase() : 'PTM')}
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 id="drawer-title" className="text-lg leading-snug font-bold text-card-foreground">
                                    {univ.name}
                                </h3>
                                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                    {univ.code && <span className="font-mono font-medium">{univ.code}</span>}
                                    {univ.code && <span>•</span>}
                                    <span>{univ.city ?? 'Indonesia'}</span>
                                    {univ.province && <span>({univ.province})</span>}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {univ.accreditation_status && (
                                        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-primary uppercase ring-1 ring-primary/20">
                                            BAN-PT: {univ.accreditation_status}
                                        </span>
                                    )}
                                    {metric.national_rank_overall && (
                                        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-border/50">
                                            Nasional: #{metric.national_rank_overall}
                                        </span>
                                    )}
                                    <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary ring-1 ring-primary/20">
                                        PTMA: #{metric.ranking_position}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Drawer Body Content */}
                    <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
                        {/* 1. Hero SINTA Scorecard Spotlight */}
                        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-4 shadow-xs sm:p-5">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <span className="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                                    Skor SINTA Kemdikbudristek
                                </span>
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-xs font-bold tracking-tight',
                                        metric.ranking_position === 1
                                            ? 'bg-accent text-accent-foreground ring-1 ring-accent/30'
                                            : 'bg-primary/10 text-primary ring-1 ring-primary/20',
                                    )}
                                >
                                    <Award className="h-3.5 w-3.5" />#{metric.ranking_position}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 divide-x divide-border/60">
                                <div>
                                    <div className="text-xs font-medium text-muted-foreground">SINTA Overall</div>
                                    <div className="mt-1 font-mono text-2xl font-bold text-primary tabular-nums sm:text-3xl">
                                        {numberFormatter.format(Math.round(Number(metric.sinta_score_overall)))}
                                    </div>
                                    <span className="mt-0.5 block text-[10px] text-muted-foreground">Akumulasi Semua Tahun</span>
                                </div>
                                <div className="pl-4">
                                    <div className="text-xs font-medium text-muted-foreground">SINTA 3 Tahun</div>
                                    <div className="mt-1 font-mono text-xl font-bold text-primary/80 tabular-nums sm:text-2xl">
                                        {numberFormatter.format(Math.round(Number(metric.sinta_score_3yr)))}
                                    </div>
                                    <span className="mt-0.5 block text-[10px] text-muted-foreground">3 Tahun Terakhir</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Interactive 6-Axis "Research Fingerprint" Radar Chart */}
                        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-5">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                                        <Compass className="h-4 w-4 text-primary" />
                                        Sidik Jari Riset &amp; Luaran
                                    </h4>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Profil kekuatan luaran riset dan publikasi kampus pada 6 dimensi utama
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                                    6 Sumbu
                                </span>
                            </div>

                            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[260px] w-full">
                                <RadarChart data={radarData}>
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(_, payload) => payload?.[0]?.payload?.subject}
                                                formatter={(value, _name, item) => {
                                                    const raw = item?.payload?.raw;
                                                    return (
                                                        <div className="flex w-full items-center justify-between gap-3">
                                                            <span className="text-muted-foreground">{item?.payload?.subject}:</span>
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className="font-mono font-bold text-foreground tabular-nums">
                                                                    {Number(raw ?? value).toLocaleString('id-ID')}
                                                                </span>
                                                                <span className="font-mono text-[10px] text-muted-foreground">({value}%)</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }}
                                            />
                                        }
                                    />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarGrid />
                                    <Radar
                                        dataKey="score"
                                        fill="var(--color-score)"
                                        fillOpacity={0.6}
                                        dot={{
                                            r: 4,
                                            fillOpacity: 1,
                                        }}
                                    />
                                </RadarChart>
                            </ChartContainer>
                        </div>

                        {/* 3 Thematic Bento Modules */}
                        <div className="space-y-4">
                            <div className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Rincian Klaster Luaran SINTA
                            </div>

                            {/* Module 1: Publikasi & Sitasi Global */}
                            <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-primary" />
                                        <h4 className="font-mono text-xs font-bold tracking-wider text-foreground uppercase">
                                            Publikasi &amp; Sitasi Global
                                        </h4>
                                    </div>
                                    <span className="font-mono text-[10px] text-muted-foreground">Scopus • WoS</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium tracking-wider uppercase">Scopus Dokumen</span>
                                            <BookOpen className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
                                            {numberFormatter.format(metric.scopus_docs)}
                                        </div>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">Dokumen Terindeks</span>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium tracking-wider uppercase">Sitasi Scopus</span>
                                            <Quote className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
                                            {numberFormatter.format(metric.scopus_citations ?? 0)}
                                        </div>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">Total Kutipan</span>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium tracking-wider uppercase">WoS Dokumen</span>
                                            <FileText className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
                                            {numberFormatter.format(metric.wos_docs)}
                                        </div>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">Web of Science</span>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium tracking-wider uppercase">Sitasi WoS</span>
                                            <Quote className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
                                            {numberFormatter.format(metric.wos_citations ?? 0)}
                                        </div>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">Total Kutipan</span>
                                    </div>
                                </div>
                            </div>

                            {/* Module 2: Publikasi Nasional & Kekayaan Intelektual */}
                            <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-secondary" />
                                        <h4 className="font-mono text-xs font-bold tracking-wider text-foreground uppercase">
                                            Publikasi Nasional &amp; HKI
                                        </h4>
                                    </div>
                                    <span className="font-mono text-[10px] text-muted-foreground">Garuda • Paten • Buku</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium tracking-wider uppercase">Garuda Dokumen</span>
                                            <FileCheck className="h-3.5 w-3.5 text-secondary" />
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
                                            {numberFormatter.format(metric.garuda_docs)}
                                        </div>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">Terakreditasi Nasional</span>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium tracking-wider uppercase">Sitasi Garuda</span>
                                            <Quote className="h-3.5 w-3.5 text-secondary" />
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
                                            {numberFormatter.format(metric.garuda_citations ?? 0)}
                                        </div>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">Kutipan Garuda</span>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium tracking-wider uppercase">Paten / HKI</span>
                                            <Award className="h-3.5 w-3.5 text-secondary" />
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
                                            {numberFormatter.format(metric.ipr_count)}
                                        </div>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">Kekayaan Intelektual</span>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium tracking-wider uppercase">Buku Terbit</span>
                                            <Library className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
                                            {numberFormatter.format(metric.book_count ?? 0)}
                                        </div>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">ISBN &amp; Monograf</span>
                                    </div>
                                </div>
                            </div>

                            {/* Module 3: Produktivitas Riset & Sumber Daya Akademik */}
                            <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-primary" />
                                        <h4 className="font-mono text-xs font-bold tracking-wider text-foreground uppercase">
                                            Produktivitas Riset &amp; Akademik
                                        </h4>
                                    </div>
                                    <span className="font-mono text-[10px] text-muted-foreground">Riset • PkM • SDM</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium tracking-wider uppercase">Penelitian</span>
                                            <FlaskConical className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
                                            {numberFormatter.format(metric.research_count)}
                                        </div>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">Judul Riset</span>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium tracking-wider uppercase">Pengabdian (PkM)</span>
                                            <Handshake className="h-3.5 w-3.5 text-secondary" />
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
                                            {numberFormatter.format(metric.service_count)}
                                        </div>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">Kegiatan Masyarakat</span>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium tracking-wider uppercase">Dosen Terdaftar</span>
                                            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
                                            {numberFormatter.format(metric.authors_count ?? 0)}
                                        </div>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">Author SINTA</span>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium tracking-wider uppercase">Jurnal Kampus</span>
                                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold text-primary tabular-nums">
                                            {numberFormatter.format(metric.journals_count ?? 0)}
                                        </div>
                                        <span className="mt-0.5 block text-[10px] text-muted-foreground">Jurnal Terbitan Kampus</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Footer Actions */}
                    <div className="z-10 shrink-0 space-y-2 border-t border-border bg-card/95 p-4 backdrop-blur-md sm:p-5">
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-2.5 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5 text-primary" />
                                        <span>Tautan Disalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>Salin Tautan</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-2xs transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Tutup Rincian
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
