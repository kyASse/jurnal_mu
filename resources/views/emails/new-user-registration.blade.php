<x-mail::message>
# Pengelola Jurnal Baru Menunggu Persetujuan

Halo,

Ada pendaftar **Pengelola Jurnal** baru dari universitas Anda di platform **Journal MU** yang menunggu persetujuan Anda.

**Detail Pendaftar:**
- **Nama:** {{ $applicant->name }}
- **Email:** {{ $applicant->email }}
- **Universitas:** {{ $applicant->university->name ?? '-' }}
- **Jabatan:** {{ $applicant->position ?? '-' }}
- **Waktu Daftar:** {{ $applicant->created_at->format('d M Y H:i') }} WIB

Silakan tinjau permohonan ini dan berikan keputusan persetujuan atau penolakan melalui panel Admin Kampus.

<x-mail::button :url="$url">
Tinjau Pendaftar
</x-mail::button>

Terima kasih,<br>
Tim **Journal MU**

---
*Email ini dikirim otomatis oleh sistem Journal MU. Harap tidak membalas email ini.*
</x-mail::message>
