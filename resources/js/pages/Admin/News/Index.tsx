import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit2, Newspaper, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    views: number;
    is_active: boolean;
    published_at: string | null;
}

interface PaginationData {
    data: NewsItem[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    news: PaginationData;
    filters?: { search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'News Management', href: '/admin/news' },
];

export default function Index({ news, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<NewsItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.news.index'), { search }, { preserveState: true });
    };

    const handleDelete = (item: NewsItem) => {
        setDeletingItem(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deletingItem) return;
        router.delete(route('admin.news.destroy', deletingItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setDeletingItem(null);
            },
        });
    };

    const toggleActive = (id: number) => {
        router.post(route('admin.news.toggle-active', id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="News Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                <Newspaper className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                News Management
                            </h1>
                            <p className="mt-1 text-muted-foreground">Publish, edit and manage public news updates</p>
                        </div>
                        <Link href={route('admin.news.create')}>
                            <Button className="bg-[#079C4E] hover:bg-[#068A44]">
                                <Plus className="mr-2 h-4 w-4" /> Create News
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
                                    placeholder="Search by news title..."
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
                                    <TableHead>Views</TableHead>
                                    <TableHead>Published Date</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {news.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                            No news found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    news.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="max-w-sm truncate font-medium">{item.title}</TableCell>
                                            <TableCell>{item.views} views</TableCell>
                                            <TableCell>{item.published_at ? new Date(item.published_at).toLocaleDateString() : 'N/A'}</TableCell>
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
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={route('admin.news.edit', item.id)}>
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
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {news.data.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">No news found.</CardContent>
                            </Card>
                        ) : (
                            news.data.map((item) => (
                                <Card key={item.id}>
                                    <div className="space-y-4 p-4">
                                        <div>
                                            <h3 className="truncate text-lg font-semibold">{item.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {item.views} views &bull;{' '}
                                                {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Draft'}
                                            </p>
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
                                                <Link href={route('admin.news.edit', item.id)}>
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
                                <DialogTitle>Delete News Article</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete "{deletingItem?.title}"? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete}>
                                    Delete Article
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
