/**
 * UsersShow Component for Admin Kampus
 * 
 * @description
 * A detailed view page for displaying comprehensive information about a user (Pengelola Jurnal).
 * Shows user profile, contact information, managed journals, and account timestamps/statistics.
 * 
 * @features
 * - Display user profile with avatar
 * - Show contact information
 * - List all managed journals
 * - Display account timestamps and statistics (e.g., creation date, last login)
 * - Toggle active/inactive status
 * - Navigate to edit page
 * 
 * @route GET /admin-kampus/users/{id}
 */
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    Briefcase,
    Building2,
    Calendar,
    BookOpen,
    Power,
    Trash2,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    position: string | null;
    avatar_url: string | null;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    journals_count: number;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    scientific_field: string | null;
    created_at: string;
}

interface University {
    id: number;
    name: string;
    short_name: string;
}

interface Props {
    user: User;
    journals: Journal[];
    university: University;
}

export default function UsersShow({ user, journals, university }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'User Management',
            href: '/admin-kampus/users',
        },
        {
            title: user.name,
            href: `/admin-kampus/users/${user.id}`,
        },
    ];

    const handleToggleActive = () => {
        router.post(route('admin-kampus.users.toggle-active', user.id));
    };

    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${user.name}?`)) {
            router.delete(route('admin-kampus.users.destroy', user.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin-kampus.users.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className="w-20 h-20 rounded-full"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                        <span className="text-2xl text-blue-600 dark:text-blue-400 font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">
                                        {user.name}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        {user.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                                Inactive
                                            </Badge>
                                        )}
                                        <Badge variant="outline">User</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleToggleActive}
                                    className="flex items-center gap-2"
                                >
                                    <Power className="w-4 h-4" />
                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Link href={route('admin-kampus.users.edit', user.id)}>
                                    <Button className="flex items-center gap-2">
                                        <Edit className="w-4 h-4" />
                                        Edit User
                                    </Button>
                                </Link>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    className="flex items-center gap-2"
                                    disabled={user.journals_count > 0}
                                    title={user.journals_count > 0 ? 'Cannot delete user with journals' : 'Delete user'}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Contact Information */}
                        <div className="bg-card rounded-lg shadow-sm border border-sidebar-border/70 dark:border-sidebar-border p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                                Contact Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{user.phone || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Position</p>
                                        <p className="font-medium">{user.position || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">University</p>
                                        <p className="font-medium">{university.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity & Stats */}
                        <div className="bg-card rounded-lg shadow-sm border border-sidebar-border/70 dark:border-sidebar-border p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                                Activity & Statistics
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Managed Journals</p>
                                        <p className="font-medium">{user.journals_count}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Login</p>
                                        <p className="font-medium">{user.last_login_at || 'Never'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Created At</p>
                                        <p className="font-medium">{user.created_at}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Updated</p>
                                        <p className="font-medium">{user.updated_at}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Managed Journals */}
                    <div className="bg-card rounded-lg shadow-sm border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                        <div className="p-6 border-b border-sidebar-border/70 dark:border-sidebar-border">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Managed Journals
                            </h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>ISSN</TableHead>
                                    <TableHead>Scientific Field</TableHead>
                                    <TableHead>Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {journals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No journals managed by this user.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    journals.map((journal) => (
                                        <TableRow key={journal.id}>
                                            <TableCell className="font-medium">{journal.title}</TableCell>
                                            <TableCell>{journal.issn}</TableCell>
                                            <TableCell>{journal.scientific_field || '-'}</TableCell>
                                            <TableCell>{journal.created_at}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
