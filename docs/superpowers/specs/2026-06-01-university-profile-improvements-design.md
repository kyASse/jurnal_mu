# University Profile Improvements Design Spec

Specification for improving the University Profile editing form and public profile view.

## Goal
Improve the user experience and flexibility of the University Profile page by reordering fields, supporting multiple phone numbers, allowing larger descriptions with word limit indicators, and truncating descriptions on the public page with a read-more toggle.

## Requirements

### 1. Database & Validation Updates
- Migration to alter `universities.profile_description` to `TEXT` (completed) and `universities.phone` to `VARCHAR(100)` (completed).
- Controller validation updates in `Admin/UniversityController.php` and `AdminKampus/UniversityController.php`:
  - `phone`: change to `nullable|string|max:100`.
  - `profile_description`: change to custom validation to limit count to maximum 250 words using word splitting regex.

### 2. Field Reordering
- Swap `province` and `city` fields in the `Edit.tsx` form. `province` must come before `city` to maintain natural hierarchy.

### 3. Multiple Phone Numbers (Dynamic Inputs)
- Allow university admin to input multiple phone numbers.
- Split database string `phone` (comma-separated, e.g., `"021-12345, 08123456"`) into an array state.
- Render dynamic list of inputs with "+" (add) and "X" (delete) buttons.
- Join array back into comma-separated string upon value changes and update the form state.

### 4. Description Word Counter
- Client-side word count helper.
- Display `X / 250 kata` under the description text area.
- Color helper dynamically (e.g. amber or red if word count exceeds 250).

### 5. Public UI "More Detail" Toggle
- On `Browse/UniversityProfile.tsx`, display the description in a card below the stats grid.
- If description length is greater than 300 characters, truncate the text and display a "Baca Selengkapnya" button.
- Toggle inline text expansion on button click.
