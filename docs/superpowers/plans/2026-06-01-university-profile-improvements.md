# University Profile Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the university profile page by swapping province/city visual fields, supporting dynamic multiple phone numbers, enforcing a 250-word description limit with counters, and adding a Read More toggle on the public page.

**Architecture:** Database column sizes have been enlarged via migration. We will update controller validations to reflect the new constraints (max 100 characters for phone, max 250 words for description using regex split). The React edit form will manage phone numbers in a dynamic input list state and serialize them as comma-separated values. The public profile page will feature a toggleable truncation block for descriptions exceeding 300 characters.

**Tech Stack:** Laravel, PHP, React, TypeScript, TailwindCSS, Inertia.js

---

### Task 1: Controller Validation Updates

**Files:**
- Modify: `app/Http/Controllers/Admin/UniversityController.php`
- Modify: `app/Http/Controllers/AdminKampus/UniversityController.php`

- [ ] **Step 1: Update validation in Admin UniversityController**

Modify `app/Http/Controllers/Admin/UniversityController.php`. Locate the two validate blocks (usually lines 150 & 270) and replace validation rules for `profile_description` and `phone`:
```php
            'profile_description' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    $wordCount = count(preg_split('/\s+/', trim($value), -1, PREG_SPLIT_NO_EMPTY));
                    if ($wordCount > 250) {
                        $fail('Deskripsi tidak boleh lebih dari 250 kata.');
                    }
                }
            ],
            'phone' => 'nullable|string|max:100',
```

- [ ] **Step 2: Update validation in AdminKampus UniversityController**

Modify `app/Http/Controllers/AdminKampus/UniversityController.php`. Replace validation rules for `profile_description` and `phone`:
```php
            'profile_description' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    $wordCount = count(preg_split('/\s+/', trim($value), -1, PREG_SPLIT_NO_EMPTY));
                    if ($wordCount > 250) {
                        $fail('Deskripsi tidak boleh lebih dari 250 kata.');
                    }
                }
            ],
            'phone' => 'nullable|string|max:100',
```

- [ ] **Step 3: Commit**

```bash
git add app/Http/Controllers/Admin/UniversityController.php app/Http/Controllers/AdminKampus/UniversityController.php
git commit -m "controller: update validation for university phone length and description word count"
```

---

### Task 2: Swap Province and City Select Fields

**Files:**
- Modify: `resources/js/pages/AdminKampus/University/Edit.tsx`

- [ ] **Step 1: Move province above city select block**

Modify `resources/js/pages/AdminKampus/University/Edit.tsx`. Reorder the elements inside the grid layout (`grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3`):
```tsx
                                    <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3">
                                        <div>
                                            <Label htmlFor="province">Provinsi</Label>
                                            <select
                                                id="province"
                                                value={data.province}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setData((prev) => ({
                                                        ...prev,
                                                        province: val,
                                                        city: '',
                                                    }));
                                                    setCities([]);
                                                }}
                                                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                                disabled={isLoadingProvinces}
                                            >
                                                <option value="">{isLoadingProvinces ? 'Memuat...' : 'Pilih Provinsi'}</option>
                                                {provinces.map((prov) => (
                                                    <option key={prov.id} value={prov.name}>
                                                        {prov.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.province} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label htmlFor="city">Kota/Kabupaten</Label>
                                            <select
                                                id="city"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                                disabled={isLoadingCities || !data.province}
                                            >
                                                <option value="">{isLoadingCities ? 'Memuat...' : 'Pilih Kota/Kabupaten'}</option>
                                                {cities.map((city) => (
                                                    <option key={city.id} value={city.name}>
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.city} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label htmlFor="postal_code">Kode Pos</Label>
                                            <Input
                                                id="postal_code"
                                                type="text"
                                                className="mt-1"
                                                value={data.postal_code}
                                                onChange={(e) => setData('postal_code', e.target.value)}
                                            />
                                            <InputError message={errors.postal_code} className="mt-2" />
                                        </div>
                                    </div>
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/pages/AdminKampus/University/Edit.tsx
git commit -m "feat: swap province and city field ordering in university edit form"
```

---

### Task 3: Dynamic Multiple Phone Inputs

**Files:**
- Modify: `resources/js/pages/AdminKampus/University/Edit.tsx`

- [ ] **Step 1: Add phoneNumbers state and effect sync**

Modify `resources/js/pages/AdminKampus/University/Edit.tsx`.
Add state at the top of the component:
```typescript
    const [phoneNumbers, setPhoneNumbers] = useState<string[]>(() => {
        const val = university.phone || '';
        return val ? val.split(', ') : [''];
    });

    const handlePhoneChange = (index: number, value: string) => {
        const newPhones = [...phoneNumbers];
        newPhones[index] = value;
        setPhoneNumbers(newPhones);
        setData('phone', newPhones.filter(Boolean).join(', '));
    };

    const addPhoneField = () => {
        setPhoneNumbers([...phoneNumbers, '']);
    };

    const removePhoneField = (index: number) => {
        const newPhones = phoneNumbers.filter((_, i) => i !== index);
        setPhoneNumbers(newPhones.length > 0 ? newPhones : ['']);
        setData('phone', newPhones.filter(Boolean).join(', '));
    };
```

- [ ] **Step 2: Update rendering of phone inputs**

