# Data Master - Scientific Fields Feature

## Overview
Implementation of the Data Master module specifically for managing **Scientific Fields** (Rumpun Ilmu & Pohon Ilmu). This feature allows Super Admins to perform CRUD operations, view items in a hierarchical structure (Categories and Classifications), and perform bulk data operations via Excel/CSV Import and Export. It also sets up a scalable Data Master dashboard to house future data entities (like Evaluation Indicators and Accreditation Standards).

## Implementation Date
April 18, 2026

## Features Implemented

### ✅ 1. Data Master Dashboard
- **Location**: `/admin/data-master`
- **Features**: A centralized grid dashboard displaying cards for `Scientific Fields` (Active) and placeholders for future implementations (`Evaluation Indicators`, `Accreditation Standards`, `Institution Types`).

### ✅ 2. Scientific Fields Management (CRUD)
- **Hierarchy Structure**: Self-referencing table using `parent_id` to separate top-level categories (Rumpun Ilmu) and sub-classifications (Pohon Ilmu).
- **Tabs Interface**: Split views between Categories and Classifications using `shadcn/ui` tabs.
- **Modals**: Add and Edit forms rendered in a `Dialog`.
- **Validation**: Strict validation (unique code checks) processed via Laravel Form Requests.

### ✅ 3. Bulk Import & Export
- **Export**: Downloads a clean `.xlsx` file containing all scientific fields using `spatie/simple-excel`, streaming the file directly to the browser for performance.
- **Import**: Allows uploading a `.xlsx` or `.csv` file. The backend reads the file line-by-line, dynamically associating parent fields via `parent_code` and performing `updateOrCreate` to prevent duplication while allowing bulk-updates.

### ✅ 4. UI/UX Refinements
- **Scrollable Dropdown**: Fixed an issue in `shadcn/ui`'s `<SelectContent>` where long lists of parent categories were cut off. Added fixed max-height (`max-h-96`) and `overflow-hidden` so the internal `Viewport` triggers smooth scrolling.

---

## File Changes

### Backend

#### 1. **Routes**
**Location**: `routes/web.php`
```php
Route::middleware(['auth', 'role:Super Admin'])->prefix('admin/data-master')->name('admin.data-master.')->group(function () {
    Route::get('/', [DataMasterController::class, 'index'])->name('index');
    
    // Scientific Fields
    Route::post('scientific-fields/import', [ScientificFieldController::class, 'import'])->name('scientific-fields.import');
    Route::get('scientific-fields/export', [ScientificFieldController::class, 'export'])->name('scientific-fields.export');
    Route::resource('scientific-fields', ScientificFieldController::class)->except(['create', 'show', 'edit']);
});
```

#### 2. **ScientificFieldController.php**
**Location**: `app/Http/Controllers/Admin/ScientificFieldController.php`
- **`index`**: Fetches root categories (with children counts) and non-root classifications separately, passing them to Inertia.
- **`store` / `update`**: Handles creation and status toggling.
- **`import`**: Uses `Spatie\SimpleExcel\SimpleExcelReader` to read uploaded files, mapping parents dynamically via `parent_code`.
- **`export`**: Uses `Spatie\SimpleExcel\SimpleExcelWriter` streamed directly to the client.

#### 3. **Form Requests**
**Locations**: 
- `app/Http/Requests/Admin/StoreScientificFieldRequest.php`
- `app/Http/Requests/Admin/UpdateScientificFieldRequest.php`
- `app/Http/Requests/Admin/ImportScientificFieldRequest.php`
- **Features**: Ensures strict role enforcement (`$this->user()->isSuperAdmin()`) and provides robust validation rules.

### Frontend

#### 4. **Data Master Index**
**Location**: `resources/js/pages/Admin/DataMaster/Index.tsx`
- Renders the dashboard using Lucide-react icons and `shadcn/ui` components to present the available Master Data options.

#### 5. **Scientific Fields Page**
**Location**: `resources/js/pages/Admin/DataMaster/ScientificFields/Index.tsx`
- Contains tables divided into Tabs.
- Implements `useForm` from Inertia for Creation, Deletion, and File Uploads (Excel/CSV).
- Uses `sonner` for toast notifications.

#### 6. **Select Component Fix**
**Location**: `resources/js/components/ui/select.tsx`
- Applied UI fix explicitly ensuring `.Viewport` manages large list heights correctly (`max-h-96`) to permit scrolling for selecting Parent Categories.

---

## Automated Testing

To guarantee stability, Role-Based Access Control, and correct Import/Export behaviors, comprehensive Pest tests were established.

### 🧪 Test File
**Location**: `tests/Feature/Admin/DataMaster/ScientificFieldTest.php`

### Covered Scenarios:
1.  **View Access Control**:
    - `allows super admin to view scientific fields index`: Ensures HTTP 200 and checks if categories are passed to the Inertia component correctly.
    - `forbids admin kampus from viewing scientific fields index`: Validates that unauthorized roles receive an HTTP 403 response.

2.  **CRUD Operations**:
    - `allows super admin to create a new scientific field`: Submits a POST payload and asserts that the `scientific_fields` table contains the new data.
    - `allows super admin to update a scientific field`: Validates PUT logic and ensures properties like `is_active` update securely.
    - `allows super admin to delete a scientific field`: Verifies that `destroy` soft-deletes or hard-deletes the field based on model configuration.

3.  **Import / Export (Spatie Simple Excel)**:
    - `allows super admin to export scientific fields`: Mocks existing data, triggers a GET request, and asserts that `scientific_fields.xlsx` is downloaded.
    - `allows super admin to import scientific fields via csv`: Uploads a mock `.csv` using `UploadedFile::fake()` containing multi-level hierarchy data (Item 1 as Parent, Item 2 assigning Item 1 as `parent_code`). Confirms that relationships map accurately into the database.

### Running the Tests
```bash
php artisan test --filter ScientificFieldTest
# OR
vendor/bin/pest --filter ScientificFieldTest
```
*Current test status: 7 tests passed (covering over 20 assertions).*
