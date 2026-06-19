import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Megaphone, Search, Pin, FileDown } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface AnnouncementItem {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    body: string;
    attachment_name: string | null;
    tags: string[] | null;
    views: number;
    is_pinned: boolean;
    published_at: string;
}

interface PaginatedData {
    data: AnnouncementItem[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    announcements: PaginatedData;
    filters?: { search?: string; sort?: string; tag?: string };
    allTags: string[];
}

export default function Index({ announcements, filters, allTags }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [sort, setSort] = useState(filters?.sort || 'new');
    const [activeTag, setActiveTag] = useState(filters?.tag || '');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('announcements.index'), { search, sort, tag: activeTag }, { preserveState: true });
    };

    const handleSortChange = (value: string) => {
        setSort(value);
        router.get(route('announcements.index'), { search, sort: value, tag: activeTag }, { preserveState: true });
    };

    const handleTagClick = (tag: string) => {
        const nextTag = activeTag === tag ? '' : tag;
        setActiveTag(nextTag);
        router.get(route('announcements.index'), { search, sort, tag: nextTag }, { preserveState: true });
    };



    return (
        <PublicLayout>
            <Head title="Announcements" />

            {/* Header / Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#079C4E] to-[#10816F] py-16 text-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#FCEE1F] opacity-10 mix-blend-overlay blur-3xl"></div>
                    <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#1A2A75] opacity-20 mix-blend-multiply blur-3xl"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-12 text-center sm:px-6 lg:px-8">
                    <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: '"El Messiri", serif' }}>
                        Official <span className="text-[#FCEE1F]">Announcements</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-emerald-50">
                        Stay updated with call for papers, official notifications, and system updates.
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="relative z-20 mx-auto -mt-8 mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                    <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search announcements..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 rounded-full pl-12 text-base"
                            />
                        </div>
                        <div className="w-full sm:w-[250px]">
                            <Select value={sort} onValueChange={handleSortChange}>
                                <SelectTrigger className="h-12 rounded-full">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">Newest</SelectItem>
                                    <SelectItem value="old">Oldest</SelectItem>
                                    <SelectItem value="A to Z">A to Z</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            className="h-12 w-full rounded-full bg-[#079C4E] px-8 font-semibold hover:bg-[#068A44] sm:w-auto"
                        >
                            Search
                        </Button>
                    </form>

                    {allTags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-semibold text-muted-foreground">Filter by tag:</span>
                            {allTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagClick(tag)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                        activeTag === tag
                                            ? 'bg-[#079C4E] border-[#079C4E] text-white'
                                            : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* List Section */}
            <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
                {announcements.data.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-muted/20 py-16 text-center">
                        <Megaphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">No announcements found</h3>
                        <p className="mt-2 text-muted-foreground">Check back later for news and calls for papers.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {announcements.data.map((item) => (
                            <article
                                key={item.id}
                                className={`group relative flex flex-col p-6 rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 ${
                                    item.is_pinned ? 'border-l-4 border-l-[#079C4E] bg-emerald-50/20 dark:bg-emerald-950/20' : ''
                                }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>
                                            {new Date(item.published_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                        <span>&bull;</span>
                                        <span>{item.views} views</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {item.is_pinned && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                <Pin className="h-3 w-3 fill-current" /> Pinned
                                            </span>
                                        )}
                                        {item.tags && item.tags.map(tag => (
                                            <span key={tag} className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-[#079C4E]">
                                    <Link href={route('announcements.show', item.slug)}>{item.title}</Link>
                                </h2>

                                <p className="mb-4 text-muted-foreground text-sm leading-relaxed">{item.summary}</p>

                                <div className="flex items-center justify-between border-t pt-4 dark:border-zinc-800">
                                    <Link
                                        href={route('announcements.show', item.slug)}
                                        className="inline-flex items-center text-sm font-bold text-[#079C4E] hover:underline"
                                    >
                                        Read Announcement &rarr;
                                    </Link>
                                    {item.attachment_name && (
                                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <FileDown className="h-4 w-4 text-emerald-600" /> {item.attachment_name}
                                        </span>
                                    )}
                                </div>
                            </article>
                        ))}
                        
                        {/* Pagination Links */}
                        {announcements.last_page > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                {announcements.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => router.visit(link.url!)}
                                        className={`px-3.5 py-2 rounded-lg text-sm border font-medium transition-all ${
                                            link.active
                                                ? 'bg-[#079C4E] border-[#079C4E] text-white'
                                                : !link.url
                                                  ? 'opacity-40 cursor-not-allowed border-transparent'
                                                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
