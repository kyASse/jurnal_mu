# Browse Universities Approved Journals Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Limit the list of universities displayed on the public Browse Universities page to only those with at least one active, approved journal.

**Architecture:** Add a `whereHas` Eloquent constraint checking for active and approved journals relation to the index query in `PublicUniversityController.php`.

**Tech Stack:** Laravel, Eloquent ORM, PHPUnit

---

### Task 1: Update Controller Base Query

**Files:**
- Modify: `app/Http/Controllers/PublicUniversityController.php`

- [ ] **Step 1: Apply whereHas constraint in index query**

In `app/Http/Controllers/PublicUniversityController.php:18-23`, replace:
```php
        $query = University::query()
            ->where('is_active', true)
            ->withCount(['journals' => function ($q) {
                $q->where('is_active', true)
                  ->where('approval_status', 'approved');
            }]);
```
with:
```php
        $query = University::query()
            ->where('is_active', true)
            ->whereHas('journals', function ($q) {
                $q->where('is_active', true)
                  ->where('approval_status', 'approved');
            })
            ->withCount(['journals' => function ($q) {
                $q->where('is_active', true)
                  ->where('approval_status', 'approved');
            }]);
```

- [ ] **Step 2: Commit**

```bash
git add app/Http/Controllers/PublicUniversityController.php
git commit -m "feat: restrict public universities browse to universities with approved journals"
```

---

### Task 2: Update and Run Feature Tests

**Files:**
- Modify: `tests/Feature/PublicUniversityTest.php`

- [ ] **Step 1: Update tests to seed approved journals**

In `tests/Feature/PublicUniversityTest.php`, we must update the test cases to ensure that universities have approved journals so they are loaded, and verify filtering.
Modify the first test `it('loads public universities listing successfully with filters')` to add approved journals to the universities:
```php
it('loads public universities listing successfully with filters', function () {
    $uniA = University::factory()->create([
        'name' => 'Universitas Muhammadiyah A',
        'code' => '051001',
        'is_active' => true,
        'accreditation_status' => 'Unggul'
    ]);
    Journal::factory()->create([
        'university_id' => $uniA->id,
        'is_active' => true,
        'approval_status' => 'approved'
    ]);

    $uniB = University::factory()->create([
        'name' => 'Universitas Muhammadiyah B',
        'code' => '051002',
        'is_active' => true,
        'accreditation_status' => 'A'
    ]);
    Journal::factory()->create([
        'university_id' => $uniB->id,
        'is_active' => true,
        'approval_status' => 'approved'
    ]);

    // Create a university with NO approved journals (should be filtered out)
    $uniC = University::factory()->create([
        'name' => 'Universitas Muhammadiyah C',
        'code' => '051003',
        'is_active' => true,
        'accreditation_status' => 'B'
    ]);

    // Request listing page
    $response = $this->get(route('browse.universities'));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Browse/Universities')
        ->has('universityStats.data', 2)
        ->has('universities', 2)
        ->has('accreditationOptions')
    );
});
```

And in the filtering test `it('allows filtering public universities by search, accreditation, and sort')`:
```php
it('allows filtering public universities by search, accreditation, and sort', function () {
    $uniA = University::factory()->create([
        'name' => 'Universitas Ahmad Dahlan',
        'code' => 'UAD',
        'is_active' => true,
        'accreditation_status' => 'Unggul'
    ]);
    Journal::factory()->create([
        'university_id' => $uniA->id,
        'is_active' => true,
        'approval_status' => 'approved'
    ]);

    $uniB = University::factory()->create([
        'name' => 'Universitas Muhammadiyah Yogyakarta',
        'code' => 'UMY',
        'is_active' => true,
        'accreditation_status' => 'A'
    ]);
    Journal::factory()->create([
        'university_id' => $uniB->id,
        'is_active' => true,
        'approval_status' => 'approved'
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

- [ ] **Step 3: Commit**

```bash
git add tests/Feature/PublicUniversityTest.php
git commit -m "test: update public universities listing test cases to assert approved journals requirement"
```
