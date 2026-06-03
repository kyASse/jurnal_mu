import PublicFooter from '@/components/public-footer';
import PublicNavbar from '@/components/public-navbar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Calendar, ChevronDown, ChevronUp, Download, ExternalLink, FileDown, FileText, Filter, RotateCcw, Search } from 'lucide-react';
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
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>(
        Array.isArray(filters.subjects) ? filters.subjects.map(Number) : []
    );
    const [selectedJournals, setSelectedJournals] = useState<number[]>(
        Array.isArray(filters.journals) ? filters.journals.map(Number) : []
    );
    const [selectedYears, setSelectedYears] = useState<number[]>(
        Array.isArray(filters.years) ? filters.years.map(Number) : []
    );
    const [expandedAbstracts, setExpandedAbstracts] = useState<Record<number, boolean>>({});

    const applyFilters = (
        q = searchQuery,
        field = searchField,
        subjects = selectedSubjects,
        journals = selectedJournals,
        years = selectedYears
    ) => {
        router.get(
            route('browse.articles'),
            {
                q,
                field,
                subjects,
                journals,
                years,
            },
            { preserveState: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const toggleSubject = (id: number) => {
        const next = selectedSubjects.includes(id)
            ? selectedSubjects.filter((x) => x !== id)
            : [...selectedSubjects, id];
        setSelectedSubjects(next);
        applyFilters(searchQuery, searchField, next, selectedJournals, selectedYears);
    };

    const toggleJournal = (id: number) => {
        const next = selectedJournals.includes(id)
            ? selectedJournals.filter((x) => x !== id)
            : [...selectedJournals, id];
        setSelectedJournals(next);
        applyFilters(searchQuery, searchField, selectedSubjects, next, selectedYears);
    };

    const toggleYear = (year: number) => {
        const next = selectedYears.includes(year)
            ? selectedYears.filter((x) => x !== year)
            : [...selectedYears, year];
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
        const authorsFormatted = article.authors
            ? article.authors.map((a) => `AU  - ${a}`).join('\n')
            : 'AU  - Unknown';

        const risLines = [
            'TY  - JOUR',
            `TI  - ${article.title}`,
            authorsFormatted,
            `JO  - ${article.journal.title}`,
            `PY  - ${year}`,
        ];

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
        link.setAttribute('download', `${article.title.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ris`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasActiveFilters =
        searchQuery ||
        selectedSubjects.length > 0 ||
        selectedJournals.length > 0 ||
        selectedYears.length > 0;

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

                <main className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-8 text-center">
                        <h1 className="font-heading text-4xl font-bold tracking-tight text-[#079C4E]" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                            Browse Articles
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Search and filter through all harvested research publications
                        </p>
                    </div>

                    {/* Search Bar Container */}
                    <form onSubmit={handleSearchSubmit} className="mb-8 flex flex-col gap-3 sm:flex-row">
                        <div className="flex flex-1 items-center rounded-lg border border-gray-300 bg-white px-3 py-1 shadow-sm dark:border-white/10 dark:bg-[#151515]">
                            <Search className="mr-2 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search articles..."
                                className="border-0 bg-transparent py-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
                            />
                        </div>

                        <Select value={searchField} onValueChange={setSearchField}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-300 dark:bg-[#151515] dark:border-white/10">
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

                        <Button type="submit" className="bg-[#079C4E] hover:bg-[#068542] text-white px-6 font-semibold">
                            Search
                        </Button>
                    </form>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                        {/* Left Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111111]">
                                <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-white/10">
                                    <h2 className="flex items-center text-lg font-bold">
                                        <Filter className="mr-2 h-4 w-4 text-[#079C4E]" />
                                        Refine Search
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
                                <div className="mb-6">
                                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                                        Subjects
                                    </h3>
                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                                        {facets.subjects.length > 0 ? (
                                            facets.subjects.map((item) => (
                                                <div key={item.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`subject-${item.id}`}
                                                        checked={selectedSubjects.includes(Number(item.id))}
                                                        onCheckedChange={() => toggleSubject(Number(item.id))}
                                                    />
                                                    <Label
                                                        htmlFor={`subject-${item.id}`}
                                                        className="flex flex-1 justify-between text-sm font-normal cursor-pointer"
                                                    >
                                                        <span className="truncate mr-2">{item.name}</span>
                                                        <span className="text-gray-400">({item.count})</span>
                                                    </Label>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400">No subjects found</p>
                                        )}
                                    </div>
                                </div>

                                {/* Journal Facet */}
                                <div className="mb-6">
                                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                                        Journals
                                    </h3>
                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                                        {facets.journals.length > 0 ? (
                                            facets.journals.map((item) => (
                                                <div key={item.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`journal-${item.id}`}
                                                        checked={selectedJournals.includes(Number(item.id))}
                                                        onCheckedChange={() => toggleJournal(Number(item.id))}
                                                    />
                                                    <Label
                                                        htmlFor={`journal-${item.id}`}
                                                        className="flex flex-1 justify-between text-sm font-normal cursor-pointer"
                                                    >
                                                        <span className="truncate mr-2">{item.title}</span>
                                                        <span className="text-gray-400">({item.count})</span>
                                                    </Label>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400">No journals found</p>
                                        )}
                                    </div>
                                </div>

                                {/* Publication Year Facet */}
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                                        Publication Years
                                    </h3>
                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                                        {facets.years.length > 0 ? (
                                            facets.years.map((item) => (
                                                <div key={item.year} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`year-${item.year}`}
                                                        checked={selectedYears.includes(Number(item.year))}
                                                        onCheckedChange={() => toggleYear(Number(item.year))}
                                                    />
                                                    <Label
                                                        htmlFor={`year-${item.year}`}
                                                        className="flex flex-1 justify-between text-sm font-normal cursor-pointer"
                                                    >
                                                        <span>{item.year}</span>
                                                        <span className="text-gray-400">({item.count})</span>
                                                    </Label>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400">No publication years</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content Column */}
                        <div className="lg:col-span-3 space-y-6">
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
                                            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-white/10 dark:bg-[#111111]"
                                        >
                                            {/* Article Card Metadata Badges */}
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                                                <span className="flex items-center gap-1 bg-gray-100 dark:bg-[#1d1d1d] px-2.5 py-1 rounded-full font-medium">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(article.publication_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                                {article.volume_issue && (
                                                    <span className="bg-gray-100 dark:bg-[#1d1d1d] px-2.5 py-1 rounded-full font-medium text-[#079C4E]">
                                                        {article.volume_issue}
                                                    </span>
                                                )}
                                                {article.pages && (
                                                    <span className="bg-gray-100 dark:bg-[#1d1d1d] px-2.5 py-1 rounded-full font-medium">
                                                        pp. {article.pages}
                                                    </span>
                                                )}
                                                {article.journal.scientific_field && (
                                                    <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-semibold">
                                                        {article.journal.scientific_field.name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-gray-900 hover:text-[#079C4E] dark:text-white dark:hover:text-[#079C4E] transition-colors mb-2">
                                                {article.title}
                                            </h3>

                                            {/* Authors */}
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                {article.authors_list}
                                            </p>

                                            {/* Published By / Publisher */}
                                            <div className="text-xs text-gray-500 mb-3">
                                                <span>Published in: </span>
                                                <Link
                                                    href={route('journals.show', article.journal.id)}
                                                    className="font-semibold text-[#079C4E] hover:underline"
                                                >
                                                    {article.journal.title}
                                                </Link>
                                                {article.journal.publisher && (
                                                    <span> &bull; Published by {article.journal.publisher}</span>
                                                )}
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
                                                <div className="flex flex-wrap gap-1.5 mb-5">
                                                    {article.keywords.map((kw, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-xs bg-gray-50 text-gray-500 dark:bg-[#181818] px-2 py-0.5 rounded border border-gray-100 dark:border-white/5"
                                                        >
                                                            #{kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Action Buttons Link Group */}
                                            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-white/5">
                                                {article.pdf_url && (
                                                    <a href={article.pdf_url} target="_blank" rel="noopener noreferrer">
                                                        <Button size="sm" variant="outline" className="border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20">
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
                                                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-blue-950/20">
                                                        <Search className="mr-1 h-4 w-4" />
                                                        Google Scholar
                                                    </Button>
                                                </a>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => downloadRis(article)}
                                                    className="text-[#079C4E] border-[#079C4E]/20 hover:bg-[#079C4E]/10"
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
                                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No articles found</h3>
                                    <p className="mt-1 text-gray-500">Try adjusting your filters or search terms.</p>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {articles.last_page > 1 && (
                                <div className="mt-8 flex justify-center space-x-1">
                                    {articles.links.map((link, idx) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="px-3.5 py-2 rounded-lg text-sm text-gray-400 border border-gray-200 dark:border-white/10 cursor-not-allowed"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }
                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                className={`px-3.5 py-2 rounded-lg text-sm border transition-colors ${
                                                    link.active
                                                        ? 'bg-[#079C4E] text-white border-[#079C4E]'
                                                        : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200 hover:text-gray-900 dark:bg-[#111] dark:border-white/10 dark:hover:bg-[#181818] dark:text-gray-300'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <PublicFooter />
            </div>
        </>
    );
}
