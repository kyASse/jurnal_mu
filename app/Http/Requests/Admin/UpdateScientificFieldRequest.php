<?php

namespace App\Http\Requests\Admin;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;

class UpdateScientificFieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(Role::SUPER_ADMIN);
    }

    public function rules(): array
    {
        $id = $this->route('scientific_field')->id ?? $this->route('scientific_field');

        return [
            'code' => ['required', 'string', 'max:50', 'unique:scientific_fields,code,'.$id],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'parent_id' => [
                'nullable',
                'exists:scientific_fields,id',
                function ($attribute, $value, $fail) use ($id) {
                    if ($value == $id) {
                        $fail('A scientific field cannot be its own parent.');
                    }
                },
            ],
            'is_active' => ['boolean'],
        ];
    }
}
