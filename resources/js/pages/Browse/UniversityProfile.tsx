import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Award, BookOpen, Building2, Download, FileText, Globe, Mail, MapPin, Phone, Search, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

interface ChartData {
    years: number[];
    journals: number[];
    articles: number[];
}

interface Props {
    university: {
        id: number;
        name: string;
        short_name: string | null;
        code: string;
        address: string | null;
        city: string | null;
        province: string | null;
        website: string | null;
        email: string | null;
        phone: string | null;
        ptm_code: string | null;
        postal_code: string | null;
        logo_url: string | null;
        accreditation_status: string | null;
        cluster: string | null;
        profile_description: string | null;
    };
    stats: {
        total_journals: number;
        total_articles: number;
        scopus_count: number;
        sinta_breakdown: Record<string, number>;
    };
    journals: any[];
    articles: any;
    years: number[];
    filters: any;
    chartData: ChartData;
}

export default function UniversityProfile({ university, stats, journals, articles, years, filters, chartData }: Props) {
    const safeFilters: any = filters && typeof filters === 'object' && !Array.isArray(filters) ? filters : {};
    const [search, setSearch] = useState(safeFilters.search ? String(safeFilters.search) : '');
    const [debouncedSearch] = useDebounce(search, 500);
    const [journalId, setJournalId] = useState(safeFilters.journal_id ? String(safeFilters.journal_id) : 'all');
    const [year, setYear] = useState(safeFilters.year ? String(safeFilters.year) : 'all');
    const [ReactApexChart, setReactApexChart] = useState<any>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    useEffect(() => {
        import('react-apexcharts').then((mod) => {
            setReactApexChart(() => mod.default);
        });
    }, []);

    const chartSeries = [
        {
            name: 'Jurnal (Kumulatif)',
            type: 'line',
            data: chartData?.journals || [],
        },
        {
            name: 'Artikel Terbit',
            type: 'column',
            data: chartData?.articles || [],
        },
    ];

    const chartOptions: any = {
        chart: {
            height: 350,
            type: 'line',
            stacked: false,
            fontFamily: 'inherit',
            toolbar: {
                show: false,
            },
        },
        stroke: {
            width: [4, 0],
            curve: 'smooth',
        },
        plotOptions: {
            bar: {
                columnWidth: '50%',
            },
        },
        colors: ['#079C4E', '#3b82f6'],
        fill: {
            opacity: [1, 0.85],
        },
        labels: (chartData?.years || []).map(String),
        markers: {
            size: [4, 0],
        },
        xaxis: {
            type: 'category',
        },
        yaxis: [
            {
                title: {
                    text: 'Jurnal (Kumulatif)',
                    style: {
                        color: '#079C4E',
                    },
                },
                labels: {
                    style: {
                        colors: '#079C4E',
                    },
                },
            },
            {
                opposite: true,
                title: {
                    text: 'Artikel Terbit',
                    style: {
                        color: '#3b82f6',
                    },
                },
                labels: {
                    style: {
                        colors: '#3b82f6',
                    },
                },
            },
        ],
        tooltip: {
            shared: true,
            intersect: false,
        },
    };

    // Trigger search update
    useEffect(() => {
        const query: any = {};
        if (debouncedSearch) query.search = debouncedSearch;
        if (journalId !== 'all') query.journal_id = journalId;
        if (year !== 'all') query.year = year;

        router.get(route('browse.universities.show', university.id), query, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    }, [debouncedSearch, journalId, year]);

    const downloadRis = (article: any) => {
        const year = article.publication_date ? new Date(article.publication_date).getFullYear() : 'Unknown';
        let authorsFormatted = 'AU  - Unknown';
        if (article.authors) {
            if (Array.isArray(article.authors)) {
                authorsFormatted = article.authors.map((a: string) => `AU  - ${a}`).join('\n');
            } else {
                authorsFormatted = `AU  - ${article.authors}`;
            }
        }

        const risLines = ['TY  - JOUR', `TI  - ${article.title}`, authorsFormatted, `JO  - ${article.journal?.title || 'Unknown'}`, `PY  - ${year}`];

        if (article.volume) risLines.push(`VL  - ${article.volume}`);
        if (article.issue) risLines.push(`IS  - ${article.issue}`);
        if (article.pages) risLines.push(`SP  - ${article.pages}`);
        if (article.doi) risLines.push(`DO  - ${article.doi}`);
        if (article.article_url) risLines.push(`UR  - ${article.article_url}`);
        if (article.abstract) risLines.push(`AB  - ${article.abstract}`);
        risLines.push('ER  -');

        const risContent = risLines.filter(Boolean).join('\n');
        const blob = new Blob([risContent], { type: 'application/x-research-info-systems;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute(
            'download',
            `${article.title
                .substring(0, 30)
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase()}.ris`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePageChange = (url: string | null) => {
        if (!url) return;
        router.get(url, {}, { preserveScroll: true });
    };

    return (
        <PublicLayout>
            <Head title={`${university.name} - JurnalMu`} />

            {/* Header Hero Section */}
            <div className="bg-gradient-to-r from-[#079C4E] to-[#056f37] py-12 text-white">
                <div className="container mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 md:flex-row">
                    {university.logo_url ? (
                        <img
                            src={university.logo_url}
                            alt={university.name}
                            className="h-24 w-24 rounded-2xl border-2 border-white/20 bg-white object-contain p-2 shadow-lg"
                        />
                    ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10 text-white shadow-lg">
                            <Building2 className="h-12 w-12" />
                        </div>
                    )}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <h1 className="font-heading text-3xl font-bold" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                {university.name}
                            </h1>
                            {university.accreditation_status && (
                                <Badge className="self-center border-none bg-[#FCEE1F] font-extrabold text-black md:self-start">
                                    {university.accreditation_status}
                                </Badge>
                            )}
                        </div>
                        <p className="mt-2 text-white/90">
                            {university.code.replace(/_/g, ' ')} {university.ptm_code && `• Kode PT: ${university.ptm_code}`}{' '}
                            {university.short_name && `• ${university.short_name}`}
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-white/80 md:justify-start">
                            {(() => {
                                const addressParts = [];
                                if (university.address) addressParts.push(university.address);
                                if (university.city) addressParts.push(university.city);

                                let provZip = '';
                                if (university.province) provZip += university.province;
                                if (university.postal_code) provZip += (provZip ? ' ' : '') + university.postal_code;
                                if (provZip) addressParts.push(provZip);

                                if (addressParts.length === 0) return null;
                                return (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-[#FCEE1F]" /> {addressParts.join(', ')}
                                    </span>
                                );
                            })()}
                            {university.website && (
                                <a
                                    href={university.website.startsWith('http') ? university.website : `https://${university.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 underline hover:text-white"
                                >
                                    <Globe className="h-4 w-4 text-[#FCEE1F]" /> {university.website}
                                </a>
                            )}
                            {university.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="h-4 w-4 text-[#FCEE1F]" /> {university.email}
                                </span>
                            )}
                            {university.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="h-4 w-4 text-[#FCEE1F]" /> {university.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-8">
                {/* Stats Grid */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 pt-6">
                            <div className="rounded-lg bg-emerald-50 p-3 text-[#079C4E]">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Jurnal</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.total_journals}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 pt-6">
                            <div className="rounded-lg bg-emerald-50 p-3 text-[#079C4E]">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Artikel</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.total_articles.toLocaleString('id-ID')}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 pt-6">
                            <div className="rounded-lg bg-emerald-50 p-3 text-[#079C4E]">
                                <Award className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Jurnal Terindeks Scopus</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.scopus_count}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 pt-6">
                            <div className="rounded-lg bg-emerald-50 p-3 text-[#079C4E]">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Cluster PT</p>
                                <h3 className="text-2xl font-bold text-gray-900">{university.cluster || '-'}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {university.profile_description && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-lg">Profil Universitas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                                {(() => {
                                    const text = university.profile_description;
                                    const limit = 300;
                                    if (text.length <= limit) {
                                        return text;
                                    }
                                    return (
                                        <>
                                            {isDescriptionExpanded ? text : `${text.slice(0, limit)}...`}
                                            <button
                                                type="button"
                                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                className="ml-2 font-bold text-[#079C4E] hover:underline focus:outline-none"
                                            >
                                                {isDescriptionExpanded ? 'Lihat Lebih Sedikit' : 'Baca Selengkapnya'}
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Development Trend Chart */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-lg">Tren Perkembangan Jurnal & Artikel</CardTitle>
                        <CardDescription>Visualisasi pertumbuhan kumulatif jumlah jurnal dan publikasi artikel setiap tahun</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {ReactApexChart ? (
                            <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={350} width="100%" />
                        ) : (
                            <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">Memuat Grafik...</div>
                        )}
                    </CardContent>
                </Card>

                {/* Sinta Chart and Registered Journals Section */}
                <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Sinta Breakdown Chart */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Klasifikasi SINTA Jurnal</CardTitle>
                            <CardDescription>Distribusi akreditasi jurnal ilmiah terdaftar</CardDescription>
                        </CardHeader>
                        <CardContent className="flex w-full flex-col items-center">
                            {ReactApexChart ? (
                                <ReactApexChart
                                    options={{
                                        chart: { type: 'donut', fontFamily: 'inherit' },
                                        labels: ['Sinta 1', 'Sinta 2', 'Sinta 3', 'Sinta 4', 'Sinta 5', 'Sinta 6', 'Tidak Terakreditasi'],
                                        colors: ['#079C4E', '#10b981', '#3b82f6', '#60a5fa', '#f59e0b', '#fca5a5', '#9ca3af'],
                                        legend: { position: 'bottom' },
                                        dataLabels: { enabled: false },
                                    }}
                                    series={[
                                        stats?.sinta_breakdown?.S1 || 0,
                                        stats?.sinta_breakdown?.S2 || 0,
                                        stats?.sinta_breakdown?.S3 || 0,
                                        stats?.sinta_breakdown?.S4 || 0,
                                        stats?.sinta_breakdown?.S5 || 0,
                                        stats?.sinta_breakdown?.S6 || 0,
                                        stats?.sinta_breakdown?.TT || 0,
                                    ]}
                                    type="donut"
                                    height={250}
                                    width="100%"
                                />
                            ) : (
                                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Memuat Grafik...</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Registered Jurnal List */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Jurnal Terdaftar ({journals.length})</CardTitle>
                            <CardDescription>Jurnal ilmiah Perguruan Tinggi yang sudah terverifikasi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {journals.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">Belum ada jurnal terdaftar</div>
                            ) : (
                                <div className="grid max-h-[300px] grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2">
                                    {journals.map((journal) => (
                                        <Link key={journal.id} href={route('journals.show', journal.id)}>
                                            <div className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:border-[#079C4E] hover:bg-emerald-50/20">
                                                <div className="flex h-10 w-8 items-center justify-center overflow-hidden rounded border bg-gray-100 text-[8px] font-bold text-gray-400">
                                                    {journal.cover_image_url ? (
                                                        <img
                                                            src={journal.cover_image_url}
                                                            alt={journal.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        'COVER'
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="truncate text-sm font-bold text-gray-900">{journal.title}</h4>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {journal.scientific_field || 'Bidang Umum'}
                                                    </p>
                                                </div>
                                                {journal.sinta_rank_label && (
                                                    <Badge className="bg-[#079C4E] text-xs text-white">{journal.sinta_rank_label}</Badge>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Articles Database Section */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="text-xl">Database Artikel Ilmiah</CardTitle>
                        <CardDescription>Telusuri artikel ilmiah yang diterbitkan oleh jurnal milik Perguruan Tinggi ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Article Filters Bar */}
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="relative">
                                <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari Judul Artikel..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <Select value={journalId} onValueChange={setJournalId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Jurnal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Jurnal</SelectItem>
                                    {journals.map((j) => (
                                        <SelectItem key={j.id} value={j.id.toString()}>
                                            {j.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Tahun Terbit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tahun Terbit</SelectItem>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Articles Table */}
                        {!articles?.data || articles.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">Artikel tidak ditemukan</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Articles & Author(s)</TableHead>
                                            <TableHead>Journal</TableHead>
                                            <TableHead>Volume</TableHead>
                                            <TableHead>Issue</TableHead>
                                            <TableHead>Year</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(articles?.data || []).map((article: any) => (
                                            <TableRow key={article.id}>
                                                <TableCell className="max-w-[320px]">
                                                    {article.article_url ? (
                                                        <a
                                                            href={article.article_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="line-clamp-2 font-bold text-gray-900 transition-colors hover:text-[#079C4E] hover:underline dark:text-white dark:hover:text-[#079C4E]"
                                                        >
                                                            {article.title}
                                                        </a>
                                                    ) : (
                                                        <div className="line-clamp-2 font-bold text-gray-900 dark:text-white">{article.title}</div>
                                                    )}
                                                    <div className="mt-1 truncate text-xs text-muted-foreground">
                                                        {Array.isArray(article.authors)
                                                            ? article.authors.join(', ')
                                                            : article.authors || 'Penulis Tidak Diketahui'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    {article.journal && (
                                                        <Link
                                                            href={route('journals.show', article.journal.id)}
                                                            className="block truncate text-xs font-semibold text-[#079C4E] hover:underline"
                                                            title={article.journal.title}
                                                        >
                                                            {article.journal.title}
                                                        </Link>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600 dark:text-gray-400">{article.volume || '-'}</TableCell>
                                                <TableCell className="text-sm text-gray-600 dark:text-gray-400">{article.issue || '-'}</TableCell>
                                                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                                    {article.publication_date ? new Date(article.publication_date).getFullYear() : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        {article.article_url && (
                                                            <a href={article.article_url} target="_blank" rel="noopener noreferrer">
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 bg-[#079C4E] px-3 text-xs text-white hover:bg-[#068442]"
                                                                >
                                                                    Buka Artikel
                                                                </Button>
                                                            </a>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => downloadRis(article)}
                                                            className="h-7 px-2 text-xs font-medium text-gray-500 hover:bg-emerald-50/50 hover:text-[#079C4E] dark:text-gray-400 dark:hover:bg-[#079C4E]/10 dark:hover:text-[#079C4E]"
                                                        >
                                                            <Download className="mr-1 h-3.5 w-3.5" />
                                                            Cite
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination */}
                        {articles?.last_page > 1 && (
                            <div className="mt-6 flex justify-center gap-1">
                                {(articles?.links || []).map((link: any, idx: number) => (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        className={link.active ? 'bg-[#079C4E] text-white hover:bg-[#068442]' : ''}
                                        onClick={() => handlePageChange(link.url)}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
