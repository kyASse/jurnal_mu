<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvaluationIndicator extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'category',
        'sub_category',
        'code',
        'question',
        'description',
        'weight',
        'answer_type',
        'requires_attachment',
        'sort_order',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'weight' => 'decimal:2',
        'requires_attachment' => 'boolean',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get all assessment responses for this indicator
     */
    public function responses()
    {
        return $this->hasMany(AssessmentResponse::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get only active indicators
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get indicators by category
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to order by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    /**
     * Get answer type label
     */
    public function getAnswerTypeLabelAttribute(): string
    {
        return match($this->answer_type) {
            'boolean' => 'Ya/Tidak',
            'scale' => 'Skala 1-5',
            'text' => 'Text Input',
            default => $this->answer_type,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Calculate score for a given answer
     */
    public function calculateScore($answer): float
    {
        return match($this->answer_type) {
            'boolean' => $answer ? $this->weight : 0,
            'scale' => ($answer / 5) * $this->weight,
            'text' => 0, // Text answers need manual review
            default => 0,
        };
    }

    /**
     * Get all unique categories
     */
    public static function getCategories(): array
    {
        return self::active()
            ->distinct()
            ->pluck('category')
            ->toArray();
    }
}