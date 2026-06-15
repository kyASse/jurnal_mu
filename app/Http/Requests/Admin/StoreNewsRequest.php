<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:news,slug',
            'subtitle' => 'nullable|string|max:255',
            'body' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
            'thumbnail' => 'nullable|image|max:2048',
            'image' => 'nullable|image|max:4096',
        ];
    }
}
