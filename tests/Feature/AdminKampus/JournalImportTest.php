<?php

use App\Jobs\ProcessCsvImportJob;
use App\Models\CsvImport;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seedRoles();
    Storage::fake('local');
});

test('admin_kampus_dapat_mengakses_halaman_import_jurnal', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

    $this->actingAs($adminKampus)
        ->get(route('admin-kampus.journals.import'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('csvImports'));
});

test('tamu_tidak_dapat_mengakses_halaman_import_jurnal', function () {
    $this->get(route('admin-kampus.journals.import'))
        ->assertRedirect(route('login'));
});

test('berhasil_upload_csv_dan_memicu_job', function () {
    Queue::fake();

    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

    $file = UploadedFile::fake()->create('import.csv', 100);

    $this->actingAs($adminKampus)
        ->post(route('admin-kampus.journals.import.process'), [
            'csv_file' => $file,
        ])
        ->assertRedirect(route('admin-kampus.journals.import'))
        ->assertSessionHas('success');

    Queue::assertPushed(ProcessCsvImportJob::class, function ($job) {
        $csvImport = CsvImport::first();
        $reflector = new ReflectionClass($job);
        $property = $reflector->getProperty('csvImportId');
        $property->setAccessible(true);
        $csvImportId = $property->getValue($job);

        return $csvImport && $csvImportId === $csvImport->id;
    });
});

test('job_memproses_csv_valid_dengan_sukses', function () {
    $university = University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

    $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
    $row1 = "Jurnal A,Penerbit A,1234-5678,9876-5432,2025,2,https://example.com/a,https://example.com/a/oai,a@example.com,0812\n";

    Storage::put('imports/test.csv', $header.$row1);
    $filePath = 'imports/test.csv';

    $csvImport = CsvImport::create([
        'user_id' => $adminKampus->id,
        'university_id' => $university->id,
        'filename' => 'test.csv',
        'filepath' => $filePath,
        'status' => 'pending',
    ]);

    (new ProcessCsvImportJob($csvImport->id))->handle();

    $csvImport->refresh();
    expect($csvImport->status)->toBe('completed');
    expect($csvImport->success_count)->toBe(1);
    expect($csvImport->error_count)->toBe(0);

    $this->assertDatabaseHas('journals', [
        'title' => 'Jurnal A',
        'issn' => '1234-5678',
    ]);
});
