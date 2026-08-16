# DOI Subscription Module 0 (Database & Foundation Models) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun seluruh fondasi database dan model Eloquent untuk modul Langganan DOI & Similarity Check (7 tabel migrasi, 5 typed enums, 7 model Eloquent, 2 database seeders, dan automated test suite).

**Architecture:** Menggunakan arsitektur relasional MySQL dengan PHP 8.2 Backed Enums untuk status type-safety, Eloquent Model relations (`hasMany`, `belongsTo`, `hasOne`), custom scopes & accessors (`remaining_quota`, `is_expiring_soon`), serta seeders master paket & rekening resmi Diktilitbang PPM.

**Tech Stack:** Laravel 12, PHP 8.2+, MySQL / MariaDB, PHPUnit 11+.

---

## File Structure Map

```text
app/
├── Enums/
│   └── Doi/
│       ├── SubscriptionStatus.php       # Status langganan: active, inactive, grace_period, expired, pending_verification
│       ├── InvoiceStatus.php            # Status invoice: unpaid, pending_verification, paid, expired, cancelled
│       ├── PaymentProofStatus.php       # Status bukti: pending, approved, rejected
│       ├── InvoiceItemType.php          # Tipe item: annual_fee, prefix_registration, similarity_quota, adjustment
│       └── QuotaChangeType.php          # Log kuota: allocation, usage, adjustment, renewal
├── Models/
│   ├── DoiPackage.php                   # Model master paket langganan
│   ├── DoiSubscription.php              # Model langganan aktif universitas / jurnal
│   ├── DoiInvoice.php                   # Model faktur tagihan
│   ├── DoiInvoiceItem.php               # Model rincian item faktur
│   ├── DoiPaymentProof.php              # Model bukti transfer pembayaran
│   ├── DoiBankAccount.php               # Model rekening bank resmi Diktilitbang
│   └── DoiSimilarityQuotaLog.php        # Model audit log kuota similarity
database/
├── migrations/
│   ├── 2026_08_16_000001_create_doi_packages_table.php
│   ├── 2026_08_16_000002_create_doi_subscriptions_table.php
│   ├── 2026_08_16_000003_create_doi_bank_accounts_table.php
│   ├── 2026_08_16_000004_create_doi_invoices_table.php
│   ├── 2026_08_16_000005_create_doi_invoice_items_table.php
│   ├── 2026_08_16_000006_create_doi_payment_proofs_table.php
│   └── 2026_08_16_000007_create_doi_similarity_quota_logs_table.php
└── seeders/
    ├── DoiPackageSeeder.php             # Seeder data master paket DOI
    └── DoiBankAccountSeeder.php         # Seeder data master rekening bank transfer
tests/
├── Unit/
│   └── Doi/
│       ├── DoiEnumsTest.php             # Unit test untuk backed enums method & formatting
│       └── DoiModelRelationshipTest.php # Unit test relasi model, casts, dan accessors
└── Feature/
    └── Doi/
        └── DoiDatabaseFoundationTest.php# Feature test migrasi dan seeder integrity
```

---

## Tasks

### Task 1: Create PHP 8.2 Backed Enums

**Files:**
- Create: `app/Enums/Doi/SubscriptionStatus.php`
- Create: `app/Enums/Doi/InvoiceStatus.php`
- Create: `app/Enums/Doi/PaymentProofStatus.php`
- Create: `app/Enums/Doi/InvoiceItemType.php`
- Create: `app/Enums/Doi/QuotaChangeType.php`
- Test: `tests/Unit/Doi/DoiEnumsTest.php`

- [ ] **Step 1: Write the failing unit test for Enums**

