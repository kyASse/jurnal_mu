import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { DoiActiveInvoiceData, DoiBankAccountData, DoiInvoiceDetailData } from '@/types/doi';
import { Building2, Calendar, CreditCard, DollarSign, FileText, Loader2, Send, User } from 'lucide-react';
import * as React from 'react';
import { DoiPaymentProofDropzone } from './DoiPaymentProofDropzone';

interface DoiPaymentProofFormProps {
    invoice: DoiInvoiceDetailData | DoiActiveInvoiceData;
    bankAccounts: DoiBankAccountData[];
    onSubmit: (formData: FormData) => void;
    isSubmitting?: boolean;
    errors?: Record<string, string>;
    onCancel?: () => void;
    className?: string;
}

export function DoiPaymentProofForm({
    invoice,
    bankAccounts,
    onSubmit,
    isSubmitting = false,
    errors = {},
    onCancel,
    className,
}: DoiPaymentProofFormProps) {
    const today = new Date().toISOString().split('T')[0];

    const [bankSender, setBankSender] = React.useState('');
    const [accountName, setAccountName] = React.useState('');
    const [bankDestinationId, setBankDestinationId] = React.useState<string>(bankAccounts.length > 0 ? String(bankAccounts[0].id) : '');
    const [transferAmount, setTransferAmount] = React.useState<string>(invoice.total_amount ? String(invoice.total_amount) : '');
    const [transferDate, setTransferDate] = React.useState<string>(today);
    const [notes, setNotes] = React.useState('');
    const [proofFile, setProofFile] = React.useState<File | null>(null);

    // If bankAccounts changes and no bankDestinationId selected yet
    React.useEffect(() => {
        if (!bankDestinationId && bankAccounts.length > 0) {
            setBankDestinationId(String(bankAccounts[0].id));
        }
    }, [bankAccounts, bankDestinationId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('bank_sender', bankSender);
        formData.append('account_name', accountName);
        formData.append('bank_destination_id', bankDestinationId);
        formData.append('transfer_amount', transferAmount);
        formData.append('transfer_date', transferDate);
        if (notes.trim()) {
            formData.append('notes', notes.trim());
        }
        if (proofFile) {
            formData.append('payment_proof', proofFile);
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={cn('space-y-4 text-foreground', className)}>
            {/* Bank Destination */}
            <div className="space-y-1.5">
                <Label htmlFor="bank_destination_id" className="flex items-center gap-1.5 text-xs font-semibold">
                    <Building2 className="size-3.5 text-muted-foreground" />
                    Rekening Tujuan Pembayaran <span className="text-rose-500">*</span>
                </Label>
                <Select
                    value={bankDestinationId}
                    onValueChange={(val) => setBankDestinationId(val)}
                    disabled={isSubmitting || bankAccounts.length === 0}
                >
                    <SelectTrigger id="bank_destination_id" className="w-full text-xs sm:text-sm">
                        <SelectValue placeholder="Pilih Bank Tujuan" />
                    </SelectTrigger>
                    <SelectContent>
                        {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={String(account.id)} className="text-xs sm:text-sm">
                                {account.bank_name} - {account.account_number} ({account.account_holder})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.bank_destination_id && <p className="text-xs text-rose-600">{errors.bank_destination_id}</p>}
            </div>

            {/* Bank Sender & Account Name in 2 Cols */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="bank_sender" className="flex items-center gap-1.5 text-xs font-semibold">
                        <CreditCard className="size-3.5 text-muted-foreground" />
                        Nama Bank Pengirim <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="bank_sender"
                        type="text"
                        placeholder="Contoh: BCA, Mandiri, BSI"
                        value={bankSender}
                        onChange={(e) => setBankSender(e.target.value)}
                        disabled={isSubmitting}
                        className="text-xs sm:text-sm"
                        required
                    />
                    {errors.bank_sender && <p className="text-xs text-rose-600">{errors.bank_sender}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="account_name" className="flex items-center gap-1.5 text-xs font-semibold">
                        <User className="size-3.5 text-muted-foreground" />
                        Nama Pemilik Rekening Pengirim <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="account_name"
                        type="text"
                        placeholder="Nama sesuai buku rekening"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        disabled={isSubmitting}
                        className="text-xs sm:text-sm"
                        required
                    />
                    {errors.account_name && <p className="text-xs text-rose-600">{errors.account_name}</p>}
                </div>
            </div>

            {/* Transfer Amount & Transfer Date */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="transfer_amount" className="flex items-center gap-1.5 text-xs font-semibold">
                        <DollarSign className="size-3.5 text-muted-foreground" />
                        Nominal Transfer (Rp) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="transfer_amount"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Contoh: 1500000"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        disabled={isSubmitting}
                        className="font-mono text-xs sm:text-sm"
                        required
                    />
                    {errors.transfer_amount && <p className="text-xs text-rose-600">{errors.transfer_amount}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="transfer_date" className="flex items-center gap-1.5 text-xs font-semibold">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        Tanggal Transfer <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="transfer_date"
                        type="date"
                        max={today}
                        value={transferDate}
                        onChange={(e) => setTransferDate(e.target.value)}
                        disabled={isSubmitting}
                        className="text-xs sm:text-sm"
                        required
                    />
                    {errors.transfer_date && <p className="text-xs text-rose-600">{errors.transfer_date}</p>}
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
                <Label htmlFor="notes" className="flex items-center gap-1.5 text-xs font-semibold">
                    <FileText className="size-3.5 text-muted-foreground" />
                    Catatan Tambahan (Opsional)
                </Label>
                <Textarea
                    id="notes"
                    rows={2}
                    placeholder="Contoh: Transfer melalui m-banking BSI ref #987654"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isSubmitting}
                    className="resize-none text-xs sm:text-sm"
                />
                {errors.notes && <p className="text-xs text-rose-600">{errors.notes}</p>}
            </div>

            {/* Dropzone for Payment Proof */}
            <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-semibold">
                    Unggah Bukti Struk/Slip Transfer <span className="text-rose-500">*</span>
                </Label>
                <DoiPaymentProofDropzone value={proofFile} onChange={setProofFile} error={errors.payment_proof} disabled={isSubmitting} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting} className="text-xs">
                        Batal
                    </Button>
                )}

                <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || !proofFile || !bankSender.trim() || !accountName.trim() || !transferAmount}
                    className="text-xs"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            Mengunggah...
                        </>
                    ) : (
                        <>
                            <Send className="mr-1.5 size-3.5" />
                            Kirim Bukti Pembayaran
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
