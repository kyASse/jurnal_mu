<?php

namespace App\Models;

use App\Enums\Doi\QuotaChangeType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoiSimilarityQuotaLog extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'doi_similarity_quota_logs';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'subscription_id',
        'journal_id',
        'user_id',
        'change_type',
        'amount',
        'balance_after',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'change_type' => QuotaChangeType::class,
        'amount' => 'integer',
        'balance_after' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the subscription for this log entry
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(DoiSubscription::class, 'subscription_id');
    }

    /**
     * Get the journal for this log entry
     */
    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class, 'journal_id');
    }

    /**
     * Get the user who triggered or relates to this quota change
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
