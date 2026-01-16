/**
 * Public Journal Detail Page
 *
 * @description
 * Public-facing detail page for a single journal.
 * No authentication required - displays journal information for prospective authors.
 *
 * @features
 * - Journal cover/logo placeholder (Muhammadiyah green gradient)
 * - SINTA rank and accreditation badges
 * - Prominent CTA buttons (Submit Article, Author Guidelines, Visit Website)
 * - Publication details (ISSN, publisher, frequency, etc)
 * - Editorial contact information
 * - About section with aims & scope
 * - University and scientific field information
 *
 * @route GET /journals/{journal}
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Building2,
    CheckCircle,
    ExternalLink,
    FileText,
    Globe,
    Home,
    Mail,
    MapPin,
    Upload,
    User,
} from 'lucide-react';

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn: string | null;
    url: string | null;
    publisher: string | null;
    frequency: string;
    frequency_label: string;
    first_published_year: number | null;
    editor_in_chief: string | null;
    email: string | null;
    sinta_rank: number | null;
    sinta_rank_label: string;
    accreditation_status: string | null;
    accreditation_status_label: string;
    accreditation_grade: string | null;
    university: {
        id: number;
        name: string;
        code: string;
    };
    scientific_field: {
        id: number;
        name: string;
    } | null;
}

interface Props {
    journal: Journal;
}

export default function JournalShow({ journal }: Props) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title={`${journal.title} - JurnalMu`}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gray-50 font-sans text-[#1b1b18] selection:bg-[#00853c] selection:text-white dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* NAVBAR */}
                <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#00853c] text-white backdrop-blur-md transition-all">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <Link href={route('home')} className="flex items-center gap-3 transition-opacity hover:opacity-90">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#00853c]">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <span className="font-heading text-2xl font-bold" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                    JurnalMu
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            {auth?.user ? (
                                <Link href={route('dashboard')}>
                                    <Button variant="secondary" className="border-0 bg-white font-bold text-[#00853c] hover:bg-gray-100">
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
                                        <Button className="border-0 bg-[#FCEE1F] font-bold text-black hover:bg-[#e3d51b]">Register</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* BREADCRUMB */}
                <div className="bg-white pt-16 dark:bg-zinc-900">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Link href={route('home')} className="hover:text-[#00853c]">
                                Home
                            </Link>
                            <span>/</span>
                            <Link href={route('journals.index')} className="hover:text-[#00853c]">
                                Browse Journals
                            </Link>
                            <span>/</span>
                            <span className="font-medium text-gray-900 dark:text-white">{journal.title}</span>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <main className="bg-gray-50 py-12 dark:bg-[#0a0a0a]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* HERO SECTION: Cover + Header */}
                        <div className="mb-12 grid gap-8 md:grid-cols-3">
                            {/* JOURNAL COVER */}
                            <div className="md:col-span-1">
                                <div className="relative">
                                    <div className="h-96 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#00853c] to-[#04a64b] shadow-2xl">
                                        <div className="flex h-full items-center justify-center">
                                            <BookOpen className="h-32 w-32 text-white/20" />
                                        </div>
                                    </div>
                                    {/* SINTA Badge Overlay */}
                                    {journal.sinta_rank && (
                                        <div className="absolute right-4 top-4 rounded-full bg-[#FCEE1F] px-4 py-2 font-bold text-black shadow-lg">
                                            🏆 SINTA {journal.sinta_rank}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* HEADER + ACTIONS */}
                            <div className="md:col-span-2">
                                {/* Journal Title & Badges */}
                                <h1
                                    className="mb-4 font-heading text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl"
                                    style={{ fontFamily: '"El Messiri", serif' }}
                                >
                                    {journal.title}
                                </h1>

                                <div className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Building2 className="h-5 w-5" />
                                    <span className="text-lg font-medium">{journal.university.name}</span>
                                </div>

                                {/* Badges Row */}
                                <div className="mb-6 flex flex-wrap gap-3">
                                    {/* SINTA Badge */}
                                    {journal.sinta_rank && (
                                        <Badge className="bg-[#00853c] px-4 py-2 text-white hover:bg-[#006b30]">
                                            <Award className="mr-2 h-4 w-4" />
                                            {journal.sinta_rank_label}
                                        </Badge>
                                    )}

                                    {/* Accreditation Badge */}
                                    {journal.accreditation_status && (
                                        <Badge className="bg-[#FCEE1F] px-4 py-2 text-black hover:bg-[#e3d51b]">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            {journal.accreditation_status_label}
                                        </Badge>
                                    )}

                                    {/* Active Badge */}
                                    <Badge variant="outline" className="border-[#00853c] px-4 py-2 text-[#00853c]">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Active
                                    </Badge>
                                </div>

                                <Separator className="my-6" />

                                {/* CTA BUTTONS */}
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    {/* Primary CTA - Submit Article */}
                                    <Button
                                        size="lg"
                                        className="transform bg-[#FCEE1F] px-8 py-6 text-lg font-bold text-black shadow-lg transition hover:scale-105 hover:bg-[#e3d51b]"
                                    >
                                        <Upload className="mr-2 h-5 w-5" />
                                        Submit Your Article
                                    </Button>

                                    {/* Secondary CTA - Guidelines */}
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-2 border-[#00853c] px-8 py-6 text-lg font-semibold text-[#00853c] hover:bg-[#00853c] hover:text-white"
                                    >
                                        <FileText className="mr-2 h-5 w-5" />
                                        Author Guidelines
                                    </Button>

                                    {/* Tertiary CTA - Visit Website */}
                                    {journal.url && (
                                        <Button
                                            size="lg"
                                            variant="ghost"
                                            asChild
                                            className="text-[#00853c] hover:bg-[#00853c]/10"
                                        >
                                            <a href={journal.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Visit Website
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* INFORMATION GRID */}
                        <div className="mb-12 grid gap-6 md:grid-cols-2">
                            {/* LEFT: Publication Details */}
                            <Card className="border-l-4 border-[#00853c] p-6 dark:bg-zinc-900">
                                <h3 className="mb-4 text-xl font-semibold text-[#00853c]">Publication Details</h3>
                                <dl className="space-y-3">
                                    {journal.issn && (
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-gray-600 dark:text-gray-400">ISSN</dt>
                                            <dd className="font-semibold text-gray-900 dark:text-white">{journal.issn}</dd>
                                        </div>
                                    )}
                                    {journal.e_issn && (
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-gray-600 dark:text-gray-400">E-ISSN</dt>
                                            <dd className="font-semibold text-gray-900 dark:text-white">{journal.e_issn}</dd>
                                        </div>
                                    )}
                                    {journal.publisher && (
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-gray-600 dark:text-gray-400">Publisher</dt>
                                            <dd className="font-semibold text-gray-900 dark:text-white">{journal.publisher}</dd>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-b pb-2">
                                        <dt className="text-gray-600 dark:text-gray-400">Frequency</dt>
                                        <dd className="font-semibold text-gray-900 dark:text-white">{journal.frequency_label}</dd>
                                    </div>
                                    {journal.first_published_year && (
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-gray-600 dark:text-gray-400">First Published</dt>
                                            <dd className="font-semibold text-gray-900 dark:text-white">{journal.first_published_year}</dd>
                                        </div>
                                    )}
                                    {journal.scientific_field && (
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-gray-600 dark:text-gray-400">Scientific Field</dt>
                                            <dd className="font-semibold text-gray-900 dark:text-white">{journal.scientific_field.name}</dd>
                                        </div>
                                    )}
                                </dl>
                            </Card>

                            {/* RIGHT: Contact Information */}
                            <Card className="bg-gradient-to-br from-[#00853c]/5 to-[#FCEE1F]/5 p-6 dark:from-[#00853c]/10 dark:to-[#FCEE1F]/10">
                                <h3 className="mb-4 text-xl font-semibold text-[#00853c]">Editorial Contact</h3>
                                <div className="space-y-4">
                                    {journal.editor_in_chief && (
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00853c] text-white">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Editor in Chief</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">{journal.editor_in_chief}</p>
                                            </div>
                                        </div>
                                    )}
                                    {journal.email && (
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00853c] text-white">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                                <a
                                                    href={`mailto:${journal.email}`}
                                                    className="font-semibold text-[#00853c] hover:underline"
                                                >
                                                    {journal.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00853c] text-white">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">University</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {journal.university.name} ({journal.university.code})
                                            </p>
                                        </div>
                                    </div>
                                    {journal.url && (
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00853c] text-white">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Website</p>
                                                <a
                                                    href={journal.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-semibold text-[#00853c] hover:underline"
                                                >
                                                    Visit Journal Website
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* ABOUT SECTION */}
                        <Card className="p-8 dark:bg-zinc-900">
                            <h2
                                className="mb-6 inline-block border-b-4 border-[#FCEE1F] pb-2 font-heading text-3xl font-bold text-[#00853c]"
                                style={{ fontFamily: '"El Messiri", serif' }}
                            >
                                About This Journal
                            </h2>

                            <div className="prose max-w-none dark:prose-invert">
                                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Aims & Scope</h3>
                                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                                    {journal.title} is an academic journal published by {journal.university.name}, focusing on{' '}
                                    {journal.scientific_field?.name || 'various academic disciplines'}. The journal aims to disseminate
                                    high-quality research findings and contribute to the advancement of knowledge in its field.
                                </p>

                                <Separator className="my-6" />

                                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Publication Information</h3>
                                <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
                                    <li>
                                        <strong>Publisher:</strong> {journal.publisher || journal.university.name}
                                    </li>
                                    <li>
                                        <strong>Frequency:</strong> {journal.frequency_label}
                                    </li>
                                    {journal.first_published_year && (
                                        <li>
                                            <strong>Established:</strong> {journal.first_published_year}
                                        </li>
                                    )}
                                    <li>
                                        <strong>Indexing:</strong> {journal.sinta_rank_label}
                                    </li>
                                    {journal.accreditation_status && (
                                        <li>
                                            <strong>Accreditation:</strong> {journal.accreditation_status_label}
                                        </li>
                                    )}
                                </ul>

                                <Separator className="my-6" />

                                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">For Authors</h3>
                                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                                    We welcome submissions from researchers, academics, and practitioners in the field. Please review our
                                    author guidelines and submission requirements before submitting your manuscript.
                                </p>
                                <div className="mt-4">
                                    <Button className="bg-[#00853c] hover:bg-[#006b30]">
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Author Guidelines
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="bg-gradient-to-r from-[#00853c] to-[#04a64b] py-12 text-center text-sm text-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 flex justify-center gap-6">
                            <Link href={route('home')} className="hover:text-[#FCEE1F]">
                                Home
                            </Link>
                            <Link href={route('journals.index')} className="hover:text-[#FCEE1F]">
                                Browse Journals
                            </Link>
                            <a href="#" className="hover:text-[#FCEE1F]">
                                About Us
                            </a>
                            <a href="#" className="hover:text-[#FCEE1F]">
                                Privacy Policy
                            </a>
                            <a href="#" className="hover:text-[#FCEE1F]">
                                Contact Support
                            </a>
                        </div>
                        <p>&copy; {new Date().getFullYear()} JurnalMu - Muhammadiyah Academic Network.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
