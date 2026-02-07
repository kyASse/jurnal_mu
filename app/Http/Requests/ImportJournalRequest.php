<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportJournalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isAdminKampus() && $this->user()->is_active;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'csv_file' => [
                'required',
                'file',
                'mimes:csv,txt',
                'max:5120', // 5MB max
            ],
            'user_id' => [
                'required',
                'exists:users,id',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'csv_file.required' => 'File CSV harus diunggah.',
            'csv_file.file' => 'File yang diunggah harus berupa file valid.',
            'csv_file.mimes' => 'File harus berformat CSV (.csv atau .txt).',
            'csv_file.max' => 'Ukuran file maksimal 5MB.',
            'user_id.required' => 'Pengelola jurnal harus dipilih.',
            'user_id.exists' => 'Pengelola jurnal tidak valid.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure user_id is an integer
        if ($this->has('user_id')) {
            $this->merge([
                'user_id' => (int) $this->user_id,
            ]);
        }
    }
}
