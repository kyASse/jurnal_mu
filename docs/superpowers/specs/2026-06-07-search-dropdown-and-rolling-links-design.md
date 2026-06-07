# Search Scope Dropdown and Rotating Browse Links Design

## Goal
Enhance the homepage search functionality by adding a search scope dropdown (Journals, Articles, Universities) before the search button, and rotate the "Can't find what you're looking for?" links automatically with a premium transition animation.

## Architecture
- **Component:** `resources/js/pages/welcome.tsx`
- **State management:** Add hooks to track current search scope and rotating links state.
- **Routing:** Route search queries to their respective index/browse pages.

## UI Design

### 1. Search Bar Layout
The input container is styled as a unified flex container:
- Left: `Search` icon (Lucide).
- Center: Text input field. Placeholder changes dynamically based on search scope.
- Divider: Vertical thin line.
- Dropdown Selector: Custom dropdown button using `@/components/ui/dropdown-menu`. Displays selected scope name, ChevronDown, and matching Lucide icon.
- Right: `Search` button.

### 2. Redirection Routes
- `journals` -> `/journals?search={query}` (route: `journals.index`)
- `articles` -> `/browse/articles?q={query}` (route: `browse.articles`)
- `universities` -> `/browse/universities?search={query}` (route: `browse.universities`)

### 3. Rotating Link Animation
A cycle is established using React state + `useEffect` timer. Every 4 seconds, the active link transitions:
- "Browse Journals" -> `journals.index`
- "Browse Articles" -> `browse.articles`
- "Browse Universities" -> `browse.universities`
- Animation classes apply transition opacity, translation (translate-y), and scale to achieve a smooth slide-up fade effect.

## Testing
- Verify Vite compilation build runs successfully.
- Verify redirect paths when clicking search with different search scopes.
