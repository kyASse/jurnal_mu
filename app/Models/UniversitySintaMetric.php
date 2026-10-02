<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UniversitySintaMetric extends Model
{
    use HasFactory;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array<string>|bool
     */
    protected $guarded = ['id'];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'sinta_score_overall' => 'decimal:2',
        'sinta_score_3yr' => 'decimal:2',
        'national_rank_overall' => 'integer',
        'national_rank_3yr' => 'integer',
        'scopus_docs' => 'integer',
        'scopus_citations' => 'integer',
        'wos_docs' => 'integer',
        'wos_citations' => 'integer',
        'garuda_docs' => 'integer',
        'garuda_citations' => 'integer',
        'google_docs' => 'integer',
        'google_citations' => 'integer',
        'research_count' => 'integer',
        'service_count' => 'integer',
        'ipr_count' => 'integer',
        'book_count' => 'integer',
        'authors_count' => 'integer',
        'departments_count' => 'integer',
        'journals_count' => 'integer',
        'raw_payload' => 'array',
        'last_synced_at' => 'datetime',
    ];

    /**
     * Get the university that owns the SINTA metric.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }
}
