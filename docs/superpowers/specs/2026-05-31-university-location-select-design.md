# Standardized City and Province Selection for University Profile

## 1. Overview
Standardize `city` and `province` inputs on the University Profile Edit page (`/admin-kampus/university/edit`). Instead of free text inputs, users will select from standardized dropdowns based on database records of Indonesian provinces and cities.

## 2. Database Schema

### Table: `provinces`
* `id`: UNSIGNED BIGINT, Primary Key
* `name`: VARCHAR(100), Not Null
* `created_at` / `updated_at`: Timestamps

### Table: `cities`
* `id`: UNSIGNED BIGINT, Primary Key
* `province_id`: UNSIGNED BIGINT, Foreign Key referencing `provinces.id` with CASCADE on delete
* `name`: VARCHAR(100), Not Null
* `created_at` / `updated_at`: Timestamps

### Table: `universities`
* Columns `province` and `city` remain `VARCHAR` storing text names. This maintains backwards compatibility and keeps CSV imports simple.

## 3. Data Seeding
* Data will be loaded via `database/data/indonesian_regions.json` containing 38 provinces and their respective cities.
* A seeder class `Database\Seeders\IndonesianRegionsSeeder` will parse this JSON and populate the `provinces` and `cities` tables.

## 4. Backend Endpoints (API)
Authentication required via web auth middleware (session).

### `GET /api/locations/provinces`
* Returns all provinces: `id` and `name`.

### `GET /api/locations/provinces/{province_id}/cities`
* Returns all cities in the given province: `id` and `name`.

## 5. Frontend UI / React Changes
In [Edit.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/AdminKampus/University/Edit.tsx):
* Initialize state:
  * `provinces`: list of all provinces.
  * `cities`: list of cities for the selected province.
* On page load (`useEffect`):
  * Fetch all provinces.
  * If the university already has a `province` name set in the database:
    * Match the string to find its `id` in the fetched list.
    * Fetch the cities for that province ID.
* Province `<select>` input:
  * Value bound to `data.province` (name string).
  * `onChange`:
    * Look up province `id` matching selected name.
    * Fetch cities for that `id`.
    * Update form state: `setData({ province: selectedName, city: '' })`.
* City `<select>` input:
  * Value bound to `data.city` (name string).
  * Options populated from `cities` state array.
  * Disabled when no province is selected.

## 6. Testing Strategy
* Unit test for API endpoints:
  * Authenticated user can fetch provinces/cities.
  * Unauthenticated user is blocked (401/302 redirect to login).
* Feature test for Profile Update:
  * Validates that standard profile updates succeed using names chosen from the seeder.
