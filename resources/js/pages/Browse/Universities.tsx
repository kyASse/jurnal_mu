import PublicNavbar from '@/components/public-navbar';
import PublicFooter from '@/components/public-footer';
import JournalCard from '@/components/journal-card';
import { Button } from '@/components/ui/button';
import { UniversityFilterCombobox } from '@/components/ui/university-filter-combobox';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Journal {
    id: number;
    title: string;
    issn: string | null;
    e_issn: string | null;
    url: string | null;
    scientific_field: {
        id: number;
        name: string;
    } | null;
    sinta_rank: number | null;
    sinta_rank_label: string | null;
    is_indexed_in_scopus: boolean;
}

interface UniversityStat {
    id: number;
    name: string;
    code: string;
    short_name: string;
    logo_url: string | null;
    journals_count: number;
}

interface SelectedUniversity {
    id: number;
    name: string;
    code: string;
    short_name: string;
    logo_url: string | null;
}

interface PaginatedUniversities {
    data: UniversityStat[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface PaginatedJournals {
    data: Journal[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    universityStats: PaginatedUniversities;
    universities: Array<{
        id: number;
        name: string;
        code: string;
        short_name: string | null;
    }>;
    selectedUniversity: SelectedUniversity | null;
    journals: PaginatedJournals | null;
    filters: {
        university_id?: string;
    };
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

export default function BrowseUniversities({ universityStats, universities, selectedUniversity, journals, filters }: Props) {
    const [universityFilter, setUniversityFilter] = useState(filters.university_id || '');

    const handleUniversityChange = (value: string) => {
        setUniversityFilter(value);
        if (value && value !== 'all') {
            router.get(route('browse.universities'), { university_id: value }, { preserveState: true });
        } else {
            router.get(route('browse.universities'), {}, { preserveState: true });
        }
    };

    const handleUniversityCardClick = (universityId: number) => {
        router.visit(route('browse.universities.show', universityId));
    };

    return (
        <>
            <Head title="Browse by University - JurnalMu">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gray-50 font-sans text-[#1b1b18] selection:bg-[#079C4E] selection:text-white dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                <PublicNavbar />

                <main className="pt-16">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-br from-[#079C4E] to-[#10816F] pt-16 pb-20 text-white">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            {selectedUniversity ? (
                                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-lg ring-4 ring-white/10">
                                            {selectedUniversity.logo_url ? (
                                                <img
                                                    src={selectedUniversity.logo_url}
                                                    alt={selectedUniversity.name}
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-[#079C4E] to-[#10816F] font-heading text-xl font-bold text-white" style={{ fontFamily: '"El Messiri", serif' }}>
                                                    {getInitials(selectedUniversity.name, selectedUniversity.short_name)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#FCEE1F] ring-1 ring-emerald-500/30">
                                                    {selectedUniversity.code}
                                                </span>
                                                {selectedUniversity.short_name && (
                                                    <span className="text-sm font-semibold text-emerald-100">
                                                        {selectedUniversity.short_name}
                                                    </span>
                                                )}
                                            </div>
                                            <h1
                                                className="font-heading mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
                                                style={{ fontFamily: '"El Messiri", serif' }}
                                            >
                                                {selectedUniversity.name}
                                            </h1>
                                            <p className="mt-1 text-sm text-emerald-50 font-medium">
                                                Explore {journals?.total || 0} approved {journals?.total === 1 ? 'journal' : 'journals'} from this university
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleUniversityChange('all')}
                                            className="bg-white/10 border border-white/20 text-white hover:bg-white/20 font-semibold"
                                        >
                                            <ChevronLeft className="mr-2 h-4 w-4" />
                                            Back to Universities
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h1
                                        className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
                                        style={{ fontFamily: '"El Messiri", serif' }}
                                    >
                                        Browse by <span className="text-[#FCEE1F]">University</span>
                                    </h1>
                                    <p className="max-w-2xl text-lg text-emerald-50">
                                        Explore academic journals published by Muhammadiyah universities across Indonesia.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filter Card */}
                    <div className="relative z-20 mx-auto -mt-8 mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading animate-fade-in" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                                        Select a University
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Quickly jump to a university to see its complete list of approved journals
                                    </p>
                                </div>
                                <div className="w-full md:w-96 shrink-0">
                                    <UniversityFilterCombobox
                                        universities={universities.map((uni) => ({
                                            id: uni.id,
                                            name: uni.name,
                                            code: uni.code,
                                            short_name: uni.short_name,
                                        }))}
                                        value={universityFilter || 'all'}
                                        onValueChange={handleUniversityChange}
                                        placeholder="All Universities"
                                        className="h-12"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                        {selectedUniversity && journals ? (
                            <div>
                                {journals.data.length === 0 ? (
                                    <div className="rounded-2xl bg-white py-16 text-center shadow-sm dark:bg-zinc-900">
                                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">No journals found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            This university does not have any active, approved journals at the moment.
                                        </p>
                                        <Button
                                            onClick={() => handleUniversityChange('all')}
                                            className="mt-6 bg-[#079C4E] hover:bg-[#068A42]"
                                        >
                                            Browse Other Universities
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        {/* 3-column Grid for Journals */}
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                                            {journals.data.map((journal) => (
                                                <JournalCard
                                                    key={journal.id}
                                                    id={journal.id}
                                                    title={journal.title}
                                                    issn={journal.issn}
                                                    e_issn={journal.e_issn}
                                                    university={selectedUniversity.name}
                                                    external_url={journal.url}
                                                />
                                            ))}
                                        </div>

                                        {/* Pagination for Journals */}
                                        {journals.last_page > 1 && (
                                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 dark:border-zinc-800">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Page {journals.current_page} of {journals.last_page}
                                                </div>
                                                <div className="flex gap-2">
                                                    {journals.links.map((link, index) => {
                                                        if (link.label === '&laquo; Previous') {
                                                            return (
                                                                <Button
                                                                    key={index}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={!link.url}
                                                                    onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                                >
                                                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                                                    Previous
                                                                </Button>
                                                            );
                                                        }
                                                        if (link.label === 'Next &raquo;') {
                                                            return (
                                                                <Button
                                                                    key={index}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={!link.url}
                                                                    onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                                >
                                                                    Next
                                                                    <ChevronRight className="ml-1 h-4 w-4" />
                                                                </Button>
                                                            );
                                                        }
                                                        if (link.label === '...') {
                                                            return (
                                                                <span key={index} className="px-2 py-1 text-sm text-gray-400">...</span>
                                                            );
                                                        }
                                                        return (
                                                            <Button
                                                                key={index}
                                                                variant={link.active ? 'default' : 'outline'}
                                                                size="sm"
                                                                disabled={!link.url}
                                                                onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                                className={link.active ? 'bg-[#079C4E] hover:bg-[#068A42] text-white' : ''}
                                                            >
                                                                {link.label}
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {/* 3-column Grid for Universities */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {universityStats.data.map((university) => (
                                        <div
                                            key={university.id}
                                            onClick={() => handleUniversityCardClick(university.id)}
                                            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/20 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-50 p-2 shadow-inner ring-1 ring-gray-100 dark:bg-zinc-800 dark:ring-zinc-700">
                                                    {university.logo_url ? (
                                                        <img
                                                            src={university.logo_url}
                                                            alt={university.name}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-[#079C4E] to-[#10816F] font-heading text-lg font-bold text-white" style={{ fontFamily: '"El Messiri", serif' }}>
                                                            {getInitials(university.name, university.short_name)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-heading truncate text-lg font-bold leading-snug text-gray-900 group-hover:text-[#079C4E] transition-colors dark:text-white" style={{ fontFamily: '"El Messiri", serif' }}>
                                                        {university.name}
                                                    </h3>
                                                    <span className="inline-block mt-1 font-mono text-xs font-semibold text-gray-400 uppercase">
                                                        {university.code}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="my-4 border-t border-gray-100 dark:border-zinc-800" />

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Approved Journals</span>
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#079C4E] dark:bg-emerald-500/10 transition-colors group-hover:bg-[#079C4E] group-hover:text-white">
                                                    <BookOpen className="h-3.5 w-3.5" />
                                                    {university.journals_count} {university.journals_count === 1 ? 'Journal' : 'Journals'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination for Universities */}
                                {universityStats.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-6 dark:border-zinc-800">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Page {universityStats.current_page} of {universityStats.last_page}
                                        </div>
                                        <div className="flex gap-2">
                                            {universityStats.links.map((link, index) => {
                                                if (link.label === '&laquo; Previous') {
                                                    return (
                                                        <Button
                                                            key={index}
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={!link.url}
                                                            onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                        >
                                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                                            Previous
                                                        </Button>
                                                    );
                                                }
                                                if (link.label === 'Next &raquo;') {
                                                    return (
                                                        <Button
                                                            key={index}
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={!link.url}
                                                            onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                        >
                                                            Next
                                                            <ChevronRight className="ml-1 h-4 w-4" />
                                                        </Button>
                                                    );
                                                }
                                                if (link.label === '...') {
                                                    return (
                                                        <span key={index} className="px-2 py-1 text-sm text-gray-400">...</span>
                                                    );
                                                }
                                                return (
                                                    <Button
                                                        key={index}
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                        className={link.active ? 'bg-[#079C4E] hover:bg-[#068A42] text-white' : ''}
                                                    >
                                                        {link.label}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                <PublicFooter />
            </div>
        </>
    );
}
