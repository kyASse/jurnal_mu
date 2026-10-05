import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { ChevronDown, Filter, RotateCcw, Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
    const safeFilters = filters && !Array.isArray(filters) && typeof filters === 'object' ? filters : {};
    const initialQuery = safeFilters.q ?? '';
    const initialAccreditation = safeFilters.accreditation ?? '';

    const [search, setSearch] = useState(initialQuery);
    const [accreditation, setAccreditation] = useState(initialAccreditation);

    // Synchronize internal state when server props change (e.g., browser back/forward)
    useEffect(() => {
        setSearch(safeFilters.q ?? '');
    }, [safeFilters.q]);

    useEffect(() => {
        setAccreditation(safeFilters.accreditation ?? '');
    }, [safeFilters.accreditation]);

    const performSearch = (query: string, acc: string = accreditation) => {
        router.get(
            '/ptma/ranking',
            {
                ...safeFilters,
                q: query.trim() ? query.trim() : undefined,
                accreditation: acc ? acc : undefined,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
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
                sort: typeof safeFilters.sort === 'string' ? safeFilters.sort : 'sinta_overall',
                dir: typeof safeFilters.dir === 'string' ? safeFilters.dir : 'desc',
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const hasActiveFilters = Boolean(search || accreditation);

    return (
        <div className="mb-6 w-full font-['Geist',sans-serif]">
            <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-border bg-card p-2 shadow-xs sm:flex-row sm:items-center md:p-3">
                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative max-w-lg flex-1" role="search">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Cari nama atau singkatan PTMA (contoh: UMY, UAD, UMS)..."
                        aria-label="Cari PTMA"
                        className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-10 text-xs text-foreground shadow-xs transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none md:text-sm"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                            aria-label="Bersihkan pencarian"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </form>

                {/* Filter Controls */}
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Filter status akreditasi BAN-PT"
                                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs shadow-xs transition-all md:text-sm ${
                                    accreditation
                                        ? 'border-primary bg-primary/5 font-medium text-primary'
                                        : 'border-border bg-card text-foreground hover:bg-muted'
                                }`}
                            >
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <span>{accreditation ? `Akreditasi: ${accreditation}` : 'Semua Akreditasi'}</span>
                                <ChevronDown className="ml-1.5 h-3.5 w-3.5 opacity-60" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 border-border bg-popover text-popover-foreground shadow-lg">
                            <DropdownMenuLabel>Filter Akreditasi BAN-PT</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={accreditation} onValueChange={handleAccreditationChange}>
                                {ACCREDITATION_OPTIONS.map((opt) => (
                                    <DropdownMenuRadioItem key={opt.value} value={opt.value} className="cursor-pointer">
                                        {opt.label}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleResetAll}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground"
                            title="Reset filter pencarian"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
