import { router } from '@inertiajs/react';
import { motion } from 'motion/react';
import React from 'react';

export interface VariableNavItem {
    key: string;
    label: string;
    shortLabel?: string;
}

export interface VariableSegmentedNavProps {
    currentSort?: string;
    filters?: Record<string, any>;
}

export const VARIABLES: VariableNavItem[] = [
    { key: 'sinta_overall', label: 'Skor SINTA Overall', shortLabel: 'Overall' },
    { key: 'sinta_3yr', label: 'Skor 3 Tahun', shortLabel: '3 Tahun' },
    { key: 'scopus', label: 'Scopus', shortLabel: 'Scopus' },
    { key: 'garuda', label: 'Garuda', shortLabel: 'Garuda' },
    { key: 'wos', label: 'WoS', shortLabel: 'WoS' },
    { key: 'ipr', label: 'Paten / HKI', shortLabel: 'HKI' },
    { key: 'research', label: 'Penelitian', shortLabel: 'Penelitian' },
    { key: 'service', label: 'Pengabdian', shortLabel: 'Pengabdian' },
];

export const VariableSegmentedNav: React.FC<VariableSegmentedNavProps> = ({ currentSort = 'sinta_overall', filters = {} }) => {
    const safeSort = typeof currentSort === 'string' && currentSort ? currentSort : 'sinta_overall';
    const safeFilters = filters && !Array.isArray(filters) && typeof filters === 'object' ? filters : {};

    const handleSwitch = (key: string) => {
        if (safeSort === key) return;

        router.get('/ptma/ranking', { ...safeFilters, sort: key, page: 1 }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <nav aria-label="Pilihan Metrik Peringkat" className="sticky top-2 z-20 my-6 w-full font-['Geist',sans-serif]">
            <div className="scrollbar-none flex w-full items-center justify-start overflow-x-auto pb-1 md:justify-center">
                <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card/90 p-1.5 shadow-xs backdrop-blur-xl dark:bg-card/90">
                    {VARIABLES.map((item) => {
                        const isActive = safeSort === item.key;

                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => handleSwitch(item.key)}
                                className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                    isActive ? 'font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activePillIndicator"
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                        className="absolute inset-0 rounded-full border border-primary/30 bg-primary/10 shadow-xs dark:bg-primary/20"
                                    />
                                )}
                                <span className="relative z-10">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
