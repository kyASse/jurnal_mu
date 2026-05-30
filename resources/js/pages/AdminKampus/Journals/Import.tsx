/**
 * @description Admin Kampus - Import Journals from CSV
 * @route GET /admin-kampus/journals/import/form
 * @features Upload CSV file, auto-assign to current admin, preview data, download template, batch import with validation
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react'; // Add usePage import
import { AlertCircle, ArrowLeft, CheckCircle2, Download, Info, Upload, X } from 'lucide-react';
import Papa from 'papaparse';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Journals',
        href: '/admin-kampus/journals',
    },
    {
        title: 'Import',
        href: '/admin-kampus/journals/import',
    },
];

interface CsvImport {
    id: number;
    filename: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    total_rows: number;
    processed_rows: number;
    success_count: number;
    error_count: number;
    errors: Array<{
        row: number;
        errors: string[];
    }> | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
    university?: {
        id: number;
        name: string;
    };
}

interface Props {
    // scientificFields are still passed if needed for reference, or can be optional
    errors?: {
        csv_file?: string;
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        import_errors?: Array<{
            row: number;
            errors: string[];
        }>;
    };
    csvImports?: CsvImport[];
}

interface CsvRow {
    [key: string]: string;
}

const getStatusBadge = (status: CsvImport['status'], errorCount: number) => {
    switch (status) {
        case 'pending':
            return (
                <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
                >
                    Pending
                </Badge>
            );
        case 'processing':
            return (
                <Badge
                    variant="outline"
                    className="animate-pulse border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400"
                >
                    Processing
                </Badge>
            );
        case 'completed':
            if (errorCount > 0) {
                return (
                    <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
                    >
                        Selesai (Ada Error)
                    </Badge>
                );
            }
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                >
                    Sukses
                </Badge>
            );
        case 'failed':
            return (
                <Badge
                    variant="outline"
                    className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-400"
                >
                    Gagal
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function Import({ errors, flash, csvImports }: Props) {
    const { auth } = usePage().props as any; // Get auth user info
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<CsvRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileError, setFileError] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const [selectedImportErrors, setSelectedImportErrors] = useState<CsvImport | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (errors?.csv_file) {
            toast.error(errors.csv_file);
        }
    }, [flash, errors]);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_FILE_TYPES = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const processFile = (file: File) => {
        // Validate file type
        const isCsv = file.name.endsWith('.csv') || ALLOWED_FILE_TYPES.includes(file.type);
        if (!isCsv) {
            setFileError('File harus berformat CSV (.csv)');
            setSelectedFile(null);
            setPreviewData([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setFileError('Ukuran file maksimal 5MB');
            setSelectedFile(null);
            setPreviewData([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setFileError('');

        // Parse CSV for preview and client-side validation
        Papa.parse(file, {
            header: true,
            preview: 5, // Preview first 5 rows
            skipEmptyLines: true,
            transformHeader: (h) => h.trim().toLowerCase(),
            complete: (results) => {
                const fields = results.meta.fields || [];
                const requiredFields = ['title', 'e_issn', 'url', 'oai_url'];
                const missingFields = requiredFields.filter((f) => !fields.includes(f));

                if (missingFields.length > 0) {
                    const errorMsg = `Kolom CSV wajib tidak ditemukan: ${missingFields.join(', ')}`;
                    setFileError(errorMsg);
                    toast.error(errorMsg);
                    setSelectedFile(null);
                    setPreviewData([]);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    return;
                }

                setSelectedFile(file);
                setPreviewData(results.data as CsvRow[]);
            },
            error: (error) => {
                setFileError('Gagal membaca file CSV: ' + error.message);
                setSelectedFile(null);
                setPreviewData([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            handleClearFile();
            return;
        }

        processFile(file);
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setPreviewData([]);
        setFileError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDownloadTemplate = () => {
        window.location.href = route('admin-kampus.journals.import.template');
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setFileError('File CSV harus diunggah');
            return;
        }

        setIsProcessing(true);

        const formData = new FormData();
        formData.append('csv_file', selectedFile);

        router.post(route('admin-kampus.journals.import.process'), formData, {
            forceFormData: true,
            onFinish: () => setIsProcessing(false),
            onError: () => setIsProcessing(false),
        });
    };

    const requiredColumns = ['title', 'e_issn', 'url', 'oai_url'];

    const optionalColumns = ['publisher', 'issn', 'publication_year', 'sinta_rank', 'email', 'phone'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import Jurnal dari CSV" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin-kampus.journals.index')}>
                            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar Jurnal
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Import Jurnal</h1>
                        <p className="mt-1 text-muted-foreground">Unggah file CSV untuk menambahkan data jurnal secara massal ke dalam sistem.</p>
                    </div>

                    {/* Flash Messages */}
                    <div className="mb-6 space-y-4">
                        {flash?.success && (
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-800">Berhasil</AlertTitle>
                                <AlertDescription className="text-green-700">{flash.success}</AlertDescription>
                            </Alert>
                        )}

                        {flash?.error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{flash.error}</AlertDescription>
                            </Alert>
                        )}

                        {flash?.warning && (
                            <Alert className="border-yellow-200 bg-yellow-50">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <AlertTitle className="text-yellow-800">Peringatan</AlertTitle>
                                <AlertDescription className="text-yellow-700">{flash.warning}</AlertDescription>
                            </Alert>
                        )}

                        {/* Import Errors */}
                        {flash?.import_errors && flash.import_errors.length > 0 && (
                            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 dark:border-destructive/30 dark:bg-destructive/10">
                                <div className="mb-4 flex items-center gap-3 border-b border-destructive/10 pb-4 duration-200 animate-in fade-in slide-in-from-top-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive dark:bg-destructive/20">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-destructive dark:text-red-400">Detail Error Import</h3>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            Ditemukan{' '}
                                            <span className="font-bold text-destructive dark:text-red-400">{flash.import_errors.length}</span> baris
                                            data yang memiliki kesalahan validasi.
                                        </p>
                                    </div>
                                </div>
                                <div className="max-h-80 space-y-4 overflow-y-auto pr-2">
                                    {flash.import_errors.map((error, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-start border-b border-destructive/5 pb-3 last:border-0 last:pb-0 sm:flex-row sm:gap-4"
                                        >
                                            <span className="mb-2 inline-flex items-center rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-bold whitespace-nowrap text-destructive sm:mb-0 dark:bg-destructive/20 dark:text-red-400">
                                                Baris {error.row}
                                            </span>
                                            <ul className="list-disc space-y-1 pl-4 text-sm text-foreground">
                                                {error.errors.map((msg, idx) => (
                                                    <li key={idx} className="leading-relaxed">
                                                        {msg}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Import Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Auto-Assign Info */}
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>Informasi Pengelola</AlertTitle>
                                            <AlertDescription>
                                                Semua jurnal yang diimport akan ditugaskan kepada Anda (<strong>{auth.user.name}</strong>) sebagai
                                                pengelola awal. Anda dapat menugaskan ulang jurnal ke pengelola lain setelah import selesai.
                                            </AlertDescription>
                                        </Alert>

                                        {/* File Upload */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="csv_file">
                                                    File CSV <span className="text-destructive">*</span>
                                                </Label>
                                                <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
                                                    <Download className="h-4 w-4" />
                                                    Download Template
                                                </Button>
                                            </div>

                                            <input
                                                id="csv_file"
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".csv,text/csv"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />

                                            {!selectedFile ? (
                                                <div
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        setIsDragging(true);
                                                    }}
                                                    onDragLeave={(e) => {
                                                        e.preventDefault();
                                                        setIsDragging(false);
                                                    }}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        setIsDragging(false);
                                                        const file = e.dataTransfer.files?.[0];
                                                        if (file) {
                                                            processFile(file);
                                                        }
                                                    }}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                                                        isDragging
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
                                                    } ${errors?.csv_file || fileError ? 'border-destructive/50 bg-destructive/5' : ''}`}
                                                >
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                                                        <span className="font-semibold text-primary hover:text-primary/80">Pilih file</span>
                                                        <span className="pl-1">atau seret dan lepas di sini</span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-muted-foreground">Maksimal ukuran file 5MB, format CSV (.csv)</p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between rounded-lg border border-sidebar-border bg-muted/30 p-4 dark:border-sidebar-border dark:bg-neutral-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                            <Upload className="h-5 w-5" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="max-w-[200px] truncate text-sm font-medium text-foreground sm:max-w-xs md:max-w-md">
                                                                {selectedFile.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleClearFile}
                                                        className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Batal
                                                    </Button>
                                                </div>
                                            )}

                                            {(errors?.csv_file || fileError) && (
                                                <p className="text-sm font-medium text-destructive">{errors?.csv_file || fileError}</p>
                                            )}
                                        </div>

                                        {/* CSV Preview */}
                                        {previewData.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Preview Data (5 baris pertama)</Label>
                                                <div className="overflow-x-auto rounded-md border">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-muted/50">
                                                            <tr>
                                                                {Object.keys(previewData[0]).map((header) => (
                                                                    <th
                                                                        key={header}
                                                                        className="px-3 py-2 text-left font-medium text-muted-foreground"
                                                                    >
                                                                        {header}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {previewData.map((row, index) => (
                                                                <tr key={index} className="border-t transition-colors hover:bg-muted/50">
                                                                    {Object.values(row).map((value, cellIndex) => (
                                                                        <td key={cellIndex} className="px-3 py-2">
                                                                            {value || '-'}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                            <Button type="submit" disabled={!selectedFile || isProcessing} className="w-full min-w-[150px] sm:w-auto">
                                                {isProcessing ? (
                                                    <>
                                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                                        Memproses...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        Import Jurnal
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.visit(route('admin-kampus.journals.index'))}
                                                disabled={isProcessing}
                                                className="w-full sm:w-auto"
                                            >
                                                Batal
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Guidelines */}
                        <div className="space-y-6">
                            {/* Format Guidelines */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Info className="h-4 w-4" />
                                        Format CSV
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div>
                                        <h4 className="mb-2 font-medium">Kolom Wajib:</h4>
                                        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                                            {requiredColumns.map((col) => (
                                                <li key={col}>{col}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 font-medium">Kolom Opsional:</h4>
                                        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                                            {optionalColumns.map((col) => (
                                                <li key={col}>{col}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Format Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Catatan Penting</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-muted-foreground">
                                    <div>
                                        <strong className="text-foreground">ISSN Format:</strong> 1234-5678
                                    </div>
                                    <div>
                                        <strong className="text-foreground">Tahun Terbit:</strong> YYYY (contoh: 2026)
                                    </div>
                                    <div>
                                        <strong className="text-foreground">SINTA Rank:</strong> angka 1-6 atau kosong (non_sinta)
                                    </div>
                                    <div>
                                        <strong className="text-foreground">Bidang Ilmu:</strong> Akan ditugaskan secara manual setelah import.
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Import History Card */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Riwayat Import Jurnal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama File</TableHead>
                                        <TableHead>User Pengunggah</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Jumlah Baris</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!csvImports || csvImports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                                Belum ada riwayat import jurnal.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        csvImports.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="max-w-[200px] truncate font-medium" title={item.filename}>
                                                    {item.filename}
                                                </TableCell>
                                                <TableCell>{item.user?.name || '-'}</TableCell>
                                                <TableCell>{getStatusBadge(item.status, item.error_count)}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-0.5 text-xs">
                                                        <div>
                                                            Sukses:{' '}
                                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                                {item.success_count}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            Error:{' '}
                                                            <span
                                                                className={`font-semibold ${item.error_count > 0 ? 'text-destructive dark:text-red-400' : 'text-muted-foreground'}`}
                                                            >
                                                                {item.error_count}
                                                            </span>
                                                        </div>
                                                        <div>Total: {item.total_rows}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {(item.status === 'completed' && item.error_count > 0) || item.status === 'failed' ? (
                                                        <Button variant="outline" size="sm" onClick={() => setSelectedImportErrors(item)}>
                                                            Lihat Detail
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Dialog Modal for Error Logs */}
                    <Dialog open={selectedImportErrors !== null} onOpenChange={(open) => !open && setSelectedImportErrors(null)}>
                        <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col">
                            <DialogHeader>
                                <DialogTitle>Detail Error - {selectedImportErrors?.filename}</DialogTitle>
                                <DialogDescription>Daftar kesalahan validasi baris demi baris pada proses import ini.</DialogDescription>
                            </DialogHeader>
                            <div className="my-4 max-h-[50vh] flex-1 space-y-4 overflow-y-auto pr-2">
                                {selectedImportErrors?.errors && selectedImportErrors.errors.length > 0 ? (
                                    selectedImportErrors.errors.map((err, idx) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col items-start border-b border-muted pb-3 last:border-0 sm:flex-row sm:gap-4"
                                        >
                                            <Badge
                                                variant="outline"
                                                className="mb-2 border-destructive/20 bg-destructive/10 whitespace-nowrap text-destructive sm:mb-0"
                                            >
                                                Baris {err.row}
                                            </Badge>
                                            <ul className="list-disc space-y-1 pl-4 text-sm text-foreground">
                                                {err.errors.map((msg, subIdx) => (
                                                    <li key={subIdx} className="leading-relaxed">
                                                        {msg}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        Tidak ada detail error yang tercatat atau file gagal diproses tanpa detail baris.
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setSelectedImportErrors(null)}>Tutup</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
