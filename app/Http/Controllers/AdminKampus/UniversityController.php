<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
            'name' => 'nullable|string|max:150',
            'code' => 'nullable|string|max:20',
            'ptm_code' => 'nullable|string|max:10',
            'short_name' => 'nullable|string|max:20',
            'profile_description' => 'nullable|string|max:250',
            'website' => 'nullable|string|max:255',
            'email' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'accreditation_status' => 'nullable|string|in:Unggul,Baik Sekali,Baik,Cukup,A,B,C,-',
            'cluster' => 'nullable|string|in:Mandiri,Utama,Madya,Pratama,Binaan',
        ]);

        if ($request->hasFile('logo_file')) {
            // Delete old logo if it exists in storage
            if ($university->logo_url && Str::startsWith($university->logo_url, '/storage/logos/')) {
                $oldPath = str_replace('/storage/', '', $university->logo_url);
                Storage::disk('public')->delete($oldPath);
            }

            $file = $request->file('logo_file');
            $filename = 'logo_'.$university->id.'_'.time().'.'.$file->extension();
            $path = $file->storeAs('logos', $filename, 'public');
            $validated['logo_url'] = '/storage/'.$path;
        }

        unset($validated['logo_file']);

        $oldPendingUpdates = $university->pending_updates ?? [];
        $pendingUpdates = $oldPendingUpdates;
        $restrictedFields = ['name', 'code', 'ptm_code'];

        foreach ($restrictedFields as $field) {
            if (array_key_exists($field, $validated)) {
                if ($validated[$field] !== $university->$field) {
                    $pendingUpdates[$field] = $validated[$field];
                } else {
                    unset($pendingUpdates[$field]);
                }
                unset($validated[$field]); // Remove from direct update
            }
        }

        if ($pendingUpdates !== $oldPendingUpdates) {
            $validated['pending_updates'] = empty($pendingUpdates) ? null : $pendingUpdates;
            $message = 'Profil Universitas berhasil diperbarui. Perubahan nama, singkatan, atau kode universitas sedang menunggu persetujuan Dikti.';
        } else {
            $message = 'Profil Universitas berhasil diperbarui.';
        }

        $university->update($validated);

        return redirect()->back()->with('success', $message);
    }
}
