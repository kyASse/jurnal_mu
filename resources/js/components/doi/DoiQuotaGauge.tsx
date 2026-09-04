import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, BarChart3, CheckCircle2, FileSearch, PlusCircle } from 'lucide-react';

interface DoiQuotaGaugeProps {
    quotaTotal: number;
    quotaUsed: number;
    quotaResetDate?: string | null;
    onTopUp?: () => void;
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

export function DoiQuotaGauge({ quotaTotal = 0, quotaUsed = 0, quotaResetDate, onTopUp, className }: DoiQuotaGaugeProps) {
    const total = Math.max(0, quotaTotal);
    const used = Math.max(0, Math.min(quotaUsed, total));
    const remaining = Math.max(0, total - used);

    // Remaining percentage (0-100)
    const remainingPercentage = total > 0 ? Math.round((remaining / total) * 100) : 0;
    // Used percentage for progress bar fill (0-100)
    const usedPercentage = total > 0 ? Math.round((used / total) * 100) : 0;

    // Status styling based on remaining percentage
    let statusConfig = {
        color: 'emerald',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
        barColor: 'bg-emerald-500',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        label: 'Aman',
        icon: CheckCircle2,
    };

    if (remainingPercentage <= 10) {
        statusConfig = {
            color: 'rose',
            badgeBg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
            barColor: 'bg-rose-500',
            textColor: 'text-rose-600 dark:text-rose-400',
            label: 'Kritis',
            icon: AlertCircle,
        };
    } else if (remainingPercentage <= 30) {
        statusConfig = {
            color: 'amber',
            badgeBg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
            barColor: 'bg-amber-500',
            textColor: 'text-amber-600 dark:text-amber-400',
            label: 'Menipis',
            icon: AlertTriangle,
        };
    }

    return (
        <Card className={cn('relative overflow-hidden border-border/80 shadow-xs transition-all hover:shadow-md', className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <FileSearch className="size-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-foreground">Similarity Check</CardTitle>
                            <CardDescription className="text-xs">Kuota Uji Plagiasi (iThenticate)</CardDescription>
                        </div>
                    </div>

                    <Badge variant="outline" className={cn('text-[11px] font-medium', statusConfig.badgeBg)}>
                        <statusConfig.icon className="mr-1 size-3" />
                        {statusConfig.label} ({remainingPercentage}% Sisa)
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Highlight Sisa Kuota */}
                <div className="flex items-baseline justify-between">
                    <div>
                        <span className="text-xs text-muted-foreground">Sisa Kuota Tersedia</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="font-mono text-2xl font-extrabold tracking-tight text-foreground tabular-nums sm:text-3xl">
                                {remaining}
                            </span>
                            <span className="text-xs text-muted-foreground">/ {total} Dokumen</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-xs text-muted-foreground">Tingkat Pemakaian</span>
                        <p className="font-mono text-sm font-semibold text-foreground tabular-nums">{usedPercentage}%</p>
                    </div>
                </div>

                {/* Fluid Animated Progress Gauge Bar */}
                <div className="space-y-1.5">
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/80 dark:bg-secondary">
                        <div
                            className={cn('h-full rounded-full transition-all duration-700 ease-out', statusConfig.barColor)}
                            style={{ width: `${Math.min(100, Math.max(usedPercentage, remainingPercentage === 0 ? 100 : 0))}%` }}
                            role="progressbar"
                            aria-valuenow={used}
                            aria-valuemin={0}
                            aria-valuemax={total}
                            aria-label={`Penggunaan kuota ${used} dari ${total}`}
                        />
                    </div>

                    <div className="flex justify-between font-mono text-[11px] text-muted-foreground tabular-nums">
                        <span>0 Terpakai</span>
                        <span>{total} Total</span>
                    </div>
                </div>

                {/* Detailed Breakdown stats */}
                <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-2.5 text-xs dark:bg-muted/10">
                    <div className="space-y-0.5">
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <BarChart3 className="size-3" />
                            Dokumen Terpakai
                        </span>
                        <p className="font-mono font-semibold text-foreground tabular-nums">{used} Dokumen</p>
                    </div>

                    <div className="space-y-0.5">
                        <span className="text-muted-foreground">Masa Berlaku Kuota</span>
                        <p className="truncate text-xs font-medium text-foreground">
                            {quotaResetDate ? formatDateIndo(quotaResetDate) : 'Sesuai Langganan'}
                        </p>
                    </div>
                </div>

                {/* Top Up / Add Quota CTA */}
                {onTopUp && (
                    <div className="pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onTopUp}
                            className="w-full gap-1.5 border-emerald-300 text-xs shadow-2xs hover:bg-emerald-50 hover:text-emerald-900 dark:border-emerald-800 dark:hover:bg-emerald-950 dark:hover:text-emerald-200"
                        >
                            <PlusCircle className="size-3.5" />
                            <span>Tambah Kuota Similarity</span>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
