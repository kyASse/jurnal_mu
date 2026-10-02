import React from 'react';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, School, SearchX } from 'lucide-react';
import { LeaderboardRow } from './LeaderboardRow';
import { PaginationLink, PtmaMetric } from '../types';

export interface LeaderboardTableProps {
    metrics: PtmaMetric[];
    currentSort: string;
    onSelectDetail: (metric: PtmaMetric) => void;
    pagination?: {
        current_page: number;
        last_page: number;
        total: number;
        per_page?: number;
        from?: number;
        to?: number;
        links?: PaginationLink[];
    };
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
    metrics,
    currentSort = 'sinta_overall',
    onSelectDetail,
    pagination,
}) => {
    // Empty state
    if (!metrics || metrics.length === 0) {
        return (
            <div className="w-full py-16 px-4 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-center font-['Geist',sans-serif]">
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <SearchX className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Tidak ada kampus yang cocok dengan kriteria pencarian
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                    Silakan ubah kata kunci pencarian atau sesuaikan filter akreditasi BAN-PT untuk melihat kampus PTMA lainnya.
                </p>
            </div>
        );
    }

    // Compute top metric value from the first item to normalize sparkbar
    const getMetricNumber = (item: PtmaMetric, sortKey: string): number => {
        switch (sortKey) {
            case 'sinta_3yr':
                return Number(item.sinta_score_3yr) || 0;
            case 'scopus':
                return item.scopus_docs || 0;
            case 'garuda':
                return item.garuda_docs || 0;
            case 'wos':
                return item.wos_docs || 0;
            case 'ipr':
                return item.ipr_count || 0;
            case 'research':
                return item.research_count || 0;
            case 'service':
                return item.service_count || 0;
            case 'book':
                return item.book_count || 0;
            case 'authors':
                return item.authors_count || 0;
            case 'sinta_overall':
            default:
                return Number(item.sinta_score_overall) || 0;
        }
    };

    const topValue = metrics[0] ? getMetricNumber(metrics[0], currentSort) : 1;

    const handlePageClick = (url: string | null) => {
        if (!url) return;
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="w-full space-y-4 font-['Geist',sans-serif]">
            {/* Table Meta Header */}
            <div className="flex items-center justify-between px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5 font-medium">
                    <School className="w-3.5 h-3.5 text-emerald-600" />
                    Menampilkan {metrics.length} Perguruan Tinggi
                    {pagination?.total && pagination.total > metrics.length && (
                        <span> dari {pagination.total} terindeks</span>
                    )}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider">
                    Urutan: {currentSort.replace('_', ' ')}
                </span>
            </div>

            {/* Rows List */}
            <div className="space-y-3">
                {metrics.map((item) => (
                    <LeaderboardRow
                        key={item.id}
                        metric={item}
                        currentSort={currentSort}
                        topValue={topValue}
                        onSelectDetail={onSelectDetail}
                    />
                ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.links && pagination.links.length > 3 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-zinc-200/80 dark:border-zinc-800">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                        Halaman <span className="font-semibold text-zinc-800 dark:text-zinc-200">{pagination.current_page}</span> dari{' '}
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{pagination.last_page}</span>
                        {pagination.total && (
                            <span className="ml-1">({pagination.total} total kampus)</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 flex-wrap justify-center">
                        {pagination.links.map((link, idx) => {
                            const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                            const isNext = link.label.includes('Next') || link.label.includes('&raquo;');
                            const isDisabled = !link.url;

                            if (isPrev) {
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => handlePageClick(link.url)}
                                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            isDisabled
                                                ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                                                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                        }`}
                                        aria-label="Halaman sebelumnya"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                        <span>Sebelumnya</span>
                                    </button>
                                );
                            }

                            if (isNext) {
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => handlePageClick(link.url)}
                                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            isDisabled
                                                ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                                                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                        }`}
                                        aria-label="Halaman berikutnya"
                                    >
                                        <span>Berikutnya</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                );
                            }

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => handlePageClick(link.url)}
                                    className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-colors flex items-center justify-center ${
                                        link.active
                                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                            : isDisabled
                                            ? 'text-zinc-300 dark:text-zinc-700 cursor-default'
                                            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    }`}
                                >
                                    {link.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
