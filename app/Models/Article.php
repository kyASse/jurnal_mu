<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Article extends Model
{
    use HasFactory, Searchable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'journal_id',
        'oai_identifier',
        'oai_datestamp',
        'oai_set',
        'title',
        'abstract',
        'authors',
        'keywords',
        'doi',
        'publication_date',
        'volume',
        'issue',
        'pages',
        'article_url',
        'pdf_url',
        'last_harvested_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'authors' => 'array',
        'keywords' => 'array',
        'publication_date' => 'date',
        'oai_datestamp' => 'datetime',
        'last_harvested_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the journal that owns this article
     */
    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get recent articles (ordered by publication date)
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('publication_date', 'desc');
    }

    /**
     * Scope to filter by publication year
     */
    public function scopeByYear($query, int $year)
    {
        return $query->whereYear('publication_date', $year);
    }

    /**
     * Scope to filter by volume
     */
    public function scopeByVolume($query, string $volume)
    {
        return $query->where('volume', $volume);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Get formatted authors list
     */
    public function getAuthorsListAttribute(): string
    {
        if (! $this->authors || ! is_array($this->authors)) {
            return 'Unknown';
        }

        return implode(', ', $this->authors);
    }

    /**
     * Get DOI URL
     */
    public function getDoiUrlAttribute(): ?string
    {
        return $this->doi ? "https://doi.org/{$this->doi}" : null;
    }

    /**
     * Get Google Scholar search URL
     */
    public function getGoogleScholarUrlAttribute(): string
    {
        $title = urlencode($this->title);

        return "https://scholar.google.com/scholar?q=intitle:\"{$title}\"";
    }

    /**
     * Get formatted volume/issue string
     */
    public function getVolumeIssueAttribute(): ?string
    {
        if (! $this->volume && ! $this->issue) {
            return null;
        }

        $parts = [];
        if ($this->volume) {
            $parts[] = "Vol. {$this->volume}";
        }
        if ($this->issue) {
            $parts[] = "No. {$this->issue}";
        }

        return implode(', ', $parts);
    }

    /**
     * Get the indexable data array for the model.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        $array = [
            'id' => (int) $this->id,
            'title' => $this->title,
            'abstract' => $this->abstract,
            'authors' => is_array($this->authors) ? implode(', ', $this->authors) : $this->authors,
            'keywords' => is_array($this->keywords) ? implode(', ', $this->keywords) : $this->keywords,
        ];

        if (config('scout.driver') !== 'database') {
            $array['journal_title'] = $this->journal?->title;
            $array['scientific_field_name'] = $this->journal?->scientificField?->name;
        }

        return $array;
    }

    /**
     * Modify the query used to retrieve models when making all of the models searchable.
     *
     * @param  Builder  $query
     * @return Builder
     */
    protected function makeAllSearchableUsing($query)
    {
        return $query->with(['journal.scientificField']);
    }
}
