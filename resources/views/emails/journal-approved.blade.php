<x-mail::message>
# Jurnal Anda Telah Disetujui

Halo, {{ $journal->user->name }}!

Selamat! Pengajuan jurnal Anda di platform **Journal MU** telah ditinjau dan disetujui oleh Admin LPPM universitas Anda. Jurnal Anda sekarang terlihat di platform.

**Detail Jurnal:**
- **Judul:** {{ $journal->title }}
@if($journal->issn)
- **ISSN:** {{ $journal->issn }}
@endif
@if($journal->e_issn)
- **E-ISSN:** {{ $journal->e_issn }}
@endif
- **Universitas:** {{ $journal->university->name ?? '-' }}
- **Tanggal Disetujui:** {{ now()->format('d M Y') }}

Anda dapat melihat detail jurnal dan mulai mengelola submission serta proses akreditasi.

<x-mail::button :url="$url">
Lihat Jurnal
</x-mail::button>

Terima kasih,<br>
Tim **Journal MU**

---
*Email ini dikirim otomatis oleh sistem Journal MU. Harap tidak membalas email ini.*
</x-mail::message>
