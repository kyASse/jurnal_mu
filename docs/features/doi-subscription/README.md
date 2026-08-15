# Dokumentasi Desain Fitur Langganan DOI & Similarity Check
**Ecosystem**: Jurnal MU (Majelis Diktilitbang Pimpinan Pusat Muhammadiyah)  
**Status**: Ready for Development  
**Tanggal Rancang**: 15 Agustus 2026  

---

## 📑 Daftar Berkas Spesifikasi Lengkap

| Dokumen | Deskripsi Teknis |
| :--- | :--- |
| **[1. PRD.md](./PRD.md)** | **Product Requirements Document**: Latar belakang, user personas, 3 fitur utama (Dashboard, Tagihan Pembayaran, Bukti Pembayaran), dan non-functional requirements. |
| **[2. ARCHITECTURE.md](./ARCHITECTURE.md)** | **System Architecture**: Diagram arsitektur C4, layer controller, actions, events/listeners, background scheduler, security & private storage. |
| **[3. SCHEMA.md](./SCHEMA.md)** | **Database Schema & Data Dictionary**: Diagram ERD lengkap, 7 definisi tabel, foreign key constraints, migration blueprint Laravel. |
| **[4. ALGORITHM.md](./ALGORITHM.md)** | **Business Logic & State Machine**: Algoritma nomor invoice unik, upload multi-layer file security, state machine verifikasi approval/reject, dan scheduler grace period. |
| **[5. UI_DESIGN.md](./UI_DESIGN.md)** | **UI/UX Design Specification**: Design tokens, wireframe detail Dashboard (Bento grid), Tagihan Pembayaran, Bukti Pembayaran Dropzone, dan Split-View Admin Review Drawer. |
| **[6. TESTING_LOGS.md](./TESTING_LOGS.md)** | **QA & Test Matrix**: Skenario Unit Test, Feature Test, Security IDOR/MIME Test, Scheduler Test, serta panduan eksekusi test pada Docker container. |

---

## 🚀 Ringkasan 3 Fitur Utama

1. **Dashboard Langganan DOI**:
   * Ringkasan status langganan & countdown masa aktif.
   * Status badge: Aktif, Belum Aktif, Grace Period, Expired, Menunggu Verifikasi.
   * Informasi paket DOI: Nomor Prefix Crossref (`10.xxxxx/`) dan Progress Gauge Kuota Similarity Check (Turnitin / iThenticate).
2. **Tagihan Pembayaran (Invoices)**:
   * Nomor invoice unik (`INV/DOI/YYYYMM/XXXX`).
   * Periode tagihan layanan & batas tanggal jatuh tempo (*due date*).
   * Nominal tagihan breakdown & status (`Belum Dibayar`, `Lunas`, `Menunggu Verifikasi`, `Kadaluwarsa`).
   * Unduh faktur PDF resmi dan tombol aksi langsung bayar.
3. **Bukti Pembayaran (Payment Proofs)**:
   * Form unggah bukti transfer (Dropzone JPG/PNG/PDF maks 5MB) dan data rekening pengirim.
   * Riwayat bukti pembayaran lengkap.
   * Status verifikasi realtime: `Menunggu`, `Disetujui`, `Ditolak`.
   * Catatan khusus dari administrator (Super Admin Diktilitbang) jika bukti ditolak beserta aksi re-upload.
