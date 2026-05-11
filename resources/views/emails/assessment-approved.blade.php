<x-mail::message>
# Penilaian Jurnal Disetujui

Yth. {{ $assessment->user->name }},

Kabar baik! Asesmen mandiri Anda untuk jurnal **{{ $assessment->journal->title }}** telah ditinjau dan **disetujui** oleh administrator.

**Jurnal:** {{ $assessment->journal->title }}  
**ISSN:** {{ $assessment->journal->issn }}  
**Diajukan pada:** {{ $assessment->submitted_at?->format('d M Y H:i') }} WIB  
**Ditinjau pada:** {{ $assessment->reviewed_at?->format('d M Y H:i') }} WIB

@if($adminNotes)
## Catatan Administrator

{{ $adminNotes }}
@endif

Anda sekarang dapat melihat laporan penilaian lengkap.

<x-mail::button :url="$url" color="success">
Lihat Hasil Penilaian
</x-mail::button>

Terima kasih telah menyelesaikan asesmen jurnal Anda.

Terima kasih,

**Tim Journal MU**
</x-mail::message>

---
*Email ini dikirim otomatis oleh sistem Journal MU. Harap tidak membalas email ini.*
