<?php

namespace Database\Seeders;

use App\Actions\Doi\GenerateInvoiceAction;
use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\SubscriptionStatus;
use App\Models\DoiBankAccount;
use App\Models\DoiInvoice;
use App\Models\DoiPackage;
use App\Models\DoiPaymentProof;
use App\Models\DoiSubscription;
use App\Models\University;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DoiDemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds for manual demo testing.
     */
    public function run(): void
    {
        $this->call([
            DoiPackageSeeder::class,
            DoiBankAccountSeeder::class,
        ]);

        $uad = University::where('name', 'like', '%Ahmad Dahlan%')->first();
        if (! $uad) {
            $uad = University::first();
        }

        if (! $uad) {
            return;
        }

        $adminUad = User::where('email', 'admin.uad@ajm.ac.id')->first();
        if (! $adminUad) {
            $adminUad = User::where('university_id', $uad->id)->first();
        }

        $package = DoiPackage::where('code', 'DOI-INST-STD')->first() ?? DoiPackage::first();
        if (! $package) {
            return;
        }

        // 1. Create or update active subscription for UAD
        $subscription = DoiSubscription::updateOrCreate(
            ['university_id' => $uad->id],
            [
                'doi_package_id' => $package->id,
                'status' => SubscriptionStatus::ACTIVE,
                'start_date' => Carbon::now()->subMonths(2),
                'end_date' => Carbon::now()->addMonths(10),
                'active_prefix' => '10.12928',
                'similarity_quota_total' => 250,
                'similarity_quota_used' => 38,
            ]
        );

        $bankAccount = DoiBankAccount::first();

        // 2. Create Historical Paid Invoice (2025/2026)
        $paidInvoice = DoiInvoice::firstOrCreate(
            ['invoice_number' => 'INV/DOI/202508/0001'],
            [
                'subscription_id' => $subscription->id,
                'university_id' => $uad->id,
                'user_id' => $adminUad?->id,
                'subtotal' => 7500000,
                'discount' => 0,
                'tax' => 0,
                'total_amount' => 7500000,
                'status' => InvoiceStatus::PAID,
                'period_start' => Carbon::now()->subYear()->subMonths(2),
                'period_end' => Carbon::now()->subMonths(2),
                'due_date' => Carbon::now()->subYear()->subMonth(),
                'paid_at' => Carbon::now()->subYear()->subMonths(2)->addDays(3),
            ]
        );

        if ($paidInvoice->items()->count() === 0) {
            $paidInvoice->items()->create([
                'item_type' => \App\Enums\Doi\InvoiceItemType::ANNUAL_FEE,
                'description' => 'Paket Langganan DOI Institusi Standar (1 Tahun)',
                'quantity' => 1,
                'unit_price' => 7500000,
                'total_price' => 7500000,
            ]);
        }

        // 3. Create Current Unpaid Invoice (2026/2027) ready for manual payment testing
        $unpaidInvoice = DoiInvoice::firstOrCreate(
            ['invoice_number' => 'INV/DOI/202608/0002'],
            [
                'subscription_id' => $subscription->id,
                'university_id' => $uad->id,
                'user_id' => $adminUad?->id,
                'subtotal' => 7500000,
                'discount' => 0,
                'tax' => 0,
                'total_amount' => 7500000,
                'status' => InvoiceStatus::UNPAID,
                'period_start' => Carbon::now()->subMonths(2),
                'period_end' => Carbon::now()->addMonths(10),
                'due_date' => Carbon::now()->addDays(14),
            ]
        );

        if ($unpaidInvoice->items()->count() === 0) {
            $unpaidInvoice->items()->create([
                'item_type' => \App\Enums\Doi\InvoiceItemType::ANNUAL_FEE,
                'description' => 'Perpanjangan Paket Langganan DOI Institusi Standar Periode 2026/2027',
                'quantity' => 1,
                'unit_price' => 7500000,
                'total_price' => 7500000,
            ]);
        }
    }
}
