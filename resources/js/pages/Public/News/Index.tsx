import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PublicLayout from '@/layouts/public-layout';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, Newspaper, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    body: string;
    thumbnail: string | null;
    tags: string[] | null;
    views: number;
    published_at: string | null;
    author: { id: number; name: string } | null;
}

interface PaginatedData {
    data: NewsItem[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
}

interface Props {
    news: PaginatedData;
    filters?: { search?: string; sort?: string };
}

export default function Index({ news, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [sort, setSort] = useState(filters?.sort || 'new');
    const [newsList, setNewsList] = useState<NewsItem[]>(news.data);
    const [currentPage, setCurrentPage] = useState(news.current_page);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(news.next_page_url);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        setNewsList(news.data);
        setCurrentPage(news.current_page);
        setNextPageUrl(news.next_page_url);
    }, [news.data]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('news.index'), { search, sort }, { preserveState: true });
    };

    const handleSortChange = (value: string) => {
        setSort(value);
        router.get(route('news.index'), { search, sort: value }, { preserveState: true });
    };

    const loadMore = async () => {
        if (!nextPageUrl || loadingMore) return;
        setLoadingMore(true);

        try {
            const url = new URL(nextPageUrl, window.location.origin);
            url.searchParams.set('search', search);
            url.searchParams.set('sort', sort);

            const res = await fetch(url.toString(), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });

            if (res.ok) {
                const responseData = await res.json();
                const fetchedNews: PaginatedData = responseData.props.news;
                setNewsList((prev) => [...prev, ...fetchedNews.data]);
                setCurrentPage(fetchedNews.current_page);
                setNextPageUrl(fetchedNews.next_page_url);
            }
        } catch (err) {
            console.error('Error loading more news:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    const stripHtml = (html: string) => {
        if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
            return html.replace(/<[^>]*>/g, '');
        }
        try {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return doc.body.textContent || '';
        } catch {
            return html.replace(/<[^>]*>/g, '');
        }
    };

    return (
        <PublicLayout>
            <Head title="News & Press" />

            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#079C4E] to-[#10816F] py-16 text-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#FCEE1F] opacity-10 mix-blend-overlay blur-3xl"></div>
                    <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#1A2A75] opacity-20 mix-blend-multiply blur-3xl"></div>
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
                    ></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-12 text-center sm:px-6 lg:px-8">
                    <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: '"El Messiri", serif' }}>
                        Latest <span className="text-[#FCEE1F]">News & Updates</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-emerald-50">
                        Stay informed about network announcements, publications, achievements, and structural activities.
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
                                placeholder="Search news by title or content..."
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
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                {newsList.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-muted/20 py-16 text-center">
                        <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">No news found</h3>
                        <p className="mt-2 text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
                        {(search || sort !== 'new') && (
                            <Button
                                variant="link"
                                onClick={() => {
                                    setSearch('');
                                    setSort('new');
                                    router.get(route('news.index'));
                                }}
                                className="mt-4"
                            >
                                Clear all filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                            {newsList.map((item) => (
                                <article
                                    key={item.id}
                                    className="flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                                >
                                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                        {item.thumbnail ? (
                                            <img
                                                src={`/storage/${item.thumbnail}`}
                                                alt={item.title}
                                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-emerald-50 dark:bg-emerald-950/20">
                                                <Newspaper className="h-12 w-12 text-emerald-600/30 dark:text-emerald-400/20" />
                                            </div>
                                        )}
                                        {item.tags && item.tags.length > 0 && (
                                            <span className="absolute top-4 left-4 rounded-full bg-[#079C4E] px-3 py-1 text-xs font-bold text-white shadow-md">
                                                {item.tags[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                                            <CalendarDays className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                            <span>
                                                {item.published_at
                                                    ? new Date(item.published_at).toLocaleDateString('id-ID', {
                                                          day: 'numeric',
                                                          month: 'short',
                                                          year: 'numeric',
                                                      })
                                                    : 'Draft'}
                                            </span>
                                            {item.views > 0 && (
                                                <>
                                                    <span>&bull;</span>
                                                    <span>{item.views} views</span>
                                                </>
                                            )}
                                        </div>
                                        <h3 className="font-heading mb-2 line-clamp-2 text-xl leading-snug font-bold text-foreground transition-colors hover:text-[#079C4E] dark:hover:text-[#079C4E]">
                                            <a href={route('news.show', item.slug)}>{item.title}</a>
                                        </h3>
                                        {item.subtitle && (
                                            <p className="mb-2 line-clamp-1 text-sm font-semibold text-muted-foreground">{item.subtitle}</p>
                                        )}
                                        <p className="mb-6 line-clamp-3 flex-1 text-sm text-muted-foreground">{stripHtml(item.body)}</p>
                                        <div className="border-t pt-4 dark:border-zinc-800">
                                            <a
                                                href={route('news.show', item.slug)}
                                                className="inline-flex items-center gap-1 text-sm font-bold text-[#079C4E] hover:underline"
                                            >
                                                Read Full Article &rarr;
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {nextPageUrl && (
                            <div className="mt-12 flex justify-center">
                                <Button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    size="lg"
                                    className="rounded-full bg-[#079C4E] px-8 font-semibold hover:bg-[#068A44]"
                                >
                                    {loadingMore ? 'Loading...' : 'Load More News'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PublicLayout>
    );
}
