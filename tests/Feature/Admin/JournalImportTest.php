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

test('super_admin_dapat_mengakses_halaman_import_jurnal', function () {
    $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);

    $this->actingAs($superAdmin)
        ->get(route('admin.journals.import'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('csvImports'));
});

test('super_admin_upload_csv_dan_memicu_job', function () {
    Queue::fake();

    $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);
    $university = University::factory()->create();
    $user = User::factory()->create(['university_id' => $university->id]);

    $file = UploadedFile::fake()->create('import.csv', 100);

    $this->actingAs($superAdmin)
        ->post(route('admin.journals.import.process'), [
            'university_id' => $university->id,
            'user_id' => $user->id,
            'csv_file' => $file,
        ])
        ->assertRedirect(route('admin.journals.import'))
        ->assertSessionHas('success');

    Queue::assertPushed(ProcessCsvImportJob::class);
});

test('super_admin_job_memproses_csv_valid', function () {
    $superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);
    $university = University::factory()->create();
    $user = User::factory()->create(['university_id' => $university->id]);

    $header = "title,publisher,issn,e_issn,publication_year,sinta_rank,url,oai_url,email,phone\n";
    $row1 = "Jurnal A,Penerbit A,1234-5678,9876-5432,2025,2,https://example.com/a,https://example.com/a/oai,a@example.com,0812\n";

    Storage::put('imports/test.csv', $header.$row1);
    $filePath = 'imports/test.csv';

    $csvImport = CsvImport::create([
        'user_id' => $user->id,
        'university_id' => $university->id,
        'filename' => 'test.csv',
        'filepath' => $filePath,
        'status' => 'pending',
    ]);

    (new ProcessCsvImportJob($csvImport->id))->handle();

    $csvImport->refresh();
    expect($csvImport->status)->toBe('completed');
    expect($csvImport->success_count)->toBe(1);

    $this->assertDatabaseHas('journals', [
        'title' => 'Jurnal A',
        'university_id' => $university->id,
    ]);
});
