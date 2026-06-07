<?php

namespace App\Jobs;

use App\Models\ArticleImportLog;
use App\Models\Journal;
use App\Services\CrossrefXmlImporter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ImportArticlesXmlJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $journal;

    protected $filePath;

    protected $strategy;

    protected $log;

    public function __construct(Journal $journal, string $filePath, string $strategy, ArticleImportLog $log)
    {
        $this->journal = $journal;
        $this->filePath = $filePath;
        $this->strategy = $strategy;
        $this->log = $log;
    }

    public function handle(CrossrefXmlImporter $importer): void
    {
        $this->log->update(['status' => 'processing']);

        try {
            $absolutePath = Storage::path($this->filePath);
            $stats = $importer->import($this->journal, $absolutePath, $this->strategy);

            $this->log->update([
                'records_found' => $stats['records_found'],
                'records_imported' => $stats['records_imported'],
                'records_updated' => $stats['records_updated'],
                'status' => 'success',
            ]);
        } catch (\Exception $e) {
            $this->log->update([
                'status' => 'failed',
                'error_message' => mb_substr($e->getMessage(), 0, 500),
            ]);
        } finally {
            if (Storage::exists($this->filePath)) {
                Storage::delete($this->filePath);
            }
        }
    }
}
