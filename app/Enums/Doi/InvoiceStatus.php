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
