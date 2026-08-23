<?php

namespace App\Http\Requests\Doi\Admin;

use Illuminate\Foundation\Http\FormRequest;

class DoiSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && $user->isSuperAdmin() && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'doi_helpdesk_email' => ['required', 'email', 'max:255'],
            'doi_helpdesk_phone' => ['required', 'string', 'max:50'],
            'doi_helpdesk_hours' => ['nullable', 'string', 'max:100'],
            'doi_helpdesk_notes' => ['nullable', 'string'],
        ];
    }
}
