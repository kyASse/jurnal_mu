import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Edit2, Megaphone, Pin, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Announcement Management', href: '/admin/announcements' },
];

interface AnnouncementItem {
    id: number;
    title: string;
    target_audience: string;
    is_pinned: boolean;
    is_active: boolean;
    views: number;
    published_at: string;
}

interface Props {
    announcements: {
        data: AnnouncementItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters?: { search?: string };
}

export default function Index({ announcements, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<AnnouncementItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.announcements.index'), { search }, { preserveState: true });
    };

    const toggleActive = (id: number) => {
        router.post(route('admin.announcements.toggle-active', id), {}, { preserveScroll: true });
    };

    const togglePinned = (id: number) => {
        router.post(route('admin.announcements.toggle-pinned', id), {}, { preserveScroll: true });
    };

    const handleDelete = (item: AnnouncementItem) => {
        setDeletingItem(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deletingItem) return;
        router.delete(route('admin.announcements.destroy', deletingItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setDeletingItem(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcement Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                <Megaphone className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                Announcement Management
                            </h1>
                            <p className="mt-1 text-muted-foreground">Publish, edit and manage public and role-targeted announcements</p>
                        </div>
                        <Link href={route('admin.announcements.create')}>
                            <Button className="bg-[#079C4E] hover:bg-[#068A44]">
                                <Plus className="mr-2 h-4 w-4" /> Create Announcement
                            </Button>
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by announcement title..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Audience</TableHead>
                                    <TableHead>Views</TableHead>
                                    <TableHead className="text-center">Pinned</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead>Publish Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {announcements.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                                            No announcements found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    announcements.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="max-w-sm truncate font-medium">{item.title}</TableCell>
                                            <TableCell className="capitalize">{item.target_audience.replace('_', ' ')}</TableCell>
                                            <TableCell>{item.views} views</TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="sm" onClick={() => togglePinned(item.id)}>
                                                    <Pin className={`h-4 w-4 ${item.is_pinned ? 'text-amber-500 fill-current' : 'text-gray-300 dark:text-zinc-700'}`} />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="sm" onClick={() => toggleActive(item.id)}>
                                                    {item.is_active ? (
                                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Draft</Badge>
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(item.published_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={route('admin.announcements.edit', item.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit2 className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {announcements.last_page > 1 && (
                            <div className="border-t border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                    <div className="text-center text-sm text-muted-foreground md:text-left">
                                        Showing {(announcements.current_page - 1) * announcements.per_page + 1} to{' '}
                                        {Math.min(announcements.current_page * announcements.per_page, announcements.total)} of {announcements.total}{' '}
                                        results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {announcements.links.map((link, index) => {
                                            if (link.url === null) return null;

                                            const isFirst = index === 0;
                                            const isLast = index === announcements.links.length - 1;

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

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {announcements.data.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">No announcements found.</CardContent>
                            </Card>
                        ) : (
                            announcements.data.map((item) => (
                                <Card key={item.id}>
                                    <div className="space-y-4 p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="line-clamp-2 text-lg font-semibold">{item.title}</h3>
                                                <p className="mt-1 text-sm text-muted-foreground capitalize">
                                                    {item.target_audience.replace('_', ' ')} &bull; {item.views} views
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {new Date(item.published_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {item.is_pinned && (
                                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex gap-1 items-center">
                                                    <Pin className="h-3 w-3 fill-current" />
                                                    Pinned
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Button variant="ghost" size="sm" className="px-0" onClick={() => toggleActive(item.id)}>
                                                {item.is_active ? (
                                                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Draft</Badge>
                                                )}
                                            </Button>
                                            <div className="flex gap-2">
                                                <Link href={route('admin.announcements.edit', item.id)}>
                                                    <Button size="sm" variant="outline">
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Delete Confirm Dialog */}
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Announcement</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete "{deletingItem?.title}"? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete}>
                                    Delete Announcement
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
