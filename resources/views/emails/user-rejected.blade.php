<x-mail::message>
# Pendaftaran Akun Ditolak

Halo, {{ $applicant->name }},

Kami telah meninjau permohonan pendaftaran akun Anda di platform **Journal MU**, dan dengan menyesal kami sampaikan bahwa pendaftaran Anda tidak dapat disetujui saat ini.

**Detail Akun:**
- **Nama:** {{ $applicant->name }}
- **Email:** {{ $applicant->email }}
- **Universitas:** {{ $applicant->university->name ?? '-' }}

## Alasan Penolakan

{{ $reason }}

Jika Anda merasa ada kekeliruan atau ingin mengajukan permohonan kembali setelah memperbaiki persyaratan, silakan hubungi Admin LPPM universitas Anda.

<x-mail::button :url="$url" color="red">
Hubungi Admin LPPM
</x-mail::button>

Terima kasih atas perhatian Anda,<br>
Tim **Journal MU**

---
*Email ini dikirim otomatis oleh sistem Journal MU. Harap tidak membalas email ini.*
</x-mail::message>
