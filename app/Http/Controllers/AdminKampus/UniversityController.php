<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\University;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UniversityController extends Controller
{
    public function edit(Request $request)
    {
        $university = $request->user()->university;

        if (!$university) {
            return redirect()->route('dashboard')->with('error', 'Universitas tidak ditemukan.');
        }

        return Inertia::render('AdminKampus/University/Edit', [
            'university' => $university
        ]);
    }

    public function update(Request $request)
    {
        $university = $request->user()->university;

        if (!$university) {
            return redirect()->route('dashboard')->with('error', 'Universitas tidak ditemukan.');
        }

        $validated = $request->validate([
            'profile_description' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
        ]);

        $university->update($validated);

        return redirect()->back()->with('success', 'Profil Universitas berhasil diperbarui.');
    }
}
