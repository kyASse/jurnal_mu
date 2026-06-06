<?php

namespace Tests\Feature;

use App\Models\Journal;
use App\Models\Article;
use App\Services\CrossrefXmlImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CrossrefXmlImporterTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_parse_ojs2_and_ojs3_xml()
    {
        $journal = Journal::factory()->create();
        $importer = new CrossrefXmlImporter();

        // OJS 2 import
        $result2 = $importer->import($journal, storage_path('app/public/OJS_2.xml'), 'skip');
        $this->assertEquals(2, $result2['records_found']);
        $this->assertEquals(2, $result2['records_imported']);

        // OJS 3 import
        $result3 = $importer->import($journal, storage_path('app/public/OJS_3.xml'), 'skip');
        $this->assertEquals(2, $result3['records_found']);
        $this->assertEquals(2, $result3['records_imported']);

        $this->assertDatabaseHas('articles', [
            'title' => 'Predict customer churn in the banking sector: a machine learning approach with imbalanced data handling techniques',
            'journal_id' => $journal->id,
        ]);
    }
}
