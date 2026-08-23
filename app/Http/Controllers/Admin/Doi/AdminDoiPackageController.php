<?php

namespace App\Http\Controllers\Admin\Doi;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doi\Admin\DoiPackageRequest;
use App\Models\DoiPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class AdminDoiPackageController extends Controller
{
    /**
     * Store a newly created package in storage.
     */
    public function store(DoiPackageRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $validated['prefix_included'] = $request->boolean('prefix_included', true);
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['is_featured'] = $request->boolean('is_featured', false);
        $validated['sort_order'] = (int) ($validated['sort_order'] ?? 0);
        if ($request->has('features')) {
            $validated['features'] = array_values(array_filter($request->input('features', []) ?? []));
        }

        DoiPackage::create($validated);

        return back()->with('success', 'Paket DOI berhasil ditambahkan.');
    }

    /**
     * Update the specified package in storage.
     */
    public function update(DoiPackageRequest $request, DoiPackage $package): RedirectResponse
    {
        $validated = $request->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $validated['prefix_included'] = $request->boolean('prefix_included', true);
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['is_featured'] = $request->boolean('is_featured', false);
        $validated['sort_order'] = (int) ($validated['sort_order'] ?? 0);
        if ($request->has('features')) {
            $validated['features'] = array_values(array_filter($request->input('features', []) ?? []));
        }

        $package->update($validated);

        return back()->with('success', 'Paket DOI berhasil diperbarui.');
    }

    /**
     * Remove the specified package from storage.
     */
    public function destroy(DoiPackage $package): RedirectResponse
    {
        if ($package->subscriptions()->exists()) {
            return back()->with('error', 'Tidak dapat menghapus paket yang memiliki langganan terkait.');
        }

        $package->delete();

        return back()->with('success', 'Paket DOI berhasil dihapus.');
    }
}
