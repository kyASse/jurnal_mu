<?php

namespace App\Jobs;

use App\Imports\JournalsImport;
use App\Models\CsvImport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProcessCsvImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $csvImportId;

    public function __construct(int $csvImportId)
    {
        $this->csvImportId = $csvImportId;
    }

    public function handle(): void
    {
        $csvImport = CsvImport::find($this->csvImportId);
        if (! $csvImport) {
            return;
        }

        $csvImport->update(['status' => 'processing']);

        try {
            $absolutePath = Storage::path($csvImport->filepath);
            if (! Storage::exists($csvImport->filepath)) {
                throw new \Exception('File CSV tidak ditemukan di storage.');
            }

            // Estimate total rows (excluding header)
            $file = fopen($absolutePath, 'r');
            $lineCount = 0;
            if ($file) {
                fgetcsv($file); // skip header
                while (fgetcsv($file) !== false) {
                    $lineCount++;
                }
                fclose($file);
            }
            $csvImport->update(['total_rows' => $lineCount]);

            DB::beginTransaction();

            $import = new JournalsImport((int) $csvImport->university_id, (int) $csvImport->user_id);
            $import->import($absolutePath);

            $summary = $import->getSummary();

            DB::commit();

            $csvImport->update([
                'status' => 'completed',
                'success_count' => $summary['success_count'],
                'error_count' => $summary['error_count'],
                'processed_rows' => $summary['success_count'] + $summary['error_count'],
                'errors' => $summary['errors'],
            ]);

            // Clean up temporary file
            if (Storage::exists($csvImport->filepath)) {
                Storage::delete($csvImport->filepath);
            }

        } catch (\Exception $e) {
            DB::rollBack();

            $csvImport->update([
                'status' => 'failed',
                'errors' => [['row' => 0, 'errors' => [$e->getMessage()]]],
            ]);

            if (Storage::exists($csvImport->filepath)) {
                Storage::delete($csvImport->filepath);
            }
        }
    }
}
