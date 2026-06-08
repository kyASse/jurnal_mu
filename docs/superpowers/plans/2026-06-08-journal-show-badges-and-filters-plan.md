# Journal Show Page Badges and Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn SINTA and indexing badges into clickable links on the public journal details page, and show active filters info in the articles list header.

**Architecture:** Retrieve raw `indexations` database field containing indexing URLs from backend, declare it in TypeScript definitions, wrap badges in anchor tags, and dynamically render active filters list in the React view.

**Tech Stack:** Laravel, React, TypeScript, Inertia.js, Tailwind CSS

---

### Task 1: Controller Payload Updates

**Files:**
- Modify: `app/Http/Controllers/PublicJournalController.php`

- [ ] **Step 1: Add indexations to Inertia response payload**

Modify `app/Http/Controllers/PublicJournalController.php` around lines 250-256 to include `'indexations' => $journal->indexations,`:

```php
                // Indexation
                'indexed_in' => $journal->indexed_in,
                'indexation_labels' => $journal->indexation_labels,
                'indexations' => $journal->indexations,
```

- [ ] **Step 2: Run backend test suite**

Run: `docker exec -i jurnal-mu-app php artisan test`
Expected: PASS (no broken tests)

- [ ] **Step 3: Commit changes**

```bash
git add app/Http/Controllers/PublicJournalController.php
git commit -m "feat(journals): pass raw indexations to public show view"
```

---

### Task 2: TypeScript Types Update

**Files:**
- Modify: `resources/js/types/index.d.ts`

- [ ] **Step 1: Add indexations to Journal interface**

Modify `resources/js/types/index.d.ts` to add `indexations` field to `Journal` interface:

```typescript
export interface Journal {
    // ... existing fields ...
    indexations?: Record<string, { url?: string; indexed_at?: string }> | null;
}
```

- [ ] **Step 2: Commit changes**

```bash
git add resources/js/types/index.d.ts
git commit -m "types(journals): add indexations attribute to Journal interface"
```

---

### Task 3: Clickable Badges in React View

**Files:**
- Modify: `resources/js/pages/Journals/Show.tsx`

- [ ] **Step 1: Update SINTA Badge link**

Locate the SINTA badge rendering in `resources/js/pages/Journals/Show.tsx`:

```tsx
<SintaBadge rank={journal.sinta_rank ?? null} />
```

Replace it with a link wrapper pointing to SINTA:

```tsx
{journal.sinta_rank && journal.sinta_rank !== 'non_sinta' ? (
    <a
        href={journal.indexations?.SINTA?.url || `https://sinta.kemdikbud.go.id/journals?q=${encodeURIComponent(journal.title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block transition-opacity hover:opacity-85"
    >
        <SintaBadge rank={journal.sinta_rank} />
    </a>
) : (
    <SintaBadge rank={journal.sinta_rank ?? null} />
)}
```

- [ ] **Step 2: Update Indexation Badges links**

Locate the indexation labels mapping in `resources/js/pages/Journals/Show.tsx`:

```tsx
                                {journal.indexation_labels && journal.indexation_labels.length > 0 && (
                                    <>
                                        {journal.indexation_labels.map((indexation, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="outline"
                                                className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300"
                                            >
                                                {indexation}
                                            </Badge>
                                        ))}
                                    </>
                                )}
```

Replace it to filter out `'SINTA'` to avoid duplicates, and wrap badges in links if indexation URLs are available:

```tsx
                                {journal.indexation_labels && journal.indexation_labels.length > 0 && (
                                    <>
                                        {journal.indexation_labels
                                            .filter((label) => label !== 'SINTA')
                                            .map((indexation, idx) => {
                                                const indexationData = journal.indexations?.[indexation];
                                                const url = indexationData?.url;

                                                if (url) {
                                                    return (
                                                        <a
                                                            key={idx}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block transition-opacity hover:opacity-85"
                                                        >
                                                            <Badge
                                                                variant="outline"
                                                                className="cursor-pointer border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
                                                            >
                                                                {indexation}
                                                            </Badge>
                                                        </a>
                                                    );
                                                }

                                                return (
                                                    <Badge
                                                        key={idx}
                                                        variant="outline"
                                                        className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300"
                                                    >
                                                        {indexation}
                                                    </Badge>
                                                );
                                            })}
                                    </>
                                )}
```

- [ ] **Step 3: Commit changes**

```bash
git add resources/js/pages/Journals/Show.tsx
git commit -m "feat(journals): make sinta and indexing badges clickable on show page"
```

---

### Task 4: Filter Indicators in React View Header

**Files:**
- Modify: `resources/js/pages/Journals/Show.tsx`

- [ ] **Step 1: Render plain text filters in articles list header**

Locate the Article List Header in `resources/js/pages/Journals/Show.tsx`:

```tsx
                        {/* Article List Header */}
                        <div className="mb-4 flex items-center justify-between rounded-t-xl bg-muted p-4 dark:bg-muted">
                            <span className="text-sm font-semibold text-foreground">Articles</span>
                            <span className="text-xs text-muted-foreground">{articles.total ?? 0} Documents</span>
                        </div>
```

Modify it to conditionally display active search, year ranges, volume, and issue filters as plain text:

```tsx
                        {/* Article List Header */}
                        <div className="mb-4 flex flex-col gap-2 rounded-t-xl bg-muted p-4 dark:bg-muted sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                                <span className="text-sm font-semibold text-foreground">Articles</span>
                                {(queries.search || queries.year_start || queries.year_end || queries.volume || queries.issue) && (
                                    <span className="text-xs text-muted-foreground">
                                        (Filtered by:{' '}
                                        {[
                                            queries.search && `Search: "${queries.search}"`,
                                            (queries.year_start || queries.year_end) &&
                                                `Year: ${
                                                    queries.year_start && queries.year_end
                                                        ? `${queries.year_start}-${queries.year_end}`
                                                        : queries.year_start
                                                        ? `>= ${queries.year_start}`
                                                        : `<= ${queries.year_end}`
                                                }`,
                                            (queries.volume || queries.issue) &&
                                                `Issue: ${
                                                    queries.volume && queries.issue
                                                        ? `Vol. ${queries.volume}, No. ${queries.issue}`
                                                        : queries.volume
                                                        ? `Vol. ${queries.volume}`
                                                        : `No. ${queries.issue}`
                                                }`,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                        )
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">{articles.total ?? 0} Documents</span>
                        </div>
```

- [ ] **Step 2: Commit changes**

```bash
git add resources/js/pages/Journals/Show.tsx
git commit -m "feat(journals): display active filters in articles header"
```

---

### Task 5: Compilation and Verification

- [ ] **Step 1: Check typescript compilation**

Run: `npm run types`
Expected: PASS (no compilation errors)

- [ ] **Step 2: Check code formatting and styles**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: Build assets**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 4: Run backend tests**

Run: `docker exec -i jurnal-mu-app php artisan test`
Expected: PASS

- [ ] **Step 5: Commit build verification**

```bash
git commit --allow-empty -m "build: verify assets build and linting checks pass"
```
