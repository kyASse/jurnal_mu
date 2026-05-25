# Discard Universities layout and restore in-place selection

Revert Browse/Universities.tsx to the previous in-place selection layout from commit `ab9dc8e`.

## Proposed Changes

### [MODIFY] [Universities.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/Pages/Browse/Universities.tsx)
Restore the in-place selection state, which renders the select university combobox/dropdown and details on the same page.

* Command: `git checkout ab9dc8e -- resources/js/pages/Browse/Universities.tsx`

## Verification Plan
* Run `npm run build` to verify asset compilation.
* Verify git status shows `Universities.tsx` modified.
