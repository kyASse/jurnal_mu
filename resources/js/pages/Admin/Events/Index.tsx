/**
 * @route GET /admin/events
 * @features Display all events list for Super Admin with search, filter, and delete actions
 */
import { Head, router } from '@inertiajs/react';
import { CalendarDays, Search, Trash2, Star, CheckCircle, XCircle } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface PaginationData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Agenda {
    id: number;
    title: string;
    type: string;
    date_start: string;
    is_active: boolean;
    is_featured: boolean;
    university: string | null;
    creator: string | null;
}

interface Props {
    events: PaginationData<Agenda>;
    filters?: {
        search?: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Agendas & Events', href: '/admin/events' },
];

export default function EventsIndex({ events, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingEvent, setDeletingEvent] = useState<Agenda | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.events.index'), { search }, { preserveState: true });
    };

    const handleDelete = (agenda: Agenda) => {
        setDeletingEvent(agenda);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deletingEvent) return;
        router.delete(route('admin.events.destroy', deletingEvent.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setDeletingEvent(null);
            },
        });
    };

    const toggleActive = (id: number) => {
        router.post(route('admin.events.toggle-active', id), {}, { preserveScroll: true });
    };

    const toggleFeatured = (id: number) => {
        router.post(route('admin.events.toggle-featured', id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Events Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                <CalendarDays className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                All Events Management
                            </h1>
                            <p className="mt-1 text-muted-foreground">Monitor and manage all university events</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by event title..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                            {search && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        router.get(route('admin.events.index'));
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>University</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Featured</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                            No events found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    events.data.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="font-medium">
                                                <div>{event.title}</div>
                                                <div className="text-xs text-muted-foreground capitalize">{event.type}</div>
                                            </TableCell>
                                            <TableCell>{event.university || 'N/A'}</TableCell>
                                            <TableCell>{new Date(event.date_start).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-center">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => toggleActive(event.id)}
                                                    title="Toggle Active Status"
                                                >
                                                    {event.is_active ? (
                                                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Draft</Badge>
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => toggleFeatured(event.id)}
                                                    title="Toggle Featured Status"
                                                >
                                                    {event.is_featured ? (
                                                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                                    ) : (
                                                        <Star className="h-5 w-5 text-gray-300" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(event)}
                                                        title="Delete Event"
                                                        aria-label="Delete Event"
                                                    >
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
                        {events.data.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">No events found.</CardContent>
                            </Card>
                        ) : (
                            events.data.map((event) => (
                                <Card key={event.id}>
                                    <div className="space-y-4 p-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">{event.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground capitalize">
                                                {event.university || 'N/A'} &bull; {new Date(event.date_start).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="px-0"
                                                    onClick={() => toggleActive(event.id)}
                                                >
                                                    {event.is_active ? (
                                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Draft</Badge>
                                                    )}
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="px-0"
                                                    onClick={() => toggleFeatured(event.id)}
                                                >
                                                    {event.is_featured ? (
                                                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                                    ) : (
                                                        <Star className="h-5 w-5 text-gray-300" />
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(event)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Dialog */}
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Event</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete "{deletingEvent?.title}"? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete}>
                                    Delete Event
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
