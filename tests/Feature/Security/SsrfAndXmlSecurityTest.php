<?php

namespace Tests\Feature\Security;

use App\Models\Journal;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use App\Services\CrossrefXmlImporter;
use App\Services\OAIPMHHarvester;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SsrfAndXmlSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        Storage::fake('public');
    }

    public function test_oai_pmh_rejects_internal_ssrf_urls(): void
    {
        $harvester = app(OAIPMHHarvester::class);

        $privateUrls = [
            'http://127.0.0.1/oai',
            'http://localhost:8081/oai',
            'http://169.254.169.254/latest/meta-data/',
            'http://10.0.0.1/oai',
            'http://192.168.1.1/oai',
            'http://172.18.0.2/oai',
            'http://0.0.0.0/oai',
            'ftp://ejournal.undip.ac.id/oai',
            'javascript:alert(1)',
        ];

        foreach ($privateUrls as $url) {
            $this->assertFalse($harvester->isSafePublicUrl($url), "URL {$url} must be rejected as SSRF target");
        }

        $validUrl = 'https://ejournal.undip.ac.id/index.php/index/oai';
        $this->assertTrue($harvester->isSafePublicUrl($validUrl));
    }

    public function test_oai_pmh_harvest_blocks_requests_to_internal_ip(): void
    {
        Http::fake();

        $university = University::factory()->create();
        $journal = Journal::factory()->create([
            'university_id' => $university->id,
            'oai_urls' => ['http://127.0.0.1:8080/oai', 'http://169.254.169.254/metadata'],
        ]);

        $harvester = app(OAIPMHHarvester::class);
        $stats = $harvester->harvest($journal);

        Http::assertNothingSent();
        $this->assertNotEmpty($stats['errors']);
        $this->assertStringContainsString('SSRF', $stats['errors'][0]);
    }

    public function test_university_logo_rejects_svg_uploads(): void
    {
        $admin = User::factory()->create([
            'role_id' => Role::where('name', Role::SUPER_ADMIN)->first()->id,
            'is_active' => true,
        ]);

        $svgPayload = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><circle cx="50" cy="50" r="40"/></svg>';
        $svgFile = UploadedFile::fake()->createWithContent('malicious.svg', $svgPayload);

        $university = University::factory()->create();

        $response = $this->actingAs($admin)->put(route('admin.universities.update', $university), [
            'name' => 'Updated Uni',
            'code' => $university->code,
            'logo_file' => $svgFile,
        ]);

        $response->assertSessionHasErrors('logo_file');
    }

    public function test_university_logo_accepts_valid_image_uploads(): void
    {
        $admin = User::factory()->create([
            'role_id' => Role::where('name', Role::SUPER_ADMIN)->first()->id,
            'is_active' => true,
        ]);

        $pngFile = UploadedFile::fake()->image('logo.png', 100, 100);
        $university = University::factory()->create();

        $response = $this->actingAs($admin)->put(route('admin.universities.update', $university), [
            'name' => 'Updated Uni',
            'code' => $university->code,
            'logo_file' => $pngFile,
        ]);

        $response->assertSessionHasNoErrors();
    }

    public function test_crossref_xml_importer_parses_safely_with_libxml_nonet(): void
    {
        $university = University::factory()->create();
        $journal = Journal::factory()->create(['university_id' => $university->id]);

        $importer = app(CrossrefXmlImporter::class);

        $xmlContent = <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE doi_batch [
  <!ENTITY xxe SYSTEM "http://127.0.0.1:9999/evil.dtd">
]>
<doi_batch xmlns="http://www.crossref.org/schema/4.3.6" version="4.3.6">
  <body>
    <journal>
      <journal_metadata>
        <full_title>Journal of Security</full_title>
      </journal_metadata>
      <journal_article>
        <titles>
          <title>&xxe;Safe Article Title</title>
        </titles>
        <doi_data>
          <doi>10.1234/sec.2026.001</doi>
          <resource>https://example.com/article/1</resource>
        </doi_data>
      </journal_article>
    </journal>
  </body>
</doi_batch>
XML;

        $tempFile = tempnam(sys_get_temp_dir(), 'xml_test_');
        file_put_contents($tempFile, $xmlContent);

        try {
            $stats = $importer->import($journal, $tempFile, 'insert');
            $this->assertEquals(1, $stats['records_imported']);
            $this->assertDatabaseHas('articles', [
                'journal_id' => $journal->id,
                'doi' => '10.1234/sec.2026.001',
            ]);
        } finally {
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
    }
}
