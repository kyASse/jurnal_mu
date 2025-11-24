/**
 * AdminKampusIndex Component
 * 
 * @description
 * A comprehensive list view page for managing campus administrators (Admin Kampus) across all PTM universities.
 * This component provides filtering, searching, pagination, and CRUD operations for admin kampus accounts.
 * It displays admin information including their assigned university, contact details, journals count, and status.
 * 
 * @component
 * 
 * @interface AdminKampus
 * @property {number} id - Unique identifier for the admin kampus
 * @property {string} name - Full name of the admin kampus
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {string} position - Job position/title
 * @property {string|null} avatar_url - URL to the profile avatar image (optional)
 * @property {boolean} is_active - Account active status
 * @property {Object|null} university - Associated university information
 * @property {number} university.id - University unique identifier
 * @property {string} university.name - Full university name
 * @property {string} university.short_name - Abbreviated university name
 * @property {string} university.code - University code
 * @property {number} journals_count - Number of journals managed by this admin
 * @property {string} last_login_at - Timestamp of last login
 * @property {string} created_at - Account creation timestamp
 * 
 * @interface University
 * @property {number} id - Unique identifier for the university
 * @property {string} name - Full name of the university
 * @property {string} short_name - Abbreviated name
 * @property {string} code - University code
 * 
 * @interface Props
 * @property {Object} adminKampus - Paginated admin kampus data
 * @property {AdminKampus[]} adminKampus.data - Array of admin kampus records
 * @property {number} adminKampus.current_page - Current page number
 * @property {number} adminKampus.last_page - Total number of pages
 * @property {number} adminKampus.per_page - Records per page
 * @property {number} adminKampus.total - Total number of records
 * @property {Array} adminKampus.links - Pagination links
 * @property {University[]} universities - Array of all universities for filtering
 * @property {Object} filters - Current filter values
 * @property {string} filters.search - Search query (name or email)
 * @property {string} filters.university_id - University filter ID
 * @property {string} filters.is_active - Active status filter
 * 
 * @param {Props} props - Component props
 * @param {Object} props.adminKampus - Paginated admin kampus data
 * @param {University[]} props.universities - List of universities for filtering
 * @param {Object} props.filters - Current applied filters
 * 
 * @returns {JSX.Element} The rendered admin kampus list page
 * 
 * @example
 * ```tsx
 * <AdminKampusIndex 
 *   adminKampus={paginatedData} 
 *   universities={universitiesList}
 *   filters={{ search: '', university_id: '', is_active: '' }}
 * />
 * ```
 * 
 * @features
 * - Search by name or email
 * - Filter by university assignment
 * - Filter by active/inactive status
 * - Paginated results with navigation
 * - View admin details
 * - Edit admin information
 * - Delete admin (with confirmation)
 * - Add new admin kampus button
 * - Flash messages for success/error feedback
 * - Responsive table layout
 * - Dark mode support
 * - Clear filters functionality
 * 
 * @route GET /admin/admin-kampus
 * 
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/components/ui/input
 * @requires @/components/ui/table
 * @requires @/components/ui/badge
 * @requires @/components/ui/select
 * @requires @/layouts/app-layout
 * @requires lucide-react
 * 
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/AdminKampus/Index.tsx
 */
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Admin Kampus',
        href: '/admin/admin-kampus',
    },
];

interface AdminKampus {
    id: number;
    name: string;
    email: string;
    phone: string;
    position: string;
    avatar_url: string | null;
    is_active: boolean;
    university: {
        id: number;
        name: string;
        short_name: string;
        code: string;
    } | null;
    journals_count: number;
    last_login_at: string;
    created_at: string;
}

interface University {
    id: number;
    name: string;
    short_name: string;
    code: string;
}

interface Props {
    adminKampus: {
        data: AdminKampus[];
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
    universities: University[];
    filters: {
        search: string;
        university_id: string;
        is_active: string;
    };
}

export default function AdminKampusIndex({ adminKampus, universities, filters}: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [universityId, setUniversityId] = useState(filters.university_id || '');
    const [isActiveFilter, setIsActiveFilter] = useState(filters.is_active || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.admin-kampus.index'),
            { search, university_id: universityId, is_active: isActiveFilter },
            { preserveState: true }
        );
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${name}?`)) {
            router.delete(route('admin.admin-kampus.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Kampus Management" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                                    <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    Admin Kampus Management
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Manage university administrators across PTM
                                </p>
                            </div>
                            <Link href={route('admin.admin-kampus.create')}>
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Admin Kampus
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                            {flash.error}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-card rounded-lg shadow-sm border border-sidebar-border/70 dark:border-sidebar-border p-4 mb-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <Input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* University Filter */}
                            <Select value={universityId || 'all'} onValueChange={(value) => setUniversityId(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="All Universities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Universities</SelectItem>
                                    {universities.map((uni) => (
                                        <SelectItem key={uni.id} value={uni.id.toString()}>
                                            {uni.code} - {uni.short_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={isActiveFilter || 'all'} onValueChange={(value) => setIsActiveFilter(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button type="submit">Search</Button>
                            {(search || universityId || isActiveFilter) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        setUniversityId('');
                                        setIsActiveFilter('');
                                        router.get(route('admin.admin-kampus.index'));
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>
                    </div>

                    {/* Table */}
                    <div className="bg-card rounded-lg shadow-sm border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Admin Kampus</TableHead>
                                    <TableHead>University</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">
                                        <BookOpen className="w-4 h-4 inline mr-1" />
                                        Journals
                                    </TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {adminKampus.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No Admin Kampus found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    adminKampus.data.map((admin) => (
                                        <TableRow key={admin.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {admin.avatar_url ? (
                                                        <img
                                                            src={admin.avatar_url}
                                                            alt={admin.name}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                                            <span className="text-green-600 dark:text-green-400 font-semibold">
                                                                {admin.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-foreground">
                                                            {admin.name}
                                                        </div>
                                                        {admin.position && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {admin.position}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {admin.university ? (
                                                    <div>
                                                        <div className="font-medium text-foreground">
                                                            {admin.university.code}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {admin.university.short_name}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{admin.email}</div>
                                                    {admin.phone && (
                                                        <div className="text-muted-foreground">{admin.phone}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {admin.is_active ? (
                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {admin.journals_count}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground">
                                                    {admin.last_login_at || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin.admin-kampus.show', admin.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('admin.admin-kampus.edit', admin.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(admin.id, admin.name)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {adminKampus.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-sidebar-border/70 dark:border-sidebar-border">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {((adminKampus.current_page - 1) * adminKampus.per_page) + 1} to{' '}
                                        {Math.min(adminKampus.current_page * adminKampus.per_page, adminKampus.total)} of{' '}
                                        {adminKampus.total} results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {adminKampus.links.map((link, index) => {
                                            if (link.url === null) return null;

                                            const isFirst = index === 0;
                                            const isLast = index === adminKampus.links.length - 1;

                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    preserveState
                                                    preserveScroll
                                                >
                                                    <Button
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                    >
                                                        {isFirst ? (
                                                            <ChevronLeft className="w-4 h-4" />
                                                        ) : isLast ? (
                                                            <ChevronRight className="w-4 h-4" />
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
        </AppLayout>
    )
}