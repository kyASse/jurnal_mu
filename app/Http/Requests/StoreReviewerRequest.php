<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by ReviewerPolicy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'reviewer_expertise' => 'nullable|array',
            'reviewer_expertise.*' => 'exists:scientific_fields,id',
            'reviewer_bio' => 'nullable|string|max:1000',
            'max_assignments' => 'nullable|integer|min:1|max:20',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'user_id' => 'user',
            'reviewer_expertise' => 'areas of expertise',
            'reviewer_expertise.*' => 'expertise field',
            'reviewer_bio' => 'biography',
            'max_assignments' => 'maximum assignments',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'Please select a user to promote to reviewer.',
            'user_id.exists' => 'The selected user does not exist.',
            'reviewer_expertise.array' => 'Expertise must be a list of scientific fields.',
            'reviewer_expertise.*.exists' => 'One or more selected expertise fields are invalid.',
            'reviewer_bio.max' => 'Biography cannot exceed 1000 characters.',
            'max_assignments.min' => 'Maximum assignments must be at least 1.',
            'max_assignments.max' => 'Maximum assignments cannot exceed 20.',
        ];
    }
}
