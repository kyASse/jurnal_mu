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
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->adminKampus = User::factory()->adminKampus()->create(['university_id' => $this->university->id]);
    $this->user = User::factory()->user()->create(['university_id' => $this->university->id]);
});

it('excludes soft-deleted records from super admin dashboard metrics', function () {
    // 1. Active journal and assessment
    $activeJournal = Journal::factory()->create();
    JournalAssessment::factory()->create([
        'journal_id' => $activeJournal->id,
        'total_score' => 80.00,
    ]);

    // 2. Soft-deleted journal and its assessment
    $deletedJournal = Journal::factory()->create();
    JournalAssessment::factory()->create([
        'journal_id' => $deletedJournal->id,
        'total_score' => 90.00,
    ]);
    $deletedJournal->delete(); // Soft delete journal

    // 3. Active journal with soft-deleted assessment
    $activeJournalWithDeletedAssessment = Journal::factory()->create([
        'approval_status' => 'approved',
    ]);
    $deletedAssessment = JournalAssessment::factory()->create([
        'journal_id' => $activeJournalWithDeletedAssessment->id,
        'total_score' => 95.00,
    ]);
    $deletedAssessment->delete(); // Soft delete assessment

    // 4. Active pending user
    User::factory()->user()->create([
        'approval_status' => 'pending',
        'role_id' => null,
    ]);

    // 5. Soft-deleted pending user
    $deletedUser = User::factory()->user()->create([
        'approval_status' => 'pending',
        'role_id' => null,
    ]);
    $deletedUser->delete(); // Soft delete

    $response = $this->actingAs($this->superAdmin)->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('dashboard')
        ->where('stats.total_journals', 2) // activeJournal + activeJournalWithDeletedAssessment
        ->where('stats.total_assessments', 1) // only active assessment
        ->where('stats.average_score', 80) // only active assessment
        ->where('stats.pending_lppm_count', 1) // only active pending user
    );
});

it('excludes soft-deleted records from admin kampus dashboard metrics', function () {
    // 1. Active journal and assessment
    $activeJournal = Journal::factory()->create([
        'university_id' => $this->university->id,
        'user_id' => $this->user->id,
        'approval_status' => 'pending',
    ]);
    JournalAssessment::factory()->create([
        'journal_id' => $activeJournal->id,
        'total_score' => 75.00,
    ]);

    // 2. Soft-deleted journal and its assessment
    $deletedJournal = Journal::factory()->create([
        'university_id' => $this->university->id,
        'user_id' => $this->user->id,
        'approval_status' => 'pending',
    ]);
    JournalAssessment::factory()->create([
        'journal_id' => $deletedJournal->id,
        'total_score' => 90.00,
    ]);
    $deletedJournal->delete(); // Soft delete journal

    // 3. Active journal with soft-deleted assessment
    $activeJournalWithDeletedAssessment = Journal::factory()->create([
        'university_id' => $this->university->id,
        'user_id' => $this->user->id,
        'approval_status' => 'approved',
    ]);
    $deletedAssessment = JournalAssessment::factory()->create([
        'journal_id' => $activeJournalWithDeletedAssessment->id,
        'total_score' => 95.00,
    ]);
    $deletedAssessment->delete(); // Soft delete assessment

    // 4. Active pending user
    User::factory()->user()->create([
        'university_id' => $this->university->id,
        'approval_status' => 'pending',
    ]);

    // 5. Soft-deleted pending user
    $deletedUser = User::factory()->user()->create([
        'university_id' => $this->university->id,
        'approval_status' => 'pending',
    ]);
    $deletedUser->delete(); // Soft delete

    $response = $this->actingAs($this->adminKampus)->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('dashboard')
        ->where('stats.total_journals', 2) // activeJournal + activeJournalWithDeletedAssessment
        ->where('stats.total_assessments', 1) // only active assessment
        ->where('stats.average_score', 75) // only active assessment
        ->where('stats.pending_journals_count', 1) // only active pending journal
        ->where('stats.pending_users_count', 1) // only active pending user
    );
});

it('excludes soft-deleted records from regular user dashboard metrics', function () {
    // 1. Active journal and assessment
    $activeJournal = Journal::factory()->create([
        'university_id' => $this->university->id,
        'user_id' => $this->user->id,
        'approval_status' => 'pending',
    ]);
    JournalAssessment::factory()->create([
        'journal_id' => $activeJournal->id,
        'total_score' => 85.00,
    ]);

    // 2. Soft-deleted journal and its assessment
    $deletedJournal = Journal::factory()->create([
        'university_id' => $this->university->id,
        'user_id' => $this->user->id,
        'approval_status' => 'pending',
    ]);
    JournalAssessment::factory()->create([
        'journal_id' => $deletedJournal->id,
        'total_score' => 90.00,
    ]);
    $deletedJournal->delete(); // Soft delete journal

    // 3. Active journal with soft-deleted assessment
    $activeJournalWithDeletedAssessment = Journal::factory()->create([
        'university_id' => $this->university->id,
        'user_id' => $this->user->id,
        'approval_status' => 'approved',
    ]);
    $deletedAssessment = JournalAssessment::factory()->create([
        'journal_id' => $activeJournalWithDeletedAssessment->id,
        'total_score' => 95.00,
    ]);
    $deletedAssessment->delete(); // Soft delete assessment

    $response = $this->actingAs($this->user)->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('dashboard')
        ->where('stats.total_journals', 2) // activeJournal + activeJournalWithDeletedAssessment
        ->where('stats.total_assessments', 1) // only active assessment
        ->where('stats.average_score', 85) // only active assessment
        ->where('stats.journals_by_status.pending', 1) // only active pending journal
    );
});
