<?php

namespace App\Http\Requests\Doi\Admin;

use App\Enums\Doi\QuotaChangeType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdjustQuotaRequest extends FormRequest
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
        return [
            'amount' => ['required', 'integer', 'min:1'],
            'description' => ['required', 'string', 'max:255'],
            'change_type' => ['nullable', 'string', Rule::enum(QuotaChangeType::class)],
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
            'amount.required' => 'Jumlah penambahan kuota wajib diisi.',
            'amount.integer' => 'Jumlah penambahan kuota harus berupa angka bulat.',
            'amount.min' => 'Jumlah penambahan kuota minimal 1.',
            'description.required' => 'Keterangan penyesuaian kuota wajib diisi.',
            'description.string' => 'Keterangan penyesuaian kuota harus berupa teks.',
            'description.max' => 'Keterangan penyesuaian kuota maksimal 255 karakter.',
            'change_type.enum' => 'Tipe perubahan kuota tidak valid.',
        ];
    }
}
