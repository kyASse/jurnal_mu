<?php

namespace App\Http\Requests\Doi\Admin;

use Illuminate\Foundation\Http\FormRequest;

class DoiBankAccountRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'bank_name' => ['required', 'string', 'max:100'],
            'bank_code' => ['nullable', 'string', 'max:20'],
            'account_number' => ['required', 'string', 'max:50'],
            'account_holder' => ['required', 'string', 'max:150'],
            'branch_name' => ['nullable', 'string', 'max:100'],
            'qr_code_url' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'display_order' => ['nullable', 'integer', 'min:0'],
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
            'bank_name.required' => 'Nama bank wajib diisi.',
            'account_number.required' => 'Nomor rekening wajib diisi.',
            'account_holder.required' => 'Nama pemilik rekening wajib diisi.',
        ];
    }
}
