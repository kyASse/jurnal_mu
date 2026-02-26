<x-mail::message>
# Registrasi Admin LPPM Ditolak

Halo, {{ $lppm->name }},

Kami telah meninjau permohonan registrasi Anda sebagai **Admin LPPM (Admin Kampus)** di platform **Journal MU**, dan dengan menyesal kami sampaikan bahwa permohonan Anda tidak dapat disetujui saat ini.

**Detail Pendaftaran:**
- **Nama:** {{ $lppm->name }}
- **Email:** {{ $lppm->email }}
- **Universitas:** {{ $lppm->university->name ?? '-' }}

## Alasan Penolakan

{{ $reason }}

Jika Anda merasa ada kekeliruan atau ingin mengajukan permohonan kembali, silakan hubungi tim Dikti melalui kontak yang tersedia.

<x-mail::button :url="$url" color="red">
Kembali ke Halaman Login
</x-mail::button>

Terima kasih atas perhatian Anda,<br>
Tim **Journal MU**

---
*Email ini dikirim otomatis oleh sistem Journal MU. Harap tidak membalas email ini.*
</x-mail::message>
