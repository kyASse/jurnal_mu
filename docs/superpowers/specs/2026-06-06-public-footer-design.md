# Design Spec: Public Page Footer Redesign

**Date:** 2026-06-06  
**Topic:** Redesign Public Page Footer to match RisetMu aesthetics  
**Status:** Approved by User  

---

## 1. Goal Description
The objective is to replace the current simple footer on the public-facing pages of Journal MU with a modern, feature-rich footer styled similarly to the RisetMu web application. This includes custom brand information, contact details, a menu list, external links, a Muhammadiyah logo card, and a dark copyright bar at the bottom.

---

## 2. Proposed Changes

### 2.1 Backend / Routing
No new routes or backend changes are required as we are reusing the existing public routes:
- `journals.index` (Jurnal)
- `browse.articles` (Artikel)
- `browse.universities` (Universitas)
- `events.index` (Kegiatan)

---

### 2.2 Layout changes in [public-layout.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/layouts/public-layout.tsx)

#### Custom Styling (Tailwind / Custom CSS)
Add a `<style>` block inside the component or implement Tailwind classes that replicate the RisetMu design system:
- Background: A deep navy gradient: `bg-gradient-to-br from-[#0d1433] via-[#162050] to-[#1a2a6c]`.
- Top Border: A decorative border: `bg-gradient-to-r from-[#232f72] via-[#f7b324] to-[#232f72]`.
- Radial glow effects using CSS absolute background layers.
- Headings: Upper case, bold, gold text (`text-[#f7b324]`) with a bottom accent line.
- Nav Lists: Hover effects that slide elements right by `3px` and color them gold.
- Social Icons: Interactive square rounded buttons that lift and color gold on hover.
- Muhammadiyah Logo Card: Card container with hover borders changing to gold.

