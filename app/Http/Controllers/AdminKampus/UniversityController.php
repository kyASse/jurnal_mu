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
            'name' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:20',
            'ptm_code' => 'nullable|string|max:20',
            'profile_description' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
        ]);

        $pendingUpdates = $university->pending_updates ?? [];
        $hasPendingUpdates = false;

        // Check if restricted fields are modified
        $restrictedFields = ['name', 'code', 'ptm_code'];
        foreach ($restrictedFields as $field) {
            if (isset($validated[$field]) && $validated[$field] !== $university->$field) {
                $pendingUpdates[$field] = $validated[$field];
                $hasPendingUpdates = true;
            }
            unset($validated[$field]); // Remove from direct update
        }

        if ($hasPendingUpdates) {
            $validated['pending_updates'] = $pendingUpdates;
            $message = 'Profil Universitas berhasil diperbarui. Perubahan nama, singkatan, atau kode universitas sedang menunggu persetujuan Dikti.';
        } else {
            $message = 'Profil Universitas berhasil diperbarui.';
        }

        $university->update($validated);

        return redirect()->back()->with('success', $message);
    }
}
