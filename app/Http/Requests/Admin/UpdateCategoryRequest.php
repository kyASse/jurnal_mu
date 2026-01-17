<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isSuperAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'weight' => ['required', 'numeric', 'min:0', 'max:100'],
            'display_order' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function attributes(): array
    {
        return [
            'code' => 'kode kategori',
            'name' => 'nama kategori',
            'description' => 'deskripsi',
            'weight' => 'bobot',
            'display_order' => 'urutan tampilan',
        ];
    }

    public function messages(): array
    {
        return [
            'weight.max' => 'Bobot kategori tidak boleh melebihi 100.',
            'weight.min' => 'Bobot kategori tidak boleh negatif.',
        ];
    }
}
