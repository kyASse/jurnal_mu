import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DoiPaymentProofData, PaymentProofStatusType } from '@/types/doi';
import { CheckCircle2, Clock, FileText, ShieldAlert, XCircle } from 'lucide-react';
import { formatRupiah } from './DoiInvoiceStatsCard';

interface DoiVerificationTimelineProps {
    paymentProofs?: DoiPaymentProofData[];
    onViewProof?: (proofId: number) => void;
    className?: string;
}

function getStatusBadgeConfig(status: PaymentProofStatusType) {
    switch (status) {
        case 'approved':
            return {
                label: 'Diterima & Terverifikasi',
                className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
                icon: CheckCircle2,
                dotColor: 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-950',
            };
        case 'rejected':
            return {
                label: 'Ditolak',
                className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
                icon: XCircle,
                dotColor: 'bg-rose-500 ring-rose-100 dark:ring-rose-950',
            };
        case 'pending':
        default:
            return {
                label: 'Menunggu Verifikasi',
                className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
                icon: Clock,
                dotColor: 'bg-blue-500 ring-blue-100 dark:ring-blue-950',
            };
    }
}

export function DoiVerificationTimeline({ paymentProofs = [], onViewProof, className }: DoiVerificationTimelineProps) {
    if (!paymentProofs || paymentProofs.length === 0) {
        return (
            <div className={cn('flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center', className)}>
                <Clock className="mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">Belum ada riwayat pembayaran</p>
                <p className="text-xs text-muted-foreground">Bukti pembayaran yang diunggah akan muncul dan terlacak di sini.</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            <div className="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {paymentProofs.map((proof, idx) => {
                    const statusConfig = getStatusBadgeConfig(proof.status);
                    const StatusIcon = statusConfig.icon;
                    const destinationName = typeof proof.bank_destination === 'string' ? proof.bank_destination : proof.bank_destination?.bank_name;

                    return (
                        <div key={proof.id || idx} className="relative space-y-2">
                            {/* Timeline bullet */}
                            <span
                                className={cn(
                                    'absolute top-1 -left-6 flex size-5 items-center justify-center rounded-full ring-4 ring-offset-background',
                                    statusConfig.dotColor,
                                )}
                            >
                                <span className="size-2 rounded-full bg-white" />
                            </span>

                            {/* Content box */}
                            <div className="rounded-lg border border-slate-200 bg-card p-3.5 shadow-2xs dark:border-slate-800">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={cn('text-[11px] font-medium', statusConfig.className)}>
                                            <StatusIcon className="mr-1 size-3" />
                                            {proof.status_label || statusConfig.label}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{proof.created_at}</span>
                                    </div>

                                    {onViewProof && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onViewProof(proof.id)}
                                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            <FileText className="mr-1 size-3.5" />
                                            Lihat File ({proof.file_name})
                                        </Button>
                                    )}
                                </div>

                                {/* Proof Transfer Details */}
                                <div className="mt-3 grid grid-cols-1 gap-2 rounded-md bg-muted/40 p-2.5 text-xs sm:grid-cols-2 dark:bg-muted/10">
                                    <div>
                                        <span className="text-muted-foreground">Pengirim:</span>
                                        <p className="font-semibold text-foreground">
                                            {proof.bank_sender} - {proof.account_name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Nominal Ditransfer:</span>
                                        <p className="font-mono font-bold text-foreground">{formatRupiah(proof.transfer_amount)}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Bank Tujuan PPM:</span>
                                        <p className="font-medium text-foreground">{destinationName || 'Rekening PPM'}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Tanggal Transfer:</span>
                                        <p className="font-medium text-foreground">{proof.transfer_date}</p>
                                    </div>
                                </div>

                                {/* Rejection Note Box */}
                                {proof.status === 'rejected' && (
                                    <div className="mt-3 rounded-md border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                                        <div className="flex items-start gap-2">
                                            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                            <div className="space-y-1">
                                                <p className="font-semibold text-rose-950 dark:text-rose-100">
                                                    Catatan Penolakan oleh Administrator:
                                                </p>
                                                <p className="italic">
                                                    "
                                                    {proof.admin_notes ||
                                                        'Bukti pembayaran tidak memenuhi kriteria validasi. Harap unggah ulang struk bukti transfer yang jelas.'}
                                                    "
                                                </p>
                                                {proof.verified_at && (
                                                    <p className="text-[11px] text-rose-700 dark:text-rose-400">Ditinjau pada: {proof.verified_at}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Approved Confirmation Box */}
                                {proof.status === 'approved' && (
                                    <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50/60 p-2.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-200">
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                            <span>
                                                Pembayaran telah disetujui & diverifikasi oleh Admin PPM
                                                {proof.verified_at ? ` pada ${proof.verified_at}` : ''}.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