```php
<?php

namespace Tests\Unit\Doi;

use App\Enums\Doi\InvoiceItemType;
use App\Enums\Doi\InvoiceStatus;
use App\Enums\Doi\PaymentProofStatus;
use App\Enums\Doi\QuotaChangeType;
use App\Enums\Doi\SubscriptionStatus;
use PHPUnit\Framework\TestCase;

class DoiEnumsTest extends TestCase
{
    public function test_subscription_status_enum_values_and_labels(): void
    {
        $this->assertEquals('active', SubscriptionStatus::ACTIVE->value);
        $this->assertEquals('Aktif', SubscriptionStatus::ACTIVE->label());
        $this->assertEquals('emerald', SubscriptionStatus::ACTIVE->color());

        $this->assertEquals('inactive', SubscriptionStatus::INACTIVE->value);
        $this->assertEquals('pending_verification', SubscriptionStatus::PENDING_VERIFICATION->value);
        $this->assertEquals('grace_period', SubscriptionStatus::GRACE_PERIOD->value);
        $this->assertEquals('expired', SubscriptionStatus::EXPIRED->value);
    }

    public function test_invoice_status_enum_values_and_labels(): void
    {
        $this->assertEquals('unpaid', InvoiceStatus::UNPAID->value);
        $this->assertEquals('Belum Dibayar', InvoiceStatus::UNPAID->label());
        $this->assertEquals('paid', InvoiceStatus::PAID->value);
        $this->assertEquals('Lunas', InvoiceStatus::PAID->label());
    }

    public function test_payment_proof_status_enum_values(): void
    {
        $this->assertEquals('pending', PaymentProofStatus::PENDING->value);
        $this->assertEquals('approved', PaymentProofStatus::APPROVED->value);
        $this->assertEquals('rejected', PaymentProofStatus::REJECTED->value);
    }

    public function test_invoice_item_type_enum_values(): void
    {
        $this->assertEquals('annual_fee', InvoiceItemType::ANNUAL_FEE->value);
        $this->assertEquals('prefix_registration', InvoiceItemType::PREFIX_REGISTRATION->value);
        $this->assertEquals('similarity_quota', InvoiceItemType::SIMILARITY_QUOTA->value);
    }

    public function test_quota_change_type_enum_values(): void
    {
        $this->assertEquals('allocation', QuotaChangeType::ALLOCATION->value);
        $this->assertEquals('usage', QuotaChangeType::USAGE->value);
        $this->assertEquals('renewal', QuotaChangeType::RENEWAL->value);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Unit/Doi/DoiEnumsTest.php`  
Expected: FAIL with "Class App\Enums\Doi\SubscriptionStatus not found"

- [ ] **Step 3: Implement the 5 Backed Enum classes**

Create `app/Enums/Doi/SubscriptionStatus.php`:
```php
<?php

namespace App\Enums\Doi;

enum SubscriptionStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case PENDING_VERIFICATION = 'pending_verification';
    case GRACE_PERIOD = 'grace_period';
    case EXPIRED = 'expired';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Aktif',
            self::INACTIVE => 'Belum Aktif',
            self::PENDING_VERIFICATION => 'Menunggu Verifikasi',
            self::GRACE_PERIOD => 'Masa Tenggang',
            self::EXPIRED => 'Kadaluwarsa',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::ACTIVE => 'emerald',
            self::INACTIVE => 'slate',
            self::PENDING_VERIFICATION => 'blue',
            self::GRACE_PERIOD => 'amber',
            self::EXPIRED => 'rose',
        };
    }
}
```

Create `app/Enums/Doi/InvoiceStatus.php`:
```php
<?php

namespace App\Enums\Doi;

enum InvoiceStatus: string
{
    case UNPAID = 'unpaid';
    case PENDING_VERIFICATION = 'pending_verification';
    case PAID = 'paid';
    case EXPIRED = 'expired';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::UNPAID => 'Belum Dibayar',
            self::PENDING_VERIFICATION => 'Menunggu Verifikasi',
            self::PAID => 'Lunas',
            self::EXPIRED => 'Kadaluwarsa',
            self::CANCELLED => 'Dibatalkan',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::UNPAID => 'amber',
            self::PENDING_VERIFICATION => 'blue',
            self::PAID => 'emerald',
            self::EXPIRED => 'slate',
            self::CANCELLED => 'rose',
        };
    }
}
```

Create `app/Enums/Doi/PaymentProofStatus.php`:
```php
<?php

namespace App\Enums\Doi;

enum PaymentProofStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu Review',
            self::APPROVED => 'Disetujui',
            self::REJECTED => 'Ditolak',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'blue',
            self::APPROVED => 'emerald',
            self::REJECTED => 'rose',
        };
    }
}
```

