# Refactor Public Footer & Update Secretariat Info

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the detailed footer into a reusable component and update its secretariat details.

**Architecture:** Move the footer template from `public-layout.tsx` to `public-footer.tsx`, update content with new address/contact details, and clean up imports.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons, Laravel (Inertia.js).

---

### Task 1: Update Public Footer Component

**Files:**
- Modify: `resources/js/components/public-footer.tsx`

- [ ] **Step 1: Replace placeholder footer with detailed footer layout and updated contact details**

Replace content of `resources/js/components/public-footer.tsx` with:

```tsx
import logoUrl from '@/assets/logo_dark.png';
import { Link } from '@inertiajs/react';
import { MapPin, Phone, Printer, Mail, Facebook, Twitter, Youtube, MessageSquare } from 'lucide-react';

export default function PublicFooter() {
    const emailAddress = 'hibahpenelitian@muhammadiyah.id';

    return (
        <footer className="relative mt-auto overflow-hidden bg-gradient-to-br from-[#0d1433] via-[#162050] to-[#1a2a6c] text-white">
            {/* Top Border Accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#232f72] via-[#f7b324] to-[#232f72]" />

            {/* Radial Glow Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_85%,rgba(35,47,114,0.45)_0%,transparent_52%),radial-gradient(ellipse_at_92%_15%,rgba(247,179,36,0.06)_0%,transparent_48%)]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                    
                    {/* Left Column: Sekretariat Contact & Socials */}
                    <div className="col-span-12 md:col-span-4">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/7 p-1">
                                <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
                            </div>
                            <span className="font-heading text-xl font-bold text-white" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                Journal MU
                            </span>
                        </div>
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f7b324] after:h-[1px] after:flex-1 after:bg-gradient-to-r after:from-[#f7b324]/45 after:to-transparent">
                            Sekretariat
                        </h4>
                        <ul className="mt-4 space-y-2.5 text-sm text-white/65">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#f7b324]" />
                                <span>Jln. Brawijaya No.89, Menayu Kidul, Tirtonirmolo, Kasihan, Bantul, D.I. Yogyakarta 55181</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <Phone className="mt-1 h-4 w-4 shrink-0 text-[#f7b324]" />
                                <span>+62 274 376336, 4221040</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <Printer className="mt-1 h-4 w-4 shrink-0 text-[#f7b324]" />
                                <span>Fax: +62 274 389485</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-[#f7b324]" />
                                <span>+62 895-4232-00040</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <Mail className="mt-1 h-4 w-4 shrink-0 text-[#f7b324]" />
                                <a href={`mailto:${emailAddress}`} className="hover:text-[#f7b324] transition-colors">{emailAddress}</a>
                            </li>
                        </ul>
                        
                        {/* Social media icons */}
                        <div className="mt-6 flex gap-2">
                            <a href="https://web.facebook.com/" target="_blank" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/14 bg-white/5 text-sm text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#f7b324] hover:bg-[#f7b324] hover:text-[#0d1433] hover:shadow-[0_6px_18px_rgba(247,179,36,0.3)]">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href="https://twitter.com/" target="_blank" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/14 bg-white/5 text-sm text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#f7b324] hover:bg-[#f7b324] hover:text-[#0d1433] hover:shadow-[0_6px_18px_rgba(247,179,36,0.3)]">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="https://youtube.com/" target="_blank" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/14 bg-white/5 text-sm text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#f7b324] hover:bg-[#f7b324] hover:text-[#0d1433] hover:shadow-[0_6px_18px_rgba(247,179,36,0.3)]">
                                <Youtube className="h-4 w-4" />
                            </a>
                            <a href={`mailto:${emailAddress}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/14 bg-white/5 text-sm text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#f7b324] hover:bg-[#f7b324] hover:text-[#0d1433] hover:shadow-[0_6px_18px_rgba(247,179,36,0.3)]">
                                <Mail className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Middle Column: Nav Links */}
                    <div className="col-span-12 md:col-span-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f7b324] after:h-[1px] after:flex-1 after:bg-gradient-to-r after:from-[#f7b324]/45 after:to-transparent">
                                    Menu
                                </h4>
                                <ul className="mt-4 space-y-2.5">
                                    <li>
                                        <Link href={route('home')} className="group flex items-center gap-2 text-sm text-white/60 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/30 group-hover:bg-[#f7b324]" />
                                            Beranda
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('journals.index')} className="group flex items-center gap-2 text-sm text-white/60 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/30 group-hover:bg-[#f7b324]" />
                                            Jurnal
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('browse.articles')} className="group flex items-center gap-2 text-sm text-white/60 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/30 group-hover:bg-[#f7b324]" />
                                            Artikel
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('browse.universities')} className="group flex items-center gap-2 text-sm text-white/60 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/30 group-hover:bg-[#f7b324]" />
                                            Universitas
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('events.index')} className="group flex items-center gap-2 text-sm text-white/60 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/30 group-hover:bg-[#f7b324]" />
                                            Kegiatan
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f7b324] after:h-[1px] after:flex-1 after:bg-gradient-to-r after:from-[#f7b324]/45 after:to-transparent">
                                    Tautan
                                </h4>
                                <ul className="mt-4 space-y-2.5">
                                    <li>
                                        <a href="https://diktilitbangmuhammadiyah.org" target="_blank" className="group flex items-center gap-2 text-sm text-white/60 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/30 group-hover:bg-[#f7b324]" />
                                            Diktilitbang
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://sinta.kemdiktisaintek.go.id" target="_blank" className="group flex items-center gap-2 text-sm text-white/60 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/30 group-hover:bg-[#f7b324]" />
                                            SINTA
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://garuda.kemdiktisaintek.go.id" target="_blank" className="group flex items-center gap-2 text-sm text-white/60 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/30 group-hover:bg-[#f7b324]" />
                                            Garuda
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://pddikti.kemdiktisaintek.go.id" target="_blank" className="group flex items-center gap-2 text-sm text-white/60 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/30 group-hover:bg-[#f7b324]" />
                                            PDDIKTI
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://bima.kemdiktisaintek.go.id" target="_blank" className="group flex items-center gap-2 text-sm text-white/60 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/30 group-hover:bg-[#f7b324]" />
                                            BIMA
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://arjuna.kemdiktisaintek.go.id" target="_blank" className="group flex items-center gap-2 text-sm text-white/60 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/30 group-hover:bg-[#f7b324]" />
                                            ARJUNA
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Muhammadiyah Logo */}
                    <div className="col-span-12 md:col-span-3">
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f7b324] after:h-[1px] after:flex-1 after:bg-gradient-to-r after:from-[#f7b324]/45 after:to-transparent">
                            Muhammadiyah
                        </h4>
                        <a href="#" className="mt-4 flex min-h-[120px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-[#f7b324]/38 hover:bg-[#f7b324]/4">
                            <img src="https://risetmu.or.id/assets/frontend/img/logo/Logo-Muhammadiyah-warna-hijau.png" alt="Muhammadiyah" className="max-w-[120px] object-contain" />
                        </a>
                    </div>

                </div>
            </div>

            {/* Divider */}
            <hr className="relative z-10 border-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Bottom Copyright */}
            <div className="relative z-10 bg-black/30 py-4 text-center">
                <div className="container mx-auto px-4">
                    <p className="text-xs text-white/40">
                        &copy; {new Date().getFullYear()} <span className="font-semibold text-[#f7b324]">JournalMU</span> &mdash; Majelis Diktilitbang Muhammadiyah. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
```

- [ ] **Step 2: Commit file changes**

Run:
```bash
git add resources/js/components/public-footer.tsx
git commit -m "refactor: extract detailed layout and update secretariat info in PublicFooter"
```

---

### Task 2: Update Public Layout Component

**Files:**
- Modify: `resources/js/layouts/public-layout.tsx`

- [ ] **Step 1: Replace inline detailed footer with PublicFooter component, and clean up imports**

Update `resources/js/layouts/public-layout.tsx`:
- Import `<PublicFooter />` from `@/components/public-footer`
- Remove the inline `<footer>` code block (lines 60-234) and replace with `<PublicFooter />`
- Clean up unused Lucide imports (keep only `LayoutDashboard`)

```tsx
import logoUrl from '@/assets/logo_dark.png';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';
import { PropsWithChildren } from 'react';
import PublicFooter from '@/components/public-footer';

export default function PublicLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-sans text-[#1b1b18] selection:bg-[#079C4E] selection:text-white dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            {/* NAVBAR */}
            <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#079C4E] text-white backdrop-blur-md transition-all">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-1 items-center gap-8">
                        <Link href={route('home')} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                <img src={logoUrl} alt="Majelis Diktilitbang" className="h-8 w-8 object-contain" />
                            </div>
                            <span className="font-heading text-2xl font-bold" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                Journal MU
                            </span>
                        </Link>

                        <div className="flex items-center gap-4 text-sm font-medium">
                            <Link href={route('events.index')} className="transition-colors hover:text-[#FCEE1F]">
                                Events
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
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

            {/* MAIN CONTENT */}
            <main className="flex-1 pt-16">{children}</main>

            {/* FOOTER */}
            <PublicFooter />
        </div>
    );
}
```

- [ ] **Step 2: Commit file changes**

Run:
```bash
git add resources/js/layouts/public-layout.tsx
git commit -m "refactor: use PublicFooter component in PublicLayout and cleanup unused imports"
```

---

### Task 3: Build Verification

- [ ] **Step 1: Run npm build to verify production assets compile without error**

Run:
```bash
npm run build
```
Expected: Success.
