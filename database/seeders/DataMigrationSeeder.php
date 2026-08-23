<?php

namespace Database\Seeders;

use App\Models\AccreditationTemplate;
use App\Models\EvaluationCategory;
use App\Models\EvaluationIndicator;
use App\Models\EvaluationSubCategory;
use Illuminate\Database\Seeder;

/**
 * Migrates v1.0 legacy indicators to v1.1 hierarchical structure.
 *
 * PROCESS:
 * 1. Extract unique categories from existing 12 indicators
 * 2. Create EvaluationCategory records linked to BAN-PT template
 * 3. Extract unique sub_categories, create EvaluationSubCategory records
 * 4. Update indicators: populate sub_category_id via code/category matching
 * 5. Validation: verify all indicators migrated, no orphaned records
 *
 * REQUIREMENTS:
 * - Must run AFTER AccreditationTemplateSeeder
 * - Must run BEFORE EssayQuestionSeeder
 * - Uses existing EvaluationIndicatorSeeder data as source
 */
class DataMigrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Starting v1.0 → v1.1 Data Migration...');
        $this->command->newLine();

        // Step 1: Get BAN-PT template (must exist from AccreditationTemplateSeeder)
        $template = AccreditationTemplate::where('type', 'akreditasi')
            ->where('is_active', true)
            ->first();

        if (!$template) {
            $this->command->error('❌ ERROR: BAN-PT template not found! Run AccreditationTemplateSeeder first.');

            return;
        }

        $this->command->info("📌 Using template: {$template->name} (ID: {$template->id})");
        $this->command->newLine();

        // Step 2: Get existing legacy indicators (sub_category_id IS NULL)
        $legacyIndicators = EvaluationIndicator::whereNull('sub_category_id')->get();

        if ($legacyIndicators->isEmpty()) {
            $this->command->warn('⚠️  No legacy indicators found (all already migrated).');

            return;
        }

        $this->command->info("🔍 Found {$legacyIndicators->count()} legacy indicators to migrate");
        $this->command->newLine();

        // Step 3: Extract unique categories with their codes and weights
        $uniqueCategories = $legacyIndicators->groupBy('category')->map(function ($indicators, $categoryName) {
            return [
                'name' => $categoryName,
                'codes' => $indicators->pluck('code')->map(fn ($code) => explode('-', $code)[0])->unique()->first(),
                'total_weight' => $indicators->sum('weight'),
                'count' => $indicators->count(),
            ];
        });

        $this->command->info('📊 Step 1: Creating Categories...');

        $categoryMapping = [];
        $displayOrder = 1;

        foreach ($uniqueCategories as $categoryName => $data) {
            $category = EvaluationCategory::create([
                'template_id' => $template->id,
                'code' => $data['codes'],
                'name' => $categoryName,
                'description' => "Kategori evaluasi {$categoryName} yang mencakup {$data['count']} indikator dengan total bobot {$data['total_weight']}.",
                'weight' => round($data['total_weight'], 2),
                'display_order' => $displayOrder++,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $categoryMapping[$categoryName] = $category;

            $catNum = $displayOrder - 1;
            $this->command->info("  ✓ Category {$catNum}: {$categoryName} (code={$data['codes']}, weight={$data['total_weight']}, indicators={$data['count']})");
        }

        $this->command->newLine();
        $this->command->info('📊 Step 2: Creating Sub-Categories...');

        $subCategoryMapping = [];
        $totalSubCategories = 0;

        foreach ($legacyIndicators->groupBy('category') as $categoryName => $categoryIndicators) {
            $category = $categoryMapping[$categoryName];
            $subDisplayOrder = 1;

            foreach ($categoryIndicators->groupBy('sub_category') as $subCategoryName => $subCategoryIndicators) {
                $subCategory = EvaluationSubCategory::create([
                    'category_id' => $category->id,
                    'code' => $subCategoryIndicators->first()->code, // Use first indicator's code
                    'name' => $subCategoryName,
                    'description' => "Sub-kategori {$subCategoryName} dalam {$categoryName}.",
                    'display_order' => $subDisplayOrder++,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Map by category + sub_category for lookup
                $subCategoryMapping["{$categoryName}::{$subCategoryName}"] = $subCategory;
                $totalSubCategories++;

                $this->command->info("  ✓ Sub-Category: {$categoryName} → {$subCategoryName} (ID: {$subCategory->id}, indicators: {$subCategoryIndicators->count()})");
            }
        }

        $this->command->newLine();
        $this->command->info('📊 Step 3: Migrating Indicators (populating sub_category_id)...');

        $migratedCount = 0;
        $failedCount = 0;

        foreach ($legacyIndicators as $indicator) {
            $key = "{$indicator->category}::{$indicator->sub_category}";

            if (!isset($subCategoryMapping[$key])) {
                $this->command->error("  ✗ FAILED: Indicator {$indicator->code} - No sub_category found for '{$key}'");
                $failedCount++;

                continue;
            }

            $subCategory = $subCategoryMapping[$key];
            $indicator->sub_category_id = $subCategory->id;
            $indicator->save();

            $migratedCount++;
            $this->command->info("  ✓ Migrated: {$indicator->code} → sub_category_id={$subCategory->id}");
        }

        $this->command->newLine();
        $this->command->info('📊 Step 4: Validation...');

        // Validation 1: Check all indicators have sub_category_id
        $remainingLegacy = EvaluationIndicator::whereNull('sub_category_id')->count();

        if ($remainingLegacy > 0) {
            $this->command->warn("  ⚠️  WARNING: {$remainingLegacy} indicators still have NULL sub_category_id");
        } else {
            $this->command->info('  ✓ All indicators successfully migrated (no NULL sub_category_id)');
        }

        // Validation 2: Check no orphaned sub_categories
        $orphanedSubCategories = EvaluationSubCategory::doesntHave('indicators')->count();

        if ($orphanedSubCategories > 0) {
            $this->command->warn("  ⚠️  WARNING: {$orphanedSubCategories} sub-categories have no indicators");
        } else {
            $this->command->info('  ✓ No orphaned sub-categories (all have indicators)');
        }

        // Validation 3: Check category weight consistency
        foreach ($categoryMapping as $categoryName => $category) {
            $actualWeight = $category->subCategories()
                ->with('indicators')
                ->get()
                ->flatMap(fn ($sub) => $sub->indicators)
                ->sum('weight');

            $expectedWeight = $category->weight;

            if (abs($actualWeight - $expectedWeight) > 0.01) {
                $this->command->warn("  ⚠️  WARNING: Category '{$categoryName}' weight mismatch (expected={$expectedWeight}, actual={$actualWeight})");
            } else {
                $this->command->info("  ✓ Category '{$categoryName}' weight validated ({$expectedWeight})");
            }
        }

        $this->command->newLine();
        $this->command->info('✨ Migration Summary:');
        $categoriesCount = count($categoryMapping);
        $this->command->info("  • Categories created: {$categoriesCount}");
        $this->command->info("  • Sub-categories created: {$totalSubCategories}");
        $this->command->info("  • Indicators migrated: {$migratedCount}");
        $this->command->info("  • Failed migrations: {$failedCount}");
        $this->command->info("  • Remaining legacy indicators: {$remainingLegacy}");
        $this->command->newLine();

        if ($failedCount === 0 && $remainingLegacy === 0) {
            $this->command->info('🎉 v1.0 → v1.1 Migration completed successfully!');
        } else {
            $this->command->error('❌ Migration completed with errors. Please review warnings above.');
        }

        $this->command->newLine();
    }
}
