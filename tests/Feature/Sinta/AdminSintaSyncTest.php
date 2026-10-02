<?php

namespace Tests\Feature\Sinta;

use App\Jobs\SyncUniversitySintaMetricJob;
use App\Models\University;
use App\Models\UniversitySintaMetric;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdminSintaSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_guest_is_redirected_to_login_when_accessing_admin_sinta(): void
    {
        $response = $this->get('/admin/sinta');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_admin_can_access_admin_sinta_dashboard(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $university1 = University::factory()->create([
            'name' => 'Universitas Muhammadiyah Surakarta',
            'ptm_code' => '051010',
            'is_active' => true,
        ]);

        $university2 = University::factory()->create([
            'name' => 'Universitas Ahmad Dahlan',
            'ptm_code' => '051011',
            'is_active' => true,
        ]);

        UniversitySintaMetric::factory()->create([
            'university_id' => $university1->id,
            'ptm_code' => '051010',
            'sync_status' => 'success',
            'sinta_score_overall' => 450000,
            'last_synced_at' => now(),
        ]);

        UniversitySintaMetric::factory()->create([
            'university_id' => $university2->id,
            'ptm_code' => '051011',
            'sync_status' => 'failed',
            'sync_error' => 'API Timeout',
            'last_synced_at' => now()->subHour(),
        ]);

        $response = $this->actingAs($user)->get('/admin/sinta');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Admin/Sinta/Index')
            ->has('metrics.data', 2)
            ->where('summary.total_ptma', 2)
            ->where('summary.synced_success', 1)
            ->where('summary.synced_failed', 1)
            ->has('summary.mock_mode')
        );
    }

    public function test_admin_can_trigger_sinta_sync_all_and_jobs_are_dispatched(): void
    {
        Queue::fake();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        // Active universities with ptm_code (target for sync)
        University::factory()->create([
            'ptm_code' => '051010',
            'is_active' => true,
        ]);

        University::factory()->create([
            'ptm_code' => '051011',
            'is_active' => true,
        ]);

        University::factory()->create([
            'ptm_code' => '051012',
            'is_active' => true,
        ]);

        // Inactive university or without ptm_code (should be ignored)
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
        Queue::assertPushed(SyncUniversitySintaMetricJob::class, 3);
    }
}
