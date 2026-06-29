# Design Spec: Journalmu Color Scheme Redesign

Transition journalmu color scheme from green-yellow to Muhammadiyah red-blue guidelines.

## Objectives
- Replace green and yellow colors with Muhammadiyah Navy (`#2C368A`) and Maroon (`#E8242A`).
- Implement an accent gradient from Yellow (`#FCEE1F`) to Maroon (`#E8242A`).
- Provide high-contrast color adjustments for Dark Mode.
- Avoid modifying SVG/PNG logo files (handled separately).

## Proposed Changes

### CSS Variables
Update `resources/css/app.css` to redefine theme variables.

#### Light Mode (:root)
- `--primary`: `#2C368A` (Muhammadiyah Navy)
- `--secondary`: `#E8242A` (Muhammadiyah Maroon)
- `--accent-gradient`: `linear-gradient(135deg, #FCEE1F 0%, #E8242A 100%)`
- `--accent`: `#FCEE1F`
- `--ring`: `#2C368A`
- `--sidebar-primary`: `#2C368A`
- `--sidebar-accent`: `#f0f2ff`
- `--sidebar-accent-foreground`: `#2C368A`

#### Dark Mode (.dark)
- `--primary`: `#5C6BC0` (Light Navy for contrast)
- `--secondary`: `#EF5350` (Light Maroon for contrast)
- `--accent-gradient`: `linear-gradient(135deg, #FCEE1F 0%, #EF5350 100%)`
- `--accent`: `#FCEE1F`
- `--ring`: `#5C6BC0`
- `--sidebar-primary`: `#5C6BC0`
- `--sidebar-accent`: `#1e293b`
- `--sidebar-accent-foreground`: `#5C6BC0`

### Tailwind Integration
Add gradient variable to `@theme` block in `resources/css/app.css`:
```css
--color-accent-gradient: var(--accent-gradient);
```

## Verification Plan
- Verify page renders correctly in light mode with new navy/maroon colors.
- Verify page renders correctly in dark mode with high contrast navy/maroon colors.
- Verify gradient renders correctly if used.
