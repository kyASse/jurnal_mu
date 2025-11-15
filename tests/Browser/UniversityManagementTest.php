<?php

namespace Tests\Browser;

use App\Models\Journal;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class UniversityManagementTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected User $superAdmin;
    protected Role $superAdminRole;

    protected function setUp(): void
    {
        parent::setUp();

        // Create Super Admin role and user
        $this->superAdminRole = Role::create([
            'name' => 'Super Admin',
            'display_name' => 'Super Administrator',
            'description' => 'Super Administrator with full access',
        ]);

        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@test.com',
            'password' => bcrypt('password'),
            'role_id' => $this->superAdminRole->id,
            'is_active' => true,
        ]);
    }

    /**
     * Test: Visit /admin/universities → See list ✅
     */
    public function test_super_admin_can_visit_universities_list(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->assertPathIs('/admin/universities')
                ->assertSee('Universities')
                ->assertSee('Add University');
        });
    }

    /**
     * Test: Search by name/code → Filter works ✅
     */
    public function test_super_admin_can_search_universities(): void
    {
        // Create test universities
        $university1 = University::create([
            'name' => 'University of Technology',
            'code' => 'UT001',
            'type' => 'negeri',
            'accreditation' => 'A',
            'province' => 'Jakarta',
            'city' => 'Jakarta Selatan',
            'address' => 'Jl. Test No. 1',
            'phone' => '021-1111111',
            'email' => 'ut@test.com',
            'website' => 'https://ut.test.com',
            'is_active' => true,
        ]);

        $university2 = University::create([
            'name' => 'Institute of Science',
            'code' => 'IS002',
            'type' => 'swasta',
            'accreditation' => 'B',
            'province' => 'Bandung',
            'city' => 'Bandung',
            'address' => 'Jl. Test No. 2',
            'phone' => '022-2222222',
            'email' => 'is@test.com',
            'website' => 'https://is.test.com',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($university1, $university2) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->assertSee($university1->name)
                ->assertSee($university2->name)
                ->type('search', 'Technology')
                ->keys('input[name="search"]', '{enter}')
                ->waitForReload()
                ->assertSee($university1->name)
                ->assertDontSee($university2->name)
                ->type('search', $university2->code)
                ->keys('input[name="search"]', '{enter}')
                ->waitForReload()
                ->assertDontSee($university1->name)
                ->assertSee($university2->name);
        });
    }

    /**
     * Test: Click "Add University" → Form appears ✅
     */
    public function test_super_admin_can_access_create_form(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->clickLink('Add University')
                ->assertPathIs('/admin/universities/create')
                ->assertSee('Create University')
                ->assertSee('University Name')
                ->assertSee('University Code')
                ->assertSee('Type')
                ->assertSee('Accreditation')
                ->assertSee('Province')
                ->assertSee('City')
                ->assertSee('Address')
                ->assertSee('Phone')
                ->assertSee('Email')
                ->assertSee('Website');
        });
    }

    /**
     * Test: Fill form & submit → University created ✅
     */
    public function test_super_admin_can_create_university(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities/create')
                ->type('name', 'New Test University')
                ->type('code', 'NTU123')
                ->select('type', 'negeri')
                ->select('accreditation', 'A')
                ->type('province', 'DKI Jakarta')
                ->type('city', 'Jakarta Pusat')
                ->type('address', 'Jl. Sudirman No. 123')
                ->type('postal_code', '10110')
                ->type('phone', '021-3456789')
                ->type('fax', '021-3456790')
                ->type('email', 'info@ntu.ac.id')
                ->type('website', 'https://ntu.ac.id')
                ->type('description', 'A test university for browser testing')
                ->press('Create University')
                ->waitForReload()
                ->assertPathIs('/admin/universities')
                ->assertSee('University created successfully')
                ->assertSee('New Test University');

            // Verify in database
            $this->assertDatabaseHas('universities', [
                'name' => 'New Test University',
                'code' => 'NTU123',
            ]);
        });
    }

    /**
     * Test: Click Edit → Form pre-filled ✅
     */
    public function test_super_admin_can_access_edit_form_with_prefilled_data(): void
    {
        $university = University::create([
            'name' => 'Edit Test University',
            'code' => 'ETU456',
            'type' => 'swasta',
            'accreditation' => 'B',
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
            'address' => 'Jl. Edit No. 1',
            'phone' => '022-1234567',
            'email' => 'edit@test.ac.id',
            'website' => 'https://edit.test.ac.id',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($university) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->click("a[href='/admin/universities/{$university->id}/edit']")
                ->assertPathIs("/admin/universities/{$university->id}/edit")
                ->assertSee('Edit University')
                ->assertInputValue('name', $university->name)
                ->assertInputValue('code', $university->code)
                ->assertSelected('type', $university->type)
                ->assertSelected('accreditation', $university->accreditation)
                ->assertInputValue('province', $university->province)
                ->assertInputValue('city', $university->city)
                ->assertInputValue('address', $university->address)
                ->assertInputValue('phone', $university->phone)
                ->assertInputValue('email', $university->email)
                ->assertInputValue('website', $university->website);
        });
    }

    /**
     * Test: Update & submit → University updated ✅
     */
    public function test_super_admin_can_update_university(): void
    {
        $university = University::create([
            'name' => 'Old University Name',
            'code' => 'OUN789',
            'type' => 'negeri',
            'accreditation' => 'B',
            'province' => 'Jawa Timur',
            'city' => 'Surabaya',
            'address' => 'Jl. Old Address',
            'phone' => '031-1111111',
            'email' => 'old@test.ac.id',
            'website' => 'https://old.test.ac.id',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($university) {
            $browser->loginAs($this->superAdmin)
                ->visit("/admin/universities/{$university->id}/edit")
                ->type('name', 'Updated University Name')
                ->type('code', 'UUN999')
                ->select('type', 'swasta')
                ->select('accreditation', 'A')
                ->type('province', 'Jawa Tengah')
                ->type('city', 'Semarang')
                ->type('address', 'Jl. Updated Address No. 123')
                ->press('Update University')
                ->waitForReload()
                ->assertPathIs('/admin/universities')
                ->assertSee('University updated successfully')
                ->assertSee('Updated University Name');

            // Verify in database
            $this->assertDatabaseHas('universities', [
                'id' => $university->id,
                'name' => 'Updated University Name',
                'code' => 'UUN999',
                'type' => 'swasta',
                'accreditation' => 'A',
            ]);
        });
    }

    /**
     * Test: Click Delete → Confirmation & delete ✅
     */
    public function test_super_admin_can_delete_university(): void
    {
        $university = University::create([
            'name' => 'Delete Test University',
            'code' => 'DTU001',
            'type' => 'swasta',
            'accreditation' => 'C',
            'province' => 'Bali',
            'city' => 'Denpasar',
            'address' => 'Jl. Delete No. 1',
            'phone' => '0361-111111',
            'email' => 'delete@test.ac.id',
            'website' => 'https://delete.test.ac.id',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($university) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->assertSee($university->name)
                ->click("button[onclick*='delete-form-{$university->id}']")
                ->whenAvailable('.dialog', function ($modal) {
                    $modal->assertSee('Are you sure?')
                        ->assertSee('This action cannot be undone')
                        ->press('Delete');
                })
                ->waitForReload()
                ->assertPathIs('/admin/universities')
                ->assertSee('University deleted successfully')
                ->assertDontSee($university->name);

            // Verify deleted from database
            $this->assertDatabaseMissing('universities', [
                'id' => $university->id,
            ]);
        });
    }

    /**
     * Test: Try delete university with journals → Error message ✅
     */
    public function test_super_admin_cannot_delete_university_with_journals(): void
    {
        $university = University::create([
            'name' => 'University with Journals',
            'code' => 'UWJ001',
            'type' => 'negeri',
            'accreditation' => 'A',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta',
            'address' => 'Jl. Journal No. 1',
            'phone' => '021-9999999',
            'email' => 'uwj@test.ac.id',
            'website' => 'https://uwj.test.ac.id',
            'is_active' => true,
        ]);

        // Create a journal for this university
        Journal::create([
            'university_id' => $university->id,
            'title' => 'Test Journal',
            'issn' => '1234-5678',
            'e_issn' => '8765-4321',
            'publisher' => 'Test Publisher',
            'editor_in_chief' => 'Test Editor',
            'frequency' => 'quarterly',
            'first_published_year' => 2020,
            'language' => 'English',
            'url' => 'https://journal.test.com',
            'description' => 'Test journal description',
            'submission_guidelines' => 'Test submission guidelines',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($university) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->assertSee($university->name)
                ->click("button[onclick*='delete-form-{$university->id}']")
                ->whenAvailable('.dialog', function ($modal) {
                    $modal->press('Delete');
                })
                ->waitForReload()
                ->assertSee('Cannot delete university')
                ->assertSee('has associated journals');

            // Verify still in database
            $this->assertDatabaseHas('universities', [
                'id' => $university->id,
            ]);
        });
    }

    /**
     * Test: Pagination works ✅
     */
    public function test_super_admin_can_navigate_pagination(): void
    {
        // Create 25 universities to test pagination (assuming 10 per page)
        for ($i = 1; $i <= 25; $i++) {
            University::create([
                'name' => "Test University {$i}",
                'code' => "TU" . str_pad($i, 3, '0', STR_PAD_LEFT),
                'type' => 'negeri',
                'accreditation' => 'A',
                'province' => 'Jakarta',
                'city' => 'Jakarta',
                'address' => "Jl. Test No. {$i}",
                'phone' => "021-" . str_pad($i, 7, '0', STR_PAD_LEFT),
                'email' => "test{$i}@test.ac.id",
                'website' => "https://test{$i}.ac.id",
                'is_active' => true,
            ]);
        }

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->assertSee('Test University 1')
                ->assertSee('Test University 10')
                ->assertDontSee('Test University 11')
                // Navigate to page 2
                ->clickLink('2')
                ->waitForReload()
                ->assertQueryStringHas('page', '2')
                ->assertDontSee('Test University 1')
                ->assertSee('Test University 11')
                ->assertSee('Test University 20')
                // Navigate to page 3
                ->clickLink('3')
                ->waitForReload()
                ->assertQueryStringHas('page', '3')
                ->assertSee('Test University 21')
                ->assertSee('Test University 25')
                // Navigate back to page 1
                ->clickLink('1')
                ->waitForReload()
                ->assertQueryStringHas('page', '1')
                ->assertSee('Test University 1');
        });
    }

    /**
     * Bonus Test: Verify all universities are visible to Super Admin
     */
    public function test_super_admin_can_see_all_universities_regardless_of_type(): void
    {
        $negeri = University::create([
            'name' => 'Negeri University',
            'code' => 'NU001',
            'type' => 'negeri',
            'accreditation' => 'A',
            'province' => 'Jakarta',
            'city' => 'Jakarta',
            'address' => 'Jl. Negeri',
            'phone' => '021-1111111',
            'email' => 'negeri@test.ac.id',
            'website' => 'https://negeri.ac.id',
            'is_active' => true,
        ]);

        $swasta = University::create([
            'name' => 'Swasta University',
            'code' => 'SU002',
            'type' => 'swasta',
            'accreditation' => 'B',
            'province' => 'Bandung',
            'city' => 'Bandung',
            'address' => 'Jl. Swasta',
            'phone' => '022-2222222',
            'email' => 'swasta@test.ac.id',
            'website' => 'https://swasta.ac.id',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($negeri, $swasta) {
            $browser->loginAs($this->superAdmin)
                ->visit('/admin/universities')
                ->assertSee($negeri->name)
                ->assertSee($swasta->name);
        });
    }
}
