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
    const links = [
        { label: 'Browse Journals', href: route('journals.index') },
        { label: 'Browse Articles', href: route('browse.articles') },
        { label: 'Browse Universities', href: route('browse.universities') },
    ];

    const [currentLinkIndex, setCurrentLinkIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setCurrentLinkIndex((prev) => (prev + 1) % links.length);
                setIsFading(false);
            }, 300);
        }, 4000);

        return () => clearInterval(interval);
    }, [links.length]);

    return (
        <div className="relative pt-16">
            {/* Ambient Background Radial Mesh & Academic Vector Geometry */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-hero-gradient pb-32">
                {/* Chromatic Glow Orbs: Rich Blue & Red Themes */}
                <div className="absolute -top-40 -left-32 h-[42rem] w-[42rem] rounded-full bg-primary/25 blur-[140px]" />
                <div className="absolute top-1/4 -right-32 h-[38rem] w-[38rem] rounded-full bg-secondary/30 blur-[130px] dark:bg-secondary/35" />
                <div className="absolute -bottom-24 left-1/3 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-[110px]" />

                {/* Subtle Geometric Blueprint Dot Grid */}
                <div
                    className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)`,
                        backgroundSize: '32px 32px',
                    }}
                />

                {/* Academic Contour Waves & Vector Curves */}
                <div
                    className="absolute inset-0 flex items-center justify-center opacity-70 dark:opacity-60"
                    style={{
                        maskImage: 'radial-gradient(ellipse 85% 75% at 50% 40%, black 35%, transparent 90%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 40%, black 35%, transparent 90%)',
                    }}
                >
                    <svg
                        viewBox="0 0 1440 800"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-full w-full object-cover"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="heroWaveBlueRed1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.9" />
                                <stop offset="45%" stopColor="#A78BFA" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#FB7185" stopOpacity="0.85" />
                            </linearGradient>
                            <linearGradient id="heroWaveRedBlue2" x1="100%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.9" />
                                <stop offset="55%" stopColor="#C084FC" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.75" />
                            </linearGradient>
                            <linearGradient id="heroWaveGold" x1="0%" y1="50%" x2="100%" y2="50%">
                                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
                                <stop offset="50%" stopColor="#FDE047" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.5" />
                            </linearGradient>
                        </defs>

                        {/* Topographic Editorial Waves */}
                        <path
                            d="M-100 120 C 300 20, 500 240, 900 110 C 1200 10, 1400 180, 1600 100"
                            stroke="url(#heroWaveBlueRed1)"
                            strokeWidth="1.5"
                            strokeDasharray="5 5"
                        />
                        <path
                            d="M-100 180 C 250 80, 550 300, 950 170 C 1250 80, 1450 240, 1600 160"
                            stroke="url(#heroWaveBlueRed1)"
                            strokeWidth="2"
                        />
                        <path
                            d="M-100 240 C 200 140, 600 360, 1000 230 C 1300 140, 1480 300, 1600 220"
                            stroke="url(#heroWaveGold)"
                            strokeWidth="1.25"
                        />
                        <path
                            d="M-100 300 C 150 200, 650 420, 1050 290 C 1350 200, 1500 360, 1600 280"
                            stroke="url(#heroWaveRedBlue2)"
                            strokeWidth="2"
                        />
                        <path
                            d="M-100 360 C 100 260, 700 480, 1100 350 C 1400 260, 1520 420, 1600 340"
                            stroke="url(#heroWaveRedBlue2)"
                            strokeWidth="1.5"
                            strokeDasharray="6 6"
                        />
                        <path
                            d="M-100 420 C 50 320, 750 540, 1150 410 C 1450 320, 1550 480, 1600 400"
                            stroke="url(#heroWaveBlueRed1)"
                            strokeWidth="1.25"
                        />
                        <path
                            d="M-100 480 C 0 380, 800 600, 1200 470 C 1480 380, 1580 540, 1600 460"
                            stroke="url(#heroWaveGold)"
                            strokeWidth="1.75"
                        />
                        <path
                            d="M-100 540 C -50 440, 850 660, 1250 530 C 1500 440, 1600 600, 1600 520"
                            stroke="url(#heroWaveRedBlue2)"
                            strokeWidth="1.5"
                        />

                        {/* Symmetrical Reflected Waves */}
                        <path
                            d="M-100 600 C 350 720, 700 450, 1100 620 C 1350 720, 1550 580, 1600 640"
                            stroke="url(#heroWaveBlueRed1)"
                            strokeWidth="1.25"
                            strokeDasharray="4 4"
                        />
                        <path
                            d="M-100 660 C 400 780, 750 510, 1150 680 C 1400 780, 1580 640, 1600 700"
                            stroke="url(#heroWaveRedBlue2)"
                            strokeWidth="1.5"
                        />
                    </svg>
                </div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
                {/* Headline */}
                <h1
                    className="font-heading mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl"
                    style={{ fontFamily: '"El Messiri", serif' }}
                >
                    Discover Muhammadiyah's <br />{' '}
                    <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-rose-400 bg-clip-text text-transparent drop-shadow-sm">
                        Scientific Excellence
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 sm:text-xl">
                    The central portal for academic journals, research papers, and scholarly works from Muhammadiyah Universities across
                    Indonesia.
                </p>

                {/* Floating Capsule Search Bar with Double-Bezel */}
                <div className="mx-auto max-w-2xl">
                    <div className="rounded-full bg-white/15 p-1.5 shadow-[0_25px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/30 backdrop-blur-2xl dark:bg-white/10 dark:ring-white/20">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                onSearch();
                            }}
                            className="flex items-center rounded-full bg-white px-3 py-1.5 shadow-md dark:bg-zinc-900"
                        >
                            <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
                            <input
                                type="text"
                                aria-label="Search academic content"
                                disabled={isSearching}
                                placeholder={
                                    searchType === 'journals'
                                        ? 'Search for journals, publisher, or ISSN...'
                                        : searchType === 'articles'
                                          ? 'Search for article title, author, or abstract...'
                                          : 'Search for university name or code...'
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
                                className="h-10 shrink-0 rounded-full bg-secondary px-6 text-xs font-bold text-white shadow-md transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-secondary/90 hover:shadow-lg active:scale-95 disabled:opacity-60"
                            >
                                {isSearching ? 'Loading...' : 'Search'}
                            </Button>
                        </form>
                    </div>

                    {/* Animated Quick Link suggestion */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-white/80 dark:text-slate-300">
                        <span>Can't find what you're looking for?</span>
                        <div className="inline-flex h-5 items-center overflow-hidden">
                            <Link
                                href={links[currentLinkIndex].href}
                                className={`inline-flex items-center font-semibold text-accent transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:underline ${
                                    isFading ? 'translate-y-3 scale-95 opacity-0' : 'translate-y-0 scale-100 opacity-100'
                                }`}
                            >
                                {links[currentLinkIndex].label}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3 Metric Stat Cards: Restored Original Structure & English Labels */}
            <div className="relative z-20 mx-auto -mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                    {/* Total Journals Stat Card */}
                    <div className="group relative overflow-hidden rounded-2xl border-l-4 border-l-primary bg-white p-6 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl dark:bg-zinc-900">
                        <div className="absolute -top-4 -right-4 rounded-full bg-primary/10 p-6 opacity-50 mix-blend-multiply transition-transform group-hover:scale-110 dark:bg-primary/25"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">Total Journals</p>
                                <p className="mt-2 text-4xl font-black text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('id-ID').format(totalJournals || 0)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-primary/10 p-4 text-primary dark:bg-primary/20">
                                <Library className="h-8 w-8" />
                            </div>
                        </div>
                    </div>

                    {/* Total Articles Stat Card */}
                    <div className="group relative overflow-hidden rounded-2xl border-l-4 border-l-secondary bg-white p-6 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl dark:bg-zinc-900">
                        <div className="absolute -top-4 -right-4 rounded-full bg-secondary/10 p-6 opacity-50 mix-blend-multiply transition-transform group-hover:scale-110 dark:bg-secondary/25"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">Total Articles</p>
                                <p className="mt-2 text-4xl font-black text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('id-ID').format(totalArticles || 0)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-secondary/10 p-4 text-secondary dark:bg-secondary/20 dark:text-white">
                                <BookOpen className="h-8 w-8" />
                            </div>
                        </div>
                    </div>

                    {/* Total Universities Stat Card */}
                    <div className="group relative overflow-hidden rounded-2xl border-l-4 border-l-accent bg-white p-6 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl dark:bg-zinc-900">
                        <div className="absolute -top-4 -right-4 rounded-full bg-accent/10 p-6 opacity-50 mix-blend-multiply transition-transform group-hover:scale-110 dark:bg-accent/20"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    Total Universities
                                </p>
                                <p className="mt-2 text-4xl font-black text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('id-ID').format(totalUniversities || 0)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-accent/20 p-4 text-yellow-700 dark:bg-accent/10 dark:text-yellow-400">
                                <GraduationCap className="h-8 w-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
