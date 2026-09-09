<?php

namespace Database\Seeders;

use App\Models\DoiBankAccount;
use Illuminate\Database\Seeder;

class DoiBankAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = [
            [
                'bank_name' => 'Bank Syariah Indonesia',
                'bank_code' => 'BSI',
                'account_number' => '7123-4567-89',
                'account_holder' => 'Majelis Diktilitbang PPM',
                'branch_name' => 'KC Yogyakarta Sudirman',
                'qr_code_url' => null,
                'is_active' => true,
                'display_order' => 1,
            ],
            [
                'bank_name' => 'Bank Mandiri',
                'bank_code' => 'MANDIRI',
                'account_number' => '137-00-1234567-8',
                'account_holder' => 'Majelis Diktilitbang PPM',
                'branch_name' => 'KC Yogyakarta Cik Di Tiro',
                'qr_code_url' => null,
                'is_active' => true,
                'display_order' => 2,
            ],
        ];

        foreach ($accounts as $account) {
            DoiBankAccount::updateOrCreate(
                ['account_number' => $account['account_number']],
                $account
            );
        }
    }
}
