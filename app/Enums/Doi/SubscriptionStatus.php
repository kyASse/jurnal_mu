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
