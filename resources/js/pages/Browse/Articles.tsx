import PublicFooter from '@/components/public-footer';
import PublicNavbar from '@/components/public-navbar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Download,
    ExternalLink,
    FileDown,
    FileText,
    Filter,
    RotateCcw,
    Search,
} from 'lucide-react';
import React, { useState } from 'react';

interface Article {
    id: number;
    title: string;
    abstract: string | null;
    authors: string[] | null;
    authors_list: string;
    keywords: string[] | null;
    doi: string | null;
    doi_url: string | null;
    publication_date: string;
    volume: string | null;
    issue: string | null;
    volume_issue: string | null;
    pages: string | null;
    article_url: string | null;
    pdf_url: string | null;
    google_scholar_url: string;
    journal: {
        id: number;
        title: string;
        publisher: string | null;
        scientific_field: {
            id: number;
            name: string;
        } | null;
    };
}

interface FacetItem {
    id?: number;
    name?: string;
    title?: string;
    year?: number;
    count: number;
}

interface Props {
    articles: {
        data: Article[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    facets: {
        subjects: FacetItem[];
        journals: FacetItem[];
        years: FacetItem[];
    };
    filters: {
        q?: string;
        field?: string;
        subjects?: number[];
        journals?: number[];
        years?: number[];
    };
}

export default function ArticlesBrowse({ articles, facets, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [searchField, setSearchField] = useState(filters.field || 'all');
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>(Array.isArray(filters.subjects) ? filters.subjects.map(Number) : []);
    const [selectedJournals, setSelectedJournals] = useState<number[]>(Array.isArray(filters.journals) ? filters.journals.map(Number) : []);
    const [selectedYears, setSelectedYears] = useState<number[]>(Array.isArray(filters.years) ? filters.years.map(Number) : []);
    const [expandedAbstracts, setExpandedAbstracts] = useState<Record<number, boolean>>({});
    const [collapseSubjects, setCollapseSubjects] = useState(false);
    const [collapseJournals, setCollapseJournals] = useState(false);
    const [collapseYears, setCollapseYears] = useState(false);
    const [journalSearchQuery, setJournalSearchQuery] = useState('');

    const applyFilters = (q = searchQuery, field = searchField, subjects = selectedSubjects, journals = selectedJournals, years = selectedYears) => {
        router.get(
            route('browse.articles'),
            {
                q,
                field,
                subjects,
                journals,
                years,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const toggleSubject = (id: number) => {
        const next = selectedSubjects.includes(id) ? selectedSubjects.filter((x) => x !== id) : [...selectedSubjects, id];
        setSelectedSubjects(next);
        applyFilters(searchQuery, searchField, next, selectedJournals, selectedYears);
    };

    const toggleJournal = (id: number) => {
        const next = selectedJournals.includes(id) ? selectedJournals.filter((x) => x !== id) : [...selectedJournals, id];
        setSelectedJournals(next);
        applyFilters(searchQuery, searchField, selectedSubjects, next, selectedYears);
    };

    const toggleYear = (year: number) => {
        const next = selectedYears.includes(year) ? selectedYears.filter((x) => x !== year) : [...selectedYears, year];
        setSelectedYears(next);
        applyFilters(searchQuery, searchField, selectedSubjects, selectedJournals, next);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSearchField('all');
        setSelectedSubjects([]);
        setSelectedJournals([]);
        setSelectedYears([]);
        router.get(route('browse.articles'));
    };

    const toggleAbstract = (id: number) => {
        setExpandedAbstracts((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const downloadRis = (article: Article) => {
        const year = new Date(article.publication_date).getFullYear();
        const authorsFormatted = article.authors ? article.authors.map((a) => `AU  - ${a}`).join('\n') : 'AU  - Unknown';

        const risLines = ['TY  - JOUR', `TI  - ${article.title}`, authorsFormatted, `JO  - ${article.journal.title}`, `PY  - ${year}`];

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

    const hasActiveFilters = searchQuery || selectedSubjects.length > 0 || selectedJournals.length > 0 || selectedYears.length > 0;

    return (
        <>
            <Head title="Browse Articles - JurnalMu">
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
                            <div>
                                <h1
                                    className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
                                    style={{ fontFamily: '"El Messiri", serif' }}
                                >
                                    Browse <span className="text-[#FCEE1F]">Articles</span>
                                </h1>
                                <p className="max-w-2xl text-lg text-emerald-50">Search and filter through all harvested research publications.</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="relative z-20 mx-auto -mt-8 mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                            <form onSubmit={handleSearchSubmit} className="space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by article title, abstract, authors, keywords..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-12 pl-12 text-base"
                                    />
                                </div>

                                {/* Filters Row */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {/* Search Field Filter */}
                                    <div className="md:col-span-2">
                                        <Select value={searchField} onValueChange={setSearchField}>
                                            <SelectTrigger className="h-12 border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                                                <SelectValue placeholder="Search Fields" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Fields</SelectItem>
                                                <SelectItem value="title">Title</SelectItem>
                                                <SelectItem value="abstract">Abstract</SelectItem>
                                                <SelectItem value="subject">Subject</SelectItem>
                                                <SelectItem value="author">Author</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Button
                                            type="submit"
                                            className="h-12 w-full bg-[#079C4E] font-semibold text-white hover:bg-[#068A42] sm:flex-1"
                                        >
                                            Search
                                        </Button>
                                        {hasActiveFilters && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={resetFilters}
                                                className="h-12 w-full font-semibold sm:w-auto"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Content Grid Container */}
                    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                        {/* Content Grid */}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                            {/* Left Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="scrollbar-thin rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto dark:border-white/10 dark:bg-[#111111]">
                                    <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-white/10">
                                        <h2 className="flex items-center text-lg font-bold">
                                            <Filter className="mr-2 h-4 w-4 text-[#079C4E]" />
                                            Refine Search Results
                                        </h2>
                                        {hasActiveFilters && (
                                            <Button
                                                variant="ghost"
                                                onClick={resetFilters}
                                                className="h-auto p-0 text-xs font-semibold text-red-500 hover:bg-transparent hover:text-red-700"
                                            >
                                                <RotateCcw className="mr-1 h-3 w-3" />
                                                Clear
                                            </Button>
                                        )}
                                    </div>

                                    {/* Subject Facet */}
                                    <div className="mb-6 border-b pb-4 dark:border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setCollapseSubjects(!collapseSubjects)}
                                            className="flex w-full items-center justify-between text-sm font-semibold tracking-wider text-gray-500 uppercase hover:text-gray-900 dark:hover:text-white"
                                        >
                                            <span>Subjects</span>
                                            {collapseSubjects ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                        </button>
                                        {!collapseSubjects && (
                                            <div className="scrollbar-thin mt-3 max-h-48 space-y-2 overflow-y-auto pr-2">
                                                {facets.subjects.length > 0 ? (
                                                    facets.subjects.map((item) => (
                                                        <div key={item.id} className="flex items-start space-x-2 py-1">
                                                            <Checkbox
                                                                id={`subject-${item.id}`}
                                                                checked={selectedSubjects.includes(Number(item.id))}
                                                                onCheckedChange={() => toggleSubject(Number(item.id))}
                                                                className="mt-0.5"
                                                            />
                                                            <Label
                                                                htmlFor={`subject-${item.id}`}
                                                                className="flex flex-1 cursor-pointer items-start justify-between text-sm leading-tight font-normal"
                                                            >
                                                                <span className="mr-2 break-words whitespace-normal">{item.name}</span>
                                                                <span className="shrink-0 text-gray-400">({item.count})</span>
                                                            </Label>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-gray-400">No subjects found</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Journal Facet */}
                                    <div className="mb-6 border-b pb-4 dark:border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setCollapseJournals(!collapseJournals)}
                                            className="flex w-full items-center justify-between text-sm font-semibold tracking-wider text-gray-500 uppercase hover:text-gray-900 dark:hover:text-white"
                                        >
                                            <span>Journals</span>
                                            {collapseJournals ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                        </button>
                                        {!collapseJournals && (
                                            <div className="mt-3 space-y-3">
                                                <Input
                                                    type="text"
                                                    placeholder="search journals..."
                                                    value={journalSearchQuery}
                                                    onChange={(e) => setJournalSearchQuery(e.target.value)}
                                                    className="h-8 px-2 text-xs"
                                                />
                                                <div className="scrollbar-thin max-h-48 space-y-2 overflow-y-auto pr-2">
                                                    {facets.journals.length > 0 ? (
                                                        facets.journals
                                                            .filter((item) => item.title?.toLowerCase().includes(journalSearchQuery.toLowerCase()))
                                                            .map((item) => (
                                                                <div key={item.id} className="flex items-start space-x-2 py-1">
                                                                    <Checkbox
                                                                        id={`journal-${item.id}`}
                                                                        checked={selectedJournals.includes(Number(item.id))}
                                                                        onCheckedChange={() => toggleJournal(Number(item.id))}
                                                                        className="mt-0.5"
                                                                    />
                                                                    <Label
                                                                        htmlFor={`journal-${item.id}`}
                                                                        className="flex flex-1 cursor-pointer items-start justify-between text-sm leading-tight font-normal"
                                                                    >
                                                                        <span className="mr-2 break-words whitespace-normal">{item.title}</span>
                                                                        <span className="shrink-0 text-gray-400">({item.count})</span>
                                                                    </Label>
                                                                </div>
                                                            ))
                                                    ) : (
                                                        <p className="text-xs text-gray-400">No journals found</p>
                                                    )}
                                                    {facets.journals.length > 0 &&
                                                        facets.journals.filter((item) =>
                                                            item.title?.toLowerCase().includes(journalSearchQuery.toLowerCase()),
                                                        ).length === 0 && <p className="text-xs text-gray-400">No matching journals</p>}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Publication Year Facet */}
                                    <div className="mb-2">
                                        <button
                                            type="button"
                                            onClick={() => setCollapseYears(!collapseYears)}
                                            className="flex w-full items-center justify-between text-sm font-semibold tracking-wider text-gray-500 uppercase hover:text-gray-900 dark:hover:text-white"
                                        >
                                            <span>Publication Years</span>
                                            {collapseYears ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                        </button>
                                        {!collapseYears && (
                                            <div className="scrollbar-thin mt-3 max-h-48 space-y-2 overflow-y-auto pr-2">
                                                {facets.years.length > 0 ? (
                                                    facets.years.map((item) => (
                                                        <div key={item.year} className="flex items-start space-x-2 py-1">
                                                            <Checkbox
                                                                id={`year-${item.year}`}
                                                                checked={selectedYears.includes(Number(item.year))}
                                                                onCheckedChange={() => toggleYear(Number(item.year))}
                                                                className="mt-0.5"
                                                            />
                                                            <Label
                                                                htmlFor={`year-${item.year}`}
                                                                className="flex flex-1 cursor-pointer items-start justify-between text-sm leading-tight font-normal"
                                                            >
                                                                <span className="mr-2 break-words whitespace-normal">{item.year}</span>
                                                                <span className="shrink-0 text-gray-400">({item.count})</span>
                                                            </Label>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-gray-400">No publication years</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Content Column */}
                            <div className="space-y-6 lg:col-span-3">
                                {/* Total count summary */}
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Found <span className="font-bold text-gray-800 dark:text-white">{articles.total}</span> articles
                                    </p>
                                </div>

                                {/* Articles List */}
                                {articles.data.length > 0 ? (
                                    articles.data.map((article) => {
                                        const isExpanded = !!expandedAbstracts[article.id];
                                        return (
                                            <div
                                                key={article.id}
                                                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#111111]"
                                            >
                                                {/* Article Card Metadata Badges */}
                                                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium dark:bg-[#1d1d1d]">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(article.publication_date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                    {article.volume_issue && (
                                                        <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-[#079C4E] dark:bg-[#1d1d1d]">
                                                            {article.volume_issue}
                                                        </span>
                                                    )}
                                                    {article.pages && (
                                                        <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium dark:bg-[#1d1d1d]">
                                                            pp. {article.pages}
                                                        </span>
                                                    )}
                                                    {article.journal.scientific_field && (
                                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                            {article.journal.scientific_field.name}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title */}
                                                <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors hover:text-[#079C4E] dark:text-white dark:hover:text-[#079C4E]">
                                                    {article.title}
                                                </h3>

                                                {/* Authors */}
                                                <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{article.authors_list}</p>

                                                {/* Published By / Publisher */}
                                                <div className="mb-3 text-xs text-gray-500">
                                                    <span>Published in: </span>
                                                    <Link
                                                        href={route('journals.show', article.journal.id)}
                                                        className="font-semibold text-[#079C4E] hover:underline"
                                                    >
                                                        {article.journal.title}
                                                    </Link>
                                                    {article.journal.publisher && <span> &bull; Published by {article.journal.publisher}</span>}
                                                </div>

                                                {/* Abstract content (collapsible) */}
                                                {article.abstract && (
                                                    <div className="mb-4">
                                                        <p className={`text-sm text-gray-600 dark:text-gray-400 ${!isExpanded && 'line-clamp-3'}`}>
                                                            {article.abstract}
                                                        </p>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => toggleAbstract(article.id)}
                                                            className="mt-1 h-auto p-0 text-xs font-semibold text-[#079C4E] hover:bg-transparent hover:text-[#068542]"
                                                        >
                                                            {isExpanded ? (
                                                                <span className="flex items-center">
                                                                    Show Less <ChevronUp className="ml-1 h-3 w-3" />
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center">
                                                                    Read Abstract <ChevronDown className="ml-1 h-3 w-3" />
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Keywords List */}
                                                {article.keywords && article.keywords.length > 0 && (
                                                    <div className="mb-5 flex flex-wrap gap-1.5">
                                                        {article.keywords.map((kw, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="rounded border border-gray-100 bg-gray-50 px-2 py-0.5 text-xs text-gray-500 dark:border-white/5 dark:bg-[#181818]"
                                                            >
                                                                #{kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Action Buttons Link Group */}
                                                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-white/5">
                                                    {article.pdf_url && (
                                                        <a href={article.pdf_url} target="_blank" rel="noopener noreferrer">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-950/20"
                                                            >
                                                                <FileDown className="mr-1 h-4 w-4" />
                                                                PDF
                                                            </Button>
                                                        </a>
                                                    )}

                                                    {article.article_url && (
                                                        <a href={article.article_url} target="_blank" rel="noopener noreferrer">
                                                            <Button size="sm" variant="outline" className="text-gray-700 dark:text-gray-300">
                                                                <ExternalLink className="mr-1 h-4 w-4" />
                                                                Original Article
                                                            </Button>
                                                        </a>
                                                    )}

                                                    {article.doi_url && (
                                                        <a href={article.doi_url} target="_blank" rel="noopener noreferrer">
                                                            <Button size="sm" variant="outline" className="text-gray-700 dark:text-gray-300">
                                                                <FileText className="mr-1 h-4 w-4" />
                                                                DOI
                                                            </Button>
                                                        </a>
                                                    )}

                                                    <a href={article.google_scholar_url} target="_blank" rel="noopener noreferrer">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-blue-950/20"
                                                        >
                                                            <Search className="mr-1 h-4 w-4" />
                                                            Google Scholar
                                                        </Button>
                                                    </a>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => downloadRis(article)}
                                                        className="border-[#079C4E]/20 text-[#079C4E] hover:bg-[#079C4E]/10"
                                                    >
                                                        <Download className="mr-1 h-4 w-4" />
                                                        Export Citation (RIS)
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-white/10">
                                        <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No articles found</h3>
                                        <p className="mt-1 text-gray-500">Try adjusting your filters or search terms.</p>
                                    </div>
                                )}

                                {/* Pagination Controls */}
                                {articles.last_page > 1 && (
                                    <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-white/10">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Page {articles.current_page} of {articles.last_page}
                                        </div>
                                        <div className="flex gap-2">
                                            {articles.links.map((link, index) => {
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
                                                        <span key={index} className="self-center px-2 py-1 text-sm text-gray-400">
                                                            ...
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <Button
                                                        key={index}
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                        className={link.active ? 'bg-[#079C4E] text-white hover:bg-[#068A42]' : ''}
                                                    >
                                                        {link.label}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <PublicFooter />
            </div>
        </>
    );
}
