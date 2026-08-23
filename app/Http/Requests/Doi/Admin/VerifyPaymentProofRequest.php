<?php

namespace App\Http\Requests\Doi\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class VerifyPaymentProofRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && $user->isSuperAdmin() && $user->is_active;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isReject = $this->routeIs('*reject*') || $this->input('action') === 'reject' || $this->input('status') === 'rejected';

        return [
            'admin_notes' => $isReject ? ['required', 'string', 'max:1000'] : ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'admin_notes.required' => 'Catatan verifikasi wajib diisi ketika menolak bukti pembayaran.',
            'admin_notes.string' => 'Catatan verifikasi harus berupa teks.',
            'admin_notes.max' => 'Catatan verifikasi maksimal 1000 karakter.',
        ];
    }
}
