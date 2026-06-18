import logoUrl from '@/assets/logo_dark.png';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';

export default function PublicNavbar() {
    const { auth } = usePage<SharedData>().props;

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#079C4E] text-white backdrop-blur-md transition-all">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <Link href={route('home')} className="flex items-center gap-3 transition-opacity hover:opacity-90">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                            <img src={logoUrl} alt="Majelis Diktilitbang" className="h-8 w-8 object-contain" />
                        </div>
                        <span className="font-heading text-2xl font-bold" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                            Journal MU
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden items-center gap-6 pr-4 sm:flex">
                        <Link href={route('journals.index')} className="font-semibold text-white/90 transition-colors hover:text-white">
                            Journals
                        </Link>
                        <Link href={route('browse.articles')} className="font-semibold text-white/90 transition-colors hover:text-white">
                            Articles
                        </Link>
                        <Link href={route('browse.universities')} className="font-semibold text-white/90 transition-colors hover:text-white">
                            Universities
                        </Link>
                        <Link href={route('news.index')} className="font-semibold text-white/90 transition-colors hover:text-white">
                            News
                        </Link>
                        <Link href={route('events.index')} className="font-semibold text-white/90 transition-colors hover:text-white">
                            Events
                        </Link>
                    </div>

                    <AppearanceToggleDropdown buttonClassName="text-white hover:bg-white/20 hover:text-white" />

                    {auth?.user ? (
                        <Link href={route('dashboard')}>
                            <Button variant="secondary" className="border-0 bg-white font-bold text-[#079C4E] hover:bg-gray-100">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')}>
                                <Button variant="ghost" className="px-2 text-white hover:bg-white/20 hover:text-white sm:px-4">
                                    Log in
                                </Button>
                            </Link>
                            <Link href={route('register')}>
                                <Button className="border-0 bg-[#FCEE1F] px-3 font-bold text-black hover:bg-[#e3d51b] sm:px-4">Register</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
