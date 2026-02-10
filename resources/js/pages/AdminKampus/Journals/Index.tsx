/**
 * JournalsIndex Component for Admin Kampus
 *
 * @description
 * A comprehensive list view page for viewing journals within the admin's university.
 * This component provides filtering, searching, pagination for journal management and monitoring.
 *
 * @features
 * - Search by title, ISSN, or e-ISSN
 * - Filter by assessment status (Draft/Submitted/Reviewed)
 * - Filter by SINTA rank (1-6)
 * - Filter by scientific field
 * - Paginated results with navigation
 * - View journal details (coming in next iteration)
 * - Display assessment status and score
 * - Flash messages for feedback
 *
 * @route GET /admin-kampus/journals
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, Eye, Search, Upload } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Journals',
        href: '/admin-kampus/journals',
    },
];

interface Journal {
    id: number;
    title: string;
    issn: string | null;
    e_issn: string | null;
    url: string;
    university: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
    scientific_field: {
        id: number;
        name: string;
    } | null;
    sinta_rank: number | null;
    sinta_rank_label: string;
    is_active: boolean;
    assessment_status: string | null;
    assessment_status_label: string;
    latest_score: number | null;
    created_at: string;
}

interface ScientificField {
    id: number;
    name: string;
}

interface FilterOption {
    value: string | number;
    label: string;
}

interface Props {
    journals: {
        data: Journal[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search?: string;
        sinta_rank?: number;
        scientific_field_id?: number;
        indexation?: string;
        // Phase 2 filters
        pembinaan_period?: string;
        pembinaan_year?: string;
        participation?: string;
        approval_status?: string;
    };
    scientificFields: ScientificField[];
    sintaRanks: FilterOption[];
    indexationOptions: FilterOption[];
    // Phase 2 filter options
    pembinaanPeriods: FilterOption[];
    pembinaanYears: FilterOption[];
    participationOptions: FilterOption[];
    approvalStatusOptions: FilterOption[];
}

export default function JournalsIndex({
    journals,
    filters,
    scientificFields,
    sintaRanks,
    indexationOptions,
    pembinaanPeriods,
    // pembinaanYears,
    participationOptions,
    approvalStatusOptions,
}: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [sintaRankFilter, setSintaRankFilter] = useState(filters.sinta_rank?.toString() || '');
    const [scientificFieldFilter, setScientificFieldFilter] = useState(filters.scientific_field_id?.toString() || '');
    const [indexationFilter, setIndexationFilter] = useState(filters.indexation || '');
    // Phase 2 filter states
    const [pembinaanPeriodFilter, setPembinaanPeriodFilter] = useState(filters.pembinaan_period || '');
    const [pembinaanYearFilter, setPembinaanYearFilter] = useState(filters.pembinaan_year || '');
    const [participationFilter, setParticipationFilter] = useState(filters.participation || '');
    const [approvalStatusFilter, setApprovalStatusFilter] = useState(filters.approval_status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin-kampus.journals.index'),
            {
                search,
                sinta_rank: sintaRankFilter,
                scientific_field_id: scientificFieldFilter,
                indexation: indexationFilter,
                // Phase 2 filters
                pembinaan_period: pembinaanPeriodFilter,
                pembinaan_year: pembinaanYearFilter,
                participation: participationFilter,
                approval_status: approvalStatusFilter,
            },
            { preserveState: true },
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setSintaRankFilter('');
        setScientificFieldFilter('');
        setIndexationFilter('');
        // Phase 2 filters
        setPembinaanPeriodFilter('');
        setPembinaanYearFilter('');
        setParticipationFilter('');
        setApprovalStatusFilter('');
        router.get(route('admin-kampus.journals.index'));
    };

    const getStatusBadgeColor = (status: string | null) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
            case 'submitted':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'reviewed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getSintaRankColor = (rank: number | null) => {
        if (!rank) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';

        if (rank <= 2) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
        if (rank <= 4) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    };

    const hasActiveFilters = search || sintaRankFilter || scientificFieldFilter || indexationFilter;
    // Deprecated: statusFilter and accreditationGradeFilter removed from hasActiveFilters

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Journals Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                    <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    Journals Management
                                </h1>
                                <p className="mt-1 text-muted-foreground">View and monitor journals from your university</p>
                            </div>
                            <Link href={route('admin-kampus.journals.import')}>
                                <Button>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import CSV
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                            {flash.error}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by journal title, ISSN, or e-ISSN..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Filter Row */}
                            <div className="flex flex-wrap gap-4">
                                {/* Deprecated: Status Filter - No longer used */}
                                {/* <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        {statusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select> */}

                                {/* SINTA Rank Filter */}
                                <Select value={sintaRankFilter || 'all'} onValueChange={(value) => setSintaRankFilter(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="All Accreditation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Accreditation</SelectItem>
                                        {sintaRanks.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Scientific Field Filter */}
                                <Select
                                    value={scientificFieldFilter || 'all'}
                                    onValueChange={(value) => setScientificFieldFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-64">
                                        <SelectValue placeholder="All Scientific Fields" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Scientific Fields</SelectItem>
                                        {scientificFields.map((field) => (
                                            <SelectItem key={field.id} value={field.id.toString()}>
                                                {field.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Indexation Filter */}
                                <Select
                                    value={indexationFilter || 'all'}
                                    onValueChange={(value) => setIndexationFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-64">
                                        <SelectValue placeholder="All Indexations" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Indexations</SelectItem>
                                        {indexationOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filter Row 2 - Phase 2 Pembinaan & Approval Filters */}
                            <div className="flex flex-wrap gap-4">
                                {/* Pembinaan Period Filter */}
                                <Select
                                    value={pembinaanPeriodFilter || 'all'}
                                    onValueChange={(value) => setPembinaanPeriodFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-64">
                                        <SelectValue placeholder="All Periods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Periods</SelectItem>
                                        {pembinaanPeriods.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Pembinaan Year Filter 
                                <Select
                                    value={pembinaanYearFilter || 'all'}
                                    onValueChange={(value) => setPembinaanYearFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="All Years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {pembinaanYears.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select> */}

                                {/* Participation Filter */}
                                <Select
                                    value={participationFilter || 'all'}
                                    onValueChange={(value) => setParticipationFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-56">
                                        <SelectValue placeholder="All Participation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Participation</SelectItem>
                                        {participationOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Approval Status Filter */}
                                <Select
                                    value={approvalStatusFilter || 'all'}
                                    onValueChange={(value) => setApprovalStatusFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-56">
                                        <SelectValue placeholder="All Approval Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Approval Status</SelectItem>
                                        {approvalStatusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <Button type="submit">Search</Button>
                                {hasActiveFilters && (
                                    <Button type="button" variant="outline" onClick={handleClearFilters}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Results Count */}
                    <div className="mb-4 text-sm text-muted-foreground">
                        Showing {journals.data.length > 0 ? (journals.current_page - 1) * journals.per_page + 1 : 0} to{' '}
                        {Math.min(journals.current_page * journals.per_page, journals.total)} of {journals.total} journals
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Journal Title</TableHead>
                                    <TableHead>ISSN</TableHead>
                                    <TableHead>Pengelola</TableHead>
                                    <TableHead>Scientific Field</TableHead>
                                    <TableHead className="text-center">SINTA Rank</TableHead>
                                    <TableHead className="text-center">Assessment Status</TableHead>
                                    <TableHead className="text-center">Score</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {journals.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                                                <p className="font-medium text-muted-foreground">
                                                    {hasActiveFilters ? 'No journals found matching your filters' : 'Belum ada jurnal terdaftar'}
                                                </p>
                                                {!hasActiveFilters && (
                                                    <p className="text-sm text-muted-foreground">
                                                        User dapat menambahkan jurnal melalui dashboard mereka.
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    journals.data.map((journal) => (
                                        <TableRow key={journal.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-semibold text-foreground">{journal.title}</div>
                                                    <a
                                                        href={journal.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        {journal.url.substring(0, 40)}...
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {journal.issn && <div>ISSN: {journal.issn}</div>}
                                                    {journal.e_issn && <div className="text-muted-foreground">e-ISSN: {journal.e_issn}</div>}
                                                    {!journal.issn && !journal.e_issn && '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">{journal.user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{journal.user.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{journal.scientific_field?.name || '-'}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={getSintaRankColor(journal.sinta_rank)}>{journal.sinta_rank_label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={getStatusBadgeColor(journal.assessment_status)}>
                                                    {journal.assessment_status_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {journal.latest_score !== null && journal.latest_score !== undefined ? (
                                                    <span className="font-semibold text-foreground">{Number(journal.latest_score).toFixed(1)}%</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin-kampus.journals.show', journal.id)}>
                                                        <Button variant="ghost" size="sm" title="View Details">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {journals.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Page {journals.current_page} of {journals.last_page}
                            </div>
                            <div className="flex gap-2">
                                {journals.links.map((link, index) => {
                                    if (link.label === '&laquo; Previous') {
                                        return (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                        );
                                    }
                                    if (link.label === 'Next &raquo;') {
                                        return (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        );
                                    }
                                    return (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                        >
                                            {link.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
