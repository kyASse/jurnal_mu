import logoUrl from '@/assets/logo_dark.png';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Menu } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
    { label: 'Journals', route: 'journals.index' },
    { label: 'Articles', route: 'browse.articles' },
    { label: 'Universities', route: 'browse.universities' },
    { label: 'News', route: 'news.index' },
    { label: 'Events', route: 'events.index' },
];

export default function PublicNavbar() {
    const { auth } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-primary text-white backdrop-blur-md transition-all">
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
                    {/* Desktop Menu Links */}
                    <div className="hidden items-center gap-6 pr-4 sm:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.route}
                                href={route(link.route)}
                                className="font-semibold text-white/90 transition-colors hover:text-white"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth and Theme Controls */}
                    <div className="hidden items-center gap-2 sm:flex sm:gap-4">
                        <AppearanceToggleDropdown buttonClassName="text-white hover:bg-white/20 hover:text-white" />

                        {auth?.user ? (
                            <Link href={route('dashboard')}>
                                <Button variant="secondary" className="border-0 bg-white font-bold text-primary hover:bg-gray-100">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Dashboard</span>
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
                                    <Button className="border-0 bg-accent-gradient px-3 font-bold text-white hover:bg-accent-gradient/90 sm:px-4">Register</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Navigation Trigger and Sheet Drawer */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white sm:hidden">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="flex w-[300px] flex-col justify-between border-white/10 bg-primary p-6 text-white sm:max-w-sm"
                        >
                            <div className="flex flex-col gap-6">
                                <SheetHeader className="border-b border-white/10 p-0 pb-4">
                                    <SheetTitle className="text-left">
                                        <div className="flex items-center gap-3 text-white">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                                <img src={logoUrl} alt="Majelis Diktilitbang" className="h-8 w-8 object-contain" />
                                            </div>
                                            <span className="font-heading text-2xl font-bold" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                                Journal MU
                                            </span>
                                        </div>
                                    </SheetTitle>
                                    <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
                                </SheetHeader>

                                {/* Body: Stack the nav links vertically */}
                                <div className="flex flex-col gap-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.route}
                                            href={route(link.route)}
                                            onClick={() => setOpen(false)}
                                            className="text-lg font-semibold text-white/90 transition-colors hover:text-white"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>

                                {/* Separator */}
                                <hr className="border-white/10" />

                                {/* Auth Section */}
                                <div className="flex flex-col gap-3">
                                    {auth?.user ? (
                                        <Link href={route('dashboard')} onClick={() => setOpen(false)}>
                                            <Button
                                                variant="secondary"
                                                className="w-full border-0 bg-white font-bold text-primary   hover:bg-gray-100"
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Dashboard
                                            </Button>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link href={route('login')} onClick={() => setOpen(false)}>
                                                <Button variant="ghost" className="w-full border border-white text-white hover:bg-white/20 hover:text-white">
                                                    Log in
                                                </Button>
                                            </Link>
                                            <Link href={route('register')} onClick={() => setOpen(false)}>
                                                <Button className="w-full border-0 bg-accent-gradient font-bold text-white hover:bg-accent-gradient/90">
                                                    Register
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Footer: Appearance Toggle */}
                            <div className="mt-auto space-y-3 border-t border-white/10 pt-6">
                                <h4 className="text-sm font-semibold text-white/70">Appearance</h4>
                                <AppearanceToggleTab className="w-full bg-white/10 text-white dark:bg-black/20" />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}
