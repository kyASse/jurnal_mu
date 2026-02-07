<?php

namespace App\Imports;

use App\Models\Journal;
use App\Models\ScientificField;
use Illuminate\Support\Facades\Validator;

class JournalsImport
{
    protected int $universityId;
    protected int $userId;
    protected array $errors = [];
    protected int $successCount = 0;
    protected int $errorCount = 0;

    public function __construct(int $universityId, int $userId)
    {
        $this->universityId = $universityId;
        $this->userId = $userId;
    }

    /**
     * Process CSV file and import journals
     */
    public function import(string $filePath): void
    {
        $file = fopen($filePath, 'r');
        
        if (!$file) {
            throw new \Exception('Unable to open CSV file');
        }

        // Read header row
        $headers = fgetcsv($file);
        
        if (!$headers) {
            fclose($file);
            throw new \Exception('CSV file is empty or invalid');
        }

        // Normalize headers (trim and lowercase)
        $headers = array_map(fn($h) => trim(strtolower($h)), $headers);

        $rowNumber = 1; // Start from 1 (header is row 0)

        // Process each data row
        while (($data = fgetcsv($file)) !== false) {
            $rowNumber++;
            
            // Skip empty rows
            if (empty(array_filter($data))) {
                continue;
            }

            // Combine headers with data
            $row = array_combine($headers, $data);
            
            if ($row === false) {
                $this->errors[] = [
                    'row' => $rowNumber,
                    'errors' => ['Jumlah kolom tidak sesuai dengan header'],
                ];
                $this->errorCount++;
                continue;
            }

            $this->processRow($row, $rowNumber);
        }

        fclose($file);
    }

    /**
     * Process a single row from CSV
     */
    protected function processRow(array $row, int $rowNumber): void
    {
        try {
            // Validate the row data
            $validator = Validator::make($row, $this->rules(), $this->messages());
            
            if ($validator->fails()) {
                $this->errors[] = [
                    'row' => $rowNumber,
                    'errors' => $validator->errors()->all(),
                ];
                $this->errorCount++;
                return;
            }

            $validated = $validator->validated();

            // Check for duplicate ISSN/E-ISSN within same university
            if ($this->isDuplicateIssn($validated)) {
                $this->errors[] = [
                    'row' => $rowNumber,
                    'errors' => ['ISSN atau E-ISSN sudah terdaftar untuk universitas ini.'],
                ];
                $this->errorCount++;
                return;
            }

            // Find scientific field by name if provided
            $scientificFieldId = null;
            if (!empty($validated['scientific_field_name'])) {
                $scientificField = ScientificField::where('name', 'like', '%' . $validated['scientific_field_name'] . '%')->first();
                if ($scientificField) {
                    $scientificFieldId = $scientificField->id;
                } else {
                    $this->errors[] = [
                        'row' => $rowNumber,
                        'errors' => ['Bidang ilmu "' . $validated['scientific_field_name'] . '" tidak ditemukan.'],
                    ];
                    $this->errorCount++;
                    return;
                }
            }

            // Prepare journal data
            $journalData = [
                'title' => $validated['title'],
                'issn' => $validated['issn'] ?? null,
                'e_issn' => $validated['e_issn'] ?? null,
                'publisher' => $validated['publisher'],
                'publication_year' => $validated['publication_year'] ?? null,
                'sinta_rank' => $validated['sinta_rank'] ?? null,
                'accreditation_rank' => $validated['accreditation_rank'] ?? null,
                'accreditation_expiry_date' => $validated['accreditation_expiry_date'] ?? null,
                'url' => $validated['url'] ?? null,
                'ojs_url' => $validated['ojs_url'] ?? null,
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'about' => $validated['about'] ?? null,
                'scope' => $validated['scope'] ?? null,
                'university_id' => $this->universityId,
                'user_id' => $this->userId,
                'scientific_field_id' => $scientificFieldId,
                'is_active' => true,
            ];

            // Handle indexations (JSON array)
            if (!empty($validated['indexations'])) {
                $indexations = $this->parseIndexations($validated['indexations']);
                $journalData['indexations'] = $indexations;
            }

            // Create the journal
            Journal::create($journalData);
            $this->successCount++;

        } catch (\Exception $e) {
            $this->errors[] = [
                'row' => $rowNumber,
                'errors' => ['Error: ' . $e->getMessage()],
            ];
            $this->errorCount++;
        }
    }

