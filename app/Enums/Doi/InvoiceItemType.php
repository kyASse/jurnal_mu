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
