# University Logo Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the university logo text input URL fields in the Admin and AdminKampus edit pages with an interactive drag-and-drop file upload zone (Dropzone) that saves uploaded files securely to Laravel storage and updates the database record.

**Architecture:** Use Laravel's file storage system (`Storage::disk('public')->store(...)`) for handling uploads. In the Inertia React frontend, add a `logo_file` key to `useForm` and convert form submissions to POST with `_method: 'put'` to enable file upload while preserving PHP PUT semantics.

**Tech Stack:** Laravel, Inertia.js, React, Tailwind CSS, Lucide Icons

---

### Task 1: Update Admin UniversityController

**Files:**
- Modify: `app/Http/Controllers/Admin/UniversityController.php`

- [ ] **Step 1: Update validate rules and file upload logic in `update` method**
  Edit `app/Http/Controllers/Admin/UniversityController.php` inside the `update` method to validate `logo_file` as an image and handle storage/deletion.
  
  ```php
  // In app/Http/Controllers/Admin/UniversityController.php update method:
  $validated = $request->validate([
      'code' => 'required|string|max:20|unique:universities,code,'.$university->id,
      'ptm_code' => 'nullable|string|max:10|unique:universities,ptm_code,'.$university->id,
      'name' => 'required|string|max:255',
      'short_name' => 'nullable|string|max:100',
      'address' => 'nullable|string',
      'city' => 'nullable|string|max:100',
      'province' => 'nullable|string|max:100',
      'postal_code' => 'nullable|string|max:10',
      'phone' => 'nullable|string|max:20',
      'email' => 'nullable|email|max:255',
      'website' => 'nullable|url|max:255',
      'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
      'accreditation_status' => 'nullable|string|max:50',
      'cluster' => 'nullable|string|max:50',
      'profile_description' => 'nullable|string|max:250',
      'is_active' => 'boolean',
  ]);

  if ($request->hasFile('logo_file')) {
      // Delete old logo if it exists in storage
      if ($university->logo_url && \Illuminate\Support\Str::startsWith($university->logo_url, '/storage/logos/')) {
          $oldPath = str_replace('/storage/', '', $university->logo_url);
          \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
      }
      
      $file = $request->file('logo_file');
      $filename = 'logo_'.$university->id.'_'.time().'.'.$file->extension();
      $path = $file->storeAs('logos', $filename, 'public');
      $validated['logo_url'] = '/storage/'.$path;
  }
  
  // Unset logo_file before updating database model if logo_url was set
  unset($validated['logo_file']);

  $university->update($validated);
  ```

- [ ] **Step 2: Commit changes**
  ```bash
  git add app/Http/Controllers/Admin/UniversityController.php
  git commit -m "backend: add logo file upload handling in admin university controller"
  ```

---

### Task 2: Update AdminKampus UniversityController

**Files:**
- Modify: `app/Http/Controllers/AdminKampus/UniversityController.php`

- [ ] **Step 1: Update validate rules, model fields saving, and file upload logic in `update` method**
  Edit `app/Http/Controllers/AdminKampus/UniversityController.php` to validate `logo_file`, allow all other newly added university profile fields, and handle file upload/storage.
  
  ```php
  // In app/Http/Controllers/AdminKampus/UniversityController.php update method:
  $validated = $request->validate([
      'name' => 'nullable|string|max:255',
      'code' => 'nullable|string|max:20',
      'ptm_code' => 'nullable|string|max:20',
      'short_name' => 'nullable|string|max:100',
      'profile_description' => 'nullable|string',
      'website' => 'nullable|url|max:255',
      'email' => 'nullable|email|max:255',
      'phone' => 'nullable|string|max:50',
      'address' => 'nullable|string',
      'city' => 'nullable|string|max:100',
      'province' => 'nullable|string|max:100',
      'postal_code' => 'nullable|string|max:10',
      'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
      'accreditation_status' => 'nullable|string|max:50',
      'cluster' => 'nullable|string|max:50',
  ]);

  if ($request->hasFile('logo_file')) {
      // Delete old logo if it exists in storage
      if ($university->logo_url && \Illuminate\Support\Str::startsWith($university->logo_url, '/storage/logos/')) {
          $oldPath = str_replace('/storage/', '', $university->logo_url);
          \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
      }
      
      $file = $request->file('logo_file');
      $filename = 'logo_'.$university->id.'_'.time().'.'.$file->extension();
      $path = $file->storeAs('logos', $filename, 'public');
      $validated['logo_url'] = '/storage/'.$path;
  }
  
  unset($validated['logo_file']);

  $pendingUpdates = $university->pending_updates ?? [];
  $hasPendingUpdates = false;

  // Check if restricted fields are modified
  $restrictedFields = ['name', 'code', 'ptm_code'];
  foreach ($restrictedFields as $field) {
      if (isset($validated[$field]) && $validated[$field] !== $university->$field) {
          $pendingUpdates[$field] = $validated[$field];
          $hasPendingUpdates = true;
      }
      unset($validated[$field]); // Remove from direct update
  }

  if ($hasPendingUpdates) {
      $validated['pending_updates'] = $pendingUpdates;
      $message = 'Profil Universitas berhasil diperbarui. Perubahan nama, singkatan, atau kode universitas sedang menunggu persetujuan Dikti.';
  } else {
      $message = 'Profil Universitas berhasil diperbarui.';
  }

  $university->update($validated);
  ```

