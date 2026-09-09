<?php

namespace App\Http\Requests\Doi;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SubscribeDoiPackageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->isAdminKampus() && !empty($user->university_id);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'package_id' => ['required', 'integer', 'exists:doi_packages,id'],
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
            'package_id.required' => 'Paket langganan wajib dipilih.',
            'package_id.integer' => 'ID Paket harus berupa bilangan bulat.',
            'package_id.exists' => 'Paket langganan yang dipilih tidak valid.',
        ];
    }
}
