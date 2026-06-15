# Design Spec: Journal Show Page Badges and Filters Update

Update SINTA and indexation badges on the public journal details page to be clickable buttons linking to their respective pages. Also display plain-text indicators in the articles header when active filters (search query, year range, or volume/issue) are applied.

## 1. Backend Controller Changes
File: `app/Http/Controllers/PublicJournalController.php`

Include the raw `indexations` JSON array in the Inertia show payload:
```php
'indexations' => $journal->indexations,
```

## 2. TypeScript Types Update
File: `resources/js/types/index.d.ts`

Add `indexations` property to the `Journal` interface:
```typescript
export interface Journal {
    // ...
    indexations?: Record<string, { url?: string; indexed_at?: string }> | null;
}
```

## 3. Sidebar Badge Link Modification
File: `resources/js/pages/Journals/Show.tsx`

### SINTA Badge
Wrap the existing `<SintaBadge>` in an anchor tag pointing to the database-defined SINTA URL, or fall back to searching SINTA by the journal's title.
- Link: `journal.indexations?.SINTA?.url || "https://sinta.kemdikbud.go.id/journals?q=" + encodeURIComponent(journal.title)`

### Indexing Badges
Iterate over `journal.indexation_labels`, skip `'SINTA'` to avoid duplicates, and retrieve the URL for each platform from `journal.indexations`.
- If a URL exists, wrap the `<Badge>` in an anchor tag targeting `url` with hover styling (`hover:opacity-85`).
- If no URL exists, render the `<Badge>` normally.

## 4. Article List Header Filter Indicators
File: `resources/js/pages/Journals/Show.tsx`

Update the Article List Header structure to render plain text indicators when filters are active:
- Search: `queries.search`
- Year Range: `queries.year_start` / `queries.year_end`
- Issue: `queries.volume` / `queries.issue`
