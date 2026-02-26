<x-mail::message>
# Pengajuan Jurnal Ditolak

Halo, {{ $journal->user->name }},

Kami telah meninjau pengajuan jurnal Anda di platform **Journal MU**, dan dengan menyesal kami sampaikan bahwa pengajuan jurnal berikut tidak dapat disetujui saat ini.

**Detail Jurnal:**
- **Judul:** {{ $journal->title }}
@if($journal->issn)
- **ISSN:** {{ $journal->issn }}
@endif
@if($journal->e_issn)
- **E-ISSN:** {{ $journal->e_issn }}
@endif
- **Universitas:** {{ $journal->university->name ?? '-' }}

## Alasan Penolakan

{{ $reason }}

## Langkah Selanjutnya

Silakan perbarui data jurnal Anda sesuai dengan catatan di atas, kemudian ajukan kembali untuk mendapatkan persetujuan.

<x-mail::button :url="$url">
Lihat Detail Jurnal
</x-mail::button>

Jika ada pertanyaan, silakan hubungi Admin LPPM universitas Anda.

Terima kasih,<br>
Tim **Journal MU**

---
*Email ini dikirim otomatis oleh sistem Journal MU. Harap tidak membalas email ini.*
</x-mail::message>
