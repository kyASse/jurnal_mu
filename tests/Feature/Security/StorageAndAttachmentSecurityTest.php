<?php

namespace Tests\Feature\Security;

use App\Models\Role;
use App\Models\Ticket;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StorageAndAttachmentSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        Storage::fake('local');
        Storage::fake('public');
    }

    public function test_ticket_attachment_is_stored_on_private_disk(): void
    {
        $university = University::factory()->create();
        $userRole = Role::where('name', Role::USER)->first();

        $user = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        $file = UploadedFile::fake()->create('confidential_logs.pdf', 100, 'application/pdf');

        $response = $this->actingAs($user)->post(route('user.tickets.store'), [
            'subject' => 'Issue with login',
            'category' => 'bug_report',
            'priority' => 'normal',
            'message' => 'Please find attached my system logs',
            'attachment' => $file,
        ]);

        $ticket = Ticket::first();
        $message = $ticket->messages()->first();

        // Attachment MUST NOT be on public disk
        Storage::disk('public')->assertMissing($message->attachment_path);
        // Attachment MUST be on local private disk
        Storage::disk('local')->assertExists($message->attachment_path);
    }

    public function test_unauthorized_user_cannot_download_ticket_attachment(): void
    {
        $university = University::factory()->create();
        $userRole = Role::where('name', Role::USER)->first();

        $user1 = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        $user2 = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        $ticket = Ticket::create([
            'user_id' => $user1->id,
            'subject' => 'Secret bug',
            'category' => 'bug_report',
            'priority' => 'high',
            'status' => 'open',
        ]);

        $message = $ticket->messages()->create([
            'user_id' => $user1->id,
            'message' => 'Here is data',
            'attachment_path' => 'tickets/'.$ticket->id.'/sample.pdf',
        ]);

        Storage::disk('local')->put('tickets/'.$ticket->id.'/sample.pdf', 'dummy content');

        // User 2 cannot download User 1's ticket attachment
        $response = $this->actingAs($user2)->get(route('user.tickets.attachments.download', [$ticket, $message]));
        $response->assertStatus(403);

        // User 1 can download
        $response1 = $this->actingAs($user1)->get(route('user.tickets.attachments.download', [$ticket, $message]));
        $response1->assertStatus(200);
    }

    public function test_super_admin_can_download_ticket_attachment(): void
    {
        $university = University::factory()->create();
        $userRole = Role::where('name', Role::USER)->first();
        $adminRole = Role::where('name', Role::SUPER_ADMIN)->first();

        $user = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'role_id' => $adminRole->id,
            'university_id' => null,
            'is_active' => true,
        ]);

        $ticket = Ticket::create([
            'user_id' => $user->id,
            'subject' => 'Admin bug report',
            'category' => 'bug_report',
            'priority' => 'high',
            'status' => 'open',
        ]);

        $message = $ticket->messages()->create([
            'user_id' => $user->id,
            'message' => 'Admin please check',
            'attachment_path' => 'tickets/'.$ticket->id.'/admin_check.pdf',
        ]);

        Storage::disk('local')->put('tickets/'.$ticket->id.'/admin_check.pdf', 'dummy content');

        // Super Admin downloads via admin route
        $responseAdmin = $this->actingAs($admin)->get(route('admin.tickets.attachments.download', [$ticket, $message]));
        $responseAdmin->assertStatus(200);
    }

    public function test_admin_kampus_can_only_download_own_attachments(): void
    {
        $university = University::factory()->create();
        $adminKampusRole = Role::where('name', Role::ADMIN_KAMPUS)->first();

        $ak1 = User::factory()->create([
            'role_id' => $adminKampusRole->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        $ak2 = User::factory()->create([
            'role_id' => $adminKampusRole->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        $ticket = Ticket::create([
            'user_id' => $ak1->id,
            'subject' => 'Admin Kampus Ticket',
            'category' => 'question',
            'priority' => 'normal',
            'status' => 'open',
        ]);

        $message = $ticket->messages()->create([
            'user_id' => $ak1->id,
            'message' => 'Kampus docs',
            'attachment_path' => 'tickets/'.$ticket->id.'/kampus.pdf',
        ]);

        Storage::disk('local')->put('tickets/'.$ticket->id.'/kampus.pdf', 'kampus content');

        // AK1 can download own
        $response1 = $this->actingAs($ak1)->get(route('admin-kampus.tickets.attachments.download', [$ticket, $message]));
        $response1->assertStatus(200);

        // AK2 cannot download AK1's attachment
        $response2 = $this->actingAs($ak2)->get(route('admin-kampus.tickets.attachments.download', [$ticket, $message]));
        $response2->assertStatus(403);
    }

    public function test_download_fails_when_message_does_not_belong_to_ticket(): void
    {
        $university = University::factory()->create();
        $userRole = Role::where('name', Role::USER)->first();

        $user = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        $ticket1 = Ticket::create([
            'user_id' => $user->id,
            'subject' => 'Ticket 1',
            'category' => 'bug_report',
            'priority' => 'normal',
            'status' => 'open',
        ]);

        $ticket2 = Ticket::create([
            'user_id' => $user->id,
            'subject' => 'Ticket 2',
            'category' => 'bug_report',
            'priority' => 'normal',
            'status' => 'open',
        ]);

        $message = $ticket2->messages()->create([
            'user_id' => $user->id,
            'message' => 'Ticket 2 message',
            'attachment_path' => 'tickets/'.$ticket2->id.'/file.pdf',
        ]);

        Storage::disk('local')->put('tickets/'.$ticket2->id.'/file.pdf', 'dummy');

        // Mismatched ticket and message returns 404
        $response = $this->actingAs($user)->get(route('user.tickets.attachments.download', [$ticket1, $message]));
        $response->assertStatus(404);
    }
}
