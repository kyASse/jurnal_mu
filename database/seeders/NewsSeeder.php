<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('📰 Seeding News Articles...');

        // Find Super Admin to assign as author
        $author = User::whereHas('role', function ($query) {
            $query->where('name', Role::SUPER_ADMIN);
        })->first();

        if (!$author) {
            // Fallback to first user
            $author = User::first();
        }

        if (!$author) {
            $this->command->error('No user found to assign as author for news seeding.');

            return;
        }

        $newsData = [
            [
                'title' => 'Peluncuran Fitur Akreditasi Otomatis Jurnal MU',
                'slug' => 'peluncuran-fitur-akreditasi-otomatis-jurnal-mu',
                'subtitle' => 'Sistem baru memudahkan pengelola jurnal dalam mengajukan penilaian akreditasi secara digital.',
                'body' => '<p>Jurnal MU resmi meluncurkan modul akreditasi otomatis. Modul ini dirancang untuk mempercepat proses evaluasi jurnal ilmiah di lingkungan perguruan tinggi Muhammadiyah.</p><p>Dengan sistem ini, pengelola jurnal dapat dengan mudah melacak status pengajuan akreditasi mereka secara real-time. Diharapkan fitur baru ini dapat meningkatkan jumlah jurnal Muhammadiyah terakreditasi SINTA dalam beberapa tahun ke depan.</p>',
                'thumbnail' => null,
                'image' => null,
                'tags' => ['Pengumuman', 'Akreditasi', 'Fitur Baru'],
                'views' => 154,
                'is_active' => true,
                'author_id' => $author->id,
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Workshop Penulisan Artikel Ilmiah Internasional 2026',
                'slug' => 'workshop-penulisan-artikel-ilmiah-internasional-2026',
                'subtitle' => 'Majelis Diktilitbang PP Muhammadiyah menyelenggarakan pelatihan penulisan artikel Scopus.',
                'body' => '<p>Dalam rangka meningkatkan publikasi ilmiah bereputasi internasional, Majelis Diktilitbang menyelenggarakan workshop intensif selama tiga hari.</p><p>Workshop ini menghadirkan pembicara ahli dari berbagai jurnal internasional Q1. Peserta mendapatkan pelatihan menulis abstrak yang menarik, menyusun metodologi yang kuat, serta tips menghadapi peer-review. Workshop diikuti oleh perwakilan dosen dan peneliti dari 50 perguruan tinggi Muhammadiyah.</p>',
                'thumbnail' => null,
                'image' => null,
                'tags' => ['Workshop', 'Publikasi', 'Scopus'],
                'views' => 320,
                'is_active' => true,
                'author_id' => $author->id,
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'Majelis Diktilitbang Gelar Evaluasi Tahunan Pengelolaan Jurnal',
                'slug' => 'majelis-diktilitbang-gelar-evaluasi-tahunan-pengelolaan-jurnal',
                'subtitle' => 'Evaluasi dilakukan guna memetakan potensi jurnal baru menuju indeksasi global.',
                'body' => '<p>Evaluasi tahunan pengelolaan jurnal Muhammadiyah dilaksanakan secara hybrid. Pertemuan ini fokus membahas pencapaian jurnal di bawah naungan Muhammadiyah sepanjang tahun 2025 serta menyusun strategi akselerasi untuk tahun 2026.</p><p>Selain itu, diberikan juga penghargaan kepada beberapa jurnal terbaik yang berhasil menembus indeksasi Scopus dan DOAJ pada tahun ini.</p>',
                'thumbnail' => null,
                'image' => null,
                'tags' => ['Evaluasi', 'Rapat Kerja', 'Penghargaan'],
                'views' => 87,
                'is_active' => true,
                'author_id' => $author->id,
                'published_at' => now()->subHours(12),
            ],
        ];

        foreach ($newsData as $data) {
            News::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }

        $this->command->info('✅ Successfully seeded 3 news articles.');
    }
}
