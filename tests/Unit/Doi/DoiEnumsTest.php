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
        $this->assertEquals('Belum Aktif', SubscriptionStatus::INACTIVE->label());
        $this->assertEquals('slate', SubscriptionStatus::INACTIVE->color());

        $this->assertEquals('pending_verification', SubscriptionStatus::PENDING_VERIFICATION->value);
        $this->assertEquals('Menunggu Verifikasi', SubscriptionStatus::PENDING_VERIFICATION->label());
        $this->assertEquals('blue', SubscriptionStatus::PENDING_VERIFICATION->color());

        $this->assertEquals('grace_period', SubscriptionStatus::GRACE_PERIOD->value);
        $this->assertEquals('Masa Tenggang', SubscriptionStatus::GRACE_PERIOD->label());
        $this->assertEquals('amber', SubscriptionStatus::GRACE_PERIOD->color());

        $this->assertEquals('expired', SubscriptionStatus::EXPIRED->value);
        $this->assertEquals('Kadaluwarsa', SubscriptionStatus::EXPIRED->label());
        $this->assertEquals('rose', SubscriptionStatus::EXPIRED->color());
    }

    public function test_invoice_status_enum_values_and_labels(): void
    {
        $this->assertEquals('unpaid', InvoiceStatus::UNPAID->value);
        $this->assertEquals('Belum Dibayar', InvoiceStatus::UNPAID->label());
        $this->assertEquals('amber', InvoiceStatus::UNPAID->color());

        $this->assertEquals('pending_verification', InvoiceStatus::PENDING_VERIFICATION->value);
        $this->assertEquals('Menunggu Verifikasi', InvoiceStatus::PENDING_VERIFICATION->label());
        $this->assertEquals('blue', InvoiceStatus::PENDING_VERIFICATION->color());

        $this->assertEquals('paid', InvoiceStatus::PAID->value);
        $this->assertEquals('Lunas', InvoiceStatus::PAID->label());
        $this->assertEquals('emerald', InvoiceStatus::PAID->color());

        $this->assertEquals('expired', InvoiceStatus::EXPIRED->value);
        $this->assertEquals('Kadaluwarsa', InvoiceStatus::EXPIRED->label());
        $this->assertEquals('slate', InvoiceStatus::EXPIRED->color());

        $this->assertEquals('cancelled', InvoiceStatus::CANCELLED->value);
        $this->assertEquals('Dibatalkan', InvoiceStatus::CANCELLED->label());
        $this->assertEquals('rose', InvoiceStatus::CANCELLED->color());
    }

    public function test_payment_proof_status_enum_values(): void
    {
        $this->assertEquals('pending', PaymentProofStatus::PENDING->value);
        $this->assertEquals('Menunggu Review', PaymentProofStatus::PENDING->label());
        $this->assertEquals('blue', PaymentProofStatus::PENDING->color());

        $this->assertEquals('approved', PaymentProofStatus::APPROVED->value);
        $this->assertEquals('Disetujui', PaymentProofStatus::APPROVED->label());
        $this->assertEquals('emerald', PaymentProofStatus::APPROVED->color());

        $this->assertEquals('rejected', PaymentProofStatus::REJECTED->value);
        $this->assertEquals('Ditolak', PaymentProofStatus::REJECTED->label());
        $this->assertEquals('rose', PaymentProofStatus::REJECTED->color());
    }

    public function test_invoice_item_type_enum_values(): void
    {
        $this->assertEquals('annual_fee', InvoiceItemType::ANNUAL_FEE->value);
        $this->assertEquals('Biaya Tahunan Keanggotaan', InvoiceItemType::ANNUAL_FEE->label());

        $this->assertEquals('prefix_registration', InvoiceItemType::PREFIX_REGISTRATION->value);
        $this->assertEquals('Registrasi Prefix Crossref', InvoiceItemType::PREFIX_REGISTRATION->label());

        $this->assertEquals('similarity_quota', InvoiceItemType::SIMILARITY_QUOTA->value);
        $this->assertEquals('Kuota Similarity Check', InvoiceItemType::SIMILARITY_QUOTA->label());

        $this->assertEquals('adjustment', InvoiceItemType::ADJUSTMENT->value);
        $this->assertEquals('Penyesuaian / Diskon', InvoiceItemType::ADJUSTMENT->label());
    }

    public function test_quota_change_type_enum_values(): void
    {
        $this->assertEquals('allocation', QuotaChangeType::ALLOCATION->value);
        $this->assertEquals('Alokasi Awal Paket', QuotaChangeType::ALLOCATION->label());

        $this->assertEquals('usage', QuotaChangeType::USAGE->value);
        $this->assertEquals('Penggunaan Uji Plagiasi', QuotaChangeType::USAGE->label());

        $this->assertEquals('adjustment', QuotaChangeType::ADJUSTMENT->value);
        $this->assertEquals('Penyesuaian Manual Admin', QuotaChangeType::ADJUSTMENT->label());

        $this->assertEquals('renewal', QuotaChangeType::RENEWAL->value);
        $this->assertEquals('Perpanjangan Langganan', QuotaChangeType::RENEWAL->label());
    }
}
