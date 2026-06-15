import RichTextEditor from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'News Management', href: '/admin/news' },
    { title: 'Create News', href: '/admin/news/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors, transform } = useForm({
        title: '',
        slug: '',
        subtitle: '',
        body: '',
        tags_input: '',
        is_active: true as boolean,
        published_at: '',
        thumbnail: null as File | null,
        image: null as File | null,
    });

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (val: string) => {
        setData((data) => ({
            ...data,
            title: val,
            slug: generateSlug(val),
        }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const tagsArray = data.tags_input
            ? data.tags_input
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0)
            : [];

        transform(
            (data) =>
                ({
                    ...data,
                    tags: tagsArray,
                }) as any,
        );

        post(route('admin.news.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create News" />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <a
                        href={route('admin.news.index')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#079C4E] hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to List
                    </a>
                </div>

                <div className="rounded-xl border border-sidebar-border bg-white p-6 shadow-sm dark:bg-neutral-950">
                    <h2 className="mb-6 text-2xl font-bold text-foreground">Create News Article</h2>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input id="title" value={data.title} onChange={(e) => handleTitleChange(e.target.value)} required className="mt-1" />
                            {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
                        </div>

                        <div>
                            <Label htmlFor="subtitle">Subtitle</Label>
                            <Input id="subtitle" value={data.subtitle} onChange={(e) => setData('subtitle', e.target.value)} className="mt-1" />
                            {errors.subtitle && <span className="text-sm text-red-500">{errors.subtitle}</span>}
                        </div>

                        <div>
                            <Label htmlFor="body">Body *</Label>
                            <RichTextEditor
                                value={data.body}
                                onChange={(val) => setData('body', val)}
                                className="mt-1 bg-white dark:bg-neutral-950"
                            />
                            {errors.body && <span className="text-sm text-red-500">{errors.body}</span>}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="thumbnail">Thumbnail Image (2MB max)</Label>
                                <Input
                                    id="thumbnail"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('thumbnail', e.target.files ? e.target.files[0] : null)}
                                    className="mt-1"
                                />
                                {errors.thumbnail && <span className="text-sm text-red-500">{errors.thumbnail}</span>}
                            </div>

                            <div>
                                <Label htmlFor="image">Main High-Res Image (4MB max)</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                    className="mt-1"
                                />
                                {errors.image && <span className="text-sm text-red-500">{errors.image}</span>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tags_input">Tags (comma separated)</Label>
                            <Input
                                id="tags_input"
                                value={data.tags_input}
                                onChange={(e) => setData('tags_input', e.target.value)}
                                placeholder="e.g. Announcement, Event, Workshop"
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="published_at">Publish Date/Time</Label>
                                <Input
                                    id="published_at"
                                    type="datetime-local"
                                    value={data.published_at}
                                    onChange={(e) => setData('published_at', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.published_at && <span className="text-sm text-red-500">{errors.published_at}</span>}
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <Label htmlFor="is_active">Publish Status (Active)</Label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 border-t pt-6">
                            <a href={route('admin.news.index')}>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </a>
                            <Button type="submit" disabled={processing} className="bg-[#079C4E] hover:bg-[#068A44]">
                                <Save className="mr-2 h-4 w-4" /> Save Article
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
