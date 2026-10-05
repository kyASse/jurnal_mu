import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, AlertCircle, Building2, CheckCircle2, ChevronLeft, ChevronRight, Loader2, RefreshCw, Server, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UniversitySummary {
    total_ptma: number;
    synced_success: number;
    synced_failed: number;
    mock_mode: boolean;
}

interface UniversityItem {
    id: number;
    name: string;
    short_name?: string | null;
    code?: string | null;
    ptm_code?: string | null;
}

interface SintaMetricItem {
    id: number;
    university_id: number;
    ptm_code: string;
    sinta_score_overall: string | number;
    sinta_score_3yr?: string | number;
    national_rank_overall?: number | null;
    national_rank_3yr?: number | null;
    scopus_docs?: number;
    scopus_citations?: number;
    sync_status: 'pending' | 'success' | 'failed' | string;
    sync_error?: string | null;
    last_synced_at?: string | null;
    created_at?: string;
    updated_at?: string;
    university?: UniversityItem | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedMetrics {
    data: SintaMetricItem[];
    current_page: number;
    from: number | null;
    to: number | null;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
    links: PaginationLink[];
}

interface AdminSintaIndexProps {
    metrics: PaginatedMetrics;
    summary: UniversitySummary;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'SINTA Integration',
        href: '/admin/sinta',
    },
];

