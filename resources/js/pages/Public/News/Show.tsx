import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Check, Eye, Facebook, Link2, Newspaper, Share2, Twitter } from 'lucide-react';
import { useState } from 'react';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    body: string;
    image: string | null;
    tags: string[] | null;
    views: number;
    published_at: string | null;
    author: { id: number; name: string } | null;
}

interface Props {
    news: NewsItem;
}

export default function Show({ news }: Props) {
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const copyToClipboard = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(textArea);
        }
    };

    const shareWhatsApp = () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(news.title + ' ' + shareUrl)}`, '_blank');
    };

    const shareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    const shareTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    return (
        <PublicLayout>
            <Head title={news.title} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="mb-6 flex text-sm text-muted-foreground">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <a href={route('home')} className="hover:text-foreground">
                                Home
                            </a>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="mx-2 text-zinc-400">/</span>
                                <a href={route('news.index')} className="hover:text-foreground">
                                    News
                                </a>
                            </div>
                        </li>
                        <li className="hidden sm:block">
                            <div className="flex items-center">
                                <span className="mx-2 text-zinc-400">/</span>
                                <span className="line-clamp-1 text-foreground">{news.title}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <a href={route('news.index')} className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#079C4E] hover:underline">
                    <ArrowLeft className="h-4 w-4" /> Back to all news
                </a>

                <article className="mx-auto">
                    {/* Header: Title, Subtitle, and Metadata */}
                    <div className="mb-8 text-center">
                        <h1
                            className="font-heading mx-auto mb-4 max-w-4xl text-3xl leading-tight font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl"
                            style={{ fontFamily: '"El Messiri", serif' }}
                        >
                            {news.title}
                        </h1>
                        {news.subtitle && <p className="mx-auto mb-6 max-w-3xl text-xl font-medium text-muted-foreground">{news.subtitle}</p>}

                        <div className="flex flex-wrap items-center justify-center gap-4 border-y py-4 text-sm text-muted-foreground dark:border-zinc-800">
                            <div className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span>
                                    {news.published_at
                                        ? new Date(news.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : 'Draft'}
                                </span>
                            </div>
                            <span>&bull;</span>
                            <div>
                                <span>By: </span>
                                <span className="font-semibold text-foreground">{news.author?.name || 'Super Admin'}</span>
                            </div>
                            <span>&bull;</span>
                            <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span>{news.views} views</span>
                            </div>
                        </div>
                    </div>

                    {/* Share Buttons & Main Image */}
                    <div className="relative mb-10">
                        {/* Share Overlay floating bar */}
                        <div className="mb-6 flex justify-center gap-2 sm:absolute sm:top-4 sm:right-4 sm:mb-0 sm:flex-col sm:rounded-2xl sm:bg-white/90 sm:p-2 sm:shadow-lg sm:backdrop-blur-sm dark:sm:bg-zinc-900/90">
                            <Button
                                onClick={copyToClipboard}
                                size="icon"
                                variant="outline"
                                className="rounded-full"
                                title={copied ? 'Copied!' : 'Copy Link'}
                            >
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
                            </Button>
                            <Button
                                onClick={shareWhatsApp}
                                size="icon"
                                variant="outline"
                                className="rounded-full hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20"
                                title="Share WhatsApp"
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={shareFacebook}
                                size="icon"
                                variant="outline"
                                className="rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/20"
                                title="Share Facebook"
                            >
                                <Facebook className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={shareTwitter}
                                size="icon"
                                variant="outline"
                                className="rounded-full hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-sky-950/20"
                                title="Share Twitter"
                            >
                                <Twitter className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Main Media Image */}
                        <div className="aspect-video w-full overflow-hidden rounded-3xl bg-muted shadow-lg">
                            {news.image ? (
                                <img src={`/storage/${news.image}`} alt={news.title} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-emerald-50 dark:bg-emerald-950/20">
                                    <Newspaper className="h-24 w-24 text-emerald-600/20 dark:text-emerald-400/10" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Body Text */}
                    <div className="mx-auto max-w-2xl px-2 sm:px-6">
                        <div
                            className="prose prose-lg dark:prose-invert prose-emerald max-w-none text-justify font-sans leading-relaxed text-[#242420] dark:text-[#E8E8E6] [&_p]:mt-0 [&_p]:mb-6 [&_p]:indent-8"
                            dangerouslySetInnerHTML={{ __html: news.body }}
                            style={{ fontSize: '1.125rem' }}
                        />

                        {/* Tags Badges */}
                        {news.tags && news.tags.length > 0 && (
                            <div className="mt-12 border-t pt-6 dark:border-zinc-800">
                                <span className="mr-3 mb-2 block text-sm font-semibold text-muted-foreground sm:mb-0 sm:inline">Tags:</span>
                                <div className="inline-flex flex-wrap gap-2">
                                    {news.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="cursor-pointer px-3 py-1 text-xs transition-colors hover:bg-[#079C4E] hover:text-white"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </article>
            </div>
        </PublicLayout>
    );
}