- [ ] **Step 2: Commit changes**
  ```bash
  git add app/Http/Controllers/AdminKampus/UniversityController.php
  git commit -m "backend: add logo file upload and extra profile fields validation in admin-kampus university controller"
  ```

---

### Task 3: Update Admin Universities Edit Page UI

**Files:**
- Modify: `resources/js/pages/Admin/Universities/Edit.tsx`

- [ ] **Step 1: Update `useForm` initialization and implement drag-and-drop file upload UI**
  Update `resources/js/pages/Admin/Universities/Edit.tsx` to handle file uploads.
  - Import `UploadCloud`, `X`, `Image` icons from `lucide-react`.
  - Add `logo_file: null` to the `useForm` hook initialization.
  - Change submit handler from `put(route('admin.universities.update', university.id))` to `post(route('admin.universities.update', university.id))` with data containing `_method: 'PUT'`.
  - Replace the existing `logo_url` text Input with a premium drag-and-drop Dropzone component containing previews and interactive hover states.

  Code changes:
  ```typescript
  // Update submit handler:
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      post(route('admin.universities.update', university.id), {
          _method: 'PUT',
          onSuccess: () => {
              toast.success('University updated successfully');
          },
          onError: () => {
              toast.error('Failed to update university. Please check the form for errors.');
          },
      });
  };
  ```

  Dropzone component layout replacement inside form:
  ```tsx
  <div>
      <Label htmlFor="logo_file">Logo Universitas</Label>
      <div className="mt-2">
          {/* Preview & Upload Dropzone */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Logo Preview */}
              {(data.logo_file || university.logo_url) ? (
                  <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-muted bg-neutral-50 p-2 dark:bg-neutral-900">
                      <img
                          src={data.logo_file ? URL.createObjectURL(data.logo_file) : university.logo_url}
                          alt="Logo Preview"
                          className="h-full w-full object-contain"
                      />
                      <button
                          type="button"
                          onClick={() => {
                              setData('logo_file', null);
                              // Keep track if they want to clear or if they upload next, we keep existing logo_url if no file is chosen
                          }}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 focus:outline-none"
                      >
                          <X className="h-3 w-3" />
                      </button>
                  </div>
              ) : (
                  <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-muted bg-neutral-50 text-muted-foreground dark:bg-neutral-900">
                      <Image className="h-8 w-8 stroke-neutral-400" />
                  </div>
              )}

              {/* Dropzone area */}
              <div 
                  className="relative flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-4 text-center transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950/20 dark:hover:bg-neutral-950/40 cursor-pointer"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                          setData('logo_file', file);
                      } else {
                          toast.error('Harap unggah file gambar saja.');
                      }
                  }}
                  onClick={() => document.getElementById('logo-file-input')?.click()}
              >
                  <input
                      id="logo-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setData('logo_file', file);
                      }}
                  />
                  <UploadCloud className="mb-2 h-8 w-8 text-neutral-400 dark:text-neutral-600" />
                  <p className="text-sm font-medium text-foreground">
                      Tarik & lepas file di sini, atau klik untuk memilih file
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG, JPEG atau GIF (Maks. 2MB)
                  </p>
              </div>
          </div>
      </div>
      {errors.logo_file && <p className="mt-1 text-sm text-red-600">{errors.logo_file}</p>}
  </div>
  ```

