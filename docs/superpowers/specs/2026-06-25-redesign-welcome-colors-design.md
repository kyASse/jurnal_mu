# Design Spec: Welcome Page Color Redesign

Transition hardcoded green-yellow and old navy colors in `resources/js/pages/welcome.tsx` to the new Muhammadiyah navy-maroon guidelines and accent gradient.

## Objectives
- Replace hardcoded hex colors (`#079C4E`, `#1A2A75`, `#FCEE1F`) and old color classes in `welcome.tsx` with Tailwind theme classes.
- Apply the brand gradient (`from-primary to-secondary`) to key layout backgrounds (hero section, footer banner).
- Implement the accent gradient on the primary Call-To-Action (CTA) button.
- Ensure high contrast and accessibility for all states.

## Proposed Changes

### welcome.tsx Styling Updates
- Update all occurrences of `#079C4E` to `primary` classes.
- Update all occurrences of `#1A2A75` to `secondary` classes.
- Update all occurrences of `#FCEE1F` to `accent` or `accent-gradient`.
- Update background patterns and banner sections to use modern brand gradients:
  - Hero Section Background: `bg-gradient-to-br from-primary to-secondary`
  - Banner Background: `bg-gradient-to-br from-primary to-secondary`
  - CTA Button: `bg-accent-gradient text-white`

## Verification Plan
- Run `npx vitest run` to make sure we don't break welcome page components or tests.
