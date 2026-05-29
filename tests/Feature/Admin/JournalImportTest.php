<?php

use App\Models\Journal;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    $this->seedRoles();
});

test('super_admin_dapat_mengakses_halaman_import_jurnal', function () {
    $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);

    $this->actingAs($superAdmin)
        ->get(route('admin.journals.import'))
        ->assertOk();
});

test('super_admin_gagal_import_jika_header_csv_tidak_sesuai', function () {
    $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);
    $university = University::factory()->create();
    $user = User::factory()->create(['university_id' => $university->id]);

    $header = "title,publisher,issn\n"; // missing required headers
    $row = "Jurnal A,Penerbit A,1234-5678\n";
    $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row);

    $this->actingAs($superAdmin)
        ->post(route('admin.journals.import.process'), [
            'university_id' => $university->id,
            'user_id' => $user->id,
            'csv_file' => $file,
        ])
        ->assertRedirect()
        ->assertSessionHas('error');
});

test('super_admin_berhasil_import_jurnal_dengan_format_valid', function () {
    $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);
    $university = University::factory()->create();
    $user = User::factory()->create(['university_id' => $university->id]);

    $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
    $row = "Jurnal A,Penerbit A,1234-5678,9876-5432,2025,2,https://example.com/a,https://example.com/a/oai,a@example.com,0812\n";
    $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row);

    $this->actingAs($superAdmin)
        ->post(route('admin.journals.import.process'), [
            'university_id' => $university->id,
            'user_id' => $user->id,
            'csv_file' => $file,
        ])
        ->assertRedirect(route('admin.journals.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('journals', [
        'title' => 'Jurnal A',
        'issn' => '1234-5678',
        'e_issn' => '9876-5432',
        'university_id' => $university->id,
        'user_id' => $user->id,
    ]);
});

test('super_admin_import_jurnal_dengan_peringatan_jika_sebagian_baris_gagal', function () {
    $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);
    $university = University::factory()->create();
    $user = User::factory()->create(['university_id' => $university->id]);

    $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
    $row1 = "Jurnal Sukses,Penerbit A,1234-5678,9876-5432,2025,2,https://example.com/a,https://example.com/a/oai,,\n";
    $row2 = "Jurnal Gagal,Penerbit B,invalid-issn,3333-4444,2024,,https://example.com/b,https://example.com/b/oai,,\n";
    $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row1 . $row2);

    $this->actingAs($superAdmin)
        ->post(route('admin.journals.import.process'), [
            'university_id' => $university->id,
            'user_id' => $user->id,
            'csv_file' => $file,
        ])
        ->assertRedirect(route('admin.journals.import'))
        ->assertSessionHas('warning')
        ->assertSessionHas('import_errors');

    $this->assertDatabaseHas('journals', ['title' => 'Jurnal Sukses']);
    $this->assertDatabaseMissing('journals', ['title' => 'Jurnal Gagal']);
});

test('super_admin_import_gagal_jika_issn_duplikat', function () {
    $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);
    $university = University::factory()->create();
    $user = User::factory()->create(['university_id' => $university->id]);

    Journal::create([
        'university_id' => $university->id,
        'user_id' => $user->id,
        'title' => 'Duplicate Journal',
        'issn' => '1234-5678',
        'e_issn' => '9876-5432',
        'url' => 'https://example.com/a',
        'oai_urls' => ['https://example.com/a/oai'],
        'approval_status' => 'approved',
    ]);

    $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
    $row = "Duplicate Journal,Penerbit A,1234-5678,9876-5432,2025,2,https://example.com/a,https://example.com/a/oai,,\n";
    $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row);

    $this->actingAs($superAdmin)
        ->post(route('admin.journals.import.process'), [
            'university_id' => $university->id,
            'user_id' => $user->id,
            'csv_file' => $file,
        ])
        ->assertRedirect(route('admin.journals.import'))
        ->assertSessionHas('error', 'Semua data gagal diimport karena jurnal/ISSN sudah terdaftar.')
        ->assertSessionHas('import_errors');
});