- [ ] **Step 2: Commit changes**
  ```bash
  git add resources/js/pages/Admin/Universities/Edit.tsx
  git commit -m "frontend: implement logo upload dropzone component in admin universities edit"
  ```

---

### Task 4: Update AdminKampus University Edit Page UI

**Files:**
- Modify: `resources/js/pages/AdminKampus/University/Edit.tsx`

- [ ] **Step 1: Update `useForm` initialization and implement drag-and-drop file upload UI**
  Update `resources/js/pages/AdminKampus/University/Edit.tsx` to handle file uploads.
  - Import `UploadCloud`, `X`, `Image` icons from `lucide-react`.
  - Add `logo_file: null` to the `useForm` hook initialization.
  - Update `submit` callback to use `post` method with `_method: 'put'` in the data.
  - Replace the existing `logo_url` text Input with a matching premium drag-and-drop Dropzone component.

  Code changes:
  ```typescript
  // Update submit handler:
  const submit: FormEventHandler = (e) => {
      e.preventDefault();
      // Inertia handles files properly via post request with spoofed method
      post(route('admin-kampus.university.update'), {
          data: {
              ...data,
              _method: 'PUT'
          }
      });
  };
  ```
  Wait, using Inertia's `useForm` hook, the `post` function accepts the parameters: `post(url, options)`. To include the spoofed `_method: 'PUT'`, we should define it in the `useForm` fields or explicitly merge it or spoof it by setting the data directly.
  Actually, since `useForm` includes `data`, we can do:
  ```typescript
  // Better approach with Inertia useForm:
  // Add _method: 'PUT' directly in the useForm data, so Inertia's post helper automatically serializes it as multipart/form-data with POST request and _method=PUT.
  ```
  Let's define `_method: 'PUT'` inside the `useForm` fields! Or we can use `router.post(route('admin-kampus.university.update'), { ...data, _method: 'PUT' })`.
  Wait, `useForm` has its own `post` method: `post(url, options)`.
  If we define `_method: 'PUT'` in `useForm` fields:
  ```typescript
  const { data, setData, post, processing, errors } = useForm({
      ...
      _method: 'PUT',
  });
  ```
  And then simply call:
  `post(route('admin-kampus.university.update'));`
  This is extremely clean and works perfectly with Inertia's form helper! Let's do this for both Tasks 3 and 4!

  Let's write this clearly in the code design.
  Let's replace the `logo_url` field in `AdminKampus/University/Edit.tsx`:
  ```tsx
  <div className="md:col-span-2">
      <Label htmlFor="logo_file">Logo Universitas</Label>
      <div className="mt-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {(data.logo_file || university.logo_url) ? (
                  <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-muted bg-neutral-50 p-2 dark:bg-neutral-900">
                      <img
                          src={data.logo_file ? URL.createObjectURL(data.logo_file) : university.logo_url}
                          alt="Logo Preview"
                          className="h-full w-full object-contain"
                      />
                      <button
                          type="button"
                          onClick={() => {
                              setData('logo_file', null);
                          }}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 focus:outline-none"
                      >
                          <X className="h-3 w-3" />
                      </button>
                  </div>
              ) : (
                  <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-muted bg-neutral-50 text-muted-foreground dark:bg-neutral-900">
                      <Image className="h-8 w-8 stroke-neutral-400" />
                  </div>
              )}

              <div 
                  className="relative flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-4 text-center transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950/20 dark:hover:bg-neutral-950/40 cursor-pointer"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                          setData('logo_file', file);
                      }
                  }}
                  onClick={() => document.getElementById('logo-file-input')?.click()}
              >
                  <input
                      id="logo-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setData('logo_file', file);
                      }}
                  />
                  <UploadCloud className="mb-2 h-8 w-8 text-neutral-400 dark:text-neutral-600" />
                  <p className="text-sm font-medium text-foreground">
                      Tarik & lepas file di sini, atau klik untuk memilih file
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG, JPEG atau GIF (Maks. 2MB)
                  </p>
              </div>
          </div>
      </div>
      <InputError message={errors.logo_file} className="mt-2" />
  </div>
  ```

- [ ] **Step 2: Commit changes**
  ```bash
  git add resources/js/pages/AdminKampus/University/Edit.tsx
  git commit -m "frontend: implement logo upload dropzone component in admin-kampus university edit"
  ```
