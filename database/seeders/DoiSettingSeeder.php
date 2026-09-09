<?php

namespace Database\Seeders;

use App\Models\DoiSetting;
use Illuminate\Database\Seeder;

class DoiSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key' => 'doi_helpdesk_email',
                'value' => 'jurnal@diktilitbangmuhammadiyah.org',
                'type' => 'string',
                'group' => 'helpdesk',
            ],
            [
                'key' => 'doi_helpdesk_phone',
                'value' => '+62 812-3456-7890',
                'type' => 'string',
                'group' => 'helpdesk',
            ],
            [
                'key' => 'doi_helpdesk_hours',
                'value' => 'Senin - Jumat, 08:00 - 16:00 WIB',
                'type' => 'string',
                'group' => 'helpdesk',
            ],
            [
                'key' => 'doi_helpdesk_notes',
                'value' => 'Hubungi Tim Layanan Jurnal & DOI Majelis Diktilitbang Pimpinan Pusat Muhammadiyah jika institusi Anda memerlukan penyesuaian khusus atau mengalami kendala deposit DOI.',
                'type' => 'text',
                'group' => 'helpdesk',
            ],
        ];

        foreach ($settings as $setting) {
            DoiSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
