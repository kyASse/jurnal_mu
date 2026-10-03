import React from 'react';
import { router } from '@inertiajs/react';
import { motion } from 'motion/react';

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

export const VariableSegmentedNav: React.FC<VariableSegmentedNavProps> = ({
    currentSort = 'sinta_overall',
    filters = {},
}) => {
    const safeSort = typeof currentSort === 'string' && currentSort ? currentSort : 'sinta_overall';
    const safeFilters = filters && !Array.isArray(filters) && typeof filters === 'object' ? filters : {};

    const handleSwitch = (key: string) => {
        if (safeSort === key) return;

        router.get(
            '/ptma/ranking',
            { ...safeFilters, sort: key, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    return (
        <nav
            aria-label="Pilihan Metrik Peringkat"
            className="w-full my-6 sticky top-2 z-20 font-['Geist',sans-serif]"
        >
            <div className="w-full overflow-x-auto pb-1 scrollbar-none flex items-center justify-start md:justify-center">
                <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-card/90 dark:bg-card/90 backdrop-blur-xl border border-border shadow-xs">
                    {VARIABLES.map((item) => {
                        const isActive = safeSort === item.key;

                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => handleSwitch(item.key)}
                                className={`relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                    isActive
                                        ? 'text-primary font-semibold'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activePillIndicator"
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                        className="absolute inset-0 bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-full shadow-xs"
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
