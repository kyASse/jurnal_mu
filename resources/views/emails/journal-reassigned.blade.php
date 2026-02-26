<x-mail::message>
@if($type === 'assigned')
# Jurnal Baru Ditugaskan kepada Anda

Halo, {{ $journal->user->name }}!

Anda telah ditugaskan sebagai pengelola baru untuk jurnal berikut di platform **Journal MU**.

**Detail Jurnal:**
- **Judul:** {{ $journal->title }}
@if($journal->issn)
- **ISSN:** {{ $journal->issn }}
@endif
@if($journal->e_issn)
- **E-ISSN:** {{ $journal->e_issn }}
@endif
- **Universitas:** {{ $journal->university->name ?? '-' }}

Silakan tinjau jurnal ini dan mulai kelola sesuai tanggung jawab Anda.

<x-mail::button :url="$url">
Lihat Jurnal
</x-mail::button>
@else
# Pengelolaan Jurnal Dipindahkan

Halo,

Kami ingin memberitahukan bahwa pengelolaan jurnal berikut telah dipindahkan kepada pengelola lain.

**Detail Jurnal:**
- **Judul:** {{ $journal->title }}
@if($journal->issn)
- **ISSN:** {{ $journal->issn }}
@endif
- **Universitas:** {{ $journal->university->name ?? '-' }}

Anda tidak lagi menjadi pengelola jurnal tersebut. Jika ada pertanyaan, silakan hubungi Admin LPPM universitas Anda.

<x-mail::button :url="$url">
Lihat Daftar Jurnal Saya
</x-mail::button>
@endif

Terima kasih,<br>
Tim **Journal MU**

---
*Email ini dikirim otomatis oleh sistem Journal MU. Harap tidak membalas email ini.*
</x-mail::message>
