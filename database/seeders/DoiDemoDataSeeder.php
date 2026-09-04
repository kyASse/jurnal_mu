<?php

namespace Database\Seeders;

use App\Enums\Doi\InvoiceItemType;
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
use Illuminate\Support\Facades\Storage;

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

        $stdPackage = DoiPackage::where('code', 'DOI-INST-STD')->first() ?? DoiPackage::first();
        $premPackage = DoiPackage::where('code', 'DOI-INST-PREM')->first() ?? $stdPackage;
        $bsiBank = DoiBankAccount::where('bank_name', 'like', '%BSI%')->first() ?? DoiBankAccount::first();

        // -------------------------------------------------------------
        // 1. Universitas Ahmad Dahlan (UAD) - ACTIVE (Admin Kampus & Dewi Kartika)
        // -------------------------------------------------------------
        $uad = University::where('name', 'like', '%Ahmad Dahlan%')->first() ?? University::where('code', 'UAD')->first();
        if ($uad) {
            $adminUad = User::where('email', 'admin.uad@ajm.ac.id')->first() ?? User::where('university_id', $uad->id)->first();

            $subUad = DoiSubscription::updateOrCreate(
                ['university_id' => $uad->id],
                [
                    'doi_package_id' => $stdPackage->id,
                    'status' => SubscriptionStatus::ACTIVE,
                    'start_date' => Carbon::now()->subMonths(2),
                    'end_date' => Carbon::now()->addMonths(10),
                    'active_prefix' => '10.12928',
                    'similarity_quota_total' => 250,
                    'similarity_quota_used' => 38,
                ]
            );

            // Paid Invoice 2025
            $paidInvoice = DoiInvoice::firstOrCreate(
                ['invoice_number' => 'INV/DOI/202508/0001'],
                [
                    'subscription_id' => $subUad->id,
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
                    'item_type' => InvoiceItemType::ANNUAL_FEE,
                    'description' => 'Paket Langganan DOI Institusi Standar (1 Tahun)',
                    'quantity' => 1,
                    'unit_price' => 7500000,
                    'total_price' => 7500000,
                ]);
            }

            // Current Unpaid Invoice 2026
            $unpaidInvoice = DoiInvoice::firstOrCreate(
                ['invoice_number' => 'INV/DOI/202608/0002'],
                [
                    'subscription_id' => $subUad->id,
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
                    'item_type' => InvoiceItemType::ANNUAL_FEE,
                    'description' => 'Perpanjangan Paket Langganan DOI Institusi Standar Periode 2026/2027',
                    'quantity' => 1,
                    'unit_price' => 7500000,
                    'total_price' => 7500000,
                ]);
            }

            // Connect Dewi Kartika
            $dewi = User::where('email', 'dewi.kartika@uad.ac.id')->first();
            if ($dewi) {
                $dewi->update(['university_id' => $uad->id]);
                $journal = $dewi->journals()->first();
                if ($journal) {
                    $journalSub = DoiSubscription::updateOrCreate(
                        ['journal_id' => $journal->id],
                        [
                            'university_id' => $uad->id,
                            'doi_package_id' => $stdPackage->id,
                            'status' => SubscriptionStatus::ACTIVE,
                            'start_date' => Carbon::now()->subMonth(),
                            'end_date' => Carbon::now()->addMonths(11),
                            'active_prefix' => '10.12928',
                            'similarity_quota_total' => 100,
                            'similarity_quota_used' => 12,
                        ]
                    );

                    $journalInvoice = DoiInvoice::firstOrCreate(
                        ['invoice_number' => 'INV/DOI/202608/0003'],
                        [
                            'subscription_id' => $journalSub->id,
                            'university_id' => $uad->id,
                            'user_id' => $dewi->id,
                            'subtotal' => 2500000,
                            'discount' => 0,
                            'tax' => 0,
                            'total_amount' => 2500000,
                            'status' => InvoiceStatus::UNPAID,
                            'period_start' => Carbon::now()->subMonth(),
                            'period_end' => Carbon::now()->addMonths(11),
                            'due_date' => Carbon::now()->addDays(20),
                        ]
                    );

                    if ($journalInvoice->items()->count() === 0) {
                        $journalInvoice->items()->create([
                            'item_type' => InvoiceItemType::ANNUAL_FEE,
                            'description' => 'Paket Langganan DOI Jurnal '.$journal->name,
                            'quantity' => 1,
                            'unit_price' => 2500000,
                            'total_price' => 2500000,
                        ]);
                    }
                }
            }
        }

        // -------------------------------------------------------------
        // 2. Universitas Muhammadiyah Yogyakarta (UMY) - PENDING VERIFICATION
        // -------------------------------------------------------------
        $umy = University::where('name', 'like', '%Yogyakarta%')->first() ?? University::where('code', 'UMY')->first();
        if ($umy) {
            $adminUmy = User::where('email', 'admin.umy@ajm.ac.id')->first() ?? User::where('university_id', $umy->id)->first();

            $subUmy = DoiSubscription::updateOrCreate(
                ['university_id' => $umy->id],
                [
                    'doi_package_id' => $premPackage->id,
                    'status' => SubscriptionStatus::PENDING_VERIFICATION,
                    'start_date' => Carbon::now(),
                    'end_date' => Carbon::now()->addYear(),
                    'active_prefix' => '10.18196',
                    'similarity_quota_total' => 500,
                    'similarity_quota_used' => 0,
                ]
            );

            $invoiceUmy = DoiInvoice::firstOrCreate(
                ['invoice_number' => 'INV/DOI/202608/0004'],
                [
                    'subscription_id' => $subUmy->id,
                    'university_id' => $umy->id,
                    'user_id' => $adminUmy?->id,
                    'subtotal' => 12500000,
                    'discount' => 0,
                    'tax' => 0,
                    'total_amount' => 12500000,
                    'status' => InvoiceStatus::PENDING_VERIFICATION,
                    'period_start' => Carbon::now(),
                    'period_end' => Carbon::now()->addYear(),
                    'due_date' => Carbon::now()->addDays(7),
                ]
            );

            if ($invoiceUmy->items()->count() === 0) {
                $invoiceUmy->items()->create([
                    'item_type' => InvoiceItemType::ANNUAL_FEE,
                    'description' => 'Paket Langganan DOI Institusi Premium (1 Tahun + 500 Kuota Similarity)',
                    'quantity' => 1,
                    'unit_price' => 12500000,
                    'total_price' => 12500000,
                ]);
            }

            // Create sample proof image in storage
            $mockFolder = 'proofs/'.Carbon::now()->format('Y/m');
            Storage::disk('doi_proofs')->makeDirectory($mockFolder);
            $mockFilePath = $mockFolder.'/demo_resi_transfer_umy.png';

            // Generate a simple 1x1 transparent/colored PNG base64 if file doesn't exist
            if (!Storage::disk('doi_proofs')->exists($mockFilePath)) {
                $samplePng = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAlgAAAGQAQMAAAB+K1ZfAAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAAFRJREFUeNrtwTEBAAAAwqD1T20ND6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAY3cQAB+7G8LgAAAABJRU5ErkJggg==');
                Storage::disk('doi_proofs')->put($mockFilePath, $samplePng);
            }

            DoiPaymentProof::firstOrCreate(
                ['invoice_id' => $invoiceUmy->id],
                [
                    'user_id' => $adminUmy?->id ?? User::first()->id,
                    'bank_sender' => 'Bank Syariah Indonesia (BSI)',
                    'account_name' => 'LPPM Universitas Muhammadiyah Yogyakarta',
                    'bank_destination_id' => $bsiBank?->id,
                    'transfer_amount' => 12500000,
                    'transfer_date' => Carbon::now()->toDateString(),
                    'file_path' => $mockFilePath,
                    'file_name' => 'resi_transfer_bsi_umy.png',
                    'file_size' => 102400,
                    'mime_type' => 'image/png',
                    'status' => PaymentProofStatus::PENDING,
                ]
            );
        }

        // -------------------------------------------------------------
        // 3. Universitas Muhammadiyah Surakarta (UMS) - GRACE PERIOD
        // -------------------------------------------------------------
        $ums = University::where('name', 'like', '%Surakarta%')->first() ?? University::where('code', 'UMS')->first();
        if ($ums) {
            DoiSubscription::updateOrCreate(
                ['university_id' => $ums->id],
                [
                    'doi_package_id' => $stdPackage->id,
                    'status' => SubscriptionStatus::GRACE_PERIOD,
                    'start_date' => Carbon::now()->subYear()->subDays(3),
                    'end_date' => Carbon::now()->subDays(3),
                    'active_prefix' => '10.23917',
                    'similarity_quota_total' => 250,
                    'similarity_quota_used' => 240,
                ]
            );
        }

        // -------------------------------------------------------------
        // 4. Universitas Muhammadiyah Malang (UMM) - EXPIRED
        // -------------------------------------------------------------
        $umm = University::where('name', 'like', '%Malang%')->first() ?? University::where('code', 'UMM')->first();
        if ($umm) {
            DoiSubscription::updateOrCreate(
                ['university_id' => $umm->id],
                [
                    'doi_package_id' => $stdPackage->id,
                    'status' => SubscriptionStatus::EXPIRED,
                    'start_date' => Carbon::now()->subYear()->subMonths(1),
                    'end_date' => Carbon::now()->subMonths(1),
                    'active_prefix' => '10.22219',
                    'similarity_quota_total' => 100,
                    'similarity_quota_used' => 100,
                ]
            );
        }
    }
}
