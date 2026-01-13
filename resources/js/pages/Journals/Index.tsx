/**
 * Public Journals Index Component
 * 
 * @description
 * A public-facing list view page for browsing all active journals.
 * No authentication required - accessible from the welcome page.
 * 
 * @features
 * - Search by title, ISSN, or e-ISSN
 * - Filter by university
 * - Filter by SINTA rank (1-6)
 * - Filter by scientific field
 * - Paginated results with navigation
 * - View journal details
 * - Premium modern design
 * 
 * @route GET /journals
 */
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Home,
} from 'lucide-react';
import JournalCard from '@/components/journal-card';
import { type SharedData } from '@/types';

interface Journal {
    id: number;
    title: string;
    issn: string | null;
    e_issn: string | null;
    url: string;
    university: {
        id: number;
        name: string;
    };
    scientific_field: {
        id: number;
        name: string;
    } | null;
    sinta_rank: number | null;
    sinta_rank_label: string;
}

interface University {
    id: number;
    name: string;
}

interface ScientificField {
    id: number;
    name: string;
}

interface FilterOption {
    value: string | number;
    label: string;
}

interface Props {
    journals: {
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
    };
    filters: {
        search?: string;
        university_id?: number;
        sinta_rank?: number;
        scientific_field_id?: number;
    };
    universities: University[];
    scientificFields: ScientificField[];
    sintaRanks: FilterOption[];
}

export default function JournalsIndex({
    journals,
    filters,
    universities,
    scientificFields,
    sintaRanks,
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [universityFilter, setUniversityFilter] = useState(filters.university_id?.toString() || '');
    const [sintaRankFilter, setSintaRankFilter] = useState(filters.sinta_rank?.toString() || '');
    const [scientificFieldFilter, setScientificFieldFilter] = useState(filters.scientific_field_id?.toString() || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('journals.index'),
            {
                search,
                university_id: universityFilter,
                sinta_rank: sintaRankFilter,
                scientific_field_id: scientificFieldFilter,
            },
            { preserveState: true }
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setUniversityFilter('');
        setSintaRankFilter('');
        setScientificFieldFilter('');
        router.get(route('journals.index'));
    };

    const hasActiveFilters = search || universityFilter || sintaRankFilter || scientificFieldFilter;

    return (
        <>
            <Head title="Browse Journals - JurnalMu">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gray-50 font-sans text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC] selection:bg-[#079C4E] selection:text-white">

                {/* NAVBAR */}
                <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#079C4E] text-white backdrop-blur-md transition-all">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <Link href={route('home')} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#079C4E]">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <span className="text-2xl font-bold font-heading" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                    JurnalMu
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            {auth?.user ? (
                                <Link href={route('dashboard')}>
                                    <Button variant="secondary" className="bg-white text-[#079C4E] hover:bg-gray-100 font-bold border-0">
                                        <Home className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')}>
                                        <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
                                            Log in
                                        </Button>
                                    </Link>
                                    <Link href={route('register')}>
                                        <Button className="bg-[#FCEE1F] text-black hover:bg-[#e3d51b] font-bold border-0">
                                            Register
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* MAIN CONTENT */}
                <main className="pt-16">
                    {/* Header Section */}
                    <div className="bg-gradient-to-br from-[#079C4E] to-[#10816F] text-white py-16">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-heading mb-4"
                                style={{ fontFamily: '"El Messiri", serif' }}>
                                Browse <span className="text-[#FCEE1F]">All Journals</span>
                            </h1>
                            <p className="text-lg text-emerald-50 max-w-2xl">
                                Explore {journals.total} academic journals from Muhammadiyah Universities across Indonesia
                            </p>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6">
                            <form onSubmit={handleSearch} className="space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                        type="text"
                                        placeholder="Search by journal title, ISSN, or e-ISSN..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-12 h-12 text-base"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* University Filter */}
                                    <Select
                                        value={universityFilter || 'all'}
                                        onValueChange={(value) => setUniversityFilter(value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="All Universities" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Universities</SelectItem>
                                            {universities.map((university) => (
                                                <SelectItem key={university.id} value={university.id.toString()}>
                                                    {university.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Scientific Field Filter */}
                                    <Select
                                        value={scientificFieldFilter || 'all'}
                                        onValueChange={(value) => setScientificFieldFilter(value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="All Scientific Fields" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Scientific Fields</SelectItem>
                                            {scientificFields.map((field) => (
                                                <SelectItem key={field.id} value={field.id.toString()}>
                                                    {field.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* SINTA Rank Filter */}
                                    <Select
                                        value={sintaRankFilter || 'all'}
                                        onValueChange={(value) => setSintaRankFilter(value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="All SINTA Ranks" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All SINTA Ranks</SelectItem>
                                            {sintaRanks.map((option) => (
                                                <SelectItem key={option.value} value={option.value.toString()}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="flex gap-2">
                                        <Button type="submit" className="flex-1 h-12 bg-[#079C4E] hover:bg-[#068A42]">
                                            Search
                                        </Button>
                                        {hasActiveFilters && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleClearFilters}
                                                className="h-12"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
                        {/* Results Count */}
                        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                            Showing {journals.data.length > 0 ? ((journals.current_page - 1) * journals.per_page) + 1 : 0} to{' '}
                            {Math.min(journals.current_page * journals.per_page, journals.total)} of {journals.total} journals
                        </div>

                        {/* Journal Grid */}
                        {journals.data.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-16 text-center">
                                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No journals found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {hasActiveFilters ? 'Try adjusting your search filters' : 'No journals are currently available'}
                                </p>
                                {hasActiveFilters && (
                                    <Button variant="outline" onClick={handleClearFilters}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {journals.data.map(journal => (
                                    <JournalCard
                                        key={journal.id}
                                        title={journal.title}
                                        sinta_rank={journal.sinta_rank}
                                        issn={journal.issn}
                                        e_issn={journal.e_issn}
                                        university={journal.university.name}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {journals.last_page > 1 && (
                            <div className="mt-12 flex items-center justify-between">
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
                                                    onClick={() => link.url && router.visit(link.url)}
                                                >
                                                    <ChevronLeft className="w-4 h-4 mr-1" />
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
                                                    onClick={() => link.url && router.visit(link.url)}
                                                >
                                                    Next
                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            );
                                        }
                                        return (
                                            <Button
                                                key={index}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                                className={link.active ? 'bg-[#079C4E] hover:bg-[#068A42]' : ''}
                                            >
                                                {link.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="bg-[#0f172a] py-12 text-center text-sm text-gray-500">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 flex justify-center gap-6">
                            <Link href={route('home')} className="hover:text-white">Home</Link>
                            <a href="#" className="hover:text-white">About Us</a>
                            <a href="#" className="hover:text-white">Privacy Policy</a>
                            <a href="#" className="hover:text-white">Contact Support</a>
                        </div>
                        <p>&copy; {new Date().getFullYear()} JurnalMu - Muhammadiyah Higher Education Research Network.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
