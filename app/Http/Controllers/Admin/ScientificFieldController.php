<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScientificField;
use App\Http\Requests\Admin\StoreScientificFieldRequest;
use App\Http\Requests\Admin\UpdateScientificFieldRequest;
use App\Http\Requests\Admin\ImportScientificFieldRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\SimpleExcel\SimpleExcelReader;
use Spatie\SimpleExcel\SimpleExcelWriter;

class ScientificFieldController extends Controller
{
    public function index(): Response
    {
        $categories = ScientificField::parents()
            ->withCount('children')
            ->orderBy('code')
            ->get();

        $classifications = ScientificField::query()->children()
            ->with('parent:id,name,code')
            ->orderBy('code')
            ->get();

        return Inertia::render('Admin/DataMaster/ScientificFields/Index', [
            'categories' => $categories,
            'classifications' => $classifications,
            'parentOptions' => ScientificField::parents()->select('id', 'name', 'code')->orderBy('name')->get()
        ]);
    }

    public function store(StoreScientificFieldRequest $request): RedirectResponse
    {
        ScientificField::create($request->validated());

        return redirect()->route('admin.data-master.scientific-fields.index')
            ->with('message', 'Bidang ilmu berhasil ditambahkan.');
    }

    public function update(UpdateScientificFieldRequest $request, ScientificField $scientific_field): RedirectResponse
    {
        $scientific_field->update($request->validated());

        return redirect()->route('admin.data-master.scientific-fields.index')
            ->with('message', 'Bidang ilmu berhasil diperbarui.');
    }

    public function destroy(ScientificField $scientific_field): RedirectResponse
    {
        if ($scientific_field->children()->count() > 0) {
            return back()->with('error', 'Tidak dapat menghapus Kategori yang masih memiliki Klasifikasi anak.');
        }

        try {
            $scientific_field->delete();
            return redirect()->route('admin.data-master.scientific-fields.index')
                ->with('message', 'Bidang ilmu berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->with('error', 'Tidak dapat menghapus Bidang ilmu karena masih digunakan (terhubung ke Data Jurnal).');
        }
    }

    public function import(ImportScientificFieldRequest $request): RedirectResponse
    {
        try {
            DB::beginTransaction();

            $rows = SimpleExcelReader::create($request->file('file')->path())->getRows();

            $count = 0;
            $rows->each(function (array $row) use (&$count) {
                if (empty($row['code']) || empty($row['name'])) {
                    return;
                }

                $parentId = null;
                if (!empty($row['parent_code'])) {
                    $parent = ScientificField::where('code', $row['parent_code'])->first();
                    if ($parent) {
                        $parentId = $parent->id;
                    }
                }

                ScientificField::updateOrCreate(
                    ['code' => $row['code']],
                    [
                        'name' => $row['name'],
                        'description' => $row['description'] ?? null,
                        'parent_id' => $parentId,
                        'is_active' => isset($row['is_active']) ? (bool) $row['is_active'] : true,
                    ]
                );

                $count++;
            });

            DB::commit();
            return redirect()->route('admin.data-master.scientific-fields.index')
                ->with('message', "{$count} Bidang ilmu berhasil diimport.");
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Scientific Fields Import Failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal mengimport data. Pastikan format Excel sesuai.');
        }
    }

    public function export()
    {
        $fields = ScientificField::with('parent:id,code')->orderBy('id')->get();
        
        $writer = SimpleExcelWriter::streamDownload('scientific-fields-' . date('Ymd-His') . '.xlsx');
        
        foreach ($fields as $field) {
            $writer->addRow([
                'code' => $field->code,
                'name' => $field->name,
                'description' => $field->description,
                'parent_code' => $field->parent ? $field->parent->code : null,
                'is_active' => $field->is_active ? 1 : 0,
            ]);
        }
        
        return $writer->toBrowser();
    }
}