Create `app/Enums/Doi/InvoiceItemType.php`:
```php
<?php

namespace App\Enums\Doi;

enum InvoiceItemType: string
{
    case ANNUAL_FEE = 'annual_fee';
    case PREFIX_REGISTRATION = 'prefix_registration';
    case SIMILARITY_QUOTA = 'similarity_quota';
    case ADJUSTMENT = 'adjustment';

    public function label(): string
    {
        return match ($this) {
            self::ANNUAL_FEE => 'Biaya Tahunan Keanggotaan',
            self::PREFIX_REGISTRATION => 'Registrasi Prefix Crossref',
            self::SIMILARITY_QUOTA => 'Kuota Similarity Check',
            self::ADJUSTMENT => 'Penyesuaian / Diskon',
        };
    }
}
```

Create `app/Enums/Doi/QuotaChangeType.php`:
```php
<?php

namespace App\Enums\Doi;

enum QuotaChangeType: string
{
    case ALLOCATION = 'allocation';
    case USAGE = 'usage';
    case ADJUSTMENT = 'adjustment';
    case RENEWAL = 'renewal';

    public function label(): string
    {
        return match ($this) {
            self::ALLOCATION => 'Alokasi Awal Paket',
            self::USAGE => 'Penggunaan Uji Plagiasi',
            self::ADJUSTMENT => 'Penyesuaian Manual Admin',
            self::RENEWAL => 'Perpanjangan Langganan',
        };
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Unit/Doi/DoiEnumsTest.php`  
Expected: PASS (5 tests, 12 assertions)

- [ ] **Step 5: Commit**

```bash
git add app/Enums/Doi/ tests/Unit/Doi/DoiEnumsTest.php
git commit -m "feat(doi): add PHP 8.2 backed enums for DOI subscription module"
```

---

### Task 2: Create Database Migrations (7 Tables)

**Files:**
- Create: `database/migrations/2026_08_16_000001_create_doi_packages_table.php`
- Create: `database/migrations/2026_08_16_000002_create_doi_subscriptions_table.php`
- Create: `database/migrations/2026_08_16_000003_create_doi_bank_accounts_table.php`
- Create: `database/migrations/2026_08_16_000004_create_doi_invoices_table.php`
- Create: `database/migrations/2026_08_16_000005_create_doi_invoice_items_table.php`
- Create: `database/migrations/2026_08_16_000006_create_doi_payment_proofs_table.php`
- Create: `database/migrations/2026_08_16_000007_create_doi_similarity_quota_logs_table.php`

- [ ] **Step 1: Write migration files**

Write migration `database/migrations/2026_08_16_000001_create_doi_packages_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->string('code', 30)->unique();
            $table->text('description')->nullable();
            $table->decimal('price_annual', 12, 2)->default(0);
            $table->boolean('prefix_included')->default(true);
            $table->integer('similarity_quota_included')->default(100);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_packages');
    }
};
```

Write migration `database/migrations/2026_08_16_000002_create_doi_subscriptions_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->nullable()->constrained('universities')->cascadeOnDelete();
            $table->foreignId('journal_id')->nullable()->constrained('journals')->nullOnDelete();
            $table->foreignId('doi_package_id')->constrained('doi_packages')->restrictOnDelete();
            $table->string('status', 30)->default('inactive')->index();
            $table->date('start_date')->nullable()->index();
            $table->date('end_date')->nullable()->index();
            $table->string('active_prefix', 50)->nullable()->index();
            $table->integer('similarity_quota_total')->default(0);
            $table->integer('similarity_quota_used')->default(0);
            $table->boolean('auto_renew')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_subscriptions');
    }
};
```

Write migration `database/migrations/2026_08_16_000003_create_doi_bank_accounts_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name', 100);
            $table->string('bank_code', 20);
            $table->string('account_number', 50)->index();
            $table->string('account_holder', 150);
            $table->string('branch_name', 100)->nullable();
            $table->string('qr_code_url', 255)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_bank_accounts');
    }
};
```

Write migration `database/migrations/2026_08_16_000004_create_doi_invoices_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 50)->unique()->index();
            $table->foreignId('subscription_id')->constrained('doi_subscriptions')->cascadeOnDelete();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->index();
            $table->date('due_date')->index();
            $table->timestamp('paid_at')->nullable();
            $table->string('status', 30)->default('unpaid')->index();
            $table->string('payment_method', 50)->nullable();
            $table->string('payment_token', 100)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_invoices');
    }
};
```

Write migration `database/migrations/2026_08_16_000005_create_doi_invoice_items_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('doi_invoices')->cascadeOnDelete();
            $table->string('description', 255);
            $table->string('item_type', 50)->default('annual_fee');
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->integer('quantity')->default(1);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_invoice_items');
    }
};
```

