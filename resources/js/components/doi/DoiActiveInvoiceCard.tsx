import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DoiActiveInvoiceData } from '@/types/doi';
import { Link } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Calendar, Clock, FileText, Receipt, ShieldAlert, UploadCloud } from 'lucide-react';

interface DoiActiveInvoiceCardProps {
    invoice: DoiActiveInvoiceData | null;
    onUploadProof?: (invoiceId: number) => void;
    onViewDetail?: (invoiceId: number) => void;
    isUserRole?: boolean;
    className?: string;
}

function formatRupiah(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
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

function getDaysUntilDue(dueDateStr?: string): number | null {
    if (!dueDateStr) return null;
    const dueDate = new Date(dueDateStr);
    if (isNaN(dueDate.getTime())) return null;
    const now = new Date();
    dueDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = dueDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function DoiActiveInvoiceCard({ invoice, onUploadProof, onViewDetail, isUserRole = false, className }: DoiActiveInvoiceCardProps) {
    if (!invoice) return null;

    const daysUntilDue = invoice.days_until_due ?? getDaysUntilDue(invoice.due_date);
    const isOverdue = invoice.is_overdue || (daysUntilDue !== null && daysUntilDue < 0);

    // Check if latest proof was rejected
    const latestProof = invoice.latest_payment_proof;
    const isProofRejected = latestProof?.status === 'rejected';
    const isPendingVerification = invoice.status === 'pending_verification' || latestProof?.status === 'pending';

    // Status styling
    const statusConfig = isProofRejected
        ? {
              label: 'Bukti Pembayaran Ditolak',
              badgeBg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
              borderStyle: 'border-rose-200 dark:border-rose-900/60',
              icon: AlertCircle,
          }
        : isPendingVerification
          ? {
                label: 'Menunggu Verifikasi',
                badgeBg: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
                borderStyle: 'border-blue-200 dark:border-blue-900/60',
                icon: Clock,
            }
          : isOverdue
            ? {
                  label: 'Jatuh Tempo Terlewat',
                  badgeBg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
                  borderStyle: 'border-rose-300 dark:border-rose-800',
                  icon: AlertTriangle,
              }
            : {
                  label: 'Menunggu Pembayaran',
                  badgeBg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
                  borderStyle: 'border-amber-200 dark:border-amber-900/60',
                  icon: Clock,
              };

    const invoiceRoute = isUserRole ? 'user.doi.invoices.index' : 'admin-kampus.doi.invoices.index';

    return (
        <Card className={cn('relative overflow-hidden shadow-xs transition-all hover:shadow-md', statusConfig.borderStyle, className)}>
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                            <Receipt className="size-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-foreground">Tagihan Aktif Langganan</CardTitle>
                            <CardDescription className="font-mono text-xs">{invoice.invoice_number}</CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn('text-[11px] font-medium', statusConfig.badgeBg)}>
                            <statusConfig.icon className="mr-1 size-3" />
                            {statusConfig.label}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Rejection Note Alert Banner if latest proof was rejected */}
                {isProofRejected && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-900 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
                        <div className="flex items-start gap-2">
                            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                            <div className="space-y-1">
                                <p className="font-semibold text-rose-950 dark:text-rose-100">Catatan Penolakan oleh Administrator:</p>
                                <p className="italic">
                                    "
                                    {latestProof?.admin_notes ||
                                        'Bukti transfer tidak sesuai dengan nominal tagihan atau tidak terbaca dengan jelas. Silakan unggah bukti transfer yang valid.'}
                                    "
                                </p>
                                <p className="pt-0.5 text-[11px] font-medium">Mohon periksa kembali dan unggah ulang bukti pembayaran yang benar.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Amount & Due Date summary */}
                <div className="flex flex-col justify-between gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center dark:bg-muted/10">
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Total Nominal Tagihan</span>
                        <p className="font-mono text-xl font-bold tracking-tight text-foreground tabular-nums sm:text-2xl">
                            {formatRupiah(invoice.total_amount)}
                        </p>
                    </div>

                    <div className="space-y-1 text-left sm:text-right">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground sm:justify-end">
                            <Calendar className="size-3" />
                            Batas Waktu Pembayaran
                        </span>
                        <div className="flex items-center gap-2 sm:justify-end">
                            <span className="text-xs font-medium text-foreground">{formatDateIndo(invoice.due_date)}</span>
                            {daysUntilDue !== null && (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'font-mono text-[11px] tabular-nums',
                                        isOverdue
                                            ? 'border-rose-300 bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-200'
                                            : daysUntilDue <= 3
                                              ? 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                                              : 'border-slate-200 bg-background text-muted-foreground dark:border-slate-700',
                                    )}
                                >
                                    {isOverdue
                                        ? `Terlewat ${Math.abs(daysUntilDue)} Hari`
                                        : daysUntilDue === 0
                                          ? 'Jatuh Tempo Hari Ini'
                                          : `${daysUntilDue} Hari Lagi`}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action CTAs */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    {onViewDetail ? (
                        <Button type="button" variant="outline" size="sm" onClick={() => onViewDetail(invoice.id)} className="text-xs shadow-2xs">
                            <FileText className="mr-1.5 size-3.5" />
                            Rincian Faktur
                        </Button>
                    ) : (
                        <Button asChild variant="outline" size="sm" className="text-xs shadow-2xs">
                            <Link href={route(invoiceRoute, { invoice_id: invoice.id })}>
                                <FileText className="mr-1.5 size-3.5" />
                                Rincian Faktur
                            </Link>
                        </Button>
                    )}

                    {onUploadProof ? (
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => onUploadProof(invoice.id)}
                            className={cn(
                                'text-xs shadow-2xs',
                                isProofRejected
                                    ? 'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90',
                            )}
                        >
                            <UploadCloud className="mr-1.5 size-3.5" />
                            {isProofRejected ? 'Unggah Ulang Bukti Bayar' : 'Bayar Sekarang'}
                        </Button>
                    ) : (
                        <Button
                            asChild
                            size="sm"
                            className={cn(
                                'text-xs shadow-2xs',
                                isProofRejected
                                    ? 'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90',
                            )}
                        >
                            <Link href={route(invoiceRoute, { invoice_id: invoice.id, action: 'pay' })}>
                                <UploadCloud className="mr-1.5 size-3.5" />
                                {isProofRejected ? 'Unggah Ulang Bukti Bayar' : 'Bayar Sekarang'}
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
