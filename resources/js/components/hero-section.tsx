import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { BookOpen, ChevronDown, GraduationCap, Library, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
    totalJournals: number;
    totalArticles: number;
    totalUniversities: number;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchType: 'journals' | 'articles' | 'universities';
    setSearchType: (type: 'journals' | 'articles' | 'universities') => void;
    onSearch: () => void;
    isSearching: boolean;
}

export default function HeroSection({
    totalJournals,
    totalArticles,
    totalUniversities,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    onSearch,
    isSearching,
}: HeroSectionProps) {
    const quickLinks = [
        { label: 'Telusuri Jurnal SINTA 1 & 2', href: route('journals.index', { sinta: ['S1', 'S2'] }) },
        { label: 'Jelajahi Publikasi Artikel', href: route('browse.articles') },
        { label: 'Direktori Perguruan Tinggi', href: route('browse.universities') },
    ];

    const [currentLinkIndex, setCurrentLinkIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setCurrentLinkIndex((prev) => (prev + 1) % quickLinks.length);
                setIsFading(false);
            }, 300);
        }, 4000);

        return () => clearInterval(interval);
    }, [quickLinks.length]);

    const formattedJournals = new Intl.NumberFormat('id-ID').format(totalJournals || 0);
    const formattedArticles = new Intl.NumberFormat('id-ID').format(totalArticles || 0);
    const formattedUniversities = new Intl.NumberFormat('id-ID').format(totalUniversities || 0);

    return (
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
            {/* Ambient Background Radial Mesh */}
            <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
                <div className="absolute -top-32 -left-20 h-[32rem] w-[32rem] rounded-full bg-primary/8 blur-[120px] dark:bg-primary/15" />
                <div className="absolute top-1/3 -right-20 h-[28rem] w-[28rem] rounded-full bg-secondary/6 blur-[100px] dark:bg-secondary/12" />
                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-accent/10 blur-[90px] dark:bg-accent/5" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Hero Header Content */}
                <div className="mx-auto max-w-3xl text-center">
                    {/* Eyebrow Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold tracking-[0.25em] text-primary shadow-xs dark:border-primary/25 dark:bg-primary/10 dark:text-primary-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        PORTAL REPOSITORI ILMIAH RESMI
                    </div>

                    {/* Headline */}
                    <h1
                        className="font-heading mt-6 text-4xl leading-[1.15] font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-[4rem] dark:text-white"
                        style={{ fontFamily: '"El Messiri", serif' }}
                    >
                        Eksplorasi Keunggulan <br />
                        <span className="bg-gradient-to-r from-primary via-indigo-600 to-secondary bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-300 dark:to-rose-400">
                            Publikasi Ilmiah
                        </span>{' '}
                        Muhammadiyah
                    </h1>

                    {/* Subtitle */}
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                        Pintu gerbang terpadu untuk ribuan jurnal terakreditasi, artikel bereputasi, dan riset inovatif dari Perguruan Tinggi Muhammadiyah &amp; ‘Aisyiyah se-Indonesia.
                    </p>

                    {/* Floating Capsule Search Bar with Double-Bezel */}
                    <div className="mx-auto mt-10 max-w-2xl">
                        <div className="rounded-full bg-black/[0.03] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.08] backdrop-blur-md dark:bg-white/[0.04] dark:ring-white/[0.1] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    onSearch();
                                }}
                                className="flex items-center rounded-full bg-white px-3 py-1.5 dark:bg-zinc-900"
                            >
                                <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
                                <input
                                    type="text"
                                    aria-label="Search academic content"
                                    disabled={isSearching}
                                    placeholder={
                                        searchType === 'journals'
                                            ? 'Cari nama jurnal, penerbit, atau ISSN...'
                                            : searchType === 'articles'
                                              ? 'Cari judul artikel, penulis, atau kata kunci...'
                                              : 'Cari universitas atau institusi...'
                                    }
                                    className="h-11 w-full border-0 bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-base dark:text-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />

                                {/* Divider */}
                                <div className="mx-1.5 h-6 w-px shrink-0 bg-slate-200 dark:bg-zinc-800" />

                                {/* Dropdown Selector */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            disabled={isSearching}
                                            className="mr-1 flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none disabled:opacity-50 dark:text-slate-300 dark:hover:bg-zinc-800"
                                        >
                                            {searchType === 'journals' && <Library className="h-3.5 w-3.5 text-primary" />}
                                            {searchType === 'articles' && <BookOpen className="h-3.5 w-3.5 text-secondary" />}
                                            {searchType === 'universities' && <GraduationCap className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />}
                                            <span className="capitalize">{searchType}</span>
                                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl">
                                        <DropdownMenuItem
                                            onClick={() => setSearchType('journals')}
                                            className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                                        >
                                            <Library className="h-3.5 w-3.5 text-primary" />
                                            <span>Journals</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setSearchType('articles')}
                                            className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                                        >
                                            <BookOpen className="h-3.5 w-3.5 text-secondary" />
                                            <span>Articles</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setSearchType('universities')}
                                            className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                                        >
                                            <GraduationCap className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                                            <span>Universities</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    type="submit"
                                    disabled={isSearching}
                                    className="h-10 shrink-0 rounded-full bg-primary px-6 text-xs font-semibold text-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-primary/90 hover:shadow-md active:scale-95 disabled:opacity-60"
                                >
                                    {isSearching ? 'Mencari...' : 'Search'}
                                </Button>
                            </form>
                        </div>

                        {/* Animated Quick Link suggestion */}
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <span>Pencarian cepat:</span>
                            <div className="inline-flex h-5 items-center overflow-hidden">
                                <Link
                                    href={quickLinks[currentLinkIndex].href}
                                    className={`inline-flex items-center font-medium text-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:underline dark:text-indigo-400 ${
                                        isFading ? 'translate-y-3 scale-95 opacity-0' : 'translate-y-0 scale-100 opacity-100'
                                    }`}
                                >
                                    {quickLinks[currentLinkIndex].label}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3 Metric Islands with Double-Bezel Architecture */}
                <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:gap-6">
                    {/* Total Journals */}
                    <div className="rounded-2xl bg-black/[0.02] p-1.5 ring-1 ring-black/[0.05] shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-md dark:bg-white/[0.03] dark:ring-white/[0.06]">
                        <div className="flex h-full items-center justify-between rounded-xl bg-white p-5 border border-black/[0.02] dark:border-white/[0.02] dark:bg-zinc-900/90">
                            <div>
                                <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">Total Jurnal</p>
                                <p className="mt-1.5 font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    {formattedJournals}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300">
                                <Library className="h-6 w-6 stroke-[1.75]" />
                            </div>
                        </div>
                    </div>

                    {/* Total Articles */}
                    <div className="rounded-2xl bg-black/[0.02] p-1.5 ring-1 ring-black/[0.05] shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-md dark:bg-white/[0.03] dark:ring-white/[0.06]">
                        <div className="flex h-full items-center justify-between rounded-xl bg-white p-5 border border-black/[0.02] dark:border-white/[0.02] dark:bg-zinc-900/90">
                            <div>
                                <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">Total Artikel</p>
                                <p className="mt-1.5 font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    {formattedArticles}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-rose-300">
                                <BookOpen className="h-6 w-6 stroke-[1.75]" />
                            </div>
                        </div>
                    </div>

                    {/* Total Universities */}
                    <div className="rounded-2xl bg-black/[0.02] p-1.5 ring-1 ring-black/[0.05] shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-md dark:bg-white/[0.03] dark:ring-white/[0.06]">
                        <div className="flex h-full items-center justify-between rounded-xl bg-white p-5 border border-black/[0.02] dark:border-white/[0.02] dark:bg-zinc-900/90">
                            <div>
                                <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">Perguruan Tinggi</p>
                                <p className="mt-1.5 font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    {formattedUniversities}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
                                <GraduationCap className="h-6 w-6 stroke-[1.75]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
