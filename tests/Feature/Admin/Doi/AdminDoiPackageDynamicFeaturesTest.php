<?php

namespace Tests\Feature\Admin\Doi;

use App\Models\DoiPackage;
use App\Models\DoiSetting;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDoiPackageDynamicFeaturesTest extends TestCase
{
    use DatabaseTransactions;

    protected User $superAdmin;

    protected User $adminKampus;

    protected University $university;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Administrator']);
        Role::firstOrCreate(['name' => Role::ADMIN_KAMPUS], ['display_name' => 'Administrator Kampus']);
        Role::firstOrCreate(['name' => Role::USER], ['display_name' => 'Pengelola Jurnal']);

        $this->university = University::factory()->create([
            'name' => 'Universitas Muhammadiyah Feature Test',
        ]);

        $this->superAdmin = User::factory()->superAdmin()->create([
            'is_active' => true,
        ]);

        $this->adminKampus = User::factory()->adminKampus()->create([
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);
    }

    public function test_superadmin_can_store_new_doi_package_with_dynamic_features_and_featured_badge(): void
    {
        $payload = [
            'name' => 'Paket Riset Unggulan',
            'code' => 'DOI-UNGGULAN',
            'slug' => 'paket-riset-unggulan',
            'description' => 'Paket langganan khusus kampus riset unggul.',
            'price_annual' => 12500000,
            'prefix_included' => true,
            'similarity_quota_included' => 600,
            'features' => [
                'Prefix DOI Crossref Resmi',
                '600 Kuota Similarity Check / Tahun',
                'Prioritas Support Helpdesk 24 Jam',
                'Workshop Penulisan & Akreditasi',
            ],
            'is_featured' => true,
            'badge_text' => 'Populer',
            'sort_order' => 5,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.doi-management.packages.store'), $payload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('doi_packages', [
            'code' => 'DOI-UNGGULAN',
            'name' => 'Paket Riset Unggulan',
            'is_featured' => 1,
            'badge_text' => 'Populer',
            'sort_order' => 5,
            'similarity_quota_included' => 600,
        ]);

        $package = DoiPackage::where('code', 'DOI-UNGGULAN')->firstOrFail();
        $this->assertTrue($package->is_featured);
        $this->assertEquals('Populer', $package->badge_text);
        $this->assertEquals(5, $package->sort_order);
        $this->assertIsArray($package->features);
        $this->assertCount(4, $package->features);
        $this->assertEquals('Prefix DOI Crossref Resmi', $package->features[0]);
    }

    public function test_superadmin_can_update_existing_doi_package_features_and_featured_status(): void
    {
        $package = DoiPackage::create([
            'name' => 'Paket Reguler',
            'code' => 'DOI-REG-TEST',
            'slug' => 'paket-reguler-test',
            'description' => 'Deskripsi lama',
            'price_annual' => 5000000,
            'prefix_included' => true,
            'similarity_quota_included' => 100,
            'features' => ['Fitur 1', 'Fitur 2'],
            'is_featured' => false,
            'badge_text' => null,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $updatePayload = [
            'name' => 'Paket Reguler Premium',
            'code' => 'DOI-REG-TEST',
            'slug' => 'paket-reguler-premium',
            'description' => 'Deskripsi yang diperbarui',
            'price_annual' => 6000000,
            'prefix_included' => true,
            'similarity_quota_included' => 150,
            'features' => [
                'Fitur 1 Baru',
                'Fitur 2 Baru',
                'Fitur Tambahan Eksklusif',
            ],
            'is_featured' => true,
            'badge_text' => 'Terlaris',
            'sort_order' => 3,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->superAdmin)
            ->put(route('admin.doi-management.packages.update', $package), $updatePayload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $package->refresh();
        $this->assertEquals('Paket Reguler Premium', $package->name);
        $this->assertEquals(6000000, (float) $package->price_annual);
        $this->assertEquals(150, $package->similarity_quota_included);
        $this->assertTrue($package->is_featured);
        $this->assertEquals('Terlaris', $package->badge_text);
        $this->assertEquals(3, $package->sort_order);
        $this->assertIsArray($package->features);
        $this->assertCount(3, $package->features);
        $this->assertEquals('Fitur Tambahan Eksklusif', $package->features[2]);
    }

    public function test_superadmin_can_update_doi_helpdesk_settings(): void
    {
        $payload = [
            'doi_helpdesk_email' => 'helpdesk-doi@jurnalmu.id',
            'doi_helpdesk_phone' => '+6281298765432',
            'doi_helpdesk_hours' => 'Senin - Jumat: 08:00 - 17:00 WIB',
            'doi_helpdesk_notes' => 'Hubungi via WhatsApp pada jam kerja untuk tanggapan kilat.',
        ];

        $response = $this->actingAs($this->superAdmin)
            ->post(route('admin.doi-management.settings.update'), $payload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertEquals('helpdesk-doi@jurnalmu.id', DoiSetting::get('doi_helpdesk_email'));
        $this->assertEquals('+6281298765432', DoiSetting::get('doi_helpdesk_phone'));
        $this->assertEquals('Senin - Jumat: 08:00 - 17:00 WIB', DoiSetting::get('doi_helpdesk_hours'));
        $this->assertEquals('Hubungi via WhatsApp pada jam kerja untuk tanggapan kilat.', DoiSetting::get('doi_helpdesk_notes'));
    }

    public function test_admin_kampus_can_view_doi_dashboard_and_receives_active_packages_ordered_with_dynamic_features_and_doi_settings(): void
    {
        DoiPackage::query()->delete();

        $pkgFeatured = DoiPackage::create([
            'name' => 'Paket Kampus Utama',
            'code' => 'DOI-KAMPUS-UTAMA',
            'slug' => 'paket-kampus-utama',
            'description' => 'Paket rekomendasi institusi',
            'price_annual' => 8500000,
            'prefix_included' => true,
            'similarity_quota_included' => 300,
            'features' => ['Prefix Crossref', '300 Quota', 'Support Dedicated'],
            'is_featured' => true,
            'badge_text' => 'Paling Diminati',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $pkgBasic = DoiPackage::create([
            'name' => 'Paket Kampus Pemula',
            'code' => 'DOI-KAMPUS-BASIC',
            'slug' => 'paket-kampus-basic',
            'description' => 'Paket dasar',
            'price_annual' => 3500000,
            'prefix_included' => true,
            'similarity_quota_included' => 50,
            'features' => ['Prefix Crossref', '50 Quota'],
            'is_featured' => false,
            'badge_text' => null,
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $pkgInactive = DoiPackage::create([
            'name' => 'Paket Nonaktif',
            'code' => 'DOI-INACTIVE',
            'slug' => 'paket-nonaktif',
            'description' => 'Paket sudah tidak dijual',
            'price_annual' => 1000000,
            'prefix_included' => false,
            'similarity_quota_included' => 0,
            'features' => ['Lama'],
            'is_featured' => false,
            'badge_text' => null,
            'sort_order' => 3,
            'is_active' => false,
        ]);

        DoiSetting::set('doi_helpdesk_email', 'admin-kampus-support@jurnalmu.id');
        DoiSetting::set('doi_helpdesk_phone', '+628111222333');

        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin-kampus.doi-subscription.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AdminKampus/Doi/Dashboard')
            ->has('packages', 2)
            ->where('packages.0.code', 'DOI-KAMPUS-UTAMA')
            ->where('packages.0.is_featured', true)
            ->where('packages.0.badge_text', 'Paling Diminati')
            ->where('packages.0.features', ['Prefix Crossref', '300 Quota', 'Support Dedicated'])
            ->where('packages.1.code', 'DOI-KAMPUS-BASIC')
            ->where('packages.1.is_featured', false)
            ->has('doiSettings')
            ->where('doiSettings.doi_helpdesk_email', 'admin-kampus-support@jurnalmu.id')
            ->where('doiSettings.doi_helpdesk_phone', '+628111222333')
        );
    }
}
