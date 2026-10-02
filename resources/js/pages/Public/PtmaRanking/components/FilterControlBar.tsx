import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Filter, RotateCcw, Search, X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

export interface FilterControlBarProps {
    filters?: {
        q?: string;
        accreditation?: string;
        sort?: string;
        dir?: string;
        [key: string]: any;
    };
}

const ACCREDITATION_OPTIONS = [
    { value: '', label: 'Semua Akreditasi' },
    { value: 'Unggul', label: 'Unggul' },
    { value: 'Baik Sekali', label: 'Baik Sekali' },
    { value: 'Baik', label: 'Baik' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
];

export const FilterControlBar: React.FC<FilterControlBarProps> = ({ filters = {} }) => {
    const initialQuery = filters.q ?? '';
    const initialAccreditation = filters.accreditation ?? '';

    const [search, setSearch] = useState(initialQuery);
    const [accreditation, setAccreditation] = useState(initialAccreditation);

    // Synchronize internal state when server props change (e.g., browser back/forward)
    useEffect(() => {
        setSearch(filters.q ?? '');
    }, [filters.q]);

    useEffect(() => {
        setAccreditation(filters.accreditation ?? '');
    }, [filters.accreditation]);

    const performSearch = (query: string, acc: string = accreditation) => {
        router.get(
            '/ptma/ranking',
            {
                ...filters,
                q: query.trim() ? query.trim() : undefined,
                accreditation: acc ? acc : undefined,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const debouncedSearch = useDebouncedCallback((val: string) => {
        performSearch(val, accreditation);
    }, 350);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        debouncedSearch(val);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        debouncedSearch.cancel();
        performSearch(search, accreditation);
    };

    const handleClearSearch = () => {
        debouncedSearch.cancel();
        setSearch('');
        performSearch('', accreditation);
    };

    const handleAccreditationChange = (val: string) => {
        debouncedSearch.cancel();
        setAccreditation(val);
        performSearch(search, val);
    };

    const handleResetAll = () => {
        debouncedSearch.cancel();
        setSearch('');
        setAccreditation('');
        router.get(
            '/ptma/ranking',
            {
                sort: filters.sort ?? 'sinta_overall',
                dir: filters.dir ?? 'desc',
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const hasActiveFilters = Boolean(search || accreditation);

    return (
        <div className="w-full mb-6 font-['Geist',sans-serif]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 md:p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80">
                {/* Search Input */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="relative flex-1 max-w-lg"
                    role="search"
                >
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Cari nama atau singkatan PTMA (contoh: UMY, UAD, UMS)..."
                        aria-label="Cari PTMA"
                        className="w-full pl-10 pr-10 py-2.5 text-xs md:text-sm rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            aria-label="Bersihkan pencarian"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </form>

                {/* Filter Controls */}
                <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                            <Filter className="w-3.5 h-3.5" />
                        </div>
                        <select
                            value={accreditation}
                            onChange={(e) => handleAccreditationChange(e.target.value)}
                            aria-label="Filter status akreditasi BAN-PT"
                            className="pl-9 pr-8 py-2.5 text-xs md:text-sm rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs cursor-pointer appearance-none"
                        >
                            {ACCREDITATION_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleResetAll}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 transition-colors"
                            title="Reset filter pencarian"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
