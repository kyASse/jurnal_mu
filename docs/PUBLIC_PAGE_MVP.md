# Public Page MVP Plan - Jurnal_Mu

## Overview
Dokumen ini menjelaskan MVP (Minimum Viable Product) untuk public page Jurnal_Mu, sebuah platform manajemen dan penilaian jurnal akademik untuk Perguruan Tinggi Muhammadiyah (PTM) di Indonesia. Public page ini akan menjadi pintu gerbang informasi untuk pengunjung umum, peneliti, dan stakeholder yang ingin mengeksplorasi jurnal-jurnal yang terdaftar dalam sistem.

**Referensi Utama**: [MAJU UAD](https://maju.uad.ac.id/) - Management and Assessment of UAD Journals  
**Referensi Sekunder**: [Taylor & Francis Online](https://www.tandfonline.com/) - International journal platform

---

## Implementation Status Summary

### ✅ COMPLETED (Ready for Production)
- **Landing Page / Homepage** - 75% complete (missing: University section)
- **Journal Listing Page** - 95% complete (missing: empty state messages)
- **Backend Controller** - 100% complete (PublicJournalController with index + show)
- **Statistics & Featured Journals** - 100% complete
- **Public Routing** - 100% complete
- **Database Scopes** - 100% complete

### ⚠️ IN PROGRESS / NEEDS COMPLETION
- **Journal Detail Page** - 50% complete (backend ready, frontend page not created yet)
- **SEO & Performance** - 20% complete (needs meta tags, structured data, sitemap)
- **Mobile Responsiveness** - 70% complete (responsive layout in place)

### ❌ NOT STARTED
- **About Page** - 0% complete
- **Contact Page** - 0% complete
- **Breadcrumbs Component** - 0% complete
- **View Counter Implementation** - 0% complete
- **Empty State Messages** - 0% complete
- **University Section on Homepage** - 0% complete

### 📊 Overall Progress
**Features Implemented: 6/13 (46%)**  
**Backend Ready: 8/13 (62%)**  
**Estimated Effort Remaining: 3-4 weeks**

---

## 1. Tujuan Public Page

### 1.1 Target Pengguna
- **Peneliti & Akademisi**: Mencari jurnal untuk publikasi atau referensi
- **Pembaca Umum**: Mengakses informasi jurnal akademik PTM
- **Stakeholder Institusi**: Universitas, Kemenristekdikti, LLDIKTI
- **Calon Penulis**: Mengetahui persyaratan dan akreditasi jurnal

### 1.2 Value Proposition
- **Transparansi**: Menampilkan akreditasi dan metadata jurnal secara terbuka
- **Aksesibilitas**: Memudahkan pencarian jurnal PTM di satu platform terpadu
- **Kredibilitas**: Menampilkan data akurat dari database terpusat

---

## 2. Fitur MVP (Prioritas)

### 2.1 Landing Page / Homepage ⭐⭐⭐ (Critical)

**Status**: ✅ **IMPLEMENTED** - Di `welcome.tsx` dengan route `/` (home)

#### Komponen Utama:
1. **Hero Section**
   - ✅ Judul: "Jurnal_Mu - Platform Manajemen Jurnal PTM"
   - ✅ Tagline: "Sistem Terpadu Manajemen dan Penilaian Jurnal Ilmiah Perguruan Tinggi Muhammadiyah"
   - ✅ Search Bar (prominent position)
   - ✅ CTA Button: "Jelajahi Jurnal", "Login", "Register"
   - ✅ Beautiful gradient background dengan pattern overlay

2. **Statistics Section** (inspirasi dari MAJU UAD)
   - ✅ Total jurnal terdaftar (totalJournals prop)
   - ✅ Breakdown by SINTA rank (sintaStats: 1-6)
   - ✅ SINTA rank cards yang clickable (filter ke /journals)
   - ✅ Total universitas tergabung (totalUniversities prop)

3. **Featured Journals Section**
   - ✅ Grid layout (responsive 1-4 kolom)
   - ✅ Tampilkan jurnal unggulan (SINTA 1-2)
   - ✅ Card jurnal berisi:
     - ✅ Cover image jurnal
     - ✅ Nama jurnal (title)
     - ✅ ISSN & E-ISSN
     - ✅ SINTA badge (sinta_rank_label)
     - ✅ Universitas pemilik
     - ✅ Indexation labels (Scopus, DOAJ, dll)
     - ✅ Button "More Details" → ke `/journals/{id}`

4. **University Section**
   - ⚠️ List universitas PTM yang bergabung - **NOT YET**
   - ⚠️ Jumlah jurnal per universitas - **NOT YET**
   - ⚠️ Link ke halaman jurnal universitas - **NOT YET**

5. **Navbar**
   - ✅ Logo & Brand name (JurnalMu)
   - ✅ Navigation menu (Beranda, Jurnal, etc.)
   - ✅ Search functionality
   - ✅ Login/Register buttons
   - ✅ Dashboard link (jika sudah login)

#### Referensi Design:
- ✅ **MAJU UAD**: Layout card grid, filter by SINTA, pagination
- ✅ **Taylor & Francis**: Clean, professional, focus on search

---

### 2.2 Journal Listing Page ⭐⭐⭐ (Critical)

**Status**: ✅ **IMPLEMENTED** - Di `Journals/Index.tsx` dengan route `/journals`

#### URL: `/journals`

#### Features:
1. **Filter & Search**
   - ✅ Search by: Nama jurnal (title), ISSN, E-ISSN
   - ✅ Filter by:
     - ✅ Universitas (university_id)
     - ✅ Bidang keilmuan (scientific_field_id)
     - ✅ SINTA rank (1-6)
     - ✅ Akreditasi DIKTI (accreditation_grade)
     - ✅ Indexation platform (Scopus, DOAJ, dll)
     - ✅ Status (Aktif/Tidak Aktif - hanya active yang ditampilkan)
   - ✅ Sort by: Nama (A-Z default)

2. **Journal Grid**
   - ✅ Responsive grid (1-4 kolom tergantung screen size)
   - ✅ Pagination (12 jurnal per halaman)
   - ✅ Card layout dengan:
     - ✅ Thumbnail/cover image
     - ✅ Nama Jurnal (title)
     - ✅ ISSN & E-ISSN
     - ✅ SINTA badge
     - ✅ Universitas
     - ✅ Scientific field
     - ✅ [More Details] button → ke `/journals/{id}`

3. **Empty State**
   - ⚠️ Pesan jika tidak ada hasil - **NOT YET**
   - ⚠️ Saran untuk mengubah filter - **NOT YET**

4. **Breadcrumbs & Navigation**
   - ✅ Navbar dengan search
   - ✅ Pagination links (prev/next)
   - ⚠️ Breadcrumbs (Home > Journals) - **NOT YET**

#### Technical:
- ✅ Menggunakan `PublicJournalController@index`
- ✅ Join dengan `universities` dan `scientific_fields`
- ✅ Implementasi dengan Laravel pagination + Inertia.js
- ✅ Eager loading relationships
- ✅ Query string preserved dalam pagination

---

### 2.3 Journal Detail Page ⭐⭐⭐ (Critical)

**Status**: ⚠️ **PARTIALLY IMPLEMENTED** - Controller method exists but frontend page not yet created

#### URL: `/journals/{id}`

#### Backend (✅ READY):
- ✅ `PublicJournalController@show()` method implemented
- ✅ All metadata fields prepared: title, ISSN, publisher, frequency, editor_in_chief, email, sinta_rank, accreditation details

#### Frontend (❌ NEEDS CREATION):
Need to create: `resources/js/pages/Journals/Show.tsx`

#### Sections (Planned):
1. **Header Section**
   - Cover image jurnal (large)
   - Nama jurnal (H1 - title)
   - ISSN (Print & Online)
   - Akreditasi badge (SINTA, Scopus, dll)
   - University affiliation

2. **Metadata Section** (2-column layout)
   
   **Left Column:**
   - ✅ Editor in Chief (editor_in_chief) - backend ready
   - ✅ Publisher (publisher) - backend ready
   - ✅ Frequency (frequency, frequency_label) - backend ready
   - ✅ Year Established (first_published_year) - backend ready
   - ⚠️ Language (bahasa) - NOT YET
   - ✅ SINTA Rank & Score (sinta_rank, sinta_rank_label) - backend ready

   **Right Column:**
   - ✅ Scientific Field (scientificField) - backend ready
   - ✅ Website URL (url) - backend ready
   - ✅ Email kontak (email) - backend ready
   - ⚠️ DOI prefix - NOT YET
   - ⚠️ OAI-PMH URL - NOT YET
   - ✅ Accreditation Status & Grade (accreditation_status, accreditation_grade) - backend ready

3. **About Section**
   - ⚠️ Deskripsi jurnal - NOT IN CONTROLLER YET
   - ⚠️ Scope & Focus - NOT IN CONTROLLER YET
   - ⚠️ Target audience - NOT IN CONTROLLER YET

4. **Indexing & Accreditation**
   - ✅ List semua indexing (akan diambil dari indexed_in field)
   - ⚠️ Akreditasi history - NOT YET
   - ✅ Link ke SINTA/Arjuna

5. **Statistics** (if available)
   - ⚠️ Total artikel published - NOT YET
   - ⚠️ Citation metrics - NOT YET
   - ⚠️ Download statistics - NOT YET

6. **External Links**
   - ✅ Button: "Visit Journal Website"
   - ✅ Button: "View on SINTA"
   - ⚠️ Social media links - NOT YET

7. **Breadcrumbs**
   - ❌ Home > Journals > {Journal Name} - NOT YET

#### Data Source:
- ✅ `journals` table (all fields available via PublicJournalController@show)
- ⚠️ `journal_indexations` table - PARTIAL (indexed_in field in journals table used)
- ⚠️ `journal_accreditations` table - NOT YET (accreditation_grade field used)

---

### 2.4 About Page ⭐⭐ (Important)

**Status**: ❌ **NOT IMPLEMENTED**

#### URL: `/about`

#### Content:
1. **What is Jurnal_Mu**
   - Penjelasan platform
   - Visi & Misi
   - Tujuan sistem

2. **For PTM Institutions**
   - Manfaat untuk universitas
   - Cara bergabung
   - Kontak admin

3. **Statistics**
   - Total universitas tergabung
   - Total jurnal terdaftar
   - Growth over time (chart/infographic)

4. **Features Overview**
   - Self-assessment system
   - Multi-level management
   - Transparent reporting

#### Referensi:
- MAJU UAD "About" section (simple, to the point)

---

### 2.5 Contact Page ⭐⭐ (Important)

**Status**: ❌ **NOT IMPLEMENTED**

#### URL: `/contact`

#### Content:
1. **Contact Information**
   - Email: support@jurnal_mu.id (example)
   - Phone: xxx-xxx-xxxx
   - Address: LLDIKTI or central office

2. **Contact Form** (optional for MVP)
   - Name
   - Email
   - Subject
   - Message
   - Submit button

3. **External Links**
   - Link ke LLDIKTI
   - Link ke Kemenristekdikti
   - Link ke ARJUNA
   - Link ke SINTA

#### Referensi:
- MAJU UAD contact section

---

## 3. Desain & UI/UX

### 3.1 Design Principles
1. **Clean & Professional**: Seperti Taylor & Francis, fokus pada konten
2. **Easy Navigation**: Menu jelas, breadcrumbs, sticky header
3. **Mobile-First**: Responsive design untuk semua device
4. **Fast Loading**: Optimasi gambar, lazy loading

### 3.2 Color Scheme
- **Primary**: Hijau (PTM identity) - `#2E7D32`
- **Secondary**: Emas/Gold - `#FFA000`
- **Accent**: Biru (trust & professional) - `#1976D2`
- **Background**: White/Light Gray - `#F5F5F5`
- **Text**: Dark Gray - `#333333`

### 3.3 Layout Components (using shadcn/ui)
- **Header**: Sticky navigation with logo, menu, search, login
- **Footer**: Multi-column (About, Links, Contact, Social)
- **Cards**: Journal cards with hover effects
- **Badges**: SINTA rank, indexing status
- **Buttons**: Primary (CTA), Secondary (links)
- **Forms**: Search, filter, contact form

### 3.4 Typography
- **Headings**: Inter/Poppins (bold, clean)
- **Body**: Open Sans/Roboto (readable)
- **Sizes**: 
  - H1: 2.5rem
  - H2: 2rem
  - H3: 1.5rem
  - Body: 1rem
  - Small: 0.875rem

---

## 4. Navigasi & Struktur

### 4.1 Main Navigation (Header)
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Jurnal_Mu    Beranda  Jurnal  Tentang  Kontak   │
│                     [Search Bar]          [Login]       │
└─────────────────────────────────────────────────────────┘
```

Menu Items:
- **Beranda**: `/` (Homepage)
- **Jurnal**: `/journals` (Listing page)
- **Tentang**: `/about` (About page)
- **Kontak**: `/contact` (Contact page)
- **Login**: `/login` (untuk admin/user)

### 4.2 Footer Navigation
**Column 1: Tentang Kami**
- Tentang Jurnal_Mu
- Visi & Misi
- Tim Kami

**Column 2: Jurnal**
- Semua Jurnal
- Jurnal by SINTA
- Universitas Anggota

**Column 3: Informasi**
- FAQ
- Panduan
- Kebijakan Privasi

**Column 4: Kontak & External Links**
- Email & Phone
- SINTA
- ARJUNA
- Kemenristekdikti
- Social Media Icons

---

## 5. Technical Implementation

### 5.1 Routes (tambahan untuk public pages)

**File**: `routes/web.php`

```php
// Public Routes (no authentication required)
Route::get('/', [PublicController::class, 'home'])->name('public.home');
Route::get('/journals', [PublicController::class, 'journals'])->name('public.journals');
Route::get('/journals/{journal:id}', [PublicController::class, 'journalDetail'])->name('public.journal.detail');
Route::get('/about', [PublicController::class, 'about'])->name('public.about');
Route::get('/contact', [PublicController::class, 'contact'])->name('public.contact');
Route::post('/contact', [PublicController::class, 'submitContact'])->name('public.contact.submit');

// University specific journals
Route::get('/universities/{university:id}/journals', [PublicController::class, 'universityJournals'])->name('public.university.journals');
```

### 5.2 Controller

**File**: `app/Http/Controllers/PublicController.php`

```php
namespace App\Http\Controllers;

use App\Models\Journal;
use App\Models\University;
use Inertia\Inertia;

class PublicController extends Controller
{
    public function home()
    {
        $stats = [
            'total_journals' => Journal::active()->count(),
            'by_sinta' => Journal::active()
                ->selectRaw('sinta_rank, COUNT(*) as count')
                ->groupBy('sinta_rank')
                ->pluck('count', 'sinta_rank'),
            'total_universities' => University::active()->count(),
        ];

        $featuredJournals = Journal::active()
            ->with(['university', 'scientificField'])
            ->whereIn('sinta_rank', [1, 2, 3])
            ->latest()
            ->take(12)
            ->get();

        return Inertia::render('Public/Home', [
            'stats' => $stats,
            'featuredJournals' => $featuredJournals,
        ]);
    }

    public function journals(Request $request)
    {
        $query = Journal::active()
            ->with(['university', 'scientificField']);

        // Search
        if ($search = $request->search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('issn_print', 'like', "%{$search}%")
                  ->orWhere('issn_online', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($request->university_id) {
            $query->where('university_id', $request->university_id);
        }

        if ($request->scientific_field_id) {
            $query->where('scientific_field_id', $request->scientific_field_id);
        }

        if ($request->sinta_rank) {
            $query->where('sinta_rank', $request->sinta_rank);
        }

        // Sorting
        $sortBy = $request->get('sort', 'name');
        $sortOrder = $request->get('order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $journals = $query->paginate(24);

        return Inertia::render('Public/Journals/Index', [
            'journals' => $journals,
            'filters' => [
                'search' => $request->search,
                'university_id' => $request->university_id,
                'scientific_field_id' => $request->scientific_field_id,
                'sinta_rank' => $request->sinta_rank,
            ],
            'universities' => University::active()->get(),
            'scientificFields' => ScientificField::all(),
        ]);
    }

    public function journalDetail(Journal $journal)
    {
        $journal->load([
            'university',
            'scientificField',
            'indexations',
        ]);

        return Inertia::render('Public/Journals/Detail', [
            'journal' => $journal,
        ]);
    }

    public function about()
    {
        return Inertia::render('Public/About');
    }

    public function contact()
    {
        return Inertia::render('Public/Contact');
    }

    public function submitContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        // Send email atau simpan ke database
        // Mail::to('admin@jurnal_mu.id')->send(new ContactFormMail($validated));

        return back()->with('success', 'Pesan Anda telah terkirim!');
    }

    public function universityJournals(University $university)
    {
        $journals = Journal::active()
            ->where('university_id', $university->id)
            ->with(['scientificField'])
            ->paginate(24);

        return Inertia::render('Public/Universities/Journals', [
            'university' => $university,
            'journals' => $journals,
        ]);
    }
}
```

### 5.3 Frontend Pages Structure

```
resources/js/pages/Public/
├── Home.tsx                 # Landing page
├── About.tsx                # About page
├── Contact.tsx              # Contact page
├── Journals/
│   ├── Index.tsx           # Journal listing with filters
│   └── Detail.tsx          # Journal detail page
└── Universities/
    └── Journals.tsx         # University-specific journals
```

### 5.4 Components Structure

```
resources/js/components/Public/
├── PublicLayout.tsx         # Layout untuk public pages (header, footer)
├── JournalCard.tsx          # Card component untuk journal
├── SearchBar.tsx            # Search component
├── FilterSidebar.tsx        # Filter component
├── StatsWidget.tsx          # Statistics display
├── SintaBadge.tsx           # SINTA rank badge
└── IndexingBadge.tsx        # Indexing status badge
```

---

## 6. Data Requirements

### 6.1 Database Schema (existing tables yang digunakan)

**Primary Tables:**
- `journals` - Data jurnal utama
- `universities` - Data universitas
- `scientific_fields` - Bidang keilmuan
- `journal_indexations` - Indexing status (Scopus, DOAJ, dll)

**Additional Fields Needed in `journals` table:**
```sql
ALTER TABLE journals ADD COLUMN IF NOT EXISTS:
- is_public BOOLEAN DEFAULT true
- view_count INT DEFAULT 0
- featured BOOLEAN DEFAULT false
- description TEXT
- scope TEXT
- target_audience TEXT
```

### 6.2 Scopes & Methods (add to Journal model)

```php
// app/Models/Journal.php

public function scopeActive($query)
{
    return $query->where('status', 'active')->where('is_public', true);
}

public function scopeFeatured($query)
{
    return $query->where('featured', true);
}

public function scopeBySintaRank($query, $rank)
{
    return $query->where('sinta_rank', $rank);
}

public function getFullISSNAttribute()
{
    return $this->issn_print . ' / ' . $this->issn_online;
}

public function incrementViewCount()
{
    $this->increment('view_count');
}
```

---

## 7. SEO & Performance

### 7.1 SEO Optimization
1. **Meta Tags** (per page)
   - Title: "Nama Jurnal | Jurnal_Mu PTM"
   - Description: Deskripsi singkat jurnal
   - Keywords: Bidang keilmuan, SINTA, PTM
   - Open Graph tags (untuk social media)

2. **Structured Data** (Schema.org)
   - ScholarlyArticle
   - Organization
   - BreadcrumbList

3. **Sitemap.xml**
   - Generate otomatis untuk semua public pages
   - Submit ke Google Search Console

4. **Robots.txt**
   - Allow public pages
   - Disallow admin pages

### 7.2 Performance Optimization
1. **Image Optimization**
   - Lazy loading untuk journal covers
   - WebP format dengan fallback
   - Responsive images

2. **Caching**
   - Cache statistics (1 jam)
   - Cache journal list (15 menit)
   - Browser caching untuk assets

3. **Database**
   - Index pada: `status`, `university_id`, `sinta_rank`
   - Eager loading relationships
   - Pagination untuk large datasets

4. **Frontend**
   - Code splitting (Vite)
   - Minify CSS/JS
   - CDN untuk assets (optional)

---

## 8. Accessibility & Usability

### 8.1 Accessibility (WCAG 2.1 Level AA)
- [ ] Semantic HTML5 elements
- [ ] Alt text untuk semua images
- [ ] Keyboard navigation support
- [ ] ARIA labels untuk interactive elements
- [ ] Sufficient color contrast (4.5:1 minimum)
- [ ] Focus indicators
- [ ] Skip to content link

### 8.2 Mobile Responsiveness
- [ ] Touch-friendly buttons (min 44x44px)
- [ ] Responsive images
- [ ] Mobile menu (hamburger)
- [ ] Optimized forms untuk mobile
- [ ] Fast loading pada mobile network

### 8.3 Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

---

## 9. Development Phases

### Phase 1: Foundation (Week 1-2) ⭐⭐⭐
**Goal**: Setup dasar public pages

**Status**: ✅ **COMPLETED**

**Tasks**:
- ✅ Create `PublicController` (named `PublicJournalController`)
- ✅ Setup public routes (home, /journals, /journals/{id})
- ✅ Create `PublicLayout` component (integrated dalam navbar)
- ✅ Create basic Home page (welcome.tsx)
- ✅ Add scopes to Journal model (`active`, `bySintaRank`, `search`, `byIndexation`)
- ✅ Test routing & basic rendering

**Deliverable**: ✅ Working homepage dengan featured journals & statistics

---

### Phase 2: Journal Listing (Week 2-3) ⭐⭐⭐
**Goal**: Implementasi halaman listing dengan filter

**Status**: ✅ **COMPLETED**

**Tasks**:
- ✅ Create `Journals/Index.tsx` page
- ✅ Implement search functionality (by title, ISSN)
- ✅ Implement filters (university, SINTA, scientific field, indexation, accreditation)
- ✅ Create `JournalCard` component
- ✅ Implement pagination (12 per page)
- ✅ Create `FilterSidebar` component
- ✅ Add sorting functionality (by name default)

**Deliverable**: ✅ Fully functional journal listing page with all filters

---

### Phase 3: Journal Detail (Week 3-4) ⭐⭐⭐
**Goal**: Halaman detail jurnal lengkap

**Status**: ⚠️ **BACKEND READY, FRONTEND PENDING**

**Tasks**:
- ✅ Create `PublicJournalController@show()` method - DONE
- ⏳ Create `Journals/Show.tsx` page - NEEDS TO BE DONE
- ⏳ Display all journal metadata (title, ISSN, publisher, editor, etc) - BACKEND READY
- ⏳ Show indexing & accreditation - BACKEND READY (indexed_in, accreditation_grade)
- ⏳ Add external links (website, SINTA) - BACKEND READY
- ⚠️ Implement view counter - NOT YET
- ⚠️ Add breadcrumbs - NOT YET
- ✅ Create badge components - EXISTS in codebase

**Deliverable**: ⏳ Need to create Show.tsx component with layouts and styling

---

### Phase 4: Statistics & Featured Journals (Week 4) ⭐⭐
**Goal**: Dynamic homepage dengan data real

**Status**: ✅ **COMPLETED**

**Tasks**:
- ✅ Implement statistics calculation (sintaStats by rank 1-6)
- ✅ Create `StatsWidget` component (SINTA rank cards)
- ✅ Display featured journals on homepage (SINTA 1-2)
- ✅ Create SINTA filter buttons (clickable to /journals with filter)
- ✅ Optimize queries (eager loading, no caching needed yet)

**Deliverable**: ✅ Dynamic homepage dengan live data

---

### Phase 5: About & Contact Pages (Week 5) ⭐⭐
**Goal**: Informational pages

**Status**: ❌ **NOT STARTED**

**Tasks**:
- [ ] Create About page dengan content
- [ ] Create Contact page dengan form
- [ ] Implement contact form submission
- [ ] Setup email notification (optional)
- [ ] Add footer dengan links

**Deliverable**: Complete about & contact pages

---

### Phase 6: Polish & Optimization (Week 6) ⭐
**Goal**: SEO, performance, accessibility

**Status**: ⚠️ **IN PROGRESS** (partial)

**Tasks**:
- ⚠️ Add meta tags (title, description, OG) - **PARTIAL** (head tags exist)
- [ ] Implement structured data (JSON-LD)
- [ ] Generate sitemap.xml
- ⚠️ Optimize images (lazy loading, WebP) - **PARTIAL** (using cover_image_url)
- [ ] Add caching strategy
- [ ] Accessibility audit & fixes
- ⚠️ Mobile responsive testing - **PARTIAL** (responsive classes in place)
- [ ] Performance testing (Lighthouse)

**Deliverable**: Production-ready public pages (needs SEO & structured data)

---

## 10. Metrics & Success Criteria

### 10.1 User Metrics
- **Page Views**: Track per page
- **Search Usage**: % of users using search
- **Filter Usage**: Most used filters
- **Journal Detail Views**: Top viewed journals
- **Bounce Rate**: < 60% target
- **Time on Site**: > 2 minutes average

### 10.2 Technical Metrics
- **Page Load Time**: < 3 seconds
- **Lighthouse Score**: 
  - Performance: > 90
  - Accessibility: > 95
  - Best Practices: > 90
  - SEO: > 95
- **Mobile Score**: > 85

### 10.3 Content Metrics
- **Total Journals**: Track growth
- **Journal Coverage**: % of PTM journals included
- **Data Completeness**: % journals dengan metadata lengkap

---

## 11. Future Enhancements (Post-MVP)

### 11.1 Advanced Search
- [ ] Full-text search (Meilisearch/Algolia)
- [ ] Advanced filters (language, indexing, year range)
- [ ] Search suggestions/autocomplete
- [ ] Saved searches

### 11.2 Analytics Dashboard
- [ ] Public statistics page
- [ ] Trends & charts (jurnal growth over time)
- [ ] Top journals by views
- [ ] Comparison tools

### 11.3 Personalization
- [ ] Bookmark/favorite journals (requires login)
- [ ] Email alerts untuk jurnal baru
- [ ] Recommended journals based on interest

### 11.4 Integration
- [ ] Link to actual journal articles (if available)
- [ ] Integration dengan SINTA API
- [ ] Export data (CSV, Excel)
- [ ] RSS feed untuk updates

### 11.5 Multi-language
- [ ] Bahasa Indonesia (default)
- [ ] English version
- [ ] Language switcher

---

## 12. Risks & Mitigation

### 12.1 Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data tidak lengkap dari universitas | High | High | Provide default values, validation rules |
| Slow query performance dengan banyak data | Medium | Medium | Implement caching, database indexing |
| Journal covers tidak tersedia | Low | Medium | Use default placeholder image |
| SINTA data tidak akurat | High | Medium | Sync mechanism, manual verification |

### 12.2 Dependencies
- **External**: SINTA database (untuk referensi akreditasi)
- **Internal**: Admin & User roles untuk input data jurnal
- **Technical**: Hosting dengan good uptime (>99%)

---

## 13. Resources Required

### 13.1 Development Team
- **Backend Developer**: 1 person (Laravel, PHP)
- **Frontend Developer**: 1 person (React, TypeScript, Inertia)
- **UI/UX Designer**: 0.5 person (design assets, mockups)
- **QA Tester**: 0.5 person (testing, bug reports)

### 13.2 Timeline
- **Total Duration**: 6 weeks
- **Sprint Length**: 1 week
- **Critical Path**: Phase 1 → Phase 2 → Phase 3

### 13.3 Budget Estimate (Optional)
- Development: 6 weeks × team cost
- Design: Assets & mockups
- Hosting: PHP/MySQL hosting
- Domain: jurnal_mu.id (example)
- Tools: None (using open source)

---

## 14. Conclusion

Public page Jurnal_Mu MVP akan memberikan **transparansi dan aksesibilitas** informasi jurnal PTM kepada publik. Dengan mengadopsi best practices dari **MAJU UAD** (simple, functional) dan **Taylor & Francis** (professional, clean), platform ini akan menjadi:

1. ✅ **Central hub** untuk eksplorasi jurnal PTM
2. ✅ **Trusted source** untuk data akreditasi & metadata jurnal
3. ✅ **User-friendly** dengan search & filter yang powerful
4. ✅ **SEO-optimized** untuk reach yang lebih luas
5. ✅ **Scalable** untuk pertumbuhan jurnal di masa depan

**Next Steps**:
1. Review & approval plan ini oleh stakeholder
2. Setup development environment (backend + frontend)
3. Start Phase 1: Foundation
4. Weekly sprint review & demo

---

## Appendix

### A. Wireframes (to be created)
- Homepage wireframe
- Journal listing wireframe
- Journal detail wireframe
- Mobile responsive layout

### B. Design Assets Checklist
- [ ] Logo Jurnal_Mu
- [ ] Placeholder journal cover image
- [ ] SINTA badge icons (1-6)
- [ ] Indexing badges (Scopus, DOAJ, dll)
- [ ] University logos (if used)
- [ ] Hero section images

### C. Content Writing Checklist
- [ ] About page text
- [ ] Homepage tagline & descriptions
- [ ] Contact information
- [ ] Footer links
- [ ] Error messages
- [ ] Empty state messages

### D. Reference Links
- MAJU UAD: https://maju.uad.ac.id/
- Taylor & Francis: https://www.tandfonline.com/
- SINTA: https://sinta.ristekbrin.go.id/
- ARJUNA: http://arjuna.ristekbrin.go.id/

---

**Document Version**: 1.0  
**Created**: February 5, 2026  
**Last Updated**: February 6, 2026  
**Author**: GitHub Copilot  
**Status**: Draft - Awaiting Review

---

## Implementation Checklist Summary

### Features Checklist

| # | Feature | Status | Location | Notes |
|---|---------|--------|----------|-------|
| 1 | Landing Page / Homepage | ✅ 75% | `welcome.tsx` | Missing: University section |
| 2 | Hero Section | ✅ Complete | `welcome.tsx` line 48+ | Full gradient, search bar, CTA |
| 3 | Statistics Section | ✅ Complete | `welcome.tsx` line 108+ | SINTA 1-6 breakdown, clickable |
| 4 | Featured Journals | ✅ Complete | `welcome.tsx` line 140+ | SINTA 1-2, card grid |
| 5 | Navbar / Header | ✅ Complete | `welcome.tsx` line 47+ | Logo, nav, login/register |
| 6 | Journal Listing Page | ✅ 95% | `Journals/Index.tsx` | Missing: empty state messages |
| 7 | Search Functionality | ✅ Complete | `PublicJournalController@index` | By title, ISSN, E-ISSN |
| 8 | Filter by University | ✅ Complete | `PublicJournalController@index` | Filter dropdown |
| 9 | Filter by SINTA Rank | ✅ Complete | `PublicJournalController@index` | SINTA 1-6 |
| 10 | Filter by Scientific Field | ✅ Complete | `PublicJournalController@index` | Scientific field dropdown |
| 11 | Filter by Indexation | ✅ Complete | `PublicJournalController@index` | Scopus, DOAJ, etc |
| 12 | Filter by Accreditation | ✅ Complete | `PublicJournalController@index` | DIKTI accreditation grades |
| 13 | Pagination | ✅ Complete | `PublicJournalController@index` | 12 items per page |
| 14 | Journal Card Component | ✅ Complete | `journal-card.tsx` | Reusable card component |
| 15 | Journal Detail Page | ⚠️ 50% | `PublicJournalController@show` | Backend ready, need Show.tsx |
| 16 | Journal Metadata Display | ✅ Backend | `PublicJournalController@show` | editor_in_chief, frequency, email etc |
| 17 | Indexing Badges | ✅ Ready | badges components | Reusable badge components exist |
| 18 | External Links | ✅ Backend | `PublicJournalController@show` | URL field ready |
| 19 | About Page | ❌ Not Started | N/A | Need to create `/about` |
| 20 | Contact Page | ❌ Not Started | N/A | Need to create `/contact` |
| 21 | Contact Form | ❌ Not Started | N/A | Form submission logic |
| 22 | Breadcrumbs | ❌ Not Started | N/A | Home > Journals > Detail |
| 23 | View Counter | ❌ Not Started | N/A | Track journal views |
| 24 | University Section (Home) | ❌ Not Started | `welcome.tsx` | List PTM with journal counts |
| 25 | Empty State Messages | ❌ Not Started | `Journals/Index.tsx` | No results message |
| 26 | SEO Meta Tags | ⚠️ Partial | Multiple files | Head tags in place, need more |
| 27 | Structured Data (JSON-LD) | ❌ Not Started | N/A | Schema.org markup |
| 28 | Sitemap.xml | ❌ Not Started | N/A | Auto-generated route sitemap |
| 29 | Mobile Responsive | ✅ 70% | All tsx files | Responsive layout, needs testing |
| 30 | Image Optimization | ⚠️ Partial | cover_image_url | Using URL, no lazy load yet |

### Code Structure Checklist

| Component | Status | File Path | Verified |
|-----------|--------|-----------|----------|
| PublicJournalController | ✅ | `app/Http/Controllers/PublicJournalController.php` | ✅ |
| Welcome Page | ✅ | `resources/js/pages/welcome.tsx` | ✅ |
| Journals Index Page | ✅ | `resources/js/pages/Journals/Index.tsx` | ✅ |
| Journals Show Page | ❌ | `resources/js/pages/Journals/Show.tsx` | **MISSING - NEEDS CREATION** |
| Journal Card Component | ✅ | `resources/js/components/journal-card.tsx` | ✅ |
| Badge Components | ✅ | `resources/js/components/badges/` | ✅ |
| Public Routes | ✅ | `routes/web.php` lines 38-93 | ✅ |
| Journal Model Scopes | ✅ | `app/Models/Journal.php` | ✅ |

### Database Requirements Checklist

| Field | Status | Table | Notes |
|-------|--------|-------|-------|
| is_active | ✅ | journals | Filters active journals |
| sinta_rank | ✅ | journals | 1-6 or null |
| title | ✅ | journals | Journal name |
| issn | ✅ | journals | Print ISSN |
| e_issn | ✅ | journals | Electronic ISSN |
| publisher | ✅ | journals | Publisher info |
| url | ✅ | journals | Journal website |
| cover_image_url | ✅ | journals | Journal cover |
| scientific_field_id | ✅ | journals | Foreign key |
| university_id | ✅ | journals | Foreign key |
| indexed_in | ✅ | journals | JSON (Scopus, DOAJ, etc) |
| accreditation_grade | ✅ | journals | DIKTI grade |
| accreditation_status | ✅ | journals | Active/Expired |
| sinta_score | ✅ | journals | Numerical score |
| frequency | ✅ | journals | Publication frequency |
| first_published_year | ✅ | journals | Year established |
| editor_in_chief | ✅ | journals | Editor name |
| email | ✅ | journals | Contact email |
| is_public | ⚠️ | journals | Suggested to add (currently using is_active) |
| view_count | ❌ | journals | **Need to add** for analytics |
| featured | ❌ | journals | **Need to add** for homepage control |
| description | ❌ | journals | **Need to add** for journal about section |
| scope | ❌ | journals | **Need to add** for journal scope info |
| doi_prefix | ❌ | journals | **Suggested** if needed |
| oai_pmh_url | ❌ | journals | **Suggested** if needed |

**Database Migration Needed:**
```sql
-- Add these columns to journals table
ALTER TABLE journals ADD COLUMN view_count INT DEFAULT 0 AFTER cover_image_url;
ALTER TABLE journals ADD COLUMN featured BOOLEAN DEFAULT false AFTER is_active;
ALTER TABLE journals ADD COLUMN description TEXT AFTER url;
ALTER TABLE journals ADD COLUMN scope TEXT AFTER description;
```

### Next Immediate Actions

**Priority 1 (This Week):**
1. [ ] **CREATE Journal Detail Page** (`resources/js/pages/Journals/Show.tsx`) - **CRITICAL**
2. [ ] Add empty state message component for journal listing
3. [ ] Add breadcrumbs navigation component
4. [ ] Implement view counter on journal detail page
5. [ ] Add University section to homepage

**Priority 2 (Next Week):**
1. [ ] Create About page with content
2. [ ] Create Contact page with form
3. [ ] Implement contact form submission
4. [ ] Add JSON-LD structured data

**Priority 3 (Polish Phase):**
1. [ ] SEO meta tags per page
2. [ ] Generate sitemap.xml
3. [ ] Image lazy loading & optimization
4. [ ] Lighthouse performance audit
5. [ ] Accessibility testing (WCAG 2.1)

---

## Quick Reference: What Already Exists vs What's Needed

### ✅ Already Working:
- Homepage with featured journals and SINTA stats
- Journal listing with search & multiple filters
- Backend API for journal detail page
- Database scopes (active, bySintaRank, search, etc.)
- Pagination
- Responsive navbar
- Journal card component

### ⚠️ Backend Ready, Frontend Needed:
- **Journal Detail Page** - controller method exists with all data, just need to create the TSX page

### ❌ Completely Missing:
- About page (route, controller, TSX)
- Contact page (route, controller, TSX)
- Breadcrumbs component
- View counter functionality
- Empty state messages
- University section on homepage
- SEO meta tags & structured data
- Sitemap generation
