# Dashboard Soft Delete Metrics Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor dashboard raw queries to Eloquent model queries to automatically filter out soft-deleted records (journals, users, and assessments) across all dashboard roles.

**Architecture:** Update `DashboardController` index queries using Eloquent models (`Journal`, `User`, `JournalAssessment`) instead of direct `DB::table` calls. Add explicit `whereNull` constraints for joined tables.

**Tech Stack:** Laravel, PHP, Eloquent ORM, Pest Test Framework.

---

### Task 1: Refactor DashboardController to Eloquent Models

**Files:**
- Modify: `app/Http/Controllers/DashboardController.php`

- [ ] **Step 1: Add Eloquent Model Imports**
  Open [DashboardController.php](file:///C:/xampp/htdocs/jurnal_mu/app/Http/Controllers/DashboardController.php) and add imports for `User` and `JournalAssessment` models:
  ```php
  use App\Models\User;
  use App\Models\JournalAssessment;
  ```

- [ ] **Step 2: Refactor Super Admin queries**
  Locate Super Admin stats block inside the `index` method:
  ```php
  $stats['total_journals'] = DB::table('journals')->count();
  $stats['total_assessments'] = DB::table('journal_assessments')->count();

  $avgScore = DB::table('journal_assessments')
      ->whereNotNull('total_score')
      ->avg('total_score');
  $stats['average_score'] = $avgScore ? round($avgScore, 2) : 0.0;

  // Add pending LPPM Admin registrations count
  $stats['pending_lppm_count'] = DB::table('users')
      ->whereNull('role_id')
      ->where('approval_status', 'pending')
      ->count();

  // Add university distribution (journal count by university)
  $stats['universities_distribution'] = DB::table('journals')
      ->join('universities', 'journals.university_id', '=', 'universities.id')
      ->select('universities.id', 'universities.name', DB::raw('COUNT(*) as count'))
      ->groupBy('universities.id', 'universities.name')
      ->orderByDesc('count')
      ->get()
      ->toArray();
  ```
  Replace it with:
  ```php
  $stats['total_journals'] = Journal::count();
  $stats['total_assessments'] = JournalAssessment::count();

  $avgScore = JournalAssessment::whereNotNull('total_score')
      ->avg('total_score');
  $stats['average_score'] = $avgScore ? round($avgScore, 2) : 0.0;

  // Add pending LPPM Admin registrations count
  $stats['pending_lppm_count'] = User::whereNull('role_id')
      ->where('approval_status', 'pending')
      ->count();

  // Add university distribution (journal count by university)
  $stats['universities_distribution'] = Journal::join('universities', 'journals.university_id', '=', 'universities.id')
      ->whereNull('universities.deleted_at')
      ->select('universities.id', 'universities.name', DB::raw('COUNT(*) as count'))
      ->groupBy('universities.id', 'universities.name')
      ->orderByDesc('count')
      ->get()
      ->toArray();
  ```

- [ ] **Step 3: Refactor Admin Kampus queries**
  Locate Admin Kampus stats block inside the `index` method:
  ```php
  $stats['total_journals'] = DB::table('journals')
      ->where('university_id', $user->university_id)
      ->count();

  $stats['total_assessments'] = DB::table('journal_assessments')
      ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
      ->where('journals.university_id', $user->university_id)
      ->count();

  $avgScore = DB::table('journal_assessments')
      ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
      ->where('journals.university_id', $user->university_id)
      ->whereNotNull('journal_assessments.total_score')
      ->avg('journal_assessments.total_score');
  $stats['average_score'] = $avgScore ? round($avgScore, 2) : 0.0;

  $stats['pending_users_count'] = DB::table('users')
      ->where('university_id', $user->university_id)
      ->where('approval_status', 'pending')
      ->count();

  $stats['pending_journals_count'] = DB::table('journals')
      ->where('university_id', $user->university_id)
      ->where('approval_status', 'pending')
      ->count();
  ```
  Replace it with:
  ```php
  $stats['total_journals'] = Journal::where('university_id', $user->university_id)
      ->count();

  $stats['total_assessments'] = JournalAssessment::join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
      ->where('journals.university_id', $user->university_id)
      ->whereNull('journals.deleted_at')
      ->count();

  $avgScore = JournalAssessment::join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
      ->where('journals.university_id', $user->university_id)
      ->whereNotNull('journal_assessments.total_score')
      ->whereNull('journals.deleted_at')
      ->avg('journal_assessments.total_score');
  $stats['average_score'] = $avgScore ? round($avgScore, 2) : 0.0;

  $stats['pending_users_count'] = User::where('university_id', $user->university_id)
      ->where('approval_status', 'pending')
      ->count();

  $stats['pending_journals_count'] = Journal::where('university_id', $user->university_id)
      ->where('approval_status', 'pending')
      ->count();
  ```

- [ ] **Step 4: Refactor User queries**
  Locate regular user stats block inside the `index` method:
  ```php
  $stats['total_journals'] = DB::table('journals')
      ->where('user_id', $user->id)
      ->count();

  $stats['total_assessments'] = DB::table('journal_assessments')
      ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
      ->where('journals.user_id', $user->id)
      ->count();

  $avgScore = DB::table('journal_assessments')
      ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
      ->where('journals.user_id', $user->id)
      ->whereNotNull('journal_assessments.total_score')
      ->avg('journal_assessments.total_score');
  $stats['average_score'] = $avgScore ? round($avgScore, 2) : 0.0;

  // Add journal breakdown by approval status for User
  $stats['journals_by_status'] = [
      'pending' => DB::table('journals')
          ->where('user_id', $user->id)
          ->where('approval_status', 'pending')
          ->count(),
      'approved' => DB::table('journals')
          ->where('user_id', $user->id)
          ->where('approval_status', 'approved')
          ->count(),
      'rejected' => DB::table('journals')
          ->where('user_id', $user->id)
          ->where('approval_status', 'rejected')
          ->count(),
  ];
  ```
  Replace it with:
  ```php
  $stats['total_journals'] = Journal::where('user_id', $user->id)
      ->count();

  $stats['total_assessments'] = JournalAssessment::join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
      ->where('journals.user_id', $user->id)
      ->whereNull('journals.deleted_at')
      ->count();

  $avgScore = JournalAssessment::join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
      ->where('journals.user_id', $user->id)
      ->whereNotNull('journal_assessments.total_score')
      ->whereNull('journals.deleted_at')
      ->avg('journal_assessments.total_score');
  $stats['average_score'] = $avgScore ? round($avgScore, 2) : 0.0;

  // Add journal breakdown by approval status for User
  $stats['journals_by_status'] = [
      'pending' => Journal::where('user_id', $user->id)
          ->where('approval_status', 'pending')
          ->count(),
      'approved' => Journal::where('user_id', $user->id)
          ->where('approval_status', 'approved')
          ->count(),
      'rejected' => Journal::where('user_id', $user->id)
          ->where('approval_status', 'rejected')
          ->count(),
  ];
  ```

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add app/Http/Controllers/DashboardController.php
  git commit -m "refactor: convert dashboard raw queries to Eloquent to support soft deletes"
  ```

---

### Task 2: Create Feature Tests for Soft Delete Metrics on Dashboard

**Files:**
- Create: `tests/Feature/DashboardSoftDeleteTest.php`

- [ ] **Step 1: Create DashboardSoftDeleteTest.php**
  Create the file `tests/Feature/DashboardSoftDeleteTest.php` with assertions verifying that soft-deleted journals, assessments, and users are NOT counted on the dashboard:
  ```php
  <?php

  use App\Models\Journal;
  use App\Models\JournalAssessment;
  use App\Models\University;
  use App\Models\User;
  use Inertia\Testing\AssertableInertia;

  uses()->group('feature', 'dashboard');

  beforeEach(function () {
      $this->seedRoles();
      $this->university = University::factory()->create();
      $this->adminKampus = User::factory()->adminKampus()->create(['university_id' => $this->university->id]);
      $this->user = User::factory()->user()->create(['university_id' => $this->university->id]);
  });

  it('excludes soft-deleted records from admin kampus dashboard pending counters', function () {
      // 1. Create active pending journal
      $activeJournal = Journal::factory()->create([
          'university_id' => $this->university->id,
          'user_id' => $this->user->id,
          'approval_status' => 'pending',
      ]);

      // 2. Create soft-deleted pending journal
      $deletedJournal = Journal::factory()->create([
          'university_id' => $this->university->id,
          'user_id' => $this->user->id,
          'approval_status' => 'pending',
      ]);
      $deletedJournal->delete(); // Soft delete

      // 3. Create active pending user
      $activeUser = User::factory()->user()->create([
          'university_id' => $this->university->id,
          'approval_status' => 'pending',
      ]);

      // 4. Create soft-deleted pending user
      $deletedUser = User::factory()->user()->create([
          'university_id' => $this->university->id,
          'approval_status' => 'pending',
      ]);
      $deletedUser->delete(); // Soft delete

      // Request dashboard
      $response = $this->actingAs($this->adminKampus)->get('/dashboard');

      $response->assertStatus(200);
      $response->assertInertia(fn (AssertableInertia $page) => $page
          ->component('dashboard')
          ->where('stats.pending_journals_count', 1) // Excludes deletedJournal
          ->where('stats.pending_users_count', 1)    // Excludes deletedUser
      );
  });
  ```

- [ ] **Step 2: Run tests in Docker container**
  Run: `docker exec jurnal-mu-app php artisan test tests/Feature/DashboardSoftDeleteTest.php`
  Expected: PASS

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add tests/Feature/DashboardSoftDeleteTest.php
  git commit -m "test: add feature tests for dashboard soft delete metrics verification"
  ```