Write migration `database/migrations/2026_08_16_000006_create_doi_payment_proofs_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_payment_proofs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('doi_invoices')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('bank_sender', 100);
            $table->string('account_name', 150);
            $table->foreignId('bank_destination_id')->constrained('doi_bank_accounts')->restrictOnDelete();
            $table->decimal('transfer_amount', 12, 2);
            $table->date('transfer_date');
            $table->string('file_path', 255);
            $table->string('file_name', 255);
            $table->unsignedInteger('file_size');
            $table->string('mime_type', 50);
            $table->string('status', 30)->default('pending')->index();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_payment_proofs');
    }
};
```

Write migration `database/migrations/2026_08_16_000007_create_doi_similarity_quota_logs_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_similarity_quota_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained('doi_subscriptions')->cascadeOnDelete();
            $table->foreignId('journal_id')->nullable()->constrained('journals')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('change_type', 50)->default('usage');
            $table->integer('amount');
            $table->integer('balance_after');
            $table->string('description', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_similarity_quota_logs');
    }
};
```

- [ ] **Step 2: Run migration in Docker container**

Run: `docker exec -it jurnal-mu-app php artisan migrate`  
Expected: 7 migration tables created successfully.

- [ ] **Step 3: Commit**

```bash
git add database/migrations/2026_08_16_00000*
git commit -m "feat(doi): add database migrations for DOI subscription schema"
```

---

### Task 3: Create Eloquent Models (7 Models)

**Files:**
- Create: `app/Models/DoiPackage.php`
- Create: `app/Models/DoiSubscription.php`
- Create: `app/Models/DoiInvoice.php`
- Create: `app/Models/DoiInvoiceItem.php`
- Create: `app/Models/DoiPaymentProof.php`
- Create: `app/Models/DoiBankAccount.php`
- Create: `app/Models/DoiSimilarityQuotaLog.php`
- Modify: `app/Models/University.php`
- Modify: `app/Models/Journal.php`
- Test: `tests/Unit/Doi/DoiModelRelationshipTest.php`

- [ ] **Step 1: Write the failing unit test for Model relationships & accessors**

Create `tests/Unit/Doi/DoiModelRelationshipTest.php`:
```php
<?php

namespace Tests\Unit\Doi;

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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DoiModelRelationshipTest extends TestCase
{
    use RefreshDatabase;

    public function test_doi_subscription_model_relations_and_scopes(): void
    {
        $package = DoiPackage::create([
            'name' => 'Paket Test',
            'slug' => 'paket-test',
            'code' => 'TEST-01',
            'price_annual' => 5000000,
            'prefix_included' => true,
            'similarity_quota_included' => 100,
            'is_active' => true,
        ]);

        $university = University::factory()->create();

        $subscription = DoiSubscription::create([
            'university_id' => $university->id,
            'doi_package_id' => $package->id,
            'status' => SubscriptionStatus::ACTIVE,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addYear()->toDateString(),
            'active_prefix' => '10.12345',
            'similarity_quota_total' => 100,
            'similarity_quota_used' => 25,
        ]);

        $this->assertInstanceOf(SubscriptionStatus::class, $subscription->status);
        $this->assertEquals(75, $subscription->remaining_quota);
        $this->assertEquals($university->id, $subscription->university->id);
        $this->assertEquals($package->id, $subscription->package->id);
        $this->assertCount(1, DoiSubscription::active()->get());
    }

    public function test_doi_invoice_and_payment_proof_relationships(): void
    {
        $package = DoiPackage::create([
            'name' => 'Paket Standard',
            'slug' => 'paket-standard',
            'code' => 'STD-01',
            'price_annual' => 6000000,
            'prefix_included' => true,
            'similarity_quota_included' => 200,
            'is_active' => true,
        ]);

        $university = University::factory()->create();
        $user = User::factory()->create();

        $subscription = DoiSubscription::create([
            'university_id' => $university->id,
            'doi_package_id' => $package->id,
            'status' => SubscriptionStatus::PENDING_VERIFICATION,
        ]);

        $invoice = DoiInvoice::create([
            'invoice_number' => 'INV/DOI/202608/0001',
            'subscription_id' => $subscription->id,
            'university_id' => $university->id,
            'user_id' => $user->id,
            'period_start' => now()->toDateString(),
            'period_end' => now()->addYear()->toDateString(),
            'total_amount' => 6000000,
            'due_date' => now()->addDays(30)->toDateString(),
            'status' => InvoiceStatus::UNPAID,
        ]);

        $bank = DoiBankAccount::create([
            'bank_name' => 'BSI',
            'bank_code' => '451',
            'account_number' => '1234567890',
            'account_holder' => 'Diktilitbang PPM',
            'is_active' => true,
        ]);

        $proof = DoiPaymentProof::create([
            'invoice_id' => $invoice->id,
            'user_id' => $user->id,
            'bank_sender' => 'Bank Mandiri',
            'account_name' => 'Bendahara UM',
            'bank_destination_id' => $bank->id,
            'transfer_amount' => 6000000,
            'transfer_date' => now()->toDateString(),
            'file_path' => 'doi_proofs/test.pdf',
            'file_name' => 'test.pdf',
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
            'status' => PaymentProofStatus::PENDING,
        ]);

        $this->assertEquals($invoice->id, $proof->invoice->id);
        $this->assertEquals($bank->id, $proof->bankDestination->id);
        $this->assertCount(1, $invoice->paymentProofs);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Unit/Doi/DoiModelRelationshipTest.php`  
