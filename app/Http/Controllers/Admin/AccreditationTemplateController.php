<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAccreditationTemplateRequest;
use App\Http\Requests\Admin\UpdateAccreditationTemplateRequest;
use App\Models\AccreditationTemplate;
use App\Models\EvaluationIndicator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * AccreditationTemplateController - Super Admin Only
 *
 * Manages accreditation template operations for hierarchical borang system.
 * All operations restricted to Super Admin role via policies.
 *
 * @route /admin/templates/*
 */
class AccreditationTemplateController extends Controller
{
    /**
     * Display a listing of accreditation templates.
     *
     * @route GET /admin/templates
     *
     * @features List all templates, search, filter by type/status, pagination
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AccreditationTemplate::class);

        $query = AccreditationTemplate::query()
            ->withCount([
                'categories',
                'subCategories',
                'essayQuestions',
            ])
            // Eager load indicators count via subquery to avoid N+1
            ->addSelect([
                'indicators_count' => EvaluationIndicator::query()
                    ->join('evaluation_sub_categories', 'evaluation_indicators.sub_category_id', '=', 'evaluation_sub_categories.id')
                    ->join('evaluation_categories', 'evaluation_sub_categories.category_id', '=', 'evaluation_categories.id')
                    ->whereColumn('evaluation_categories.template_id', 'accreditation_templates.id')
                    ->selectRaw('count(*)'),
            ]);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('version', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Type filter
        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        // Status filter
        if ($request->filled('is_active')) {
            if ($request->is_active === 'active') {
                $query->active();
            } elseif ($request->is_active === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $templates = $query
            ->latest('effective_date')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($template) => [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'version' => $template->version,
                'type' => $template->type,
                'is_active' => $template->is_active,
                'effective_date' => $template->effective_date?->format('Y-m-d'),
                'categories_count' => $template->categories_count,
                'sub_categories_count' => $template->sub_categories_count,
                'indicators_count' => $template->indicators_count,
                'essay_questions_count' => $template->essay_questions_count,
                'created_at' => $template->created_at?->format('Y-m-d H:i'),
                'can_be_deleted' => $template->canBeDeleted(),
            ]);

        return Inertia::render('Admin/BorangIndikator/Index', [
            'templates' => $templates,
            'filters' => $request->only(['search', 'type', 'is_active']),
        ]);
    }

    /**
     * Show the form for creating a new template.
     *
     * @route GET /admin/templates/create
     */
    public function create(): Response
    {
        $this->authorize('create', AccreditationTemplate::class);

        return Inertia::render('Admin/Templates/Create');
    }

    /**
     * Store a newly created template in storage.
     *
     * @route POST /admin/templates
     */
    public function store(StoreAccreditationTemplateRequest $request): RedirectResponse
    {
        $template = AccreditationTemplate::create($request->validated());

        return redirect()
            ->route('admin.templates.show', $template)
            ->with('success', "Template '{$template->name}' berhasil dibuat.");
    }

