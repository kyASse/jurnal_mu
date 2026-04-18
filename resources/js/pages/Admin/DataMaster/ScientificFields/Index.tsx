import { Head, useForm } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface ScientificField {
    id: number;
    code: string;
    name: string;
    description: string | null;
    parent_id: number | null;
    is_active: boolean;
    children_count?: number;
    parent?: {
        id: number;
        code: string;
        name: string;
    };
}

interface Props {
    categories: ScientificField[];
    classifications: ScientificField[];
    parentOptions: { id: number; name: string; code: string }[];
}

export default function ScientificFieldsIndex({ categories, classifications, parentOptions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Master', href: route('admin.data-master.index') },
        { title: 'Scientific Fields', href: route('admin.data-master.scientific-fields.index') },
    ];

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ScientificField | null>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        code: '',
        name: '',
        description: '',
        parent_id: null as number | null,
        is_active: true,
    });

    const { data: importData, setData: setImportData, post: postImport, processing: importing } = useForm({
        file: null as File | null,
    });

    const handleCreate = () => {
        setEditingItem(null);
        reset();
        setIsFormOpen(true);
    };

    const handleEdit = (item: ScientificField) => {
        setEditingItem(item);
        setData({
            code: item.code,
            name: item.name,
            description: item.description || '',
            parent_id: item.parent_id,
            is_active: item.is_active,
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(route('admin.data-master.scientific-fields.update', editingItem.id), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    toast.success('Bidang ilmu berhasil diperbarui');
                },
            });
        } else {
            post(route('admin.data-master.scientific-fields.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    toast.success('Bidang ilmu berhasil ditambahkan');
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            destroy(route('admin.data-master.scientific-fields.destroy', id), {
                onSuccess: () => toast.success('Data berhasil dihapus'),
            });
        }
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        postImport(route('admin.data-master.scientific-fields.import'), {
            onSuccess: () => {
                setIsImportOpen(false);
                setImportData('file', null);
                toast.success('Data berhasil diimport');
            },
        });
    };

    const FieldTable = ({ data, type }: { data: ScientificField[], type: 'category' | 'classification' }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    {type === 'classification' && <TableHead>Kategori</TableHead>}
                    {type === 'category' && <TableHead>Jml Klasifikasi</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            Tidak ada data.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            {type === 'classification' && (
                                <TableCell>
                                    <Badge variant="outline">{item.parent?.name || '-'}</Badge>
                                </TableCell>
                            )}
                            {type === 'category' && (
                                <TableCell>{item.children_count || 0}</TableCell>
                            )}
                            <TableCell>
                                <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                    {item.is_active ? 'Aktif' : 'Non-aktif'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            className="text-destructive"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Scientific Fields - Data Master" />

            <div className="flex h-full flex-1 flex-col space-y-8 p-4 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Scientific Fields</h2>
                        <p className="text-muted-foreground">Kelola Rumpun dan Pohon Ilmu (Kategori & Klasifikasi).</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" /> Import
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={route('admin.data-master.scientific-fields.export')}>
                                <Download className="mr-2 h-4 w-4" /> Export
                            </a>
                        </Button>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Data
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="categories" className="w-full">
                    <TabsList>
                        <TabsTrigger value="categories">Kategori (Rumpun Ilmu)</TabsTrigger>
                        <TabsTrigger value="classifications">Klasifikasi (Pohon Ilmu)</TabsTrigger>
                    </TabsList>
                    <Card className="mt-4">
                        <TabsContent value="categories" className="p-0">
                            <FieldTable data={categories} type="category" />
                        </TabsContent>
                        <TabsContent value="classifications" className="p-0">
                            <FieldTable data={classifications} type="classification" />
                        </TabsContent>
                    </Card>
                </Tabs>
            </div>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Bidang Ilmu' : 'Tambah Bidang Ilmu'}</DialogTitle>
                        <DialogDescription>
                            Pastikan kode unik dan nama sesuai dengan standar nasional.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right">Kode</Label>
                            <Input 
                                id="code" 
                                value={data.code} 
                                onChange={e => setData('code', e.target.value)} 
                                className="col-span-3" 
                                required
                            />
                            {errors.code && <p className="col-start-2 col-span-3 text-xs text-destructive">{errors.code}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nama</Label>
                            <Input 
                                id="name" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                className="col-span-3" 
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="parent" className="text-right">Parent</Label>
                            <div className="col-span-3">
                                <Select 
                                    value={data.parent_id?.toString() || "none"} 
                                    onValueChange={v => setData('parent_id', v === "none" ? null : parseInt(v))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kategori (Opsional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tanpa Parent (Kategori Utama)</SelectItem>
                                        {parentOptions.map(opt => (
                                            <SelectItem key={opt.id} value={opt.id.toString()}>
                                                {opt.code} - {opt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Deskripsi</Label>
                            <Textarea 
                                id="description" 
                                value={data.description} 
                                onChange={e => setData('description', e.target.value)} 
                                className="col-span-3" 
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <div className="flex items-center space-x-2">
                                <Switch 
                                    id="status" 
                                    checked={data.is_active} 
                                    onCheckedChange={v => setData('is_active', v)} 
                                />
                                <Label htmlFor="status">Aktif</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Data Master</DialogTitle>
                        <DialogDescription>
                            Upload file Excel (.xlsx atau .csv) dengan kolom: code, name, description, parent_code, is_active.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleImport} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="file">File Excel/CSV</Label>
                            <Input 
                                id="file" 
                                type="file" 
                                accept=".xlsx,.csv" 
                                onChange={e => setImportData('file', e.target.files?.[0] || null)}
                                required
                            />
                            {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsImportOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={importing}>Upload</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
