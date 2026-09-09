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
