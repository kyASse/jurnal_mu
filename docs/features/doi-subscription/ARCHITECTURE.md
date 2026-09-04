# Architecture & System Design
## Modul Menu Langganan DOI & Similarity Check
**Platform**: Jurnal MU (Laravel 12 + Inertia.js React 19 + TypeScript + Tailwind CSS)  
**Versi**: 1.0.0  
**Tanggal**: 15 Agustus 2026  
**Dokumentasi Terkait**: [PRD.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/PRD.md) | [SCHEMA.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/SCHEMA.md) | [ALGORITHM.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/ALGORITHM.md) | [UI_DESIGN.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/UI_DESIGN.md) | [TESTING_LOGS.md](file:///c:/xampp/htdocs/jurnal_mu/docs/features/doi-subscription/TESTING_LOGS.md)

---

## 1. High-Level Architecture Overview

Modul Langganan DOI dibangun di atas arsitektur monolith modern dengan pemisahan *concern* yang tegas antara lapisan backend (Laravel) dan frontend (Inertia.js React SPA). Seluruh aliran data dirancang aman, terisolasi per institusi (*multi-tenant safe*), dan terintegrasi dengan event-driven notification.

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Presentation Layer (React 19 + Inertia.js + Tailwind v4)"]
        UI_DSH["Dashboard Langganan DOI Page<br/>(Ringkasan, Badge, Prefix, Similarity Gauge)"]
        UI_INV["Tagihan Pembayaran Page<br/>(Invoice List, Filter, PDF Download)"]
        UI_PRF["Bukti Pembayaran Page<br/>(Dropzone Upload, History, Status Tracker)"]
        UI_ADM["Super Admin Verification Drawer<br/>(Review Bukti, Approve/Reject + Note)"]
    end

    subgraph SecurityAuth ["Security & Authorization Layer"]
        AUTH_MID["Role & Permission Middleware<br/>(Super Admin, Admin Kampus, User)"]
        POLICIES["Laravel Policies<br/>(DoiSubscriptionPolicy, InvoicePolicy, ProofPolicy)"]
    end

    subgraph ControllerLayer ["HTTP Controller Layer"]
        C_DSH["DoiDashboardController"]
        C_INV["DoiInvoiceController"]
        C_PRF["DoiPaymentProofController"]
        C_ADM["AdminDoiVerificationController"]
    end

    subgraph ServiceActionLayer ["Domain & Business Action Layer"]
        ACT_INV["GenerateInvoiceAction"]
        ACT_UP["StorePaymentProofAction"]
        ACT_VER["VerifyPaymentProofAction"]
        ACT_ACT["ActivateSubscriptionAction"]
        SRV_QUOTA["DoiQuotaManagerService"]
    end

    subgraph EventQueueLayer ["Event & Asynchronous Job Layer"]
        EVT_PROOF["PaymentProofUploaded Event"]
        EVT_VERIF["PaymentProofVerified Event"]
        JOB_EXP["CheckExpiringDoiSubscriptionsJob"]
        NOTIF["Notification Channels<br/>(Database & Mail)"]
    end

    subgraph StorageDataLayer ["Storage & Database Layer"]
        DB[(MySQL Database<br/>doi_subscriptions, invoices, proofs)]
        FILE_STORE[("Private Secure Storage<br/>(storage/app/private/doi_proofs)")]
    end

    ClientLayer --> SecurityAuth
    SecurityAuth --> ControllerLayer
    ControllerLayer --> ServiceActionLayer
    ServiceActionLayer --> EventQueueLayer
    ServiceActionLayer --> StorageDataLayer
    EventQueueLayer --> NOTIF
```

---

## 2. Backend Component Architecture

### 2.1 Directory & Namespace Structure

```text
app/
├── Http/
│   ├── Controllers/
│   │   ├── Doi/
│   │   │   ├── DoiDashboardController.php
│   │   │   ├── DoiInvoiceController.php
│   │   │   └── DoiPaymentProofController.php
│   │   └── Admin/
│   │       └── Doi/
│   │           ├── AdminDoiPackageController.php
│   │           ├── AdminDoiInvoiceController.php
│   │           └── AdminDoiVerificationController.php
│   ├── Requests/
│   │   └── Doi/
│   │       ├── StorePaymentProofRequest.php
│   │       ├── VerifyPaymentProofRequest.php
│   │       └── StoreDoiInvoiceRequest.php
│   └── Resources/
│       └── Doi/
│           ├── DoiSubscriptionResource.php
│           ├── DoiInvoiceResource.php
│           └── DoiPaymentProofResource.php
├── Actions/
│   └── Doi/
│       ├── GenerateInvoiceAction.php
│       ├── StorePaymentProofAction.php
│       ├── VerifyPaymentProofAction.php
│       └── ActivateSubscriptionAction.php
├── Services/
│   └── Doi/
│       ├── DoiSubscriptionService.php
│       ├── DoiInvoiceService.php
│       └── DoiQuotaManagerService.php
├── Policies/
│   ├── DoiSubscriptionPolicy.php
│   ├── DoiInvoicePolicy.php
│   └── DoiPaymentProofPolicy.php
├── Models/
│   ├── DoiPackage.php
│   ├── DoiSubscription.php
│   ├── DoiInvoice.php
│   ├── DoiInvoiceItem.php
│   ├── DoiPaymentProof.php
│   ├── DoiBankAccount.php
│   └── DoiSimilarityQuotaLog.php
├── Events/
│   └── Doi/
│       ├── PaymentProofUploaded.php
│       ├── PaymentProofVerified.php
│       └── SubscriptionStatusChanged.php
├── Listeners/
│   └── Doi/
│       ├── NotifyAdminOfNewPaymentProof.php
│       ├── NotifyUserOfVerificationResult.php
│       └── ProcessSubscriptionOnPaymentApproved.php
└── Jobs/
    ├── CheckExpiringDoiSubscriptionsJob.php
    └── SendInvoiceDueReminderJob.php
```

---

## 3. Data Flow & Transaction Lifecycle

### 3.1 End-to-End Subscription & Payment Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Admin Kampus / User
    participant Frontend as Inertia React Client
    participant Controller as DoiPaymentProofController
    participant Action as VerifyPaymentProofAction
    actor Admin as Super Admin (Diktilitbang)
    participant DB as MySQL Database
    participant Storage as Private File Storage

    Note over User, DB: 1. Tagihan Terbit & Pengunggahan Bukti
    User->>Frontend: Buka Halaman Bukti Pembayaran (Pilih Invoice)
    User->>Frontend: Unggah File Bukti Transfer & Input Data Bank
    Frontend->>Controller: POST /doi/payment-proofs (Multipart)
    Controller->>Storage: Simpan file terenkripsi di private storage
    Controller->>DB: INSERT into doi_payment_proofs (status: 'pending')
    Controller->>DB: UPDATE doi_invoices (status: 'pending_verification')
    Controller-->>Frontend: 200 OK (Flash Success & Inertia Reload)

    Note over Admin, DB: 2. Proses Verifikasi oleh Administrator
    Admin->>Frontend: Buka Admin Verification Drawer
    Frontend->>Controller: GET /admin/doi/payment-proofs/{id}/stream (Signed URL)
    Controller-->>Frontend: Stream PDF/Image file aman
    Admin->>Frontend: Klik [Setujui] atau [Tolak + Catatan]
    Frontend->>Controller: POST /admin/doi/payment-proofs/{id}/verify
    Controller->>Action: Execute verification logic

    alt Disetujui (Approved)
        Action->>DB: UPDATE doi_payment_proofs (status: 'approved', verified_by: admin_id)
        Action->>DB: UPDATE doi_invoices (status: 'paid', paid_at: NOW())
        Action->>DB: UPDATE doi_subscriptions (status: 'active', end_date: +1 Year, prefix, quota)
        Action-->>User: Kirim Email/Notifikasi Langganan Aktif
    else Ditolak (Rejected)
        Action->>DB: UPDATE doi_payment_proofs (status: 'rejected', admin_notes: '...')
        Action->>DB: UPDATE doi_invoices (status: 'unpaid')
        Action-->>User: Kirim Notifikasi Penolakan + Alasan & Tombol Re-upload
    end
```

---

## 4. Frontend Architecture & Component Hierarchy

### 4.1 Inertia Page & Component Tree

```text
resources/js/
├── pages/
│   ├── doi-subscription/
│   │   ├── dashboard.tsx              # Dashboard Langganan DOI Utama
│   │   ├── invoices/
│   │   │   ├── index.tsx              # List Tagihan Pembayaran & Filter
│   │   │   └── show.tsx               # Rincian Tagihan & Cetak Proforma
│   │   └── payment-proofs/
│   │       ├── index.tsx              # Riwayat Bukti Pembayaran
│   │       └── upload.tsx             # Form Unggah Bukti Bayar
│   └── admin/
│       └── doi-management/
│           ├── index.tsx              # Kelola Seluruh Langganan & Tagihan
│           └── verification-drawer.tsx # Modal Review Bukti Transfer
├── components/
│   └── doi/
│       ├── doi-status-badge.tsx       # Badge status aktif/belum aktif/grace
│       ├── doi-quota-gauge.tsx        # Visualisasi kuota similarity check
│       ├── doi-prefix-card.tsx        # Kartu prefix Crossref + copy action
│       ├── invoice-status-pill.tsx    # Badge status invoice (Lunas/Unpaid)
│       ├── payment-dropzone.tsx       # Drag-and-drop secure file uploader
│       ├── bank-account-card.tsx      # Info rekening transfer tujuan
│       ├── admin-feedback-alert.tsx   # Banner merah catatan penolakan admin
│       └── verification-timeline.tsx  # Timeline status verifikasi
└── types/
    └── doi.d.ts                       # TypeScript interfaces & enums
```

---

## 5. Security & Storage Strategy

### 5.1 Private Storage Architecture
File bukti transfer keuangan berisi informasi sensitif perbankan, sehingga tidak boleh dapat diakses secara publik pada folder `public/storage`.
* **Storage Disk**: `'doi_proofs' => ['driver' => 'local', 'root' => storage_path('app/private/doi_proofs')]`.
* **File Naming Sanitization**: Format penyimpanan hash teracak: `proof_{invoice_id}_{timestamp}_{random_hash}.{ext}`.
* **Access Control Endpoint**: File hanya dapat diakses melalui rute aman bertanda tangan (`URL::temporarySignedRoute()`) dengan validasi hak akses melalui `DoiPaymentProofPolicy@view`.

### 5.2 Multi-Tenant Scoping & IDOR Protection
* Semua query tagihan dan bukti pembayaran pada sisi user/admin kampus di-scope secara eksplisit terhadap `university_id` atau `user_id` milik sesi yang sedang aktif.
* Akses langsung ke ID invoice atau bukti transfer milik instansi lain akan menghasilkan HTTP 403 Forbidden.
