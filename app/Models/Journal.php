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
        'accreditation_status',
        'accreditation_grade',
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
     */
    public function scopeBySintaRank($query, ?int $rank)
    {
        if (! $rank) {
            return $query;
        }

        return $query->where('sinta_rank', $rank);
    }

    /**
     * Scope to search journals
     */
    public function scopeSearch($query, ?string $search)
    {
        if (! $search) {
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
        if (! $status) {
            return $query;
        }

        return $query->whereHas('latestAssessment', function ($q) use ($status) {
            $q->where('status', $status);
        });
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
        if (! $this->accreditation_status) {
            return 'Belum Terakreditasi';
        }

        return $this->accreditation_grade
            ? "{$this->accreditation_status} ({$this->accreditation_grade})"
            : $this->accreditation_status;
    }

    /**
     * Get accreditation status label (alias for accreditation_label for controller compatibility)
     */
    public function getAccreditationStatusLabelAttribute(): string
    {
        return $this->getAccreditationLabelAttribute();
    }

    /**
     * Get frequency label with proper formatting
     */
    public function getFrequencyLabelAttribute(): string
    {
        $frequencies = [
            'monthly' => 'Monthly (12 issues per year)',
            'bimonthly' => 'Bimonthly (6 issues per year)',
            'quarterly' => 'Quarterly (4 issues per year)',
            'triannual' => 'Triannual (3 issues per year)',
            'biannual' => 'Biannual (2 issues per year)',
            'annual' => 'Annual (1 issue per year)',
        ];

        return $frequencies[$this->frequency] ?? ucfirst($this->frequency);
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
}
