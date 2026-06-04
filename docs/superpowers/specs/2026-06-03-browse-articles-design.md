# Design Spec: Public Articles Browse Page

## 1. Overview
Implement a public articles browse page at `/browse/articles` allowing users to search and filter harvested article records. The search query supports selecting specific search fields (e.g., all fields, title, abstract, subject, author), while the sidebar provides dynamic facets (subjects, journals, and publication years) with record counts matching the current search results.

---

## 2. Architecture & Routes

### Backend Route
Added to `routes/web.php` inside the public routes section (without authentication):
```php
Route::get('/browse/articles', [PublicArticleController::class, 'index'])->name('browse.articles');
```

### Components Created/Modified
* **Controller**: `app/Http/Controllers/PublicArticleController.php`
* **Model**: `app/Models/Article.php` (Implement Searchable trait)
* **Frontend Page**: `resources/js/pages/Browse/Articles.tsx`

---

## 3. Implementation Details

### A. Model Search Setup (`Article.php`)
1. Use `Laravel\Scout\Searchable` trait.
2. Implement `toSearchableArray()` returning:
   ```php
   return [
       'id' => (int) $this->id,
       'title' => $this->title,
       'abstract' => $this->abstract,
       'authors' => is_array($this->authors) ? implode(', ', $this->authors) : $this->authors,
       'keywords' => is_array($this->keywords) ? implode(', ', $this->keywords) : $this->keywords,
       'journal_title' => $this->journal?->title,
       'scientific_field_name' => $this->journal?->scientificField?->name,
   ];
   ```

### B. Controller Logic (`PublicArticleController.php`)
The controller will handle search parameters:
- `q`: Search query text.
- `field`: Search target field (`all`, `title`, `abstract`, `subject`, `author`).
- `subjects`: Array of selected `scientific_field_id`s to filter results.
- `journals`: Array of selected `journal_id`s to filter results.
- `years`: Array of selected publication years to filter results.

#### Query Resolution Strategy:
1. **Initial Search/Base query**:
   - If `field == 'all'` and `q` is filled: use `Article::search($q)` using Scout's driver.
   - If specific field matches (e.g. `title`, `abstract`, `author`, `subject`) and `q` is filled: build custom Eloquent query constraint.
     * `title`: `where('title', 'like', "%{$q}%")`
     * `abstract`: `where('abstract', 'like', "%{$q}%")`
     * `author`: `where('authors', 'like', "%{$q}%")`
     * `subject`: `whereHas('journal.scientificField', fn($query) => $query->where('name', 'like', "%{$q}%"))`
2. **Apply Sidebar Filters**:
   - Apply `subjects` (via `journal.scientific_field_id`), `journals` (via `journal_id`), and `years` (via `YEAR(publication_date)`).
3. **Execute Dynamic Facets Query**:
   To get dynamic counts for the current search filter context, run subqueries grouping and counting results:
   * **Subjects**:
     ```php
     $subjectsFacet = ScientificField::join('journals', 'scientific_fields.id', '=', 'journals.scientific_field_id')
         ->join('articles', 'journals.id', '=', 'articles.journal_id')
         ->whereIn('articles.id', $matchingArticleIdsSubquery)
         ->select('scientific_fields.id', 'scientific_fields.name', DB::raw('COUNT(articles.id) as count'))
         ->groupBy('scientific_fields.id', 'scientific_fields.name')
         ->orderBy('count', 'desc')
         ->get();
     ```
   * **Journals**:
     ```php
     $journalsFacet = Journal::join('articles', 'journals.id', '=', 'articles.journal_id')
         ->whereIn('articles.id', $matchingArticleIdsSubquery)
         ->select('journals.id', 'journals.title', DB::raw('COUNT(articles.id) as count'))
         ->groupBy('journals.id', 'journals.title')
         ->orderBy('count', 'desc')
         ->get();
     ```
   * **Years**:
     ```php
     $yearsFacet = Article::whereIn('id', $matchingArticleIdsSubquery)
         ->select(DB::raw('YEAR(publication_date) as year'), DB::raw('COUNT(id) as count'))
         ->groupBy('year')
         ->orderBy('year', 'desc')
         ->get();
     ```
