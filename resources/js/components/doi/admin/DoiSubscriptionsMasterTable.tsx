import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    DoiSubscriptionData,
    SubscriptionStatusType,
} from '@/types/doi';
import { PaginatedData } from '@/types/index';
import {
    Search,
    Building2,
    Copy,
    Check,
    Sparkles,
    Calendar,
    CheckCircle2,
    Clock,
    AlertTriangle,
    XCircle,
    SlidersHorizontal,
    Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoiSubscriptionsMasterTableProps {
    subscriptions: PaginatedData<DoiSubscriptionData> | DoiSubscriptionData[];
    currentFilter?: string;
    currentSearch?: string;
    onFilterChange?: (status: string) => void;
    onSearchChange?: (search: string) => void;
    onAdjustQuota: (subscription: DoiSubscriptionData) => void;
    onPageChange?: (url: string) => void;
    isLoading?: boolean;
    className?: string;
}

const FILTER_OPTIONS = [
    { label: 'Semua Status', value: 'all' },
    { label: 'Aktif', value: 'active' },
    { label: 'Menunggu Verifikasi', value: 'pending_verification' },
    { label: 'Masa Tenggang', value: 'grace_period' },
    { label: 'Kadaluwarsa', value: 'expired' },
    { label: 'Nonaktif', value: 'inactive' },
];

function getStatusBadgeConfig(status: SubscriptionStatusType) {
    switch (status) {
        case 'active':
            return {
                label: 'Aktif',
                className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
                icon: CheckCircle2,
            };
        case 'pending_verification':
            return {
                label: 'Verifikasi Pembayaran',
                className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
                icon: Clock,
            };
        case 'grace_period':
            return {
                label: 'Masa Tenggang',
                className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
                icon: AlertTriangle,
            };
        case 'expired':
            return {
                label: 'Kadaluwarsa',
                className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
                icon: XCircle,
            };
        case 'inactive':
        default:
            return {
                label: 'Nonaktif',
                className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
                icon: XCircle,
            };
    }
}

export function DoiSubscriptionsMasterTable({
    subscriptions,
    currentFilter = 'all',
    currentSearch = '',
    onFilterChange,
    onSearchChange,
    onAdjustQuota,
    onPageChange,
    isLoading = false,
    className,
}: DoiSubscriptionsMasterTableProps) {
    const isPaginated = 'data' in subscriptions;
    const subscriptionList: DoiSubscriptionData[] = isPaginated
        ? (subscriptions as PaginatedData<DoiSubscriptionData>).data
        : (subscriptions as DoiSubscriptionData[]);
    const pagination = isPaginated ? (subscriptions as PaginatedData<DoiSubscriptionData>) : null;

    const [searchInput, setSearchInput] = React.useState(currentSearch);
    const [copiedPrefixId, setCopiedPrefixId] = React.useState<number | null>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearchChange?.(searchInput);
    };

    const handleCopyPrefix = (subId: number, prefix: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(prefix);
        setCopiedPrefixId(subId);
        setTimeout(() => setCopiedPrefixId(null), 2000);
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-1">
                    {FILTER_OPTIONS.map((filter) => {
                        const isActive =
                            currentFilter === filter.value ||
                            (filter.value === 'all' && (!currentFilter || currentFilter === ''));
                        return (
                            <Button
                                key={filter.value}
                                type="button"
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onFilterChange?.(filter.value)}
                                className={cn('h-8 text-xs font-medium', isActive ? '' : 'text-muted-foreground')}
                            >
                                {filter.label}
                            </Button>
                        );
                    })}
                </div>

                {/* Search input */}
                {onSearchChange && (
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cari PTMA, prefix, atau paket..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="h-8 pl-8 pr-3 text-xs"
                        />
                    </form>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-card shadow-xs dark:border-slate-800">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="text-xs font-semibold">Institusi / PTMA</TableHead>
                            <TableHead className="text-xs font-semibold">Prefix DOI</TableHead>
                            <TableHead className="text-xs font-semibold">Paket</TableHead>
                            <TableHead className="w-[180px] text-xs font-semibold">Kuota Similarity</TableHead>
                            <TableHead className="text-xs font-semibold">Periode & Status</TableHead>
                            <TableHead className="text-right text-xs font-semibold">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                                    Memuat data master langganan...
                                </TableCell>
                            </TableRow>
                        ) : subscriptionList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12 text-center">
                                    <Layers className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-semibold text-foreground">Tidak Ada Data Langganan</p>
                                    <p className="text-xs text-muted-foreground">
                                        Tidak ditemukan data langganan yang cocok dengan kriteria pencarian ini.
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            subscriptionList.map((sub) => {
                                const statusConfig = getStatusBadgeConfig(sub.status);
                                const StatusIcon = statusConfig.icon;
                                const totalQuota = Number(sub.similarity_quota_total) || 0;
                                const usedQuota = Number(sub.similarity_quota_used) || 0;
                                const quotaPercent = totalQuota > 0 ? Math.min(Math.round((usedQuota / totalQuota) * 100), 100) : 0;
                                const isPrefixCopied = copiedPrefixId === sub.id;

                                return (
                                    <TableRow key={sub.id} className="transition-colors hover:bg-muted/40">
                                        {/* Institution Info */}
                                        <TableCell className="text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                    <Building2 className="size-3.5" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-foreground">
                                                        {sub.university?.name || 'Universitas Muhammadiyah'}
                                                    </p>
                                                    {sub.university?.code && (
                                                        <span className="font-mono text-[10px] text-muted-foreground">
                                                            Kode: {sub.university.code}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Prefix DOI */}
                                        <TableCell className="text-xs">
                                            {sub.active_prefix ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleCopyPrefix(sub.id, sub.active_prefix!, e)}
                                                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-muted/40 px-2 py-0.5 font-mono text-xs font-semibold text-foreground transition-all hover:bg-muted dark:border-slate-800"
                                                    title="Klik untuk menyalin prefix"
                                                >
                                                    <span>{sub.active_prefix}</span>
                                                    {isPrefixCopied ? (
                                                        <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                                                    ) : (
                                                        <Copy className="size-3 text-muted-foreground" />
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="font-mono text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>

                                        {/* Package */}
                                        <TableCell className="text-xs">
                                            <div className="space-y-0.5">
                                                <p className="font-medium text-foreground">
                                                    {sub.package?.name || 'Paket Standar'}
                                                </p>
                                                {sub.package?.code && (
                                                    <Badge variant="outline" className="text-[10px] uppercase">
                                                        {sub.package.code}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Similarity Quota */}
                                        <TableCell className="text-xs">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="font-mono font-medium text-foreground">
                                                        {usedQuota} / {totalQuota}
                                                    </span>
                                                    <span className="font-mono text-muted-foreground">
                                                        {quotaPercent}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={quotaPercent}
                                                    className={cn(
                                                        'h-1.5',
                                                        quotaPercent > 90
                                                            ? '[&>div]:bg-rose-500'
                                                            : quotaPercent > 75
                                                            ? '[&>div]:bg-amber-500'
                                                            : '[&>div]:bg-indigo-500'
                                                    )}
                                                />
                                            </div>
                                        </TableCell>

                                        {/* Period & Status */}
                                        <TableCell className="text-xs">
                                            <div className="space-y-1">
                                                <Badge
                                                    variant="outline"
                                                    className={cn('text-[11px] font-medium', statusConfig.className)}
                                                >
                                                    <StatusIcon className="mr-1 size-3" />
                                                    {statusConfig.label}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Calendar className="size-3" />
                                                    <span>
                                                        {sub.start_date || '-'} s.d. {sub.end_date || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onAdjustQuota(sub)}
                                                className="h-7 px-2.5 text-xs shadow-2xs hover:bg-muted"
                                            >
                                                <Sparkles className="mr-1 size-3.5 text-indigo-600 dark:text-indigo-400" />
                                                Sesuaikan Kuota
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.links && pagination.links.length > 3 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">
                        Menampilkan <span className="font-semibold text-foreground">{pagination.from || 0}</span>-
                        <span className="font-semibold text-foreground">{pagination.to || 0}</span> dari{' '}
                        <span className="font-semibold text-foreground">{pagination.total}</span> langganan
                    </p>

                    <div className="flex items-center gap-1">
                        {pagination.links.map((link, idx) => {
                            if (!link.url && link.label === '...') {
                                return (
                                    <span key={idx} className="px-2 text-xs text-muted-foreground">
                                        ...
                                    </span>
                                );
                            }

                            const isPrevious = link.label.includes('Previous') || link.label.includes('&laquo;');
                            const isNext = link.label.includes('Next') || link.label.includes('&raquo;');
                            const cleanLabel = link.label.replace('&laquo;', '').replace('&raquo;', '').trim();

                            return (
                                <Button
                                    key={idx}
                                    type="button"
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && onPageChange?.(link.url)}
                                    className="h-7 px-2.5 text-xs"
                                >
                                    {isPrevious ? 'Sebelumnya' : isNext ? 'Berikutnya' : cleanLabel}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
