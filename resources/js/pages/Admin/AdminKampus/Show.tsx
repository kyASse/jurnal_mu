

/**
 * AdminKampusShow Component
 * 
 * @description
 * A detailed view page for displaying comprehensive information about a campus administrator (Admin Kampus).
 * This component shows the admin's profile, contact information, assigned university, managed journals,
 * statistics, and activity logs. It provides functionality to view, edit, and toggle the active status
 * of the admin kampus.
 * 
 * @component
 * 
 * @interface AdminKampus
 * @property {number} id - Unique identifier for the admin kampus
 * @property {string} name - Full name of the admin kampus
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {string} position - Job position/title
 * @property {string} avatar_url - URL to the profile avatar image
 * @property {boolean} is_active - Account active status
 * @property {Object|null} university - Associated university information
 * @property {number} university.id - University unique identifier
 * @property {string} university.name - Full university name
 * @property {string} university.short_name - Abbreviated university name
 * @property {string} university.code - University code
 * @property {string} university.city - City where university is located
 * @property {string} university.province - Province where university is located
 * @property {string} last_login_at - Timestamp of last login
 * @property {string} created_at - Account creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {number} journals_count - Number of journals managed by this admin
 * @property {number} managed_users_count - Number of users under this admin's management
 * 
 * @interface Journal
 * @property {number} id - Unique identifier for the journal
 * @property {string} title - Journal title
 * @property {string} issn - International Standard Serial Number
 * @property {string} scientific_field - Scientific field/discipline of the journal
 * 
 * @interface Props
 * @property {AdminKampus} adminKampus - The admin kampus data to display
 * @property {Journal[]} journals - Array of journals managed by this admin
 * 
 * @param {Props} props - Component props
 * @param {AdminKampus} props.adminKampus - Admin kampus details
 * @param {Journal[]} props.journals - List of managed journals
 * 
 * @returns {JSX.Element} The rendered admin kampus detail page
 * 
 * @example
 * ```tsx
 * <AdminKampusShow 
 *   adminKampus={adminKampusData} 
 *   journals={journalsList} 
 * />
 * ```
 * 
 * @features
 * - Display admin kampus profile with avatar
 * - Show contact information (email, phone, position)
 * - Display assigned university details
 * - List all managed journals in a table
 * - Show statistics (journals count, managed users count)
 * - Display activity information (last login, created at, updated at)
 * - Toggle active/inactive status
 * - Navigate to edit page
 * - Breadcrumb navigation
 * - Dark mode support
 * 
 * @route GET /admin/admin-kampus/{id}
 * 
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/components/ui/badge
 * @requires @/components/ui/table
 * @requires @/layouts/app-layout
 * @requires lucide-react
 * 
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/AdminKampus/Show.tsx
 */
import { Head, Link, router } from '@inertiajs/react';
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
    MapPin,
    Calendar,
    BookOpen,
    Users,
    Shield,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface AdminKampus {
    id: number;
    name: string;
    email: string;
    phone: string;
    position: string;
    avatar_url: string;
    is_active: boolean;
    university: {
        id: number;
        name: string;
        short_name: string;
        code: string;
        city: string;
        province: string;
    } | null;
    last_login_at: string;
    created_at: string;
    updated_at: string;
    journals_count: number;
    managed_users_count: number;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    scientific_field: string;
}

interface Props {
    adminKampus: AdminKampus;
    journals: Journal[];
}

export default function AdminKampusShow({ adminKampus, journals }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Admin Kampus',
            href: '/admin/admin-kampus',
        },
        {
            title: adminKampus.name,
            href: `/admin/admin-kampus/${adminKampus.id}`,
        },
    ];

    const handleToggleActive = () => {
        router.post(route('admin.admin-kampus.toggle-active', adminKampus.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={adminKampus.name} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.admin-kampus.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                {adminKampus.avatar_url ? (
                                    <img
                                        src={adminKampus.avatar_url}
                                        alt={adminKampus.name}
                                        className="w-20 h-20 rounded-full"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 dark:text-green-400 font-bold text-2xl">
                                            {adminKampus.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">
                                        {adminKampus.name}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Admin Kampus
                                        </Badge>
                                        {adminKampus.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">Inactive</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={adminKampus.is_active ? 'outline' : 'default'}
                                    onClick={handleToggleActive}
                                >
                                    {adminKampus.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Link href={route('admin.admin-kampus.edit', adminKampus.id)}>
                                    <Button>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Contact Information */}
                            <div className="bg-card rounded-lg shadow-sm border border-sidebar-border/70 dark:border-sidebar-border p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">
                                    Contact Information
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="text-foreground">{adminKampus.email}</p>
                                        </div>
                                    </div>
                                    {adminKampus.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Phone</p>
                                                <p className="text-foreground">{adminKampus.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {adminKampus.position && (
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Position</p>
                                                <p className="text-foreground">{adminKampus.position}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* University Information */}
                            {adminKampus.university && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        University Assignment
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">University</p>
                                                <p className="text-gray-900 font-semibold">
                                                    {adminKampus.university.code} - {adminKampus.university.name}
                                                </p>
                                            </div>
                                        </div>
                                        {(adminKampus.university.city || adminKampus.university.province) && (
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Location</p>
                                                    <p className="text-gray-900">
                                                        {adminKampus.university.city}, {adminKampus.university.province}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Managed Journals */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Managed Journals ({journals.length})
                                </h2>
                                {journals.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">
                                        No journals managed yet
                                    </p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Journal Title</TableHead>
                                                <TableHead>ISSN</TableHead>
                                                <TableHead>Scientific Field</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {journals.map((journal) => (
                                                <TableRow key={journal.id}>
                                                    <TableCell className="font-medium">
                                                        {journal.title}
                                                    </TableCell>
                                                    <TableCell>{journal.issn}</TableCell>
                                                    <TableCell>{journal.scientific_field || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Stats & Activity */}
                        <div className="space-y-6">
                            {/* Statistics */}
                            <div className="bg-card rounded-lg shadow-sm border border-sidebar-border/70 dark:border-sidebar-border p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">
                                    Statistics
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Journals</p>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {adminKampus.journals_count}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Managed Users</p>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {adminKampus.managed_users_count}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity */}
                            <div className="bg-card rounded-lg shadow-sm border border-sidebar-border/70 dark:border-sidebar-border p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">
                                    Activity
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Last Login</p>
                                            <p className="text-foreground">
                                                {adminKampus.last_login_at || 'Never'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Created At</p>
                                            <p className="text-foreground">{adminKampus.created_at}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Updated At</p>
                                            <p className="text-foreground">{adminKampus.updated_at}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}