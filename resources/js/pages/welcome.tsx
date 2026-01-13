import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, ArrowRight, LayoutDashboard } from 'lucide-react';
import JournalCard from '@/components/journal-card';
import { useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data representing journals from the database
    const featuredJournals = [
        { id: 1, title: "Jurnal Farmasi Indonesia (Pharmacological Sciences)", sinta_rank: 2, issn: "2302-1234", e_issn: "2302-5678", university: "Univ. Muhammadiyah Surakarta" },
        { id: 2, title: "Muhammadiyah International Journal of Economics", sinta_rank: 3, issn: "1411-1234", e_issn: "2541-5678", university: "Univ. Muhammadiyah Malang" },
        { id: 3, title: "Pedagogia: Jurnal Pendidikan", sinta_rank: 2, issn: "2089-1234", e_issn: "2549-5678", university: "Univ. Muhammadiyah Sidoarjo" },
        { id: 4, title: "Jurnal Hukum dan Keadilan (Law & Justice)", sinta_rank: 4, issn: "1234-5678", e_issn: "9876-5432", university: "Univ. Muhammadiyah Yogyakarta" },
    ];

    return (
        <>
            <Head title="JurnalMu - Muhammadiyah Journal Portal">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gray-50 font-sans text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC] selection:bg-[#079C4E] selection:text-white">

                {/* NAVBAR */}
                <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#079C4E] text-white backdrop-blur-md transition-all">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#079C4E]">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-bold font-heading" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                JurnalMu
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {auth?.user ? (
                                <Link href={route('dashboard')}>
                                    <Button variant="secondary" className="bg-white text-[#079C4E] hover:bg-gray-100 font-bold border-0">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
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
                                        <Button className="bg-[#FCEE1F] text-black hover:bg-[#e3d51b] font-bold border-0">
                                            Register
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* HERO SECTION */}
                <div className="relative pt-16">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#079C4E] to-[#10816F] pb-32 overflow-hidden">
                        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#FCEE1F] opacity-10 blur-3xl mix-blend-overlay"></div>
                        <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#1A2A75] opacity-20 blur-3xl mix-blend-multiply"></div>

                        <div className="absolute inset-0 opacity-5"
                            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}>
                        </div>
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl font-heading"
                            style={{ fontFamily: '"El Messiri", serif' }}>
                            Discover Muhammadiyah's <br /> <span className="text-[#FCEE1F]">Scientific Excellence</span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg text-emerald-50 sm:text-xl">
                            The central portal for academic journals, research papers, and scholarly works
                            from Muhammadiyah Universities across Indonesia.
                        </p>

                        {/* Search Bar */}
                        <div className="mx-auto max-w-2xl">
                            <div className="relative flex items-center shadow-2xl rounded-full">
                                <Search className="absolute left-4 h-6 w-6 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for journals, titles, or ISSN..."
                                    className="h-14 w-full rounded-full border-0 bg-white pl-12 pr-4 text-gray-900 placeholder:text-gray-500 focus:ring-4 focus:ring-[#FCEE1F]/50 sm:text-lg"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button className="absolute right-2 top-2 h-10 rounded-full bg-[#1A2A75] px-6 text-white hover:bg-[#131f57]">
                                    Search
                                </Button>
                            </div>
                            <div className="mt-4 flex justify-center gap-4 text-sm text-emerald-100">
                                <span>Can't find what you're looking for?</span>
                                <a href="#" className="font-semibold text-[#FCEE1F] hover:underline">Browse Categories</a>
                            </div>
                        </div>
                    </div>

                    {/* STATS / ACCREDITATION CARDS (Overlapping Hero) */}
                    <div className="relative z-20 mx-auto -mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                            {[1, 2, 3, 4, 5, 6].map((score) => (
                                <div key={score} className="group cursor-pointer overflow-hidden rounded-xl bg-white p-4 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-800 border-b-4"
                                    style={{ borderColor: score <= 2 ? '#E11A1F' : score <= 4 ? '#FCEE1F' : '#1A2A75' }}>
                                    <div className="mb-1 text-xs font-bold uppercase text-gray-400">Accredited</div>
                                    <div className="flex items-end justify-between">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">SINTA {score}</span>
                                        <span className="text-xs font-medium bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300 group-hover:bg-[#079C4E] group-hover:text-white transition-colors">
                                            {10 + score * 5} Journals
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

                    {/* Featured Journals Section */}
                    <div className="mb-12 flex items-end justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-[#079C4E] font-heading" style={{ fontFamily: '"El Messiri", serif' }}>
                                Featured Journals
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">High-impact research from our network.</p>
                        </div>
                        <Link href={route('journals.index')} className="group flex items-center font-semibold text-[#1A2A75] hover:text-[#079C4E]">
                            View All Journals
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredJournals.map(journal => (
                            <JournalCard
                                key={journal.id}
                                title={journal.title}
                                sinta_rank={journal.sinta_rank}
                                issn={journal.issn}
                                e_issn={journal.e_issn}
                                university={journal.university}
                            />
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="mt-24 overflow-hidden rounded-3xl bg-[#1A2A75] text-white shadow-2xl">
                        <div className="bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] px-6 py-16 text-center sm:px-12 lg:py-20 relative">
                            <div className="relative z-10 max-w-3xl mx-auto">
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading" style={{ fontFamily: '"El Messiri", serif' }}>
                                    Publish Your Research With Us
                                </h2>
                                <p className="mt-4 text-lg text-blue-100">
                                    Join thousands of authors contributing to the advancement of science and technology through Muhammadiyah's network of accredited journals.
                                </p>
                                <div className="mt-8 flex justify-center gap-4">
                                    <Button size="lg" className="bg-[#FCEE1F] text-[#1A2A75] hover:bg-[#e3d51b] font-bold text-lg px-8">
                                        Submit Manuscript
                                    </Button>
                                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#1A2A75] px-8">
                                        Author Guidelines
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                </main>

                {/* FOOTER */}
                <footer className="bg-[#0f172a] py-12 text-center text-sm text-gray-500">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 flex justify-center gap-6">
                            <a href="#" className="hover:text-white">About Us</a>
                            <a href="#" className="hover:text-white">Privacy Policy</a>
                            <a href="#" className="hover:text-white">Contact Support</a>
                        </div>
                        <p>&copy; {new Date().getFullYear()} JurnalMu - Muhammadiyah Higher Education Research Network.</p>
                        <p className="mt-2">Laravel v{(usePage().props as { laravelVersion: string; phpVersion: string }).laravelVersion} (PHP v{(usePage().props as { laravelVersion: string; phpVersion: string }).phpVersion})</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