    /**
     * Display the specified template.
     *
     * @route GET /admin/templates/{template}
     *
     * @features Show template details, categories hierarchy, indicators, essays
     */
    public function show(AccreditationTemplate $template): Response
    {
        $this->authorize('view', $template);

        $template->load([
            'categories' => function ($query) {
                $query->withCount(['subCategories', 'indicators', 'essayQuestions'])
                    ->ordered();
            },
        ]);

        return Inertia::render('Admin/Templates/Show', [
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'version' => $template->version,
                'type' => $template->type,
                'is_active' => $template->is_active,
                'effective_date' => $template->effective_date?->format('Y-m-d'),
                'total_weight' => $template->getTotalWeight(),
                'can_be_deleted' => $template->canBeDeleted(),
                'categories' => $template->categories->map(fn ($category) => [
                    'id' => $category->id,
                    'code' => $category->code,
                    'name' => $category->name,
                    'weight' => $category->weight,
                    'display_order' => $category->display_order,
                    'sub_categories_count' => $category->sub_categories_count,
                    'indicators_count' => $category->indicators_count,
                    'essay_questions_count' => $category->essay_questions_count,
                ]),
                'created_at' => $template->created_at?->format('Y-m-d H:i'),
                'updated_at' => $template->updated_at?->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified template.
     *
     * @route GET /admin/templates/{template}/edit
     */
    public function edit(AccreditationTemplate $template): Response
    {
        $this->authorize('update', $template);

        return Inertia::render('Admin/Templates/Edit', [
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'version' => $template->version,
                'type' => $template->type,
                'is_active' => $template->is_active,
                'effective_date' => $template->effective_date?->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Update the specified template in storage.
     *
     * @route PUT/PATCH /admin/templates/{template}
     */
    public function update(
        UpdateAccreditationTemplateRequest $request,
        AccreditationTemplate $template
    ): RedirectResponse {
        $template->update($request->validated());

        return redirect()
            ->route('admin.templates.show', $template)
            ->with('success', "Template '{$template->name}' berhasil diperbarui.");
    }

    /**
     * Remove the specified template from storage (soft delete).
     *
     * @route DELETE /admin/templates/{template}
     */
    public function destroy(AccreditationTemplate $template): RedirectResponse
    {
        $this->authorize('delete', $template);

        if (! $template->canBeDeleted()) {
            return back()->with('error', 'Template tidak dapat dihapus karena merupakan satu-satunya template aktif dengan tipe ini, atau memiliki indikator yang digunakan dalam assessment yang sudah disubmit.');
        }

        $templateName = $template->name;
        $template->delete();

        return redirect()
            ->route('admin.templates.index')
            ->with('success', "Template '{$templateName}' berhasil dihapus.");
    }

    /**
     * Clone the specified template (deep copy).
     *
     * @route POST /admin/templates/{template}/clone
     *
     * @features Deep copy entire template hierarchy (categories, sub-categories, indicators, essays)
     */
    public function clone(Request $request, AccreditationTemplate $template): RedirectResponse
    {
        $this->authorize('clone', $template);

        $request->validate([
            'new_name' => ['required', 'string', 'max:255', 'unique:accreditation_templates,name'],
        ], [
            'new_name.unique' => 'Nama template sudah digunakan. Silakan gunakan nama lain.',
        ]);

        $clonedTemplate = $template->cloneTemplate($request->new_name);

        return redirect()
            ->route('admin.templates.show', $clonedTemplate)
            ->with('success', "Template '{$clonedTemplate->name}' berhasil diduplikasi dari '{$template->name}'.");
    }

    /**
     * Toggle the active status of the specified template.
     *
     * @route POST /admin/templates/{template}/toggle
     *
     * @features Activate/deactivate template for use in assessments
     */
    public function toggleActive(AccreditationTemplate $template): RedirectResponse
    {
        $this->authorize('toggleActive', $template);

        $template->is_active = ! $template->is_active;
        $template->save();

        $status = $template->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Template '{$template->name}' berhasil {$status}.");
    }

    /**
     * Show the structure editor (Tree View).
     *
     * @route GET /admin/templates/{template}/structure
     */
    public function structure(AccreditationTemplate $template): Response
    {
        $this->authorize('view', $template);

        // Preload full hierarchy
        $template->load([
            'categories' => function ($query) {
                $query->ordered();
            },
            'categories.subCategories' => function ($query) {
                $query->ordered();
            },
            'categories.subCategories.indicators' => function ($query) {
                $query->ordered();
            },
            'categories.essayQuestions' => function ($query) {
                $query->ordered();
            },
        ]);

        return Inertia::render('Admin/BorangIndikator/Tree', [
            'template' => $template,
            // Keep raw Eloquent relationships for components that still rely on the original category models
            'initialTree' => $template->categories,
            // Normalized tree structure consumed by the tree editor UI
            'structuredTree' => $this->buildTreeData($template),
        ]);
    }

    private function buildTreeData($template)
    {
        return $template->categories->map(function ($category) {
            return [
                'id' => "category-{$category->id}",
                'type' => 'category',
                'data' => $category,
                'children' => [
                    ...$category->subCategories->map(function ($subCategory) {
                        return [
                            'id' => "sub-category-{$subCategory->id}",
                            'type' => 'sub_category',
                            'data' => $subCategory,
                            'children' => $subCategory->indicators->map(function ($indicator) {
                                return [
                                    'id' => "indicator-{$indicator->id}",
                                    'type' => 'indicator',
                                    'data' => $indicator,
                                ];
                            })->values()->toArray(),
                        ];
                    })->values()->toArray(),
                    ...$category->essayQuestions->map(function ($essay) {
                        return [
                            'id' => "essay-{$essay->id}",
                            'type' => 'essay',
                            'data' => $essay,
                        ];
                    })->values()->toArray(),
                ],
            ];
        })->values()->toArray();
    }

    /**
     * Get full hierarchical tree structure of template.
     *
     * @route GET /admin/templates/{template}/tree
     *
     * @features Tree view data for drag-and-drop UI (categories → sub-categories → indicators + essays)
     */
    public function tree(AccreditationTemplate $template): \Illuminate\Http\JsonResponse
    {
        $this->authorize('view', $template);

        $template->load([
            'categories.subCategories.indicators' => function ($query) {
                $query->ordered();
            },
            'categories.essayQuestions' => function ($query) {
                $query->ordered();
            },
        ]);

        $tree = $template->categories->map(function ($category) {
            return [
                'id' => "category-{$category->id}",
                'type' => 'category',
                'data' => [
                    'id' => $category->id,
                    'code' => $category->code,
                    'name' => $category->name,
                    'weight' => $category->weight,
                    'display_order' => $category->display_order,
                ],
                'children' => [
                    // Sub-categories with their indicators
                    ...$category->subCategories->map(function ($subCategory) {
                        return [
                            'id' => "sub-category-{$subCategory->id}",
                            'type' => 'sub_category',
                            'data' => [
                                'id' => $subCategory->id,
                                'code' => $subCategory->code,
                                'name' => $subCategory->name,
                                'display_order' => $subCategory->display_order,
                            ],
                            'children' => $subCategory->indicators->map(function ($indicator) {
                                return [
                                    'id' => "indicator-{$indicator->id}",
                                    'type' => 'indicator',
                                    'data' => [
                                        'id' => $indicator->id,
                                        'code' => $indicator->code,
                                        'question' => $indicator->question,
                                        'weight' => $indicator->weight,
                                        'sort_order' => $indicator->sort_order,
                                    ],
                                ];
                            })->values()->toArray(),
                        ];
                    })->values()->toArray(),
                    // Essays at category level
                    ...$category->essayQuestions->map(function ($essay) {
                        return [
                            'id' => "essay-{$essay->id}",
                            'type' => 'essay',
                            'data' => [
                                'id' => $essay->id,
                                'code' => $essay->code,
                                'question' => $essay->question,
                                'max_words' => $essay->max_words,
                                'is_required' => $essay->is_required,
                                'display_order' => $essay->display_order,
                            ],
                        ];
                    })->values()->toArray(),
                ],
            ];
        });

        return response()->json([
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'type' => $template->type,
            ],
            'tree' => $tree,
        ]);
    }
}
