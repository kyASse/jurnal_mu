<?php

use App\Models\Role;
use App\Models\ScientificField;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    // Get role IDs
    $this->superAdminRoleId = Role::where('name', Role::SUPER_ADMIN)->value('id');
    $this->adminKampusRoleId = Role::where('name', Role::ADMIN_KAMPUS)->value('id');

    // Create users with role IDs implicitly set directly here to bypass factory errors
    $this->superAdmin = clone User::factory()->make([
        'role_id' => $this->superAdminRoleId,
        'university_id' => null,
    ]);
    $this->superAdmin->save();

    // Create a university first to satisfy foreign key constraint
    $this->university = \App\Models\University::factory()->create();

    $this->adminKampus = clone User::factory()->make([
        'role_id' => $this->adminKampusRoleId,
        'university_id' => $this->university->id, 
    ]);
    $this->adminKampus->save();
});

it('allows super admin to view scientific fields index', function () {
    ScientificField::factory()->count(3)->create(['parent_id' => null, 'is_active' => true]);

    $response = $this->actingAs($this->superAdmin)
        ->get(route('admin.data-master.scientific-fields.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/DataMaster/ScientificFields/Index')
        ->has('categories', 3)
    );
});

it('forbids admin kampus from viewing scientific fields index', function () {
    $response = $this->actingAs($this->adminKampus)
        ->get(route('admin.data-master.scientific-fields.index'));

    $response->assertStatus(403);
});

it('allows super admin to create a new scientific field', function () {
    $payload = [
        'code' => 'TEST-123',
        'name' => 'Testing Field',
        'description' => 'A new scientific field for testing',
        'parent_id' => null,
        'is_active' => true,
    ];

    $response = $this->actingAs($this->superAdmin)
        ->post(route('admin.data-master.scientific-fields.store'), $payload);

    $response->assertRedirect();
    $this->assertDatabaseHas('scientific_fields', [
        'code' => 'TEST-123',
        'name' => 'Testing Field',
    ]);
});

it('allows super admin to update a scientific field', function () {
    $field = ScientificField::factory()->create();

    $payload = [
        'code' => 'UPD-456',
        'name' => 'Updated Field Name',
        'description' => 'Updated desc',
        'parent_id' => null,
        'is_active' => false,
    ];

    $response = $this->actingAs($this->superAdmin)
        ->put(route('admin.data-master.scientific-fields.update', $field->id), $payload);

    $response->assertRedirect();
    $this->assertDatabaseHas('scientific_fields', [
        'id' => $field->id,
        'code' => 'UPD-456',
        'name' => 'Updated Field Name',
        'is_active' => 0,
    ]);
});

it('allows super admin to delete a scientific field', function () {
    $field = ScientificField::factory()->create();

    $response = $this->actingAs($this->superAdmin)
        ->delete(route('admin.data-master.scientific-fields.destroy', $field->id));

    $response->assertRedirect();
    
    if (in_array(\Illuminate\Database\Eloquent\SoftDeletes::class, class_uses_recursive(ScientificField::class))) {
        $this->assertSoftDeleted('scientific_fields', ['id' => $field->id]);
    } else {
        $this->assertDatabaseMissing('scientific_fields', ['id' => $field->id]);
    }
});

it('allows super admin to export scientific fields', function () {
    ScientificField::factory()->count(2)->create();

    $response = $this->actingAs($this->superAdmin)
        ->get(route('admin.data-master.scientific-fields.export'));

    $response->assertStatus(200);
    $response->assertDownload('scientific_fields.xlsx');
});

it('allows super admin to import scientific fields via csv', function () {
    $header = "code,name,description,parent_code,is_active\n";
    $row1 = "IMP-001,Imported Field 1,Description 1,,1\n";
    $row2 = "IMP-002,Imported Field 2,Description 2,IMP-001,1\n";
    
    $file = UploadedFile::fake()->createWithContent('import.csv', $header . $row1 . $row2);

    $response = $this->actingAs($this->superAdmin)
        ->post(route('admin.data-master.scientific-fields.import'), [
            'file' => $file,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('scientific_fields', [
        'code' => 'IMP-001',
        'name' => 'Imported Field 1',
    ]);
    
    $parent = ScientificField::where('code', 'IMP-001')->first();
    
    $this->assertDatabaseHas('scientific_fields', [
        'code' => 'IMP-002',
        'parent_id' => $parent->id,
    ]);
});