Expected: FAIL with "Class App\Models\DoiPackage not found"

- [ ] **Step 3: Implement the 7 Eloquent Model classes**

Create `app/Models/DoiPackage.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DoiPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'code',
        'description',
        'price_annual',
        'prefix_included',
        'similarity_quota_included',
        'is_active',
    ];

    protected $casts = [
        'price_annual' => 'decimal:2',
        'prefix_included' => 'boolean',
        'similarity_quota_included' => 'integer',
        'is_active' => 'boolean',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(DoiSubscription::class, 'doi_package_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
```

Create `app/Models/DoiSubscription.php`:
```php
<?php

namespace App\Models;

use App\Enums\Doi\SubscriptionStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoiSubscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'university_id',
        'journal_id',
        'doi_package_id',
        'status',
        'start_date',
        'end_date',
        'active_prefix',
        'similarity_quota_total',
        'similarity_quota_used',
        'auto_renew',
        'notes',
    ];

    protected $casts = [
        'status' => SubscriptionStatus::class,
        'start_date' => 'date',
        'end_date' => 'date',
        'similarity_quota_total' => 'integer',
        'similarity_quota_used' => 'integer',
        'auto_renew' => 'boolean',
    ];

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(DoiPackage::class, 'doi_package_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(DoiInvoice::class, 'subscription_id');
    }

    public function quotaLogs(): HasMany
    {
        return $this->hasMany(DoiSimilarityQuotaLog::class, 'subscription_id');
    }

    public function getRemainingQuotaAttribute(): int
    {
        return max(0, $this->similarity_quota_total - $this->similarity_quota_used);
    }

    public function getIsExpiringSoonAttribute(): bool
    {
        if (!$this->end_date || $this->status !== SubscriptionStatus::ACTIVE) {
            return false;
        }

        return $this->end_date->isFuture() && $this->end_date->diffInDays(now()) <= 30;
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', SubscriptionStatus::ACTIVE);
    }

    public function scopeGracePeriod(Builder $query): Builder
    {
        return $query->where('status', SubscriptionStatus::GRACE_PERIOD);
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('status', SubscriptionStatus::EXPIRED);
    }

    public function scopeForUniversity(Builder $query, int $universityId): Builder
    {
        return $query->where('university_id', $universityId);
    }
}
```

Create `app/Models/DoiInvoice.php`:
```php
<?php

namespace App\Models;

use App\Enums\Doi\InvoiceStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoiInvoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'invoice_number',
        'subscription_id',
        'university_id',
        'user_id',
        'period_start',
        'period_end',
        'subtotal',
        'discount',
        'tax',
        'total_amount',
        'due_date',
        'paid_at',
        'status',
        'payment_method',
        'payment_token',
    ];

    protected $casts = [
        'status' => InvoiceStatus::class,
        'period_start' => 'date',
        'period_end' => 'date',
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(DoiSubscription::class, 'subscription_id');
    }

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(DoiInvoiceItem::class, 'invoice_id');
    }

    public function paymentProofs(): HasMany
    {
        return $this->hasMany(DoiPaymentProof::class, 'invoice_id');
    }

    public function latestPaymentProof(): HasOne
    {
        return $this->hasOne(DoiPaymentProof::class, 'invoice_id')->latestOfMany();
    }

    public function scopeUnpaid(Builder $query): Builder
    {
        return $query->where('status', InvoiceStatus::UNPAID);
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', InvoiceStatus::PAID);
    }

    public function scopePendingVerification(Builder $query): Builder
    {
        return $query->where('status', InvoiceStatus::PENDING_VERIFICATION);
    }
}
```

