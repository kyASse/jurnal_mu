# Design Spec: Refactor Public Footer Component & Update Secretariat Details

**Date:** 2026-06-07  
**Topic:** Extract detailed footer from `public-layout.tsx` to `public-footer.tsx` and update contact details.  
**Status:** Under Review  

---

## 1. Goal Description
The objective is to:
1. Extract the detailed, styled footer from `resources/js/layouts/public-layout.tsx` and move it into the existing `resources/js/components/public-footer.tsx` component.
2. Update the secretariat details in the footer:
   - **Address:** Jln. Brawijaya No.89, Menayu Kidul, Tirtonirmolo, Kasihan, Bantul, D.I. Yogyakarta 55181
   - **Phone:** +62 274 376336, 4221040
   - **Fax:** +62 274 389485
   - **Mobile:** +62 895-4232-00040
   - **Email:** hibahpenelitian@muhammadiyah.id
3. Replace the inline footer in `resources/js/layouts/public-layout.tsx` with the updated `<PublicFooter />` component.
4. Verify that other pages (`welcome.tsx`, `Browse/Articles.tsx`, `Browse/Universities.tsx`, `Journals/Index.tsx`) that import and render `<PublicFooter />` display the new layout and updated data correctly.

---

## 2. Proposed Changes

### 2.1 File: `resources/js/components/public-footer.tsx`
- Replace existing placeholder content with the detailed footer structure from `public-layout.tsx`.
- Keep imports matching what is needed for the footer:
  - `logoUrl` from `@/assets/logo_dark.png`
  - `Link` from `@inertiajs/react`
  - Lucide icons: `MapPin, Phone, Printer, Mail, Facebook, Twitter, Youtube, MessageSquare`
- Replace secretariat contact lines:
  ```tsx
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
      <a href="mailto:hibahpenelitian@muhammadiyah.id" className="hover:text-[#f7b324] transition-colors">hibahpenelitian@muhammadiyah.id</a>
  </li>
  ```
- Replace social media and email anchors with target address: `hibahpenelitian@muhammadiyah.id`.

### 2.2 File: `resources/js/layouts/public-layout.tsx`
- Import `<PublicFooter />` from `@/components/public-footer`.
- Replace the inline `<footer>` code block (lines 60-234) with `<PublicFooter />`.
- Clean up unused Lucide imports (`MapPin, Phone, Printer, Mail, Facebook, Twitter, Youtube, MessageSquare`).

---

## 3. Verification Plan
- Build assets using Vite/npm to check for compilation/syntax errors.
- Verify that the footer on all public pages (`/`, `/browse/articles`, `/browse/universities`, `/journals`, etc.) loads correctly with the updated contact info.
