# Design Spec: Hero Section Cube Pattern

Apply the transparent cube pattern from the CTA section to the hero section background in `welcome.tsx` to align the design language.

## Objectives
- Replace the radial dot pattern in the hero background with the cube pattern (`bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]`).
- Use full opacity for the pattern overlay to match the CTA styling.

## Proposed Changes
Modify [welcome.tsx](file:///c:/xampp/htdocs/jurnal_mu/resources/js/pages/welcome.tsx) to replace the dot pattern `div` in the hero background with the cube pattern `div`.

## Verification Plan
- Run vitest suite to ensure welcome page renders without crashing.
