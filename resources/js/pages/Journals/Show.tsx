/**
 * @route GET /journals/{journal}
 * @description Public journal detail page
 * @features Display comprehensive journal information, badges, metadata, and external links
 */

import { AccreditationBadge, IndexationBadge, SintaBadge } from '@/components/badges';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Journal, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Building2,
    Calendar,
    ExternalLink,
    Globe,
    GraduationCap,
    Home,
    Mail,
    User,
} from 'lucide-react';

interface JournalsShowProps extends SharedData {
    journal: Journal;
}

export default function JournalsShow() {
    const { journal, auth } = usePage<JournalsShowProps>().props;

    return (
        <>
            <Head title={`${journal.title} | JurnalMu`}>
                <meta name="description" content={journal.about || `View details about ${journal.title}, an academic journal published by ${journal.university.name}`} />
                <meta property="og:title" content={journal.title} />
                <meta property="og:description" content={journal.about || `Academic journal from ${journal.university.name}`} />
                {journal.cover_image_url && <meta property="og:image" content={journal.cover_image_url} />}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gray-50 font-sans text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* NAVBAR */}
                <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#079C4E] text-white backdrop-blur-md transition-all">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href={route('home')} className="flex items-center gap-3 hover:opacity-80">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#079C4E]">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <span className="font-heading text-2xl font-bold" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                JurnalMu
                            </span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link href={route('journals.index')}>
                                <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
                                    All Journals
                                </Button>
                            </Link>
                            {auth?.user ? (
                                <Link href={route('dashboard')}>
                                    <Button variant="secondary" className="border-0 bg-white font-bold text-[#079C4E] hover:bg-gray-100">
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
                                        <Button className="border-0 bg-[#FCEE1F] font-bold text-black hover:bg-[#e3d51b]">Register</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* BREADCRUMBS */}
                <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                        <Link href={route('home')} className="flex items-center gap-1 hover:text-[#079C4E]">
                            <Home className="h-4 w-4" />
                            Home
                        </Link>
                        <span>/</span>
                        <Link href={route('journals.index')} className="hover:text-[#079C4E]">
                            Journals
                        </Link>
                        <span>/</span>
                        <span className="text-foreground">{journal.title}</span>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-neutral-950">
                        <div className="relative">
                            {/* Cover Image */}
                            {journal.cover_image_url && (
                                <div className="h-48 w-full overflow-hidden bg-gradient-to-br from-[#079C4E] to-[#10816F]">
                                    <img
                                        src={journal.cover_image_url}
                                        alt={journal.title}
                                        className="h-full w-full object-cover opacity-80 mix-blend-overlay"
                                    />
                                </div>
                            )}
                            {!journal.cover_image_url && (
                                <div className="h-48 w-full bg-gradient-to-br from-[#079C4E] to-[#10816F]">
                                    <div className="flex h-full items-center justify-center">
                                        <BookOpen className="h-20 w-20 text-white opacity-30" />
                                    </div>
                                </div>
                            )}

                            {/* Header Content */}
                            <div className="p-8">
                                <Link href={route('journals.index')}>
                                    <Button variant="ghost" size="sm" className="mb-4">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Journals
                                    </Button>
                                </Link>

                                <h1 className="mb-4 text-4xl font-bold text-foreground">{journal.title}</h1>

                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <SintaBadge rank={journal.sinta_rank ?? null} indexed_date={journal.sinta_indexed_date ?? null} showDate={false} />
                                    {journal.dikti_accreditation_number && (
                                        <AccreditationBadge
                                            number={journal.dikti_accreditation_number}
                                            grade={journal.accreditation_grade ?? null}
                                            expiry_status={journal.accreditation_expiry_status ?? 'none'}
                                            expiry_date={journal.accreditation_expiry_date ?? null}
                                            showDetails={false}
                                        />
                                    )}
                                    {journal.indexation_labels &&
                                        journal.indexation_labels.slice(0, 5).map((label) => (
                                            <IndexationBadge key={label} platform={label} showDate={false} variant="outline" />
                                        ))}
                                    {journal.indexation_labels && journal.indexation_labels.length > 5 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{journal.indexation_labels.length - 5} more
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2">
                            {/* About Section */}
                            {journal.about && (
                                <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-950">
                                    <h2 className="mb-4 text-2xl font-bold text-foreground">About This Journal</h2>
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <p className="text-muted-foreground">{journal.about}</p>
                                    </div>
                                </div>
                            )}

                            {/* Scope Section */}
                            {journal.scope && (
                                <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-950">
                                    <h2 className="mb-4 text-2xl font-bold text-foreground">Scope & Focus</h2>
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <p className="text-muted-foreground">{journal.scope}</p>
                                    </div>
                                </div>
                            )}

                            {/* Metadata Grid */}
                            <div className="mb-8 grid gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-950 md:grid-cols-2">
                                <h2 className="col-span-full text-2xl font-bold text-foreground">Journal Information</h2>

                                {/* ISSN */}
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">ISSN (Print)</p>
                                        <p className="font-medium text-foreground">{journal.issn || 'Not Available'}</p>
                                    </div>
                                </div>

                                {/* E-ISSN */}
                                {journal.e_issn && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                                            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">E-ISSN (Online)</p>
                                            <p className="font-medium text-foreground">{journal.e_issn}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Publisher */}
                                {journal.publisher && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                                            <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Publisher</p>
                                            <p className="font-medium text-foreground">{journal.publisher}</p>
                                        </div>
                                    </div>
                                )}

                                {/* University */}
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                                        <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Institution</p>
                                        <p className="font-medium text-foreground">{journal.university.name}</p>
                                    </div>
                                </div>

                                {/* Scientific Field */}
                                {journal.scientific_field && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 rounded-lg bg-orange-100 p-2 dark:bg-orange-900/20">
                                            <GraduationCap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Scientific Field</p>
                                            <p className="font-medium text-foreground">{journal.scientific_field.name}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Frequency */}
                                {journal.frequency_label && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/20">
                                            <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Publication Frequency</p>
                                            <p className="font-medium text-foreground">{journal.frequency_label}</p>
                                        </div>
                                    </div>
                                )}

                                {/* First Published */}
                                {journal.first_published_year && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 rounded-lg bg-teal-100 p-2 dark:bg-teal-900/20">
                                            <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">First Published</p>
                                            <p className="font-medium text-foreground">{journal.first_published_year}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Editor in Chief */}
                                {journal.editor_in_chief && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 rounded-lg bg-pink-100 p-2 dark:bg-pink-900/20">
                                            <User className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Editor in Chief</p>
                                            <p className="font-medium text-foreground">{journal.editor_in_chief}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Email */}
                                {journal.email && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 rounded-lg bg-cyan-100 p-2 dark:bg-cyan-900/20">
                                            <Mail className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Contact Email</p>
                                            <a
                                                href={`mailto:${journal.email}`}
                                                className="font-medium text-[#079C4E] hover:underline dark:text-[#0ab560]"
                                            >
                                                {journal.email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Indexation Section */}
                            {journal.indexation_labels && journal.indexation_labels.length > 0 && (
                                <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-950">
                                    <h2 className="mb-4 text-2xl font-bold text-foreground">Indexed In</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {journal.indexation_labels.map((label) => (
                                            <IndexationBadge key={label} platform={label} showDate={false} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Quick Actions */}
                            <div className="sticky top-20 space-y-4">
                                {/* Visit Journal Website */}
                                {journal.url && (
                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-950">
                                        <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Access</h3>
                                        <div className="space-y-3">
                                            <a href={journal.url} target="_blank" rel="noopener noreferrer" className="block">
                                                <Button className="w-full bg-[#079C4E] hover:bg-[#067d3e]">
                                                    <Globe className="mr-2 h-4 w-4" />
                                                    Visit Journal Website
                                                    <ExternalLink className="ml-auto h-4 w-4" />
                                                </Button>
                                            </a>

                                            {journal.sinta_rank && (
                                                <a
                                                    href={`https://sinta.kemdikbud.go.id/journals?search=${encodeURIComponent(journal.title)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block"
                                                >
                                                    <Button variant="outline" className="w-full">
                                                        View on SINTA
                                                        <ExternalLink className="ml-auto h-4 w-4" />
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Accreditation Info */}
                                {journal.dikti_accreditation_label && (
                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-950">
                                        <h3 className="mb-4 text-lg font-semibold text-foreground">Accreditation</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-muted-foreground">DIKTI Accreditation</p>
                                                <p className="mt-1 font-medium text-foreground">{journal.dikti_accreditation_label}</p>
                                            </div>
                                            {journal.accreditation_expiry_date && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Valid Until</p>
                                                    <p className="mt-1 font-medium text-foreground">
                                                        {new Date(journal.accreditation_expiry_date).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* SINTA Score */}
                                {journal.sinta_score && (
                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-950">
                                        <h3 className="mb-4 text-lg font-semibold text-foreground">SINTA Metrics</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-muted-foreground">SINTA Score</p>
                                                <p className="mt-1 text-2xl font-bold text-foreground">{journal.sinta_score}</p>
                                            </div>
                                            {journal.sinta_rank && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Ranking</p>
                                                    <p className="mt-1 font-medium text-foreground">{journal.sinta_rank_label}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-neutral-950">
                    <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                        <p className="text-sm text-muted-foreground">
                            © 2026 JurnalMu - Muhammadiyah Journal Portal. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
