<?php

namespace App\Models;

use App\Enums\Doi\SubscriptionStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoiSubscription extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'doi_subscriptions';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'university_id',
        'journal_id',
        'doi_package_id',
        'status',
        'start_date',
        'end_date',
        'active_prefix',
        'similarity_quota_total',
        'similarity_quota_used',
        'auto_renew',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => SubscriptionStatus::class,
        'start_date' => 'date',
        'end_date' => 'date',
        'similarity_quota_total' => 'integer',
        'similarity_quota_used' => 'integer',
        'auto_renew' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<string>
     */
    protected $appends = [
        'remaining_quota',
        'is_expiring_soon',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the university for this subscription
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id');
    }

    /**
     * Get the journal for this subscription
     */
    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class, 'journal_id');
    }

    /**
     * Get the package for this subscription
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(DoiPackage::class, 'doi_package_id');
    }

    /**
     * Get invoices for this subscription
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(DoiInvoice::class, 'subscription_id');
    }

    /**
     * Get similarity quota logs for this subscription
     */
    public function quotaLogs(): HasMany
    {
        return $this->hasMany(DoiSimilarityQuotaLog::class, 'subscription_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    /**
     * Calculate remaining similarity quota
     */
    public function getRemainingQuotaAttribute(): int
    {
        return max(0, (int) ($this->similarity_quota_total - $this->similarity_quota_used));
    }

    /**
     * Check if subscription is expiring within 30 days
     */
    public function getIsExpiringSoonAttribute(): bool
    {
        if (!$this->end_date) {
            return false;
        }

        $now = Carbon::now()->startOfDay();
        $endDate = Carbon::parse($this->end_date)->startOfDay();

        return $endDate->greaterThanOrEqualTo($now) && $now->diffInDays($endDate) <= 30;
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope query to active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->where('status', SubscriptionStatus::ACTIVE);
    }

    /**
     * Scope query to grace period subscriptions
     */
    public function scopeGracePeriod($query)
    {
        return $query->where('status', SubscriptionStatus::GRACE_PERIOD);
    }

    /**
     * Scope query to expired subscriptions
     */
    public function scopeExpired($query)
    {
        return $query->where('status', SubscriptionStatus::EXPIRED);
    }

    /**
     * Scope query by university
     */
    public function scopeForUniversity($query, $universityId)
    {
        return $query->where('university_id', $universityId);
    }
}
