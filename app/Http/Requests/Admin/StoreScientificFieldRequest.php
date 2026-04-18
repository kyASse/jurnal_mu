<?php

namespace App\Http\Requests\Admin;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;

class StoreScientificFieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(Role::SUPER_ADMIN);
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'unique:scientific_fields,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'parent_id' => ['nullable', 'exists:scientific_fields,id'],
            'is_active' => ['boolean'],
        ];
    }
}
