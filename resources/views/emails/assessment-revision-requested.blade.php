<x-mail::message>
# Permintaan Revisi Penilaian Jurnal

Yth. {{ $assessment->user->name }},

Administrator telah meninjau asesmen mandiri Anda untuk jurnal **{{ $assessment->journal->title }}** dan meminta beberapa perbaikan (revisi).

**Jurnal:** {{ $assessment->journal->title }}  
**ISSN:** {{ $assessment->journal->issn }}  
**Diajukan pada:** {{ $assessment->submitted_at?->format('d M Y H:i') }} WIB  
**Ditinjau pada:** {{ $assessment->reviewed_at?->format('d M Y H:i') }} WIB

## Catatan Perbaikan (Feedback)

{{ $adminNotes }}

## Langkah Selanjutnya

Asesmen Anda telah dikembalikan menjadi status **Draf**. Silakan tinjau kembali masukan dari administrator, lakukan perubahan yang diperlukan, dan ajukan kembali asesmen Anda.

<x-mail::button :url="$url" color="error">
Perbaiki Asesmen
</x-mail::button>

Jika Anda memiliki pertanyaan terkait perbaikan yang diminta, silakan hubungi Admin LPPM universitas Anda.

Terima kasih,

**Tim Journal MU**
</x-mail::message>

---
*Email ini dikirim otomatis oleh sistem Journal MU. Harap tidak membalas email ini.*
