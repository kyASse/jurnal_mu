# Browse Universities Search & Filter Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Browse Universities UI to have a search/filter form card matching the Journals Browse UI, enabling searching by name/code, filtering by accreditation, and sorting.

**Architecture:** Integrate search, accreditation status, and sort states inside `Browse/Universities.tsx`, replacing the Combobox filter card with a structured form card that updates query params.

**Tech Stack:** React, Tailwind CSS, Laravel, Inertia.js

---

### Task 1: Refactor Browse/Universities.tsx Frontend

**Files:**
- Modify: `resources/js/pages/Browse/Universities.tsx`

- [ ] **Step 1: Update imports and Props interface**

Replace the current imports and `Props` interface at the top of the file:
```typescript
import PublicNavbar from '@/components/public-navbar';
import PublicFooter from '@/components/public-footer';
import JournalCard from '@/components/journal-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
```
And Props:
```typescript
interface Props {
    universityStats: PaginatedUniversities;
    universities: Array<{
        id: number;
        name: string;
        code: string;
        short_name: string | null;
    }>;
    selectedUniversity: SelectedUniversity | null;
    journals: PaginatedJournals | null;
    accreditationOptions: string[];
    filters: {
        search?: string;
        accreditation?: string;
        sort?: string;
    };
}
```

- [ ] **Step 2: Add state variables and handlers**

Inside `BrowseUniversities` component, add:
```typescript
    const [search, setSearch] = useState(filters.search || '');
    const [accreditationFilter, setAccreditationFilter] = useState(filters.accreditation || '');
    const [sortFilter, setSortFilter] = useState(filters.sort || 'name');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('browse.universities'),
            {
                search,
                accreditation: accreditationFilter,
                sort: sortFilter,
            },
            { preserveState: true }
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setAccreditationFilter('');
        setSortFilter('name');
        router.get(route('browse.universities'));
    };
```

- [ ] **Step 3: Replace the filter card UI with the new search form**

Find lines 200-224 containing the old `Filter Card` section and replace it with:
```tsx
                    {/* Filters Section */}
                    <div className="relative z-20 mx-auto -mt-8 mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                            <form onSubmit={handleSearch} className="space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by university name, code, or short name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-12 pl-12 text-base"
                                    />
                                </div>

                                {/* Filters Row */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {/* Accreditation Filter */}
                                    <Select
                                        value={accreditationFilter || 'all'}
                                        onValueChange={(value) => setAccreditationFilter(value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="All Accreditations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Accreditations</SelectItem>
                                            {accreditationOptions.map((opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                    {opt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Sort Filter */}
                                    <Select
                                        value={sortFilter || 'name'}
                                        onValueChange={(value) => setSortFilter(value)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Sort By" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="name">Sort by Name (A-Z)</SelectItem>
                                            <SelectItem value="journals_count">Sort by Journals Count (High-Low)</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Button type="submit" className="h-12 w-full bg-[#079C4E] hover:bg-[#068A42] text-white font-semibold sm:flex-1">
                                            Search
                                        </Button>
                                        {(search || accreditationFilter || sortFilter !== 'name') && (
                                            <Button type="button" variant="outline" onClick={handleClearFilters} className="h-12 w-full sm:w-auto font-semibold">
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
```

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/Browse/Universities.tsx
git commit -m "feat: replace university combobox filter with structured search & filter form"
```

---

### Task 2: Update and Run Verification Tests

**Files:**
- Modify: `tests/Feature/PublicUniversityTest.php`

- [ ] **Step 1: Add search, accreditation, and sort test assertions**

In `tests/Feature/PublicUniversityTest.php`, add a new test case to test filters:
```php
it('allows filtering public universities by search, accreditation, and sort', function () {
    University::factory()->create([
        'name' => 'Universitas Ahmad Dahlan',
        'code' => 'UAD',
        'is_active' => true,
        'accreditation_status' => 'Unggul'
    ]);

    University::factory()->create([
        'name' => 'Universitas Muhammadiyah Yogyakarta',
        'code' => 'UMY',
        'is_active' => true,
        'accreditation_status' => 'A'
    ]);

    // Test Search Filter
    $response = $this->get(route('browse.universities', ['search' => 'Ahmad']));
    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/Universities')
        ->has('universityStats.data', 1)
        ->where('universityStats.data.0.code', 'UAD')
    );

    // Test Accreditation Filter
    $response = $this->get(route('browse.universities', ['accreditation' => 'A']));
    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/Universities')
        ->has('universityStats.data', 1)
        ->where('universityStats.data.0.code', 'UMY')
    );
});
```

- [ ] **Step 2: Run verification test suite**

Run:
```bash
docker exec -i jurnal-mu-app php artisan test --filter=PublicUniversityTest
```
Expected: PASS

- [ ] **Step 3: Run Vite build**

Run:
```bash
npm run build
```
Expected: Pass compilation without errors.

- [ ] **Step 4: Commit**

```bash
git add tests/Feature/PublicUniversityTest.php
git commit -m "test: add filter and search unit test cases for public universities browse page"
```
