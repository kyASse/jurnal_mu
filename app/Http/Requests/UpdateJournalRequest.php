<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJournalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Basic Info
            'title' => 'required|string|max:255',
            'issn' => 'nullable|string|max:20|regex:/^\d{4}-\d{4}$/',
            'e_issn' => 'nullable|string|max:20|regex:/^\d{4}-\d{4}$/',
            'url' => 'required|url|max:500',

            // Publication Details
            'publisher' => 'nullable|string|max:255',
            'frequency' => 'required|string|max:50',
            'first_published_year' => 'nullable|integer|min:1900|max:'.(date('Y') + 1),

            // Classification
            'scientific_field_id' => 'required|exists:scientific_fields,id',

            // SINTA
            'sinta_rank' => 'nullable|integer|min:1|max:6',
            'sinta_indexed_date' => 'nullable|date|before_or_equal:today',

            // Dikti Accreditation
            'accreditation_status' => 'nullable|string|max:50',
            'accreditation_grade' => 'nullable|string|max:10',
            'dikti_accreditation_number' => 'nullable|string|max:50',
            'accreditation_issued_date' => [
                'nullable',
                'date',
                'before_or_equal:today',
                'before:accreditation_expiry_date',
            ],
            'accreditation_expiry_date' => [
                'nullable',
                'date',
                'after:accreditation_issued_date',
            ],

            // Indexations
            'indexations' => 'nullable|array',
            'indexations.*.platform' => 'required|string|in:Scopus,WoS,DOAJ,Copernicus,Google Scholar,Garuda,Dimensions,BASE',
            'indexations.*.indexed_at' => 'nullable|date|before_or_equal:today',

            // Contact
            'editor_in_chief' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',

            // Additional Info
            'oai_pmh_url' => 'nullable|url|max:500',
            'about' => 'nullable|string|max:1000',
            'scope' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul jurnal wajib diisi.',
            'url.required' => 'URL jurnal wajib diisi.',
            'url.url' => 'Format URL tidak valid.',
            'scientific_field_id.required' => 'Bidang ilmu wajib dipilih.',
            'scientific_field_id.exists' => 'Bidang ilmu tidak valid.',
            'issn.regex' => 'Format ISSN harus xxxx-xxxx.',
            'e_issn.regex' => 'Format E-ISSN harus xxxx-xxxx.',
            'sinta_rank.min' => 'SINTA rank harus antara 1-6.',
            'sinta_rank.max' => 'SINTA rank harus antara 1-6.',
            'accreditation_issued_date.before' => 'Tanggal terbit akreditasi harus sebelum tanggal kedaluwarsa.',
            'accreditation_expiry_date.after' => 'Tanggal kedaluwarsa harus setelah tanggal terbit.',
            'indexations.*.platform.in' => 'Platform indeksasi tidak valid.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Transform indexations from frontend format to database format
        if ($this->has('indexations') && is_array($this->indexations)) {
            $transformed = [];
            foreach ($this->indexations as $item) {
                if (isset($item['platform'])) {
                    $transformed[$item['platform']] = [
                        'indexed_at' => $item['indexed_at'] ?? null,
                    ];
                }
            }
            $this->merge(['indexations' => $transformed]);
        }
    }
}
