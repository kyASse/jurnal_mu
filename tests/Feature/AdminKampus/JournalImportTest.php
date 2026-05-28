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
