import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DoiAdminStatsData } from '@/types/doi';
import { Building2, Clock, Sparkles, Wallet, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoiAdminStatsCardsProps {
    stats: DoiAdminStatsData;
    onViewPendingQueue?: () => void;
    className?: string;
}

export function formatRupiah(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

export function DoiAdminStatsCards({
    stats,
    onViewPendingQueue,
    className,
}: DoiAdminStatsCardsProps) {
    const totalSubscriptions = stats?.total_subscriptions ?? 0;
    const activeSubscriptions = stats?.active_subscriptions ?? 0;
    const pendingProofsCount = stats?.pending_proofs_count ?? 0;
    const totalRevenue = stats?.total_revenue ?? 0;
    const usedQuota = stats?.used_similarity_quota ?? 0;
    const totalQuota = stats?.total_similarity_quota ?? 0;

    const activePercentage =
        totalSubscriptions > 0
            ? Math.round((activeSubscriptions / totalSubscriptions) * 100)
            : 0;

    return (
        <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
            {/* Card 1: PTMA Aktif */}
            <Card className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:to-emerald-950/20">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            PTMA Aktif Langganan
                        </span>
                        <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <Building2 className="size-4" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                        <div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-mono text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                                    {activeSubscriptions}
                                </span>
                                <span className="font-mono text-sm font-medium text-muted-foreground tabular-nums">
                                    / {totalSubscriptions} PTMA
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {activePercentage}%
                                </span>{' '}
                                dari total pendaftar
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Antrean Verifikasi (Live Pulse) */}
            <Card
                onClick={pendingProofsCount > 0 && onViewPendingQueue ? onViewPendingQueue : undefined}
                className={cn(
                    'relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-card via-card shadow-xs transition-all hover:shadow-md dark:border-slate-800',
                    pendingProofsCount > 0
                        ? 'cursor-pointer border-amber-300/80 to-amber-500/10 dark:border-amber-700/60 dark:to-amber-950/30 ring-1 ring-amber-500/20'
                        : 'to-slate-500/5 dark:to-slate-900/20'
                )}
            >
                <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Antrean Verifikasi
                            </span>
                            {pendingProofsCount > 0 && (
                                <span className="relative flex size-2.5">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                    <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
                                </span>
                            )}
                        </div>
                        <div
                            className={cn(
                                'flex size-9 items-center justify-center rounded-xl',
                                pendingProofsCount > 0
                                    ? 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400'
                                    : 'bg-muted text-muted-foreground'
                            )}
                        >
                            <Clock className="size-4" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                        <div>
                            <div className="flex items-baseline gap-1.5">
                                <span
                                    className={cn(
                                        'font-mono text-3xl font-extrabold tracking-tight tabular-nums',
                                        pendingProofsCount > 0
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-foreground'
                                    )}
                                >
                                    {pendingProofsCount}
                                </span>
                                <span className="text-xs text-muted-foreground">Bukti Menunggu</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {pendingProofsCount > 0 ? (
                                    <span className="inline-flex items-center gap-0.5 font-medium text-amber-600 dark:text-amber-400">
                                        Perlu tindakan verifikasi <ArrowUpRight className="size-3" />
                                    </span>
                                ) : (
                                    'Semua bukti terverifikasi'
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: Kuota Similarity Terpakai */}
            <Card className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-card via-card to-indigo-500/5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:to-indigo-950/20">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Kuota Similarity
                        </span>
                        <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                            <Sparkles className="size-4" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                        <div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-mono text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                                    {usedQuota.toLocaleString('id-ID')}
                                </span>
                                {totalQuota > 0 && (
                                    <span className="font-mono text-sm font-medium text-muted-foreground tabular-nums">
                                        / {totalQuota.toLocaleString('id-ID')}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Dokumen Turnitin dicek
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 4: Total Pendapatan / Tagihan Berjalan */}
            <Card className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:to-blue-950/20">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Total Pendapatan Terverifikasi
                        </span>
                        <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                            <Wallet className="size-4" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                        <div>
                            <div className="font-mono text-2xl font-extrabold tracking-tight text-foreground tabular-nums sm:text-3xl">
                                {formatRupiah(totalRevenue)}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Total penerimaan faktur lunas
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
