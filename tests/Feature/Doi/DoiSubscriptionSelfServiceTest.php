<?php

namespace Tests\Feature\Doi;

use App\Actions\Doi\GenerateInvoiceAction;
use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\SubscriptionStatus;
use App\Models\DoiInvoice;
use App\Models\DoiPackage;
use App\Models\DoiSubscription;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Database\Seeders\DoiPackageSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class DoiSubscriptionSelfServiceTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminKampus;

    protected User $regularUser;

    protected University $university;

    protected DoiPackage $package;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Administrator']);
        Role::firstOrCreate(['name' => Role::ADMIN_KAMPUS], ['display_name' => 'Administrator Kampus']);
        Role::firstOrCreate(['name' => Role::USER], ['display_name' => 'Pengelola Jurnal']);

        $this->seed(DoiPackageSeeder::class);

        $this->university = University::factory()->create([
            'name' => 'Universitas Muhammadiyah Self Service Test',
        ]);

        $this->adminKampus = User::factory()->adminKampus()->create([
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $this->regularUser = User::factory()->user()->create([
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $this->package = DoiPackage::where('code', 'DOI-INST-STD')->firstOrFail();
    }

    public function test_admin_kampus_can_subscribe_to_package_and_generate_invoice(): void
    {
        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.doi.subscribe'), [
                'package_id' => $this->package->id,
            ]);

        $subscription = DoiSubscription::where('university_id', $this->university->id)->first();
        $this->assertNotNull($subscription);
        $this->assertEquals($this->package->id, $subscription->doi_package_id);

        $invoice = DoiInvoice::where('subscription_id', $subscription->id)->first();
        $this->assertNotNull($invoice);
        $this->assertEquals(InvoiceStatus::UNPAID, $invoice->status);
        $this->assertEquals($this->package->price_annual, $invoice->total_amount);
        $this->assertEquals($this->adminKampus->id, $invoice->user_id);

        $response->assertRedirect(route('admin-kampus.doi.invoices.index', [
            'invoice_id' => $invoice->id,
            'action' => 'pay',
        ]));
        $response->assertSessionHas('success');
    }

    public function test_admin_kampus_redirected_to_existing_unpaid_invoice_without_duplication(): void
    {
        $subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::INACTIVE,
        ]);

        $action = new GenerateInvoiceAction;
        $existingInvoice = $action->execute($subscription, $this->adminKampus);

        $this->assertEquals(1, DoiInvoice::where('university_id', $this->university->id)->count());

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.doi.subscribe'), [
                'package_id' => $this->package->id,
            ]);

        $this->assertEquals(1, DoiInvoice::where('university_id', $this->university->id)->count());

        $response->assertRedirect(route('admin-kampus.doi.invoices.index', [
            'invoice_id' => $existingInvoice->id,
            'action' => 'pay',
        ]));
        $response->assertSessionHas('warning');
    }

    public function test_non_admin_kampus_cannot_subscribe(): void
    {
        // Regular user attempt
        $response = $this->actingAs($this->regularUser)
            ->post(route('admin-kampus.doi.subscribe'), [
                'package_id' => $this->package->id,
            ]);

        $response->assertStatus(403);

        // Guest attempt
        auth()->logout();
        $guestResponse = $this->post(route('admin-kampus.doi.subscribe'), [
            'package_id' => $this->package->id,
        ]);

        $guestResponse->assertRedirect(route('login'));
    }
}
