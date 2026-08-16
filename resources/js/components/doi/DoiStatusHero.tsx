import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DoiSubscriptionData, SubscriptionStatusType } from '@/types/doi';
import { Calendar, Layers, RefreshCw, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoiStatusHeroProps {
    subscription: DoiSubscriptionData | null;
    onOpenDrawer?: () => void;
    onRenew?: () => void;
    className?: string;
}

function formatDateIndo(dateStr?: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function getDaysRemaining(endDateStr?: string | null): number | null {
    if (!endDateStr) return null;
    const endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) return null;
    const now = new Date();
    // Normalize to start of day
    endDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function DoiStatusHero({
    subscription,
    onOpenDrawer,
    onRenew,
    className,
}: DoiStatusHeroProps) {
    if (!subscription) return null;

    const daysRemaining = subscription.days_remaining ?? getDaysRemaining(subscription.end_date);
    const isExpiringSoon = subscription.is_expiring_soon || (daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 30);
    const status: SubscriptionStatusType = subscription.status;

    // Config based on status
    const statusConfig = {
        active: {
            title: 'Masa Langganan Aktif',
            dotColor: 'bg-emerald-500',
            pulseColor: 'bg-emerald-400',
            badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
            heroGradient: 'from-emerald-50/70 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background border-emerald-100 dark:border-emerald-900/40',
            label: 'Aktif',
            icon: ShieldCheck,
        },
        grace_period: {
            title: 'Masa Tenggang Langganan',
            dotColor: 'bg-amber-500',
            pulseColor: 'bg-amber-400',
            badgeBg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
            heroGradient: 'from-amber-50/70 via-background to-background dark:from-amber-950/20 dark:via-background dark:to-background border-amber-100 dark:border-amber-900/40',
            label: 'Masa Tenggang',
            icon: AlertTriangle,
        },
        pending_verification: {
            title: 'Menunggu Verifikasi Pembayaran',
            dotColor: 'bg-blue-500',
            pulseColor: 'bg-blue-400',
            badgeBg: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
            heroGradient: 'from-blue-50/70 via-background to-background dark:from-blue-950/20 dark:via-background dark:to-background border-blue-100 dark:border-blue-900/40',
            label: 'Menunggu Verifikasi',
            icon: Clock,
        },
        expired: {
            title: 'Masa Langganan Telah Berakhir',
            dotColor: 'bg-rose-500',
            pulseColor: 'bg-rose-400',
            badgeBg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
            heroGradient: 'from-rose-50/70 via-background to-background dark:from-rose-950/20 dark:via-background dark:to-background border-rose-100 dark:border-rose-900/40',
            label: 'Kadaluwarsa',
            icon: AlertTriangle,
        },
        inactive: {
            title: 'Belum Aktif',
            dotColor: 'bg-slate-400',
            pulseColor: 'bg-slate-300',
            badgeBg: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
            heroGradient: 'from-slate-50 via-background to-background dark:from-slate-900/40 dark:via-background dark:to-background border-slate-200 dark:border-slate-800',
            label: 'Tidak Aktif',
            icon: AlertTriangle,
        },
    };

    const currentConfig = statusConfig[status] || statusConfig.inactive;
    const packageName = subscription.package?.name || 'Paket Tahunan Crossref';

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl border bg-gradient-to-r p-5 shadow-xs sm:p-6',
                currentConfig.heroGradient,
                className
            )}
            role="region"
            aria-label="Status Langganan DOI"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                    {/* Status Pulsing Indicator */}
                    <div className="relative mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                        {status === 'active' || status === 'grace_period' ? (
                            <span
                                className={cn(
                                    'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                                    currentConfig.pulseColor
                                )}
                            />
                        ) : null}
                        <span
                            className={cn(
                                'relative inline-flex h-3 w-3 rounded-full shadow-xs',
                                currentConfig.dotColor
                            )}
                        />
                    </div>

                    {/* Main Information */}
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn(
                                    'font-medium tracking-wide transition-colors',
                                    currentConfig.badgeBg
                                )}
                            >
                                <currentConfig.icon className="mr-1 size-3" />
                                {currentConfig.label}
                            </Badge>

                            <span className="font-semibold text-foreground text-sm sm:text-base">
                                {packageName}
                            </span>

                            {daysRemaining !== null && status === 'active' && (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'font-mono text-xs tabular-nums',
                                        isExpiringSoon
                                            ? 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                                            : 'border-slate-200 bg-background/80 text-muted-foreground dark:border-slate-700'
                                    )}
                                >
                                    {daysRemaining > 0
                                        ? `Sisa ${daysRemaining} Hari`
                                        : 'Berakhir Hari Ini'}
                                </Badge>
                            )}

                            {status === 'expired' && (
                                <Badge
                                    variant="outline"
                                    className="border-rose-300 bg-rose-50 font-mono text-rose-900 text-xs dark:bg-rose-950 dark:text-rose-200"
                                >
                                    Telah Berakhir
                                </Badge>
                            )}
                        </div>

                        {/* Validity Period */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="size-3.5" />
                                <span>
                                    Periode: {formatDateIndo(subscription.start_date)} s.d.{' '}
                                    <span className="font-medium text-foreground">
                                        {formatDateIndo(subscription.end_date)}
                                    </span>
                                </span>
                            </div>
                            {isExpiringSoon && status === 'active' && (
                                <span className="font-medium text-amber-600 text-xs dark:text-amber-400">
                                    ⚠️ Masa aktif segera berakhir, mohon lakukan perpanjangan
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:self-center">
                    {onOpenDrawer && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenDrawer}
                            className="bg-background/80 hover:bg-accent text-xs sm:text-sm shadow-2xs"
                        >
                            <Layers className="mr-1.5 size-3.5" />
                            Detail Paket
                        </Button>
                    )}

                    {onRenew && (
                        <Button
                            size="sm"
                            onClick={onRenew}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm shadow-2xs"
                        >
                            <RefreshCw className="mr-1.5 size-3.5" />
                            Perpanjang Sekarang
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