Create `app/Models/DoiInvoiceItem.php`:
```php
<?php

namespace App\Models;

use App\Enums\Doi\InvoiceItemType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoiInvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'description',
        'item_type',
        'unit_price',
        'quantity',
        'total_price',
    ];

    protected $casts = [
        'item_type' => InvoiceItemType::class,
        'unit_price' => 'decimal:2',
        'quantity' => 'integer',
        'total_price' => 'decimal:2',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(DoiInvoice::class, 'invoice_id');
    }
}
```

Create `app/Models/DoiPaymentProof.php`:
```php
<?php

namespace App\Models;

use App\Enums\Doi\PaymentProofStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoiPaymentProof extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'user_id',
        'bank_sender',
        'account_name',
        'bank_destination_id',
        'transfer_amount',
        'transfer_date',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'status',
        'verified_by',
        'verified_at',
        'admin_notes',
    ];

    protected $casts = [
        'status' => PaymentProofStatus::class,
        'transfer_amount' => 'decimal:2',
        'transfer_date' => 'date',
        'verified_at' => 'datetime',
        'file_size' => 'integer',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(DoiInvoice::class, 'invoice_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bankDestination(): BelongsTo
    {
        return $this->belongsTo(DoiBankAccount::class, 'bank_destination_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', PaymentProofStatus::PENDING);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', PaymentProofStatus::APPROVED);
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', PaymentProofStatus::REJECTED);
    }
}
```

Create `app/Models/DoiBankAccount.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DoiBankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'bank_name',
        'bank_code',
        'account_number',
        'account_holder',
        'branch_name',
        'qr_code_url',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('display_order');
    }
}
```

Create `app/Models/DoiSimilarityQuotaLog.php`:
```php
<?php

namespace App\Models;

use App\Enums\Doi\QuotaChangeType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoiSimilarityQuotaLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscription_id',
        'journal_id',
        'user_id',
        'change_type',
        'amount',
        'balance_after',
        'description',
    ];

    protected $casts = [
        'change_type' => QuotaChangeType::class,
        'amount' => 'integer',
        'balance_after' => 'integer',
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(DoiSubscription::class, 'subscription_id');
    }

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

Modify `app/Models/University.php` to add DOI relationships:
```php
    public function doiSubscriptions(): HasMany
    {
        return $this->hasMany(DoiSubscription::class);
    }

    public function activeDoiSubscription(): HasOne
    {
        return $this->hasOne(DoiSubscription::class)->where('status', \App\Enums\Doi\SubscriptionStatus::ACTIVE);
    }
