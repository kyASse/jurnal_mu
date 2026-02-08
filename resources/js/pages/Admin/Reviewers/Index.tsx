/**
 * Admin Reviewers Index Component
 *
 * @description
 * Comprehensive list view for managing reviewers across all universities.
 * Super Admin can view, filter, toggle reviewer status, and manage reviewer profiles.
 *
 * @route GET /admin/reviewers
 * @features Filter by university/expertise/workload, search, toggle reviewer, view stats
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ScientificField, type University, type User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Award, ChevronLeft, ChevronRight, Edit, Eye, Plus, Search, UserCheck, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'User Management', href: '#' },
    { title: 'Reviewers', href: '/admin/reviewers' },
];

interface Props {
    reviewers: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    universities: University[];
    scientificFields: ScientificField[];
    filters: {
        search?: string;
        university_id?: string;
        expertise_id?: string;
        workload_status?: string;
        sort?: string;
        direction?: string;
    };
}

export default function ReviewersIndex({ reviewers, universities, scientificFields, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [universityId, setUniversityId] = useState(filters.university_id || 'all');
    const [expertiseId, setExpertiseId] = useState(filters.expertise_id || 'all');
    const [workloadStatus, setWorkloadStatus] = useState(filters.workload_status || 'all');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleFilter = () => {
        router.get(
            '/admin/reviewers',
            {
                search,
                university_id: universityId === 'all' ? '' : universityId,
                expertise_id: expertiseId === 'all' ? '' : expertiseId,
                workload_status: workloadStatus === 'all' ? '' : workloadStatus,
            },
            { preserveState: true }
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setUniversityId('all');
        setExpertiseId('all');
        setWorkloadStatus('all');
        router.get('/admin/reviewers', {}, { preserveState: true });
    };

    const handleDelete = () => {
        if (!deleteId) return;

        router.delete(`/admin/reviewers/${deleteId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Reviewer status removed successfully');
                setDeleteId(null);
            },
            onError: (errors: any) => {
                toast.error(errors.message || 'Failed to remove reviewer status');
                setDeleteId(null);
            },
        });
    };

    const getWorkloadColor = (percentage: number) => {
        if (percentage < 50) return 'bg-green-500';
        if (percentage < 80) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getWorkloadBadge = (percentage: number, isAvailable: boolean) => {
        if (!isAvailable) return <Badge variant="destructive">Full</Badge>;
        if (percentage < 50) return <Badge className="bg-green-600">Available</Badge>;
        if (percentage < 80) return <Badge className="bg-yellow-600">Busy</Badge>;
        return <Badge variant="destructive">Overloaded</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviewer Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Reviewer Management</h1>
                        <p className="text-sm text-muted-foreground">Manage reviewers and their workload across all universities</p>
                    </div>
                    <Link href="/admin/users">
                        <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add from Users
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-sidebar-border/70 bg-white p-4 dark:border-sidebar-border dark:bg-neutral-950">
                    <div className="grid gap-4 md:grid-cols-5">
                        <div className="md:col-span-2">
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                className="w-full"
                            />
                        </div>

                        <Select value={universityId || 'all'} onValueChange={setUniversityId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Universities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Universities</SelectItem>
                                {universities.map((uni) => (
                                    <SelectItem key={uni.id} value={uni.id.toString()}>
                                        {uni.short_name || uni.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={expertiseId || 'all'} onValueChange={setExpertiseId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Expertise" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Expertise</SelectItem>
                                {scientificFields.map((field) => (
                                    <SelectItem key={field.id} value={field.id.toString()}>
                                        {field.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={workloadStatus || 'all'} onValueChange={setWorkloadStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="busy">Busy</SelectItem>
                                <SelectItem value="overloaded">Overloaded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <Button onClick={handleFilter} size="sm">
                            <Search className="mr-2 h-4 w-4" />
                            Apply Filters
                        </Button>
                        <Button onClick={handleClearFilters} size="sm" variant="outline">
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-950">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reviewer</TableHead>
                                <TableHead>University</TableHead>
                                <TableHead>Workload</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviewers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Award className="mb-2 h-12 w-12 text-muted-foreground/50" />
                                            <p>No reviewers found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reviewers.data.map((reviewer) => (
                                    <TableRow key={reviewer.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {reviewer.avatar_url ? (
                                                    <img src={reviewer.avatar_url} alt={reviewer.name} className="h-10 w-10 rounded-full" />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                                        {reviewer.name
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                            .toUpperCase()
                                                            .slice(0, 2)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-foreground">{reviewer.name}</div>
                                                    <div className="text-sm text-muted-foreground">{reviewer.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-foreground">
                                                {reviewer.university?.short_name || reviewer.university?.name || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        {reviewer.current_assignments || 0} / {reviewer.max_assignments || 5}
                                                    </span>
                                                    <span className="font-medium">{reviewer.workload_percentage || 0}%</span>
                                                </div>
                                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                                                    <div
                                                        className={`h-full transition-all ${getWorkloadColor(reviewer.workload_percentage || 0)}`}
                                                        style={{ width: `${reviewer.workload_percentage || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getWorkloadBadge(reviewer.workload_percentage || 0, reviewer.is_available ?? true)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/reviewers/${reviewer.id}`}>
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/reviewers/${reviewer.id}/edit`}>
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button size="sm" variant="ghost" onClick={() => setDeleteId(reviewer.id)} className="text-red-600">
                                                    <UserCheck className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {reviewers.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <div className="text-sm text-muted-foreground">
                                Showing {(reviewers.current_page - 1) * reviewers.per_page + 1} to{' '}
                                {Math.min(reviewers.current_page * reviewers.per_page, reviewers.total)} of {reviewers.total} reviewers
                            </div>
                            <div className="flex gap-2">
                                {reviewers.links.map((link, index) => {
                                    if (link.label === '&laquo; Previous') {
                                        return (
                                            <Button
                                                key={index}
                                                size="sm"
                                                variant="outline"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url)}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                        );
                                    }
                                    if (link.label === 'Next &raquo;') {
                                        return (
                                            <Button
                                                key={index}
                                                size="sm"
                                                variant="outline"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url)}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        );
                                    }
                                    return (
                                        <Button
                                            key={index}
                                            size="sm"
                                            variant={link.active ? 'default' : 'outline'}
                                            onClick={() => link.url && router.get(link.url)}
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Reviewer Status?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the reviewer status from this user. They will no longer be able to accept coaching assignments. This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Remove Status
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
