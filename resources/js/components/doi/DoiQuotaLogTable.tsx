import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DoiQuotaLogData, QuotaChangeType } from '@/types/doi';
import { History, Plus, Minus, Settings2, RefreshCw, Sparkles, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoiQuotaLogTableProps {
    logs: DoiQuotaLogData[];
    className?: string;
}

function formatDateTimeIndo(dateStr?: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function getChangeTypeBadge(changeType: QuotaChangeType) {
    switch (changeType) {
        case 'allocation':
            return {
                label: 'Alokasi Awal',
                className: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
                icon: Sparkles,
            };
        case 'renewal':
            return {
                label: 'Perpanjangan',
                className: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300',
                icon: RefreshCw,
            };
        case 'adjustment':
            return {
                label: 'Penyesuaian Admin',
                className: 'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300',
                icon: Settings2,
            };
        case 'usage':
        default:
            return {
                label: 'Penggunaan Plagiasi',
                className: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
                icon: Minus,
            };
    }
}

export function DoiQuotaLogTable({ logs = [], className }: DoiQuotaLogTableProps) {
    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">
                        Riwayat Aktivitas Kuota Similarity
                    </h3>
                </div>
                <span className="text-xs text-muted-foreground">
                    Menampilkan {logs.length} transaksi terakhir
                </span>
            </div>

            <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40">
                            <TableHead className="w-[180px] text-xs font-semibold">Waktu</TableHead>
                            <TableHead className="w-[170px] text-xs font-semibold">Jenis Perubahan</TableHead>
                            <TableHead className="text-xs font-semibold">Jurnal / Keterangan</TableHead>
                            <TableHead className="w-[130px] text-right text-xs font-semibold">Perubahan</TableHead>
                            <TableHead className="w-[130px] text-right text-xs font-semibold">Sisa Saldo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Inbox className="size-8 opacity-40" />
                                        <p className="text-xs">Belum ada riwayat aktivitas pemakaian kuota.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.slice(0, 5).map((log) => {
                                const typeConfig = getChangeTypeBadge(log.change_type);
                                const isNegative = log.amount < 0 || log.change_type === 'usage';
                                const formattedAmount = `${isNegative ? '-' : '+'}${Math.abs(log.amount)}`;

                                return (
                                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                                        {/* Timestamp */}
                                        <TableCell className="font-mono text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                                            {formatDateTimeIndo(log.created_at)}
                                        </TableCell>

                                        {/* Change Type Badge */}
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'gap-1 text-[11px] font-medium',
                                                    typeConfig.className
                                                )}
                                            >
                                                <typeConfig.icon className="size-3" />
                                                {typeConfig.label}
                                            </Badge>
                                        </TableCell>

                                        {/* Journal / Description */}
                                        <TableCell className="max-w-[280px]">
                                            <div className="flex flex-col">
                                                {log.journal?.title ? (
                                                    <span className="font-medium text-foreground text-xs line-clamp-1">
                                                        {log.journal.title}
                                                    </span>
                                                ) : null}
                                                <span className="text-[11px] text-muted-foreground line-clamp-1">
                                                    {log.description || 'Tidak ada catatan tambahan'}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Amount Changed */}
                                        <TableCell className="text-right">
                                            <span
                                                className={cn(
                                                    'font-mono text-xs font-semibold tabular-nums',
                                                    isNegative
                                                        ? 'text-rose-600 dark:text-rose-400'
                                                        : 'text-emerald-600 dark:text-emerald-400'
                                                )}
                                            >
                                                {formattedAmount} Dokumen
                                            </span>
                                        </TableCell>

                                        {/* Balance After */}
                                        <TableCell className="text-right font-mono text-xs font-medium text-foreground tabular-nums">
                                            {log.balance_after} Dokumen
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
