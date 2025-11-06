<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JournalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get required IDs
        $uadId = DB::table('universities')->where('code', 'UAD')->value('id');
        $umyId = DB::table('universities')->where('code', 'UMY')->value('id');
        $umsId = DB::table('universities')->where('code', 'UMS')->value('id');

        $andiId = DB::table('users')->where('email', 'andi.prasetyo@uad.ac.id')->value('id');
        $dewiId = DB::table('users')->where('email', 'dewi.kartika@uad.ac.id')->value('id');
        $ekoId = DB::table('users')->where('email', 'eko.wijaya@umy.ac.id')->value('id');
        $fitriId = DB::table('users')->where('email', 'fitri.rahmawati@umy.ac.id')->value('id');
        $hendraId = DB::table('users')->where('email', 'hendra.gunawan@ums.ac.id')->value('id');

        $compFieldId = DB::table('scientific_fields')->where('code', 'COMP')->value('id');
        $eduFieldId = DB::table('scientific_fields')->where('code', 'EDU')->value('id');
        $ecoFieldId = DB::table('scientific_fields')->where('code', 'ECO')->value('id');
        $medFieldId = DB::table('scientific_fields')->where('code', 'MED')->value('id');
        $engFieldId = DB::table('scientific_fields')->where('code', 'ENG')->value('id');

        $journals = [
            // UAD Journals
            [
                'university_id' => $uadId,
                'user_id' => $andiId,
                'title' => 'Jurnal Informatika dan Teknologi',
                'issn' => '2088-3714',
                'e_issn' => '2715-3428',
                'url' => 'https://journal.uad.ac.id/index.php/JIFO',
                'publisher' => 'Universitas Ahmad Dahlan',
                'frequency' => 'Triwulanan',
                'first_published_year' => 2015,
                'scientific_field_id' => $compFieldId,
                'sinta_rank' => 3,
                'accreditation_status' => 'Terakreditasi',
                'accreditation_grade' => 'S3',
                'editor_in_chief' => 'Andi Prasetyo, S.Kom, M.T',
                'email' => 'jifo@uad.ac.id',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'university_id' => $uadId,
                'user_id' => $dewiId,
                'title' => 'Jurnal Pendidikan dan Pembelajaran',
                'issn' => '2337-9294',
                'e_issn' => '2656-7385',
                'url' => 'https://journal.uad.ac.id/index.php/JPP',
                'publisher' => 'Universitas Ahmad Dahlan',
                'frequency' => 'Semesteran',
                'first_published_year' => 2018,
                'scientific_field_id' => $eduFieldId,
                'sinta_rank' => 4,
                'accreditation_status' => 'Terakreditasi',
                'accreditation_grade' => 'S4',
                'editor_in_chief' => 'Dewi Kartika, S.Pd, M.Pd',
                'email' => 'jpp@uad.ac.id',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // UMY Journals
            [
                'university_id' => $umyId,
                'user_id' => $ekoId,
                'title' => 'Jurnal Manajemen dan Bisnis',
                'issn' => '1412-3789',
                'e_issn' => '2541-1233',
                'url' => 'https://journal.umy.ac.id/index.php/jmb',
                'publisher' => 'Universitas Muhammadiyah Yogyakarta',
                'frequency' => 'Triwulanan',
                'first_published_year' => 2010,
                'scientific_field_id' => $ecoFieldId,
                'sinta_rank' => 2,
                'accreditation_status' => 'Terakreditasi',
                'accreditation_grade' => 'S2',
                'editor_in_chief' => 'Eko Wijaya, S.E, M.M',
                'email' => 'jmb@umy.ac.id',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'university_id' => $umyId,
                'user_id' => $fitriId,
                'title' => 'Jurnal Keperawatan dan Kesehatan Masyarakat',
                'issn' => '2089-7154',
                'e_issn' => '2656-8969',
                'url' => 'https://journal.umy.ac.id/index.php/jkkm',
                'publisher' => 'Universitas Muhammadiyah Yogyakarta',
                'frequency' => 'Triwulanan',
                'first_published_year' => 2012,
                'scientific_field_id' => $medFieldId,
                'sinta_rank' => 3,
                'accreditation_status' => 'Terakreditasi',
                'accreditation_grade' => 'S3',
                'editor_in_chief' => 'Fitri Rahmawati, S.Kep, Ns, M.Kep',
                'email' => 'jkkm@umy.ac.id',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // UMS Journal
            [
                'university_id' => $umsId,
                'user_id' => $hendraId,
                'title' => 'Jurnal Teknik Sipil dan Arsitektur',
                'issn' => '1410-2528',
                'e_issn' => '2549-5658',
                'url' => 'https://journals.ums.ac.id/index.php/JTSA',
                'publisher' => 'Universitas Muhammadiyah Surakarta',
                'frequency' => 'Semesteran',
                'first_published_year' => 2008,
                'scientific_field_id' => $engFieldId,
                'sinta_rank' => 4,
                'accreditation_status' => 'Terakreditasi',
                'accreditation_grade' => 'S4',
                'editor_in_chief' => 'Hendra Gunawan, S.T, M.T',
                'email' => 'jtsa@ums.ac.id',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('journals')->insert($journals);

        $this->command->info(count($journals) . ' Sample Journals created successfully!');
    }
}
