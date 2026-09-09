<?php

namespace Tests\Unit\Doi;

use App\Enums\Doi\QuotaChangeType;
use App\Enums\Doi\SubscriptionStatus;
use App\Models\DoiPackage;
use App\Models\DoiSimilarityQuotaLog;
use App\Models\DoiSubscription;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use App\Services\Doi\DoiQuotaManagerService;
use Database\Seeders\DoiPackageSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use RuntimeException;
use Tests\TestCase;

class DoiQuotaManagerServiceTest extends TestCase
{
    use DatabaseTransactions;

    protected University $university;

    protected User $user;

    protected User $adminUser;

    protected Journal $journal;

    protected DoiPackage $package;

    protected DoiQuotaManagerService $quotaManager;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRoles();
        $this->seed(DoiPackageSeeder::class);

        $this->university = University::factory()->create(['name' => 'Universitas Muhammadiyah Quota Test']);
        $this->user = User::factory()->user()->create(['university_id' => $this->university->id]);
        $this->adminUser = User::factory()->superAdmin()->create();
        $scientificField = ScientificField::factory()->create(['name' => 'Sistem Informasi']);

        $this->journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'scientific_field_id' => $scientificField->id,
            'title' => 'Jurnal Quota Test',
        ]);

        $this->package = DoiPackage::where('code', 'DOI-INST-STD')->firstOrFail();
        $this->quotaManager = new DoiQuotaManagerService;
    }

    public function test_has_remaining_quota_evaluates_correctly(): void
    {
        $subscriptionWithQuota = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'similarity_quota_total' => 20,
            'similarity_quota_used' => 5,
        ]);

        $subscriptionExhausted = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'similarity_quota_total' => 10,
            'similarity_quota_used' => 10,
        ]);

        $this->assertTrue($this->quotaManager->hasRemainingQuota($subscriptionWithQuota));
        $this->assertTrue($this->quotaManager->hasRemainingQuota($subscriptionWithQuota, 15));
        $this->assertFalse($this->quotaManager->hasRemainingQuota($subscriptionWithQuota, 16));

        $this->assertFalse($this->quotaManager->hasRemainingQuota($subscriptionExhausted));
        $this->assertFalse($this->quotaManager->hasRemainingQuota($subscriptionExhausted, 1));
    }

    public function test_deduct_quota_records_log_and_updates_used_balance(): void
    {
        $subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'similarity_quota_total' => 50,
            'similarity_quota_used' => 10,
        ]);

        $log = $this->quotaManager->deductQuota(
            subscription: $subscription,
            amount: 5,
            journal: $this->journal,
            user: $this->user,
            description: 'Uji plagiasi artikel #123'
        );

        $this->assertInstanceOf(DoiSimilarityQuotaLog::class, $log);
        $this->assertEquals($subscription->id, $log->subscription_id);
        $this->assertEquals($this->journal->id, $log->journal_id);
        $this->assertEquals($this->user->id, $log->user_id);
        $this->assertEquals(QuotaChangeType::USAGE, $log->change_type);
        $this->assertEquals(-5, $log->amount);
        $this->assertEquals(35, $log->balance_after); // 50 - (10 + 5) = 35
        $this->assertEquals('Uji plagiasi artikel #123', $log->description);

        $subscription->refresh();
        $this->assertEquals(15, $subscription->similarity_quota_used);
        $this->assertEquals(35, $subscription->remaining_quota);
    }

    public function test_deduct_quota_fails_when_exceeding_limit(): void
    {
        $subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'similarity_quota_total' => 10,
            'similarity_quota_used' => 8,
        ]);

        $this->expectException(RuntimeException::class);

        $this->quotaManager->deductQuota(
            subscription: $subscription,
            amount: 5,
            journal: $this->journal,
            user: $this->user,
            description: 'Uji plagiasi melebih kuota'
        );
    }

    public function test_add_quota_updates_total_and_logs_adjustment(): void
    {
        $subscription = DoiSubscription::create([
            'university_id' => $this->university->id,
            'journal_id' => $this->journal->id,
            'doi_package_id' => $this->package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'similarity_quota_total' => 50,
            'similarity_quota_used' => 20,
        ]);

        $log = $this->quotaManager->addQuota(
            subscription: $subscription,
            amount: 25,
            adminUser: $this->adminUser,
            description: 'Top-up kuota similarity manual'
        );

        $this->assertInstanceOf(DoiSimilarityQuotaLog::class, $log);
        $this->assertEquals($subscription->id, $log->subscription_id);
        $this->assertEquals($this->adminUser->id, $log->user_id);
        $this->assertEquals(QuotaChangeType::ADJUSTMENT, $log->change_type);
        $this->assertEquals(25, $log->amount);
        $this->assertEquals(55, $log->balance_after); // (50 + 25) - 20 = 55
        $this->assertEquals('Top-up kuota similarity manual', $log->description);

        $subscription->refresh();
        $this->assertEquals(75, $subscription->similarity_quota_total);
        $this->assertEquals(20, $subscription->similarity_quota_used);
        $this->assertEquals(55, $subscription->remaining_quota);
    }
}
