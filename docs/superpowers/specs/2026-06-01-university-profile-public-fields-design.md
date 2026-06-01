# Spec: University Profile Public Fields Improvement

## Overview
This specification details the improvements to the public university profile page. It aims to integrate missing fields from the university edit form (Admin Kampus dashboard) into the public-facing view.

## Requirements
1. **Official Abbreviation & Codes Display**:
   - `university.code` is the official abbreviation (e.g., `AKKES_MT`). Replace underscores (`_`) with spaces (e.g., `AKKES MT`) and display it in the hero metadata without the "Kode PT:" label.
   - `university.ptm_code` is the actual university code. Display it as `Kode PT: {ptm_code}`.
   - Combine these with `short_name` (if present) in the hero sub-header.
2. **Full Address Formatting**:
   - Format and display the address dynamically as: `{address}, {city}, {province} {postal_code}` (filtering out null/empty parts).
3. **Contact Information**:
   - Display the university's phone numbers (which may contain multiple numbers) using the `Phone` icon in the contact links list of the hero section.

## Architecture & Components
- **Frontend File**: `resources/js/pages/Browse/UniversityProfile.tsx`
  - Update `Props` interface to include `ptm_code` and `postal_code` as optional fields under the `university` object.
  - Import the `Phone` icon from `lucide-react`.
  - Implement rendering changes in the hero section.
- **Backend File**: `app/Http/Controllers/Browse/UniversityController.php` (verify fields are passed).

## Verification Plan
1. **Visual Verification**:
   - Visit a public university profile page.
   - Verify abbreviation format (no underscores, e.g., `AKKES MT`).
   - Verify `Kode PT: {ptm_code}` is displayed in the hero section metadata.
   - Verify full address formatting.
   - Verify phone number list is displayed with the phone icon in the contact line.
2. **Automated Verification**:
   - Run typecheck check: `npm run types`.
   - Run styling/formatting check: `npm run format:check`.
