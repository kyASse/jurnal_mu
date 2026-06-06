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

        // Assert OJS 2 article parsed fields
        $articleOjs2 = Article::where('title', 'Predict customer churn in the banking sector: a machine learning approach with imbalanced data handling techniques')->first();
        $this->assertNotNull($articleOjs2);
        $this->assertEquals(['Jong-Hwa Lee', 'Van-Ho Nguyen', 'Hoanh-Su Le'], $articleOjs2->authors);
        $this->assertStringContainsString('Customer value analysis is a critical component', $articleOjs2->abstract);
        $this->assertEquals('10.26555/ijain.v12i1.2262', $articleOjs2->doi);
        $this->assertEquals('https://ijain.org/index.php/IJAIN/article/view/2262', $articleOjs2->article_url);
        $this->assertEquals('https://ijain.org/index.php/IJAIN/article/viewFile/2262/ijain_vol12i1_pp267-282', $articleOjs2->pdf_url);
        $this->assertEquals('267-282', $articleOjs2->pages);
        $this->assertEquals('12', $articleOjs2->volume);
        $this->assertEquals('1', $articleOjs2->issue);

        // OJS 3 import
        $result3 = $importer->import($journal, storage_path('app/public/OJS_3.xml'), 'skip');
        $this->assertEquals(2, $result3['records_found']);
        $this->assertEquals(2, $result3['records_imported']);

        // Assert OJS 3 article parsed fields
        $articleOjs3 = Article::where('title', 'Empowering parents: using short movie to help parents understand teenage sexuality')->first();
        $this->assertNotNull($articleOjs3);
        $this->assertEquals(['Rani Prita Prabawangi', 'Megasari N. Fatanti', 'Tyas Siti Halizza'], $articleOjs3->authors);
        $this->assertStringContainsString('Adolescent sexual behavior is often a complex problem', $articleOjs3->abstract);
        $this->assertEquals('10.12928/jpm.v9i2.11972', $articleOjs3->doi);
        $this->assertEquals('http://journal2.uad.ac.id/index.php/jpmuad/article/view/11972', $articleOjs3->article_url);
        $this->assertEquals('http://journal2.uad.ac.id/index.php/jpmuad/article/download/11972/6126', $articleOjs3->pdf_url);
        $this->assertEquals('63-75', $articleOjs3->pages);
        $this->assertEquals('9', $articleOjs3->volume);
        $this->assertEquals('2', $articleOjs3->issue);
    }

    public function test_duplicate_strategy_skip()
    {
        $journal = Journal::factory()->create();
        $importer = new CrossrefXmlImporter();

        // Initial import
        $importer->import($journal, storage_path('app/public/OJS_2.xml'), 'skip');

        $article = Article::where('doi', '10.26555/ijain.v12i1.2262')->first();
        $this->assertNotNull($article);

        // Change title in DB
        $originalTitle = $article->title;
        $article->title = 'Modified Title For Testing Skip';
        $article->save();

        // Re-import with 'skip' strategy
        $result = $importer->import($journal, storage_path('app/public/OJS_2.xml'), 'skip');
        
        $this->assertEquals(2, $result['records_found']);
        $this->assertEquals(0, $result['records_imported']);
        $this->assertEquals(0, $result['records_updated']);

        // Verify the title was NOT updated back (remains modified)
        $article->refresh();
        $this->assertEquals('Modified Title For Testing Skip', $article->title);
    }

    public function test_duplicate_strategy_update()
    {
        $journal = Journal::factory()->create();
        $importer = new CrossrefXmlImporter();

        // Initial import
        $importer->import($journal, storage_path('app/public/OJS_2.xml'), 'skip');

        $article = Article::where('doi', '10.26555/ijain.v12i1.2262')->first();
        $this->assertNotNull($article);

        // Change title in DB
        $originalTitle = $article->title;
        $article->title = 'Modified Title For Testing Update';
        $article->save();

        // Re-import with 'update' strategy
        $result = $importer->import($journal, storage_path('app/public/OJS_2.xml'), 'update');
        
        $this->assertEquals(2, $result['records_found']);
        $this->assertEquals(0, $result['records_imported']);
        $this->assertEquals(2, $result['records_updated']);

        // Verify the title was updated back to original XML title
        $article->refresh();
        $this->assertEquals($originalTitle, $article->title);
    }
}
