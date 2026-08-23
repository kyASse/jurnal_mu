import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { DoiBankAccountData, DoiInvoiceDetailData, InvoiceStatusType } from '@/types/doi';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, CreditCard, History, Receipt, XCircle } from 'lucide-react';
import * as React from 'react';
import { DoiBankAccountsCard } from './DoiBankAccountsCard';
import { formatRupiah } from './DoiInvoiceStatsCard';
import { DoiPaymentProofForm } from './DoiPaymentProofForm';
import { DoiVerificationTimeline } from './DoiVerificationTimeline';

interface DoiInvoiceDetailDrawerProps {
    invoice: DoiInvoiceDetailData | null;
    bankAccounts: DoiBankAccountData[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialTab?: 'detail' | 'pay' | 'history';
    onSubmitPaymentProof?: (formData: FormData) => void;
    isSubmitting?: boolean;
    errors?: Record<string, string>;
    onViewProofFile?: (proofId: number) => void;
    className?: string;
}

function getInvoiceStatusBadge(status?: InvoiceStatusType) {
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

export function DoiInvoiceDetailDrawer({
    invoice,
    bankAccounts,
    open,
    onOpenChange,
    initialTab = 'detail',
    onSubmitPaymentProof,
    isSubmitting = false,
    errors = {},
    onViewProofFile,
    className,
}: DoiInvoiceDetailDrawerProps) {
    const [activeTab, setActiveTab] = React.useState<'detail' | 'pay' | 'history'>(initialTab);

    React.useEffect(() => {
        if (open) {
            setActiveTab(initialTab);
        }
    }, [open, initialTab]);

    if (!invoice) return null;

    const statusBadge = getInvoiceStatusBadge(invoice.status);
    const StatusIcon = statusBadge.icon;
    const isPaid = invoice.status === 'paid';
    const canPay = (invoice.status === 'unpaid' || invoice.status === 'pending_verification') && !isPaid;
    const hasProofs = invoice.payment_proofs && invoice.payment_proofs.length > 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn('flex w-full flex-col overflow-hidden p-0 sm:max-w-xl sm:border-l md:max-w-2xl dark:border-slate-800', className)}
            >
                {/* Header */}
                <SheetHeader className="border-b bg-muted/30 px-6 py-4 dark:bg-muted/10">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Receipt className="size-5" />
                            </div>
                            <div>
                                <SheetTitle className="text-base font-bold text-foreground">Faktur {invoice.invoice_number}</SheetTitle>
                                <SheetDescription className="text-xs">
                                    {invoice.package?.name || invoice.package_name || 'Langganan DOI Crossref'}
                                </SheetDescription>
                            </div>
                        </div>

                        <Badge variant="outline" className={cn('text-xs font-medium', statusBadge.className)}>
                            <StatusIcon className="mr-1 size-3" />
                            {invoice.status_label || statusBadge.label}
                        </Badge>
                    </div>

                    {/* Navigation tabs inside drawer */}
                    <div className="mt-3 flex items-center gap-1 border-t pt-2">
                        <Button
                            type="button"
                            variant={activeTab === 'detail' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('detail')}
                            className="h-8 text-xs font-medium"
                        >
                            <Receipt className="mr-1.5 size-3.5" />
                            Rincian Faktur
                        </Button>

                        {canPay && onSubmitPaymentProof && (
                            <Button
                                type="button"
                                variant={activeTab === 'pay' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('pay')}
                                className="h-8 text-xs font-medium"
                            >
                                <CreditCard className="mr-1.5 size-3.5" />
                                Pembayaran
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant={activeTab === 'history' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('history')}
                            className="h-8 text-xs font-medium"
                        >
                            <History className="mr-1.5 size-3.5" />
                            Riwayat Verifikasi {hasProofs ? `(${invoice.payment_proofs?.length})` : ''}
                        </Button>
                    </div>
                </SheetHeader>

                {/* Content area with smooth scrolling */}
                <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
                    {/* DETAIL TAB */}
                    {activeTab === 'detail' && (
                        <div className="space-y-5">
                            {/* Invoice Meta Grid */}
                            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-3 text-xs dark:bg-muted/10">
                                <div>
                                    <span className="text-muted-foreground">Periode Langganan:</span>
                                    <p className="font-semibold text-foreground">
                                        {invoice.period_start || '-'} s.d. {invoice.period_end || '-'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Batas Waktu Pembayaran:</span>
                                    <p className="font-semibold text-foreground">{invoice.due_date}</p>
                                </div>
                                {invoice.university_name && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">Institusi:</span>
                                        <p className="font-medium text-foreground">{invoice.university_name}</p>
                                    </div>
                                )}
                                {invoice.paid_at && (
                                    <div className="col-span-2 font-medium text-emerald-600 dark:text-emerald-400">
                                        Lunas dibayar pada: {invoice.paid_at}
                                    </div>
                                )}
                            </div>

                            {/* Item breakdown table */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Item Tagihan</h4>
                                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b bg-muted/50 font-semibold text-foreground">
                                            <tr>
                                                <th className="p-2.5">Deskripsi</th>
                                                <th className="p-2.5 text-center">Jml</th>
                                                <th className="p-2.5 text-right">Harga Satuan</th>
                                                <th className="p-2.5 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-muted-foreground">
                                            {invoice.items && invoice.items.length > 0 ? (
                                                invoice.items.map((item, idx) => (
                                                    <tr key={item.id || idx}>
                                                        <td className="p-2.5 font-medium text-foreground">{item.description}</td>
                                                        <td className="p-2.5 text-center font-mono">{item.quantity}</td>
                                                        <td className="p-2.5 text-right font-mono tabular-nums">{formatRupiah(item.unit_price)}</td>
                                                        <td className="p-2.5 text-right font-mono font-medium text-foreground tabular-nums">
                                                            {formatRupiah(item.total_price)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                                        Tidak ada rincian item tambahan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Calculation Summary */}
                            <div className="space-y-1.5 rounded-lg border bg-muted/10 p-3 text-xs">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal:</span>
                                    <span className="font-mono tabular-nums">{formatRupiah(invoice.subtotal)}</span>
                                </div>
                                {Number(invoice.discount) > 0 && (
                                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                        <span>Potongan Diskon:</span>
                                        <span className="font-mono tabular-nums">- {formatRupiah(invoice.discount)}</span>
                                    </div>
                                )}
                                {Number(invoice.tax) > 0 && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>PPN / Pajak:</span>
                                        <span className="font-mono tabular-nums">{formatRupiah(invoice.tax)}</span>
                                    </div>
                                )}
                                <Separator className="my-1.5" />
                                <div className="flex justify-between text-sm font-bold text-foreground">
                                    <span>Total Tagihan:</span>
                                    <span className="font-mono text-base text-primary tabular-nums">{formatRupiah(invoice.total_amount)}</span>
                                </div>
                            </div>

                            {/* Bank transfer info shortcut */}
                            {!isPaid && <DoiBankAccountsCard bankAccounts={bankAccounts} invoiceNumber={invoice.invoice_number} />}
                        </div>
                    )}

                    {/* PAY TAB */}
                    {activeTab === 'pay' && onSubmitPaymentProof && (
                        <div className="space-y-5">
                            <DoiBankAccountsCard bankAccounts={bankAccounts} invoiceNumber={invoice.invoice_number} />

                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Formulir Konfirmasi Pembayaran
                                </h4>
                                <DoiPaymentProofForm
                                    invoice={invoice}
                                    bankAccounts={bankAccounts}
                                    onSubmit={onSubmitPaymentProof}
                                    isSubmitting={isSubmitting}
                                    errors={errors}
                                />
                            </div>
                        </div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Log Verifikasi Pembayaran</h4>
                            <DoiVerificationTimeline paymentProofs={invoice.payment_proofs} onViewProof={onViewProofFile} />
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
