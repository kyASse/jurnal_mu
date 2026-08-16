<?php

namespace Tests\Feature\Doi;

use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\QuotaChangeType;
use App\Enums\Doi\SubscriptionStatus;
use App\Models\DoiBankAccount;
use App\Models\DoiInvoice;
use App\Models\DoiPackage;
use App\Models\DoiPaymentProof;
use App\Models\DoiSimilarityQuotaLog;
use App\Models\DoiSubscription;
use App\Models\Journal;
use App\Models\Role;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DoiPackageSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DoiDashboardTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminKampus;
    protected User $userPengelola;
    protected University $university;
    protected DoiPackage $package;
    protected DoiSubscription $subscription;
    protected Journal $journal;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Administrator']);
        Role::firstOrCreate(['name' => Role::ADMIN_KAMPUS], ['display_name' => 'Administrator Kampus']);
        Role::firstOrCreate(['name' => Role::USER], ['display_name' => 'Pengelola Jurnal']);

        $this->seed(DoiPackageSeeder::class);

        $this->university = University::factory()->create([
            'name' => 'Universitas Muhammadiyah Dashboard Test',
        ]);

        $this->adminKampus = User::factory()->adminKampus()->create([
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $this->userPengelola = User::factory()->user()->create([
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $field = ScientificField::firstOrCreate(['code' => 'KOMP'], ['name' => 'Ilmu Komputer']);

        $this->journal = Journal::factory()->create([
            'user_id' => $this->userPengelola->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $field->id,
            'title' => 'Jurnal Dashboard Test',
        ]);

        $this->package = DoiPackage::where('code', 'DOI-INST-STD')->firstOrFail();

        $this->subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => null,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'start_date' => Carbon::now()->subMonths(2),
            'end_date' => Carbon::now()->addMonths(10),
            'active_prefix' => '10.22219',
            'similarity_quota_total' => 250,
            'similarity_quota_used' => 50,
            'auto_renew' => true,
        ]);
    }

    public function test_admin_kampus_can_view_doi_dashboard_with_active_subscription(): void
    {
        $invoice = DoiInvoice::create([
            'invoice_number' => 'INV/DOI/202608/0099',
            'subscription_id' => $this->subscription->id,
            'university_id' => $this->university->id,
            'user_id' => $this->adminKampus->id,
            'period_start' => Carbon::now(),
            'period_end' => Carbon::now()->addYear(),
            'subtotal' => 7500000,
            'total_amount' => 7500000,
            'status' => InvoiceStatus::UNPAID,
            'due_date' => Carbon::now()->addDays(14),
        ]);

        DoiSimilarityQuotaLog::create([
            'subscription_id' => $this->subscription->id,
            'journal_id' => $this->journal->id,
            'user_id' => $this->adminKampus->id,
            'change_type' => QuotaChangeType::USAGE,
            'amount' => -5,
            'balance_after' => 200,
            'description' => 'Uji similarity artikel Vol 1 No 1',
        ]);

        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin-kampus.doi-subscription.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AdminKampus/Doi/Dashboard')
            ->has('subscription')
            ->where('subscription.status', 'active')
            ->where('subscription.active_prefix', '10.22219')
            ->where('subscription.similarity_quota_total', 250)
            ->where('subscription.similarity_quota_used', 50)
            ->where('subscription.remaining_quota', 200)
            ->has('activeInvoice')
            ->where('activeInvoice.invoice_number', 'INV/DOI/202608/0099')
            ->has('recentQuotaLogs', 1)
            ->where('recentQuotaLogs.0.amount', -5)
            ->where('universityName', $this->university->name)
        );
    }

    public function test_pengelola_jurnal_can_view_doi_dashboard(): void
    {
        $response = $this->actingAs($this->userPengelola)
            ->get(route('user.doi-subscription.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('User/Doi/Dashboard')
            ->has('subscription')
            ->where('subscription.status', 'active')
            ->where('subscription.active_prefix', '10.22219')
        );
    }

    public function test_unauthenticated_user_cannot_view_doi_dashboard(): void
    {
        $response = $this->get('/admin-kampus/doi-subscription');
        $response->assertRedirect('/login');

        $response2 = $this->get('/user/doi-subscription');
        $response2->assertRedirect('/login');
    }

    public function test_dashboard_handles_empty_state_when_no_subscription_exists(): void
    {
        $newUniv = University::factory()->create(['name' => 'Universitas Tanpa Langganan']);
        $newAdmin = User::factory()->adminKampus()->create([
            'university_id' => $newUniv->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($newAdmin)
            ->get(route('admin-kampus.doi-subscription.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AdminKampus/Doi/Dashboard')
            ->where('subscription', null)
            ->where('activeInvoice', null)
            ->has('packages')
        );
    }

    public function test_multi_tenant_isolation_in_dashboard(): void
    {
        $univB = University::factory()->create(['name' => 'Universitas B']);
        $adminB = User::factory()->adminKampus()->create([
            'university_id' => $univB->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($adminB)
            ->get(route('admin-kampus.doi-subscription.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AdminKampus/Doi/Dashboard')
            ->where('subscription', null)
        );
    }
}
