<?php

namespace Tests\Feature\AdminKampus;

use App\Models\Journal;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JournalApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminKampus;

    protected User $otherAdminKampus;

    protected University $university;

    protected University $otherUniversity;

    protected Journal $pendingJournal;

    protected Journal $otherPendingJournal;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminKampusRole = Role::create([
            'name' => 'Admin Kampus',
            'display_name' => 'Admin Kampus',
            'description' => 'University Administrator',
        ]);

        $userRole = Role::create([
            'name' => 'User',
            'display_name' => 'User',
            'description' => 'Regular User',
        ]);

        // Create universities
        $this->university = University::create([
            'name' => 'Universitas Test 1',
            'code' => 'UT1',
            'address' => 'Test Address 1',
        ]);

        $this->otherUniversity = University::create([
            'name' => 'Universitas Test 2',
            'code' => 'UT2',
            'address' => 'Test Address 2',
        ]);

        // Create Admin Kampus users
        $this->adminKampus = User::factory()->create([
            'name' => 'Admin Kampus 1',
            'email' => 'admin1@test.com',
            'role_id' => $adminKampusRole->id,
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $this->otherAdminKampus = User::factory()->create([
            'name' => 'Admin Kampus 2',
            'email' => 'admin2@test.com',
            'role_id' => $adminKampusRole->id,
            'university_id' => $this->otherUniversity->id,
            'is_active' => true,
        ]);

        // Create regular users
        $user1 = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $this->university->id,
        ]);

        $user2 = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $this->otherUniversity->id,
        ]);

        // Create journals
        $this->pendingJournal = Journal::factory()->create([
            'title' => 'Pending Journal Uni 1',
            'user_id' => $user1->id,
            'university_id' => $this->university->id,
            'approval_status' => 'pending',
        ]);

        $this->otherPendingJournal = Journal::factory()->create([
            'title' => 'Pending Journal Uni 2',
            'user_id' => $user2->id,
            'university_id' => $this->otherUniversity->id,
            'approval_status' => 'pending',
        ]);
    }

    public function test_admin_kampus_journals_pending_redirects_to_journals_index(): void
    {
        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin-kampus.journals.pending'));

        $response->assertRedirect(route('admin-kampus.journals.index', [
            'approval_status' => 'pending',
        ]));
    }

    public function test_admin_kampus_can_approve_pending_journal_from_own_university(): void
    {
        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.journals.approve', $this->pendingJournal));

        $response->assertRedirect(route('admin-kampus.journals.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('journals', [
            'id' => $this->pendingJournal->id,
            'approval_status' => 'approved',
            'approved_by' => $this->adminKampus->id,
        ]);
    }

    public function test_admin_kampus_can_reject_pending_journal_from_own_university(): void
    {
        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.journals.reject', $this->pendingJournal), [
                'reason' => 'Rejecting due to incomplete files',
            ]);

        $response->assertRedirect(route('admin-kampus.journals.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('journals', [
            'id' => $this->pendingJournal->id,
            'approval_status' => 'rejected',
            'rejection_reason' => 'Rejecting due to incomplete files',
        ]);
    }

    public function test_admin_kampus_cannot_approve_pending_journal_from_other_university(): void
    {
        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.journals.approve', $this->otherPendingJournal));

        $response->assertStatus(403);

        $this->assertDatabaseHas('journals', [
            'id' => $this->otherPendingJournal->id,
            'approval_status' => 'pending',
        ]);
    }

    public function test_admin_kampus_cannot_reject_pending_journal_from_other_university(): void
    {
        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.journals.reject', $this->otherPendingJournal), [
                'reason' => 'Should fail',
            ]);

        $response->assertStatus(403);

        $this->assertDatabaseHas('journals', [
            'id' => $this->otherPendingJournal->id,
            'approval_status' => 'pending',
        ]);
    }
}
