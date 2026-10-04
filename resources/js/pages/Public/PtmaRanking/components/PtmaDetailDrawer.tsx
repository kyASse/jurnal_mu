import React, { useEffect, useMemo, useState } from 'react';
import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
} from 'recharts';
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
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
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
        []
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
        const logMax = Math.log10(maxVal + 1);

        const calcScore = (val: number) => {
            if (!val || val <= 0 || logMax <= 0) return 0;
            return Math.min(100, Math.max(0, Math.round((Math.log10(val + 1) / logMax) * 100)));
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
        navigator.clipboard.writeText(url.toString()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-hidden font-['Geist',sans-serif]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-foreground/50 backdrop-blur-xs transition-opacity duration-300"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-over panel container */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
                <div className="w-screen max-w-lg bg-card text-card-foreground border-l border-border shadow-2xl flex flex-col h-full justify-between overflow-hidden">
                    {/* Sticky Glassmorphism Header */}
                    <div className="p-5 sm:p-6 border-b border-border bg-card/95 backdrop-blur-md shrink-0 z-10">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-primary/10 text-primary ring-1 ring-primary/20">
                                    Scorecard Kampus
                                </span>
                                <span className="font-mono text-xs text-muted-foreground font-medium">
                                    PTMA Rank #{metric.ranking_position}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label="Tutup panel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* University Branding (Doppelrand Logo + Metadata) */}
                        <div className="mt-4 flex items-start gap-3.5">
                            <div className="relative p-1 rounded-2xl bg-muted/40 ring-1 ring-border/50 shrink-0">
                                {univ.logo_url ? (
                                    <img
                                        src={univ.logo_url}
                                        alt={univ.name}
                                        className="w-12 h-12 rounded-xl object-contain bg-background p-1 ring-1 ring-border/40"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center font-bold text-primary text-sm font-mono">
                                        {univ.short_name || univ.code || (univ.name ? univ.name.substring(0, 3).toUpperCase() : 'PTM')}
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3
                                    id="drawer-title"
                                    className="text-lg font-bold text-card-foreground leading-snug"
                                >
                                    {univ.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                                    {univ.code && <span className="font-mono font-medium">{univ.code}</span>}
                                    {univ.code && <span>•</span>}
                                    <span>{univ.city ?? 'Indonesia'}</span>
                                    {univ.province && <span>({univ.province})</span>}
                                </p>

                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {univ.accreditation_status && (
                                        <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md ring-1 ring-primary/20">
                                            BAN-PT: {univ.accreditation_status}
                                        </span>
                                    )}
                                    {metric.national_rank_overall && (
                                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md ring-1 ring-border/50">
                                            Nasional: #{metric.national_rank_overall}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md ring-1 ring-primary/20">
                                        PTMA: #{metric.ranking_position}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Drawer Body Content */}
                    <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto">
                        {/* 1. Hero SINTA Scorecard Spotlight */}
                        <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-5 shadow-xs relative overflow-hidden">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                                    Skor SINTA Kemdikbudristek
                                </span>
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-tight',
                                        metric.ranking_position === 1
                                            ? 'bg-accent text-accent-foreground ring-1 ring-accent/30'
                                            : 'bg-primary/10 text-primary ring-1 ring-primary/20'
                                    )}
                                >
                                    <Award className="w-3.5 h-3.5" />
                                    #{metric.ranking_position}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 divide-x divide-border/60">
                                <div>
                                    <div className="text-xs text-muted-foreground font-medium">SINTA Overall</div>
                                    <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-primary mt-1">
                                        {numberFormatter.format(Math.round(Number(metric.sinta_score_overall)))}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground mt-0.5 block">Akumulasi Semua Tahun</span>
                                </div>
                                <div className="pl-4">
                                    <div className="text-xs text-muted-foreground font-medium">SINTA 3 Tahun</div>
                                    <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-primary/80 mt-1">
                                        {numberFormatter.format(Math.round(Number(metric.sinta_score_3yr)))}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground mt-0.5 block">3 Tahun Terakhir</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Interactive 6-Axis "Research Fingerprint" Radar Chart */}
                        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <Compass className="w-4 h-4 text-primary" />
                                        Sidik Jari Riset &amp; Luaran
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Profil kekuatan luaran riset dan publikasi kampus pada 6 dimensi utama
                                    </p>
                                </div>
                                <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md shrink-0">
                                    6 Sumbu
                                </span>
                            </div>

                            <ChartContainer
                                config={chartConfig}
                                className="h-[260px] w-full aspect-auto"
                            >
                                <RadarChart data={radarData}>
                                    <PolarGrid className="stroke-border/40" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        className="text-xs font-medium fill-muted-foreground"
                                    />
                                    <PolarRadiusAxis
                                        domain={[0, 100]}
                                        stroke="transparent"
                                        tick={false}
                                    />
                                    <Radar
                                        name="Capaian"
                                        dataKey="score"
                                        stroke="var(--chart-1)"
                                        fill="var(--chart-1)"
                                        fillOpacity={0.25}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(_, payload) => payload?.[0]?.payload?.subject}
                                                formatter={(value, _name, item) => {
                                                    const raw = item?.payload?.raw;
                                                    return (
                                                        <div className="flex items-center justify-between gap-3 w-full">
                                                            <span className="text-muted-foreground">Volume Luaran:</span>
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className="font-mono font-bold tabular-nums text-foreground">
                                                                    {Number(raw ?? value).toLocaleString('id-ID')}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                                    ({value}%)
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }}
                                            />
                                        }
                                    />
                                </RadarChart>
                            </ChartContainer>
                        </div>

                        {/* 3 Thematic Bento Modules */}
                        <div className="space-y-4">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                                Rincian Klaster Luaran SINTA
                            </div>

                            {/* Module 1: Publikasi & Sitasi Global */}
                            <div className="border border-border/70 rounded-xl p-4 bg-muted/20 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-primary" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                                            Publikasi &amp; Sitasi Global
                                        </h4>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono">Scopus • WoS</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="p-3 rounded-lg bg-card border border-border/60 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Scopus Dokumen</span>
                                            <BookOpen className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <div className="text-lg font-bold font-mono tabular-nums text-primary mt-1">
                                            {numberFormatter.format(metric.scopus_docs)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Dokumen Terindeks</span>
                                    </div>

                                    <div className="p-3 rounded-lg bg-card border border-border/60 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Sitasi Scopus</span>
                                            <Quote className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <div className="text-lg font-bold font-mono tabular-nums text-primary mt-1">
                                            {numberFormatter.format(metric.scopus_citations ?? 0)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Total Kutipan</span>
                                    </div>

                                    <div className="p-3 rounded-lg bg-card border border-border/60 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium uppercase tracking-wider">WoS Dokumen</span>
                                            <FileText className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <div className="text-lg font-bold font-mono tabular-nums text-primary mt-1">
                                            {numberFormatter.format(metric.wos_docs)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Web of Science</span>
                                    </div>

                                    <div className="p-3 rounded-lg bg-card border border-border/60 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Sitasi WoS</span>
                                            <Quote className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <div className="text-lg font-bold font-mono tabular-nums text-primary mt-1">
                                            {numberFormatter.format(metric.wos_citations ?? 0)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Total Kutipan</span>
                                    </div>
                                </div>
                            </div>

                            {/* Module 2: Publikasi Nasional & Kekayaan Intelektual */}
                            <div className="border border-border/70 rounded-xl p-4 bg-muted/20 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-secondary" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                                            Publikasi Nasional &amp; HKI
                                        </h4>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono">Garuda • Paten • Buku</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="p-3 rounded-lg bg-card border border-border/60 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Garuda Dokumen</span>
                                            <FileCheck className="w-3.5 h-3.5 text-secondary" />
                                        </div>
                                        <div className="text-lg font-bold font-mono tabular-nums text-primary mt-1">
                                            {numberFormatter.format(metric.garuda_docs)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Terakreditasi Nasional</span>
                                    </div>

                                    <div className="p-3 rounded-lg bg-card border border-border/60 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Sitasi Garuda</span>
                                            <Quote className="w-3.5 h-3.5 text-secondary" />
                                        </div>
                                        <div className="text-lg font-bold font-mono tabular-nums text-primary mt-1">
                                            {numberFormatter.format(metric.garuda_citations ?? 0)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Kutipan Garuda</span>
                                    </div>

                                    <div className="p-3 rounded-lg bg-card border border-border/60 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Paten / HKI</span>
                                            <Award className="w-3.5 h-3.5 text-secondary" />
                                        </div>
                                        <div className="text-lg font-bold font-mono tabular-nums text-primary mt-1">
                                            {numberFormatter.format(metric.ipr_count)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Kekayaan Intelektual</span>
                                    </div>

                                    <div className="p-3 rounded-lg bg-card border border-border/60 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Buku Terbit</span>
                                            <Library className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="text-lg font-bold font-mono tabular-nums text-primary mt-1">
                                            {numberFormatter.format(metric.book_count ?? 0)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">ISBN &amp; Monograf</span>
                                    </div>
                                </div>
                            </div>

                            {/* Module 3: Produktivitas Riset & Sumber Daya Akademik */}
                            <div className="border border-border/70 rounded-xl p-4 bg-muted/20 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-primary" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                                            Produktivitas Riset &amp; Akademik
                                        </h4>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono">Riset • PkM • SDM</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="p-3 rounded-lg bg-card border border-border/60 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Penelitian</span>
                                            <FlaskConical className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <div className="text-lg font-bold font-mono tabular-nums text-primary mt-1">
                                            {numberFormatter.format(metric.research_count)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Judul Riset</span>
                                    </div>

                                    <div className="p-3 rounded-lg bg-card border border-border/60 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Pengabdian (PkM)</span>
                                            <Handshake className="w-3.5 h-3.5 text-secondary" />
                                        </div>
                                        <div className="text-lg font-bold font-mono tabular-nums text-primary mt-1">
                                            {numberFormatter.format(metric.service_count)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Kegiatan Masyarakat</span>
                                    </div>

                                    <div className="p-3 rounded-lg bg-card border border-border/60 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Dosen Terdaftar</span>
                                            <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="text-lg font-bold font-mono tabular-nums text-primary mt-1">
                                            {numberFormatter.format(metric.authors_count ?? 0)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Author SINTA</span>
                                    </div>

                                    <div className="p-3 rounded-lg bg-card border border-border/60 shadow-2xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Jurnal Kampus</span>
                                            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="text-lg font-bold font-mono tabular-nums text-primary mt-1">
                                            {numberFormatter.format(metric.journals_count ?? 0)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Jurnal Terbitan Kampus</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Footer Actions */}
                    <div className="p-4 sm:p-5 border-t border-border bg-card/95 backdrop-blur-md shrink-0 z-10 space-y-2">
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 border border-border text-foreground transition-colors shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-primary" />
                                        <span>Tautan Disalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span>Salin Tautan</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
