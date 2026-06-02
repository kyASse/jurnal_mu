# Spec: Dashboard Soft Delete Metrics Correction

## Overview
This specification details the changes required to ensure the Admin Kampus dashboard, Super Admin dashboard, and User dashboard metrics exclude soft-deleted records. Currently, the dashboard aggregates metrics using direct `DB::table` raw queries, which bypasses the automatic global scopes applied by Eloquent's `SoftDeletes` trait.

## Requirements
1. Refactor all queries in `DashboardController.php` that use `DB::table('journals')`, `DB::table('users')`, and `DB::table('journal_assessments')` to use their respective Eloquent models (`Journal`, `User`, `JournalAssessment`).
2. Ensure that in joined queries, soft-deleted checks for the joined tables are added explicitly (e.g. `whereNull('journals.deleted_at')`, `whereNull('universities.deleted_at')`), as Eloquent only automatically scopes the primary model's table.
3. Verify that all dashboard cards, including the pending journals count card for Admin Kampus, correctly display only records that have not been soft deleted (`deleted_at` is null).

## Architecture & Components
- **Modified Controller**: `app/Http/Controllers/DashboardController.php`
  - Import `App\Models\User` and `App\Models\JournalAssessment`.
  - Replace raw `DB::table` calls in the `index` method with model queries.

## Verification Plan
1. **Automated Verification**:
   - Write/update feature tests for dashboard statistics to assert that soft-deleted journals/assessments are excluded from counts.
   - Run tests: `docker exec jurnal-mu-app php artisan test`.
2. **Static Analysis & Style**:
   - Run code style checks: `docker exec jurnal-mu-app ./vendor/bin/pint --test`.
