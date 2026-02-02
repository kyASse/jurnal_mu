<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Journal extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'university_id',
        'user_id',
        'title',
        'issn',
        'e_issn',
        'url',
        'publisher',
        'frequency',
        'first_published_year',
        'scientific_field_id',
        'sinta_rank',
        'sinta_indexed_date',
        'accreditation_status',
        'accreditation_grade',
        'dikti_accreditation_number',
        'accreditation_issued_date',
        'accreditation_expiry_date',
        'indexations',
        'editor_in_chief',
        'email',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'first_published_year' => 'integer',
        'sinta_rank' => 'integer',
        'sinta_indexed_date' => 'date',
        'accreditation_issued_date' => 'date',
        'accreditation_expiry_date' => 'date',
        'indexations' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the university that owns this journal
     */
    public function university()
    {
        return $this->belongsTo(University::class);
    }

    /**
     * Get the user (pengelola) who manages this journal
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the scientific field of this journal
     */
    public function scientificField()
    {
        return $this->belongsTo(ScientificField::class);
    }

    /**
     * Get all assessments for this journal
     */
    public function assessments()
    {
        return $this->hasMany(JournalAssessment::class);
    }

    /**
     * Get the latest assessment
     */
    public function latestAssessment()
    {
        return $this->hasOne(JournalAssessment::class)->latestOfMany();
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get only active journals
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by university
     */
    public function scopeForUniversity($query, int $universityId)
    {
        return $query->where('university_id', $universityId);
    }

    /**
     * Scope to filter by user (pengelola)
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to filter by SINTA rank
     * 
     * @param mixed $rank - integer (1-6) for specific rank, 'non_sinta' for journals without SINTA rank
     */
    public function scopeBySintaRank($query, $rank)
    {
        if (!$rank) {
            return $query;
        }

        // Handle "Non Sinta" filter
        if ($rank === 'non_sinta') {
            return $query->whereNull('sinta_rank');
        }

        return $query->where('sinta_rank', $rank);
    }

    /**
     * Scope to search journals
     */
    public function scopeSearch($query, ?string $search)
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('issn', 'like', "%{$search}%")
                ->orWhere('e_issn', 'like', "%{$search}%");
        });
    }

    /**
     * Scope to filter by assessment status
     */
    public function scopeByAssessmentStatus($query, ?string $status)
    {
        if (!$status) {
            return $query;
        }

        return $query->whereHas('latestAssessment', function ($q) use ($status) {
            $q->where('status', $status);
        });
    }

    /**
     * Scope to filter by indexation platform
     */
    public function scopeByIndexation($query, ?string $platform)
    {
        if (!$platform) {
            return $query;
        }

        return $query->whereNotNull('indexations')
            ->where(function ($q) use ($platform) {
                $q->whereRaw("JSON_CONTAINS_PATH(indexations, 'one', '$." . $platform . "')");
            });
    }

    /**
     * Scope to filter by Dikti accreditation grade
     */
    public function scopeByAccreditationGrade($query, ?string $grade)
    {
        if (!$grade) {
            return $query;
        }

        return $query->where('accreditation_grade', $grade);
    }
    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    /**
     * Get SINTA rank label
     */
    public function getSintaRankLabelAttribute(): string
    {
        return $this->sinta_rank ? "SINTA {$this->sinta_rank}" : 'Belum Terindeks';
    }

    /**
     * Get accreditation label
     */
    public function getAccreditationLabelAttribute(): string
    {
        if (!$this->accreditation_status) {
            return 'Belum Terakreditasi';
        }

        return $this->accreditation_grade
            ? "{$this->accreditation_status} ({$this->accreditation_grade})"
            : $this->accreditation_status;
    }

    /**
     * Get latest assessment status
     */
    public function getAssessmentStatusAttribute(): ?string
    {
        return $this->latestAssessment?->status;
    }

    /**
     * Get latest assessment score
     */
    public function getLatestScoreAttribute(): ?float
    {
        return $this->latestAssessment?->percentage;
    }

    /**
     * Check if Dikti accreditation is expired
     */
    public function getIsAccreditationExpiredAttribute(): bool
    {
        if (!$this->accreditation_expiry_date) {
            return false;
        }

        return $this->accreditation_expiry_date->isPast();
    }

    /**
     * Get accreditation expiry status
     *
     * @return string 'expired'|'expiring_soon'|'valid'|'none'
     */
    public function getAccreditationExpiryStatusAttribute(): string
    {
        if (!$this->accreditation_expiry_date) {
            return 'none';
        }

        if ($this->accreditation_expiry_date->isPast()) {
            return 'expired';
        }

        if ($this->accreditation_expiry_date->diffInDays(now()) <= 30) {
            return 'expiring_soon';
        }

        return 'valid';
    }

    /**
     * Get Dikti accreditation label
     */
    public function getDiktiAccreditationLabelAttribute(): string
    {
        if (!$this->dikti_accreditation_number) {
            return 'Belum Terakreditasi Dikti';
        }

        $label = "No. {$this->dikti_accreditation_number}";

        if ($this->accreditation_grade) {
            $label .= " ({$this->accreditation_grade})";
        }

        return $label;
    }

    /**
     * Get indexation labels as array
     *
     * @return array<string>
     */
    public function getIndexationLabelsAttribute(): array
    {
        if (!$this->indexations || !is_array($this->indexations)) {
            return [];
        }

        return array_keys($this->indexations);
    }

    /**
     * Get frequency label (human-readable)
     */
    public function getFrequencyLabelAttribute(): string
    {
        $frequencies = [
            'monthly' => 'Bulanan',
            'bi-monthly' => 'Dua Bulanan',
            'quarterly' => 'Triwulanan',
            'semi-annual' => 'Semi-Tahunan',
            'annual' => 'Tahunan',
            'other' => 'Lainnya',
        ];

        return $frequencies[$this->frequency] ?? $this->frequency ?? 'Tidak Diketahui';
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Check if journal has been assessed
     */
    public function hasAssessment(): bool
    {
        return $this->assessments()->exists();
    }

    /**
     * Check if journal has submitted assessment
     */
    public function hasSubmittedAssessment(): bool
    {
        return $this->assessments()
            ->whereIn('status', ['submitted', 'reviewed'])
            ->exists();
    }

    /**
     * Get available indexation platforms
     *
     * @return array<string, string>
     */
    public static function getIndexationPlatforms(): array
    {
        return [
            'Scopus' => 'Scopus',
            'Web of Science' => 'Web of Science',
            'DOAJ' => 'DOAJ',
            'Google Scholar' => 'Google Scholar',
            'Dimensions' => 'Dimensions',
            'EBSCO' => 'EBSCO',
            'ProQuest' => 'ProQuest',
            'Crossref' => 'Crossref',
            'BASE' => 'BASE',
        ];
    }

    /**
     * Get available Dikti accreditation grades
     *
     * @return array<string, string>
     */
    public static function getAccreditationGrades(): array
    {
        return [
            'Unggul' => 'Unggul',
            'Baik Sekali' => 'Baik Sekali',
            'Baik' => 'Baik',
            'Cukup' => 'Cukup',
        ];
    }
}
