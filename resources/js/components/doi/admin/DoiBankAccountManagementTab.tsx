import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DoiBankAccountData, DoiBankAccountFormData } from '@/types/doi';
import { Check, CheckCircle2, Copy, CreditCard, Edit2, Landmark, Plus, Trash2, XCircle } from 'lucide-react';
import * as React from 'react';

interface DoiBankAccountManagementTabProps {
    bankAccounts: DoiBankAccountData[];
    onCreateBankAccount: (data: DoiBankAccountFormData) => void;
    onUpdateBankAccount: (id: number, data: DoiBankAccountFormData) => void;
    onDeleteBankAccount: (id: number) => void;
    isSubmitting?: boolean;
    className?: string;
}

export function DoiBankAccountManagementTab({
    bankAccounts,
    onCreateBankAccount,
    onUpdateBankAccount,
    onDeleteBankAccount,
    isSubmitting = false,
    className,
}: DoiBankAccountManagementTabProps) {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editingAccount, setEditingAccount] = React.useState<DoiBankAccountData | null>(null);
    const [deleteTarget, setDeleteTarget] = React.useState<DoiBankAccountData | null>(null);
    const [copiedId, setCopiedId] = React.useState<number | null>(null);

    // Form state
    const [bankName, setBankName] = React.useState('');
    const [accountNumber, setAccountNumber] = React.useState('');
    const [accountHolder, setAccountHolder] = React.useState('');
    const [branchName, setBranchName] = React.useState('');
    const [displayOrder, setDisplayOrder] = React.useState<number | string>(0);
    const [isActive, setIsActive] = React.useState(true);
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

    const handleOpenCreate = () => {
        setEditingAccount(null);
        setBankName('');
        setAccountNumber('');
        setAccountHolder('');
        setBranchName('');
        setDisplayOrder(bankAccounts.length);
        setIsActive(true);
        setFormErrors({});
        setDialogOpen(true);
    };

    const handleOpenEdit = (acc: DoiBankAccountData) => {
        setEditingAccount(acc);
        setBankName(acc.bank_name);
        setAccountNumber(acc.account_number);
        setAccountHolder(acc.account_holder);
        setBranchName(acc.branch_name || acc.branch || '');
        setDisplayOrder(acc.display_order ?? 0);
        setIsActive(acc.is_active ?? true);
        setFormErrors({});
        setDialogOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        if (!bankName.trim()) errors.bank_name = 'Nama bank wajib diisi.';
        if (!accountNumber.trim()) errors.account_number = 'Nomor rekening wajib diisi.';
        if (!accountHolder.trim()) errors.account_holder = 'Nama pemilik rekening wajib diisi.';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const payload: DoiBankAccountFormData = {
            bank_name: bankName.trim(),
            account_number: accountNumber.trim(),
            account_holder: accountHolder.trim(),
            branch_name: branchName.trim() || null,
            branch: branchName.trim() || null,
            display_order: Number(displayOrder) || 0,
            is_active: isActive,
        };

        if (editingAccount) {
            onUpdateBankAccount(editingAccount.id, payload);
        } else {
            onCreateBankAccount(payload);
        }

        setDialogOpen(false);
    };

    const handleCopyNumber = (id: number, num: string) => {
        navigator.clipboard.writeText(num);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleConfirmDelete = () => {
        if (deleteTarget) {
            onDeleteBankAccount(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Action Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-sm font-bold text-foreground">Rekening Resmi Pembayaran</h3>
                    <p className="text-xs text-muted-foreground">
                        Kelola nomor rekening bank tujuan transfer yang ditampilkan pada faktur tagihan PTMA
                    </p>
                </div>

                <Button type="button" size="sm" onClick={handleOpenCreate} className="h-8 bg-primary text-xs text-primary-foreground shadow-2xs">
                    <Plus className="mr-1.5 size-3.5" />
                    Tambah Rekening Bank
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-card shadow-xs dark:border-slate-800">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[80px] text-xs font-semibold">Urutan</TableHead>
                            <TableHead className="text-xs font-semibold">Nama Bank & Cabang</TableHead>
                            <TableHead className="text-xs font-semibold">Nomor Rekening</TableHead>
                            <TableHead className="text-xs font-semibold">Atas Nama (Pemilik)</TableHead>
                            <TableHead className="text-xs font-semibold">Status</TableHead>
                            <TableHead className="text-right text-xs font-semibold">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bankAccounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                                    Belum ada data rekening bank. Klik &quot;Tambah Rekening Bank&quot; untuk menambahkan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            bankAccounts.map((acc, idx) => {
                                const isCopied = copiedId === acc.id;
                                return (
                                    <TableRow key={acc.id} className="transition-colors hover:bg-muted/40">
                                        {/* Order */}
                                        <TableCell className="font-mono text-xs text-muted-foreground">#{acc.display_order ?? idx + 1}</TableCell>

                                        {/* Bank & Branch */}
                                        <TableCell className="text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                    <Landmark className="size-3.5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{acc.bank_name}</p>
                                                    {(acc.branch_name || acc.branch) && (
                                                        <p className="text-[11px] text-muted-foreground">{acc.branch_name || acc.branch}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Account Number */}
                                        <TableCell className="text-xs">
                                            <button
                                                type="button"
                                                onClick={() => handleCopyNumber(acc.id, acc.account_number)}
                                                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-muted/40 px-2 py-0.5 font-mono text-xs font-bold text-foreground transition-all hover:bg-muted dark:border-slate-800"
                                                title="Klik untuk menyalin nomor rekening"
                                            >
                                                <span>{acc.account_number}</span>
                                                {isCopied ? (
                                                    <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                                                ) : (
                                                    <Copy className="size-3 text-muted-foreground" />
                                                )}
                                            </button>
                                        </TableCell>

                                        {/* Account Holder */}
                                        <TableCell className="text-xs font-medium text-foreground">{acc.account_holder}</TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            {(acc.is_active ?? true) ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                                >
                                                    <CheckCircle2 className="mr-1 size-3" /> Aktif
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-slate-100 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                >
                                                    <XCircle className="mr-1 size-3" /> Nonaktif
                                                </Badge>
                                            )}
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEdit(acc)}
                                                    className="h-7 px-2 text-xs"
                                                    title="Edit Rekening"
                                                >
                                                    <Edit2 className="size-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteTarget(acc)}
                                                    className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950"
                                                    title="Hapus Rekening"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleFormSubmit}>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <CreditCard className="size-5 text-primary" />
                                <DialogTitle className="text-base font-bold">
                                    {editingAccount ? 'Edit Rekening Bank' : 'Tambah Rekening Bank'}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-xs">
                                Informasi rekening yang akan ditampilkan sebagai opsi pembayaran resmi
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-4 text-xs">
                            {/* Bank Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="bank_name" className="text-xs font-semibold">
                                    Nama Bank <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="bank_name"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="cth: Bank Syariah Indonesia (BSI)"
                                    className="h-8 text-xs"
                                />
                                {formErrors.bank_name && <p className="text-[11px] text-rose-600">{formErrors.bank_name}</p>}
                            </div>

                            {/* Account Number */}
                            <div className="space-y-1.5">
                                <Label htmlFor="account_number" className="text-xs font-semibold">
                                    Nomor Rekening <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="account_number"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="cth: 7123456789"
                                    className="h-8 font-mono text-xs"
                                />
                                {formErrors.account_number && <p className="text-[11px] text-rose-600">{formErrors.account_number}</p>}
                            </div>

                            {/* Account Holder */}
                            <div className="space-y-1.5">
                                <Label htmlFor="account_holder" className="text-xs font-semibold">
                                    Atas Nama Pemilik <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="account_holder"
                                    value={accountHolder}
                                    onChange={(e) => setAccountHolder(e.target.value)}
                                    placeholder="cth: Perkumpulan Pengelola Jurnal PTMA"
                                    className="h-8 text-xs"
                                />
                                {formErrors.account_holder && <p className="text-[11px] text-rose-600">{formErrors.account_holder}</p>}
                            </div>

                            {/* Branch */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="branch_name" className="text-xs font-semibold">
                                        Kantor Cabang
                                    </Label>
                                    <Input
                                        id="branch_name"
                                        value={branchName}
                                        onChange={(e) => setBranchName(e.target.value)}
                                        placeholder="cth: KC Yogyakarta"
                                        className="h-8 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="display_order" className="text-xs font-semibold">
                                        Urutan Tampilan
                                    </Label>
                                    <Input
                                        id="display_order"
                                        type="number"
                                        min="0"
                                        value={displayOrder}
                                        onChange={(e) => setDisplayOrder(e.target.value)}
                                        placeholder="0"
                                        className="h-8 font-mono text-xs"
                                    />
                                </div>
                            </div>

                            {/* Active Switch */}
                            <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-2.5">
                                <div>
                                    <Label htmlFor="acc_is_active" className="cursor-pointer text-xs font-semibold">
                                        Status Rekening Aktif
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground">Tampilkan rekening ini sebagai tujuan transfer resmi</p>
                                </div>
                                <Switch id="acc_is_active" checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="h-8 text-xs">
                                Batal
                            </Button>
                            <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 bg-primary text-xs text-primary-foreground">
                                {editingAccount ? 'Simpan Perubahan' : 'Tambah Rekening'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold">Hapus Rekening {deleteTarget?.bank_name}?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                            Rekening yang telah memiliki riwayat bukti transfer terkait tidak dapat dihapus. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-8 text-xs">Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="h-8 bg-rose-600 text-xs text-white hover:bg-rose-700">
                            Hapus Rekening
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
