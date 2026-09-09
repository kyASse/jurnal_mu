import { type EventCardProps } from '@/components/event-card';
import FeaturedJournalBento from '@/components/featured-journal-bento';
import HeroSection from '@/components/hero-section';
import PublicFooter from '@/components/public-footer';
import PublicNavbar from '@/components/public-navbar';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Calendar, Clock, Download, FileText, LayoutDashboard, MapPin, User } from 'lucide-react';
import { useState } from 'react';

interface WelcomeProps extends SharedData {
    laravelVersion: string;
    phpVersion: string;
    featuredJournals: Array<{
        id: number;
        title: string;
        sinta_rank: string;
        sinta_rank_label: string;
        issn: string;
        e_issn: string;
        university: string;
        cover_image_url?: string;
        indexation_labels?: string[];
    }>;
    totalUniversities: number;
    totalJournals: number;
    totalArticles: number;
    scientificFields?: Array<{
        id: number;
        name: string;
    }>;
    upcomingEvents?: EventCardProps[];
    featuredArticles: Array<{
        id: number;
        title: string;
        authors_list: string;
        publication_date?: string;
        article_url?: string;
        pdf_url?: string;
        google_scholar_url: string;
        journal: {
            id: number;
            title: string;
        } | null;
        authors?: string[];
        volume?: string;
        issue?: string;
        pages?: string;
        doi?: string;
        doi_url?: string;
        abstract?: string;
    }>;
    topUniversities: Array<{
        id: number;
        name: string;
        short_name: string | null;
        city: string | null;
        province: string | null;
        logo_url: string | null;
        journals_count: number;
    }>;
}

function getInitials(name: string, shortName?: string | null): string {
    if (shortName) return shortName.substring(0, 3).toUpperCase();
    const words = name.split(' ');
    if (words.length >= 3) {
        return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
    } else if (words.length === 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    } else {
        return name.substring(0, 3).toUpperCase();
    }
}

