import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DoiInvoiceDetailData, InvoiceStatusType } from '@/types/doi';
import { PaginatedData } from '@/types/index';
import {
    AlertCircle,
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Receipt,
    Search,
    ShieldAlert,
    UploadCloud,
    XCircle,
} from 'lucide-react';
import * as React from 'react';
import { formatRupiah } from './DoiInvoiceStatsCard';

interface DoiInvoiceTableProps {
    invoices: PaginatedData<DoiInvoiceDetailData> | DoiInvoiceDetailData[];
    currentFilter?: string;
    currentSearch?: string;
    onFilterChange?: (status: string) => void;
    onSearchChange?: (search: string) => void;
    onViewDetail: (invoice: DoiInvoiceDetailData) => void;
    onUploadProof?: (invoice: DoiInvoiceDetailData) => void;
    onPageChange?: (url: string) => void;
    isLoading?: boolean;
    className?: string;
}

const FILTER_OPTIONS = [
    { label: 'Semua Status', value: 'all' },
    { label: 'Belum Bayar', value: 'unpaid' },
    { label: 'Menunggu Verifikasi', value: 'pending_verification' },
    { label: 'Lunas', value: 'paid' },
    { label: 'Kadaluwarsa', value: 'expired' },
];

function getStatusBadgeConfig(status: InvoiceStatusType) {
    switch (status) {
        case 'paid':
            return {
                label: 'Lunas',
                className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
                icon: CheckCircle2,
            };
        case 'pending_verification':
            return {
                label: 'Menunggu Verifikasi',
                className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
                icon: Clock,
            };
        case 'expired':
            return {
                label: 'Kadaluwarsa',
                className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
                icon: AlertTriangle,
            };
        case 'cancelled':
            return {
                label: 'Dibatalkan',
                className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
                icon: XCircle,
            };
        case 'unpaid':
        default:
            return {
                label: 'Belum Dibayar',
                className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
                icon: AlertCircle,
            };
    }
}

export function DoiInvoiceTable({
    invoices,
    currentFilter = 'all',
    currentSearch = '',
    onFilterChange,
    onSearchChange,
    onViewDetail,
    onUploadProof,
    onPageChange,
    isLoading = false,
    className,
}: DoiInvoiceTableProps) {
    const isPaginated = 'data' in invoices;
    const invoiceList: DoiInvoiceDetailData[] = isPaginated
        ? (invoices as PaginatedData<DoiInvoiceDetailData>).data
        : (invoices as DoiInvoiceDetailData[]);
    const pagination = isPaginated ? (invoices as PaginatedData<DoiInvoiceDetailData>) : null;

    const [searchInput, setSearchInput] = React.useState(currentSearch);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearchChange?.(searchInput);
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-1">
                    {FILTER_OPTIONS.map((filter) => {
                        const isActive = currentFilter === filter.value || (filter.value === 'all' && !currentFilter);
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
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                        <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cari nomor faktur..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="h-8 pr-3 pl-8 text-xs"
                        />
                    </form>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-card shadow-xs dark:border-slate-800">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[180px] text-xs font-semibold">Nomor Faktur</TableHead>
                            <TableHead className="text-xs font-semibold">Paket & Periode</TableHead>
                            <TableHead className="text-xs font-semibold">Total Tagihan</TableHead>
                            <TableHead className="text-xs font-semibold">Batas Pembayaran</TableHead>
                            <TableHead className="text-xs font-semibold">Status</TableHead>
                            <TableHead className="text-right text-xs font-semibold">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                                    Memuat data faktur...
                                </TableCell>
                            </TableRow>
                        ) : invoiceList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center">
                                    <Receipt className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-foreground">Tidak ada faktur ditemukan</p>
                                    <p className="text-xs text-muted-foreground">Tidak ada data faktur yang sesuai dengan filter pencarian ini.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoiceList.map((invoice) => {
                                const statusConfig = getStatusBadgeConfig(invoice.status);
                                const StatusIcon = statusConfig.icon;
                                const isRejected = invoice.latest_payment_proof?.status === 'rejected';
                                const isUnpaidOrPending = invoice.status === 'unpaid' || invoice.status === 'pending_verification';

                                return (
                                    <TableRow
                                        key={invoice.id}
                                        className="cursor-pointer transition-colors hover:bg-muted/40"
                                        onClick={() => onViewDetail(invoice)}
                                    >
                                        {/* Invoice Number */}
                                        <TableCell className="font-mono text-xs font-bold text-foreground">
                                            <div className="flex items-center gap-2">
                                                <Receipt className="size-3.5 text-muted-foreground" />
                                                <span>{invoice.invoice_number}</span>
                                            </div>
                                        </TableCell>

                                        {/* Package & Period */}
                                        <TableCell className="text-xs">
                                            <div className="space-y-0.5">
                                                <p className="font-medium text-foreground">
                                                    {invoice.package?.name || invoice.package_name || 'Langganan Tahunan'}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {invoice.period_start && invoice.period_end
                                                        ? `${invoice.period_start} s.d. ${invoice.period_end}`
                                                        : '-'}
                                                </p>
                                            </div>
                                        </TableCell>

                                        {/* Total Amount */}
                                        <TableCell className="font-mono text-xs font-bold text-foreground tabular-nums">
                                            {formatRupiah(invoice.total_amount)}
                                        </TableCell>

                                        {/* Due Date / Paid Date */}
                                        <TableCell className="text-xs">
                                            {invoice.status === 'paid' && invoice.paid_at ? (
                                                <span className="font-medium text-emerald-700 dark:text-emerald-400">Lunas {invoice.paid_at}</span>
                                            ) : (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Calendar className="size-3" />
                                                    <span>{invoice.due_date}</span>
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <div className="flex flex-col items-start gap-1">
                                                <Badge variant="outline" className={cn('text-[11px] font-medium', statusConfig.className)}>
                                                    <StatusIcon className="mr-1 size-3" />
                                                    {invoice.status_label || statusConfig.label}
                                                </Badge>
                                                {isRejected && (
                                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                                        <ShieldAlert className="size-3" /> Bukti Ditolak
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onViewDetail(invoice)}
                                                    className="h-7 px-2 text-xs"
                                                >
                                                    <FileText className="mr-1 size-3.5" />
                                                    Rincian
                                                </Button>

                                                {isUnpaidOrPending && onUploadProof && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => onUploadProof(invoice)}
                                                        className={cn(
                                                            'h-7 px-2.5 text-xs shadow-2xs',
                                                            isRejected
                                                                ? 'bg-rose-600 text-white hover:bg-rose-700'
                                                                : 'bg-primary text-primary-foreground',
                                                        )}
                                                    >
                                                        <UploadCloud className="mr-1 size-3.5" />
                                                        {isRejected ? 'Unggah Ulang' : 'Bayar'}
                                                    </Button>
                                                )}
                                            </div>
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
                        <span className="font-semibold text-foreground">{pagination.total}</span> faktur
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
