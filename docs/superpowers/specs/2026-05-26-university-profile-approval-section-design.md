# Design Spec: Permanent University Profile Approval Section

We are updating the Admin Universities index page to feature a permanent section for approving university profile updates. This section will use a Table layout, supporting client-side search and pagination, similar to the LPPM Admin approval page.

## Proposed Changes

We will modify [Universities/Index.tsx](file:///C:/xampp/htdocs/jurnal_mu/resources/js/pages/Admin/Universities/Index.tsx) as follows:

### Frontend Components & State
1. **Search and Pagination State**:
   * Add React states: `pendingSearch` (string), `pendingPage` (number), and `pendingPerPage` (constant 5).
2. **Filtering & Slicing**:
   * Implement client-side filtering on the `pendingUniversities` array using the search query (matching name, code, short_name, or values inside `pending_updates`).
   * Slice the filtered array for rendering the current page of items.
3. **Table View**:
   * Replace the conditional Card Grid with a permanent table.
   * Columns: **Universitas** (shows current details), **Perubahan yang Diajukan** (shows comparison of old vs new values), and **Aksi** (Approve/Reject buttons).
   * Render an empty state row if no pending updates match the current filter or if the list is empty.
4. **Pagination UI**:
   * Render page selection buttons below the table when the filtered results span more than 1 page.

## Data Structures

The structure of the `pendingUniversities` prop remains unchanged:
```typescript
interface PendingUniversity {
    id: number;
    name: string;
    code: string;
    ptm_code: string;
    short_name: string;
    pending_updates: Record<string, string>;
}
```

## UI Wireframe (Text Mockup)

```
+-----------------------------------------------------------------------------------+
| [AlertCircle] Persetujuan Perubahan Profil Universitas         [5 Menunggu]       |
| Setujui atau tolak perubahan informasi/profil dari universitas                    |
|                                                                                   |
|  [Search] Cari perubahan universitas...                                           |
|                                                                                   |
|  +---------------------+-----------------------------------+--------------------+ |
|  | Universitas         | Perubahan yang Diajukan           | Aksi               | |
|  +---------------------+-----------------------------------+--------------------+ |
|  | Universitas A       | Nama: ~~Old~~ -> New              | [Tolak] [Setujui]  | |
|  | Code: UA            | Singkatan: ~~UA~~ -> UAX          |                    | |
|  +---------------------+-----------------------------------+--------------------+ |
|                                                                                   |
|  Halaman 1 dari 1                                                                 |
+-----------------------------------------------------------------------------------+
```

## Verification & Testing

* **Manual verification**: Open the Admin Universities page, verify the section is always visible (even with no pending changes), test searching, and verify pagination controls.
* **Unit tests**: Ensure existing profile approval tests (`tests/Feature/Admin/UniversityControllerTest.php` or similar) continue to pass.
