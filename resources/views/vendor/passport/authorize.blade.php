<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Otorisasi Aplikasi - {{ config('app.name', 'Journal MU') }}</title>
    @vite(['resources/css/app.css'])
</head>
<body class="bg-slate-50 text-slate-800 flex items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div class="text-center mb-6">
            <h1 class="text-xl font-bold text-slate-900">Permintaan Otorisasi Akun</h1>
            <p class="text-sm text-slate-500 mt-1">Single Sign-On JurnalMu</p>
        </div>

        <div class="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 mb-6">
            <p class="text-sm text-indigo-900 leading-relaxed">
                Aplikasi <strong class="font-semibold text-indigo-950">{{ $client->name }}</strong> meminta izin untuk mengakses informasi profil akun JurnalMu Anda.
            </p>
        </div>

        <div class="space-y-3 mb-8">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Informasi yang akan dibagikan:</p>
            <ul class="text-sm text-slate-600 space-y-2">
                <li class="flex items-center gap-2">
                    <span class="text-emerald-500 font-bold">✓</span> Identitas Profil (Nama, Email, Foto)
                </li>
                <li class="flex items-center gap-2">
                    <span class="text-emerald-500 font-bold">✓</span> Status dan Peran (Role) di JurnalMu
                </li>
                <li class="flex items-center gap-2">
                    <span class="text-emerald-500 font-bold">✓</span> Afiliasi Perguruan Tinggi (PTMA)
                </li>
            </ul>
        </div>

        <div class="flex items-center gap-3">
            {{-- Deny Form --}}
            <form method="post" action="{{ route('passport.authorizations.deny') }}" class="w-1/2">
                @csrf
                @method('DELETE')
                <input type="hidden" name="state" value="{{ $request->state }}">
                <input type="hidden" name="client_id" value="{{ $client->id }}">
                <input type="hidden" name="auth_token" value="{{ $authToken }}">
                <button type="submit" class="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition">
                    Tolak
                </button>
            </form>

            {{-- Approve Form --}}
            <form method="post" action="{{ route('passport.authorizations.approve') }}" class="w-1/2">
                @csrf
                <input type="hidden" name="state" value="{{ $request->state }}">
                <input type="hidden" name="client_id" value="{{ $client->id }}">
                <input type="hidden" name="auth_token" value="{{ $authToken }}">
                <button type="submit" class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-100 transition">
                    Izinkan Akses
                </button>
            </form>
        </div>
    </div>
</body>
</html>
