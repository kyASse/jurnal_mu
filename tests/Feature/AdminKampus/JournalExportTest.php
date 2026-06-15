<?php

use App\Models\Journal;
use App\Models\University;
use App\Models\User;
use Illuminate\Support\Str;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seedRoles();
});

it('allows admin kampus to export their own university journals to xlsx', function () {
    $university = University::factory()->create(['name' => 'Universitas Indonesia']);
    $adminKampus = User::factory()->adminKampus($university->id)->create(['is_active' => true]);

    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'title' => 'Journal of UI',
    ]);

    $response = actingAs($adminKampus)
        ->get(route('admin-kampus.journals.export', 'xlsx'));

    $response->assertStatus(200);

    $contentDisposition = $response->headers->get('content-disposition');
    expect($contentDisposition)->not->toBeNull();

    $uniSlug = Str::slug($university->name);
    expect($contentDisposition)->toContain("journals_{$uniSlug}.xlsx");
});

it('allows admin kampus to export their own university journals to csv and filters appropriately', function () {
    $univ1 = University::factory()->create(['name' => 'Universitas Indonesia']);
    $univ2 = University::factory()->create(['name' => 'Universitas Gadjah Mada']);

    $adminKampus1 = User::factory()->adminKampus($univ1->id)->create(['is_active' => true]);

    $journal1 = Journal::factory()->create([
        'university_id' => $univ1->id,
        'title' => 'Journal of UI',
    ]);

    $journal2 = Journal::factory()->create([
        'university_id' => $univ2->id,
        'title' => 'Journal of UGM',
    ]);

    $response = actingAs($adminKampus1)
        ->get(route('admin-kampus.journals.export', 'csv'));

    $response->assertStatus(200);

    $contentDisposition = $response->headers->get('content-disposition');
    expect($contentDisposition)->not->toBeNull();

    $uniSlug = Str::slug($univ1->name);
    expect($contentDisposition)->toContain("journals_{$uniSlug}.csv");

    $streamedContent = $response->streamedContent();
    expect($streamedContent)->toContain('Journal of UI');
    expect($streamedContent)->not->toContain('Journal of UGM');
});

it('denies access to export journals for non-admin kampus users', function () {
    $university = University::factory()->create();
    $regularUser = User::factory()->user($university->id)->create(['is_active' => true]);

    $response = actingAs($regularUser)
        ->get(route('admin-kampus.journals.export', 'xlsx'));

    $response->assertStatus(403);
});

it('denies access to guest users', function () {
    $response = $this->get(route('admin-kampus.journals.export', 'xlsx'));

    $response->assertRedirect(route('login'));
});