    /**
     * Validation rules for each row
     */
    protected function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'publisher' => 'required|string|max:500',
            'issn' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^\d{4}-\d{4}$/',
            ],
            'e_issn' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^\d{4}-\d{4}$/',
            ],
            'scientific_field_name' => 'required|string|max:255',
            'publication_year' => 'nullable|integer|min:1900|max:' . (now()->year + 1),
            'sinta_rank' => 'nullable|integer|min:1|max:6',
            'accreditation_rank' => 'nullable|string|max:50',
            'accreditation_expiry_date' => 'nullable|date|date_format:Y-m-d',
            'url' => 'nullable|url|max:255',
            'ojs_url' => 'nullable|url|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'about' => 'nullable|string',
            'scope' => 'nullable|string',
            'indexations' => 'nullable|string',
        ];
    }

    /**
     * Custom validation messages
     */
    protected function messages(): array
    {
        return [
            'title.required' => 'Judul jurnal wajib diisi.',
            'publisher.required' => 'Penerbit wajib diisi.',
            'scientific_field_name.required' => 'Bidang ilmu wajib diisi.',
            'issn.regex' => 'Format ISSN harus: 1234-5678',
            'e_issn.regex' => 'Format E-ISSN harus: 1234-5678',
            'publication_year.integer' => 'Tahun terbit harus berupa angka.',
            'sinta_rank.integer' => 'Ranking SINTA harus berupa angka 1-6.',
            'url.url' => 'URL tidak valid.',
            'ojs_url.url' => 'URL OJS tidak valid.',
            'email.email' => 'Format email tidak valid.',
            'accreditation_expiry_date.date_format' => 'Format tanggal harus: YYYY-MM-DD',
        ];
    }

    /**
     * Check if ISSN or E-ISSN already exists for this university
     */
    protected function isDuplicateIssn(array $validated): bool
    {
        $query = Journal::where('university_id', $this->universityId);

        if (!empty($validated['issn'])) {
            $exists = (clone $query)->where('issn', $validated['issn'])->exists();
            if ($exists) {
                return true;
            }
        }

        if (!empty($validated['e_issn'])) {
            $exists = (clone $query)->where('e_issn', $validated['e_issn'])->exists();
            if ($exists) {
                return true;
            }
        }

        return false;
    }

    /**
     * Parse indexations string to associative array
     * Expected format: "Scopus (2020-01-01), WoS (2021-05-15)" or "DOAJ, Google Scholar"
     * Returns: ['Scopus' => '2020-01-01', 'WoS' => '2021-05-15']
     */
    protected function parseIndexations(string $indexations): array
    {
        $result = [];
        $parts = explode(',', $indexations);

        foreach ($parts as $part) {
            $part = trim($part);
            
            if (empty($part)) {
                continue;
            }
            
            // Match pattern: "IndexName (YYYY-MM-DD)"
            if (preg_match('/^(.+?)\s*\((\d{4}-\d{2}-\d{2})\)$/', $part, $matches)) {
                $platformName = trim($matches[1]);
                $indexedDate = $matches[2];
                $result[$platformName] = $indexedDate;
            } else {
                // If no date, use platform name as key with current date as value
                $result[$part] = now()->format('Y-m-d');
            }
        }

        return $result;
    }

    /**
     * Get import summary
     */
    public function getSummary(): array
    {
        return [
            'success_count' => $this->successCount,
            'error_count' => $this->errorCount,
            'errors' => $this->errors,
        ];
    }

    /**
     * Check if import has errors
     */
    public function hasErrors(): bool
    {
        return $this->errorCount > 0;
    }
}
