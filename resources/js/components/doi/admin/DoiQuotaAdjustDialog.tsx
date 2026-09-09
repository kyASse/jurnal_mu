import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AdjustQuotaFormData, DoiSubscriptionData, QuotaChangeType } from '@/types/doi';
import { AlertCircle, ArrowRight, Building2, Check, Sparkles } from 'lucide-react';
import * as React from 'react';

interface DoiQuotaAdjustDialogProps {
    subscription: DoiSubscriptionData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (subscriptionId: number, data: AdjustQuotaFormData) => void;
    isSubmitting?: boolean;
    className?: string;
}

export function DoiQuotaAdjustDialog({ subscription, open, onOpenChange, onConfirm, isSubmitting = false, className }: DoiQuotaAdjustDialogProps) {
    const [amount, setAmount] = React.useState<number | string>(50);
    const [changeType, setChangeType] = React.useState<QuotaChangeType>('adjustment');
    const [description, setDescription] = React.useState<string>('');
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (open) {
            setAmount(50);
            setChangeType('adjustment');
            setDescription('');
            setError(null);
        }
    }, [open, subscription]);

    if (!subscription) return null;

    const currentTotal = Number(subscription.similarity_quota_total) || 0;
    const currentUsed = Number(subscription.similarity_quota_used) || 0;
    const currentRemaining = Math.max(0, currentTotal - currentUsed);

    const numericAmount = Number(amount) || 0;
    const newTotal = Math.max(0, currentTotal + numericAmount);
    const newRemaining = Math.max(0, newTotal - currentUsed);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!numericAmount || numericAmount === 0) {
            setError('Jumlah penyesuaian kuota tidak boleh 0.');
            return;
        }

        if (!description.trim()) {
            setError('Catatan audit penyesuaian kuota wajib diisi.');
            return;
        }

        setError(null);
        onConfirm(subscription.id, {
            amount: numericAmount,
            change_type: changeType,
            description: description.trim(),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn('sm:max-w-md', className)}>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                                <Sparkles className="size-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-foreground">Penyesuaian Kuota Similarity</DialogTitle>
                                <DialogDescription className="text-xs">Kelola penambahan kuota pemeriksaan Turnitin untuk PTMA</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4 text-xs">
                        {/* Subscription Info Box */}
                        <div className="space-y-2 rounded-xl border border-slate-200 bg-muted/30 p-3 dark:border-slate-800 dark:bg-muted/10">
                            <div className="flex items-center gap-2">
                                <Building2 className="size-4 text-muted-foreground" />
                                <span className="font-semibold text-foreground">{subscription.university?.name || 'Universitas'}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 border-t pt-2 text-center text-[11px] dark:border-slate-800">
                                <div>
                                    <span className="text-muted-foreground">Total Kuota:</span>
                                    <p className="font-mono font-bold text-foreground">{currentTotal}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Terpakai:</span>
                                    <p className="font-mono font-bold text-foreground">{currentUsed}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Sisa Kuota:</span>
                                    <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{currentRemaining}</p>
                                </div>
                            </div>
                        </div>

                        {/* Change Type & Amount Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="change_type" className="text-xs font-semibold">
                                    Tipe Perubahan
                                </Label>
                                <Select value={changeType} onValueChange={(val) => setChangeType(val as QuotaChangeType)}>
                                    <SelectTrigger id="change_type" className="h-8 text-xs">
                                        <SelectValue placeholder="Pilih Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="adjustment">Penyesuaian Manual</SelectItem>
                                        <SelectItem value="allocation">Alokasi / Bonus</SelectItem>
                                        <SelectItem value="renewal">Perpanjangan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="amount" className="text-xs font-semibold">
                                    Jumlah Kuota (+/-)
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="1"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="50"
                                    className="h-8 font-mono text-xs"
                                />
                            </div>
                        </div>

                        {/* Calculation Preview */}
                        <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-3 text-indigo-950 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-100">
                            <div className="flex items-center justify-between text-xs">
                                <span>Simulasi Kuota Total:</span>
                                <div className="flex items-center gap-2 font-mono font-bold">
                                    <span>{currentTotal}</span>
                                    <ArrowRight className="size-3.5" />
                                    <span className="text-sm text-indigo-600 dark:text-indigo-400">
                                        {newTotal} ({numericAmount >= 0 ? `+${numericAmount}` : numericAmount})
                                    </span>
                                </div>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-indigo-900/70 dark:text-indigo-300/70">
                                <span>Perkiraan Sisa Kuota Baru:</span>
                                <span className="font-mono font-semibold">{newRemaining} artikel</span>
                            </div>
                        </div>

                        {/* Audit Note */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="adjust_description" className="text-xs font-semibold">
                                    Alasan / Catatan Audit <span className="text-rose-500">*</span>
                                </Label>
                            </div>
                            <Textarea
                                id="adjust_description"
                                placeholder="Tuliskan alasan penyesuaian (contoh: Penambahan kuota bonus artikel program afirmasi 2026)..."
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    if (error) setError(null);
                                }}
                                rows={3}
                                className="text-xs"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                                <AlertCircle className="size-3.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={() => onOpenChange(false)}
                            className="h-8 text-xs"
                        >
                            Batal
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 bg-primary text-xs text-primary-foreground">
                            {isSubmitting ? (
                                'Menyimpan...'
                            ) : (
                                <>
                                    <Check className="mr-1.5 size-3.5" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
