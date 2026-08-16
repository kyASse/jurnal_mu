<?php

namespace Tests\Feature\Doi;

use App\Models\DoiBankAccount;
use App\Models\DoiPackage;
use Database\Seeders\DoiBankAccountSeeder;
use Database\Seeders\DoiPackageSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class DoiDatabaseFoundationTest extends TestCase
{
    use DatabaseTransactions;

    public function test_seeders_populate_default_packages_and_bank_accounts(): void
    {
        $this->seed(DoiPackageSeeder::class);
        $this->seed(DoiBankAccountSeeder::class);

        $this->assertGreaterThanOrEqual(4, DoiPackage::count());
        $this->assertDatabaseHas('doi_packages', [
            'code' => 'DOI-INST-STD',
            'prefix_included' => true,
            'similarity_quota_included' => 250,
        ]);

        $this->assertGreaterThanOrEqual(2, DoiBankAccount::count());
        $this->assertDatabaseHas('doi_bank_accounts', [
            'bank_code' => 'BSI',
            'account_number' => '7123-4567-89',
        ]);
    }
}
