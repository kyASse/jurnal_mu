import { ArrowUpRight } from 'lucide-react';
import React from 'react';
import { PtmaMetric, PtmaUniversity } from '../types';

export interface LeaderboardRowProps {
    metric: PtmaMetric;
    currentSort?: string;
    topValue: number;
    onSelectDetail: (metric: PtmaMetric) => void;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ metric, currentSort = 'sinta_overall', topValue, onSelectDetail }) => {
    const safeSort = typeof currentSort === 'string' && currentSort ? currentSort : 'sinta_overall';
    const rank = metric.ranking_position;
    const univ: PtmaUniversity = metric.university;

    const getMetricDisplay = () => {
        switch (safeSort) {
            case 'sinta_3yr':
                return {
                    value: Number(metric.sinta_score_3yr) || 0,
                    label: 'Skor 3 Tahun',
                };
            case 'scopus':
                return {
                    value: metric.scopus_docs || 0,
                    label: 'Dokumen Scopus',
                };
            case 'garuda':
                return {
                    value: metric.garuda_docs || 0,
                    label: 'Dokumen Garuda',
                };
            case 'wos':
                return {
                    value: metric.wos_docs || 0,
                    label: 'Dokumen WoS',
                };
            case 'ipr':
                return {
                    value: metric.ipr_count || 0,
                    label: 'Paten / HKI',
                };
            case 'research':
                return {
                    value: metric.research_count || 0,
                    label: 'Judul Penelitian',
                };
            case 'service':
                return {
                    value: metric.service_count || 0,
                    label: 'Kegiatan Pengabdian',
                };
            case 'book':
                return {
                    value: metric.book_count || 0,
                    label: 'Buku',
                };
            case 'authors':
                return {
                    value: metric.authors_count || 0,
                    label: 'Dosen Terdaftar',
                };
            case 'sinta_overall':
            default:
                return {
                    value: Number(metric.sinta_score_overall) || 0,
                    label: 'Skor SINTA',
                };
        }
    };

    const metricInfo = getMetricDisplay();
    const numVal = Math.max(0, metricInfo.value);
    const validTop = topValue > 0 ? topValue : Math.max(1, numVal);
    // Relative Sparkbar percentage against #1 ranked metric
    const sparkWidth = numVal > 0 ? Math.min(100, Math.max(5, (numVal / validTop) * 100)) : 0;

    const numberFormatter = new Intl.NumberFormat('id-ID');

    // Metallic rank badge styling
    const getRankBadgeClasses = () => {
        if (rank === 1) {
            return 'bg-gradient-to-b from-amber-300/30 to-amber-500/20 text-amber-700 dark:text-amber-400 ring-2 ring-amber-400/50 shadow-xs shadow-amber-500/10 font-black';
        }
        if (rank === 2) {
            return 'bg-gradient-to-b from-slate-200/80 to-slate-400/25 text-slate-700 dark:text-slate-300 ring-2 ring-slate-300/80 dark:ring-slate-600/60 shadow-xs font-bold';
        }
        if (rank === 3) {
            return 'bg-gradient-to-b from-amber-700/20 to-amber-900/15 text-amber-800 dark:text-amber-500 ring-2 ring-amber-700/30 dark:ring-amber-600/30 shadow-xs font-bold';
        }
        return 'bg-muted text-muted-foreground ring-1 ring-border font-semibold';
    };

    return (
        <div className="group relative rounded-2xl bg-muted/40 p-1 font-['Geist',sans-serif] shadow-xs ring-1 ring-border transition-all hover:ring-primary/40">
            {/* Inner Core: Double-Bezel Architecture */}
            <div className="flex flex-col items-start justify-between gap-4 rounded-[calc(1rem-0.125rem)] bg-card p-4 text-card-foreground transition-colors md:flex-row md:items-center md:px-6 md:py-4">
                {/* Left: Rank & University Identity */}
                <div className="flex min-w-0 flex-1 items-center gap-3.5 sm:gap-4">
                    {/* Metallic Rank Badge */}
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-['Geist_Mono',monospace] text-sm tabular-nums ${getRankBadgeClasses()}`}
                        title={`Peringkat #${rank}`}
                    >
                        #{rank}
                    </div>

                    {/* Logo / Initials */}
                    {univ.logo_url ? (
                        <img
                            src={univ.logo_url}
                            alt={univ.name}
                            className="h-10 w-10 shrink-0 rounded-xl bg-muted object-contain p-1 ring-1 ring-border"
                        />
                    ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/25">
                            {univ.short_name || univ.code || (univ.name ? univ.name.substring(0, 3).toUpperCase() : 'PTM')}
                        </div>
                    )}

                    {/* University Details */}
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h4 className="truncate text-sm font-semibold text-card-foreground transition-colors group-hover:text-primary md:text-base">
                                {univ.name}
                            </h4>
                            {univ.short_name && <span className="text-xs font-normal text-muted-foreground">({univ.short_name})</span>}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            {univ.accreditation_status && (
                                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-primary uppercase ring-1 ring-primary/20">
                                    Akreditasi {univ.accreditation_status}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span>{univ.city ?? 'Indonesia'}</span>
                                {univ.province && (
                                    <>
                                        <span className="text-muted-foreground/40">•</span>
                                        <span>{univ.province}</span>
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Primary Metric & Relative Sparkbar & Button-in-Button */}
                <div className="flex w-full shrink-0 items-center justify-between gap-4 border-t border-border pt-3 sm:gap-6 md:w-auto md:justify-end md:border-t-0 md:pt-0">
                    {/* Primary Metric & Sparkbar */}
                    <div className="flex flex-col items-start md:items-end">
                        <div className="flex items-baseline gap-1.5">
                            <span className="font-['Geist_Mono',monospace] text-lg font-bold tracking-tight text-card-foreground tabular-nums md:text-xl">
                                {numberFormatter.format(Math.round(metricInfo.value))}
                            </span>
                            <span className="hidden text-[11px] font-medium tracking-wider text-muted-foreground uppercase sm:inline">
                                {metricInfo.label}
                            </span>
                        </div>
                        {/* Relative Sparkbar against Top 1 */}
                        <div
                            className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-muted ring-1 ring-border/40 sm:w-36 md:w-44"
                            title={`${sparkWidth.toFixed(1)}% relatif terhadap peringkat #1`}
                        >
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                                style={{ width: `${sparkWidth}%` }}
                            />
                        </div>
                    </div>

                    {/* Button-in-Button Detail Trigger */}
                    <button
                        type="button"
                        onClick={() => onSelectDetail(metric)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-muted py-1.5 pr-1.5 pl-3.5 text-xs font-medium text-foreground transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <span>Rincian</span>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs">
                            <ArrowUpRight className="h-3 w-3 text-current" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
