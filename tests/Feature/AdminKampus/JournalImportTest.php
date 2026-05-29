<?php

use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    $this->seedRoles();
});

test('admin_kampus_dapat_mengakses_halaman_import_jurnal', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

    $this->actingAs($adminKampus)
        ->get(route('admin-kampus.journals.import'))
        ->assertOk();
});

test('tamu_tidak_dapat_mengakses_halaman_import_jurnal', function () {
    $this->get(route('admin-kampus.journals.import'))
        ->assertRedirect(route('login'));
});

test('gagal_import_jika_header_csv_tidak_sesuai', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

    $header = "title,publisher,issn\n"; // missing e_issn, url, oai_url
    $row = "Jurnal A,Penerbit A,1234-5678\n";
    $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row);

    $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.import.process'), [
            'csv_file' => $file,
        ])
        ->assertRedirect()
        ->assertSessionHas('error');
});

test('berhasil_import_jurnal_dengan_format_valid', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

    $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
    // Row 1: standard, Row 2: ISSN ending in 'X', SINTA Rank string
    $row1 = "Jurnal A,Penerbit A,1234-5678,9876-5432,2025,2,https://example.com/a,https://example.com/a/oai,a@example.com,0812\n";
    $row2 = "Jurnal B,Penerbit B,1111-222X,3333-444X,2024,sinta_4,https://example.com/b,https://example.com/b/oai,,\n";

    $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row1 . $row2);

    $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.import.process'), [
            'csv_file' => $file,
        ])
        ->assertRedirect(route('admin-kampus.journals.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('journals', [
        'title' => 'Jurnal A',
        'issn' => '1234-5678',
        'e_issn' => '9876-5432',
        'sinta_rank' => 'sinta_2',
        'url' => 'https://example.com/a',
    ]);

    $this->assertDatabaseHas('journals', [
        'title' => 'Jurnal B',
        'issn' => '1111-222X',
        'e_issn' => '3333-444X',
        'sinta_rank' => 'sinta_4',
        'url' => 'https://example.com/b',
    ]);
});

test('import_jurnal_dengan_peringatan_jika_sebagian_baris_gagal', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

    $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
    $row1 = "Jurnal Sukses,Penerbit A,1234-5678,9876-5432,2025,2,https://example.com/a,https://example.com/a/oai,,\n";
    $row2 = "Jurnal Gagal,Penerbit B,invalid-issn,3333-4444,2024,,https://example.com/b,https://example.com/b/oai,,\n";

    $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row1 . $row2);

    $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.import.process'), [
            'csv_file' => $file,
        ])
        ->assertRedirect(route('admin-kampus.journals.import'))
        ->assertSessionHas('warning')
        ->assertSessionHas('import_errors');

    $this->assertDatabaseHas('journals', ['title' => 'Jurnal Sukses']);
    $this->assertDatabaseMissing('journals', ['title' => 'Jurnal Gagal']);
});

test('user_provided_csv_passes', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

    $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
    $row = "\"Legality : Jurnal Ilmiah Hukum\",\"Universitas Muhammadiyah Malang\",0854-6509,2549-4600,2016,,https://ejournal.umm.ac.id/index.php/legality,https://ejournal.umm.ac.id/index.php/legality/oai,legality@umm.ac.id,+62 877-8714-6248\n";

    $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row);

    $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.import.process'), [
            'csv_file' => $file,
        ])
        ->assertRedirect(route('admin-kampus.journals.index'))
        ->assertSessionHas('success');
});

test('import_gagal_jika_issn_duplikat', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

    // Create duplicate journal first
    Journal::create([
        'university_id' => $university->id,
        'user_id' => $adminKampus->id,
        'title' => 'Legality : Jurnal Ilmiah Hukum',
        'issn' => '0854-6509',
        'e_issn' => '2549-4600',
        'url' => 'https://ejournal.umm.ac.id/index.php/legality',
        'oai_urls' => ['https://ejournal.umm.ac.id/index.php/legality/oai'],
        'approval_status' => 'approved',
    ]);

    $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
    $row = "\"Legality : Jurnal Ilmiah Hukum\",\"Universitas Muhammadiyah Malang\",0854-6509,2549-4600,2016,,https://ejournal.umm.ac.id/index.php/legality,https://ejournal.umm.ac.id/index.php/legality/oai,legality@umm.ac.id,+62 877-8714-6248\n";

    $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row);

    $response = $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.import.process'), [
            'csv_file' => $file,
        ]);

    $response->assertRedirect(route('admin-kampus.journals.import'))
        ->assertSessionHas('error')
        ->assertSessionHas('import_errors');

    $importErrors = session('import_errors');
    expect($importErrors[0]['errors'][0])->toContain('ISSN atau E-ISSN sudah terdaftar');
});

