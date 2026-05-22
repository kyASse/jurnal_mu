<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UniversityController extends Controller
{
    public function edit(Request $request)
    {
        $university = $request->user()->university;

        if (! $university) {
            return redirect()->route('dashboard')->with('error', 'Universitas tidak ditemukan.');
        }

        return Inertia::render('AdminKampus/University/Edit', [
            'university' => $university,
        ]);
    }

    public function update(Request $request)
    {
        $university = $request->user()->university;

        if (! $university) {
            return redirect()->route('dashboard')->with('error', 'Universitas tidak ditemukan.');
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:20',
            'ptm_code' => 'nullable|string|max:20',
            'short_name' => 'nullable|string|max:100',
            'profile_description' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'accreditation_status' => 'nullable|string|max:50',
            'cluster' => 'nullable|string|max:50',
        ]);

        if ($request->hasFile('logo_file')) {
            // Delete old logo if it exists in storage
            if ($university->logo_url && \Illuminate\Support\Str::startsWith($university->logo_url, '/storage/logos/')) {
                $oldPath = str_replace('/storage/', '', $university->logo_url);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }

            $file = $request->file('logo_file');
            $filename = 'logo_' . $university->id . '_' . time() . '.' . $file->extension();
            $path = $file->storeAs('logos', $filename, 'public');
            $validated['logo_url'] = '/storage/' . $path;
        }

        unset($validated['logo_file']);

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
