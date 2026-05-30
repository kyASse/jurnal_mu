# University Profile Approval Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a permanent table section with client-side search and pagination for university profile approvals on the Admin Universities page.

**Architecture:** Add React state for search and pagination inside the index page component. Filter and slice the `pendingUniversities` prop array client-side, rendering a paginated table.

**Tech Stack:** React, Inertia, Lucide icons, Tailwind CSS, shadcn UI Table components.

---

### Task 1: Add Search and Pagination Logic to Component

**Files:**
- Modify: `resources/js/pages/Admin/Universities/Index.tsx`

- [ ] **Step 1: Update Lucide-react imports**
  Add `Clock` and `XCircle` to imports if they are not already imported:
  ```typescript
  import { Search, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
  ```

- [ ] **Step 2: Add component states for search and pagination**
  Add state hooks inside `UniversitiesIndex`:
  ```typescript
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingPage, setPendingPage] = useState(1);
  const pendingPerPage = 5;
  ```

- [ ] **Step 3: Add client-side filtering and slicing logic**
  Add the array filter and slice logic inside the component:
  ```typescript
  const filteredPending = pendingUniversities.filter((uni) => {
      const query = pendingSearch.toLowerCase().trim();
      if (!query) return true;
      return (
          uni.name.toLowerCase().includes(query) ||
          uni.short_name.toLowerCase().includes(query) ||
          uni.code.toLowerCase().includes(query) ||
          (uni.pending_updates.name && uni.pending_updates.name.toLowerCase().includes(query)) ||
          (uni.pending_updates.code && uni.pending_updates.code.toLowerCase().includes(query)) ||
          (uni.pending_updates.ptm_code && uni.pending_updates.ptm_code.toLowerCase().includes(query))
      );
  });

  const totalPendingPages = Math.ceil(filteredPending.length / pendingPerPage);
  const paginatedPending = filteredPending.slice(
      (pendingPage - 1) * pendingPerPage,
      pendingPage * pendingPerPage
  );
  ```

- [ ] **Step 4: Commit state and logic additions**
  Run:
  ```bash
  git add resources/js/pages/Admin/Universities/Index.tsx
  git commit -m "feat: add client-side search and pagination logic for pending universities"
  ```

---

### Task 2: Implement Table UI & Pagination Controls

**Files:**
- Modify: `resources/js/pages/Admin/Universities/Index.tsx`

- [ ] **Step 1: Replace Card-based pending section with permanent Table**
  Find the existing conditional rendering block `{pendingUniversities.length > 0 && ...}` and replace it with:
  ```typescript
  {/* Pending Updates Section */}
  <div className="mb-8 rounded-xl border border-sidebar-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
          <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                  Persetujuan Perubahan Profil Universitas
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                  Setujui atau tolak perubahan informasi/profil dari universitas
              </p>
          </div>
          {pendingUniversities.length > 0 && (
              <Badge variant="outline" className="px-3 py-1.5 text-sm bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400">
                  <Clock className="mr-1.5 h-3.5 w-3.5" />
                  {pendingUniversities.length} Menunggu
              </Badge>
          )}
      </div>

      {/* Search Input */}
      <div className="mb-4 flex max-w-sm gap-2">
          <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                  type="text"
                  placeholder="Cari perubahan universitas..."
                  value={pendingSearch}
                  onChange={(e) => {
                      setPendingSearch(e.target.value);
                      setPendingPage(1);
                  }}
                  className="pl-9 h-9"
              />
          </div>
          {pendingSearch && (
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingSearch('')}
                  className="h-9"
              >
                  Clear
              </Button>
          )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-sidebar-border/70">
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead className="w-1/3">Universitas</TableHead>
                      <TableHead className="w-1/2">Perubahan yang Diajukan</TableHead>
                      <TableHead className="w-[150px] text-right">Aksi</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {paginatedPending.length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                              {pendingUniversities.length === 0
                                  ? 'Tidak ada perubahan profil universitas yang menunggu persetujuan.'
                                  : 'Tidak ada perubahan profil universitas yang cocok dengan pencarian.'}
                          </TableCell>
                      </TableRow>
                  ) : (
                      paginatedPending.map((uni) => (
                          <TableRow key={uni.id}>
                              <TableCell>
                                  <div className="font-medium">{uni.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                      Code: {uni.code} | PTM Code: {uni.ptm_code || '-'}
                                  </div>
                              </TableCell>
                              <TableCell>
                                  <ul className="space-y-1 text-sm">
                                      {uni.pending_updates.name && (
                                          <li>
                                              <span className="text-xs text-muted-foreground font-semibold">Nama: </span>
                                              <span className="line-through text-red-500 mr-2">{uni.name}</span>
                                              <span className="text-green-600 dark:text-green-400 font-medium">{uni.pending_updates.name}</span>
                                          </li>
                                      )}
                                      {uni.pending_updates.code && (
                                          <li>
                                              <span className="text-xs text-muted-foreground font-semibold">Singkatan: </span>
                                              <span className="line-through text-red-500 mr-2">{uni.code}</span>
                                              <span className="text-green-600 dark:text-green-400 font-medium">{uni.pending_updates.code}</span>
                                          </li>
                                      )}
                                      {uni.pending_updates.ptm_code && (
                                          <li>
                                              <span className="text-xs text-muted-foreground font-semibold">Kode PTM: </span>
                                              <span className="line-through text-red-500 mr-2">{uni.ptm_code || '-'}</span>
                                              <span className="text-green-600 dark:text-green-400 font-medium">{uni.pending_updates.ptm_code}</span>
                                          </li>
                                      )}
                                  </ul>
                              </TableCell>
                              <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                      <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleApproval(uni.id, 'reject')}
                                          className="h-8 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/50"
                                      >
                                          <XCircle className="mr-1 h-3.5 w-3.5" /> Tolak
                                      </Button>
                                      <Button
                                          size="sm"
                                          onClick={() => handleApproval(uni.id, 'approve')}
                                          className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                      >
                                          <CheckCircle className="mr-1 h-3.5 w-3.5" /> Setujui
                                      </Button>
                                  </div>
                              </TableCell>
                          </TableRow>
                      ))
                  )}
              </TableBody>
          </Table>
      </div>

      {/* Pagination Controls */}
      {totalPendingPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                  Halaman {pendingPage} dari {totalPendingPages}
              </span>
              <div className="flex gap-1">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingPage((p) => Math.max(p - 1, 1))}
                      disabled={pendingPage === 1}
                  >
                      Sebelumnya
                  </Button>
                  {Array.from({ length: totalPendingPages }, (_, idx) => idx + 1).map((page) => (
                      <Button
                          key={page}
                          variant={pendingPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPendingPage(page)}
                      >
                          {page}
                      </Button>
                  ))}
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingPage((p) => Math.min(p + 1, totalPendingPages))}
                      disabled={pendingPage === totalPendingPages}
                  >
                      Selanjutnya
                  </Button>
              </div>
          </div>
      )}
  </div>
  ```

- [ ] **Step 2: Commit UI updates**
  Run:
  ```bash
  git add resources/js/pages/Admin/Universities/Index.tsx
  git commit -m "feat: implement permanent table UI and pagination controls for pending profile updates"
  ```

---

### Task 3: Verify and Build Production Assets

**Files:**
- Modify: None (build output verification)

- [ ] **Step 1: Check formatting and linting**
  Run: `npm run format:check`
  Run: `npx eslint .`

- [ ] **Step 2: Verify TypeScript compilation**
  Run: `npm run types`

- [ ] **Step 3: Compile production assets**
  Run: `npm run build`
  Expected: Successful Vite compilation.
