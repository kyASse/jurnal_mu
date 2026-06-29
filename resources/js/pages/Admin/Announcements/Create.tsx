import RichTextEditor from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Announcement Management', href: '/admin/announcements' },
    { title: 'Create', href: '/admin/announcements/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        summary: '',
        body: '',
        target_audience: 'public',
        tags_input: '',
        is_pinned: false as boolean,
        is_active: true as boolean,
        published_at: '',
        attachment: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.announcements.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Announcement" />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <Link href={route('admin.announcements.index')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#079C4E] hover:underline">
                        <ArrowLeft className="h-4 w-4" /> Back to List
                    </Link>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-950">
                    <h2 className="mb-6 text-2xl font-bold">Create Announcement</h2>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required className="mt-1" />
                            {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
                        </div>

                        <div>
                            <Label htmlFor="summary">Summary (Optional snippet)</Label>
                            <Textarea id="summary" value={data.summary} onChange={(e) => setData('summary', e.target.value)} placeholder="Short excerpt. Will auto-generate from body if left empty." className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="body">Body Content *</Label>
                            <RichTextEditor value={data.body} onChange={(val) => setData('body', val)} className="mt-1" />
                            {errors.body && <span className="text-sm text-red-500">{errors.body}</span>}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="target_audience">Target Audience *</Label>
                                <select
                                    id="target_audience"
                                    value={data.target_audience}
                                    onChange={(e) => setData('target_audience', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-zinc-200 bg-white p-2 text-sm dark:border-zinc-800 dark:bg-neutral-900"
                                >
                                    <option value="public">Public (Everyone)</option>
                                    <option value="user">Author (Regular User)</option>
                                    <option value="reviewer">Reviewer</option>
                                    <option value="pengelola_jurnal">Pengelola Jurnal</option>
                                    <option value="admin_kampus">Admin Kampus</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="attachment">Document Attachment (PDF/Doc/Zip, max 5MB)</Label>
                                <Input id="attachment" type="file" onChange={(e) => setData('attachment', e.target.files ? e.target.files[0] : null)} className="mt-1" />
                                {errors.attachment && <span className="text-sm text-red-500">{errors.attachment}</span>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tags_input">Tags (comma separated)</Label>
                            <Input id="tags_input" value={data.tags_input} onChange={(e) => setData('tags_input', e.target.value)} placeholder="e.g. Call for Papers, Sinta, Maintenance" className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="published_at">Schedule Publish Date</Label>
                                <Input id="published_at" type="datetime-local" value={data.published_at} onChange={(e) => setData('published_at', e.target.value)} className="mt-1" />
                            </div>

                            <div className="flex items-center gap-6 pt-6">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={data.is_pinned} onChange={(e) => setData('is_pinned', e.target.checked)} className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm">Pin to Top</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm">Published Status (Active)</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 border-t pt-6">
                            <Link href={route('admin.announcements.index')}>
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="bg-[#079C4E] hover:bg-[#068A44]">
                                <Save className="mr-2 h-4 w-4" /> Save Announcement
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
