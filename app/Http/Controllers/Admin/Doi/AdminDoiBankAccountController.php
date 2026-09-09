<?php

namespace App\Http\Controllers\Admin\Doi;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doi\Admin\DoiBankAccountRequest;
use App\Models\DoiBankAccount;
use Illuminate\Http\RedirectResponse;

class AdminDoiBankAccountController extends Controller
{
    /**
     * Store a newly created bank account in storage.
     */
    public function store(DoiBankAccountRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['display_order'] = $validated['display_order'] ?? 0;

        DoiBankAccount::create($validated);

        return back()->with('success', 'Rekening bank berhasil ditambahkan.');
    }

    /**
     * Update the specified bank account in storage.
     */
    public function update(DoiBankAccountRequest $request, DoiBankAccount $bankAccount): RedirectResponse
    {
        $validated = $request->validated();
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['display_order'] = $validated['display_order'] ?? $bankAccount->display_order;

        $bankAccount->update($validated);

        return back()->with('success', 'Rekening bank berhasil diperbarui.');
    }

    /**
     * Remove the specified bank account from storage.
     */
    public function destroy(DoiBankAccount $bankAccount): RedirectResponse
    {
        if ($bankAccount->paymentProofs()->exists()) {
            return back()->with('error', 'Tidak dapat menghapus rekening bank yang telah memiliki riwayat transfer.');
        }

        $bankAccount->delete();

        return back()->with('success', 'Rekening bank berhasil dihapus.');
    }
}
