import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { Edit2, Megaphone, Plus, Search, Trash2, Pin, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

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
        links: any[];
    };
    filters?: { search?: string };
}

export default function Index({ announcements, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');

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

    const deleteAnnouncement = (id: number) => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            router.delete(route('admin.announcements.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcement Management" />

            <div className="mx-auto max-w-7xl p-6">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <h2 className="text-2xl font-bold text-foreground">Announcement Management</h2>
                    <Link href={route('admin.announcements.create')}>
                        <Button className="bg-[#079C4E] hover:bg-[#068A44]">
                            <Plus className="mr-2 h-4 w-4" /> Create Announcement
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl border bg-white p-4 dark:bg-neutral-950">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search announcements..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" variant="outline">
                            Search
                        </Button>
                    </form>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-white overflow-hidden dark:bg-neutral-950">
                    {announcements.data.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Megaphone className="mx-auto mb-4 h-12 w-12 opacity-30" />
                            No announcements found.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/40 text-sm font-semibold">
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Audience</th>
                                    <th className="p-4 text-center">Pinned</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4">Publish Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.data.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/10 text-sm">
                                        <td className="p-4 font-medium">{item.title}</td>
                                        <td className="p-4 capitalize">{item.target_audience.replace('_', ' ')}</td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => togglePinned(item.id)} className="focus:outline-none">
                                                <Pin className={`mx-auto h-4 w-4 ${item.is_pinned ? 'text-amber-500 fill-current' : 'text-gray-300 dark:text-zinc-700'}`} />
                                            </button>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => toggleActive(item.id)} className="focus:outline-none">
                                                {item.is_active ? (
                                                    <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
                                                ) : (
                                                    <XCircle className="mx-auto h-5 w-5 text-red-500" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            {new Date(item.published_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('admin.announcements.edit', item.id)}>
                                                    <Button variant="ghost" size="icon">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(item.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
