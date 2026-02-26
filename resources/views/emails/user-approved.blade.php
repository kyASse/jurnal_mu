<x-mail::message>
# Akun Anda Telah Disetujui

Halo, {{ $applicant->name }}!

Selamat! Pendaftaran akun Anda di platform **Journal MU** telah disetujui oleh Admin LPPM universitas Anda.

Anda sekarang dapat login ke sistem dan mulai mengelola jurnal ilmiah Anda.

**Detail Akun:**
- **Nama:** {{ $applicant->name }}
- **Email:** {{ $applicant->email }}
- **Universitas:** {{ $applicant->university->name ?? '-' }}

<x-mail::button :url="$url">
Login ke Sistem
</x-mail::button>

Jika Anda memerlukan bantuan, silakan hubungi Admin LPPM universitas Anda.

Terima kasih,<br>
Tim **Journal MU**

---
*Email ini dikirim otomatis oleh sistem Journal MU. Harap tidak membalas email ini.*
</x-mail::message>
