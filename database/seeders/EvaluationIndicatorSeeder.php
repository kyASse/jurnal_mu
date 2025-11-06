<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EvaluationIndicatorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $indicators = [
            // ==================== KATEGORI 1: Kelengkapan Administrasi ====================
            [
                'code' => 'ADM-01',
                'category' => 'Kelengkapan Administrasi',
                'sub_category' => 'Identitas Jurnal',
                'question' => 'Apakah jurnal memiliki ISSN yang valid dan terdaftar di ISSN Indonesia?',
                'description' => 'ISSN (International Standard Serial Number) adalah kode identifikasi unik untuk publikasi berkala. Wajib dimiliki oleh jurnal ilmiah.',
                'weight' => 2.00,
                'answer_type' => 'boolean',
                'requires_attachment' => true,
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ADM-02',
                'category' => 'Kelengkapan Administrasi',
                'sub_category' => 'Platform Publikasi',
                'question' => 'Apakah jurnal memiliki website resmi yang aktif dan dapat diakses publik?',
                'description' => 'Website jurnal harus memiliki domain sendiri, berisi informasi lengkap, dan dapat diakses 24/7.',
                'weight' => 1.50,
                'answer_type' => 'boolean',
                'requires_attachment' => false,
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ADM-03',
                'category' => 'Kelengkapan Administrasi',
                'sub_category' => 'Struktur Organisasi',
                'question' => 'Apakah jurnal memiliki struktur dewan redaksi yang jelas dan terpublikasi?',
                'description' => 'Dewan redaksi minimal terdiri dari: Editor-in-Chief, Managing Editor, dan Editorial Board dengan afiliasi institusi yang jelas.',
                'weight' => 1.50,
                'answer_type' => 'boolean',
                'requires_attachment' => true,
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ADM-04',
                'category' => 'Kelengkapan Administrasi',
                'sub_category' => 'Pedoman Penulisan',
                'question' => 'Apakah jurnal memiliki pedoman penulisan (author guidelines) yang dipublikasikan dan mudah diakses?',
                'description' => 'Pedoman penulisan mencakup: format artikel, template, gaya sitasi, dan prosedur submission.',
                'weight' => 1.00,
                'answer_type' => 'boolean',
                'requires_attachment' => false,
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // ==================== KATEGORI 2: Kualitas Konten ====================
            [
                'code' => 'KON-01',
                'category' => 'Kualitas Konten',
                'sub_category' => 'Proses Review',
                'question' => 'Apakah jurnal menggunakan sistem peer review (minimal double-blind review)?',
                'description' => 'Peer review adalah proses evaluasi artikel oleh ahli di bidangnya. Double-blind review memastikan objektivitas.',
                'weight' => 3.00,
                'answer_type' => 'boolean',
                'requires_attachment' => true,
                'sort_order' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'KON-02',
                'category' => 'Kualitas Konten',
                'sub_category' => 'Keberagaman Penulis',
                'question' => 'Berapa persentase artikel dari penulis eksternal (luar institusi penerbit) dalam 1 tahun terakhir?',
                'description' => 'Minimal 50% artikel harus dari penulis eksternal untuk menghindari kesan jurnal internal kampus. Skala: 1 = <25%, 2 = 25-40%, 3 = 41-60%, 4 = 61-80%, 5 = >80%',
                'weight' => 2.00,
                'answer_type' => 'scale',
                'requires_attachment' => false,
                'sort_order' => 6,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'KON-03',
                'category' => 'Kualitas Konten',
                'sub_category' => 'Dampak Publikasi',
                'question' => 'Apakah artikel yang dipublikasikan memiliki sitasi dari publikasi lain (terindeks Google Scholar)?',
                'description' => 'Sitasi menunjukkan artikel dibaca dan dirujuk oleh peneliti lain, indikator kualitas dan dampak publikasi.',
                'weight' => 2.50,
                'answer_type' => 'boolean',
                'requires_attachment' => false,
                'sort_order' => 7,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'KON-04',
                'category' => 'Kualitas Konten',
                'sub_category' => 'Standarisasi Format',
                'question' => 'Apakah semua artikel menggunakan template yang konsisten dan memenuhi standar penulisan ilmiah?',
                'description' => 'Template mencakup: struktur IMRAD, format referensi konsisten, dan layout profesional.',
                'weight' => 1.00,
                'answer_type' => 'boolean',
                'requires_attachment' => false,
                'sort_order' => 8,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // ==================== KATEGORI 3: Proses Editorial ====================
            [
                'code' => 'EDT-01',
                'category' => 'Proses Editorial',
                'sub_category' => 'Standard Operating Procedure',
                'question' => 'Apakah jurnal memiliki SOP review yang terdokumentasi dan dipublikasikan?',
                'description' => 'SOP mencakup: alur submission, proses review, keputusan accept/reject, dan timeline.',
                'weight' => 2.00,
                'answer_type' => 'boolean',
                'requires_attachment' => true,
                'sort_order' => 9,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'EDT-02',
                'category' => 'Proses Editorial',
                'sub_category' => 'Kecepatan Review',
                'question' => 'Berapa lama rata-rata waktu review dari submission hingga keputusan (dalam hari)?',
                'description' => 'Standar ideal: maksimal 90 hari. Skala: 1 = >120 hari, 2 = 91-120 hari, 3 = 61-90 hari, 4 = 31-60 hari, 5 = <30 hari',
                'weight' => 1.50,
                'answer_type' => 'scale',
                'requires_attachment' => false,
                'sort_order' => 10,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'EDT-03',
                'category' => 'Proses Editorial',
                'sub_category' => 'Sistem Manajemen',
                'question' => 'Apakah jurnal menggunakan sistem manajemen jurnal elektronik (OJS, Editorial Manager, atau sejenisnya)?',
                'description' => 'Sistem manajemen jurnal memudahkan tracking submission, komunikasi dengan reviewer, dan transparansi proses.',
                'weight' => 2.50,
                'answer_type' => 'boolean',
                'requires_attachment' => false,
                'sort_order' => 11,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'EDT-04',
                'category' => 'Proses Editorial',
                'sub_category' => 'Pengecekan Plagiasi',
                'question' => 'Apakah jurnal melakukan pengecekan plagiasi menggunakan software (Turnitin, iThenticate, dll) untuk setiap artikel yang masuk?',
                'description' => 'Pengecekan plagiasi wajib dilakukan sebelum proses review untuk menjaga integritas publikasi. Standar: similarity <20%.',
                'weight' => 3.00,
                'answer_type' => 'boolean',
                'requires_attachment' => true,
                'sort_order' => 12,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('evaluation_indicators')->insert($indicators);

        // Calculate and display total weight
        $totalWeight = array_sum(array_column($indicators, 'weight'));
        
        $this->command->info(count($indicators) . ' Evaluation Indicators created successfully!');
        $this->command->info('Total Weight: ' . $totalWeight . ' points');
        $this->command->info('');
        $this->command->info('Breakdown by category:');
        $this->command->info('  - Kelengkapan Administrasi: 6.00 points (4 indicators)');
        $this->command->info('  - Kualitas Konten: 8.50 points (4 indicators)');
        $this->command->info('  - Proses Editorial: 9.00 points (4 indicators)');
    }
}
