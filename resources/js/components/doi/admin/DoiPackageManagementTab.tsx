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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { DoiPackageData, DoiPackageFormData } from '@/types/doi';
import { formatRupiah } from './DoiAdminStatsCards';
import {
    Package,
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Sparkles,
    Shield,
    FileText,
    AlertCircle,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoiPackageManagementTabProps {
    packages: (DoiPackageData & { subscriptions_count?: number })[];
    onCreatePackage: (data: DoiPackageFormData) => void;
    onUpdatePackage: (id: number, data: DoiPackageFormData) => void;
    onDeletePackage: (id: number) => void;
    isSubmitting?: boolean;
    className?: string;
}

export function DoiPackageManagementTab({
    packages,
    onCreatePackage,
    onUpdatePackage,
    onDeletePackage,
    isSubmitting = false,
    className,
}: DoiPackageManagementTabProps) {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editingPackage, setEditingPackage] = React.useState<DoiPackageData | null>(null);
    const [deleteTarget, setDeleteTarget] = React.useState<DoiPackageData | null>(null);

    // Form state
    const [name, setName] = React.useState('');
    const [code, setCode] = React.useState('');
    const [priceAnnual, setPriceAnnual] = React.useState<number | string>('');
    const [similarityQuota, setSimilarityQuota] = React.useState<number | string>(500);
    const [prefixIncluded, setPrefixIncluded] = React.useState(true);
    const [isActive, setIsActive] = React.useState(true);
    const [description, setDescription] = React.useState('');
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

    const handleOpenCreate = () => {
        setEditingPackage(null);
        setName('');
        setCode('');
        setPriceAnnual('');
        setSimilarityQuota(500);
        setPrefixIncluded(true);
        setIsActive(true);
        setDescription('');
        setFormErrors({});
        setDialogOpen(true);
    };

    const handleOpenEdit = (pkg: DoiPackageData) => {
        setEditingPackage(pkg);
        setName(pkg.name);
        setCode(pkg.code);
        setPriceAnnual(pkg.price_annual);
        setSimilarityQuota(pkg.similarity_quota_included);
        setPrefixIncluded(pkg.prefix_included);
        setIsActive(pkg.is_active);
        setDescription(pkg.description || '');
        setFormErrors({});
        setDialogOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        if (!name.trim()) errors.name = 'Nama paket wajib diisi.';
        if (!code.trim()) errors.code = 'Kode paket wajib diisi.';
        if (priceAnnual === '' || Number(priceAnnual) < 0) errors.price_annual = 'Harga tahunan valid wajib diisi.';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const payload: DoiPackageFormData = {
            name: name.trim(),
            code: code.trim(),
            price_annual: Number(priceAnnual),
            similarity_quota_included: Number(similarityQuota) || 0,
            prefix_included: prefixIncluded,
            is_active: isActive,
            description: description.trim() || null,
        };

        if (editingPackage) {
            onUpdatePackage(editingPackage.id, payload);
        } else {
            onCreatePackage(payload);
        }

        setDialogOpen(false);
    };

    const handleConfirmDelete = () => {
        if (deleteTarget) {
            onDeletePackage(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Action Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-sm font-bold text-foreground">Katalog Paket Langganan DOI</h3>
                    <p className="text-xs text-muted-foreground">
                        Kelola tarif tahunan, alokasi kuota pemeriksaan Turnitin, dan fasilitas Crossref prefix
                    </p>
                </div>

                <Button
                    type="button"
                    size="sm"
                    onClick={handleOpenCreate}
                    className="h-8 bg-primary text-xs text-primary-foreground shadow-2xs"
                >
                    <Plus className="mr-1.5 size-3.5" />
                    Tambah Paket Baru
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-card shadow-xs dark:border-slate-800">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="text-xs font-semibold">Nama & Kode Paket</TableHead>
                            <TableHead className="text-xs font-semibold">Biaya Tahunan</TableHead>
                            <TableHead className="text-xs font-semibold">Fasilitas Termasuk</TableHead>
                            <TableHead className="text-xs font-semibold">Langganan Aktif</TableHead>
                            <TableHead className="text-xs font-semibold">Status</TableHead>
                            <TableHead className="text-right text-xs font-semibold">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {packages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                                    Belum ada paket langganan. Klik &quot;Tambah Paket Baru&quot; untuk membuat.
                                </TableCell>
                            </TableRow>
                        ) : (
                            packages.map((pkg) => (
                                <TableRow key={pkg.id} className="transition-colors hover:bg-muted/40">
                                    {/* Name & Code */}
                                    <TableCell className="text-xs">
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-foreground">{pkg.name}</p>
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                                    {pkg.code}
                                                </Badge>
                                                {pkg.description && (
                                                    <span className="truncate text-[11px] text-muted-foreground max-w-[200px]" title={pkg.description}>
                                                        {pkg.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Annual Price */}
                                    <TableCell className="font-mono text-xs font-bold text-foreground tabular-nums">
                                        {formatRupiah(pkg.price_annual)}
                                        <span className="block text-[10px] font-normal text-muted-foreground">/ tahun</span>
                                    </TableCell>

                                    {/* Facilities */}
                                    <TableCell className="text-xs">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-foreground">
                                                <Sparkles className="size-3 text-indigo-600 dark:text-indigo-400" />
                                                <span>{pkg.similarity_quota_included} Kuota Turnitin</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                                                <Shield className="size-3" />
                                                <span>{pkg.prefix_included ? 'Termasuk Prefix DOI' : 'Tanpa Prefix'}</span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Subscriptions count */}
                                    <TableCell className="text-xs">
                                        <span className="font-mono font-medium text-foreground">
                                            {pkg.subscriptions_count ?? 0} PTMA
                                        </span>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        {pkg.is_active ? (
                                            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                <CheckCircle2 className="mr-1 size-3" /> Aktif
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-slate-100 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
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
                                                onClick={() => handleOpenEdit(pkg)}
                                                className="h-7 px-2 text-xs"
                                                title="Edit Paket"
                                            >
                                                <Edit2 className="size-3.5" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteTarget(pkg)}
                                                className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950"
                                                title="Hapus Paket"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleFormSubmit}>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <Package className="size-5 text-primary" />
                                <DialogTitle className="text-base font-bold">
                                    {editingPackage ? 'Edit Paket Langganan' : 'Tambah Paket Baru'}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-xs">
                                Tentukan parameter harga, kuota similarity, dan status paket
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-3 py-4 text-xs">
                            {/* Name */}
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="pkg_name" className="text-xs font-semibold">
                                    Nama Paket <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="pkg_name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="cth: Paket Utama Crossref + Turnitin"
                                    className="h-8 text-xs"
                                />
                                {formErrors.name && (
                                    <p className="text-[11px] text-rose-600">{formErrors.name}</p>
                                )}
                            </div>

                            {/* Code */}
                            <div className="space-y-1.5">
                                <Label htmlFor="pkg_code" className="text-xs font-semibold">
                                    Kode Unik Paket <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="pkg_code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="PKG-STANDARD"
                                    className="h-8 font-mono text-xs uppercase"
                                />
                                {formErrors.code && (
                                    <p className="text-[11px] text-rose-600">{formErrors.code}</p>
                                )}
                            </div>

                            {/* Annual Price */}
                            <div className="space-y-1.5">
                                <Label htmlFor="pkg_price" className="text-xs font-semibold">
                                    Harga Tahunan (Rp) <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="pkg_price"
                                    type="number"
                                    min="0"
                                    value={priceAnnual}
                                    onChange={(e) => setPriceAnnual(e.target.value)}
                                    placeholder="5000000"
                                    className="h-8 font-mono text-xs"
                                />
                                {formErrors.price_annual && (
                                    <p className="text-[11px] text-rose-600">{formErrors.price_annual}</p>
                                )}
                            </div>

                            {/* Similarity Quota */}
                            <div className="space-y-1.5">
                                <Label htmlFor="pkg_quota" className="text-xs font-semibold">
                                    Alokasi Kuota Similarity
                                </Label>
                                <Input
                                    id="pkg_quota"
                                    type="number"
                                    min="0"
                                    value={similarityQuota}
                                    onChange={(e) => setSimilarityQuota(e.target.value)}
                                    placeholder="500"
                                    className="h-8 font-mono text-xs"
                                />
                            </div>

                            {/* Prefix Included Toggle */}
                            <div className="flex items-center justify-between rounded-lg border p-2.5">
                                <div>
                                    <Label htmlFor="prefix_included" className="cursor-pointer text-xs font-semibold">
                                        Termasuk Prefix DOI
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground">Fasilitas prefix Crossref</p>
                                </div>
                                <Switch
                                    id="prefix_included"
                                    checked={prefixIncluded}
                                    onCheckedChange={setPrefixIncluded}
                                />
                            </div>

                            {/* Description */}
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="pkg_desc" className="text-xs font-semibold">
                                    Deskripsi Paket
                                </Label>
                                <Textarea
                                    id="pkg_desc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Keterangan singkat mengenai paket ini..."
                                    rows={2}
                                    className="text-xs"
                                />
                            </div>

                            {/* Is Active Toggle */}
                            <div className="col-span-2 flex items-center justify-between rounded-lg border bg-muted/20 p-2.5">
                                <div>
                                    <Label htmlFor="is_active" className="cursor-pointer text-xs font-semibold">
                                        Status Publikasi Paket
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground">
                                        Paket aktif dapat dipilih oleh PTMA saat pendaftaran/perpanjangan
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDialogOpen(false)}
                                className="h-8 text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting}
                                className="h-8 bg-primary text-xs text-primary-foreground"
                            >
                                {editingPackage ? 'Simpan Perubahan' : 'Buat Paket'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold">
                            Hapus Paket {deleteTarget?.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                            Paket yang memiliki riwayat langganan terkait tidak dapat dihapus. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-8 text-xs">Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="h-8 bg-rose-600 text-xs text-white hover:bg-rose-700"
                        >
                            Hapus Paket
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
