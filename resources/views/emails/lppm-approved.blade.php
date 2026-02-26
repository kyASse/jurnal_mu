<x-mail::message>
# Registrasi Admin LPPM Disetujui

Halo, {{ $lppm->name }}!

Selamat! Registrasi Anda sebagai **Admin LPPM (Admin Kampus)** di platform **Journal MU** telah disetujui oleh tim Dikti.

Anda sekarang dapat login ke sistem menggunakan akun Anda dan mulai mengelola jurnal-jurnal ilmiah di universitas Anda.

**Detail Akun:**
- **Nama:** {{ $lppm->name }}
- **Email:** {{ $lppm->email }}
- **Universitas:** {{ $lppm->university->name ?? '-' }}
- **Role:** Admin Kampus (LPPM)

<x-mail::button :url="$url">
Login ke Sistem
</x-mail::button>

Jika Anda mengalami kendala saat login, silakan hubungi tim support Journal MU.

Terima kasih,<br>
Tim **Journal MU**

---
*Email ini dikirim otomatis oleh sistem Journal MU. Harap tidak membalas email ini.*
</x-mail::message>
