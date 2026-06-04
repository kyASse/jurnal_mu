# Public University Profile Fields Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display missing university profile details (official abbreviation, Kode PT, full address, and multiple phone numbers) in the public university profile hero section.

**Architecture:** Frontend UI update in `Browse/UniversityProfile` React page using conditional render blocks and custom formatting helper.

**Tech Stack:** React, TypeScript, Inertia.js, Tailwind CSS, Lucide icons.

---

### Task 1: Update Types and Hero Layout in UniversityProfile.tsx

**Files:**
- Modify: `resources/js/pages/Browse/UniversityProfile.tsx`
- Test: `tests/Feature/PublicUniversityTest.php`

- [ ] **Step 1: Update TypeScript Prop Types**
  Open [UniversityProfile.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/Browse/UniversityProfile.tsx) and find the `university` prop definition. Add `ptm_code` and `postal_code`:
  ```typescript
  ptm_code: string | null;
  postal_code: string | null;
  ```

- [ ] **Step 2: Import Phone icon**
  Import the `Phone` icon from `lucide-react`:
  ```typescript
  import { Award, BookOpen, Building2, FileText, Globe, Mail, MapPin, Phone, Search, ShieldCheck } from 'lucide-react';
  ```

- [ ] **Step 3: Update Official Abbreviation and Kode PT Display**
  Locate lines 190-192 in the hero section:
  ```tsx
  <p className="mt-2 text-white/90">
      Kode PT: {university.code} {university.short_name && `• ${university.short_name}`}
  </p>
  ```
  Replace it with:
  ```tsx
  <p className="mt-2 text-white/90">
      {university.code.replace(/_/g, ' ')} {university.ptm_code && `• Kode PT: ${university.ptm_code}`} {university.short_name && `• ${university.short_name}`}
  </p>
  ```

- [ ] **Step 4: Update Full Address Formatting**
  Locate lines 194-198 in the hero section:
  ```tsx
  {(university.address || university.city) && (
      <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-[#FCEE1F]" /> {university.address || university.city}
      </span>
  )}
  ```
  Replace it with a helper that constructs a formatted address `{address}, {city}, {province} {postal_code}`:
  ```tsx
  {(() => {
      const addressParts = [];
      if (university.address) addressParts.push(university.address);
      if (university.city) addressParts.push(university.city);
      
      let provZip = '';
      if (university.province) provZip += university.province;
      if (university.postal_code) provZip += (provZip ? ' ' : '') + university.postal_code;
      if (provZip) addressParts.push(provZip);
      
      if (addressParts.length === 0) return null;
      return (
          <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-[#FCEE1F]" /> {addressParts.join(', ')}
          </span>
      );
  })()}
  ```

- [ ] **Step 5: Render Phone Numbers**
  Right after the email rendering block:
  ```tsx
  {university.email && (
      <span className="flex items-center gap-1">
          <Mail className="h-4 w-4 text-[#FCEE1F]" /> {university.email}
      </span>
  )}
  ```
  Add the phone rendering block:
  ```tsx
  {university.phone && (
      <span className="flex items-center gap-1">
          <Phone className="h-4 w-4 text-[#FCEE1F]" /> {university.phone}
      </span>
  )}
  ```

- [ ] **Step 6: Update Feature Test data**
  Open [PublicUniversityTest.php](file:///C:/xampp/htdocs/jurnal_mu/tests/Feature/PublicUniversityTest.php). Find `it('loads specific active university profile details successfully', ...)` and add `ptm_code`, `postal_code`, `province`, and `phone` to the mock university factory creation:
  ```php
  $university = University::factory()->create([
      'name' => 'Test University',
      'code' => 'TEST_UNI',
      'ptm_code' => '123456',
      'is_active' => true,
      'accreditation_status' => 'Unggul',
      'address' => 'Jl. Ahmad Dahlan',
      'city' => 'Yogyakarta',
      'province' => 'DIY',
      'postal_code' => '55281',
      'phone' => '08123456789, 027412345',
  ]);
  ```
  And add expectations to verify that these fields are loaded and match:
  ```php
  ->where('university.ptm_code', '123456')
  ->where('university.postal_code', '55281')
  ->where('university.province', 'DIY')
  ->where('university.phone', '08123456789, 027412345')
  ```

- [ ] **Step 7: Run TypeScript check**
  Run: `npm run types`
  Expected: Command succeeds with no TypeScript compile errors.

- [ ] **Step 8: Run Feature tests**
  Run: `docker exec jurnal-mu-app php artisan test tests/Feature/PublicUniversityTest.php`
  Expected: All tests pass.

- [ ] **Step 9: Commit**
  Run:
  ```bash
  git add resources/js/pages/Browse/UniversityProfile.tsx tests/Feature/PublicUniversityTest.php
  git commit -m "feat: display missing code, address, and phone fields in public university profile hero"
  ```

---

### Task 2: Verify Styles and Formatting

**Files:**
- None (verification task)

- [ ] **Step 1: Check formatting**
  Run: `npm run format:check`
  Expected: PASS

- [ ] **Step 2: Check backend code styling**
  Run: `docker exec jurnal-mu-app ./vendor/bin/pint --test`
  Expected: PASS

- [ ] **Step 3: Commit formatting checks if any auto-fixes occur**
  Run:
  ```bash
  git commit -am "style: format university profile changes" (if any format changes are auto-applied)
  ```
