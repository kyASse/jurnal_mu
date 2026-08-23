<?php

namespace App\Imports;

use App\Models\Journal;
use Illuminate\Support\Facades\Validator;

/**
 * CSV Import for Journals
 *
 * Simplified CSV format per Meeting Notes 11 Feb 2026:
 * - Generic fields only (title, publisher, issn, e_issn, url, oai_url, etc.)
 * - No scientific_field_name (assigned later by user)
 * - No indexations in CSV (managed via UI)
 * - sinta_rank mapped from integer to string enum
 * - Auto-assigns to LPPM user who performs import
 * - Sets approval_status to 'pending'
 */
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

        // Normalize headers (trim and lowercase, strip BOM)
        $headers = array_map(function ($h) {
            $h = trim($h);
            // Remove BOM if present
            $h = preg_replace('/^\xEF\xBB\xBF/', '', $h);

            return strtolower($h);
        }, $headers);

        // Validate required headers
        $requiredHeaders = ['title', 'e_issn', 'url', 'oai_url'];
        $missingHeaders = array_diff($requiredHeaders, $headers);

        if (!empty($missingHeaders)) {
            fclose($file);
            throw new \Exception('Kolom wajib berikut tidak ditemukan dalam file CSV: '.implode(', ', $missingHeaders));
        }

        $rowNumber = 1; // Start from 1 (header is row 0)

        // Process each data row
        while (($data = fgetcsv($file)) !== false) {
            $rowNumber++;

            // Skip empty rows
            if (empty(array_filter($data))) {
                continue;
            }

            // Combine headers with data
            if (count($headers) !== count($data)) {
                $this->addError($rowNumber, ['Jumlah kolom tidak sesuai dengan header']);

                continue;
            }

            $row = array_combine($headers, $data);

            if ($row === false) {
                $this->addError($rowNumber, ['Jumlah kolom tidak sesuai dengan header']);

                continue;
            }

            $this->processRow($row, $rowNumber);
        }

        fclose($file);
    }

    /**
     * Helper to collect error records (capped at 50 to avoid session bloat)
     */
    protected function addError(int $rowNumber, array $errors): void
    {
        $this->errorCount++;

        if (count($this->errors) < 50) {
            $this->errors[] = [
                'row' => $rowNumber,
                'errors' => $errors,
            ];
        }
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
                $this->addError($rowNumber, $validator->errors()->all());

                return;
            }

            $validated = $validator->validated();

            // Check for duplicate ISSN/E-ISSN within same university
            if ($this->isDuplicateIssn($validated)) {
                $this->addError($rowNumber, ['ISSN atau E-ISSN sudah terdaftar untuk universitas ini.']);

                return;
            }

            // Map sinta_rank from integer to string enum
            $sintaRank = $this->mapSintaRank($validated['sinta_rank'] ?? null);

            // Prepare journal data
            $journalData = [
                'title' => $validated['title'],
                'issn' => $validated['issn'] ?? null,
                'e_issn' => $validated['e_issn'],
                'publisher' => $validated['publisher'] ?? null,
                'first_published_year' => $validated['publication_year'] ?? null,
                'sinta_rank' => $sintaRank,
                'url' => $validated['url'] ?? null,
                'oai_urls' => isset($validated['oai_url']) && !empty($validated['oai_url']) ? [$validated['oai_url']] : [],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'university_id' => $this->universityId,
                'user_id' => $this->userId,
                'is_active' => true,
                'approval_status' => 'pending',
            ];

            // Create the journal
            Journal::create($journalData);
            $this->successCount++;

        } catch (\Exception $e) {
            $this->addError($rowNumber, ['Error: '.$e->getMessage()]);
        }
    }

    /**
     * Map sinta_rank from CSV integer value to string enum
     */
    protected function mapSintaRank($value): string
    {
        if ($value === null || $value === '') {
            return 'non_sinta';
        }

        $trimmed = strtolower(trim((string) $value));

        if ($trimmed === '' || $trimmed === 'non_sinta') {
            return 'non_sinta';
        }

        // If matches sinta_X or sinta X (where X is 1-6) -> return sinta_X
        if (preg_match('/^sinta[_\s]?([1-6])$/', $trimmed, $matches)) {
            return 'sinta_'.$matches[1];
        }

        // If matches integer 1..6 -> return sinta_X
        if (preg_match('/^([1-6])$/', $trimmed, $matches)) {
            return 'sinta_'.$matches[1];
        }

        return 'non_sinta';
    }

    /**
     * Validation rules for each row
     */
    protected function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'publisher' => 'nullable|string|max:500',
            'issn' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^\d{4}-\d{3}[\dX]$/i',
            ],
            'e_issn' => [
                'required',
                'string',
                'max:20',
                'regex:/^\d{4}-\d{3}[\dX]$/i',
            ],
            'publication_year' => 'nullable|integer|min:1900|max:'.(now()->year + 1),
            'sinta_rank' => 'nullable|string|in:1,2,3,4,5,6,sinta_1,sinta_2,sinta_3,sinta_4,sinta_5,sinta_6,non_sinta',
            'url' => 'required|url|max:500',
            'oai_url' => 'required|url|max:500',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
        ];
    }

    /**
     * Custom validation messages
     */
    protected function messages(): array
    {
        return [
            'title.required' => 'Judul jurnal wajib diisi.',
            'e_issn.required' => 'E-ISSN wajib diisi.',
            'issn.regex' => 'Format ISSN harus xxxx-xxxx (karakter terakhir boleh \'X\').',
            'e_issn.regex' => 'Format E-ISSN harus xxxx-xxxx (karakter terakhir boleh \'X\').',
            'publication_year.integer' => 'Tahun terbit harus berupa angka.',
            'sinta_rank.in' => 'Ranking SINTA tidak valid.',
            'url.required' => 'URL jurnal wajib diisi.',
            'url.url' => 'URL tidak valid.',
            'oai_url.required' => 'URL OAI-PMH wajib diisi.',
            'oai_url.url' => 'URL OAI-PMH tidak valid.',
            'email.email' => 'Format email tidak valid.',
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
