<?php

namespace Tests\Feature;

use App\Jobs\ImportArticlesXmlJob;
use App\Models\ArticleImportLog;
use App\Models\Journal;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class XmlArticleImportControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    public function test_user_can_upload_xml()
    {
        Queue::fake();

        $university = University::factory()->create();
        $user = User::factory()->user($university->id)->create();
        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $university->id,
        ]);

        $file = UploadedFile::fake()->create('import.xml', 100, 'text/xml');

        $response = $this->actingAs($user)
            ->post(route('user.journals.import-xml', $journal->id), [
                'xml_file' => $file,
                'duplicate_strategy' => 'skip',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('article_import_logs', [
            'journal_id' => $journal->id,
            'filename' => 'import.xml',
            'status' => 'pending',
        ]);
        Queue::assertPushed(ImportArticlesXmlJob::class);
    }

    public function test_admin_kampus_can_upload_xml()
    {
        Queue::fake();

        $university = University::factory()->create();
        $adminKampus = User::factory()->adminKampus($university->id)->create();
        $user = User::factory()->user($university->id)->create();
        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $university->id,
        ]);

        $file = UploadedFile::fake()->create('import.xml', 100, 'text/xml');

        $response = $this->actingAs($adminKampus)
            ->post(route('admin-kampus.journals.import-xml', $journal->id), [
                'xml_file' => $file,
                'duplicate_strategy' => 'update',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('article_import_logs', [
            'journal_id' => $journal->id,
            'filename' => 'import.xml',
            'status' => 'pending',
            'duplicate_strategy' => 'update',
        ]);
        Queue::assertPushed(ImportArticlesXmlJob::class);
    }

    public function test_super_admin_can_upload_xml()
    {
        Queue::fake();

        $superAdmin = User::factory()->superAdmin()->create();
        $university = University::factory()->create();
        $user = User::factory()->user($university->id)->create();
        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $university->id,
        ]);

        $file = UploadedFile::fake()->create('import.xml', 100, 'text/xml');

        $response = $this->actingAs($superAdmin)
            ->post(route('admin.journals.import-xml', $journal->id), [
                'xml_file' => $file,
                'duplicate_strategy' => 'skip',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('article_import_logs', [
            'journal_id' => $journal->id,
            'filename' => 'import.xml',
            'status' => 'pending',
        ]);
        Queue::assertPushed(ImportArticlesXmlJob::class);
    }

    public function test_user_cannot_upload_xml_to_other_journal()
    {
        Queue::fake();

        $university1 = University::factory()->create();
        $user1 = User::factory()->user($university1->id)->create();

        $university2 = University::factory()->create();
        $user2 = User::factory()->user($university2->id)->create();
        $journal2 = Journal::factory()->create([
            'user_id' => $user2->id,
            'university_id' => $university2->id,
        ]);

        $file = UploadedFile::fake()->create('import.xml', 100, 'text/xml');

        $response = $this->actingAs($user1)
            ->post(route('user.journals.import-xml', $journal2->id), [
                'xml_file' => $file,
                'duplicate_strategy' => 'skip',
            ]);

        $response->assertStatus(403);
        Queue::assertNotPushed(ImportArticlesXmlJob::class);
    }

    public function test_validation_errors()
    {
        Queue::fake();

        $university = University::factory()->create();
        $user = User::factory()->user($university->id)->create();
        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $university->id,
        ]);

        // Missing file and strategy
        $response = $this->actingAs($user)
            ->post(route('user.journals.import-xml', $journal->id), []);

        $response->assertSessionHasErrors(['xml_file', 'duplicate_strategy']);

        // Invalid file format
        $file = UploadedFile::fake()->create('import.txt', 100, 'text/plain');
        $response = $this->actingAs($user)
            ->post(route('user.journals.import-xml', $journal->id), [
                'xml_file' => $file,
                'duplicate_strategy' => 'invalid_strategy',
            ]);

        $response->assertSessionHasErrors(['xml_file', 'duplicate_strategy']);
        Queue::assertNotPushed(ImportArticlesXmlJob::class);
    }

    public function test_user_show_page_includes_import_logs()
    {
        $university = University::factory()->create();
        $user = User::factory()->user($university->id)->create();
        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $university->id,
        ]);

        // Create an import log
        $log = ArticleImportLog::create([
            'journal_id' => $journal->id,
            'filename' => 'test_import.xml',
            'duplicate_strategy' => 'skip',
            'status' => 'success',
            'records_found' => 5,
            'records_imported' => 5,
            'records_updated' => 0,
        ]);

        $response = $this->actingAs($user)
            ->get(route('user.journals.show', $journal->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('User/Journals/Show')
            ->has('importLogs', 1)
            ->where('importLogs.0.filename', 'test_import.xml')
        );
    }

    public function test_admin_kampus_show_page_includes_import_logs()
    {
        $university = University::factory()->create();
        $adminKampus = User::factory()->adminKampus($university->id)->create();
        $user = User::factory()->user($university->id)->create();
        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $university->id,
        ]);

        // Create an import log
        $log = ArticleImportLog::create([
            'journal_id' => $journal->id,
            'filename' => 'test_import.xml',
            'duplicate_strategy' => 'update',
            'status' => 'processing',
            'records_found' => 10,
            'records_imported' => 0,
            'records_updated' => 0,
        ]);

        $response = $this->actingAs($adminKampus)
            ->get(route('admin-kampus.journals.show', $journal->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('AdminKampus/Journals/Show')
            ->has('importLogs', 1)
            ->where('importLogs.0.filename', 'test_import.xml')
        );
    }

    public function test_admin_show_page_includes_import_logs()
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $university = University::factory()->create();
        $user = User::factory()->user($university->id)->create();
        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $university->id,
        ]);

        // Create an import log
        $log = ArticleImportLog::create([
            'journal_id' => $journal->id,
            'filename' => 'test_import.xml',
            'duplicate_strategy' => 'skip',
            'status' => 'failed',
            'records_found' => 0,
            'records_imported' => 0,
            'records_updated' => 0,
            'error_message' => 'Malformed XML',
        ]);

        $response = $this->actingAs($superAdmin)
            ->get(route('admin.journals.show', $journal->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Journals/Show')
            ->has('importLogs', 1)
            ->where('importLogs.0.filename', 'test_import.xml')
        );
    }
}