Replace the single phone input JSX block:
```tsx
                                    <div>
                                        <Label>Nomor Telepon</Label>
                                        <div className="mt-1 space-y-2">
                                            {phoneNumbers.map((phone, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        type="text"
                                                        value={phone}
                                                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                                                        placeholder="Contoh: 021-123456 atau 081234..."
                                                        className="flex-1"
                                                    />
                                                    {phoneNumbers.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                                            onClick={() => removePhoneField(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="mt-1 text-xs border-[#079C4E] text-[#079C4E] hover:bg-emerald-50"
                                                onClick={addPhoneField}
                                            >
                                                + Tambah Nomor Telepon
                                            </Button>
                                        </div>
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/pages/AdminKampus/University/Edit.tsx
git commit -m "feat: implement dynamic multiple phone inputs for university profile"
```

---

### Task 4: Description Word Counter

**Files:**
- Modify: `resources/js/pages/AdminKampus/University/Edit.tsx`

- [ ] **Step 1: Display word counter UI**

Modify `resources/js/pages/AdminKampus/University/Edit.tsx`. Replace description textarea block with word counter logic:
```tsx
                                <div>
                                    <Label htmlFor="profile_description">Deskripsi Singkat</Label>
                                    <textarea
                                        id="profile_description"
                                        className="mt-1 block w-full rounded-md border-border bg-background p-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                        rows={4}
                                        value={data.profile_description}
                                        onChange={(e) => setData('profile_description', e.target.value)}
                                    />
                                    {(() => {
                                        const wordCount = data.profile_description
                                            ? data.profile_description.trim().split(/\s+/).filter(Boolean).length
                                            : 0;
                                        const isOverLimit = wordCount > 250;
                                        return (
                                            <div className="mt-1 flex items-center justify-between text-xs">
                                                <span className={isOverLimit ? "text-destructive font-semibold" : "text-muted-foreground"}>
                                                    {wordCount} / 250 kata
                                                </span>
                                                {isOverLimit && (
                                                    <span className="text-destructive font-semibold">
                                                        Melebihi batas maksimal 250 kata!
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })()}
                                    <InputError message={errors.profile_description} className="mt-2" />
                                </div>
```

- [ ] **Step 2: Prevent form submission if description is over limit**

Update `submit` block in `Edit.tsx`:
```typescript
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const wordCount = data.profile_description
            ? data.profile_description.trim().split(/\s+/).filter(Boolean).length
            : 0;
        if (wordCount > 250) {
            toast.error('Gagal memperbarui profil: Deskripsi melebihi batas 250 kata!');
            return;
        }
        post(route('admin-kampus.university.update'));
    };
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/pages/AdminKampus/University/Edit.tsx
git commit -m "feat: add client-side description word counter and 250-word validation"
```

---

### Task 5: Update University Feature Tests

**Files:**
- Modify: `tests/Feature/AdminKampus/UniversityControllerTest.php`

- [ ] **Step 1: Update limits in UniversityControllerTest validation test**

Modify `tests/Feature/AdminKampus/UniversityControllerTest.php`. Replace the validation test limits for `profile_description` and `phone` to match new constraints:
```php
it('fails validation when fields exceed database limits', function () {
    $payload = [
        'name' => str_repeat('A', 151), // limit 150
        'short_name' => str_repeat('B', 21), // limit 20
        'ptm_code' => str_repeat('C', 11), // limit 10
        'profile_description' => implode(' ', array_fill(0, 251, 'word')), // limit 250 words
        'phone' => str_repeat('1', 101), // limit 100 characters
    ];

    $response = $this->actingAs($this->adminKampus)
        ->from(route('admin-kampus.university.edit'))
        ->put(route('admin-kampus.university.update'), $payload);

    $response->assertSessionHasErrors([
        'name',
        'short_name',
        'ptm_code',
        'profile_description',
        'phone',
    ]);
});
```

- [ ] **Step 2: Run test suite**

Run: `docker exec jurnal-mu-app php artisan test tests/Feature/AdminKampus/UniversityControllerTest.php`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add tests/Feature/AdminKampus/UniversityControllerTest.php
git commit -m "test: update university controller test constraints for word count and phone length"
```

---

### Task 6: Public Profile "Read More" Toggle

**Files:**
- Modify: `resources/js/pages/Browse/UniversityProfile.tsx`

- [ ] **Step 1: Render description card with Read More toggle**

Modify `resources/js/pages/Browse/UniversityProfile.tsx`.
Add state at the top of the component:
```typescript
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
```

Place the card below the stats grid (e.g., above the Trend Chart card around line 267):
```tsx
                {university.profile_description && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-lg">Profil Universitas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                                {(() => {
                                    const text = university.profile_description;
                                    const limit = 300;
                                    if (text.length <= limit) {
                                        return text;
                                    }
                                    return (
                                        <>
                                            {isDescriptionExpanded ? text : `${text.slice(0, limit)}...`}
                                            <button
                                                type="button"
                                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                className="ml-2 font-bold text-[#079C4E] hover:underline focus:outline-none"
                                            >
                                                {isDescriptionExpanded ? 'Lihat Lebih Sedikit' : 'Baca Selengkapnya'}
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                )}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/pages/Browse/UniversityProfile.tsx
git commit -m "feat: add profile description card on public view with toggle read more"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Check unit and feature tests**

Run: `docker exec jurnal-mu-app php artisan test tests/Feature/AdminKampus/UniversityControllerTest.php`
Expected: PASS

- [ ] **Step 2: Check formatting & types**

Run on host:
`npm run format`
`npm run types`
Expected: All clean and compile succeeds.

- [ ] **Step 3: Commit**

```bash
git status
# Commit any styling changes automatically fixed by prettier if any.
```
