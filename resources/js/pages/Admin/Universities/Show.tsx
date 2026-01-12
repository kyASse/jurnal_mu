/**
 * UniversitiesShow Component
 * 
 * @description
 * A specific detail view page for university (PTM) records.
 * This component displays comprehensive information about a university,
 * including its contact details, statistics, assigned users, and journals.
 * 
 * @component
 * 
 * @interface University
 * @property {number} id - Unique identifier
 * @property {string} code - University code
 * @property {string} name - Full name
 * @property {string} logo_url - URL to logo
 * @property {boolean} is_active - Activation status
 * @property {string} full_address - Formatted address
 * @property {string} phone - Contact phone
 * @property {string} email - Contact email
 * @property {string} website - Website URL
 * @property {string} created_at - Registration date
 * @property {string} updated_at - Last modification date
 * @property {number} users_count - Count of associated users
 * @property {number} journals_count - Count of associated journals
 * 
 * @interface User
 * @property {number} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} role - User role
 * 
 * @interface Journal
 * @property {number} id - Journal ID
 * @property {string} title - Journal title
 * @property {string} issn - Journal ISSN
 * 
 * @interface Props
 * @property {University} university - The university data
 * @property {User[]} users - List of users belonging to this university
 * @property {Journal[]} journals - List of journals belonging to this university
 * @property {Object} can - User permissions
 * 
 * @route GET /admin/universities/{id}
 * 
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/components/ui/badge
 * @requires @/layouts/app-layout
 * @requires lucide-react
 * 
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/Universities/Show.tsx
 */
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import {
    ArrowLeft,
    Edit,
    Trash2,
    MapPin,
    Phone,
    Mail,
    Globe,
    Users,
    BookOpen,
    Calendar,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface University {
    id: number;
    code: string;
    name: string;
    short_name: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    phone: string;
    email: string;
    website: string;
    logo_url: string;
    is_active: boolean;
    full_address: string;
    created_at: string;
    updated_at: string;
    users_count: number;
    journals_count: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
}

interface Props {
    university: University;
    users: User[];
    journals: Journal[];
    can: {
        update: boolean;
        delete: boolean;
    };
}

export default function UniversitiesShow({ university, users, journals, can }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Universities',
            href: '/admin/universities',
        },
        {
            title: university.short_name || 'Details',
            href: `/admin/universities/${university.id}`,
        },
    ];

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${university.name}?`)) {
            router.delete(route('admin.universities.destroy', university.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={university.name} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                        <div className="mb-6">
                            <Link href={route('admin.universities.index')}>
                                <Button variant="ghost" className="mb-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to List
                                </Button>
                            </Link>

                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    {university.logo_url && (
                                        <img
                                            src={university.logo_url}
                                            alt={university.name}
                                            className="w-20 h-20 object-contain rounded-lg border border-sidebar-border/70 dark:border-sidebar-border bg-white"
                                        />
                                    )}
                                    <div>
                                        <h1 className="text-3xl font-bold text-foreground">
                                            {university.name}
                                        </h1>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Badge variant="outline" className="font-mono border-sidebar-border/70 dark:border-sidebar-border">
                                                {university.code}
                                            </Badge>
                                            {university.is_active ? (
                                                <Badge className="bg-green-100 text-green-800 border-0 dark:bg-green-900 dark:text-green-300">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {(can.update || can.delete) && (
                                    <div className="flex gap-2">
                                        {can.update && (
                                            <Link href={route('admin.universities.edit', university.id)}>
                                                <Button className="flex items-center gap-2">
                                                    <Edit className="w-4 h-4" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        )}
                                        {can.delete && (
                                            <Button
                                                variant="destructive"
                                                onClick={handleDelete}
                                                className="flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Contact Information */}
                            <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">
                                    Contact Information
                                </h2>
                                <div className="space-y-4">
                                    {university.full_address && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">Address</div>
                                                <div className="text-foreground mt-0.5">{university.full_address}</div>
                                            </div>
                                        </div>
                                    )}

                                    {university.phone && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">Phone</div>
                                                <a href={`tel:${university.phone}`} className="text-foreground hover:text-green-600 hover:underline mt-0.5 inline-block">
                                                    {university.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {university.email && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">Email</div>
                                                <a href={`mailto:${university.email}`} className="text-foreground hover:text-green-600 hover:underline mt-0.5 inline-block">
                                                    {university.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {university.website && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">Website</div>
                                                <a
                                                    href={university.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-foreground hover:text-green-600 hover:underline mt-0.5 inline-block"
                                                >
                                                    {university.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Users */}
                            <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    Users ({users.length})
                                </h2>
                                {users.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4 italic">No users assigned yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-3 rounded-lg border border-sidebar-border/50 bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div>
                                                    <div className="font-medium text-foreground">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                                <Badge variant="outline">{user.role}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Journals */}
                            <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    Journals ({journals.length})
                                </h2>
                                {journals.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4 italic">No journals registered yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {journals.map((journal) => (
                                            <div
                                                key={journal.id}
                                                className="p-3 rounded-lg border border-sidebar-border/50 bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="font-medium text-foreground">{journal.title}</div>
                                                {journal.issn && (
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        ISSN: {journal.issn}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Statistics */}
                            <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">Statistics</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-white dark:bg-black shadow-sm text-green-600 dark:text-green-400">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                                        </div>
                                        <span className="text-xl font-bold text-foreground">
                                            {university.users_count}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-white dark:bg-black shadow-sm text-amber-600 dark:text-amber-400">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">Total Journals</span>
                                        </div>
                                        <span className="text-xl font-bold text-foreground">
                                            {university.journals_count}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">Metadata</h2>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <div className="text-muted-foreground mb-1">Created At</div>
                                        <div className="flex items-center gap-2 text-foreground font-medium">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {university.created_at}
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-sidebar-border/50">
                                        <div className="text-muted-foreground mb-1">Last Updated</div>
                                        <div className="flex items-center gap-2 text-foreground font-medium">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {university.updated_at}
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