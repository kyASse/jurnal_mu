/**
 * Admin Kampus Reviewer Index Component
 *
 * @description
 * University-scoped reviewer management page. Lists reviewers from admin's university only.
 * Provides filters by expertise and workload status, displays workload indicators, CRUD actions.
 *
 * @route GET /admin-kampus/reviewers
 * @features Filter (expertise, workload, search), workload visualization, view/edit/delete reviewers
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
import { type BreadcrumbItem, type ScientificField, type User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Search, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'User Management', href: '#' },
    { title: 'Reviewers', href: '#' },
];

interface Props {
    reviewers: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    scientificFields: ScientificField[];
    filters: {
        expertise_id?: number;
        workload_status?: string;
        search?: string;
        sort?: string;
    };
}

export default function ReviewersIndex({ reviewers, scientificFields, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; reviewer?: User }>({ open: false });

    const handleSearch = () => {
        router.get(
            '/admin-kampus/reviewers',
            {
                expertise_id: filters.expertise_id,
                workload_status: filters.workload_status,
                search: search || undefined,
                sort: filters.sort,
            },
            { preserveState: true }
        );
    };

    const handleFilter = (key: string, value: string | undefined) => {
        router.get(
            '/admin-kampus/reviewers',
            {
                ...filters,
                [key]: value || undefined,
                search: search || undefined,
            },
            { preserveState: true }
        );
    };

    const handleDelete = () => {
        if (!deleteDialog.reviewer) return;

        router.delete(`/admin-kampus/reviewers/${deleteDialog.reviewer.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Reviewer status removed successfully');
                setDeleteDialog({ open: false });
            },
            onError: () => {
                toast.error('Failed to remove reviewer status');
            },
        });
    };

    const getWorkloadColor = (percentage: number) => {
        if (percentage < 50) return 'bg-green-500';
        if (percentage < 80) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getWorkloadLabel = (percentage: number) => {
        if (percentage === 0) return 'available';
        if (percentage < 80) return 'busy';
        return 'overloaded';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviewers" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Reviewer Management</h1>
                        <p className="text-sm text-muted-foreground">Manage reviewers for coaching assignments from your university</p>
                    </div>
                    <Link href="/admin-kampus/users">
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Reviewer
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-1 items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search reviewers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="max-w-sm"
                        />
                        <Button onClick={handleSearch}>Search</Button>
                    </div>

                    <Select value={filters.expertise_id?.toString() || 'all'} onValueChange={(v) => handleFilter('expertise_id', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by Expertise" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Fields</SelectItem>
                            {scientificFields.map((field) => (
                                <SelectItem key={field.id} value={field.id.toString()}>
                                    {field.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.workload_status || 'all'} onValueChange={(v) => handleFilter('workload_status', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Workload Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="busy">Busy</SelectItem>
                            <SelectItem value="overloaded">Overloaded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reviewer</TableHead>
                                <TableHead>Workload</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviewers.data.length > 0 ? (
                                reviewers.data.map((reviewer) => {
                                    const workloadPercentage = reviewer.workload_percentage || 0;
                                    const workloadStatus = getWorkloadLabel(workloadPercentage);

                                    return (
                                        <TableRow key={reviewer.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {reviewer.avatar_url ? (
                                                        <img src={reviewer.avatar_url} alt={reviewer.name} className="h-10 w-10 rounded-full" />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                                            {reviewer.name
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .join('')
                                                                .toUpperCase()
                                                                .slice(0, 2)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-foreground">{reviewer.name}</p>
                                                        <p className="text-sm text-muted-foreground">{reviewer.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            {reviewer.current_assignments || 0} / {reviewer.max_assignments || 5}
                                                        </span>
                                                        <span className="font-medium text-foreground">{workloadPercentage}%</span>
                                                    </div>
                                                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                                                        <div className={`h-full transition-all ${getWorkloadColor(workloadPercentage)}`} style={{ width: `${workloadPercentage}%` }} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        workloadStatus === 'available' ? 'default' : workloadStatus === 'busy' ? 'secondary' : 'destructive'
                                                    }
                                                >
                                                    {workloadStatus === 'available' ? '✓ Available' : workloadStatus === 'busy' ? '⚠ Busy' : '✕ Overloaded'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin-kampus/reviewers/${reviewer.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin-kampus/reviewers/${reviewer.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="outline" size="sm" onClick={() => setDeleteDialog({ open: true, reviewer })}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No reviewers found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {reviewers.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {(reviewers.current_page - 1) * reviewers.per_page + 1} to {Math.min(reviewers.current_page * reviewers.per_page, reviewers.total)} of{' '}
                            {reviewers.total} results
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                disabled={reviewers.current_page === 1}
                                onClick={() =>
                                    router.get('/admin-kampus/reviewers', {
                                        ...filters,
                                        search: search || undefined,
                                        page: reviewers.current_page - 1,
                                    })
                                }
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                disabled={reviewers.current_page === reviewers.last_page}
                                onClick={() =>
                                    router.get('/admin-kampus/reviewers', {
                                        ...filters,
                                        search: search || undefined,
                                        page: reviewers.current_page + 1,
                                    })
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Reviewer Status?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove reviewer privileges from <strong>{deleteDialog.reviewer?.name}</strong>. They will no longer be able to review coaching
                            assignments.
                            <br />
                            <br />
                            <span className="text-yellow-600">
                                Warning: This action will fail if the reviewer has active assignments. Please reassign their coaching tasks first.
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Remove Status</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
