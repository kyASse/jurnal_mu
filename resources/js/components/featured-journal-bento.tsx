import { IndexationBadge, SintaBadge } from '@/components/badges';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, Layers } from 'lucide-react';

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
                        Publikasi berkala ilmiah terindeks SINTA 1 &amp; 2 dari jaringan perguruan tinggi Muhammadiyah.
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
