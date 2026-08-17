import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoiInvoiceStatsData } from '@/types/doi';
import { Receipt, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoiInvoiceStatsCardProps {
    stats?: DoiInvoiceStatsData;
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

export function DoiInvoiceStatsCard({ stats, className }: DoiInvoiceStatsCardProps) {
    const totalInvoices = stats?.total_invoices ?? 0;
    const unpaidAmount = stats?.unpaid_amount ?? 0;
    const paidAmount = stats?.paid_amount ?? 0;
    const unpaidCount = stats?.unpaid_count;
    const paidCount = stats?.paid_count;

    return (
        <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
            {/* Total Invoices Card */}
            <Card className="relative overflow-hidden border-slate-200 shadow-xs dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                        Total Faktur Tagihan
                    </CardTitle>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Receipt className="size-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline justify-between">
                        <span className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl tabular-nums">
                            {totalInvoices}
                        </span>
                        <span className="text-xs text-muted-foreground">Faktur Terbit</span>
                    </div>
                </CardContent>
            </Card>

            {/* Unpaid Invoices Card */}
            <Card className="relative overflow-hidden border-amber-200/80 bg-amber-50/20 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-amber-900 sm:text-sm dark:text-amber-300">
                        Menunggu Pembayaran
                    </CardTitle>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                        <Clock className="size-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline justify-between">
                        <span className="font-mono text-xl font-bold tracking-tight text-amber-950 sm:text-2xl tabular-nums dark:text-amber-100">
                            {formatRupiah(unpaidAmount)}
                        </span>
                        {unpaidCount !== undefined && (
                            <span className="font-medium text-amber-800 text-xs dark:text-amber-300">
                                {unpaidCount} Tagihan
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Paid Invoices Card */}
            <Card className="relative overflow-hidden border-emerald-200/80 bg-emerald-50/20 shadow-xs dark:border-emerald-900/50 dark:bg-emerald-950/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-emerald-900 sm:text-sm dark:text-emerald-300">
                        Total Lunas Terverifikasi
                    </CardTitle>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <CheckCircle2 className="size-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline justify-between">
                        <span className="font-mono text-xl font-bold tracking-tight text-emerald-950 sm:text-2xl tabular-nums dark:text-emerald-100">
                            {formatRupiah(paidAmount)}
                        </span>
                        {paidCount !== undefined && (
                            <span className="font-medium text-emerald-800 text-xs dark:text-emerald-300">
                                {paidCount} Lunas
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
