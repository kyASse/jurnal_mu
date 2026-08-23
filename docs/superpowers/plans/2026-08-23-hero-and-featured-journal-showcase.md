# Hero & Featured Journal Showcase Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Hero and Featured Journal Showcase sections on JurnalMu's landing page (`welcome.tsx`) applying Soft Structuralism with Editorial Luxury accents, Asymmetrical Bento Grid for SINTA 1 & 2 journals, Double-Bezel card architecture, nested "Telusuri Publikasi" CTA button, and fluid motion transitions.

**Architecture:** Split the presentation into clean, modular React components (`HeroSection` and `FeaturedJournalBento`), using concentric Double-Bezel nesting math for cards, custom cubic-bezier hover physics, and an IntersectionObserver-driven scroll entry hook. Wire them directly into `welcome.tsx` while preserving all existing Inertia search routes and data contracts.

**Tech Stack:** React 19, TypeScript, Inertia.js (v2), Tailwind CSS v4, Lucide React, Vitest, Testing Library.

---

### Task 1: Create Scroll Reveal Hook & Cubic-Bezier Transition Utility

**Files:**
- Create: `resources/js/hooks/use-scroll-reveal.ts`
- Test: `resources/js/hooks/__tests__/use-scroll-reveal.test.ts`

- [ ] **Step 1: Write test for scroll reveal hook**

```typescript
// resources/js/hooks/__tests__/use-scroll-reveal.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useScrollReveal } from '../use-scroll-reveal';

describe('useScrollReveal', () => {
    let observeMock: ReturnType<typeof vi.fn>;
    let disconnectMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        observeMock = vi.fn();
        disconnectMock = vi.fn();

        (window as any).IntersectionObserver = vi.fn().mockImplementation((callback: any) => {
            return {
                observe: observeMock,
                disconnect: disconnectMock,
                unobserve: vi.fn(),
            };
        });
    });

    it('initializes with isVisible false and attaches observer', () => {
        const { result } = renderHook(() => useScrollReveal());
        expect(result.current.isVisible).toBe(false);
        expect(result.current.ref).toBeDefined();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run resources/js/hooks/__tests__/use-scroll-reveal.test.ts`
Expected: FAIL ("Cannot find module '../use-scroll-reveal'")

- [ ] **Step 3: Implement `useScrollReveal` hook**

