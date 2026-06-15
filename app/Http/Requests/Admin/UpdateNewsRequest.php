<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $newsId = $this->route('news')->id;
        $rules = [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:news,slug,'.$newsId,
            'subtitle' => 'nullable|string|max:255',
            'body' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
        ];

        if ($this->hasFile('thumbnail')) {
            $rules['thumbnail'] = 'image|max:2048';
        }

        if ($this->hasFile('image')) {
            $rules['image'] = 'image|max:4096';
        }

        return $rules;
    }
}