```

Modify `app/Models/Journal.php` to add DOI relationships:
```php
    public function doiSubscription(): BelongsTo
    {
        return $this->belongsTo(DoiSubscription::class, 'doi_subscription_id');
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -it jurnal-mu-app php artisan test tests/Unit/Doi/DoiModelRelationshipTest.php`  
Expected: PASS (2 tests, 12 assertions)

- [ ] **Step 5: Commit**

```bash
git add app/Models/Doi* app/Models/University.php app/Models/Journal.php tests/Unit/Doi/DoiModelRelationshipTest.php
git commit -m "feat(doi): add Eloquent models and relationships for DOI subscription schema"
```

---

### Task 4: Create Database Seeders

**Files:**
- Create: `database/seeders/DoiPackageSeeder.php`
- Create: `database/seeders/DoiBankAccountSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`

- [ ] **Step 1: Write Seeder classes**

Create `database/seeders/DoiPackageSeeder.php`:
```php
<?php

namespace Database\Seeders;

use App\Models\DoiPackage;
use Illuminate\Database\Seeder;

class DoiPackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Paket Institusi Basic',
                'slug' => 'paket-institusi-basic',
                'code' => 'DOI-INST-BASIC',
                'description' => 'Paket keanggotaan institusi tahunan dengan alokasi 1 Crossref Prefix dan 100 dokumen Similarity Check.',
                'price_annual' => 3500000.00,
                'prefix_included' => true,
                'similarity_quota_included' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Paket Institusi Standard',
                'slug' => 'paket-institusi-standard',
                'code' => 'DOI-INST-STD',
                'description' => 'Paket keanggotaan institusi tahunan dengan alokasi 1 Crossref Prefix dan 250 dokumen Similarity Check.',
                'price_annual' => 6000000.00,
                'prefix_included' => true,
                'similarity_quota_included' => 250,
                'is_active' => true,
            ],
            [
                'name' => 'Paket Institusi Premium',
                'slug' => 'paket-institusi-premium',
                'code' => 'DOI-INST-PREM',
                'description' => 'Paket keanggotaan institusi tahunan dengan alokasi 1 Crossref Prefix dan 500 dokumen Similarity Check.',
                'price_annual' => 10000000.00,
                'prefix_included' => true,
                'similarity_quota_included' => 500,
                'is_active' => true,
            ],
            [
                'name' => 'Paket Mandiri Jurnal',
                'slug' => 'paket-mandiri-jurnal',
                'code' => 'DOI-JOURNAL-SINGLE',
                'description' => 'Paket keanggotaan khusus satu jurnal mandiri dengan 50 dokumen Similarity Check.',
                'price_annual' => 1500000.00,
                'prefix_included' => true,
                'similarity_quota_included' => 50,
                'is_active' => true,
            ],
        ];

        foreach ($packages as $pkg) {
            DoiPackage::updateOrCreate(
                ['code' => $pkg['code']],
                $pkg
            );
        }
    }
}
```

Create `database/seeders/DoiBankAccountSeeder.php`:
```php
<?php

namespace Database\Seeders;

use App\Models\DoiBankAccount;
use Illuminate\Database\Seeder;

class DoiBankAccountSeeder extends Seeder
{
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

        foreach ($accounts as $acc) {
            DoiBankAccount::updateOrCreate(
                ['account_number' => $acc['account_number']],
                $acc
            );
        }
    }
}
```

Modify `database/seeders/DatabaseSeeder.php` to call seeders:
```php
$this->call([
    DoiPackageSeeder::class,
    DoiBankAccountSeeder::class,
]);
```

- [ ] **Step 2: Run Seeders in Docker container**

Run: `docker exec -it jurnal-mu-app php artisan db:seed --class=DoiPackageSeeder`  
Run: `docker exec -it jurnal-mu-app php artisan db:seed --class=DoiBankAccountSeeder`  
Expected: Seeded successfully without errors.

- [ ] **Step 3: Commit**

```bash
git add database/seeders/Doi* database/seeders/DatabaseSeeder.php
git commit -m "feat(doi): add seeders for DOI packages and official bank accounts"
```

---

### Task 5: End-to-End Database & Foundation Integration Test

**Files:**
- Create: `tests/Feature/Doi/DoiDatabaseFoundationTest.php`

- [ ] **Step 1: Write integration test**

Create `tests/Feature/Doi/DoiDatabaseFoundationTest.php`:
```php
<?php

namespace Tests\Feature\Doi;

use App\Models\DoiBankAccount;
use App\Models\DoiPackage;
use Database\Seeders\DoiBankAccountSeeder;
use Database\Seeders\DoiPackageSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DoiDatabaseFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeders_populate_default_packages_and_bank_accounts(): void
    {
        $this->seed(DoiPackageSeeder::class);
        $this->seed(DoiBankAccountSeeder::class);

        $this->assertDatabaseCount('doi_packages', 4);
        $this->assertDatabaseHas('doi_packages', [
            'code' => 'DOI-INST-STD',
            'prefix_included' => true,
            'similarity_quota_included' => 250,
        ]);

        $this->assertDatabaseCount('doi_bank_accounts', 2);
        $this->assertDatabaseHas('doi_bank_accounts', [
            'bank_code' => 'BSI',
            'account_number' => '7123-4567-89',
        ]);
    }
}
```

- [ ] **Step 2: Run test suite**

Run: `docker exec -it jurnal-mu-app php artisan test --filter=Doi`  
Expected: ALL PASS with 100% assertions green.

- [ ] **Step 3: Commit**

```bash
git add tests/Feature/Doi/DoiDatabaseFoundationTest.php
git commit -m "test(doi): add database foundation integration tests"
```