```typescript
// resources/js/hooks/use-scroll-reveal.ts
import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
}: UseScrollRevealOptions = {}) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<T | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element || typeof IntersectionObserver === 'undefined') {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isVisible };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run resources/js/hooks/__tests__/use-scroll-reveal.test.ts`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add resources/js/hooks/use-scroll-reveal.ts resources/js/hooks/__tests__/use-scroll-reveal.test.ts
git commit -m "feat(ui): add useScrollReveal intersection observer hook"
```

---

### Task 2: Build HeroSection Component with Soft Structuralism & Double-Bezel Metrics

**Files:**
- Create: `resources/js/components/hero-section.tsx`
- Test: `resources/js/components/__tests__/hero-section.test.tsx`

- [ ] **Step 1: Write test for `HeroSection`**

```tsx
// resources/js/components/__tests__/hero-section.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeroSection from '../hero-section';

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('HeroSection', () => {
    const mockProps = {
        totalJournals: 120,
        totalArticles: 4500,
        totalUniversities: 35,
        searchQuery: '',
        setSearchQuery: vi.fn(),
        searchType: 'journals' as const,
        setSearchType: vi.fn(),
        onSearch: vi.fn(),
        isSearching: false,
    };

    it('renders headline, eyebrow badge, search form, and 3 metric islands', () => {
        render(<HeroSection {...mockProps} />);

        expect(screen.getByText(/PORTAL REPOSITORI ILMIAH RESMI/i)).toBeInTheDocument();
        expect(screen.getByText(/Eksplorasi Keunggulan/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search for journals/i)).toBeInTheDocument();
        expect(screen.getByText('120')).toBeInTheDocument();
        expect(screen.getByText('4.500')).toBeInTheDocument();
        expect(screen.getByText('35')).toBeInTheDocument();
    });

    it('submits search form on button click', () => {
        render(<HeroSection {...mockProps} />);
        const submitBtn = screen.getByRole('button', { name: /Search/i });
        fireEvent.click(submitBtn);
        expect(mockProps.onSearch).toHaveBeenCalled();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run resources/js/components/__tests__/hero-section.test.tsx`
Expected: FAIL ("Cannot find module '../hero-section'")

- [ ] **Step 3: Implement `HeroSection`**

```tsx
// resources/js/components/hero-section.tsx
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { BookOpen, ChevronDown, GraduationCap, Library, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary shadow-xs dark:border-primary/25 dark:bg-primary/10 dark:text-primary-foreground">
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
                        Pintu gerbang terpadu untuk ribuan jurnal terakreditasi, artikel bereputasi, dan riset inovatif dari Perguruan Tinggi Muhammadiyah & ‘Aisyiyah se-Indonesia.
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run resources/js/components/__tests__/hero-section.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add resources/js/components/hero-section.tsx resources/js/components/__tests__/hero-section.test.tsx
git commit -m "feat(ui): implement soft structuralist HeroSection with double-bezel metrics"
```

---

### Task 3: Build FeaturedJournalBento Component with Asymmetrical Layout & Nested CTA Button

**Files:**
- Create: `resources/js/components/featured-journal-bento.tsx`
- Test: `resources/js/components/__tests__/featured-journal-bento.test.tsx`

- [ ] **Step 1: Write test for `FeaturedJournalBento`**

```tsx
// resources/js/components/__tests__/featured-journal-bento.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import FeaturedJournalBento from '../featured-journal-bento';

beforeAll(() => {
    (globalThis as any).route = (name: string, params?: any) => `/route/${name}`;
});

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('FeaturedJournalBento', () => {
    const mockJournals = [
        {
            id: 1,
            title: 'Jurnal Ilmiah Farmasi dan Biomedis',
            sinta_rank: 'S1',
            sinta_rank_label: 'SINTA 1',
            issn: '2085-1234',
            e_issn: '2548-5678',
            university: 'Universitas Muhammadiyah Surakarta',
            indexation_labels: ['Scopus', 'WoS', 'DOAJ'],
        },
        {
            id: 2,
            title: 'Jurnal Teknologi dan Rekayasa Sistem',
            sinta_rank: 'S2',
            sinta_rank_label: 'SINTA 2',
            issn: '2301-4433',
            e_issn: '2655-9988',
            university: 'Universitas Ahmad Dahlan',
            indexation_labels: ['DOAJ', 'Dimensions'],
        },
        {
            id: 3,
            title: 'Jurnal Pendidikan Islam Kontemporer',
            sinta_rank: 'S2',
            sinta_rank_label: 'SINTA 2',
            issn: '1978-2233',
            e_issn: '2502-8877',
            university: 'Universitas Muhammadiyah Yogyakarta',
            indexation_labels: ['DOAJ', 'Copernicus'],
        },
        {
            id: 4,
            title: 'Jurnal Kedokteran dan Kesehatan Nusantara',
            sinta_rank: 'S2',
            sinta_rank_label: 'SINTA 2',
            issn: '2089-9911',
            e_issn: '2598-1122',
            university: 'Universitas Muhammadiyah Jakarta',
            indexation_labels: ['SINTA', 'Garuda'],
        },
    ];

    it('renders master showcase card with nested CTA "Telusuri Publikasi" and satellite cards', () => {
        render(<FeaturedJournalBento journals={mockJournals} />);

        expect(screen.getByText(/Jurnal Terakreditasi Unggulan/i)).toBeInTheDocument();
        expect(screen.getByText('Jurnal Ilmiah Farmasi dan Biomedis')).toBeInTheDocument();
        expect(screen.getByText('Telusuri Publikasi')).toBeInTheDocument();
        expect(screen.getByText('Jurnal Teknologi dan Rekayasa Sistem')).toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run resources/js/components/__tests__/featured-journal-bento.test.tsx`
Expected: FAIL ("Cannot find module '../featured-journal-bento'")

- [ ] **Step 3: Implement `FeaturedJournalBento`**

```tsx
// resources/js/components/featured-journal-bento.tsx
import { IndexationBadge, SintaBadge } from '@/components/badges';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, BookOpen, Layers } from 'lucide-react';
import React from 'react';

interface JournalItem {
    id: number;
    title: string;
    sinta_rank: string | null;
    sinta_rank_label?: string;
    issn?: string | null;
    e_issn?: string | null;
    university?: string;
    cover_image_url?: string;
    indexation_labels?: string[];
}

interface FeaturedJournalBentoProps {
    journals: JournalItem[];
}

export default function FeaturedJournalBento({ journals }: FeaturedJournalBentoProps) {
    const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

    if (!journals || journals.length === 0) {
        return null;
    }

    // Sort to prioritize S1, S2
    const sortedJournals = [...journals].sort((a, b) => {
        const rankA = a.sinta_rank || 'S6';
        const rankB = b.sinta_rank || 'S6';
        return rankA.localeCompare(rankB);
    });

    const masterJournal = sortedJournals[0];
    const satelliteJournals = sortedJournals.slice(1, 4);

    return (
        <section
            ref={sectionRef}
            className={`py-16 md:py-24 transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
        >
            {/* Header Section */}
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary dark:border-primary/20 dark:bg-primary/10 dark:text-primary-foreground">
                        <Layers className="h-3 w-3" />
                        KURASI TERBAIK
                    </div>
                    <h2
                        className="font-heading mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white"
                        style={{ fontFamily: '"El Messiri", serif' }}
                    >
                        Jurnal Terakreditasi Unggulan
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Publikasi berkala ilmiah terindeks SINTA 1 & 2 dari jaringan perguruan tinggi Muhammadiyah.
                    </p>
                </div>

                <Link
                    href={route('journals.index')}
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-secondary transition-colors duration-300 hover:text-primary dark:text-rose-400 dark:hover:text-white"
                >
                    Lihat Semua Jurnal
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1.5" />
                </Link>
            </div>

            {/* Asymmetrical 12-Column Bento Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* MASTER SHOWCASE CARD (7 COLUMNS) */}
                {masterJournal && (
                    <div className="lg:col-span-7">
                        <div className="group h-full rounded-[2rem] bg-gradient-to-b from-black/[0.04] to-black/[0.01] p-2 sm:p-2.5 ring-1 ring-black/[0.06] shadow-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-2xl dark:from-white/[0.06] dark:to-white/[0.02] dark:ring-white/[0.08]">
                            <div className="flex h-full flex-col justify-between rounded-[calc(2rem-0.625rem)] border border-black/[0.02] bg-white p-6 sm:p-8 dark:border-white/[0.04] dark:bg-zinc-900">
                                <div>
                                    {/* Top Metadata & Badges */}
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <SintaBadge rank={masterJournal.sinta_rank} />
                                            {masterJournal.indexation_labels?.slice(0, 3).map((label) => (
                                                <IndexationBadge key={label} platform={label} variant="default" />
                                            ))}
                                        </div>
                                        <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:bg-zinc-800 dark:text-slate-300">
                                            {masterJournal.university || 'Universitas Muhammadiyah'}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3
                                        className="font-heading mt-6 text-2xl font-bold leading-tight text-slate-900 transition-colors duration-300 group-hover:text-primary sm:text-3xl dark:text-white dark:group-hover:text-indigo-400"
                                        style={{ fontFamily: '"El Messiri", serif' }}
                                    >
                                        <Link href={route('journals.show', masterJournal.id)}>{masterJournal.title}</Link>
                                    </h3>

                                    {/* ISSN Monospaced Chips */}
                                    <div className="mt-6 flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-slate-300">
                                            <span className="font-medium text-slate-400">P-ISSN</span>
                                            <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                                                {masterJournal.issn || '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-slate-300">
                                            <span className="font-medium text-slate-400">E-ISSN</span>
                                            <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                                                {masterJournal.e_issn || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Nested CTA Button-in-Button "Telusuri Publikasi" */}
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
                                    <Link
                                        href={route('journals.show', masterJournal.id)}
                                        className="group/btn flex items-center justify-between rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                    >
                                        <span>Telusuri Publikasi</span>
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 group-hover/btn:scale-105">
                                            <ArrowUpRight className="h-4 w-4 text-white" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SATELLITE CARDS (5 COLUMNS, STACKED / MODULAR) */}
                <div className="flex flex-col gap-4 lg:col-span-5">
                    {satelliteJournals.map((journal, idx) => (
                        <div
                            key={journal.id}
                            style={{ transitionDelay: `${idx * 100}ms` }}
                            className="group rounded-[1.5rem] bg-black/[0.02] p-1.5 ring-1 ring-black/[0.05] shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-md dark:bg-white/[0.03] dark:ring-white/[0.06]"
                        >
                            <div className="flex h-full flex-col justify-between rounded-[calc(1.5rem-0.375rem)] border border-black/[0.02] bg-white p-5 dark:border-white/[0.02] dark:bg-zinc-900">
                                <div>
                                    <div className="flex items-center justify-between gap-2">
                                        <SintaBadge rank={journal.sinta_rank} />
                                        <span className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                            {journal.university || 'Perguruan Tinggi'}
                                        </span>
                                    </div>
                                    <h4 className="font-heading mt-3 line-clamp-2 text-base font-bold text-slate-900 transition-colors duration-300 group-hover:text-primary dark:text-white dark:group-hover:text-indigo-400">
                                        <Link href={route('journals.show', journal.id)}>{journal.title}</Link>
                                    </h4>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-zinc-800 dark:text-slate-400">
                                    <span className="font-mono text-[11px]">E-ISSN: {journal.e_issn || journal.issn || '-'}</span>
                                    <Link
                                        href={route('journals.show', journal.id)}
                                        className="inline-flex items-center gap-1 font-semibold text-primary transition-transform duration-300 hover:translate-x-1 dark:text-indigo-400"
                                    >
                                        Buka
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run resources/js/components/__tests__/featured-journal-bento.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add resources/js/components/featured-journal-bento.tsx resources/js/components/__tests__/featured-journal-bento.test.tsx
git commit -m "feat(ui): implement FeaturedJournalBento with asymmetrical bento and double-bezel cards"
```

---

### Task 4: Integrate HeroSection & FeaturedJournalBento into welcome.tsx and Update Tests

**Files:**
- Modify: `resources/js/pages/welcome.tsx`
- Modify: `resources/js/pages/__tests__/welcome.test.tsx`

- [ ] **Step 1: Update welcome.test.tsx to assert new components**

```tsx
// Verify that welcome.test.tsx continues passing with search router calls and accessibility labels
```

- [ ] **Step 2: Update `resources/js/pages/welcome.tsx`**

Replace old hero gradient and old 4-column grid with `HeroSection` and `FeaturedJournalBento`.

- [ ] **Step 3: Run all page & component tests**

Run: `npx vitest run resources/js/pages/__tests__/welcome.test.tsx`
Expected: PASS

- [ ] **Step 4: Run type checks & build**

Run: `npm run types && npm run build`
Expected: 0 errors, clean build

- [ ] **Step 5: Commit changes**

```bash
git add resources/js/pages/welcome.tsx resources/js/pages/__tests__/welcome.test.tsx
git commit -m "feat(landing): integrate redesigned HeroSection and FeaturedJournalBento on welcome page"
```