export default function Welcome() {
    const { featuredJournals, totalUniversities, totalJournals, totalArticles, scientificFields, upcomingEvents, featuredArticles, topUniversities } =
        usePage<WelcomeProps>().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'journals' | 'articles' | 'universities'>('journals');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = () => {
        if (!searchQuery.trim() || isSearching) return;

        setIsSearching(true);
        const params = searchType === 'journals' ? { search: searchQuery } : searchType === 'articles' ? { q: searchQuery } : { search: searchQuery };

        const routeName = searchType === 'journals' ? 'journals.index' : searchType === 'articles' ? 'browse.articles' : 'browse.universities';

        router.get(route(routeName), params, {
            onFinish: () => setIsSearching(false),
        });
    };

    const downloadRis = (article: WelcomeProps['featuredArticles'][number]) => {
        const year = article.publication_date ? new Date(article.publication_date).getFullYear() : new Date().getFullYear();
        const authorsFormatted =
            article.authors && Array.isArray(article.authors) ? article.authors.map((a: string) => `AU  - ${a}`).join('\n') : 'AU  - Unknown';

        const risLines = ['TY  - JOUR', `TI  - ${article.title}`, authorsFormatted, `PY  - ${year}`];

        if (article.journal?.title) risLines.push(`JO  - ${article.journal.title}`);
        if (article.volume) risLines.push(`VL  - ${article.volume}`);
        if (article.issue) risLines.push(`IS  - ${article.issue}`);
        if (article.pages) risLines.push(`SP  - ${article.pages}`);
        if (article.doi) risLines.push(`DO  - ${article.doi}`);
        if (article.article_url) risLines.push(`UR  - ${article.article_url}`);
        if (article.abstract) risLines.push(`AB  - ${article.abstract}`);
        risLines.push('ER  -');

        const risContent = risLines.filter(Boolean).join('\n');
        const blob = new Blob([risContent], { type: 'application/x-research-info-systems;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute(
            'download',
            `${article.title
                .substring(0, 30)
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase()}.ris`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <Head title="JurnalMu - Muhammadiyah Journal Portal" />

            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-primary selection:text-white dark:bg-zinc-950 dark:text-zinc-100">
                <PublicNavbar />

                {/* REDESIGNED HERO SECTION (Soft Structuralism + Double-Bezel Metrics) */}
                <HeroSection
                    totalJournals={totalJournals}
                    totalArticles={totalArticles}
                    totalUniversities={totalUniversities}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchType={searchType}
                    setSearchType={setSearchType}
                    onSearch={handleSearch}
                    isSearching={isSearching}
                />

                {/* MAIN CONTENT AREA */}
                <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                    {/* REDESIGNED FEATURED JOURNALS BENTO SHOWCASE */}
                    <FeaturedJournalBento journals={featuredJournals} />

                    {/* FEATURED ARTICLES SECTION */}
                    {featuredArticles && featuredArticles.length > 0 && (
                        <div className="mt-24 mb-16">
                            <div className="mb-12 flex items-end justify-between">
                                <div>
                                    <h2 className="font-heading text-3xl font-bold text-primary" style={{ fontFamily: '"El Messiri", serif' }}>
                                        Featured Articles
                                    </h2>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">Explore research publications from Muhammadiyah scholars.</p>
                                </div>
                                <Link
                                    href={route('browse.articles')}
                                    className="group flex items-center font-semibold text-secondary hover:text-primary"
                                >
                                    Browse All Articles
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {featuredArticles.map((article) => (
                                    <div
                                        key={article.id}
                                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                                    >
                                        <div className="space-y-3">
                                            {article.journal?.title && (
                                                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/30 dark:text-primary">
                                                    {article.journal.title}
                                                </div>
                                            )}

                                            <h3 className="line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-primary dark:text-white">
                                                {article.article_url ? (
                                                    <a href={article.article_url} target="_blank" rel="noopener noreferrer">
                                                        {article.title}
                                                    </a>
                                                ) : (
                                                    article.title
                                                )}
                                            </h3>

                                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <span className="line-clamp-1">{article.authors_list}</span>
                                                </div>
                                                {article.publication_date && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span>
                                                            {new Date(article.publication_date).toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 dark:border-zinc-800/80">
                                            <div>
                                                {article.pdf_url ? (
                                                    <Button asChild size="sm" className="bg-primary font-semibold text-white hover:bg-primary/90">
                                                        <a href={article.pdf_url} target="_blank" rel="noopener noreferrer">
                                                            Read Full PDF
                                                        </a>
                                                    </Button>
                                                ) : article.article_url ? (
                                                    <Button asChild size="sm" className="bg-primary font-semibold text-white hover:bg-primary/90">
                                                        <a href={article.article_url} target="_blank" rel="noopener noreferrer">
                                                            View Article
                                                        </a>
                                                    </Button>
                                                ) : null}
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-gray-200 text-xs dark:border-zinc-700 dark:text-zinc-300"
                                                >
                                                    <a href={article.google_scholar_url} target="_blank" rel="noopener noreferrer">
                                                        Scholar
                                                    </a>
                                                </Button>

                                                {article.doi && (
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-gray-200 text-xs text-gray-700 dark:border-zinc-700 dark:text-zinc-300"
                                                    >
                                                        <a
                                                            href={article.doi_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="View Digital Object Identifier"
                                                        >
                                                            <FileText className="mr-1 h-3.5 w-3.5" />
                                                            DOI
                                                        </a>
                                                    </Button>
                                                )}

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => downloadRis(article)}
                                                    className="border-primary/20 text-xs text-primary hover:bg-primary/10 dark:border-primary/40"
                                                    title="Export RIS Citation"
                                                >
                                                    <Download className="mr-1 h-3.5 w-3.5" />
                                                    RIS
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* UPCOMING EVENTS SECTION: Split-Screen & Minimalist List */}
                    {upcomingEvents && upcomingEvents.length > 0 && (
                        <div className="mt-32 mb-24 grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
                            {/* Sticky Left Column */}
                            <div className="lg:sticky lg:top-24 lg:col-span-4">
                                <h2 className="font-heading mb-4 text-3xl font-bold text-primary" style={{ fontFamily: '"El Messiri", serif' }}>
                                    Upcoming Events
                                </h2>
                                <p className="mb-8 text-gray-600 dark:text-gray-400">
                                    Discover our curated selection of academic conferences, seminars, and workshops. Join the scholarly community to
                                    expand your knowledge.
                                </p>
                                <Button asChild className="group rounded-full bg-secondary px-6 py-6 text-base font-semibold hover:bg-secondary/90">
                                    <Link href={route('events.index')}>
                                        Explore All Events
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>

                            {/* Scrolling Right Column (Minimalist List) */}
                            <div className="space-y-4 lg:col-span-8">
                                {upcomingEvents.map((event, index) => {
                                    // Parse date
                                    const eventDate = event.date_start ? new Date(event.date_start) : null;
                                    const day = eventDate ? eventDate.getDate() : '--';
                                    const month = eventDate ? eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase() : 'TBA';

                                    return (
                                        <Link
                                            key={event.id}
                                            href={route('events.show', event.slug)}
                                            aria-label={`View details of event: ${event.title}`}
                                            className="group flex animate-fade-in-up flex-col items-start gap-6 border-b border-gray-200 py-8 transition-all hover:border-primary sm:flex-row sm:items-center dark:border-zinc-800"
                                            style={{ animationDelay: `${index * 150}ms` }}
                                        >
                                            {/* Date Box */}
                                            <div className="flex w-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-gray-50 py-4 text-center transition-colors group-hover:bg-primary/10 dark:bg-zinc-900/60">
                                                <span className="text-sm font-bold tracking-wider text-primary">{month}</span>
                                                <span className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{day}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-grow space-y-3 transition-transform duration-300 group-hover:translate-x-2">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold tracking-wide text-secondary uppercase dark:bg-secondary/30 dark:text-secondary">
                                                        {event.type}
                                                    </span>
                                                    {event.is_featured && (
                                                        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold tracking-wide text-yellow-700 uppercase">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="line-clamp-2 text-2xl leading-tight font-bold text-gray-900 transition-colors group-hover:text-primary dark:text-gray-100">
                                                    {event.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4 text-primary" />
                                                        <span>{event.time_start || 'TBA'} WIB</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="h-4 w-4 text-primary" />
                                                        <span className="capitalize">
                                                            {event.location_type.toLowerCase() === 'online'
                                                                ? 'Online'
                                                                : event.location_type.toLowerCase() === 'hybrid'
                                                                  ? `Hybrid - ${event.university?.name || 'TBA'}`
                                                                  : event.university?.name || 'Venue TBA'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hover Arrow */}
                                            <div className="hidden shrink-0 items-center justify-center rounded-full bg-gray-100 p-4 text-gray-400 transition-all duration-300 group-hover:bg-primary group-hover:text-white sm:flex dark:bg-zinc-800">
                                                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TOP UNIVERSITIES SECTION */}
                    {topUniversities && topUniversities.length > 0 && (
                        <div className="mt-24 mb-16">
                            <div className="mb-12 flex items-end justify-between">
                                <div>
                                    <h2 className="font-heading text-3xl font-bold text-primary" style={{ fontFamily: '"El Messiri", serif' }}>
                                        Top Universities
                                    </h2>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                                        Leading Muhammadiyah institutions by active scientific journals.
                                    </p>
                                </div>
                                <Link
                                    href={route('browse.universities')}
                                    className="group flex items-center font-semibold text-secondary hover:text-primary"
                                >
                                    Browse All Universities
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {topUniversities.map((uni) => (
                                    <Link
                                        key={uni.id}
                                        href={route('browse.universities.show', uni.id)}
                                        className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                                    >
                                        {/* Logo or Initials placeholder */}
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-2 group-hover:border-primary/20 dark:border-zinc-800 dark:bg-zinc-800">
                                            {uni.logo_url ? (
                                                <img src={uni.logo_url} alt={uni.name} className="h-full w-full object-contain" />
                                            ) : (
                                                <span className="text-lg font-bold text-primary dark:text-primary">
                                                    {getInitials(uni.name, uni.short_name)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="min-w-0 flex-grow space-y-1">
                                            <h3 className="truncate text-lg font-bold text-gray-900 transition-colors group-hover:text-primary dark:text-white">
                                                {uni.name}
                                            </h3>
                                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                                {uni.city ? `${uni.city}, ${uni.province || ''}` : 'Muhammadiyah Network'}
                                            </p>
                                            <div className="pt-1">
                                                <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary dark:bg-secondary/30 dark:text-white">
                                                    {uni.journals_count} {uni.journals_count === 1 ? 'Journal' : 'Journals'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* JOURNALS BY SUBJECT SECTION */}
                    {scientificFields && scientificFields.length > 0 && (
                        <div className="mt-28 overflow-hidden rounded-3xl border border-primary/20 bg-primary px-6 py-16 text-white shadow-xl sm:px-12 lg:py-20 dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="grid gap-12 lg:grid-cols-[1fr_3fr]">
                                {/* Header / Title area */}
                                <div className="space-y-6">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                                        <LayoutDashboard className="h-8 w-8 text-accent" />
                                    </div>
                                    <h2 className="font-heading text-3xl font-bold" style={{ fontFamily: '"El Messiri", serif' }}>
                                        Journals by Subject
                                    </h2>
                                    <p className="text-blue-100">
                                        Explore our extensive collection of journals categorized by scientific fields, showcasing the diverse research
                                        output from Muhammadiyah Universities across Indonesia.
                                    </p>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="mt-4 rounded-full border-white/30 bg-transparent text-white hover:bg-white hover:text-primary"
                                    >
                                        <Link href={route('journals.index')}>
                                            View all journals
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>

                                {/* Subjects Grid */}
                                <div className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
                                    {scientificFields.map((field) => (
                                        <Link
                                            key={field.id}
                                            href={route('journals.index', { scientific_field_id: field.id })}
                                            className="group flex w-full items-center justify-between border-b border-white/10 py-5 transition-colors hover:border-white/40"
                                        >
                                            <span className="font-medium text-blue-50 transition-colors group-hover:text-white">{field.name}</span>
                                            <ArrowRight className="h-4 w-4 text-white/0 transition-all group-hover:-translate-x-1 group-hover:text-white/50" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA Section */}
                    <div className="mt-24 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-2xl dark:from-[#151a43] dark:to-[#6b1013]">
                        <div
                            className="relative px-6 py-16 text-center sm:px-12 lg:py-20"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h16v16H0V0zm16 16h16v16H16V16zM0 16h16v16H0V16zM16 0h16v16H16V0z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                                backgroundSize: '24px 24px',
                            }}
                        >
                            <div className="relative z-10 mx-auto max-w-3xl">
                                <h2
                                    className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
                                    style={{ fontFamily: '"El Messiri", serif' }}
                                >
                                    Publish Your Research With Us
                                </h2>
                                <p className="mt-4 text-lg text-blue-100">
                                    Join thousands of authors contributing to the advancement of science and technology through Muhammadiyah's network
                                    of accredited journals.
                                </p>
                                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="w-full bg-accent px-8 text-lg font-bold text-primary hover:bg-accent/90 sm:w-auto"
                                    >
                                        <Link href={route('login')}>Submit Manuscript</Link>
                                    </Button>
                                    {/* <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full border-white px-8 text-white hover:bg-white hover:text-secondary sm:w-auto"
                                    >
                                        Author Guidelines
                                    </Button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <PublicFooter />
            </div>
        </>
    );
}
