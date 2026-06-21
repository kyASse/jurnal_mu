/**
 * UniversitiesIndex Component
 *
 * @description
 * A comprehensive list view page for managing universities (PTM) in the system.
 * This component provides filtering, searching, pagination, and CRUD operations for universities.
 * It displays university information including code, name, location, stats (users/journals), and status.
 *
 * @component
 *
 * @interface University
 * @property {number} id - Unique identifier for the university
 * @property {string} code - University code (e.g., UAD, UMY)
 * @property {string} name - Full name of the university
 * @property {string} short_name - Abbreviated name
 * @property {string} city - City location
 * @property {string} province - Province location
 * @property {boolean} is_active - Active status
 * @property {number} users_count - Number of users in this university
 * @property {number} journals_count - Number of journals in this university
 * @property {string} created_at - Creation timestamp
 *
 * @interface Props
 * @property {Object} universities - Paginated university data
 * @property {Object} filters - Current filter values
 * @property {Object} can - Permissions
 *
 * @route GET /admin/universities
 *
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/components/ui/input
 * @requires @/components/ui/table
 * @requires @/components/ui/badge
 * @requires @/layouts/app-layout
 * @requires lucide-react
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/Universities/Index.tsx
 */
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Building2,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Edit,
    Eye,
    FileSpreadsheet,
    FileText,
    Plus,
    Search,
    Trash2,
    Users,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Universities',
        href: '/admin/universities',
    },
];

interface University {
    id: number;
    code: string;
    ptm_code?: string;
    name: string;
    short_name: string;
    city: string;
    province: string;
    phone: string;
    email: string;
    website: string;
    logo_url: string;
    accreditation_status?: string;
    cluster?: string;
    profile_description?: string;
    is_active: boolean;
    users_count: number;
    journals_count: number;
    full_address: string;
    created_at: string;
    pending_updates?: Record<string, string>;
}

interface PendingUniversity {
    id: number;
    name: string;
    code: string;
    ptm_code?: string;
    short_name?: string | null;
    pending_updates: Record<string, string>;
}

interface Props {
    universities: {
        data: University[];
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
        search: string;
        is_active: string;
        accreditation_status: string;
        cluster: string;
        sort?: string;
    };
    can: {
        create: boolean;
    };
    pendingUniversities?: PendingUniversity[];
}