export default function AdminSintaIndex({ metrics, summary }: AdminSintaIndexProps) {
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const handleSync = () => {
        setIsSyncing(true);
        setIsDialogOpen(false);

        router.post(
            route('admin.sinta.sync'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Pekerjaan sinkronisasi SINTA berhasil dijadwalkan ke queue.');
                },
                onError: (errors) => {
                    const message = Object.values(errors)[0] as string;
                    toast.error(message || 'Gagal menjadwalkan sinkronisasi SINTA.');
                },
                onFinish: () => {
                    setIsSyncing(false);
                },
            },
        );
    };

    const formatDate = (dateString?: string | null): string => {
        if (!dateString) return 'Belum pernah';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        } catch {
            return dateString;
        }
    };

    const formatScore = (val?: string | number | null): string => {
        if (val === null || val === undefined) return '0';
        const num = typeof val === 'string' ? parseFloat(val) : val;
        if (isNaN(num)) return '0';
        return num.toLocaleString('id-ID', { maximumFractionDigits: 2 });
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return (
                    <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Sukses
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="outline" className="border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Gagal
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                        <Activity className="mr-1 h-3 w-3" />
                        Pending
                    </Badge>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Integrasi SINTA — Admin" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Manajemen Integrasi SINTA</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Pusat sinkronisasi dan monitoring metrik SINTA untuk seluruh Perguruan Tinggi Muhammadiyah &amp; &apos;Aisyiyah.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button disabled={isSyncing} className="shadow-sm">
                                    {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    Sync Data Sekarang
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Konfirmasi Sinkronisasi SINTA</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tindakan ini akan menjadwalkan pembaruan metrik SINTA untuk seluruh{' '}
                                        <span className="font-semibold text-foreground">{summary.total_ptma} kampus PTMA aktif</span> ke dalam sistem
                                        antrean (background queue). Proses sinkronisasi akan berjalan di latar belakang. Lanjutkan?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleSync}>Mulai Sinkronisasi</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* 4 Quota & Status Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Kampus Target */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Kampus Target</CardTitle>
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <Building2 className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-foreground">{summary.total_ptma}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Kampus PTMA aktif terdaftar</p>
                        </CardContent>
                    </Card>

                    {/* Berhasil Sinkron */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Berhasil Sinkron</CardTitle>
                            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{summary.synced_success}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Metrik terverifikasi &amp; tersimpan</p>
                        </CardContent>
                    </Card>

                    {/* Gagal Sinkron */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Gagal Sinkron</CardTitle>
                            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
                                <ShieldAlert className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{summary.synced_failed}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Membutuhkan sinkronisasi ulang</p>
                        </CardContent>
                    </Card>

                    {/* Mode Sistem */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Mode Sistem</CardTitle>
                            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                                <Server className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="truncate text-base font-bold tracking-tight text-foreground">
                                {summary.mock_mode ? 'Mock Mode (Dev)' : 'Live API (Production)'}
                            </div>
                            <div className="mt-1">
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] tracking-wider uppercase ${
                                        summary.mock_mode
                                            ? 'border-amber-500/30 bg-amber-50/50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                                            : 'border-blue-500/30 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                                    }`}
                                >
                                    {summary.mock_mode ? 'Development Sandbox' : 'Production Active'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table & Pagination Card */}
                <Card className="border-border/60 shadow-xs">
                    <CardHeader className="border-b border-border/40 pb-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">Riwayat &amp; Status Sinkronisasi</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    Daftar metrik sinkronisasi SINTA per institusi perguruan tinggi.
                                </CardDescription>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Total: <span className="font-semibold text-foreground">{metrics.total}</span> data tercatat
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="w-[300px] font-semibold">Universitas</TableHead>
                                        <TableHead className="font-semibold">Kode PTMA</TableHead>
                                        <TableHead className="font-semibold">Skor SINTA Overall</TableHead>
                                        <TableHead className="font-semibold">Status Sinkron</TableHead>
                                        <TableHead className="font-semibold">Terakhir Disinkronkan</TableHead>
                                        <TableHead className="max-w-[260px] font-semibold">Catatan / Error</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {metrics.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Building2 className="h-8 w-8 text-muted-foreground/60" />
                                                    <p className="text-sm font-medium">Belum ada riwayat sinkronisasi SINTA.</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Klik tombol &quot;Sync Data Sekarang&quot; di atas untuk memulai pembaruan metrik.
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        metrics.data.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-muted/30">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">
                                                            {item.university?.name || `PTMA ${item.ptm_code}`}
                                                        </span>
                                                        {item.university?.short_name && (
                                                            <span className="text-xs text-muted-foreground">{item.university.short_name}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-xs font-semibold text-muted-foreground">{item.ptm_code}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                                                        {formatScore(item.sinta_score_overall)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{renderStatusBadge(item.sync_status)}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{formatDate(item.last_synced_at)}</TableCell>
                                                <TableCell className="max-w-[260px] text-xs">
                                                    {item.sync_error ? (
                                                        <span className="line-clamp-2 text-rose-600 dark:text-rose-400" title={item.sync_error}>
                                                            {item.sync_error}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground/60">—</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination controls */}
                        {metrics.links && metrics.links.length > 3 && (
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 px-6 py-4 sm:flex-row">
                                <div className="text-xs text-muted-foreground">
                                    Menampilkan{' '}
                                    <span className="font-medium text-foreground">{(metrics.current_page - 1) * metrics.per_page + 1}</span> sampai{' '}
                                    <span className="font-medium text-foreground">
                                        {Math.min(metrics.current_page * metrics.per_page, metrics.total)}
                                    </span>{' '}
                                    dari <span className="font-medium text-foreground">{metrics.total}</span> data
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {metrics.links.map((link, index) => {
                                        const isFirst = index === 0;
                                        const isLast = index === metrics.links.length - 1;

                                        if (link.url === null) {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                    className="h-8 min-w-8 px-2 text-xs text-muted-foreground opacity-50"
                                                >
                                                    {isFirst ? (
                                                        <ChevronLeft className="h-3.5 w-3.5" />
                                                    ) : isLast ? (
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    )}
                                                </Button>
                                            );
                                        }

                                        return (
                                            <Link key={index} href={link.url} preserveState preserveScroll>
                                                <Button
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    className={`h-8 min-w-8 px-2 text-xs ${link.active ? '' : 'text-muted-foreground'}`}
                                                >
                                                    {isFirst ? (
                                                        <ChevronLeft className="h-3.5 w-3.5" />
                                                    ) : isLast ? (
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    )}
                                                </Button>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
