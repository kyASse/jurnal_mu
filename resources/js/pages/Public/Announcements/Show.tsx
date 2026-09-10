import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Eye, FileDown, Paperclip } from 'lucide-react';

interface AnnouncementItem {
    id: number;
    title: string;
    slug: string;
    body: string;
    attachment_name: string | null;
    tags: string[] | null;
    views: number;
    published_at: string;
}

interface Props {
    announcement: AnnouncementItem;
}

export default function Show({ announcement }: Props) {
    return (
        <PublicLayout>
            <Head title={announcement.title} />

            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        href={route('announcements.index')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-secondary hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Announcements
                    </Link>
                </div>

                <article className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
                    {/* Header */}
                    <div className="border-b pb-6 dark:border-zinc-800">
                        <div className="mb-3 flex flex-wrap gap-2">
                            {announcement.tags &&
                                announcement.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-indigo-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                        </div>

                        <h1 className="font-heading mb-4 text-3xl font-extrabold text-foreground sm:text-4xl">{announcement.title}</h1>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4 text-primary dark:text-indigo-400" />
                                {new Date(announcement.published_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4 text-primary dark:text-indigo-400" />
                                {announcement.views} views
                            </span>
                        </div>
                    </div>

                    {/* Rich HTML Body */}
                    <div
                        className="prose prose-indigo dark:prose-invert max-w-none py-8 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: announcement.body }}
                    />

                    {/* Attachment Section */}
                    {announcement.attachment_name && (
                        <div className="mt-8 rounded-xl border bg-muted/30 p-5 dark:border-zinc-800">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2.5 dark:bg-primary/20">
                                        <Paperclip className="h-5 w-5 text-primary dark:text-indigo-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground">Attached Document</h4>
                                        <p className="text-xs text-muted-foreground">{announcement.attachment_name}</p>
                                    </div>
                                </div>
                                <a href={route('announcements.download', announcement.id)} className="block">
                                    <Button className="flex w-full items-center justify-center gap-2 bg-secondary font-semibold text-white hover:bg-secondary/90">
                                        <FileDown className="h-4 w-4" /> Download Document
                                    </Button>
                                </a>
                            </div>
                        </div>
                    )}
                </article>
            </div>
        </PublicLayout>
    );
}
