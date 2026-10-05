import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, School, SearchX } from 'lucide-react';
import React from 'react';
import { PaginationLink, PtmaMetric } from '../types';
import { LeaderboardRow } from './LeaderboardRow';

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

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ metrics, currentSort = 'sinta_overall', onSelectDetail, pagination }) => {
    const safeSort = typeof currentSort === 'string' && currentSort ? currentSort : 'sinta_overall';

    // Empty state
    if (!metrics || metrics.length === 0) {
        return (
            <div className="w-full rounded-3xl border border-dashed border-border bg-muted/40 px-4 py-16 text-center font-['Geist',sans-serif]">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <SearchX className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-card-foreground">Tidak ada kampus yang cocok dengan kriteria pencarian</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
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

    const topValue = metrics[0] ? getMetricNumber(metrics[0], safeSort) : 1;

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
            <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                    <School className="h-3.5 w-3.5 text-primary" />
                    Menampilkan {metrics.length} Perguruan Tinggi
                    {pagination?.total && pagination.total > metrics.length && <span> dari {pagination.total} terindeks</span>}
                </span>
                <span className="font-mono text-[11px] tracking-wider uppercase">Urutan: {safeSort.replace(/_/g, ' ')}</span>
            </div>

            {/* Rows List */}
            <div className="space-y-3">
                {metrics.map((item) => (
                    <LeaderboardRow key={item.id} metric={item} currentSort={safeSort} topValue={topValue} onSelectDetail={onSelectDetail} />
                ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.links && pagination.links.length > 3 && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 pb-2 sm:flex-row">
                    <div className="font-mono text-xs text-muted-foreground">
                        Halaman <span className="font-semibold text-foreground">{pagination.current_page}</span> dari{' '}
                        <span className="font-semibold text-foreground">{pagination.last_page}</span>
                        {pagination.total && <span className="ml-1">({pagination.total} total kampus)</span>}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1">
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
                                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                            isDisabled
                                                ? 'cursor-not-allowed text-muted-foreground/40'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                        aria-label="Halaman sebelumnya"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
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
                                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                            isDisabled
                                                ? 'cursor-not-allowed text-muted-foreground/40'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                        aria-label="Halaman berikutnya"
                                    >
                                        <span>Berikutnya</span>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                );
                            }

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => handlePageClick(link.url)}
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-medium transition-colors ${
                                        link.active
                                            ? 'bg-primary font-bold text-primary-foreground shadow-xs'
                                            : isDisabled
                                              ? 'cursor-default text-muted-foreground/40'
                                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
