import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { DoiActiveInvoiceData, DoiBankAccountData, DoiPaymentProofData, DoiSubscriptionData } from '@/types/doi';
import { AlertCircle, AlertTriangle, Building2, Check, CheckCircle2, Clock, Receipt, ShieldCheck, User, XCircle } from 'lucide-react';
import * as React from 'react';
import { formatRupiah } from '../invoices/DoiInvoiceStatsCard';
import { DoiDocumentViewer } from './DoiDocumentViewer';

export interface DoiVerificationDrawerProof extends DoiPaymentProofData {
    invoice?: DoiActiveInvoiceData & {
        university?: { id: number; name: string; short_name?: string; code?: string };
        subscription?: DoiSubscriptionData & { package?: { name: string; code?: string } };
    };
}

interface DoiVerificationDrawerProps {
    proof: DoiVerificationDrawerProof | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove?: (proofId: number, adminNotes?: string) => void;
    onReject?: (proofId: number, adminNotes: string) => void;
    isSubmitting?: boolean;
    className?: string;
}

export function DoiVerificationDrawer({
    proof,
    open,
    onOpenChange,
    onApprove,
    onReject,
    isSubmitting = false,
    className,
}: DoiVerificationDrawerProps) {
    const [adminNotes, setAdminNotes] = React.useState<string>('');
    const [rejectError, setRejectError] = React.useState<string | null>(null);
    const [showApproveConfirm, setShowApproveConfirm] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (open && proof) {
            setAdminNotes(proof.admin_notes || '');
            setRejectError(null);
            setShowApproveConfirm(false);
        }
    }, [open, proof]);

    if (!proof) return null;

    const invoice = proof.invoice;
    const transferAmount = Number(proof.transfer_amount) || 0;
    const invoiceTotal = Number(invoice?.total_amount) || 0;
    const difference = transferAmount - invoiceTotal;
    const isExactMatch = invoiceTotal > 0 && transferAmount === invoiceTotal;
    const isOverpaid = invoiceTotal > 0 && transferAmount > invoiceTotal;
    const isUnderpaid = invoiceTotal > 0 && transferAmount < invoiceTotal;

    // Stream URL for document proof
    const documentUrl = proof.id ? `/admin/doi-management/payment-proofs/${proof.id}/stream` : proof.file_path || null;

    const handleApprove = () => {
        if (onApprove) {
            onApprove(proof.id, adminNotes);
        }
    };

    const handleReject = () => {
        if (!adminNotes.trim()) {
            setRejectError('Catatan admin wajib diisi ketika menolak bukti pembayaran agar institusi mengetahui alasannya.');
            return;
        }
        setRejectError(null);
        if (onReject) {
            onReject(proof.id, adminNotes.trim());
        }
    };

    const bankDest =
        typeof proof.bank_destination === 'object' && proof.bank_destination !== null ? (proof.bank_destination as DoiBankAccountData) : null;

    const bankDestName = bankDest?.bank_name || (typeof proof.bank_destination === 'string' ? proof.bank_destination : 'Rekening Resmi');
    const bankDestNumber = bankDest?.account_number || '';
    const bankDestHolder = bankDest?.account_holder || '';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    'flex w-full flex-col overflow-hidden p-0 sm:max-w-3xl sm:border-l md:max-w-4xl lg:max-w-5xl xl:max-w-6xl dark:border-slate-800',
                    className,
                )}
            >
                {/* Header */}
                <SheetHeader className="border-b bg-muted/40 px-6 py-4 dark:bg-muted/10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div>
                                <SheetTitle className="text-base font-bold text-foreground">Verifikasi Pembayaran #{proof.id}</SheetTitle>
                                <SheetDescription className="text-xs">
                                    Faktur: {invoice?.invoice_number || '-'} &bull; Diajukan pada {proof.created_at}
                                </SheetDescription>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                            {proof.status === 'approved' ? (
                                <Badge
                                    variant="outline"
                                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                >
                                    <CheckCircle2 className="mr-1 size-3" /> Disetujui
                                </Badge>
                            ) : proof.status === 'rejected' ? (
                                <Badge
                                    variant="outline"
                                    className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                >
                                    <XCircle className="mr-1 size-3" /> Ditolak
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                >
                                    <Clock className="mr-1 size-3" /> Menunggu Verifikasi
                                </Badge>
                            )}
                        </div>
                    </div>
                </SheetHeader>

                {/* Main Split-View Content Area */}
                <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-12 lg:divide-x dark:divide-slate-800">
                    {/* Left Column: Interactive Document Viewer (7 cols on lg) */}
                    <div className="flex flex-col bg-slate-950/95 p-4 lg:col-span-7">
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                            <span className="font-semibold tracking-wider uppercase">Berkas Bukti Transfer</span>
                            <span className="text-[11px] text-slate-400">Gunakan tombol zoom & rotasi untuk inspeksi detail</span>
                        </div>

                        <div className="flex-1">
                            <DoiDocumentViewer
                                src={documentUrl}
                                fileName={proof.file_name}
                                mimeType={proof.mime_type}
                                fileSize={proof.file_size}
                                maxHeight="calc(100vh - 200px)"
                            />
                        </div>
                    </div>

                    {/* Right Column: Review Details & Decision Panel (5 cols on lg) */}
                    <div className="flex flex-col justify-between space-y-6 overflow-y-auto bg-card p-5 lg:col-span-5">
                        <div className="space-y-5">
                            {/* Institution & Invoice Meta Card */}
                            <div className="space-y-3 rounded-xl border border-slate-200 bg-muted/30 p-3.5 text-xs dark:border-slate-800 dark:bg-muted/10">
                                <div className="flex items-start gap-2.5">
                                    <Building2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <div>
                                        <span className="text-muted-foreground">Institusi / PTMA:</span>
                                        <p className="font-bold text-foreground">{invoice?.university?.name || 'Universitas Muhammadiyah'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <Receipt className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <div>
                                        <span className="text-muted-foreground">Paket Langganan:</span>
                                        <p className="font-semibold text-foreground">
                                            {invoice?.subscription?.package?.name || 'Paket DOI Crossref'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <User className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <div>
                                        <span className="text-muted-foreground">Pengunggah:</span>
                                        <p className="font-medium text-foreground">
                                            {proof.user?.name || '-'} ({proof.user?.email || '-'})
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Nominal Comparison Card */}
                            <div className="rounded-xl border border-slate-200 bg-muted/20 p-4 dark:border-slate-800 dark:bg-muted/10">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Komparasi Nominal</span>
                                    {isExactMatch && (
                                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                            <Check className="mr-1 size-3" /> MATCH TEPAT
                                        </Badge>
                                    )}
                                    {isOverpaid && (
                                        <Badge className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                            <Check className="mr-1 size-3" /> LEBIH BAYAR
                                        </Badge>
                                    )}
                                    {isUnderpaid && (
                                        <Badge variant="destructive" className="bg-rose-600 text-white">
                                            <AlertTriangle className="mr-1 size-3" /> KURANG BAYAR
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="rounded-lg border bg-background p-2.5">
                                        <span className="text-[11px] text-muted-foreground">Nominal Ditransfer:</span>
                                        <p className="font-mono text-base font-bold text-foreground tabular-nums">{formatRupiah(transferAmount)}</p>
                                    </div>
                                    <div className="rounded-lg border bg-background p-2.5">
                                        <span className="text-[11px] text-muted-foreground">Total Tagihan Faktur:</span>
                                        <p className="font-mono text-base font-bold text-primary tabular-nums">{formatRupiah(invoiceTotal)}</p>
                                    </div>
                                </div>

                                {difference !== 0 && (
                                    <div className="mt-2.5 text-[11px]">
                                        <span className="text-muted-foreground">Selisih: </span>
                                        <span
                                            className={cn(
                                                'font-mono font-semibold tabular-nums',
                                                difference > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400',
                                            )}
                                        >
                                            {difference > 0 ? `+ ${formatRupiah(difference)}` : `- ${formatRupiah(Math.abs(difference))}`}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Bank Details Card */}
                            <div className="space-y-2 rounded-xl border border-slate-200 bg-muted/20 p-3.5 text-xs dark:border-slate-800 dark:bg-muted/10">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Detail Rekening Transfer</span>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <div>
                                        <span className="text-muted-foreground">Bank Pengirim:</span>
                                        <p className="font-semibold text-foreground">{proof.bank_sender}</p>
                                        <p className="text-[11px] text-muted-foreground">a.n. {proof.account_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Bank Tujuan:</span>
                                        <p className="font-semibold text-foreground">{bankDestName}</p>
                                        {bankDestNumber && (
                                            <p className="font-mono text-[11px] text-muted-foreground">
                                                {bankDestNumber} (a.n. {bankDestHolder})
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-1 text-[11px]">
                                    <span className="text-muted-foreground">Tanggal Transfer: </span>
                                    <span className="font-semibold text-foreground">{proof.transfer_date}</span>
                                </div>
                            </div>

                            {/* Verification Notes */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="admin_notes" className="text-xs font-semibold text-foreground">
                                        Catatan Verifikasi Admin
                                    </Label>
                                    <span className="text-[11px] text-muted-foreground">(Wajib jika ditolak)</span>
                                </div>
                                <Textarea
                                    id="admin_notes"
                                    placeholder="Tuliskan catatan verifikasi (misal: Bukti cocok dan dana terkonfirmasi di rekening, atau Alasan penolakan jika ditolak)..."
                                    value={adminNotes}
                                    onChange={(e) => {
                                        setAdminNotes(e.target.value);
                                        if (rejectError) setRejectError(null);
                                    }}
                                    rows={3}
                                    className={cn('text-xs', rejectError && 'border-rose-500 focus-visible:ring-rose-500')}
                                />
                                {rejectError && (
                                    <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                                        <AlertCircle className="size-3" />
                                        {rejectError}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons Section */}
                        <div className="space-y-2 border-t pt-4 dark:border-slate-800">
                            {proof.status === 'pending' ? (
                                <>
                                    {showApproveConfirm ? (
                                        <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
                                            <p className="font-semibold text-emerald-900 dark:text-emerald-200">Konfirmasi Persetujuan Pembayaran?</p>
                                            <p className="text-emerald-800/80 dark:text-emerald-300/80">
                                                Faktur akan ditandai LUNAS dan langganan DOI institusi akan diaktifkan secara otomatis.
                                            </p>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    disabled={isSubmitting}
                                                    onClick={handleApprove}
                                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                >
                                                    <Check className="mr-1.5 size-3.5" />
                                                    {isSubmitting ? 'Memproses...' : 'Ya, Setujui Sekarang'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isSubmitting}
                                                    onClick={() => setShowApproveConfirm(false)}
                                                >
                                                    Batal
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={isSubmitting}
                                                onClick={handleReject}
                                                className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950"
                                            >
                                                <XCircle className="mr-1.5 size-4" />
                                                Tolak Bukti
                                            </Button>

                                            <Button
                                                type="button"
                                                disabled={isSubmitting}
                                                onClick={() => setShowApproveConfirm(true)}
                                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                            >
                                                <CheckCircle2 className="mr-1.5 size-4" />
                                                Setujui & Aktifkan
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-xs text-muted-foreground">
                                    Bukti pembayaran ini telah berstatus{' '}
                                    <span className="font-semibold text-foreground">{proof.status === 'approved' ? 'Disetujui' : 'Ditolak'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
