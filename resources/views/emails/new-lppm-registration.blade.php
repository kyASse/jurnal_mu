<x-mail::message>
# Pendaftaran LPPM Baru Menunggu Persetujuan

Halo,

Ada pendaftar **Admin LPPM (Admin Kampus)** baru di platform **Journal MU** yang menunggu persetujuan Anda.

**Detail Pendaftar:**
- **Nama:** {{ $applicant->name }}
- **Email:** {{ $applicant->email }}
- **Universitas:** {{ $applicant->university->name ?? '-' }}
- **Waktu Daftar:** {{ $applicant->created_at->format('d M Y H:i') }} WIB

Silakan tinjau permohonan ini dan berikan keputusan persetujuan atau penolakan melalui panel admin.

<x-mail::button :url="$url">
Tinjau Pendaftar LPPM
</x-mail::button>

Terima kasih,<br>
Tim **Journal MU**

---
*Email ini dikirim otomatis oleh sistem Journal MU. Harap tidak membalas email ini.*
</x-mail::message>
