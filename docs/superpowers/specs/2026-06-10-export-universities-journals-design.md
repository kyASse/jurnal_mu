# Specification: Export Universities and Journals data to XLSX & CSV

## 1. Requirements & Scope

### Target Capabilities
- **Export Universities List**:
  - Exclusive to **Super Admin** role.
  - Formats: Excel (`.xlsx`) and CSV (`.csv`).
  - Exports *all* records in the database (no pagination or search filters applied).
- **Export Journals List**:
  - Available to both **Super Admin** and **Admin Kampus** roles.
  - Formats: Excel (`.xlsx`) and CSV (`.csv`).
  - **Super Admin** exports *all* journals in the database.
  - **Admin Kampus** exports only journals belonging to *their own university*.

### Libraries Used
- PHP/Laravel package: `spatie/simple-excel` for generating files efficiently via streams.
- Frontend: `lucide-react` for icons, `@/components/ui/dropdown-menu` for selecting export formats.

---

## 2. API / Route Definitions

We will define new routes in [routes/web.php](file:///C:/xampp/htdocs/jurnal_mu/routes/web.php):

### Super Admin Route Group (prefix: `admin`)
- `GET /admin/universities/export/{format}`
  - Controller: `App\Http\Controllers\Admin\UniversityController@export`
  - Name: `admin.universities.export`
  - Validation: `format` must be `xlsx` or `csv`.
- `GET /admin/journals/export/{format}`
  - Controller: `App\Http\Controllers\Admin\JournalController@export`
  - Name: `admin.journals.export`
  - Validation: `format` must be `xlsx` or `csv`.

### Admin Kampus Route Group (prefix: `admin-kampus`)
- `GET /admin-kampus/journals/export/{format}`
  - Controller: `App\Http\Controllers\AdminKampus\JournalController@export`
  - Name: `admin-kampus.journals.export`
  - Validation: `format` must be `xlsx` or `csv`.

---

## 3. Implementation Plan

### A. University Export (Super Admin)
**Controller**: `App\Http\Controllers\Admin\UniversityController`
- Query: `University::orderBy('name')->get()`
- Columns to export:
  1. `ID`
  2. `Kode` (`code`)
  3. `Kode PTM` (`ptm_code`)
  4. `Nama Universitas` (`name`)
  5. `Nama Singkat` (`short_name`)
  6. `Alamat` (`address`)
  7. `Kota` (`city`)
  8. `Provinsi` (`province`)
  9. `Kode Pos` (`postal_code`)
  10. `Telepon` (`phone`)
  11. `Email` (`email`)
  12. `Website` (`website`)
  13. `Status Akreditasi` (`accreditation_status`)
  14. `Klaster` (`cluster`)
  15. `Status Aktif` (`is_active` ? 'Aktif' : 'Tidak Aktif')
  16. `Tanggal Dibuat` (`created_at`)

### B. Journal Export (Super Admin)
**Controller**: `App\Http\Controllers\Admin\JournalController`
- Query: `Journal::with(['university', 'user', 'scientificField'])->orderBy('title')->get()`
- Columns to export:
  1. `ID`
  2. `Judul Jurnal` (`title`)
  3. `ISSN` (`issn`)
  4. `E-ISSN` (`e_issn`)
  5. `URL Jurnal` (`url`)
  6. `Editorial Team URL` (`editorial_team_url`)
  7. `Publisher` (`publisher`)
  8. `Frekuensi` (`frequency`)
  9. `Tahun Terbit Pertama` (`first_published_year`)
  10. `Universitas` (`university->name`)
  11. `Pengelola Jurnal` (`user->name` / `user->email`)
  12. `Bidang Ilmu` (`scientificField->name`)
  13. `SINTA Rank` (`sinta_rank`)
  14. `Mulai Akreditasi` (`accreditation_start_year`)
  15. `Selesai Akreditasi` (`accreditation_end_year`)
  16. `Nomor SK Akreditasi` (`accreditation_sk_number`)
  17. `Tanggal SK Akreditasi` (`accreditation_sk_date`)
  18. `Indeksasi` (implode `indexations`)
  19. `Status Aktif` (`is_active` ? 'Aktif' : 'Tidak Aktif')
  20. `Status Persetujuan` (`approval_status`)
  21. `Tanggal Dibuat` (`created_at`)

### C. Journal Export (Admin Kampus)
**Controller**: `App\Http\Controllers\AdminKampus\JournalController`
- Query: `Journal::with(['university', 'user', 'scientificField'])->forUniversity($authUser->university_id)->orderBy('title')->get()`
- Columns to export: Same columns as Super Admin.

---

## 4. Frontend Integration

We will add a dropdown menu next to the "Add/Tambah" button on each list page using the existing UI components:

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

// Render dropdown next to the main Action Button
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.open(route('[export_route]', 'xlsx'), '_blank')}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
            Export as XLSX
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(route('[export_route]', 'csv'), '_blank')}>
            <FileText className="mr-2 h-4 w-4 text-blue-600" />
            Export as CSV
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```

Pages modified:
- `resources/js/Pages/Admin/Universities/Index.tsx`
- `resources/js/Pages/Admin/Journals/Index.tsx`
- `resources/js/Pages/AdminKampus/Journals/Index.tsx`

---

## 5. Verification Plan

1. **Routing Verification**:
   - Hit `/admin/universities/export/xlsx` to verify Excel download starting.
   - Hit `/admin-kampus/journals/export/csv` as an Admin Kampus to verify CSV download starting, containing only the current university journals.
2. **Permission Verification**:
   - Try accessing `/admin/universities/export/xlsx` as Admin Kampus/User to verify `403 Forbidden`.
3. **Data Integrity**:
   - Verify all DB fields are correctly represented in columns and no active records are missed.
