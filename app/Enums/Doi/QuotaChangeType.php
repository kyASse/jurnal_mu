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