4. **Pagination**:
   Paginate the results (10 items per page), load relations (`journal.scientificField`, `journal.university`), and return page props to Inertia.

---

### C. Frontend Interface (`Browse/Articles.tsx`)

#### Layout & Layout Wrapping
Includes `<PublicNavbar />` and `<PublicFooter />` directly or wraps inside layout structure.

#### Search Input Controls
* Large searchbar input.
* Dropdown Select input mapping `field` query parameter.
* Submit handles browser state changes via Inertia `router.get`.

#### Left Sidebar (Facet Filters Panel)
Accordion or lists with checkbox controls:
* **Subjects accordion**: Lists scientific fields with counts. Checkbox toggle appends/removes field ID to URL query arrays.
* **Journals accordion**: Lists journal names with counts.
* **Years of Publication accordion**: Lists years with counts.
* **Reset Filters**: Button that clears all URL query params and reloads page.

#### Right Section (Articles List & Cards)
* **Active Filter Badges**: Badges showing e.g., "Subject: Medicine (X)", "Year: 2026 (X)" with click-to-delete behavior.
* **Article Card Details**:
  - Publication metadata: date, volume, issue, page numbers.
  - Title: Bold green hover-colored title.
  - Authors list: Concatenated comma-separated string.
  - Journal Name: Clickable link leading to `/journals/{id}`.
  - Subject Name: Scientific field badge.
  - Published By: `Published by [Publisher]` label.
  - Keywords list: Array of small hashtag-styled gray badges.
  - Collapsible Abstract: "Read Abstract" button toggling abstract content.
  - **Links group**:
    * PDF Button (new tab link if `pdf_url` present).
    * Original Article Button (new tab link if `article_url` present).
    * DOI Button (links to `https://doi.org/{doi}` if `doi` present).
    * Scholar Button (searches Google Scholar using article title).
    * RIS Citation Button: Triggers custom client-side generation and download of `.ris` file.
* **RIS Citation Generation Utility (Client Side)**:
  ```typescript
  const downloadRis = (article: ArticleType) => {
      const year = new Date(article.publication_date).getFullYear();
      const authorsFormatted = article.authors ? article.authors.map(a => `AU  - ${a}`).join('\n') : 'AU  - Unknown';
      const risContent = [
          'TY  - JOUR',
          `TI  - ${article.title}`,
          authorsFormatted,
          `JO  - ${article.journal.title}`,
          `PY  - ${year}`,
          article.volume ? `VL  - ${article.volume}` : '',
          article.issue ? `IS  - ${article.issue}` : '',
          article.pages ? `SP  - ${article.pages}` : '',
          article.doi ? `DO  - ${article.doi}` : '',
          article.article_url ? `UR  - ${article.article_url}` : '',
          article.abstract ? `AB  - ${article.abstract}` : '',
          'ER  -'
      ].filter(line => line !== '').join('\n');
      
      const blob = new Blob([risContent], { type: 'application/x-research-info-systems;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${article.title.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ris`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  ```

---

## 4. Verification & Testing Plan
1. **Database Search Setup verification**:
   - Run Scout import command: `docker exec -it jurnal-mu-app php artisan scout:import "App\Models\Article"` to ensure indexing database runs successfully.
2. **Search Logic unit/integration tests**:
   - Create controller test checking `GET /browse/articles` behaves correctly when supplying search query text and various field filters (`all`, `title`, `author`).
   - Check facet count calculations matching DB assertions.
3. **Manual visual verification**:
   - Ensure the browse page responds perfectly to filters.
   - Test client-side RIS generation downloads correct RIS format.