#### HTML / JSX Structure
Replace the existing `<footer>` element with:
```tsx
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
                        <i className="fas fa-map-marker-alt mt-1 shrink-0 text-xs text-[#f7b324]" />
                        <span>Jl. Cempaka No. 45, Umbulharjo, Yogyakarta 55167</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <i className="fas fa-phone-alt mt-1 shrink-0 text-xs text-[#f7b324]" />
                        <span>+62 274 123456</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <i className="fas fa-fax mt-1 shrink-0 text-xs text-[#f7b324]" />
                        <span>Fax: +62 274 123457</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <i className="fab fa-whatsapp mt-1 shrink-0 text-xs text-[#f7b324]" />
                        <span>+62 812-3456-7890</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <i className="fas fa-envelope mt-1 shrink-0 text-xs text-[#f7b324]" />
                        <a href="mailto:support@jurnalmu.id" className="hover:text-[#f7b324] transition-colors">support@jurnalmu.id</a>
                    </li>
                </ul>
                
                {/* Social media icons */}
                <div className="mt-6 flex gap-2">
                    <a href="https://web.facebook.com/" target="_blank" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/14 bg-white/5 text-sm text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#f7b324] hover:bg-[#f7b324] hover:text-[#0d1433] hover:shadow-[0_6px_18px_rgba(247,179,36,0.3)]">
                        <i className="fab fa-facebook-f" />
                    </a>
                    <a href="https://twitter.com/" target="_blank" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/14 bg-white/5 text-sm text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#f7b324] hover:bg-[#f7b324] hover:text-[#0d1433] hover:shadow-[0_6px_18px_rgba(247,179,36,0.3)]">
                        <i className="fab fa-twitter" />
                    </a>
                    <a href="https://youtube.com/" target="_blank" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/14 bg-white/5 text-sm text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#f7b324] hover:bg-[#f7b324] hover:text-[#0d1433] hover:shadow-[0_6px_18px_rgba(247,179,36,0.3)]">
                        <i className="fab fa-youtube" />
                    </a>
                    <a href="mailto:support@jurnalmu.id" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/14 bg-white/5 text-sm text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#f7b324] hover:bg-[#f7b324] hover:text-[#0d1433] hover:shadow-[0_6px_18px_rgba(247,179,36,0.3)]">
                        <i className="fas fa-envelope" />
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
                                <Link href={route('home')} className="group flex items-center gap-2 text-sm text-white/62 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/38 group-hover:bg-[#f7b324]" />
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link href={route('journals.index')} className="group flex items-center gap-2 text-sm text-white/62 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/38 group-hover:bg-[#f7b324]" />
                                    Jurnal
                                </Link>
                            </li>
                            <li>
                                <Link href={route('browse.articles')} className="group flex items-center gap-2 text-sm text-white/62 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/38 group-hover:bg-[#f7b324]" />
                                    Artikel
                                </Link>
                            </li>
                            <li>
                                <Link href={route('browse.universities')} className="group flex items-center gap-2 text-sm text-white/62 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/38 group-hover:bg-[#f7b324]" />
                                    Universitas
                                </Link>
                            </li>
                            <li>
                                <Link href={route('events.index')} className="group flex items-center gap-2 text-sm text-white/62 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/38 group-hover:bg-[#f7b324]" />
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
                                <a href="https://diktilitbangmuhammadiyah.org" target="_blank" className="group flex items-center gap-2 text-sm text-white/62 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/38 group-hover:bg-[#f7b324]" />
                                    Diktilitbang
                                </a>
                            </li>
                            <li>
                                <a href="https://sinta.kemdiktisaintek.go.id" target="_blank" className="group flex items-center gap-2 text-sm text-white/62 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/38 group-hover:bg-[#f7b324]" />
                                    SINTA
                                </a>
                            </li>
                            <li>
                                <a href="https://garuda.kemdiktisaintek.go.id" target="_blank" className="group flex items-center gap-2 text-sm text-white/62 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/38 group-hover:bg-[#f7b324]" />
                                    Garuda
                                </a>
                            </li>
                            <li>
                                <a href="https://pddikti.kemdiktisaintek.go.id" target="_blank" className="group flex items-center gap-2 text-sm text-white/62 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/38 group-hover:bg-[#f7b324]" />
                                    PDDIKTI
                                </a>
                            </li>
                            <li>
                                <a href="https://bima.kemdiktisaintek.go.id" target="_blank" className="group flex items-center gap-2 text-sm text-white/62 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/38 group-hover:bg-[#f7b324]" />
                                    BIMA
                                </a>
                            </li>
                            <li>
                                <a href="https://arjuna.kemdiktisaintek.go.id" target="_blank" className="group flex items-center gap-2 text-sm text-white/62 transition-all hover:translate-x-1 hover:text-[#f7b324]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7b324]/38 group-hover:bg-[#f7b324]" />
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
                <a href="#" className="mt-4 flex min-h-[120px] items-center justify-center rounded-2xl border border-white/10 bg-white/4 p-6 transition-all duration-300 hover:border-[#f7b324]/38 hover:bg-[#f7b324]/4">
                    <img src="https://risetmu.or.id/assets/frontend/img/logo/Logo-Muhammadiyah-warna-hijau.png" alt="Muhammadiyah" className="max-w-[120px] img-fluid" />
                </a>
            </div>

        </div>
    </div>

    {/* Divider */}
    <hr className="relative z-10 border-0 h-[1px] bg-gradient-to-r from-transparent via-white/9 to-transparent" />

    {/* Bottom Copyright */}
    <div className="relative z-10 bg-black/28 py-4 text-center">
        <div className="container mx-auto px-4">
            <p className="text-xs text-white/42">
                &copy; {new Date().getFullYear()} <span className="font-semibold text-[#f7b324]">JournalMU</span> &mdash; Majelis Diktilitbang Muhammadiyah. All rights reserved.
            </p>
        </div>
    </div>
</footer>
```

---

## 3. Verification Plan
- Verify React layout loads successfully without hydration/rendering errors.
- Confirm fonts ("El Messiri", FontAwesome icons, etc.) display cleanly.
- Check responsive styles on mobile, tablet, and desktop screens.
