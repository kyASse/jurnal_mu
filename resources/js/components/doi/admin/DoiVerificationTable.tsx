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
import { DoiPaymentProofData } from '@/types/doi';
import { DoiVerificationDrawerProof } from './DoiVerificationDrawer';
import { formatRupiah } from './DoiAdminStatsCards';
import {
    Search,
    ShieldCheck,
    Clock,
    CheckCircle2,
    Calendar,
    Building2,
    Receipt,
    ArrowRight,
    Sparkles,
    FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoiVerificationTableProps {
    pendingProofs: DoiVerificationDrawerProof[];
    onReviewProof: (proof: DoiVerificationDrawerProof) => void;
    isLoading?: boolean;
    className?: string;
}

export function DoiVerificationTable({
    pendingProofs,
    onReviewProof,
    isLoading = false,
    className,
}: DoiVerificationTableProps) {
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredProofs = React.useMemo(() => {
        if (!searchQuery.trim()) return pendingProofs;
        const q = searchQuery.toLowerCase();
        return pendingProofs.filter((proof) => {
            const invoiceNum = proof.invoice?.invoice_number?.toLowerCase() || '';
            const univName = proof.invoice?.university?.name?.toLowerCase() || '';
            const senderName = proof.account_name?.toLowerCase() || '';
            const uploaderName = proof.user?.name?.toLowerCase() || '';
            const bankSender = proof.bank_sender?.toLowerCase() || '';

            return (
                invoiceNum.includes(q) ||
                univName.includes(q) ||
                senderName.includes(q) ||
                uploaderName.includes(q) ||
                bankSender.includes(q)
            );
        });
    }, [pendingProofs, searchQuery]);

    return (
        <div className={cn('space-y-4', className)}>
            {/* Header & Filter Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                        <Clock className="size-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-foreground">
                                Antrean Verifikasi Pembayaran
                            </h3>
                            {pendingProofs.length > 0 && (
                                <Badge variant="secondary" className="font-mono text-xs font-semibold">
                                    {pendingProofs.length} Menunggu
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tinjau berkas transfer dan konfirmasi aktivasi paket langganan DOI Crossref
                        </p>
                    </div>
                </div>

                {/* Search input */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Cari faktur, PTMA, atau pengirim..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 pr-3 text-xs"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-card shadow-xs dark:border-slate-800">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[140px] text-xs font-semibold">Faktur & Tanggal</TableHead>
                            <TableHead className="text-xs font-semibold">Institusi / PTMA</TableHead>
                            <TableHead className="text-xs font-semibold">Pengirim & Bank</TableHead>
                            <TableHead className="text-xs font-semibold">Nominal Transfer</TableHead>
                            <TableHead className="text-xs font-semibold">Status</TableHead>
                            <TableHead className="text-right text-xs font-semibold">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                                    Memuat antrean verifikasi...
                                </TableCell>
                            </TableRow>
                        ) : filteredProofs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12 text-center">
                                    {pendingProofs.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                <CheckCircle2 className="size-6" />
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">
                                                Tidak Ada Antrean Verifikasi
                                            </p>
                                            <p className="max-w-md text-xs text-muted-foreground">
                                                Semua bukti pembayaran telah diverifikasi dan disetujui. Bukti baru akan muncul di sini saat diunggah pengelola jurnal.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground">
                                            Tidak ditemukan bukti pembayaran yang cocok dengan pencarian.
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProofs.map((proof) => {
                                const invoice = proof.invoice;
                                const univ = invoice?.university;
                                const isMismatch =
                                    invoice?.total_amount &&
                                    Number(proof.transfer_amount) !== Number(invoice.total_amount);

                                return (
                                    <TableRow
                                        key={proof.id}
                                        className="cursor-pointer transition-colors hover:bg-muted/40"
                                        onClick={() => onReviewProof(proof)}
                                    >
                                        {/* Invoice & Date */}
                                        <TableCell className="text-xs">
                                            <div className="space-y-0.5">
                                                <span className="font-mono font-bold text-foreground">
                                                    {invoice?.invoice_number || `Bukti #${proof.id}`}
                                                </span>
                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Calendar className="size-3" />
                                                    <span>{proof.transfer_date}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* University & Package */}
                                        <TableCell className="text-xs">
                                            <div className="space-y-0.5">
                                                <p className="font-medium text-foreground">
                                                    {univ?.name || 'Universitas Muhammadiyah'}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {invoice?.subscription?.package?.name || 'Langganan DOI'}
                                                </p>
                                            </div>
                                        </TableCell>

                                        {/* Sender & Bank */}
                                        <TableCell className="text-xs">
                                            <div className="space-y-0.5">
                                                <p className="font-medium text-foreground">
                                                    {proof.account_name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Bank {proof.bank_sender}
                                                </p>
                                            </div>
                                        </TableCell>

                                        {/* Transfer Amount */}
                                        <TableCell className="text-xs">
                                            <div className="space-y-0.5">
                                                <p className="font-mono font-bold text-foreground tabular-nums">
                                                    {formatRupiah(proof.transfer_amount)}
                                                </p>
                                                {invoice?.total_amount && (
                                                    <p
                                                        className={cn(
                                                            'font-mono text-[11px] tabular-nums',
                                                            isMismatch
                                                                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                                                : 'text-muted-foreground'
                                                        )}
                                                    >
                                                        Tagihan: {formatRupiah(invoice.total_amount)}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className="border-amber-200 bg-amber-50 text-[11px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                            >
                                                <Clock className="mr-1 size-3" />
                                                Menunggu Verifikasi
                                            </Badge>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => onReviewProof(proof)}
                                                className="h-7 bg-primary px-3 text-xs text-primary-foreground shadow-2xs hover:bg-primary/90"
                                            >
                                                <ShieldCheck className="mr-1.5 size-3.5" />
                                                Review & Verifikasi
                                            </Button>
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
