<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Seeder;

class UadSeeder extends Seeder
{
    /**
     * Run the database seeds for UAD specific testing.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding Universitas Ahmad Dahlan (UAD) test data...');

        // 1. Ensure UAD exists with complete profile info
        $university = University::updateOrCreate(
            ['code' => 'UAD'],
            [
                'ptm_code' => '051013',
                'name' => 'Universitas Ahmad Dahlan',
                'short_name' => 'UAD',
                'address' => 'Jl. Kapas No.9, Semaki, Kec. Umbulharjo',
                'city' => 'Yogyakarta',
                'province' => 'DI Yogyakarta',
                'postal_code' => '55166',
                'phone' => '0274-563515',
                'email' => 'info@uad.ac.id',
                'website' => 'https://uad.ac.id',
                'accreditation_status' => 'Unggul',
                'cluster' => 'Mandiri',
                'profile_description' => 'Universitas Ahmad Dahlan (UAD) adalah sebuah perguruan tinggi swasta di Yogyakarta, Indonesia yang didirikan pada tanggal 19 Desember 1994.',
                'is_active' => true,
            ]
        );

        // Get an associated user
        $user = User::where('email', 'andi.prasetyo@uad.ac.id')->first()
            ?? User::where('email', 'dewi.kartika@uad.ac.id')->first()
            ?? User::first();

        if (!$user) {
            $this->command->error('❌ No user found to associate with journals. Please run general seeders first.');

            return;
        }

        // Get scientific fields
        $compField = ScientificField::where('code', 'COMP')->first() ?? ScientificField::first();
        $eduField = ScientificField::where('code', 'EDU')->first() ?? ScientificField::first();

        // 2. Seed/Update UAD Journals with different Sinta ranks
        $journalsData = [
            [
                'title' => 'TELKOMNIKA (Telecommunication Computing Electronics and Control)',
                'issn' => '1693-6930',
                'e_issn' => '2302-9293',
                'url' => 'http://telkomnika.uad.ac.id',
                'publisher' => 'Universitas Ahmad Dahlan',
                'frequency' => 'Bimonthly',
                'first_published_year' => 2003,
                'scientific_field_id' => $compField->id,
                'sinta_rank' => 'sinta_1',
                'indexations' => ['Scopus' => ['status' => true], 'Google Scholar' => ['status' => true]],
                'accreditation_start_year' => 2021,
                'accreditation_end_year' => 2026,
                'accreditation_sk_number' => 'SK-TELKOMNIKA-01',
                'accreditation_sk_date' => '2021-06-01',
                'editor_in_chief' => 'Tole Sutikno, Ph.D.',
                'email' => 'telkomnika@uad.ac.id',
                'is_active' => true,
                'approval_status' => 'approved',
            ],
            [
                'title' => 'Jurnal Informatika Ahmad Dahlan',
                'issn' => '2088-3714',
                'e_issn' => '2715-3428',
                'url' => 'https://journal.uad.ac.id/index.php/JIFO',
                'publisher' => 'Universitas Ahmad Dahlan',
                'frequency' => 'Triwulanan',
                'first_published_year' => 2015,
                'scientific_field_id' => $compField->id,
                'sinta_rank' => 'sinta_3',
                'indexations' => ['Google Scholar' => ['status' => true]],
                'accreditation_start_year' => 2023,
                'accreditation_end_year' => 2028,
                'accreditation_sk_number' => 'SK-JIFO-03',
                'accreditation_sk_date' => '2023-03-15',
                'editor_in_chief' => 'Andi Prasetyo, M.T.',
                'email' => 'jifo@uad.ac.id',
                'is_active' => true,
                'approval_status' => 'approved',
            ],
            [
                'title' => 'Jurnal Pendidikan dan Pembelajaran UAD',
                'issn' => '2337-9294',
                'e_issn' => '2656-7385',
                'url' => 'https://journal.uad.ac.id/index.php/JPP',
                'publisher' => 'Universitas Ahmad Dahlan',
                'frequency' => 'Semesteran',
                'first_published_year' => 2018,
                'scientific_field_id' => $eduField->id,
                'sinta_rank' => 'sinta_4',
                'indexations' => ['Google Scholar' => ['status' => true]],
                'accreditation_start_year' => 2020,
                'accreditation_end_year' => 2026,
                'accreditation_sk_number' => 'SK-JPP-04',
                'accreditation_sk_date' => '2020-02-20',
                'editor_in_chief' => 'Dewi Kartika, M.Pd.',
                'email' => 'jpp@uad.ac.id',
                'is_active' => true,
                'approval_status' => 'approved',
            ],
        ];

        $seededJournals = [];

        foreach ($journalsData as $data) {
            $journal = Journal::updateOrCreate(
                ['title' => $data['title'], 'university_id' => $university->id],
                array_merge($data, ['user_id' => $user->id])
            );
            $seededJournals[] = $journal;
            $this->command->info("  ✓ Seeded Journal: {$journal->title}");
        }

        // 3. Seed Articles under these journals to verify database filters and lists
        $articlesData = [
            [
                'title' => 'Deep Learning Models for Traffic Sign Recognition in Autonomous Vehicles',
                'authors' => ['Tole Sutikno', 'Ahmad Zaidan', 'Dewi Lestari'],
                'doi' => '10.12928/telkomnika.v24i1.89012',
                'publication_date' => '2026-02-15',
                'volume' => '24',
                'issue' => '1',
                'pages' => '45-54',
                'article_url' => 'http://telkomnika.uad.ac.id/article/traffic-sign',
            ],
            [
                'title' => 'An Internet of Things (IoT) Based Flood Monitoring and Warning System',
                'authors' => ['Tole Sutikno', 'Budi Santoso'],
                'doi' => '10.12928/telkomnika.v24i1.89013',
                'publication_date' => '2026-02-20',
                'volume' => '24',
                'issue' => '1',
                'pages' => '55-62',
                'article_url' => 'http://telkomnika.uad.ac.id/article/flood-monitor',
            ],
            [
                'title' => 'Design of E-Commerce Platform for Muhammadiyah Small-Medium Enterprises',
                'authors' => ['Andi Prasetyo', 'Lutfi Hakim'],
                'doi' => '10.12928/jifo.v10i2.7812',
                'publication_date' => '2025-11-10',
                'volume' => '10',
                'issue' => '2',
                'pages' => '112-120',
                'article_url' => 'https://journal.uad.ac.id/index.php/JIFO/article/view/7812',
            ],
            [
                'title' => 'Evaluating Student Engagement in Hybrid Learning Environments',
                'authors' => ['Dewi Kartika', 'Siti Aminah'],
                'doi' => '10.12928/jpp.v8i1.6543',
                'publication_date' => '2024-06-15',
                'volume' => '8',
                'issue' => '1',
                'pages' => '30-42',
                'article_url' => 'https://journal.uad.ac.id/index.php/JPP/article/view/6543',
            ],
        ];

        // Associate articles to corresponding seeded journals
        foreach ($articlesData as $idx => $artData) {
            $journalIdx = 0; // default to Telkomnika
            if (strpos($artData['doi'], 'jifo') !== false) {
                $journalIdx = 1;
            } elseif (strpos($artData['doi'], 'jpp') !== false) {
                $journalIdx = 2;
            }

            $journal = $seededJournals[$journalIdx];

            $article = Article::updateOrCreate(
                ['doi' => $artData['doi']],
                array_merge($artData, [
                    'journal_id' => $journal->id,
                    'oai_identifier' => 'oai:journal.uad.ac.id:'.str_replace('/', '_', $artData['doi']),
                    'oai_datestamp' => now(),
                    'last_harvested_at' => now(),
                ])
            );
            $this->command->info("    ✓ Seeded Article: {$article->title}");
        }

        $this->command->info('✨ UAD specific test data seeding completed successfully!');
    }
}
