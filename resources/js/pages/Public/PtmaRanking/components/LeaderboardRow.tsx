import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PtmaMetric, PtmaUniversity } from '../types';

export interface LeaderboardRowProps {
    metric: PtmaMetric;
    currentSort?: string;
    topValue: number;
    onSelectDetail: (metric: PtmaMetric) => void;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
    metric,
    currentSort = 'sinta_overall',
    topValue,
    onSelectDetail,
}) => {
    const rank = metric.ranking_position;
    const univ: PtmaUniversity = metric.university;

    const getMetricDisplay = () => {
        switch (currentSort) {
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
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 ring-1 ring-zinc-200/80 dark:ring-zinc-700 font-semibold';
    };

    return (
        <div className="group relative rounded-2xl p-1 bg-zinc-100/70 dark:bg-zinc-900/40 ring-1 ring-zinc-200/80 dark:ring-zinc-800/80 hover:ring-emerald-500/30 dark:hover:ring-emerald-500/30 transition-all shadow-xs font-['Geist',sans-serif]">
            {/* Inner Core: Double-Bezel Architecture */}
            <div className="rounded-[calc(1rem-0.125rem)] p-4 md:px-6 md:py-4 bg-white dark:bg-zinc-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
                {/* Left: Rank & University Identity */}
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                    {/* Metallic Rank Badge */}
                    <div
                        className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-['Geist_Mono',monospace] tabular-nums text-sm ${getRankBadgeClasses()}`}
                        title={`Peringkat #${rank}`}
                    >
                        #{rank}
                    </div>

                    {/* Logo / Initials */}
                    {univ.logo_url ? (
                        <img
                            src={univ.logo_url}
                            alt={univ.name}
                            className="w-10 h-10 shrink-0 rounded-xl object-contain bg-zinc-50 dark:bg-zinc-800 p-1 ring-1 ring-zinc-200/60 dark:ring-zinc-700/60"
                        />
                    ) : (
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500/20 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                            {univ.short_name || univ.code || (univ.name ? univ.name.substring(0, 3).toUpperCase() : 'PTM')}
                        </div>
                    )}

                    {/* University Details */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                {univ.name}
                            </h4>
                            {univ.short_name && (
                                <span className="text-xs text-zinc-400 font-normal">
                                    ({univ.short_name})
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {univ.accreditation_status && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase font-mono font-medium tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                                    Akreditasi {univ.accreditation_status}
                                </span>
                            )}
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <span>{univ.city ?? 'Indonesia'}</span>
                                {univ.province && (
                                    <>
                                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                        <span>{univ.province}</span>
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Primary Metric & Relative Sparkbar & Button-in-Button */}
                <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800/80">
                    {/* Primary Metric & Sparkbar */}
                    <div className="flex flex-col items-start md:items-end">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-lg md:text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-zinc-900 dark:text-zinc-50 tracking-tight">
                                {numberFormatter.format(Math.round(metricInfo.value))}
                            </span>
                            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider hidden sm:inline">
                                {metricInfo.label}
                            </span>
                        </div>
                        {/* Relative Sparkbar against Top 1 */}
                        <div
                            className="w-28 sm:w-36 md:w-44 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-1.5 ring-1 ring-zinc-200/40 dark:ring-zinc-700/40"
                            title={`${sparkWidth.toFixed(1)}% relatif terhadap peringkat #1`}
                        >
                            <div
                                className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${sparkWidth}%` }}
                            />
                        </div>
                    </div>

                    {/* Button-in-Button Detail Trigger */}
                    <button
                        type="button"
                        onClick={() => onSelectDetail(metric)}
                        className="inline-flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-full text-xs font-medium bg-zinc-100 hover:bg-emerald-50 text-zinc-700 hover:text-emerald-700 dark:bg-zinc-800 dark:hover:bg-emerald-950/50 dark:text-zinc-300 dark:hover:text-emerald-400 border border-zinc-200/80 dark:border-zinc-700 hover:border-emerald-500/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0"
                    >
                        <span>Rincian</span>
                        <span className="w-5 h-5 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 shadow-xs">
                            <ArrowUpRight className="w-3 h-3 text-current" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
