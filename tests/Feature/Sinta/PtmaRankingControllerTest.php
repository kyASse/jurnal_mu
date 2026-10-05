<?php

namespace Tests\Feature\Sinta;

use App\Jobs\SyncUniversitySintaMetricJob;
use App\Models\Role;
use App\Models\University;
use App\Models\UniversitySintaMetric;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PtmaRankingControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['inertia.testing.ensure_pages_exist' => false]);
    }

    public function test_public_can_view_ptma_ranking_page(): void
    {
        $university = University::factory()->create([
            'name' => 'Universitas Muhammadiyah Yogyakarta',
            'ptm_code' => '051010',
            'is_active' => true,
        ]);

        UniversitySintaMetric::factory()->create([
            'university_id' => $university->id,
            'ptm_code' => '051010',
            'sinta_score_overall' => 250000,
        ]);

        $response = $this->get('/ptma/ranking');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Public/PtmaRanking/Index')
            ->has('rankings')
            ->has('stats')
            ->has('filters')
            ->where('filters.sort', 'sinta_overall')
            ->where('filters.dir', 'desc')
        );
    }

    public function test_public_ranking_accepts_filter_params(): void
    {
        $university = University::factory()->create([
            'name' => 'Universitas Muhammadiyah Surakarta',
            'ptm_code' => '051012',
            'is_active' => true,
        ]);

        UniversitySintaMetric::factory()->create([
            'university_id' => $university->id,
            'ptm_code' => '051012',
            'scopus_docs' => 1500,
        ]);

        $response = $this->get('/ptma/ranking?sort=scopus&q=Muhammadiyah');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Public/PtmaRanking/Index')
            ->where('filters.sort', 'scopus')
            ->where('filters.q', 'Muhammadiyah')
        );
    }

    public function test_guest_cannot_access_admin_sinta(): void
    {
        $response = $this->get('/admin/sinta');
        $response->assertRedirect('/login');
    }

    public function test_non_super_admin_cannot_access_admin_sinta(): void
    {
        $userRole = Role::firstOrCreate(
            ['name' => Role::USER],
            ['display_name' => 'User']
        );
        $user = User::factory()->create([
            'role_id' => $userRole->id,
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->get('/admin/sinta');
        $response->assertStatus(403);
    }

    public function test_admin_can_view_sinta_index(): void
    {
        $superAdminRole = Role::firstOrCreate(
            ['name' => Role::SUPER_ADMIN],
            ['display_name' => 'Super Administrator']
        );
        $user = User::factory()->create([
            'role_id' => $superAdminRole->id,
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        $university = University::factory()->create([
            'name' => 'Universitas Ahmad Dahlan',
            'ptm_code' => '051011',
            'is_active' => true,
        ]);

        UniversitySintaMetric::factory()->create([
            'university_id' => $university->id,
            'ptm_code' => '051011',
            'sync_status' => 'success',
        ]);

        $response = $this->actingAs($user)->get('/admin/sinta');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Admin/Sinta/Index')
            ->has('metrics')
            ->has('summary')
            ->where('summary.total_ptma', 1)
            ->where('summary.synced_success', 1)
        );
    }

    public function test_admin_can_trigger_sync_all(): void
    {
        Queue::fake();

        $superAdminRole = Role::firstOrCreate(
            ['name' => Role::SUPER_ADMIN],
            ['display_name' => 'Super Administrator']
        );
        $user = User::factory()->create([
            'role_id' => $superAdminRole->id,
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        University::factory()->create([
            'ptm_code' => '051010',
            'is_active' => true,
        ]);

        University::factory()->create([
            'ptm_code' => '051011',
            'is_active' => true,
        ]);

        University::factory()->create([
            'ptm_code' => null,
            'is_active' => true,
        ]);

        University::factory()->create([
            'ptm_code' => '051099',
            'is_active' => false,
        ]);

        $response = $this->actingAs($user)->post('/admin/sinta/sync');

        $response->assertRedirect();
        $response->assertSessionHas('success');
        Queue::assertPushed(SyncUniversitySintaMetricJob::class, 2);
    }
}
