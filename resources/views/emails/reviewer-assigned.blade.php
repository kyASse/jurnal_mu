<x-mail::message>
# Anda Ditugaskan sebagai Reviewer

Halo, {{ $assessment->reviewer->name ?? 'Reviewer' }}!

Anda telah ditugaskan sebagai **Reviewer** untuk menilai assessment jurnal berikut di platform **Journal MU**.

**Detail Assessment:**
- **Judul Jurnal:** {{ $assessment->journal->title }}
@if($assessment->journal->issn)
- **ISSN:** {{ $assessment->journal->issn }}
@endif
- **Universitas:** {{ $assessment->journal->university->name ?? '-' }}
- **Periode Assessment:** {{ $assessment->period ?? '-' }}
- **Tanggal Ditugaskan:** {{ $assessment->assigned_at?->format('d M Y H:i') ?? now()->format('d M Y H:i') }} WIB

Silakan masuk ke sistem untuk melihat detail assignment dan mulai proses review Anda.

<x-mail::button :url="$url">
Lihat Assignment Saya
</x-mail::button>

Jika ada pertanyaan terkait penugasan ini, silakan hubungi tim Dikti.

Terima kasih,<br>
Tim **Journal MU**

---
*Email ini dikirim otomatis oleh sistem Journal MU. Harap tidak membalas email ini.*
</x-mail::message>
