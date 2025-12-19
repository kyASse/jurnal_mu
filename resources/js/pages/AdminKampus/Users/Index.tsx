/**
 * UsersIndex Component for Admin Kampus
 * 
 * @description
 * A comprehensive list view page for managing users (Pengelola Jurnal) within the admin's university.
 * This component provides filtering, searching, pagination, and CRUD operations for user accounts.
 * 
 * @features
 * - Search by name or email
 * - Filter by active/inactive status
 * - Paginated results with navigation
 * - View, Edit, Delete user actions
 * - Toggle active status
 * - Add new user button
 * - Flash messages for success/error feedback
 * 
 * @route GET /admin-kampus/users
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
    Users as UsersIcon,
    Power,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'User Management',
        href: '/admin-kampus/users',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    position: string | null;
    avatar_url: string | null;
    is_active: boolean;
    journals_count: number;
    last_login_at: string | null;
    created_at: string;
}

interface University {
    id: number;
    name: string;
    short_name: string;
}

interface Props {
    users: {
        data: User[];
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
    university: University;
    filters: {
        search: string;
        is_active: string;
    };
}

export default function UsersIndex({ users, university, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [isActiveFilter, setIsActiveFilter] = useState(filters.is_active || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin-kampus.users.index'),
            { search, is_active: isActiveFilter },
            { preserveState: true }
        );
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${name}?`)) {
            router.delete(route('admin-kampus.users.destroy', id));
        }
    };

    const handleToggleActive = (id: number) => {
        router.post(route('admin-kampus.users.toggle-active', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                                    <UsersIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    User Management
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Manage users (Pengelola Jurnal) for {university.name}
                                </p>
                            </div>
                            <Link href={route('admin-kampus.users.create')}>
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add User
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
                            {(search || isActiveFilter) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        setIsActiveFilter('');
                                        router.get(route('admin-kampus.users.index'));
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
                                    <TableHead>User</TableHead>
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
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {user.avatar_url ? (
                                                        <img
                                                            src={user.avatar_url}
                                                            alt={user.name}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-foreground">
                                                            {user.name}
                                                        </div>
                                                        {user.position && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {user.position}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{user.email}</div>
                                                    {user.phone && (
                                                        <div className="text-muted-foreground">{user.phone}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {user.is_active ? (
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
                                                {user.journals_count}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground">
                                                    {user.last_login_at || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin-kampus.users.show', user.id)}>
                                                        <Button variant="ghost" size="sm" title="View Details" aria-label={`View details for ${user.name}`}>
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('admin-kampus.users.edit', user.id)}>
                                                        <Button variant="ghost" size="sm" title="Edit User" aria-label={`Edit ${user.name}`}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(user.id)}
                                                        title={user.is_active ? 'Deactivate' : 'Activate'}
                                                        aria-label={user.is_active ? `Deactivate ${user.name}` : `Activate ${user.name}`}
                                                    >
                                                        <Power className={`w-4 h-4 ${user.is_active ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(user.id, user.name)}
                                                        title="Delete User"
                                                        aria-label={`Delete ${user.name}`}
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
                        {users.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-sidebar-border/70 dark:border-sidebar-border">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {((users.current_page - 1) * users.per_page) + 1} to{' '}
                                        {Math.min(users.current_page * users.per_page, users.total)} of{' '}
                                        {users.total} results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {users.links.map((link, index) => {
                                            if (link.url === null) return null;

                                            const isFirst = index === 0;
                                            const isLast = index === users.links.length - 1;

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
                                                            <span>{link.label}</span>
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
    );
}