export default function UniversitiesIndex({ universities, pendingUniversities = [], filters, can }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [isActiveFilter, setIsActiveFilter] = useState(filters.is_active || '');
    const [accreditationFilter, setAccreditationFilter] = useState(filters.accreditation_status || '');
    const [clusterFilter, setClusterFilter] = useState(filters.cluster || '');
    const [sortFilter, setSortFilter] = useState(filters.sort || 'name_asc');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; universityId?: number; universityName?: string }>({ open: false });
    const [pendingSearch, setPendingSearch] = useState('');
    const [pendingPage, setPendingPage] = useState(1);
    const pendingPerPage = 5;

    const filteredPending = pendingUniversities.filter((uni) => {
        const query = pendingSearch.toLowerCase().trim();
        if (!query) return true;
        return (
            uni.name.toLowerCase().includes(query) ||
            (uni.short_name && uni.short_name.toLowerCase().includes(query)) ||
            uni.code.toLowerCase().includes(query) ||
            (uni.pending_updates && 'name' in uni.pending_updates && uni.pending_updates.name?.toLowerCase().includes(query)) ||
            (uni.pending_updates && 'code' in uni.pending_updates && uni.pending_updates.code?.toLowerCase().includes(query)) ||
            (uni.pending_updates && 'ptm_code' in uni.pending_updates && uni.pending_updates.ptm_code?.toLowerCase().includes(query))
        );
    });

    const totalPendingPages = Math.ceil(filteredPending.length / pendingPerPage);
    const paginatedPending = filteredPending.slice((pendingPage - 1) * pendingPerPage, pendingPage * pendingPerPage);

    // Convert flash messages to toast notifications
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.universities.index'),
            {
                search,
                is_active: isActiveFilter === 'all' ? '' : isActiveFilter,
                accreditation_status: accreditationFilter === 'all' ? '' : accreditationFilter,
                cluster: clusterFilter === 'all' ? '' : clusterFilter,
                sort: sortFilter,
            },
            { preserveState: true },
        );
    };

    const handleSortChange = (value: string) => {
        setSortFilter(value);
        router.get(
            route('admin.universities.index'),
            {
                search,
                is_active: isActiveFilter === 'all' ? '' : isActiveFilter,
                accreditation_status: accreditationFilter === 'all' ? '' : accreditationFilter,
                cluster: clusterFilter === 'all' ? '' : clusterFilter,
                sort: value,
            },
            { preserveState: true },
        );
    };

    const openDeleteDialog = (id: number, name: string) => {
        setDeleteDialog({ open: true, universityId: id, universityName: name });
    };

    const confirmDelete = () => {
        if (deleteDialog.universityId) {
            router.delete(route('admin.universities.destroy', deleteDialog.universityId), {
                onSuccess: () => {
                    toast.success('University deleted successfully');
                    setDeleteDialog({ open: false });
                },
                onError: () => {
                    toast.error('Failed to delete university');
                },
            });
        }
    };

    const handleApproval = (id: number, action: 'approve' | 'reject') => {
        router.post(
            route('admin.universities.handle-pending-updates', id),
            { action },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Profile update ${action}d successfully`);
                },
                onError: () => {
                    toast.error(`Failed to ${action} profile update`);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Universities Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                    <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    Universities Management
                                </h1>
                                <p className="mt-1 text-muted-foreground">Manage Perguruan Tinggi Muhammadiyah (PTM) and their details</p>
                            </div>
                            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="flex w-full items-center gap-2 sm:w-auto">
                                            <Download className="h-4 w-4" />
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => window.open(route('admin.universities.export', 'xlsx'), '_blank')}>
                                            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                                            Export as XLSX
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => window.open(route('admin.universities.export', 'csv'), '_blank')}>
                                            <FileText className="mr-2 h-4 w-4 text-blue-600" />
                                            Export as CSV
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {can.create && (
                                    <Link href={route('admin.universities.create')}>
                                        <Button className="flex w-full items-center gap-2 md:w-auto">
                                            <Plus className="h-4 w-4" />
                                            Add University
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pending Updates Section */}
                    <div className="mb-8 rounded-xl border border-sidebar-border bg-card p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                                    <AlertCircle className="h-6 w-6 text-amber-500" />
                                    University Profile Changes Approval
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">Approve or reject university profile changes</p>
                            </div>
                            {pendingUniversities.length > 0 && (
                                <Badge
                                    variant="outline"
                                    className="border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/10 dark:text-amber-400"
                                >
                                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                                    {pendingUniversities.length} Pending
                                </Badge>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="mb-4 flex max-w-sm gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search university changes..."
                                    value={pendingSearch}
                                    onChange={(e) => {
                                        setPendingSearch(e.target.value);
                                        setPendingPage(1);
                                    }}
                                    className="h-9 pl-9"
                                />
                            </div>
                            {pendingSearch && (
                                <Button variant="ghost" size="sm" onClick={() => setPendingSearch('')} className="h-9">
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border border-sidebar-border/70">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/3">University</TableHead>
                                        <TableHead className="w-1/2">Proposed Changes</TableHead>
                                        <TableHead className="w-[150px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedPending.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                                                {pendingUniversities.length === 0
                                                    ? 'No pending university profile changes.'
                                                    : 'No pending university profile changes match search query.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedPending.map((uni) => (
                                            <TableRow key={uni.id}>
                                                <TableCell>
                                                    <div className="font-medium">{uni.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Code: {uni.code} | PTM Code: {uni.ptm_code || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <ul className="space-y-1 text-sm">
                                                        {'name' in uni.pending_updates && (
                                                            <li>
                                                                <span className="text-xs font-semibold text-muted-foreground">Name: </span>
                                                                <span className="mr-2 text-red-500 line-through">{uni.name}</span>
                                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                                    {uni.pending_updates.name || 'Deleted'}
                                                                </span>
                                                            </li>
                                                        )}
                                                        {'code' in uni.pending_updates && (
                                                            <li>
                                                                <span className="text-xs font-semibold text-muted-foreground">Abbreviation: </span>
                                                                <span className="mr-2 text-red-500 line-through">{uni.code}</span>
                                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                                    {uni.pending_updates.code || 'Deleted'}
                                                                </span>
                                                            </li>
                                                        )}
                                                        {'ptm_code' in uni.pending_updates && (
                                                            <li>
                                                                <span className="text-xs font-semibold text-muted-foreground">PTM Code: </span>
                                                                <span className="mr-2 text-red-500 line-through">{uni.ptm_code || '-'}</span>
                                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                                    {uni.pending_updates.ptm_code || '-'}
                                                                </span>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleApproval(uni.id, 'reject')}
                                                            className="h-8 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/50"
                                                        >
                                                            <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApproval(uni.id, 'approve')}
                                                            className="h-8 bg-green-600 text-white hover:bg-green-700"
                                                        >
                                                            <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPendingPages > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Page {pendingPage} of {totalPendingPages}
                                </span>
                                <div className="flex gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPendingPage((p) => Math.max(p - 1, 1))}
                                        disabled={pendingPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    {Array.from({ length: totalPendingPages }, (_, idx) => idx + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={pendingPage === page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPendingPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPendingPage((p) => Math.min(p + 1, totalPendingPages))}
                                        disabled={pendingPage === totalPendingPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handleSearch} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search by name, code, PTM code, or city..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <Select value={isActiveFilter} onValueChange={(value) => setIsActiveFilter(value)}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="1">Active</SelectItem>
                                        <SelectItem value="0">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Select value={accreditationFilter} onValueChange={(value) => setAccreditationFilter(value)}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="All Accreditation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Accreditation</SelectItem>
                                        <SelectItem value="Unggul">Unggul</SelectItem>
                                        <SelectItem value="Baik Sekali">Baik Sekali</SelectItem>
                                        <SelectItem value="Baik">Baik</SelectItem>
                                        <SelectItem value="Cukup">Cukup</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={clusterFilter} onValueChange={(value) => setClusterFilter(value)}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="All Cluster" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Cluster</SelectItem>
                                        <SelectItem value="Mandiri">Mandiri</SelectItem>
                                        <SelectItem value="Utama">Utama</SelectItem>
                                        <SelectItem value="Madya">Madya</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sortFilter} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Sort By" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                                        <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                                        <SelectItem value="code_asc">Code (A-Z)</SelectItem>
                                        <SelectItem value="code_desc">Code (Z-A)</SelectItem>
                                        <SelectItem value="ptm_code_asc">PTM Code (A-Z)</SelectItem>
                                        <SelectItem value="ptm_code_desc">PTM Code (Z-A)</SelectItem>
                                        <SelectItem value="users_desc">Most Users</SelectItem>
                                        <SelectItem value="journals_desc">Most Journals</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button type="submit" className="w-full sm:w-32">
                                    Search
                                </Button>
                                {(search ||
                                    (isActiveFilter && isActiveFilter !== 'all') ||
                                    (accreditationFilter && accreditationFilter !== 'all') ||
                                    (clusterFilter && clusterFilter !== 'all') ||
                                    (sortFilter && sortFilter !== 'name_asc')) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:w-32"
                                        onClick={() => {
                                            setSearch('');
                                            setIsActiveFilter('all');
                                            setAccreditationFilter('all');
                                            setClusterFilter('all');
                                            setSortFilter('name_asc');
                                            router.get(route('admin.universities.index'));
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Mobile Card View */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:hidden">
                        {universities.data.length === 0 ? (
                            <Card className="flex flex-col items-center justify-center border-dashed p-8 text-center">
                                <p className="text-muted-foreground">No universities found.</p>
                            </Card>
                        ) : (
                            universities.data.map((university) => (
                                <Card key={university.id} className="overflow-hidden">
                                    <CardHeader className="border-b bg-muted/20 pb-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <CardTitle className="text-lg leading-tight">{university.name}</CardTitle>
                                                {university.short_name && (
                                                    <p className="mt-1 text-sm text-muted-foreground">{university.short_name}</p>
                                                )}
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {university.code}
                                                    </Badge>
                                                    {university.ptm_code && (
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {university.ptm_code}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {university.is_active ? (
                                                <Badge className="border-0 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid gap-3 pt-4">
                                        {(university.accreditation_status || university.cluster) && (
                                            <div className="flex flex-wrap gap-2">
                                                {university.accreditation_status && (
                                                    <Badge variant="outline" className="font-medium">
                                                        {university.accreditation_status}
                                                    </Badge>
                                                )}
                                                {university.cluster && (
                                                    <Badge variant="secondary" className="font-medium">
                                                        {university.cluster}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Location</p>
                                            <p className="text-sm">
                                                {university.city && university.province ? (
                                                    <>
                                                        {university.city}, {university.province}
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-1 grid grid-cols-2 gap-4 rounded-md bg-muted/50 p-3">
                                            <div>
                                                <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                                                    <Users className="h-3.5 w-3.5" />
                                                    Users
                                                </div>
                                                <p className="mt-1 text-2xl font-semibold">{university.users_count}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                                                    <BookOpen className="h-3.5 w-3.5" />
                                                    Journals
                                                </div>
                                                <p className="mt-1 text-2xl font-semibold">{university.journals_count}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex gap-2 border-t bg-muted/10 p-3">
                                        <Link href={route('admin.universities.show', university.id)} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full gap-2">
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Button>
                                        </Link>
                                        {can.create && (
                                            <>
                                                <Link href={route('admin.universities.edit', university.id)} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full gap-2">
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 gap-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                    onClick={() => openDeleteDialog(university.id, university.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Table */}
                    <div className="hidden overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>PTM Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Accreditation</TableHead>
                                    <TableHead>Cluster</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Users className="h-4 w-4" />
                                            Users
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <BookOpen className="h-4 w-4" />
                                            Journals
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {universities.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                                            No universities found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    universities.data.map((university) => (
                                        <TableRow key={university.id}>
                                            <TableCell className="font-medium">{university.code}</TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {university.ptm_code || <span className="text-muted-foreground">-</span>}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-semibold text-foreground">{university.name}</div>
                                                    {university.short_name && (
                                                        <div className="text-sm text-muted-foreground">{university.short_name}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {university.accreditation_status ? (
                                                    <Badge variant="outline" className="font-medium">
                                                        {university.accreditation_status}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {university.cluster ? (
                                                    <Badge variant="secondary" className="font-medium">
                                                        {university.cluster}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {university.city && university.province ? (
                                                        <>
                                                            {university.city}, {university.province}
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {university.is_active ? (
                                                    <Badge className="border-0 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">{university.users_count}</TableCell>
                                            <TableCell className="text-center">{university.journals_count}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin.universities.show', university.id)}>
                                                        <Button variant="ghost" size="icon" title="View Details">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {can.create && (
                                                        <>
                                                            <Link href={route('admin.universities.edit', university.id)}>
                                                                <Button variant="ghost" size="icon" title="Edit">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => openDeleteDialog(university.id, university.name)}
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {universities.last_page > 1 && (
                            <div className="border-t border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                    <div className="text-center text-sm text-muted-foreground md:text-left">
                                        Showing {(universities.current_page - 1) * universities.per_page + 1} to{' '}
                                        {Math.min(universities.current_page * universities.per_page, universities.total)} of {universities.total}{' '}
                                        results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {universities.links.map((link, index) => {
                                            if (link.url === null) return null;

                                            const isFirst = index === 0;
                                            const isLast = index === universities.links.length - 1;

                                            return (
                                                <Link key={index} href={link.url} preserveState preserveScroll>
                                                    <Button
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        className={link.active ? '' : 'text-muted-foreground'}
                                                    >
                                                        {isFirst ? (
                                                            <ChevronLeft className="h-4 w-4" />
                                                        ) : isLast ? (
                                                            <ChevronRight className="h-4 w-4" />
                                                        ) : (
                                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                        )}
                                                    </Button>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete University</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deleteDialog.universityName}</strong>? This action cannot be undone and all
                            associated data will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
