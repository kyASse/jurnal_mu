<?php

namespace App\Http\Requests\Doi\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DoiPackageRequest extends FormRequest
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
        $packageId = $this->route('package')?->id ?? $this->route('package');

        return [
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', Rule::unique('doi_packages', 'code')->ignore($packageId)],
            'slug' => ['nullable', 'string', 'max:100', Rule::unique('doi_packages', 'slug')->ignore($packageId)],
            'description' => ['nullable', 'string'],
            'price_annual' => ['required', 'numeric', 'min:0'],
            'prefix_included' => ['boolean'],
            'similarity_quota_included' => ['required', 'integer', 'min:0'],
            'features' => ['nullable', 'array'],
            'features.*' => ['required', 'string', 'max:255'],
            'is_featured' => ['boolean'],
            'badge_text' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
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
            'name.required' => 'Nama paket wajib diisi.',
            'code.required' => 'Kode paket wajib diisi.',
            'code.unique' => 'Kode paket sudah digunakan.',
            'price_annual.required' => 'Harga tahunan wajib diisi.',
            'price_annual.numeric' => 'Harga tahunan harus berupa angka.',
            'similarity_quota_included.required' => 'Jumlah kuota similarity wajib diisi.',
            'similarity_quota_included.integer' => 'Jumlah kuota similarity harus berupa angka.',
        ];
    }
}
