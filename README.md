# JurnalMu - Muhammadiyah Journal Portal

<div align="center">

![JurnalMu Landing Page](https://github.com/user-attachments/assets/e12c4942-2466-4e45-94bb-f8504e938e6c)

**Platform Manajemen Jurnal Ilmiah untuk Perguruan Tinggi Muhammadiyah (PTM) se-Indonesia**

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-9553E9?style=flat-square&logo=inertia&logoColor=white)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Tentang JurnalMu

**JurnalMu** (Asistensi Jurnal Muhammadiyah) adalah platform manajemen jurnal akademik yang dirancang khusus untuk Perguruan Tinggi Muhammadiyah di seluruh Indonesia. Aplikasi ini membantu mengelola, memonitor, dan meningkatkan kualitas jurnal ilmiah melalui sistem self-assessment terintegrasi.

### Tujuan Utama

- Mempermudah pengelolaan jurnal ilmiah di lingkungan PTM
- Menyediakan sistem self-assessment untuk evaluasi kualitas jurnal
- Memfasilitasi monitoring dan pembinaan jurnal oleh Admin Kampus dan Super Admin
- Mendukung peningkatan akreditasi jurnal ke tingkat SINTA yang lebih tinggi

---

## Fitur Utama

### Authentication & Authorization
- Login dengan email/password
- **Google OAuth Integration** untuk kemudahan akses
- Role-based access control (RBAC) dengan 3 level:
  - **Super Admin**: Akses penuh ke semua data PTM
  - **Admin Kampus**: Mengelola jurnal dan user di kampusnya
  - **User (Pengelola Jurnal)**: Mengelola jurnal yang ditugaskan

### Dashboard Role-Based
- Statistik yang disesuaikan berdasarkan role pengguna
- Ringkasan data jurnal, asesmen, dan skor rata-rata
- Monitoring status self-assessment

### Manajemen Universitas (Super Admin)
- CRUD Perguruan Tinggi Muhammadiyah
- Data lengkap: nama, kode, alamat, kontak, logo
- Search dan filter berdasarkan status

### Manajemen Admin Kampus (Super Admin)
- CRUD Administrator untuk setiap PTM
- Assignment admin ke universitas tertentu
- Tracking aktivitas dan last login

### Manajemen User/Pengelola Jurnal (Admin Kampus)
- CRUD User yang di-scope ke universitas sendiri
- Assign pengelola ke jurnal tertentu
- Monitoring aktivitas pengelola

### Manajemen Jurnal (User)
- Input data jurnal lengkap (ISSN, E-ISSN, URL, dll)
- Klasifikasi berdasarkan bidang ilmu
- Status akreditasi dan peringkat SINTA

### Self-Assessment (User)
- Borang evaluasi dengan 12 indikator penilaian
- 3 kategori utama:
  - Kelengkapan Administrasi
  - Kualitas Konten
  - Proses Editorial
- Auto-calculate skor total
- Status draft/submitted untuk tracking progress

### Settings & Profile
- Update profil pengguna
- Ubah password
- Pengaturan tema (Light/Dark/System)

---

## Tech Stack

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| PHP | 8.2+ | Server-side language |
| Laravel | 12.x | PHP Framework |
| Laravel Sanctum | 4.x | API Authentication |
| Laravel Socialite | 5.x | OAuth Authentication |
| SQLite/MySQL | - | Database |

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| React | 19.x | UI Library |
| TypeScript | 5.x | Type-safe JavaScript |
| Inertia.js | 2.x | Modern Monolith SPA |
| Tailwind CSS | 4.x | Utility-first CSS |
| Vite | 7.x | Build Tool |
| shadcn/ui | - | Component Library (Radix UI) |
| Lucide React | - | Icon Library |

### Testing & Quality
| Tool | Description |
|------|-------------|
| Pest PHP | Testing Framework |
| Laravel Dusk | Browser Testing |
| Laravel Pint | PHP Code Style Fixer |
| ESLint | JavaScript Linter |
| Prettier | Code Formatter |

