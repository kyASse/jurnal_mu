/**
 * @description Admin Kampus - Import Journals from CSV
 * @route GET /admin-kampus/journals/import/form
 * @features Upload CSV file, select journal manager, preview data, download template, batch import with validation
 */

import { FormEventHandler, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { AlertCircle, CheckCircle2, Download, Upload, Info, ArrowLeft } from 'lucide-react';
import Papa from 'papaparse';
import { BreadcrumbItem } from '@/types';

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
    }
];

interface User {
    id: number;
    name: string;
    email: string;
    label: string;
}

interface ScientificField {
    id: number;
    name: string;
}

interface Props {
    users: User[];
    scientificFields: ScientificField[];
    errors?: {
        csv_file?: string;
        user_id?: string;
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
}

interface CsvRow {
    [key: string]: string;
}

export default function Import({ users, scientificFields, errors, flash }: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [previewData, setPreviewData] = useState<CsvRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileError, setFileError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_FILE_TYPES = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (!file) {
            setSelectedFile(null);
            setPreviewData([]);
            setFileError('');
            return;
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.name.endsWith('.csv')) {
            setFileError('File harus berformat CSV (.csv)');
            setSelectedFile(null);
            setPreviewData([]);
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setFileError('Ukuran file maksimal 5MB');
            setSelectedFile(null);
            setPreviewData([]);
            return;
        }

        setFileError('');
        setSelectedFile(file);

        // Parse CSV for preview
        Papa.parse(file, {
            header: true,
            preview: 5, // Preview first 5 rows
            skipEmptyLines: true,
            complete: (results) => {
                setPreviewData(results.data as CsvRow[]);
            },
            error: (error) => {
                setFileError('Gagal membaca file CSV: ' + error.message);
                setPreviewData([]);
            },
        });
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

        if (!selectedUserId) {
            return;
        }

        setIsProcessing(true);

        const formData = new FormData();
        formData.append('csv_file', selectedFile);
        formData.append('user_id', selectedUserId);

        router.post(route('admin-kampus.journals.import.process'), formData, {
            forceFormData: true,
            onFinish: () => setIsProcessing(false),
            onError: () => setIsProcessing(false),
        });
    };

    const requiredColumns = [
        'title',
        'publisher',
        'scientific_field_name',
    ];

    const optionalColumns = [
        'issn',
        'e_issn',
        'publication_year',
        'sinta_rank',
        'accreditation_rank',
        'accreditation_expiry_date',
        'url',
        'ojs_url',
        'email',
        'phone',
        'indexations',
        'about',
        'scope',
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import Jurnal dari CSV" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
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
                        <p className="mt-1 text-muted-foreground">
                            Unggah file CSV untuk menambahkan data jurnal secara massal ke dalam sistem.
                        </p>
                    </div>

                    {/* Flash Messages */}
                    <div className="space-y-4 mb-6">
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
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Detail Error Import</AlertTitle>
                                <AlertDescription>
                                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                        {flash.import_errors.map((error, index) => (
                                            <div key={index} className="text-sm">
                                                <strong>Baris {error.row}:</strong>
                                                <ul className="ml-4 list-disc">
                                                    {error.errors.map((msg, idx) => (
                                                        <li key={idx}>{msg}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Import Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* User Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="user_id">
                                                Pengelola Jurnal <span className="text-destructive">*</span>
                                            </Label>
                                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                                <SelectTrigger id="user_id" className={errors?.user_id ? 'border-destructive' : ''}>
                                                    <SelectValue placeholder="Pilih pengelola jurnal" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users.map((user) => (
                                                        <SelectItem key={user.id} value={user.id.toString()}>
                                                            {user.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors?.user_id && (
                                                <p className="text-sm text-destructive">{errors.user_id}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                Semua jurnal yang diimport akan ditugaskan ke pengelola ini.
                                            </p>
                                        </div>

                                        {/* File Upload */}
                                        <div className="space-y-2">
                                            <Label htmlFor="csv_file">
                                                File CSV <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="csv_file"
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".csv,text/csv"
                                                    onChange={handleFileChange}
                                                    className={errors?.csv_file || fileError ? 'border-destructive' : ''}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleDownloadTemplate}
                                                    className="shrink-0 gap-2"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download Template
                                                </Button>
                                            </div>
                                            {(errors?.csv_file || fileError) && (
                                                <p className="text-sm text-destructive">{errors?.csv_file || fileError}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                Maksimal ukuran file 5MB, dengan format CSV (.csv).
                                            </p>
                                        </div>

                                        {/* CSV Preview */}
                                        {previewData.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Preview Data (5 baris pertama)</Label>
                                                <div className="border rounded-md overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-muted/50">
                                                            <tr>
                                                                {Object.keys(previewData[0]).map((header) => (
                                                                    <th key={header} className="px-3 py-2 text-left font-medium text-muted-foreground">
                                                                        {header}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {previewData.map((row, index) => (
                                                                <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
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
                                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                            <Button
                                                type="submit"
                                                disabled={!selectedFile || !selectedUserId || isProcessing}
                                                className="w-full sm:w-auto min-w-[150px]"
                                            >
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
                                        <h4 className="font-medium mb-2">Kolom Wajib:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                            {requiredColumns.map((col) => (
                                                <li key={col}>{col}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Kolom Opsional:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
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
                                        <strong className="text-foreground">Tanggal:</strong> YYYY-MM-DD (contoh: 2026-12-31)
                                    </div>
                                    <div>
                                        <strong className="text-foreground">SINTA Rank:</strong> Angka 1-6 atau kosong
                                    </div>
                                    <div>
                                        <strong className="text-foreground">Indexations:</strong> Format: "Scopus (2020-01-15), DOAJ (2019-06-20)"
                                    </div>
                                    <div>
                                        <strong className="text-foreground">Scientific Field:</strong> Harus sesuai dengan nama bidang ilmu yang ada di sistem
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Scientific Fields Reference */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Bidang Ilmu Valid</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-60 overflow-y-auto text-sm">
                                        <ul className="space-y-1">
                                            {scientificFields.map((field) => (
                                                <li key={field.id} className="text-muted-foreground">
                                                    • {field.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
