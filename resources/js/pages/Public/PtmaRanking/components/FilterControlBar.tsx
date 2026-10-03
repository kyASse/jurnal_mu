import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Filter, RotateCcw, Search, X } from 'lucide-react';
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
                sort: typeof safeFilters.sort === 'string' ? safeFilters.sort : 'sinta_overall',
                dir: typeof safeFilters.dir === 'string' ? safeFilters.dir : 'desc',
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 md:p-3 rounded-2xl bg-card border border-border shadow-xs">
                {/* Search Input */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="relative flex-1 max-w-lg"
                    role="search"
                >
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Cari nama atau singkatan PTMA (contoh: UMY, UAD, UMS)..."
                        aria-label="Cari PTMA"
                        className="w-full pl-10 pr-10 py-2.5 text-xs md:text-sm rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all shadow-xs"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                            aria-label="Bersihkan pencarian"
                        >
                            <X className="w-4 h-4" />
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
                                className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs md:text-sm rounded-xl border transition-all shadow-xs cursor-pointer ${
                                    accreditation
                                        ? 'border-primary text-primary bg-primary/5 font-medium'
                                        : 'bg-card text-foreground border-border hover:bg-muted'
                                }`}
                            >
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <span>{accreditation ? `Akreditasi: ${accreditation}` : 'Semua Akreditasi'}</span>
                                <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-1.5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground border-border shadow-lg">
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
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors shadow-xs"
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