---

## Getting Started

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18
- npm atau yarn
- MySQL/SQLite

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/kyASse/jurnal_mu.git
   cd jurnal_mu
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Setup environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure database**
   
   Untuk SQLite (development):
   ```bash
   touch database/database.sqlite
   ```
   
   Atau konfigurasi MySQL di `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=jurnal_mu
   DB_USERNAME=root
   DB_PASSWORD=
   ```

6. **Run migrations dan seeder**
   ```bash
   php artisan migrate:fresh --seed
   ```

7. **Build frontend assets**
   ```bash
   npm run build
   ```

8. **Start development server**
   ```bash
   php artisan serve
   ```

   Akses aplikasi di: `http://localhost:8000`

### Development Mode

Untuk development dengan hot-reload:

```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev
```

Atau gunakan composer script:
```bash
composer dev
```

---

## Default Credentials

Setelah menjalankan seeder, gunakan kredensial berikut untuk testing:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@ajm.ac.id` | `password123` |
| Admin Kampus (UAD) | `admin.uad@ajm.ac.id` | `password123` |
| User (Pengelola Jurnal) | `andi.prasetyo@uad.ac.id` | `password123` |

---

## Project Structure

```
jurnal_mu/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/           # Super Admin controllers
│   │   │   ├── AdminKampus/     # Admin Kampus controllers
│   │   │   └── User/            # User controllers
│   │   └── Middleware/
│   ├── Models/                  # Eloquent models
│   └── Policies/                # Authorization policies
├── database/
│   ├── migrations/              # Database migrations
│   └── seeders/                 # Data seeders
├── resources/
│   └── js/
│       ├── components/          # Reusable React components
│       │   └── ui/              # shadcn/ui components
│       ├── layouts/             # Page layouts
│       ├── pages/               # Inertia pages
│       │   ├── Admin/           # Super Admin pages
│       │   ├── AdminKampus/     # Admin Kampus pages
│       │   ├── User/            # User pages
│       │   └── Settings/        # Settings pages
│       └── types/               # TypeScript types
├── routes/
│   ├── web.php                  # Web routes
│   └── auth.php                 # Authentication routes
└── docs/                        # Documentation
```

---

## Testing

### PHP Tests (Pest)
```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/ExampleTest.php

# Run with coverage
php artisan test --coverage
```

### Browser Tests (Laravel Dusk)
```bash
# Install ChromeDriver
php artisan dusk:chrome-driver

# Run Dusk tests
php artisan dusk
```

---

## Code Quality

### PHP Linting
```bash
# Check code style
./vendor/bin/pint --test

# Fix code style
./vendor/bin/pint
```

### JavaScript/TypeScript
```bash
# ESLint
npm run lint

# Prettier check
npm run format:check

# Prettier fix
npm run format

# TypeScript type check
npm run types
```

---

## Database Schema

Aplikasi menggunakan schema database berikut:

| Table | Description |
|-------|-------------|
| `roles` | Role definitions (Super Admin, Admin Kampus, User) |
| `universities` | Data Perguruan Tinggi Muhammadiyah |
| `users` | All users with role-based access |
| `scientific_fields` | Bidang keilmuan jurnal |
| `journals` | Data jurnal ilmiah |
| `evaluation_indicators` | Indikator evaluasi/borang |
| `journal_assessments` | Self-assessment submissions |
| `assessment_responses` | Jawaban per indikator |
| `assessment_attachments` | File bukti assessment |

Lihat dokumentasi lengkap di [docs/ERD Database.md](docs/ERD%20Database.md).

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact & Support

- **Repository**: [github.com/kyASse/jurnal_mu](https://github.com/kyASse/jurnal_mu)
- **Issues**: [github.com/kyASse/jurnal_mu/issues](https://github.com/kyASse/jurnal_mu/issues)

---

<div align="center">

**Built with ❤️ for Muhammadiyah Higher Education Network**

*© 2026 JurnalMu - Asistensi Jurnal Muhammadiyah*

</div>
